# Comprehensive Backup Guide for Covren Client Portal

## Current Situation
- **Server**: Ubuntu server at 131.153.165.103
- **Local**: Windows machine with workspace files
- **GitHub**: https://github.com/adminCovern/Covren-ClientPortal.git

## Step 1: Backup Server Files (Run on Ubuntu server)

```bash
# On your Ubuntu server (131.153.165.103)
cd /var/www/client-portal

# Create backup directory
mkdir -p /tmp/covren-backup
cp -r * /tmp/covren-backup/

# Initialize Git
git init
git add .
git commit -m "Server backup: $(date '+%Y-%m-%d %H:%M:%S')"

# Add remote and push
git remote add origin https://github.com/adminCovern/Covren-ClientPortal.git
git push -u origin main
```

## Step 2: Backup Local Files (Run on Windows machine)

```powershell
# On your Windows machine
cd "C:\Users\brian\OneDrive - Covren Firm\Desktop\Covren-firm-client-portal"

# Initialize Git
git init
git add .
git commit -m "Local workspace backup: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"

# Add remote and push
git remote add origin https://github.com/adminCovern/Covren-ClientPortal.git
git push -u origin main
```

## Step 3: Create Combined Backup

After both backups are done, create a comprehensive backup that includes:

### Server Files to Include:
- `/var/www/client-portal/app/` - Application files
- `/var/www/client-portal/database-schema-standalone.sql` - Database schema
- `/var/www/client-portal/setup-database.sh` - Database setup script
- `/var/www/client-portal/deploy-app.sh` - Deployment script
- Server configuration files

### Local Files to Include:
- All workspace files
- Documentation
- Configuration files
- Development files

## Step 4: Verify Backup

Check the GitHub repository at: https://github.com/adminCovern/Covren-ClientPortal.git

## Step 5: Post-Backup Actions

1. **Comprehensive Review**
   - Fix all API endpoints
   - Implement missing features
   - Resolve JavaScript errors
   - Add proper error handling

2. **Feature Implementation**
   - Project creation functionality
   - Document upload system
   - Messaging system
   - User management

3. **Production Readiness**
   - SSL/HTTPS setup
   - Security hardening
   - Monitoring and logging
   - Backup procedures

---

**Important**: Run the server backup commands on your Ubuntu server, and the local backup commands on your Windows machine. 