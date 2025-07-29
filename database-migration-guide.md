# Database Migration Guide

## Overview
This guide explains the database schema setup for the Sovereign Command Center, including Row-Level Security (RLS) implementation.

## Database Schema Features

### Core Tables
- `users` - User management with authentication
- `user_sessions` - Session management for authentication
- `projects` - Project management
- `project_users` - Role-based access control for projects
- `documents` - Secure document management
- `messages` - Real-time messaging system
- `message_recipients` - Message read receipts
- `notifications` - System notifications
- `user_profiles` - Extended user information
- `activity_logs` - Audit trail

### Security Features

#### Row-Level Security (RLS)
All tables have RLS enabled with policies that ensure:
- Users can only access their own data
- Project access is restricted to members
- Document access follows project permissions
- Messages are only visible to project members
- Activity logs respect project access rights

#### Session-Based Authentication
The system uses a session-based authentication approach:
- `current_user_id()` function retrieves the current user from session context
- `set_current_session()` function sets the session token for RLS policies
- Session tokens are validated against the `user_sessions` table

### Performance Optimizations
- Comprehensive indexes on frequently queried columns
- Full-text search indexes for projects, documents, and messages
- Optimized foreign key relationships

### Audit Trail
- Automatic `updated_at` timestamp triggers
- Activity logging for all major operations
- Complete audit trail for compliance

## Setup Instructions

1. **Run the setup script:**
   ```bash
   sudo ./setup-database.sh
   ```

2. **Verify the installation:**
   ```bash
   sudo -u postgres psql -d sovereign_command_center -c "\dt"
   ```

3. **Check RLS status:**
   ```bash
   sudo -u postgres psql -d sovereign_command_center -c "
   SELECT schemaname, tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public' 
   AND rowsecurity = true;"
   ```

## Usage with Applications

### Setting Session Context
Before executing queries, set the session token:
```sql
SELECT set_current_session('your_session_token_here');
```

### Verifying Current User
Check the current user context:
```sql
SELECT current_user_id();
```

### Example Query Flow
```sql
-- Set session
SELECT set_current_session('abc123...');

-- Query will now respect RLS policies
SELECT * FROM projects;
```

## Security Considerations

1. **Session Management**: Always validate session tokens before setting context
2. **RLS Bypass**: Only use SECURITY DEFINER functions when necessary
3. **Audit Logging**: All operations are logged for security compliance
4. **Data Isolation**: Users can only access data they have explicit permissions for

## Troubleshooting

### Common Issues
1. **RLS Policy Violations**: Check that session is properly set
2. **Permission Denied**: Verify user has appropriate project membership
3. **Function Not Found**: Ensure all functions are created during schema setup

### Debug Queries
```sql
-- Check current session
SELECT current_setting('app.current_session_token', true);

-- Verify user session
SELECT * FROM user_sessions WHERE session_token = 'your_token';

-- Check project membership
SELECT * FROM project_users WHERE user_id = current_user_id();
```
