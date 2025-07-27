#!/bin/bash

# Quick React Fix - Run this on the server
echo "🔧 Quick React Fix - Starting..."

# Navigate to app directory
cd /var/www/client-portal/covren-client-portal

echo "1. Removing problematic symbolic link..."
sudo rm -rf dist/dist

echo "2. Restarting React application..."
pm2 restart client-portal
pm2 save

echo "3. Testing React app..."
curl -f -s http://localhost:3000 | head -5

echo "4. Testing CSS file..."
curl -f -s http://localhost:3000/dist/styles.css | head -1

echo "5. Reloading nginx..."
sudo systemctl reload nginx

echo "6. Final test..."
curl -f -s https://portal.covrenfirm.com | head -5

echo "✅ Quick React fix completed!" 