#!/bin/bash

# Quick Debug Script
echo "🔍 Quick Debug - Starting..."

cd /var/www/client-portal/covren-client-portal

echo "1. Checking HTML file..."
cat dist/index.html

echo "2. Testing JavaScript serving..."
curl -f -s http://localhost:3000/dist/index.js | head -3

echo "3. Testing React CDN..."
curl -f -s "https://unpkg.com/react@18/umd/react.production.min.js" | head -1 || echo "React CDN failed"

echo "4. Testing main page..."
curl -f -s http://localhost:3000 | head -5

echo "5. Checking PM2 logs..."
pm2 logs client-portal --lines 3

echo "✅ Quick debug completed!" 