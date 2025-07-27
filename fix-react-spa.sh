#!/bin/bash

# Fix React SPA Serving
# Ensures the React app is properly served as a Single Page Application

set -e

echo "🔧 Fixing React SPA Serving..."

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

# 1. Check current build
print_status "Checking current build..."
ls -la dist/

# 2. Rebuild the React application properly
print_status "Rebuilding React application..."
npm run build

# 3. Update the server.js to properly handle React routing
print_status "Updating server configuration for React SPA..."

# Create a backup of server.js
cp server.js server.js.backup.$(date +%Y%m%d_%H%M%S)

# Update the server.js file to properly handle React routing
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

// Serve static files from dist directory with proper MIME types
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

// Serve the main React app for all non-API routes
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

# 4. Remove the problematic symbolic link
print_status "Removing problematic symbolic link..."
sudo rm -rf dist/dist

# 5. Restart the application
print_status "Restarting React application..."
pm2 restart client-portal || pm2 start server.js --name "client-portal" --cwd /var/www/client-portal/covren-client-portal
pm2 save

# 6. Test the React app
print_status "Testing React application..."

# Wait for app to start
sleep 5

# Test the main page
if curl -f -s http://localhost:3000 | grep -q "Covren Firm"; then
    print_success "React app is serving correctly"
else
    print_error "React app is not serving correctly"
fi

# Test CSS file
if curl -f -s http://localhost:3000/dist/styles.css | head -1 | grep -q "css"; then
    print_success "CSS file is being served correctly"
else
    print_error "CSS file is not being served correctly"
fi

# Test JavaScript file
if curl -f -s http://localhost:3000/dist/index.js | head -1 | grep -q "function\|var\|const"; then
    print_success "JavaScript file is being served correctly"
else
    print_error "JavaScript file is not being served correctly"
fi

# 7. Update nginx configuration
print_status "Updating nginx configuration..."

# Create backup
sudo cp /etc/nginx/sites-available/portal.covrenfirm.com /etc/nginx/sites-available/portal.covrenfirm.com.backup.$(date +%Y%m%d_%H%M%S)

# Create proper nginx configuration for React SPA
sudo tee /etc/nginx/sites-available/portal.covrenfirm.com > /dev/null << 'EOF'
server {
    listen 80;
    server_name portal.covrenfirm.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name portal.covrenfirm.com;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/portal.covrenfirm.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/portal.covrenfirm.com/privkey.pem;
    
    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_session_tickets off;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # API routes - proxy to Node.js
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Health check
    location /health {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # All other requests go to React app
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
    
    # Deny access to sensitive files
    location ~ /\. {
        deny all;
    }
    
    location ~ /\.ht {
        deny all;
    }
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;
}
EOF

# Test nginx configuration
print_status "Testing nginx configuration..."
if sudo nginx -t; then
    print_success "Nginx configuration is valid"
    
    # Reload nginx
    print_status "Reloading nginx..."
    sudo systemctl reload nginx
    print_success "Nginx reloaded successfully"
else
    print_error "Nginx configuration test failed"
    exit 1
fi

print_success "React SPA serving fix completed!"
print_status "Your React app should now be properly served as a Single Page Application" 