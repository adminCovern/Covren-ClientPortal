#!/bin/bash

# Fix Nginx Errors Script
# Addresses missing CSS files, SSL issues, and upstream problems

set -e

echo "🔧 Fixing Nginx Errors and Application Issues..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if running as root
if [[ $EUID -eq 0 ]]; then
    print_error "This script should not be run as root"
    exit 1
fi

# 1. Fix the CSS file path issue
print_status "Fixing CSS file path issue..."

# Create symbolic link to fix the double dist issue
if [ -f "/var/www/client-portal/covren-client-portal/dist/styles.css" ]; then
    sudo mkdir -p /var/www/client-portal/covren-client-portal/dist/dist
    sudo ln -sf /var/www/client-portal/covren-client-portal/dist/styles.css /var/www/client-portal/covren-client-portal/dist/dist/styles.css
    print_success "Created symbolic link for styles.css"
else
    print_error "styles.css not found in dist directory"
    exit 1
fi

# 2. Check and restart the Node.js application
print_status "Checking Node.js application status..."

# Navigate to the application directory
cd /var/www/client-portal/covren-client-portal

# Check if PM2 is running
if command -v pm2 &> /dev/null; then
    print_status "Checking PM2 processes..."
    pm2 list
    
    # Restart the application
    print_status "Restarting PM2 application..."
    pm2 restart all || pm2 start ecosystem.config.js
    
    # Save PM2 configuration
    pm2 save
    
    print_success "PM2 application restarted"
else
    print_warning "PM2 not found, checking for direct Node.js process..."
    
    # Kill any existing Node.js processes
    sudo pkill -f "node.*server.js" || true
    
    # Start the application directly
    print_status "Starting Node.js application..."
    nohup node server.js > app.log 2>&1 &
    
    print_success "Node.js application started"
fi

# 3. Check and fix SSL certificate issues
print_status "Checking SSL certificate configuration..."

# Check if SSL certificate exists and is valid
if [ -f "/etc/letsencrypt/live/portal.covrenfirm.com/fullchain.pem" ]; then
    print_status "SSL certificate found, checking validity..."
    
    # Test SSL certificate
    openssl x509 -in /etc/letsencrypt/live/portal.covrenfirm.com/fullchain.pem -text -noout | grep -E "(Subject:|Not After:)" || {
        print_warning "SSL certificate may be invalid or expired"
    }
    
    # Renew certificate if needed
    print_status "Attempting to renew SSL certificate..."
    sudo certbot renew --quiet || {
        print_warning "SSL certificate renewal failed"
    }
else
    print_warning "SSL certificate not found at expected location"
fi

# 4. Fix Nginx configuration
print_status "Fixing Nginx configuration..."

# Create backup of current nginx config
sudo cp /etc/nginx/sites-available/portal.covrenfirm.com /etc/nginx/sites-available/portal.covrenfirm.com.backup.$(date +%Y%m%d_%H%M%S)

# Create proper nginx configuration
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
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Root directory
    root /var/www/client-portal/covren-client-portal;
    index index.html index.htm;
    
    # Handle static files
    location / {
        try_files $uri $uri/ @nodejs;
    }
    
    # Handle CSS files specifically
    location ~* \.css$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri @nodejs;
    }
    
    # Handle JavaScript files
    location ~* \.js$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri @nodejs;
    }
    
    # Handle images and other static assets
    location ~* \.(jpg|jpeg|png|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri @nodejs;
    }
    
    # Proxy to Node.js application
    location @nodejs {
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
    
    # API routes
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
    
    # WebSocket support
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
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
print_status "Testing Nginx configuration..."
if sudo nginx -t; then
    print_success "Nginx configuration is valid"
    
    # Reload nginx
    print_status "Reloading Nginx..."
    sudo systemctl reload nginx
    print_success "Nginx reloaded successfully"
else
    print_error "Nginx configuration test failed"
    exit 1
fi

# 5. Check application health
print_status "Checking application health..."

# Wait a moment for the application to start
sleep 5

# Check if the application is responding
if curl -f -s http://localhost:3000 > /dev/null; then
    print_success "Application is responding on port 3000"
else
    print_error "Application is not responding on port 3000"
    
    # Check application logs
    print_status "Checking application logs..."
    if [ -f "app.log" ]; then
        tail -20 app.log
    fi
    
    # Check PM2 logs if available
    if command -v pm2 &> /dev/null; then
        print_status "Checking PM2 logs..."
        pm2 logs --lines 10
    fi
fi

# 6. Check firewall and ports
print_status "Checking firewall and port status..."

# Check if port 3000 is listening
if netstat -tlnp | grep :3000; then
    print_success "Port 3000 is listening"
else
    print_error "Port 3000 is not listening"
fi

# Check if port 80 and 443 are listening
if netstat -tlnp | grep :80; then
    print_success "Port 80 is listening"
else
    print_error "Port 80 is not listening"
fi

if netstat -tlnp | grep :443; then
    print_success "Port 443 is listening"
else
    print_error "Port 443 is not listening"
fi

# 7. Final health check
print_status "Performing final health check..."

# Test the website
if curl -f -s -I https://portal.covrenfirm.com | head -1 | grep -q "200\|301\|302"; then
    print_success "Website is accessible via HTTPS"
else
    print_warning "Website may not be accessible via HTTPS"
fi

# Test HTTP to HTTPS redirect
if curl -f -s -I http://portal.covrenfirm.com | head -1 | grep -q "301\|302"; then
    print_success "HTTP to HTTPS redirect is working"
else
    print_warning "HTTP to HTTPS redirect may not be working"
fi

print_success "Nginx error fix completed!"
print_status "Monitor the logs with: sudo tail -f /var/log/nginx/error.log"
print_status "Check application status with: pm2 status"
print_status "View application logs with: pm2 logs" 