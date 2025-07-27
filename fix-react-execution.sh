#!/bin/bash

# Fix React Execution
# Ensures React JavaScript loads and executes properly

set -e

echo "🔧 Fixing React Execution..."

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

# 1. Check current build files
print_status "Checking current build files..."
ls -la dist/

# 2. Check if React JavaScript is being served
print_status "Testing React JavaScript serving..."
if curl -f -s http://localhost:3000/dist/index.js | head -1 | grep -q "function\|var\|const"; then
    print_success "React JavaScript is being served correctly"
else
    print_error "React JavaScript is not being served correctly"
fi

# 3. Check the HTML file to see if it's loading React properly
print_status "Checking HTML file for React loading..."
cat dist/index.html

# 4. Test if the React app is actually executing
print_status "Testing React app execution..."
curl -f -s http://localhost:3000 | grep -A 10 -B 10 "script"

# 5. Check browser console for errors (simulate)
print_status "Checking for potential JavaScript errors..."
curl -f -s http://localhost:3000/dist/index.js | grep -i "error\|exception" || echo "No obvious errors in JavaScript"

# 6. Rebuild with proper React setup
print_status "Rebuilding React application with proper setup..."

# Clean dist directory
rm -rf dist/*
mkdir -p dist

# Build CSS
npx tailwindcss -i ./styles.css -o ./dist/styles.css --minify

# Build JavaScript with proper React setup
npx babel index.jsx --out-dir dist --presets=@babel/preset-env,@babel/preset-react

# Copy HTML file
cp index.html dist/

# Copy favicon
cp favicon.io dist/favicon.ico

# 7. Verify the build
print_status "Verifying build..."
ls -la dist/

# 8. Check if React dependencies are loading
print_status "Checking React dependencies..."
curl -f -s "https://unpkg.com/react@18/umd/react.production.min.js" | head -1 | grep -q "function" && echo "React CDN accessible" || echo "React CDN not accessible"

# 9. Restart application
print_status "Restarting application..."
pm2 restart client-portal
pm2 save

# 10. Test the application
print_status "Testing application..."
sleep 5

# Test main page
if curl -f -s http://localhost:3000 | grep -q "Covren Firm"; then
    print_success "Main page is serving"
else
    print_error "Main page is not serving correctly"
fi

# Test JavaScript file
if curl -f -s http://localhost:3000/dist/index.js | head -1 | grep -q "function\|var\|const"; then
    print_success "JavaScript file is serving correctly"
else
    print_error "JavaScript file is not serving correctly"
fi

# Test CSS file
if curl -f -s http://localhost:3000/dist/styles.css | head -1 | grep -q "css"; then
    print_success "CSS file is serving correctly"
else
    print_error "CSS file is not serving correctly"
fi

# 11. Check PM2 logs for any errors
print_status "Checking PM2 logs..."
pm2 logs client-portal --lines 10

print_success "React execution fix completed!"
print_status "Check the browser console for any JavaScript errors" 