#!/bin/bash

# Debug React Loading Issues
# Identifies and fixes why React isn't executing

set -e

echo "🔍 Debugging React Loading Issues..."

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

# 1. Check the HTML file content
print_status "Checking HTML file content..."
echo "=== HTML File Content ==="
cat dist/index.html

# 2. Check if JavaScript is being served correctly
print_status "Testing JavaScript serving..."
echo "=== JavaScript File Test ==="
curl -f -s http://localhost:3000/dist/index.js | head -5

# 3. Check if React dependencies are accessible
print_status "Testing React CDN accessibility..."
echo "=== React CDN Test ==="
curl -f -s "https://unpkg.com/react@18/umd/react.production.min.js" | head -1 || echo "React CDN not accessible"

# 4. Check if Supabase is accessible
print_status "Testing Supabase CDN accessibility..."
echo "=== Supabase CDN Test ==="
curl -f -s "https://unpkg.com/@supabase/supabase-js@2/dist/umd/supabase.min.js" | head -1 || echo "Supabase CDN not accessible"

# 5. Check server configuration
print_status "Checking server configuration..."
echo "=== Server Configuration ==="
grep -A 10 -B 5 "static\|dist" server.js || echo "No static file configuration found"

# 6. Test the main page response
print_status "Testing main page response..."
echo "=== Main Page Response ==="
curl -f -s http://localhost:3000 | head -10

# 7. Check for JavaScript errors in the built file
print_status "Checking for JavaScript errors..."
echo "=== JavaScript Error Check ==="
curl -f -s http://localhost:3000/dist/index.js | grep -i "error\|exception\|undefined" || echo "No obvious errors found"

# 8. Check PM2 logs for server errors
print_status "Checking PM2 logs..."
echo "=== PM2 Logs ==="
pm2 logs client-portal --lines 5

# 9. Test if the React app is actually trying to load
print_status "Testing React app loading..."
echo "=== React Loading Test ==="
curl -f -s http://localhost:3000 | grep -i "react\|script" || echo "No React references found"

print_status "Debug completed! Check the output above for issues." 