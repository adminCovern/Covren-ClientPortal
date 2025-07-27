#!/bin/bash

# Start Application Fix Script
# Properly starts the Node.js application with PM2

set -e

echo "🚀 Starting Application and Fixing PM2 Issues..."

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

# Check if ecosystem.config.js exists
if [ ! -f "ecosystem.config.js" ]; then
    print_error "ecosystem.config.js not found!"
    exit 1
fi

print_status "Found ecosystem.config.js"

# Kill any existing Node.js processes
print_status "Killing any existing Node.js processes..."
sudo pkill -f "node.*server.js" || true
sudo pkill -f "pm2" || true

# Wait a moment
sleep 2

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    print_error "PM2 is not installed!"
    print_status "Installing PM2..."
    sudo npm install -g pm2
fi

# Clear PM2 processes
print_status "Clearing PM2 processes..."
pm2 kill || true
pm2 delete all || true

# Start the application with PM2
print_status "Starting application with PM2..."
pm2 start ecosystem.config.js

# Save PM2 configuration
print_status "Saving PM2 configuration..."
pm2 save

# Check PM2 status
print_status "Checking PM2 status..."
pm2 list

# Check if application is responding
print_status "Checking if application is responding..."
sleep 5

if curl -f -s http://localhost:3000 > /dev/null; then
    print_success "Application is responding on port 3000"
else
    print_error "Application is not responding on port 3000"
    
    # Check PM2 logs
    print_status "Checking PM2 logs..."
    pm2 logs --lines 10
fi

# Fix the CSS file issue
print_status "Fixing CSS file path issue..."
sudo mkdir -p dist/dist
sudo ln -sf dist/styles.css dist/dist/styles.css

# Reload nginx
print_status "Reloading nginx..."
sudo systemctl reload nginx

# Final status check
print_status "Final status check..."
echo "=== PM2 Status ==="
pm2 list

echo "=== CSS File Check ==="
ls -la dist/dist/styles.css

echo "=== Port Check ==="
netstat -tlnp | grep :3000 || echo "Port 3000 not listening"

echo "=== Nginx Status ==="
sudo systemctl status nginx --no-pager -l

print_success "Application start fix completed!" 