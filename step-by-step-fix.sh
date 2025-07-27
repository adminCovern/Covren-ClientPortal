#!/bin/bash

# Step-by-Step Fix for PM2 Issues
# Run this on the server to properly start the application

echo "🔧 Step-by-Step PM2 Fix - Starting..."

# Navigate to app directory
cd /var/www/client-portal/covren-client-portal

echo "=== Step 1: Check current directory ==="
pwd
ls -la ecosystem.config.js

echo "=== Step 2: Fix CSS file path ==="
sudo mkdir -p dist/dist
sudo ln -sf dist/styles.css dist/dist/styles.css
ls -la dist/dist/styles.css

echo "=== Step 3: Kill existing processes ==="
sudo pkill -f "node.*server.js" || echo "No node processes found"
pm2 kill || echo "PM2 killed"

echo "=== Step 4: Check if PM2 is installed ==="
which pm2 || echo "PM2 not found"

echo "=== Step 5: Start application directly first ==="
echo "Starting with: node server.js"
timeout 10s node server.js || echo "Direct start test completed"

echo "=== Step 6: Start with PM2 ==="
pm2 start server.js --name "client-portal" --cwd /var/www/client-portal/covren-client-portal

echo "=== Step 7: Check PM2 status ==="
pm2 list

echo "=== Step 8: Save PM2 configuration ==="
pm2 save

echo "=== Step 9: Check if app is responding ==="
sleep 3
curl -f -s http://localhost:3000 > /dev/null && echo "✅ App responding on port 3000" || echo "❌ App not responding on port 3000"

echo "=== Step 10: Reload nginx ==="
sudo systemctl reload nginx

echo "=== Step 11: Final status ==="
echo "PM2 Status:"
pm2 list
echo "Port 3000:"
netstat -tlnp | grep :3000 || echo "Port 3000 not listening"
echo "CSS file:"
ls -la dist/dist/styles.css

echo "✅ Step-by-step fix completed!" 