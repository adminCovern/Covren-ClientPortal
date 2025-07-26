#!/bin/bash

# Sovereign Command Center Vultr Bare Metal Deployment Script
# Covren Firm LLC - Production Grade Deployment
# NO CONTAINERS, NO DOCKER, NO VIRTUAL ENVIRONMENTS

set -e  # Exit on any error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="sovereign-command-center"
APP_DIR="/var/www/sovereign-command-center"
LOG_DIR="/var/log/pm2"
UPLOAD_DIR="/var/www/uploads"
BACKUP_DIR="/opt/backups"
NODE_VERSION="18"
PYTHON_VERSION="3.12"

# Function to print colored output
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

# Function to check if running as root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        print_error "This script must be run as root"
        exit 1
    fi
}

# Function to update system
update_system() {
    print_status "Updating system packages..."
    apt update && apt upgrade -y
    print_success "System updated successfully"
}

# Function to install system dependencies
install_system_dependencies() {
    print_status "Installing system dependencies..."
    
    # Install essential packages
    apt install -y \
        curl \
        wget \
        git \
        unzip \
        build-essential \
        libssl-dev \
        libffi-dev \
        software-properties-common \
        apt-transport-https \
        ca-certificates \
        gnupg \
        lsb-release
    
    # Install Python 3.12 (required, no downgrades)
    print_status "Installing Python 3.12..."
    add-apt-repository ppa:deadsnakes/ppa -y
    apt update
    apt install -y python3.12 python3.12-venv python3.12-dev python3.12-pip
    
    # Install Node.js 18
    print_status "Installing Node.js 18..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
    
    # Install PM2 globally
    print_status "Installing PM2..."
    npm install -g pm2
    
    print_success "System dependencies installed successfully"
}

# Function to install and configure PostgreSQL
install_postgresql() {
    print_status "Installing PostgreSQL..."
    
    # Install PostgreSQL
    apt install -y postgresql postgresql-contrib
    
    # Start and enable PostgreSQL
    systemctl start postgresql
    systemctl enable postgresql
    
    # Create database and user
    print_status "Configuring PostgreSQL database..."
    sudo -u postgres psql -c "CREATE DATABASE sovereign_command_center;"
    sudo -u postgres psql -c "CREATE USER sovren_user WITH PASSWORD 'secure_password_here';"
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE sovereign_command_center TO sovren_user;"
    sudo -u postgres psql -c "ALTER USER sovren_user CREATEDB;"
    
    # Configure PostgreSQL for production
    print_status "Optimizing PostgreSQL configuration..."
    cat >> /etc/postgresql/*/main/postgresql.conf << EOF
    
# Sovereign Command Center Production Optimizations
max_connections = 200
shared_buffers = 2GB
effective_cache_size = 6GB
maintenance_work_mem = 256MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 4MB
min_wal_size = 1GB
max_wal_size = 4GB
max_worker_processes = 8
max_parallel_workers_per_gather = 4
max_parallel_workers = 8
max_parallel_maintenance_workers = 4
EOF
    
    # Restart PostgreSQL
    systemctl restart postgresql
    
    print_success "PostgreSQL installed and configured successfully"
}

# Function to install and configure Redis
install_redis() {
    print_status "Installing Redis..."
    
    # Install Redis
    apt install -y redis-server
    
    # Configure Redis for production
    print_status "Configuring Redis for production..."
    cat > /etc/redis/redis.conf << EOF
# Sovereign Command Center Redis Configuration
bind 127.0.0.1
port 6379
requirepass your_redis_password_here
maxmemory 2gb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
stop-writes-on-bgsave-error yes
rdbcompression yes
rdbchecksum yes
dbfilename dump.rdb
dir /var/lib/redis
appendonly yes
appendfilename "appendonly.aof"
appendfsync everysec
no-appendfsync-on-rewrite no
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb
EOF
    
    # Restart Redis
    systemctl restart redis
    systemctl enable redis
    
    print_success "Redis installed and configured successfully"
}

# Function to install and configure Nginx
install_nginx() {
    print_status "Installing Nginx..."
    
    # Install Nginx
    apt install -y nginx
    
    # Create Nginx configuration
    print_status "Configuring Nginx..."
    cat > /etc/nginx/sites-available/sovereign-command-center << 'EOF'
# Sovereign Command Center Nginx Configuration
server {
    listen 80;
    server_name client.covrenfirm.com portal.covrenfirm.com;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;
    
    # Static file caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
    
    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
    
    # Metrics endpoint
    location /metrics {
        access_log off;
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # API proxy
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
    
    # WebSocket proxy
    location /ws/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }
    
    # Main application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF
    
    # Enable site
    ln -sf /etc/nginx/sites-available/sovereign-command-center /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    
    # Test and restart Nginx
    nginx -t
    systemctl restart nginx
    systemctl enable nginx
    
    print_success "Nginx installed and configured successfully"
}

# Function to create application directories
create_directories() {
    print_status "Creating application directories..."
    
    # Create application directory
    mkdir -p $APP_DIR
    mkdir -p $LOG_DIR
    mkdir -p $UPLOAD_DIR
    mkdir -p $BACKUP_DIR
    
    # Set permissions
    chown -R www-data:www-data $APP_DIR
    chown -R www-data:www-data $LOG_DIR
    chown -R www-data:www-data $UPLOAD_DIR
    chown -R www-data:www-data $BACKUP_DIR
    
    chmod 755 $APP_DIR
    chmod 755 $LOG_DIR
    chmod 755 $UPLOAD_DIR
    chmod 755 $BACKUP_DIR
    
    print_success "Directories created successfully"
}

# Function to deploy application
deploy_application() {
    print_status "Deploying Sovereign Command Center..."
    
    # Navigate to application directory
    cd $APP_DIR
    
    # Clone repository if not exists
    if [ ! -d ".git" ]; then
        print_status "Cloning repository..."
        git clone https://github.com/covren-firm/sovereign-command-center.git .
    else
        print_status "Pulling latest changes..."
        git pull origin main
    fi
    
    # Install dependencies
    print_status "Installing Node.js dependencies..."
    npm ci --production
    
    # Build application
    print_status "Building application..."
    npm run build
    
    # Apply database schema
    print_status "Applying database schema..."
    psql -h localhost -U sovren_user -d sovereign_command_center -f database-schema.sql
    
    print_success "Application deployed successfully"
}

# Function to configure PM2
configure_pm2() {
    print_status "Configuring PM2..."
    
    # Start application with PM2
    cd $APP_DIR
    pm2 start ecosystem.config.js --env production
    
    # Save PM2 configuration
    pm2 save
    
    # Setup PM2 startup script
    pm2 startup
    
    print_success "PM2 configured successfully"
}

# Function to setup SSL certificates
setup_ssl() {
    print_status "Setting up SSL certificates..."
    
    # Install Certbot
    apt install -y certbot python3-certbot-nginx
    
    # Obtain SSL certificates
    certbot --nginx -d client.covrenfirm.com -d portal.covrenfirm.com --non-interactive --agree-tos --email admin@covrenfirm.com
    
    # Setup auto-renewal
    (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
    
    print_success "SSL certificates configured successfully"
}

# Function to setup monitoring
setup_monitoring() {
    print_status "Setting up monitoring..."
    
    # Install monitoring tools
    apt install -y htop iotop nethogs
    
    # Setup log rotation
    cat > /etc/logrotate.d/sovereign-command-center << EOF
$LOG_DIR/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        pm2 reloadLogs
    endscript
}
EOF
    
    # Setup backup script
    cat > /opt/backup.sh << 'EOF'
#!/bin/bash
# Sovereign Command Center Backup Script

BACKUP_DIR="/opt/backups"
APP_DIR="/var/www/sovereign-command-center"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
pg_dump -h localhost -U sovren_user sovereign_command_center | gzip > $BACKUP_DIR/db_backup_$DATE.sql.gz

# Backup application files
tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz -C $APP_DIR .

# Backup configuration files
tar -czf $BACKUP_DIR/config_backup_$DATE.tar.gz /etc/nginx/sites-available/sovereign-command-center /etc/postgresql/ /etc/redis/ /etc/pm2/

# Remove backups older than 7 days
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
EOF
    
    chmod +x /opt/backup.sh
    
    # Setup daily backup cron job
    (crontab -l 2>/dev/null; echo "0 2 * * * /opt/backup.sh") | crontab -
    
    print_success "Monitoring configured successfully"
}

# Function to setup firewall
setup_firewall() {
    print_status "Setting up firewall..."
    
    # Install UFW if not present
    apt install -y ufw
    
    # Configure firewall
    ufw default deny incoming
    ufw default allow outgoing
    
    # Allow SSH
    ufw allow ssh
    
    # Allow HTTP and HTTPS
    ufw allow 80
    ufw allow 443
    
    # Enable firewall
    ufw --force enable
    
    print_success "Firewall configured successfully"
}

# Function to verify deployment
verify_deployment() {
    print_status "Verifying deployment..."
    
    # Check if services are running
    if systemctl is-active --quiet nginx; then
        print_success "Nginx is running"
    else
        print_error "Nginx is not running"
        exit 1
    fi
    
    if systemctl is-active --quiet postgresql; then
        print_success "PostgreSQL is running"
    else
        print_error "PostgreSQL is not running"
        exit 1
    fi
    
    if systemctl is-active --quiet redis; then
        print_success "Redis is running"
    else
        print_error "Redis is not running"
        exit 1
    fi
    
    # Check PM2 processes
    if pm2 list | grep -q "sovereign-command-center"; then
        print_success "PM2 processes are running"
    else
        print_error "PM2 processes are not running"
        exit 1
    fi
    
    # Test application health
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        print_success "Application health check passed"
    else
        print_error "Application health check failed"
        exit 1
    fi
    
    print_success "Deployment verification completed successfully"
}

# Main deployment function
main() {
    print_status "Starting Sovereign Command Center deployment on Vultr..."
    print_status "Server Specifications: 8 vCPU, 16GB RAM, 350GB NVMe"
    print_status "Deployment Type: BARE METAL (NO CONTAINERS, NO DOCKER, NO VIRTUAL ENVIRONMENTS)"
    
    # Check if running as root
    check_root
    
    # Update system
    update_system
    
    # Install system dependencies
    install_system_dependencies
    
    # Install and configure services
    install_postgresql
    install_redis
    install_nginx
    
    # Create directories
    create_directories
    
    # Deploy application
    deploy_application
    
    # Configure PM2
    configure_pm2
    
    # Setup SSL certificates
    setup_ssl
    
    # Setup monitoring
    setup_monitoring
    
    # Setup firewall
    setup_firewall
    
    # Verify deployment
    verify_deployment
    
    print_success "🎉 Sovereign Command Center deployment completed successfully!"
    print_status "🌐 Application URL: https://client.covrenfirm.com"
    print_status "📊 Health Check: https://client.covrenfirm.com/health"
    print_status "📈 Metrics: https://client.covrenfirm.com/metrics"
    print_status "📝 Logs: /var/log/pm2/"
    print_status "💾 Backups: /opt/backups/"
    print_status "🔧 PM2 Commands: pm2 monit, pm2 logs, pm2 restart"
}

# Run main function
main "$@" 