#!/bin/bash

# Manual Server Fix - Run this on the server
echo "🔧 Manual Server Fix - Starting..."

# Navigate to app directory
cd /var/www/client-portal/covren-client-portal

echo "1. Fixing CSS file path..."
sudo mkdir -p dist/dist
sudo ln -sf dist/styles.css dist/dist/styles.css

echo "2. Killing existing processes..."
sudo pkill -f "node.*server.js" || true
pm2 kill || true

echo "3. Starting application with PM2..."
pm2 start ecosystem.config.js
pm2 save

echo "4. Reloading nginx..."
sudo systemctl reload nginx

echo "5. Checking status..."
pm2 list
echo "CSS file:"
ls -la dist/dist/styles.css
echo "Port 3000:"
netstat -tlnp | grep :3000 || echo "Port 3000 not listening"

echo "✅ Manual fix completed!" 