# SinShell Frontend

Terminal styled website frontend built with Next.js 14+, TypeScript, and Tailwind CSS.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   └── globals.css         # Global styles
│   ├── components/             # React components
│   │   └── Terminal/           # Terminal components
│   ├── context/                # React Context
│   ├── lib/                    # Utilities and helpers
│   │   ├── commands/           # Command system
│   │   └── api/                # API client
│   ├── types/                  # TypeScript types
│   └── hooks/                  # Custom React hooks
├── public/                     # Static files
├── .env.example                # Environment variables example
├── next.config.ts              # Next.js configuration
├── tailwind.config.ts          # Tailwind CSS configuration
└── tsconfig.json               # TypeScript configuration
```

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🎨 Features

- 🖥️ Terminal-style interface
- ⚡ Next.js 14+ with App Router
- 🎯 TypeScript for type safety
- 🎨 Tailwind CSS for styling
- 🌙 Multiple theme support
- 📱 Responsive design
- 🔌 Backend API integration

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file based on `.env.example`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SITE_NAME=SinShell
NEXT_PUBLIC_SITE_DESCRIPTION=Terminal styled website
```

## 📚 Documentation

For detailed documentation, see the `docs/` folder in the root directory:

- [Architecture](../docs/ARCHITECTURE.md)
- [Commands System](../docs/COMMANDS_SYSTEM.md)
- [API Documentation](../docs/API.md)
- [Development Guide](../docs/DEVELOPMENT.md)

## 🤝 Contributing

1. Create a feature branch from `develop`
2. Make your changes
3. Test thoroughly
4. Submit a pull request

See [Git Workflow](../docs/GIT_WORKFLOW.md) for detailed guidelines.

## 📄 License

MIT License - see [LICENSE](../LICENSE) file for details.
