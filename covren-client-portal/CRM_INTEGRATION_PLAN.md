# CRM Integration Plan for Covren Firm Server

## Server Specifications Analysis
- **RAM**: 8 GB total
- **CPU**: 2 Intel CPUs
- **Storage**: 160 GB NVMe SSDs
- **Transfer**: 5 TB monthly

## Current Client Portal Resource Usage
- **RAM**: ~2-3 GB (React app + Node.js + PostgreSQL + Redis)
- **Storage**: ~10-20 GB (application + database + logs)
- **CPU**: 1-2 cores
- **Transfer**: Minimal for client portal traffic

## Available Resources for CRM
- **Remaining RAM**: ~5-6 GB available
- **Remaining Storage**: ~140 GB available
- **Remaining CPU**: 1-2 cores available
- **Transfer**: 5 TB is substantial for both applications

## Recommended Architecture

### Option 1: Shared Infrastructure (Recommended)
```
Server (8GB RAM, 2 CPUs, 160GB SSD)
├── Client Portal (2-3GB RAM, 1 CPU)
│   ├── React Frontend
│   ├── Node.js API
│   ├── PostgreSQL Database
│   └── Redis Cache
└── Custom CRM (3-4GB RAM, 1 CPU)
    ├── React/Vue/Angular Frontend
    ├── Node.js/Python API
    ├── Shared PostgreSQL Database
    └── Shared Redis Cache
```

### Option 2: Separate Databases
```
Server (8GB RAM, 2 CPUs, 160GB SSD)
├── Client Portal (2-3GB RAM, 1 CPU)
│   ├── React Frontend
│   ├── Node.js API
│   ├── PostgreSQL (client_portal_db)
│   └── Redis Cache
└── Custom CRM (3-4GB RAM, 1 CPU)
    ├── React/Vue/Angular Frontend
    ├── Node.js/Python API
    ├── PostgreSQL (crm_db)
    └── Redis Cache
```

## Resource Allocation Strategy

### Memory Allocation
- **Client Portal**: 3 GB RAM
- **CRM Application**: 3 GB RAM
- **System/OS**: 2 GB RAM
- **Buffer**: 0 GB (tight allocation)

### CPU Allocation
- **Client Portal**: 1 CPU core
- **CRM Application**: 1 CPU core
- **System processes**: Shared

### Storage Allocation
- **Client Portal**: 20 GB
- **CRM Application**: 40 GB
- **Database**: 60 GB
- **Logs & Backups**: 20 GB
- **System**: 20 GB

## Nginx Configuration for Multiple Apps

### Subdomain Approach (Recommended)
```nginx
# Client Portal - client.covrenfirm.com
server {
    listen 443 ssl http2;
    server_name client.covrenfirm.com;
    
    location / {
        proxy_pass http://localhost:3000;
        # Client portal configuration
    }
}

# CRM - crm.covrenfirm.com
server {
    listen 443 ssl http2;
    server_name crm.covrenfirm.com;
    
    location / {
        proxy_pass http://localhost:3001;
        # CRM configuration
    }
}
```

### Path-based Approach
```nginx
# Single domain with path routing
server {
    listen 443 ssl http2;
    server_name app.covrenfirm.com;
    
    # Client Portal
    location /portal/ {
        proxy_pass http://localhost:3000/;
    }
    
    # CRM
    location /crm/ {
        proxy_pass http://localhost:3001/;
    }
}
```

## Database Strategy

### Option 1: Shared Database (Recommended for small-medium scale)
```sql
-- Shared PostgreSQL instance
-- Separate schemas for each application
CREATE SCHEMA client_portal;
CREATE SCHEMA crm;

-- Client Portal tables in client_portal schema
-- CRM tables in crm schema
```

### Option 2: Separate Databases
```sql
-- Separate PostgreSQL databases
CREATE DATABASE client_portal_db;
CREATE DATABASE crm_db;
```

## PM2 Process Management

### Ecosystem Configuration
```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'client-portal',
      script: 'server.js',
      cwd: '/var/www/client-portal',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        DATABASE_URL: 'postgresql://user:pass@localhost:5432/client_portal_db'
      },
      max_memory_restart: '2G'
    },
    {
      name: 'crm-app',
      script: 'server.js',
      cwd: '/var/www/crm-app',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        DATABASE_URL: 'postgresql://user:pass@localhost:5432/crm_db'
      },
      max_memory_restart: '2G'
    }
  ]
};
```

## Security Considerations

### Database Security
- Separate database users for each application
- Row-level security policies
- Encrypted connections

### Application Security
- Separate API keys and secrets
- Independent authentication systems
- Cross-origin resource sharing (CORS) configuration

## Monitoring and Logging

### Resource Monitoring
```bash
# Monitor both applications
pm2 monit

# Check resource usage
htop
iotop
nethogs
```

### Log Management
```bash
# Separate log directories
/var/log/client-portal/
/var/log/crm-app/

# Log rotation for both apps
sudo nano /etc/logrotate.d/covren-apps
```

## Backup Strategy

### Database Backups
```bash
#!/bin/bash
# Backup both databases
pg_dump client_portal_db > /opt/backups/client_portal_$(date +%Y%m%d).sql
pg_dump crm_db > /opt/backups/crm_$(date +%Y%m%d).sql
```

### Application Backups
```bash
#!/bin/bash
# Backup both applications
tar -czf /opt/backups/client-portal_$(date +%Y%m%d).tar.gz /var/www/client-portal/
tar -czf /opt/backups/crm-app_$(date +%Y%m%d).tar.gz /var/www/crm-app/
```

## Performance Optimization

### Database Optimization
- Separate connection pools for each application
- Query optimization and indexing
- Regular database maintenance

### Caching Strategy
- Redis for session management
- Application-level caching
- CDN for static assets

## Deployment Checklist

### Pre-deployment
- [ ] CRM application completed and tested
- [ ] Database schema designed
- [ ] Nginx configuration prepared
- [ ] SSL certificates for subdomains
- [ ] Resource monitoring setup

### Deployment
- [ ] Deploy CRM application
- [ ] Configure database
- [ ] Update Nginx configuration
- [ ] Setup PM2 processes
- [ ] Configure monitoring

### Post-deployment
- [ ] Test both applications
- [ ] Verify resource usage
- [ ] Setup automated backups
- [ ] Configure alerts
- [ ] Performance testing

## Scaling Considerations

### When to Scale
- **RAM Usage**: > 7 GB consistently
- **CPU Usage**: > 80% consistently
- **Storage**: > 120 GB used
- **Transfer**: > 4 TB monthly

### Scaling Options
1. **Vertical Scaling**: Upgrade server specs
2. **Horizontal Scaling**: Add additional servers
3. **Database Scaling**: Separate database server
4. **CDN Integration**: Reduce server load

## Cost Optimization

### Current Server Cost
- Estimated monthly cost: $40-80
- Cost per application: $20-40 each

### Alternative Options
- **Shared Hosting**: $10-20/month (limited resources)
- **VPS**: $20-40/month (current setup)
- **Cloud Hosting**: $50-200/month (more resources)

## Recommendations

### For Your Current Setup
1. **Start with shared infrastructure** (Option 1)
2. **Use subdomain approach** for clean separation
3. **Monitor resource usage** closely
4. **Plan for vertical scaling** as needed

### Development Priority
1. **Complete CRM development**
2. **Design database schema**
3. **Plan integration points**
4. **Test performance under load**

## Support and Maintenance

### Regular Tasks
- **Weekly**: Resource usage review
- **Monthly**: Performance optimization
- **Quarterly**: Security updates
- **Annually**: Architecture review

### Emergency Procedures
- **High CPU/Memory**: Restart applications
- **Database Issues**: Restore from backup
- **Network Issues**: Check Nginx configuration
- **Security Breach**: Isolate and investigate

---

**Last Updated**: January 2024  
**Author**: Covren Firm LLC  
**Status**: Planning Phase 