#!/bin/bash

# Fix File Permissions for Build Process
# Resolves permission issues preventing React app from building

set -e

echo "🔧 Fixing File Permissions for Build Process..."

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

# 1. Fix ownership and permissions
print_status "Fixing file ownership and permissions..."

# Change ownership to ubuntu user
sudo chown -R ubuntu:ubuntu /var/www/client-portal/covren-client-portal

# Set proper permissions
sudo chmod -R 755 /var/www/client-portal/covren-client-portal
sudo chmod -R 777 dist/

# 2. Clean the dist directory
print_status "Cleaning dist directory..."
rm -rf dist/*
mkdir -p dist

# 3. Update browserslist database
print_status "Updating browserslist database..."
npx update-browserslist-db@latest

# 4. Rebuild the React application
print_status "Rebuilding React application..."
npm run build

# 5. Set proper permissions after build
print_status "Setting proper permissions after build..."
sudo chown -R www-data:www-data dist/
sudo chmod -R 755 dist/

# 6. Restart the application
print_status "Restarting React application..."
pm2 restart client-portal || pm2 start server.js --name "client-portal" --cwd /var/www/client-portal/covren-client-portal
pm2 save

# 7. Test the build
print_status "Testing the build..."
ls -la dist/

# Test if files are accessible
if [ -f "dist/index.js" ] && [ -f "dist/styles.css" ] && [ -f "dist/index.html" ]; then
    print_success "Build completed successfully"
else
    print_error "Build failed - missing files"
    exit 1
fi

# 8. Test the application
print_status "Testing the application..."
sleep 3

if curl -f -s http://localhost:3000 | grep -q "Covren Firm"; then
    print_success "React app is serving correctly"
else
    print_error "React app is not serving correctly"
fi

print_success "Permission fix completed!"
print_status "Your React app should now build and serve correctly" 