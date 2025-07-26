#!/bin/bash

# Covren Client Portal - GitHub Backup Script
echo "Backing up Covren Client Portal workspace to GitHub..."

# Check if we're in the right directory
if [ ! -f "package.json" ] && [ ! -f "covren-client-portal/package.json" ]; then
    echo "Error: Please run this script from the Covren-firm-client-portal directory"
    exit 1
fi

# Initialize Git if not already done
if [ ! -d ".git" ]; then
    echo "Initializing Git repository..."
    git init
fi

# Add all files
echo "Adding all files to Git..."
git add .

# Create commit with timestamp
echo "Creating commit..."
git commit -m "Backup: $(date '+%Y-%m-%d %H:%M:%S') - Complete workspace backup

- Database schema and setup scripts
- Server deployment configuration
- Client portal application
- Documentation and guides
- All configuration files"

# Add remote if not exists
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "Adding GitHub remote..."
    git remote add origin https://github.com/adminCovern/Covren-ClientPortal.git
fi

# Push to GitHub
echo "Pushing to GitHub..."
git push -u origin main

echo "Backup completed successfully!"
echo "Repository: https://github.com/adminCovern/Covren-ClientPortal.git" 