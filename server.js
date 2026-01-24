const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

// Backend imports
const { createApp: createBackendApp } = require('./backend/dist/app');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = process.env.PORT || 3000;

// Initialize Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

async function startServer() {
  try {
    // Initialize Next.js
    await app.prepare();
    
    // Initialize Backend
    const backendApp = createBackendApp();
    
    // Create Express app for unified server
    const server = express();
    
    // Security middleware
    server.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
      crossOriginEmbedderPolicy: false,
    }));
    
    // CORS middleware
    server.use(cors({
      origin: process.env.CORS_ORIGIN || true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    }));
    
    // Compression middleware
    server.use(compression());
    
    // Body parsing middleware
    server.use(express.json({ limit: '10mb' }));
    server.use(express.urlencoded({ extended: true, limit: '10mb' }));
    
    // Health check endpoint
    server.get('/health', (req, res) => {
      res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: Math.floor(process.uptime()),
        service: 'sinshell-unified'
      });
    });
    
    // API routes - proxy to backend
    server.use('/api', (req, res, next) => {
      // Remove /api prefix and forward to backend
      req.url = req.url.replace(/^\/api/, '/api/v1');
      backendApp(req, res, next);
    });
    
    // Static files and Next.js pages
    server.all('*', (req, res) => {
      const parsedUrl = parse(req.url, true);
      handle(req, res, parsedUrl);
    });
    
    // Create HTTP server
    const httpServer = createServer(server);
    
    // Start listening
    httpServer.listen(port, () => {
      console.log(`🚀 SinShell Unified Server started successfully!`);
      console.log(`📍 Server running on http://${hostname}:${port}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://${hostname}:${port}/health`);
      console.log(`📚 API endpoints: http://${hostname}:${port}/api/v1/*`);
      console.log('');
      console.log('🎯 Available services:');
      console.log('   Frontend: Next.js application');
      console.log('   Backend: Express.js API');
      console.log('   Health: /health');
      console.log('');
    });
    
    // Graceful shutdown
    const gracefulShutdown = (signal) => {
      console.log(`\n📡 Received ${signal}. Starting graceful shutdown...`);
      
      httpServer.close(() => {
        console.log('✅ HTTP server closed');
        process.exit(0);
      });
      
      // Force close after 10 seconds
      setTimeout(() => {
        console.error('❌ Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };
    
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
  } catch (error) {
    console.error('💥 Failed to start server:', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer();