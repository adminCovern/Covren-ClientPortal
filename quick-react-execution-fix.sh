#!/bin/bash

# Quick React Execution Fix
echo "🔧 Quick React Execution Fix - Starting..."

cd /var/www/client-portal/covren-client-portal

echo "1. Checking current build..."
ls -la dist/

echo "2. Testing JavaScript serving..."
curl -f -s http://localhost:3000/dist/index.js | head -1

echo "3. Checking HTML file..."
cat dist/index.html

echo "4. Rebuilding React app..."
rm -rf dist/*
mkdir -p dist

echo "5. Building CSS..."
npx tailwindcss -i ./styles.css -o ./dist/styles.css --minify

echo "6. Building JavaScript..."
npx babel index.jsx --out-dir dist --presets=@babel/preset-env,@babel/preset-react

echo "7. Copying HTML and favicon..."
cp index.html dist/
cp favicon.io dist/favicon.ico

echo "8. Restarting application..."
pm2 restart client-portal
pm2 save

echo "9. Testing..."
sleep 3
curl -f -s http://localhost:3000 | head -5
curl -f -s http://localhost:3000/dist/index.js | head -1

echo "✅ Quick React execution fix completed!" 