#!/bin/bash

# Скрипт для развертывания SinShell в Yandex Cloud App Platform
# Требования: Yandex CLI, Docker, доступ к Yandex Cloud

set -e  # Выход при ошибке

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функция для вывода цветных сообщений
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Проверка зависимостей
check_dependencies() {
    log_info "Проверка зависимостей..."
    
    if ! command -v yc &> /dev/null; then
        log_error "Yandex CLI не установлен. Установите его: https://cloud.yandex.ru/docs/cli/quickstart"
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker не установлен. Установите его: https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    log_success "Все зависимости установлены"
}

# Проверка аутентификации в Yandex Cloud
check_yc_auth() {
    log_info "Проверка аутентификации в Yandex Cloud..."
    
    if ! yc config profile get &> /dev/null; then
        log_error "Не авторизованы в Yandex Cloud. Выполните: yc init"
        exit 1
    fi
    
    # Получаем ID реестра
    REGISTRY_ID=$(yc container registry list --format json | jq -r '.[0].id' 2>/dev/null || echo "")
    
    if [ -z "$REGISTRY_ID" ]; then
        log_warning "Реестр контейнеров не найден. Создаем новый..."
        REGISTRY_ID=$(yc container registry create --name sinshell-registry --format json | jq -r '.id')
        log_success "Создан реестр: $REGISTRY_ID"
    else
        log_success "Найден реестр: $REGISTRY_ID"
    fi
}

# Сборка Docker образа
build_image() {
    log_info "Сборка Docker образа..."
    
    # Проверяем наличие Dockerfile
    if [ ! -f "Dockerfile" ]; then
        log_error "Dockerfile не найден в текущей директории"
        exit 1
    fi
    
    # Получаем версию из package.json или используем timestamp
    if [ -f "package.json" ]; then
        VERSION=$(grep '"version"' package.json | sed 's/.*"version": *"\([^"]*\)".*/\1/' | sed 's/^v//')
    else
        VERSION=$(date +%Y%m%d-%H%M%S)
    fi
    
    IMAGE_TAG="v$VERSION"
    IMAGE_NAME="cr.yandex.io/$REGISTRY_ID/sinshell:$IMAGE_TAG"
    LATEST_IMAGE="cr.yandex.io/$REGISTRY_ID/sinshell:latest"
    
    log_info "Собираем образ: $IMAGE_NAME"
    
    # Сборка образа
    docker build -t "$IMAGE_NAME" -t "$LATEST_IMAGE" .
    
    log_success "Образ успешно собран"
}

# Загрузка образа в реестр
push_image() {
    log_info "Загрузка образа в реестр..."
    
    # Получаем IAM токен
    IAM_TOKEN=$(yc iam create-token)
    
    # Авторизация в реестре
    echo "$IAM_TOKEN" | docker login cr.yandex.io --username iam --password-stdin
    
    # Загрузка образов
    docker push "$IMAGE_NAME"
    docker push "$LATEST_IMAGE"
    
    log_success "Образы успешно загружены в реестр"
}

# Создание или обновление приложения
deploy_app() {
    log_info "Развертывание приложения..."
    
    APP_NAME="sinshell-app"
    
    # Получаем или создаем сервисный аккаунт
    SA_NAME="sinshell-sa"
    SA_ID=$(yc iam service-account get --name "$SA_NAME" --format json 2>/dev/null | jq -r '.id' || echo "")
    
    if [ -z "$SA_ID" ]; then
        log_info "Создаем сервисный аккаунт..."
        SA_ID=$(yc iam service-account create --name "$SA_NAME" --description "Service account for SinShell" --format json | jq -r '.id')
        
        # Назначаем роли
        FOLDER_ID=$(yc config get folder-id)
        yc resource-manager folder add-access-binding "$FOLDER_ID" \
            --role container-registry.images.puller \
            --subject serviceAccount:$SA_ID
            
        log_success "Сервисный аккаунт создан: $SA_ID"
    else
        log_success "Найден сервисный аккаунт: $SA_ID"
    fi
    
    # Проверяем существование приложения
    if yc serverless container get --name "$APP_NAME" &> /dev/null; then
        log_info "Обновляем существующее приложение..."
        
        yc serverless container revision deploy \
            --container-name "$APP_NAME" \
            --image "$IMAGE_NAME" \
            --port 80 \
            --memory 256M \
            --cores 1 \
            --execution-timeout 30s \
            --service-account-id "$SA_ID" \
            --environment NODE_ENV=production \
            --environment PORT=5000 \
            --environment HOST=0.0.0.0 \
            --environment NEXT_PUBLIC_API_URL=http://localhost:5000 \
            --environment NEXT_PUBLIC_APP_NAME=SinShell \
            --environment LOG_LEVEL=info
            
        log_success "Приложение успешно обновлено"
    else
        log_info "Создаем новое приложение..."
        
        # Создание контейнера с публичным доступом
        yc serverless container create \
            --name "$APP_NAME" \
            --description "Terminal styled website"
        
        # Развертывание с образом и публичным доступом
        yc serverless container revision deploy \
            --container-name "$APP_NAME" \
            --image "$IMAGE_NAME" \
            --port 80 \
            --memory 256M \
            --cores 1 \
            --execution-timeout 30s \
            --service-account-id "$SA_ID" \
            --environment NODE_ENV=production \
            --environment PORT=5000 \
            --environment HOST=0.0.0.0 \
            --environment NEXT_PUBLIC_API_URL=http://localhost:5000 \
            --environment NEXT_PUBLIC_APP_NAME=SinShell \
            --environment LOG_LEVEL=info
            
        log_success "Приложение успешно создано"
    fi
}

# Получение URL приложения
get_app_url() {
    log_info "Получение URL приложения..."
    
    # Ждем несколько секунд для инициализации
    sleep 5
    
    # Получаем информацию о последней ревизии
    REVISION_INFO=$(yc serverless container revision list --container-name "$APP_NAME" --limit 1 --format json)
    
    # Извлекаем URL из ревизии
    APP_URL=$(echo "$REVISION_INFO" | jq -r '.[0].image.image_url' 2>/dev/null || echo "")
    REVISION_ID=$(echo "$REVISION_INFO" | jq -r '.[0].id' 2>/dev/null || echo "")
    
    if [ -n "$REVISION_ID" ]; then
        # Формируем публичный URL
        FOLDER_ID=$(yc config get folder-id)
        PUBLIC_URL="https://${REVISION_ID}.containers.yandexcloud.net"
        
        log_success "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        log_success "✅ Приложение успешно развернуто!"
        log_success "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        log_success ""
        log_success "🌐 Публичный URL: $PUBLIC_URL"
        log_success "📋 ID ревизии: $REVISION_ID"
        log_success ""
        log_info "Для проверки работы выполните:"
        log_info "  curl $PUBLIC_URL/api/v1/health"
        log_info ""
        log_info "Для просмотра в браузере откройте:"
        log_info "  $PUBLIC_URL"
        log_success ""
        log_success "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    else
        log_warning "Не удалось получить URL приложения"
        log_info "Проверьте статус вручную:"
        log_info "  yc serverless container revision list --container-name $APP_NAME"
    fi
}

# Очистка старых образов
cleanup_old_images() {
    log_info "Очистка старых Docker образов..."
    
    # Удаляем старые образы локально (оставляем последние 3)
    docker images cr.yandex.io/$REGISTRY_ID/sinshell --format "table {{.Repository}}:{{.Tag}}" | tail -n +2 | tail -n +4 | xargs -r docker rmi
    
    log_success "Очистка завершена"
}

# Основная функция
main() {
    log_info "Начало развертывания SinShell в Yandex Cloud"
    
    # Проверяем, что мы в корневой директории проекта
    if [ ! -f "package.json" ] && [ ! -f "frontend/package.json" ]; then
        log_error "Пожалуйста, запустите скрипт из корневой директории проекта"
        exit 1
    fi
    
    check_dependencies
    check_yc_auth
    build_image
    push_image
    deploy_app
    get_app_url
    cleanup_old_images
    
    log_success "Развертывание завершено успешно!"
    log_info "Версия: $IMAGE_TAG"
    log_info "Для просмотра логов выполните: yc serverless container logs --name $APP_NAME --follow"
}

# Обработка сигналов
trap 'log_error "Развертывание прервано"; exit 1' INT TERM

# Запуск
main "$@"