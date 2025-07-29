// Sovereign Command Center Production Server
// Covren Firm LLC - Bare Metal Deployment
// NO CONTAINERS, NO DOCKER, NO VIRTUAL ENVIRONMENTS

const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const morgan = require('morgan');
const cluster = require('cluster');
const os = require('os');
const apiRoutes = require('./routes/api');

// Environment configuration
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const NODE_ENV = process.env.NODE_ENV || 'production';

// Performance monitoring
const startTime = Date.now();
let requestCount = 0;
let errorCount = 0;

// Security configuration
const securityConfig = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://unpkg.com", "https://cdn.jsdelivr.net"],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://unpkg.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://flyflafbdqhdhgxngahz.supabase.co"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
};

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false
});

// Create Express application
const app = express();

// Security middleware
app.use(helmet(securityConfig));
app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

// CORS configuration
app.use(cors({
  origin: [
    'https://client.covrenfirm.com',
    'https://portal.covrenfirm.com',
    'https://covrenfirm.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres123@localhost:5432/sovereign_command_center',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Session middleware
app.use(session({
  store: new pgSession({
    pool: pool,
    tableName: 'session'
  }),
  secret: process.env.SESSION_SECRET || 'your-session-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (NODE_ENV === 'production') {
  const logDir = '/var/log/pm2';
  try {
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    app.use(morgan('combined', {
      stream: {
        write: (message) => {
          fs.appendFileSync('/var/log/pm2/sovereign-command-center-access.log', message);
        }
      }
    }));
  } catch (error) {
    console.warn('Could not create log directory, falling back to console logging:', error.message);
    app.use(morgan('combined'));
  }
} else {
  app.use(morgan('dev'));
}

// Request tracking middleware
app.use((req, res, next) => {
  requestCount++;
  req.startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    if (res.statusCode >= 400) {
      errorCount++;
    }
    
    // Log performance metrics
    if (NODE_ENV === 'production') {
      const logEntry = {
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration: duration,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        requestCount: requestCount,
        errorCount: errorCount
      };
      
      try {
        fs.appendFileSync('/var/log/pm2/sovereign-command-center-performance.log', JSON.stringify(logEntry) + '\n');
      } catch (error) {
        console.log('Performance metrics:', JSON.stringify(logEntry));
      }
    }
  });
  
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    requestCount: requestCount,
    errorCount: errorCount,
    errorRate: requestCount > 0 ? (errorCount / requestCount * 100).toFixed(2) + '%' : '0%',
    worker: cluster.isWorker ? cluster.worker.id : 'master'
  };
  
  res.status(200).json(health);
});

// Metrics endpoint
app.get('/metrics', (req, res) => {
  const metrics = {
    performance: {
      loadTime: Date.now() - startTime,
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      uptime: process.uptime()
    },
    requests: {
      total: requestCount,
      errors: errorCount,
      successRate: requestCount > 0 ? ((requestCount - errorCount) / requestCount * 100).toFixed(2) + '%' : '100%'
    },
    system: {
      platform: process.platform,
      nodeVersion: process.version,
      pid: process.pid,
      worker: cluster.isWorker ? cluster.worker.id : 'master',
      cpus: os.cpus().length,
      totalMemory: os.totalmem(),
      freeMemory: os.freemem()
    }
  };
  
  res.status(200).json(metrics);
});

// Static file serving with caching
const staticOptions = {
  maxAge: '1y',
  immutable: true,
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  }
};

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, 'dist'), staticOptions));

// File upload endpoint
app.post('/api/upload', (req, res) => {
  // File upload handling will be implemented here
  res.status(501).json({ error: 'File upload not yet implemented' });
});

// API routes
app.use('/api', apiRoutes);

// SPA routing - serve index.html for all non-API routes
app.get('*', (req, res) => {
  // Skip API routes and static files
  if (req.path.startsWith('/api/') || 
      req.path.startsWith('/health') || 
      req.path.startsWith('/metrics') ||
      req.path.includes('.')) {
    return res.status(404).json({ error: 'Not found' });
  }
  
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  errorCount++;
  
  console.error('Server error:', err);
  
  if (NODE_ENV === 'production') {
    try {
      fs.appendFileSync('/var/log/pm2/sovereign-command-center-error.log', 
        `${new Date().toISOString()} - ${err.stack}\n`);
    } catch (logError) {
      console.error('Could not write to error log:', logError.message);
    }
  }
  
  res.status(500).json({
    error: NODE_ENV === 'production' ? 'Internal server error' : err.message,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Start server
const server = app.listen(PORT, HOST, () => {
  const uptime = Date.now() - startTime;
  console.log(`🚀 Sovereign Command Center Server Started`);
  console.log(`📍 Environment: ${NODE_ENV}`);
  console.log(`🌐 Server: http://${HOST}:${PORT}`);
  console.log(`⏱️  Startup Time: ${uptime}ms`);
  console.log(`💾 Memory Usage: ${JSON.stringify(process.memoryUsage())}`);
  console.log(`🖥️  CPU Cores: ${os.cpus().length}`);
  console.log(`🔒 Security: Helmet, CORS, Rate Limiting Enabled`);
  console.log(`📊 Monitoring: Health check at /health, Metrics at /metrics`);
  
  if (cluster.isWorker) {
    console.log(`👷 Worker ${cluster.worker.id} started`);
  }
});

// Server error handling
server.on('error', (err) => {
  console.error('Server error:', err);
  try {
    fs.appendFileSync('/var/log/pm2/sovereign-command-center-error.log', 
      `${new Date().toISOString()} - Server error: ${err.stack}\n`);
  } catch (logError) {
    console.error('Could not write to error log:', logError.message);
  }
});

module.exports = app;   