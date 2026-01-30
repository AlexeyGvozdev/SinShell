# SinShell - Terminal Styled Website

![Backend Tests](https://github.com/AlexeyGvozdev/SinShell/workflows/Backend%20Tests/badge.svg)
![CI](https://github.com/AlexeyGvozdev/SinShell/workflows/CI/badge.svg)
[![codecov](https://codecov.io/gh/AlexeyGvozdev/SinShell/branch/develop/graph/badge.svg)](https://codecov.io/gh/AlexeyGvozdev/SinShell)

A modern terminal-styled website built with Next.js frontend and Express backend, inspired by LiveTerm.

## Features

- 🖥️ Terminal-style interface
- ⚡ Next.js 14+ with TypeScript
- 🎨 Tailwind CSS for styling
- 🔧 Express.js backend with TypeScript
- 📱 Responsive design
- 🎯 Customizable commands
- 🌙 Multiple themes support
- 📜 Command history with navigation
- 🔍 Tab autocomplete for commands
- 🚀 Docker containerization
- ☁️ Yandex Cloud deployment ready

## Project Structure

```
sinshell/
├── frontend/          # Next.js frontend application
├── backend/           # Express.js backend API
├── docs/              # Documentation
├── Dockerfile         # Multi-stage Docker build
├── server.js          # Unified server for deployment
├── deploy.sh          # Automated deployment script
├── .dockerignore      # Docker exclusions
├── .env.production    # Production environment variables
├── QUICK_DEPLOY.md    # Quick deployment guide
└── README.md         # This file
```

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd sinshell
```

2. Install all dependencies:
```bash
npm run install:all
```

3. Start development servers:
```bash
npm run dev
```

This will start both frontend (http://localhost:3000) and backend (http://localhost:5000) servers.

## Development

### Frontend Development

```bash
cd frontend
npm run dev
```

### Backend Development

```bash
cd backend
npm run dev
```

### Build for Production

```bash
npm run build
```

### Start Production Servers

```bash
npm start
```

## Configuration

### Frontend Configuration

Edit `frontend/config.json` to customize:
- Site title and description
- ASCII art banner
- Social links
- Available commands
- Theme colors

### Backend Configuration

Edit `backend/src/config/index.ts` to configure:
- API endpoints
- Database connections
- External API integrations

## Available Commands

### Built-in Commands
- `help` - Show available commands
- `about` - Display information about the site
- `clear` - Clear terminal
- `theme` - Change terminal theme
- `history` - Show command history
- `autocomplete` - Test autocomplete functionality

### API Commands
- `health` - Check backend health status
- `info` - Display system information
- `about-api` - Get detailed project information

### Interactive Features
- **Arrow Up/Down** - Navigate through command history
- **Tab** - Autocomplete commands
- **Ctrl+C** - Cancel current command

## Deployment

### 🔄 CI/CD Auto-Deploy (Recommended)

**Automatic deployment on merge to main branch:**

1. **Setup CI/CD** (5 minutes):
   ```bash
   # Follow the quick setup guide
   # 📖 See: CICD_QUICK_SETUP.md
   ```

2. **Push to main**:
   ```bash
   git add .
   git commit -m "feat: add new feature"
   git push origin main
   ```

3. **Auto-deployment happens**:
   - ✅ Tests run automatically
   - ✅ Docker image built and pushed
   - ✅ Application deployed to Yandex Cloud
   - ✅ URL provided in GitHub Actions

📖 **CI/CD Setup**: [CICD_QUICK_SETUP.md](CICD_QUICK_SETUP.md) - 5-minute setup
📚 **Full CI/CD Guide**: [docs/CICD_SETUP.md](docs/CICD_SETUP.md) - detailed configuration

### 🚀 Manual Deploy to Yandex Cloud

**Deploy in 5 minutes with automated script:**

```bash
# 1. Install prerequisites
# - Yandex CLI: https://cloud.yandex.ru/docs/cli/quickstart
# - Docker: https://docs.docker.com/get-docker/

# 2. Authenticate
yc init

# 3. Deploy!
./deploy.sh
```

The script will automatically:
- ✅ Create container registry
- ✅ Build and push Docker image
- ✅ Deploy to Yandex Cloud App Platform
- ✅ Configure environment variables
- ✅ Create public access
- ✅ Provide application URL

📖 **Quick Deploy**: [QUICK_DEPLOY.md](QUICK_DEPLOY.md) - step-by-step instructions
📚 **Full Guide**: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) - advanced configuration
🔧 **Access Setup**: [YANDEX_CLOUD_ACCESS_SETUP.md](YANDEX_CLOUD_ACCESS_SETUP.md) - troubleshooting access issues

### 🌐 Getting Your Site URL

After deployment, get your public URL:

```bash
# Quick way - use the helper script
./get-url.sh

# Or manually
yc serverless container revision list --container-name sinshell-app --limit 1
```

Your site will be available at: `https://REVISION_ID.containers.yandexcloud.net`

**⚠️ Site not accessible?** See [QUICK_FIX_ACCESS.md](QUICK_FIX_ACCESS.md) for immediate solutions

### Manual Deployment Options

#### Docker Deployment
```bash
# Build image
docker build -t sinshell .

# Run container
docker run -p 80:80 sinshell
```

#### Traditional Deployment

**Frontend (Vercel)**
1. Connect your GitHub repository to Vercel
2. Set root directory to `frontend`
3. Deploy automatically on push to main branch

**Backend (Railway/Render)**
1. Connect your GitHub repository to Railway/Render
2. Set root directory to `backend`
3. Configure environment variables
4. Deploy automatically on push to main branch

## Testing

```bash
# Run all tests
npm test

# Run frontend tests
cd frontend && npm test

# Run backend tests
cd backend && npm test

# Run tests with coverage
npm run test:coverage
```

**Current Coverage**: 97.65% statements, 88.46% branches, 98.14% functions, 98.31% lines

## Development Workflow

```bash
# Install dependencies
npm run install:all

# Start development servers
npm run dev

# Run linting
npm run lint

# Run tests
npm test

# Build for production
npm run build

# Start production servers
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass (`npm test`)
6. Run linting (`npm run lint`)
7. Submit a pull request

## Architecture

- **Frontend**: Next.js 14 with TypeScript, Tailwind CSS
- **Backend**: Express.js with TypeScript
- **Testing**: Jest with React Testing Library
- **Deployment**: Docker containers with Yandex Cloud App Platform
- **CI/CD**: GitHub Actions for automated testing

📖 **Architecture Details**: See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

## License

MIT License - see LICENSE file for details.

---

**🎉 Ready to deploy? Check out [QUICK_DEPLOY.md](QUICK_DEPLOY.md) to get your SinShell running in Yandex Cloud in minutes!**