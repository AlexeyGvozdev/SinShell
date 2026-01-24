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
    
    # Проверяем существование приложения
    if yc serverless container get --name "$APP_NAME" &> /dev/null; then
        log_info "Обновляем существующее приложение..."
        
        yc serverless container deploy \
            --name "$APP_NAME" \
            --image "$IMAGE_NAME" \
            --port 80 \
            --memory 256M \
            --cores 1 \
            --execution-timeout 30s \
            --environment-file .env.production \
            --min-instances 0 \
            --max-instances 5
            
        log_success "Приложение успешно обновлено"
    else
        log_info "Создаем новое приложение..."
        
        # Создание пустого контейнера
        yc serverless container create \
            --name "$APP_NAME" \
            --description "Terminal styled website"
        
        # Развертывание с образом
        yc serverless container deploy \
            --name "$APP_NAME" \
            --image "$IMAGE_NAME" \
            --port 80 \
            --memory 256M \
            --cores 1 \
            --execution-timeout 30s \
            --environment-file .env.production \
            --min-instances 0 \
            --max-instances 5
            
        log_success "Приложение успешно создано"
    fi
}

# Получение URL приложения
get_app_url() {
    log_info "Получение URL приложения..."
    
    # Ждем несколько секунд для инициализации
    sleep 10
    
    # Получаем домен приложения
    APP_DOMAIN=$(yc serverless container get --name "$APP_NAME" --format json | jq -r '.status[0].domainName' 2>/dev/null || echo "")
    
    if [ -n "$APP_DOMAIN" ]; then
        log_success "Приложение доступно по адресу: https://$APP_DOMAIN"
        log_info "Для проверки выполните: curl https://$APP_DOMAIN/api/v1/health"
    else
        log_warning "URL приложения пока недоступен. Проверьте статус в консоли Yandex Cloud"
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