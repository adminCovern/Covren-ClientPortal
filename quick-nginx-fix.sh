#!/bin/bash

# Quick Nginx Fix - Run this directly on the server
# Fixes the immediate CSS file issue and restarts services

echo "🔧 Quick Nginx Fix - Running on server..."

# Fix the CSS file path issue
echo "Fixing CSS file path..."
sudo mkdir -p /var/www/client-portal/covren-client-portal/dist/dist
sudo ln -sf /var/www/client-portal/covren-client-portal/dist/styles.css /var/www/client-portal/covren-client-portal/dist/dist/styles.css

# Restart the application
echo "Restarting application..."
cd /var/www/client-portal/covren-client-portal
pm2 restart all || pm2 start ecosystem.config.js
pm2 save

# Reload nginx
echo "Reloading nginx..."
sudo systemctl reload nginx

# Check status
echo "Checking status..."
pm2 status
echo "CSS file check:"
ls -la /var/www/client-portal/covren-client-portal/dist/dist/styles.css

echo "✅ Quick fix completed!" 