# SinShell - Terminal Styled Website

A modern terminal-styled website built with Next.js frontend and Express backend, inspired by LiveTerm.

## Features

- 🖥️ Terminal-style interface
- ⚡ Next.js 13+ with TypeScript
- 🎨 Tailwind CSS for styling
- 🔧 Express.js backend with TypeScript
- 📱 Responsive design
- 🎯 Customizable commands
- 🌙 Multiple themes support

## Project Structure

```
sinshell/
├── frontend/          # Next.js frontend application
├── backend/           # Express.js backend API
├── package.json       # Root package.json for workspace management
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

- `help` - Show available commands
- `about` - Display information about the site
- `projects` - List your projects
- `contact` - Show contact information
- `clear` - Clear terminal
- `theme` - Change terminal theme

## Deployment

### Frontend (Vercel)

1. Connect your GitHub repository to Vercel
2. Set root directory to `frontend`
3. Deploy automatically on push to main branch

### Backend (Railway/Render)

1. Connect your GitHub repository to Railway/Render
2. Set root directory to `backend`
3. Configure environment variables
4. Deploy automatically on push to main branch

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.