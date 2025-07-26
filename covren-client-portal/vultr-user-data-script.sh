#!/bin/bash

# Sovereign Command Center Vultr User Data Script
# Covren Firm LLC - Dedicated CPU Server Deployment
# Server: voc-c-16c-32gb-300s (16 vCPUs, 32GB RAM, 300GB Storage)
# NO CONTAINERS, NO DOCKER, NO VIRTUAL ENVIRONMENTS

set -e  # Exit on any error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration for Dedicated CPU Server
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
    exit 1
}

# Function to update system
update_system() {
    print_status "Updating system packages for Dedicated CPU server..."
    apt update && apt upgrade -y || print_error "Failed to update system"
    print_success "System updated successfully"
}

# Function to install system dependencies optimized for 16 vCPUs
install_system_dependencies() {
    print_status "Installing system dependencies for 16 vCPU server..."

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
        lsb-release \
        htop \
        iotop \
        nethogs \
        sysstat || print_error "Failed to install essential packages"

    # Install Python 3.12 (required, no downgrades)
    print_status "Installing Python 3.12..."
    add-apt-repository ppa:deadsnakes/ppa -y || print_error "Failed to add Python PPA"
    apt update || print_error "Failed to update apt after adding PPA"
    apt install -y python3.12 python3.12-venv python3.12-dev python3.12-pip || print_error "Failed to install Python 3.12"

    # Install Node.js 18
    print_status "Installing Node.js 18..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - || print_error "Failed to add NodeSource PPA"
    apt-get install -y nodejs || print_error "Failed to install Node.js"

    # Install PM2 globally
    print_status "Installing PM2..."
    npm install -g pm2 || print_error "Failed to install PM2"

    print_success "System dependencies installed successfully for 16 vCPU server"
}

# Function to install and configure PostgreSQL optimized for 32GB RAM
install_postgresql() {
    print_status "Installing PostgreSQL optimized for 32GB RAM..."

    # Install PostgreSQL
    apt install -y postgresql postgresql-contrib || print_error "Failed to install PostgreSQL"

    # Start and enable PostgreSQL
    systemctl start postgresql || print_error "Failed to start PostgreSQL"
    systemctl enable postgresql || print_error "Failed to enable PostgreSQL"

    # Create database and user
    print_status "Configuring PostgreSQL database..."
    sudo -u postgres psql -c "CREATE DATABASE sovereign_command_center;" || print_error "Failed to create database"
    sudo -u postgres psql -c "CREATE USER sovren_user WITH PASSWORD 'secure_password_here';" || print_error "Failed to create user"
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE sovereign_command_center TO sovren_user;" || print_error "Failed to grant privileges"
    sudo -u postgres psql -c "ALTER USER sovren_user CREATEDB;" || print_error "Failed to alter user"

    # Configure PostgreSQL for 32GB RAM server
    print_status "Optimizing PostgreSQL configuration for 32GB RAM..."
    cat >> /etc/postgresql/*/main/postgresql.conf << EOF

# Sovereign Command Center Production Optimizations for 32GB RAM
max_connections = 400
shared_buffers = 8GB
effective_cache_size = 24GB
maintenance_work_mem = 1GB
checkpoint_completion_target = 0.9
wal_buffers = 64MB
default_statistics_target = 200
random_page_cost = 1.1
effective_io_concurrency = 400
work_mem = 16MB
min_wal_size = 2GB
max_wal_size = 8GB
max_worker_processes = 16
max_parallel_workers_per_gather = 8
max_parallel_workers = 16
max_parallel_maintenance_workers = 8
EOF
    systemctl restart postgresql || print_error "Failed to restart PostgreSQL after config"

    print_success "PostgreSQL installed and configured successfully for 32GB RAM"
}

# Function to install and configure Redis optimized for 32GB RAM
install_redis() {
    print_status "Installing Redis optimized for 32GB RAM..."

    # Install Redis
    apt install -y redis-server || print_error "Failed to install Redis"

    # Configure Redis for 32GB RAM server
    print_status "Configuring Redis for 32GB RAM server..."
    cat > /etc/redis/redis.conf << EOF
# Sovereign Command Center Redis Configuration for 32GB RAM
bind 127.0.0.1
port 6379
requirepass your_redis_password_here
maxmemory 8gb
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
auto-aof-rewrite-min-size 128mb
EOF
    systemctl restart redis || print_error "Failed to restart Redis after config"
    systemctl enable redis || print_error "Failed to enable Redis"

    print_success "Redis installed and configured successfully for 32GB RAM"
}

# Function to install and configure Nginx optimized for 16 vCPUs
install_nginx() {
    print_status "Installing Nginx optimized for 16 vCPU server..."

    # Install Nginx
    apt install -y nginx || print_error "Failed to install Nginx"

    # Create Nginx configuration optimized for 16 vCPUs
    print_status "Configuring Nginx for 16 vCPU server..."
    cat > /etc/nginx/sites-available/sovereign-command-center << 'EOF'
# Sovereign Command Center Nginx Configuration for 16 vCPU Server
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

    # Gzip compression optimized for 16 vCPUs
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

    # Rate limiting optimized for 16 vCPUs
    limit_req_zone $binary_remote_addr zone=api:10m rate=20r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=2r/s;

    # Static file caching optimized for 16 vCPUs
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

    # API proxy optimized for 16 vCPUs
    location /api/ {
        limit_req zone=api burst=40 nodelay;
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

    # WebSocket proxy optimized for 16 vCPUs
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

    # Main application optimized for 16 vCPUs
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
    ln -sf /etc/nginx/sites-available/sovereign-command-center /etc/nginx/sites-enabled/ || print_error "Failed to enable Nginx site"
    rm -f /etc/nginx/sites-enabled/default # Remove default Nginx site

    # Test and restart Nginx
    nginx -t || print_error "Nginx configuration test failed"
    systemctl restart nginx || print_error "Failed to restart Nginx"
    systemctl enable nginx || print_error "Failed to enable Nginx"

    print_success "Nginx installed and configured successfully for 16 vCPU server"
}

# Function to create application directories
create_directories() {
    print_status "Creating application directories..."

    # Create application directory
    mkdir -p $APP_DIR || print_error "Failed to create app directory"
    mkdir -p $LOG_DIR || print_error "Failed to create log directory"
    mkdir -p $UPLOAD_DIR || print_error "Failed to create upload directory"
    mkdir -p $BACKUP_DIR || print_error "Failed to create backup directory"

    # Set permissions
    chown -R www-data:www-data $APP_DIR || print_error "Failed to set app directory ownership"
    chown -R www-data:www-data $LOG_DIR || print_error "Failed to set log directory ownership"
    chown -R www-data:www-data $UPLOAD_DIR || print_error "Failed to set upload directory ownership"
    chown -R www-data:www-data $BACKUP_DIR || print_error "Failed to set backup directory ownership"

    chmod 755 $APP_DIR || print_error "Failed to set app directory permissions"
    chmod 755 $LOG_DIR || print_error "Failed to set log directory permissions"
    chmod 755 $UPLOAD_DIR || print_error "Failed to set upload directory permissions"
    chmod 755 $BACKUP_DIR || print_error "Failed to set backup directory permissions"

    print_success "Directories created successfully"
}

# Function to deploy application
deploy_application() {
    print_status "Deploying Sovereign Command Center on Dedicated CPU server..."

    # Navigate to application directory
    cd $APP_DIR || print_error "Failed to change to app directory"

    # Clone repository if not exists
    if [ ! -d ".git" ]; then
        print_status "Cloning repository..."
        git clone https://github.com/covren-firm/sovereign-command-center.git . || print_error "Failed to clone repository"
    else
        print_status "Pulling latest changes..."
        git pull origin main || print_error "Failed to pull latest changes"
    fi

    # Install dependencies
    print_status "Installing Node.js dependencies..."
    npm ci --production || print_error "Failed to install Node.js dependencies"

    # Build application
    print_status "Building application..."
    npm run build || print_error "Failed to build application"

    # Apply database schema
    print_status "Applying database schema..."
    psql -h localhost -U sovren_user -d sovereign_command_center -f database-schema.sql || print_error "Failed to apply database schema"

    print_success "Application deployed successfully on Dedicated CPU server"
}

# Function to configure PM2 optimized for 16 vCPUs
configure_pm2() {
    print_status "Configuring PM2 for 16 vCPU server..."

    # Start application with PM2 optimized for 16 vCPUs
    cd $APP_DIR || print_error "Failed to change to app directory for PM2"
    pm2 start ecosystem.config.js --env production || print_error "Failed to start application with PM2"

    # Save PM2 configuration
    pm2 save || print_error "Failed to save PM2 configuration"

    # Setup PM2 startup script
    pm2 startup || print_error "Failed to setup PM2 startup script"

    print_success "PM2 configured successfully for 16 vCPU server"
}

# Function to setup SSL certificates
setup_ssl() {
    print_status "Setting up SSL certificates..."

    # Install Certbot
    apt install -y certbot python3-certbot-nginx || print_error "Failed to install Certbot"

    # Obtain SSL certificates
    certbot --nginx -d client.covrenfirm.com -d portal.covrenfirm.com --non-interactive --agree-tos --email admin@covrenfirm.com || print_error "Failed to obtain SSL certificates"

    # Setup auto-renewal
    (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab - || print_error "Failed to setup Certbot auto-renewal"

    print_success "SSL certificates configured successfully"
}

# Function to setup monitoring optimized for 32GB RAM
setup_monitoring() {
    print_status "Setting up monitoring for 32GB RAM server..."

    # Install monitoring tools
    apt install -y htop iotop nethogs sysstat || print_error "Failed to install monitoring tools"

    # Setup log rotation optimized for 32GB RAM
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

    # Setup backup script optimized for 32GB RAM
    cat > /opt/backup.sh << 'EOF'
#!/bin/bash
# Sovereign Command Center Backup Script for 32GB RAM Server

BACKUP_DIR="/opt/backups"
APP_DIR="/var/www/sovereign-command-center"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database optimized for 32GB RAM
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
    chmod +x /opt/backup.sh || print_error "Failed to make backup script executable"

    # Setup daily backup cron job
    (crontab -l 2>/dev/null; echo "0 2 * * * /opt/backup.sh") | crontab - || print_error "Failed to setup daily backup cron job"

    print_success "Monitoring configured successfully for 32GB RAM server"
}

# Function to setup firewall
setup_firewall() {
    print_status "Setting up firewall..."

    # Install UFW if not present
    apt install -y ufw || print_error "Failed to install UFW"

    # Configure firewall
    ufw default deny incoming || print_error "Failed to set UFW default deny"
    ufw default allow outgoing || print_error "Failed to set UFW default allow outgoing"

    # Allow SSH
    ufw allow ssh || print_error "Failed to allow SSH"

    # Allow HTTP and HTTPS
    ufw allow 80 || print_error "Failed to allow HTTP"
    ufw allow 443 || print_error "Failed to allow HTTPS"

    # Enable firewall
    ufw --force enable || print_error "Failed to enable UFW"

    print_success "Firewall configured successfully"
}

# Function to verify deployment
verify_deployment() {
    print_status "Verifying deployment on Dedicated CPU server..."

    # Check if services are running
    if systemctl is-active --quiet nginx; then
        print_success "Nginx is running"
    else
        print_error "Nginx is not running"
    fi

    if systemctl is-active --quiet postgresql; then
        print_success "PostgreSQL is running"
    else
        print_error "PostgreSQL is not running"
    fi

    if systemctl is-active --quiet redis; then
        print_success "Redis is running"
    else
        print_error "Redis is not running"
    fi

    # Check PM2 processes
    if pm2 list | grep -q "sovereign-command-center"; then
        print_success "PM2 processes are running"
    else
        print_error "PM2 processes are not running"
    fi

    # Test application health
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        print_success "Application health check passed"
    else
        print_error "Application health check failed"
    fi

    print_success "Deployment verification completed successfully on Dedicated CPU server"
}

# Main deployment function
main() {
    print_status "Starting Sovereign Command Center deployment on Dedicated CPU server..."
    print_status "Server Specifications: 16 vCPU, 32GB RAM, 300GB Storage"
    print_status "Deployment Type: BARE METAL (NO CONTAINERS, NO DOCKER, NO VIRTUAL ENVIRONMENTS)"

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

    print_success "🎉 Sovereign Command Center deployment completed successfully on Dedicated CPU server!"
    print_status "🌐 Application URL: https://client.covrenfirm.com"
    print_status "📊 Health Check: https://client.covrenfirm.com/health"
    print_status "📈 Metrics: https://client.covrenfirm.com/metrics"
    print_status "📝 Logs: /var/log/pm2/"
    print_status "💾 Backups: /opt/backups/"
    print_status "🔧 PM2 Commands: pm2 monit, pm2 logs, pm2 restart"
    print_status "🚀 Server: 16 vCPU, 32GB RAM, 300GB Storage - OPTIMIZED FOR EXCELLENCE!"
}

# Run main function
main "$@" 