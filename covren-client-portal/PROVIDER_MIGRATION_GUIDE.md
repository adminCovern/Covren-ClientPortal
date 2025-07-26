# Provider Migration Guide for Covren Firm

## Overview

Since DigitalOcean doesn't offer droplets larger than 8GB RAM, this guide provides migration strategies to alternative providers that meet the 16GB RAM minimum requirement for dual-application deployment.

## Recommended Providers

### 1. Linode (Akamai) - Primary Recommendation
```
16GB RAM Droplet:
- RAM: 16 GB
- CPU: 4 vCPUs
- Storage: 320 GB NVMe SSD
- Transfer: 5 TB
- Cost: $96/month
- Locations: Newark, Atlanta, Dallas, Frankfurt, London, Singapore, Tokyo

32GB RAM Droplet:
- RAM: 32 GB
- CPU: 8 vCPUs
- Storage: 640 GB NVMe SSD
- Transfer: 8 TB
- Cost: $192/month

Migration Benefits:
✅ Simple pricing structure
✅ Excellent documentation
✅ Great support for non-technical users
✅ Reliable infrastructure
✅ Easy migration from DigitalOcean
```

### 2. Vultr - Best Value Option
```
16GB RAM Instance:
- RAM: 16 GB
- CPU: 4 vCPUs
- Storage: 400 GB NVMe SSD
- Transfer: 6 TB
- Cost: $80/month
- Locations: 17 global locations

32GB RAM Instance:
- RAM: 32 GB
- CPU: 8 vCPUs
- Storage: 800 GB NVMe SSD
- Transfer: 10 TB
- Cost: $160/month

Migration Benefits:
✅ 20% lower cost than Linode
✅ High performance
✅ Global locations
✅ Simple interface
✅ Good support
```

## Migration Process

### Phase 1: Pre-Migration Preparation

#### 1. Backup Current Data
```bash
# Backup database
pg_dump -h localhost -U postgres your_database > backup.sql

# Backup application files
tar -czf app_backup.tar.gz /var/www/your-app/

# Backup configuration files
tar -czf config_backup.tar.gz /etc/nginx/ /etc/postgresql/ /etc/redis/
```

#### 2. Document Current Configuration
```bash
# Document current setup
cat > current_config.txt << EOF
Server Specifications:
- Provider: DigitalOcean
- RAM: 8 GB
- CPU: 2 cores
- Storage: 160 GB
- Transfer: 5 TB

Applications:
- Client Portal: Port 3000
- CRM: Port 3001 (planned)
- Database: PostgreSQL on port 5432
- Cache: Redis on port 6379
- Web Server: Nginx on port 80/443

Environment Variables:
- NODE_ENV=production
- DATABASE_URL=postgresql://...
- REDIS_URL=redis://...
EOF
```

#### 3. Choose Target Provider
```
Decision Matrix:
- Budget Priority: Vultr ($80/month)
- Support Priority: Linode ($96/month)
- Enterprise Priority: AWS ($140/month)
- European Priority: Hetzner ($70/month)
```

### Phase 2: Provider Setup

#### Linode Setup Process
```bash
# 1. Create Linode account
# 2. Create new droplet
linode-cli linodes create \
  --type g6-standard-4 \
  --region us-east \
  --image ubuntu-22.04 \
  --root-pass your_secure_password

# 3. Configure firewall
linode-cli firewalls create \
  --label production-firewall \
  --rules.outbound_policy ACCEPT \
  --rules.inbound_policy DROP

# 4. Add firewall rules
linode-cli firewalls rules create \
  --firewall_id your_firewall_id \
  --protocol TCP \
  --ports 22,80,443 \
  --addresses 0.0.0.0/0
```

#### Vultr Setup Process
```bash
# 1. Create Vultr account
# 2. Deploy new instance
vultr-cli instance create \
  --region ewr \
  --plan vc2-4c-16gb \
  --os 387 \
  --label covren-production

# 3. Configure firewall
vultr-cli firewall create \
  --description "Production Firewall" \
  --rules '[{"protocol":"tcp","subnet":"0.0.0.0","subnet_size":0,"port":"22"},{"protocol":"tcp","subnet":"0.0.0.0","subnet_size":0,"port":"80"},{"protocol":"tcp","subnet":"0.0.0.0","subnet_size":0,"port":"443"}]'
```

### Phase 3: Application Migration

#### 1. Server Preparation
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y \
  python3.12 \
  python3.12-venv \
  python3.12-dev \
  nginx \
  postgresql \
  postgresql-contrib \
  redis-server \
  supervisor \
  git \
  curl \
  wget \
  unzip \
  build-essential \
  libssl-dev \
  libffi-dev

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2
```

#### 2. Database Migration
```bash
# Install PostgreSQL client
sudo apt install -y postgresql-client

# Restore database
psql -h localhost -U postgres -d your_database < backup.sql

# Verify data integrity
psql -h localhost -U postgres -d your_database -c "SELECT COUNT(*) FROM your_table;"
```

#### 3. Application Deployment
```bash
# Clone application
git clone https://github.com/covren-firm/client-portal.git /var/www/client-portal
cd /var/www/client-portal

# Install dependencies
npm ci --production

# Build application
npm run build

# Configure PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### 4. Nginx Configuration
```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/covren-apps

# Enable site
sudo ln -s /etc/nginx/sites-available/covren-apps /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Phase 4: DNS and SSL Setup

#### 1. Update DNS Records
```bash
# Update A records for your domains
# client.covrenfirm.com -> New server IP
# crm.covrenfirm.com -> New server IP
```

#### 2. SSL Certificate Setup
```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificates
sudo certbot --nginx -d client.covrenfirm.com
sudo certbot --nginx -d crm.covrenfirm.com

# Setup auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Phase 5: Testing and Validation

#### 1. Application Testing
```bash
# Test client portal
curl -I https://client.covrenfirm.com

# Test database connections
psql -h localhost -U postgres -d your_database -c "SELECT version();"

# Test Redis
redis-cli ping

# Test PM2 processes
pm2 status
pm2 logs
```

#### 2. Performance Testing
```bash
# Monitor resource usage
htop
free -h
df -h

# Test application performance
ab -n 1000 -c 10 https://client.covrenfirm.com/
```

#### 3. Security Testing
```bash
# Test firewall
nmap -p 22,80,443 your_server_ip

# Test SSL configuration
curl -I https://client.covrenfirm.com

# Check security headers
curl -I https://client.covrenfirm.com | grep -i security
```

## Provider-Specific Configurations

### Linode Optimizations
```bash
# Linode-specific optimizations
echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf
echo 'vm.vfs_cache_pressure=50' | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# Enable Linode backups
linode-cli linodes backup-enable your_linode_id
```

### Vultr Optimizations
```bash
# Vultr-specific optimizations
echo 'net.core.rmem_max=134217728' | sudo tee -a /etc/sysctl.conf
echo 'net.core.wmem_max=134217728' | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# Enable Vultr backups
vultr-cli backup create --instance-id your_instance_id
```

## Cost Comparison

### Monthly Costs (16GB RAM)
| Provider | Cost | Storage | Transfer | Support |
|----------|------|---------|----------|---------|
| **Vultr** | $80 | 400 GB | 6 TB | Good |
| **Linode** | $96 | 320 GB | 5 TB | Excellent |
| **Hetzner** | $70 | 160 GB | 20 TB | Good |
| **AWS** | $140 | EBS | 5 GB | Excellent |
| **GCP** | $120 | PD | 1 TB | Good |

### Monthly Costs (32GB RAM)
| Provider | Cost | Storage | Transfer | Support |
|----------|------|---------|----------|---------|
| **Vultr** | $160 | 800 GB | 10 TB | Good |
| **Linode** | $192 | 640 GB | 8 TB | Excellent |
| **Hetzner** | $140 | 360 GB | 20 TB | Good |
| **AWS** | $280 | EBS | 5 GB | Excellent |
| **GCP** | $240 | PD | 1 TB | Good |

## Migration Timeline

### Week 1: Preparation
- [ ] Choose target provider
- [ ] Create new account
- [ ] Backup current data
- [ ] Document configuration

### Week 2: Setup
- [ ] Deploy new server
- [ ] Install required software
- [ ] Configure security
- [ ] Setup monitoring

### Week 3: Migration
- [ ] Deploy applications
- [ ] Migrate database
- [ ] Configure Nginx
- [ ] Setup SSL certificates

### Week 4: Testing
- [ ] Test all functionality
- [ ] Performance testing
- [ ] Security validation
- [ ] Update DNS records

### Week 5: Go-Live
- [ ] Switch traffic to new server
- [ ] Monitor performance
- [ ] Decommission old server
- [ ] Update documentation

## Risk Mitigation

### Backup Strategy
```bash
# Automated backups
#!/bin/bash
# Daily database backup
pg_dump -h localhost -U postgres your_database | gzip > /backups/db_$(date +%Y%m%d).sql.gz

# Weekly application backup
tar -czf /backups/app_$(date +%Y%m%d).tar.gz /var/www/

# Monthly full backup
tar -czf /backups/full_$(date +%Y%m%d).tar.gz /var/www/ /etc/ /backups/
```

### Rollback Plan
```bash
# If migration fails, rollback to DigitalOcean
# 1. Restore DNS to old server
# 2. Verify old server is running
# 3. Test all functionality
# 4. Document issues for next attempt
```

## Support Resources

### Linode Support
- **Documentation**: https://www.linode.com/docs/
- **Community**: https://www.linode.com/community/
- **Support**: 24/7 ticket system
- **Phone**: Available on higher plans

### Vultr Support
- **Documentation**: https://www.vultr.com/docs/
- **Community**: https://www.vultr.com/community/
- **Support**: 24/7 ticket system
- **Live Chat**: Available

## Final Recommendation

### For Covren Firm: **Linode**
```
Reasoning:
✅ Excellent documentation for non-technical users
✅ Great support for migration assistance
✅ Simple pricing structure
✅ Reliable infrastructure
✅ Good for production applications

Migration Steps:
1. Create Linode account
2. Deploy 16GB droplet
3. Follow migration guide
4. Test thoroughly
5. Switch DNS when ready
```

### Alternative: **Vultr** (if budget is priority)
```
Reasoning:
✅ 20% lower cost
✅ High performance
✅ Simple interface
✅ Good support

Migration Steps:
1. Create Vultr account
2. Deploy 16GB instance
3. Follow migration guide
4. Test thoroughly
5. Switch DNS when ready
```

---

**Next Steps:**
1. Choose your preferred provider
2. Create account and deploy new server
3. Follow the migration guide step-by-step
4. Test everything thoroughly before switching DNS
5. Monitor performance after migration 