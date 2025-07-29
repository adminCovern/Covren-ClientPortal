#!/bin/bash

# Database Setup Script for Covren Firm Client Portal
# Run this script on your Ubuntu server

echo "Setting up Sovereign Command Center database..."

# Check if we're running as root or with sudo
if [ "$EUID" -ne 0 ]; then
    echo "Please run this script with sudo"
    exit 1
fi

# Check if PostgreSQL is running
if ! systemctl is-active --quiet postgresql; then
    echo "PostgreSQL is not running. Starting PostgreSQL..."
    systemctl start postgresql
    systemctl enable postgresql
fi

# Create the database if it doesn't exist
echo "Creating database if it doesn't exist..."
sudo -u postgres createdb sovereign_command_center 2>/dev/null || echo "Database already exists"

# Apply the schema
echo "Applying database schema..."
SCHEMA_FILE="/var/www/client-portal/database-schema-standalone.sql"
if [ ! -f "$SCHEMA_FILE" ]; then
    SCHEMA_FILE="$(dirname "$0")/database-schema-standalone.sql"
fi

if [ -f "$SCHEMA_FILE" ]; then
    sudo -u postgres psql -d sovereign_command_center -f "$SCHEMA_FILE"
    echo "Database schema applied successfully!"
    
    echo "Verifying Row-Level Security setup..."
    sudo -u postgres psql -d sovereign_command_center -c "
        SELECT schemaname, tablename, rowsecurity 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND rowsecurity = true;
    "
    
    echo "RLS verification complete!"
else
    echo "Schema file not found at $SCHEMA_FILE"
    echo "Please upload the schema file to the server first."
    exit 1
fi

# Verify the setup
echo "Verifying database setup..."
sudo -u postgres psql -d sovereign_command_center -c "\dt"

echo "Database setup complete!"
echo ""
echo "Default admin credentials:"
echo "Email: admin@covrenfirm.com"
echo "Password: admin123"
echo ""
echo "Please change the default password after first login!"
