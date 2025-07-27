#!/bin/bash

# Fix Server Routing for JavaScript Files
# Ensures JavaScript files are served correctly instead of HTML

set -e

echo "🔧 Fixing Server Routing for JavaScript Files..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Navigate to application directory
cd /var/www/client-portal/covren-client-portal

print_status "Current directory: $(pwd)"

# 1. Check current server configuration
print_status "Checking current server configuration..."
grep -A 10 -B 5 "static\|dist" server.js || echo "No static file configuration found"

# 2. Create backup of server.js
print_status "Creating backup of server.js..."
cp server.js server.js.backup.$(date +%Y%m%d_%H%M%S)

# 3. Fix the server configuration
print_status "Fixing server configuration..."

# Create proper server configuration
cat > server.js << 'EOF'
// Sovereign Command Center Production Server
// Covren Firm LLC - Bare Metal Deployment
// NO CONTAINERS, NO DOCKER, NO VIRTUAL ENVIRONMENTS

const express = require('express');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const morgan = require('morgan');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy for rate limiting behind reverse proxy - must be set before any middleware
app.set('trust proxy', 'loopback');

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com", "https://unpkg.com", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://*.supabase.co"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://fonts.googleapis.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Compression
app.use(compression());

// CORS
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['https://portal.covrenfirm.com'],
  credentials: true
}));

// Logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session configuration
const sessionConfig = {
  store: new pgSession({
    conObject: {
      connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres123@127.0.0.1:5432/sovereign_command_center',
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    },
    tableName: 'sessions'
  }),
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
};

app.use(session(sessionConfig));

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres123@127.0.0.1:5432/sovereign_command_center',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected successfully');
  }
});

// IMPORTANT: Serve static files BEFORE the catch-all route
// This ensures /dist/ files are served correctly
app.use('/dist', express.static(path.join(__dirname, 'dist'), {
  maxAge: '1y',
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    } else if (filePath.endsWith('.html')) {
      res.setHeader('Content-Type', 'text/html');
    }
  }
}));

// API Routes
app.use('/api', require('./routes/api'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Serve the main React app for all other routes (AFTER static files)
app.get('*', (req, res) => {
  // Don't serve index.html for API routes or static files
  if (req.path.startsWith('/api/') || req.path.startsWith('/dist/') || req.path === '/health') {
    return res.status(404).json({ error: 'Not found' });
  }
  
  // Serve the React app for all other routes
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Covren Client Portal running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔒 Security: Helmet, CORS enabled`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  pool.end();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  pool.end();
  process.exit(0);
});

module.exports = app;
EOF

# 4. Restart the application
print_status "Restarting application..."
pm2 restart client-portal
pm2 save

# 5. Test the JavaScript file serving
print_status "Testing JavaScript file serving..."
sleep 3

if curl -f -s http://localhost:3000/dist/index.js | head -1 | grep -q "function\|var\|const"; then
    print_success "JavaScript file is now serving correctly"
else
    print_error "JavaScript file is still not serving correctly"
    echo "Current response:"
    curl -f -s http://localhost:3000/dist/index.js | head -3
fi

# 6. Test CSS file serving
print_status "Testing CSS file serving..."
if curl -f -s http://localhost:3000/dist/styles.css | head -1 | grep -q "css"; then
    print_success "CSS file is serving correctly"
else
    print_error "CSS file is not serving correctly"
fi

# 7. Test the main page
print_status "Testing main page..."
if curl -f -s http://localhost:3000 | grep -q "Covren Firm"; then
    print_success "Main page is serving correctly"
else
    print_error "Main page is not serving correctly"
fi

# 8. Check PM2 logs
print_status "Checking PM2 logs..."
pm2 logs client-portal --lines 5

print_success "Server routing fix completed!"
print_status "Your JavaScript files should now be served correctly" 