# Sovereign Command Center - Production Deployment Guide

## Overview

This document provides comprehensive instructions for deploying the Sovereign Command Center to production environments. The application is designed for bare metal deployment without containers or virtual environments.

## Prerequisites

### System Requirements

- **Operating System**: Ubuntu 22.04 LTS or CentOS 8+
- **CPU**: 4+ cores (2.4 GHz or higher)
- **RAM**: 16GB minimum, 32GB recommended
- **Storage**: 100GB+ SSD with high IOPS
- **Network**: 1Gbps+ connection with static IP
- **Python**: 3.12+ (required, no downgrades permitted)

### Software Dependencies

```bash
# System packages
sudo apt update
sudo apt install -y python3.12 python3.12-venv python3.12-dev
sudo apt install -y nginx postgresql postgresql-contrib
sudo apt install -y redis-server supervisor
sudo apt install -y git curl wget unzip
sudo apt install -y build-essential libssl-dev libffi-dev

# Node.js 18+ for frontend build
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2 for process management
sudo npm install -g pm2
```

## Database Setup

### PostgreSQL Configuration

```bash
# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql -c "CREATE DATABASE sovereign_command_center;"
sudo -u postgres psql -c "CREATE USER sovren_user WITH PASSWORD 'secure_password_here';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE sovereign_command_center TO sovren_user;"

# Apply database schema
psql -h localhost -U sovren_user -d sovereign_command_center -f database-schema.sql
```

### Redis Configuration

```bash
# Install Redis
sudo apt install -y redis-server

# Configure Redis for production
sudo nano /etc/redis/redis.conf

# Add/modify these settings:
# bind 127.0.0.1
# requirepass your_redis_password_here
# maxmemory 2gb
# maxmemory-policy allkeys-lru

# Restart Redis
sudo systemctl restart redis
sudo systemctl enable redis
```

## Application Setup

### 1. Clone and Configure Repository

```bash
# Clone the repository
git clone https://github.com/covren-firm/sovereign-command-center.git
cd sovereign-command-center

# Create production configuration
cp .env.example .env.production
nano .env.production
```

### 2. Environment Configuration

```bash
# Production environment variables
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://sovren_user:secure_password_here@localhost:5432/sovereign_command_center
REDIS_URL=redis://:your_redis_password_here@localhost:6379
SUPABASE_URL=https://flyflafbdqhdhgxngahz.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZseWZsYWZiZHFoZGhneG5nYWh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyMzMzMzAsImV4cCI6MjA2ODgwOTMzMH0.pRpNyNwr6AQRg3eHA5XDgxJwhGZXwlakVx7in9ciOms
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
JWT_SECRET=your_jwt_secret_here
SESSION_SECRET=your_session_secret_here
CORS_ORIGIN=https://your-domain.com
```

### 3. Install Dependencies

```bash
# Install Node.js dependencies
npm ci --production

# Build the application
npm run build

# Verify build
npm run test
```

## Security Configuration

### 1. SSL/TLS Setup

```bash
# Install Certbot for Let's Encrypt
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 2. Firewall Configuration

```bash
# Configure UFW firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable
```

### 3. Security Headers

```nginx
# Add to nginx configuration
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" always;
```

## Nginx Configuration

### 1. Create Nginx Site Configuration

```bash
sudo nano /etc/nginx/sites-available/sovereign-command-center
```

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Security Headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" always;

    # Root directory
    root /var/www/sovereign-command-center/dist;
    index index.html;

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

    # Static file caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API proxy
    location /api/ {
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
    }

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

### 2. Enable Site

```bash
sudo ln -s /etc/nginx/sites-available/sovereign-command-center /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Process Management with PM2

### 1. Create PM2 Configuration

```bash
# Create ecosystem file
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'sovereign-command-center',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/pm2/sovereign-command-center-error.log',
    out_file: '/var/log/pm2/sovereign-command-center-out.log',
    log_file: '/var/log/pm2/sovereign-command-center-combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024',
    watch: false,
    ignore_watch: ['node_modules', 'logs'],
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
```

### 2. Start Application

```bash
# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup

# Monitor application
pm2 monit
```

## Monitoring and Logging

### 1. Log Rotation

```bash
# Create logrotate configuration
sudo nano /etc/logrotate.d/sovereign-command-center
```

```
/var/log/pm2/*.log {
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
```

### 2. System Monitoring

```bash
# Install monitoring tools
sudo apt install -y htop iotop nethogs

# Setup monitoring dashboard
pm2 install pm2-server-monit
```

## Backup Strategy

### 1. Database Backup

```bash
# Create backup script
nano /opt/backup-database.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="sovereign_command_center"
DB_USER="sovren_user"

# Create backup directory
mkdir -p $BACKUP_DIR

# Create database backup
pg_dump -h localhost -U $DB_USER $DB_NAME > $BACKUP_DIR/db_backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/db_backup_$DATE.sql

# Remove backups older than 30 days
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +30 -delete

echo "Database backup completed: db_backup_$DATE.sql.gz"
```

```bash
# Make executable and setup cron
chmod +x /opt/backup-database.sh
crontab -e
# Add: 0 2 * * * /opt/backup-database.sh
```

### 2. Application Backup

```bash
# Create application backup script
nano /opt/backup-application.sh
```

```bash
#!/bin/bash
APP_DIR="/var/www/sovereign-command-center"
BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup
tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz -C $APP_DIR .

# Remove backups older than 7 days
find $BACKUP_DIR -name "app_backup_*.tar.gz" -mtime +7 -delete

echo "Application backup completed: app_backup_$DATE.tar.gz"
```

## Deployment Checklist

### Pre-Deployment

- [ ] All tests passing (`npm test`)
- [ ] Security audit completed (`npm audit`)
- [ ] Environment variables configured
- [ ] Database schema applied
- [ ] SSL certificates obtained
- [ ] Firewall configured
- [ ] Backup strategy implemented

### Deployment

- [ ] Application built (`npm run build`)
- [ ] PM2 processes started
- [ ] Nginx configuration applied
- [ ] SSL certificates installed
- [ ] Health checks passing
- [ ] Monitoring configured

### Post-Deployment

- [ ] Application accessible via HTTPS
- [ ] Real-time features working
- [ ] File uploads functional
- [ ] Database connections stable
- [ ] Logs being generated
- [ ] Backups running
- [ ] Performance monitoring active

## Troubleshooting

### Common Issues

1. **Port 3000 already in use**
   ```bash
   sudo lsof -i :3000
   sudo kill -9 <PID>
   ```

2. **Database connection failed**
   ```bash
   sudo systemctl status postgresql
   sudo -u postgres psql -c "\l"
   ```

3. **Nginx configuration error**
   ```bash
   sudo nginx -t
   sudo systemctl status nginx
   ```

4. **PM2 process not starting**
   ```bash
   pm2 logs sovereign-command-center
   pm2 restart sovereign-command-center
   ```

### Performance Optimization

1. **Enable Nginx caching**
2. **Optimize database queries**
3. **Implement CDN for static assets**
4. **Enable compression**
5. **Monitor memory usage**

## Security Hardening

1. **Regular security updates**
2. **Database access restrictions**
3. **File permissions hardening**
4. **Network security monitoring**
5. **Audit log review**

## Maintenance

### Weekly Tasks

- [ ] Review application logs
- [ ] Check backup status
- [ ] Monitor disk space
- [ ] Update security patches
- [ ] Performance review

### Monthly Tasks

- [ ] Security audit
- [ ] Database optimization
- [ ] SSL certificate renewal
- [ ] System updates
- [ ] Backup restoration test

## Support

For deployment support, contact:
- **Email**: support@covrenfirm.com
- **Documentation**: https://docs.covrenfirm.com
- **Issues**: https://github.com/covren-firm/sovereign-command-center/issues

---

**Last Updated**: January 2024
**Version**: 1.0.0
**Author**: Covren Firm LLC 