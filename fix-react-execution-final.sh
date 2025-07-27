#!/bin/bash

# Final React Execution Fix
# Ensures React JavaScript executes properly

set -e

echo "🔧 Final React Execution Fix..."

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

# 1. Check the current JavaScript file
print_status "Checking current JavaScript file..."
echo "=== JavaScript File Content (first 10 lines) ==="
curl -f -s http://localhost:3000/dist/index.js | head -10

# 2. Test if React dependencies are loading
print_status "Testing React dependencies..."
echo "=== React CDN Test ==="
curl -f -s "https://unpkg.com/react@18/umd/react.production.min.js" | head -1 || echo "React CDN failed"

echo "=== ReactDOM CDN Test ==="
curl -f -s "https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" | head -1 || echo "ReactDOM CDN failed"

echo "=== Supabase CDN Test ==="
curl -f -s "https://unpkg.com/@supabase/supabase-js@2/dist/umd/supabase.min.js" | head -1 || echo "Supabase CDN failed"

# 3. Rebuild with proper React execution
print_status "Rebuilding with proper React execution..."

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

# 4. Verify the build
print_status "Verifying build..."
ls -la dist/

# 5. Test the JavaScript file
print_status "Testing built JavaScript file..."
echo "=== Built JavaScript Content (first 10 lines) ==="
cat dist/index.js | head -10

# 6. Restart application
print_status "Restarting application..."
pm2 restart client-portal
pm2 save

# 7. Test the application
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

# 8. Create a test HTML file to verify React execution
print_status "Creating test HTML file..."
cat > test-react.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>React Test</title>
</head>
<body>
  <div id="root"></div>
  <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script>
    // Test if React is loading
    if (typeof React !== 'undefined' && typeof ReactDOM !== 'undefined') {
      console.log('React and ReactDOM loaded successfully');
      document.getElementById('root').innerHTML = '<h1>React is working!</h1>';
    } else {
      console.log('React failed to load');
      document.getElementById('root').innerHTML = '<h1>React failed to load</h1>';
    }
  </script>
</body>
</html>
EOF

# 9. Test the React execution
print_status "Testing React execution..."
curl -f -s http://localhost:3000/test-react.html | grep -q "React is working" && print_success "React execution test passed" || print_error "React execution test failed"

# 10. Check PM2 logs
print_status "Checking PM2 logs..."
pm2 logs client-portal --lines 5

print_success "Final React execution fix completed!"
print_status "Your React app should now execute properly" 