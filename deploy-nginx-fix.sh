#!/bin/bash

# Deploy Nginx Fix Script
# Runs the comprehensive nginx error fix on the production server

set -e

echo "🚀 Deploying Nginx Error Fix to Production Server..."

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

# Check if SSH key is available
if [ ! -f ~/.ssh/id_rsa ]; then
    print_error "SSH key not found. Please ensure your SSH key is set up."
    exit 1
fi

# Server details
SERVER_IP="your-server-ip-here"
SERVER_USER="ubuntu"
REMOTE_DIR="/var/www/client-portal/covren-client-portal"

print_status "Connecting to production server..."

# Pull latest changes from GitHub
print_status "Pulling latest changes from GitHub..."
ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP << 'EOF'
    cd /var/www/client-portal/covren-client-portal
    git pull origin main
    chmod +x fix-nginx-errors.sh
EOF

# Run the nginx fix script
print_status "Running nginx error fix script..."
ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP << 'EOF'
    cd /var/www/client-portal/covren-client-portal
    ./fix-nginx-errors.sh
EOF

print_success "Nginx error fix deployed successfully!"

# Verify the fix
print_status "Verifying the fix..."
ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP << 'EOF'
    echo "=== Checking nginx error log ==="
    sudo tail -10 /var/log/nginx/error.log
    
    echo "=== Checking application status ==="
    pm2 status
    
    echo "=== Checking if CSS file exists ==="
    ls -la /var/www/client-portal/covren-client-portal/dist/dist/styles.css
    
    echo "=== Testing website accessibility ==="
    curl -I https://portal.covrenfirm.com | head -1
EOF

print_success "Deployment completed! Monitor the logs for any remaining issues." 