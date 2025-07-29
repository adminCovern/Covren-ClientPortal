-- Sovereign Command Center Database Schema - Standalone PostgreSQL
-- Covren Firm LLC - Production Grade with RLS & Security

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table - Core user management
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    reset_password_token VARCHAR(255),
    reset_password_expires TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    role VARCHAR(50) DEFAULT 'client' CHECK (role IN ('admin', 'manager', 'client')),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- User sessions - For authentication
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

-- Projects table - Core asset management
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    client_id UUID REFERENCES users(id) ON DELETE CASCADE,
    budget DECIMAL(15,2),
    deadline DATE,
    tags TEXT[],
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Project users - Role-based access control
CREATE TABLE project_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'viewer' CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
    permissions JSONB DEFAULT '{"can_edit": false, "can_delete": false, "can_invite": false}'::jsonb,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(project_id, user_id)
);

-- Documents table - Secure file management
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    version INTEGER DEFAULT 1,
    is_public BOOLEAN DEFAULT FALSE,
    encryption_key_id UUID,
    checksum VARCHAR(64),
    metadata JSONB DEFAULT '{}'::jsonb,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted'))
);

-- Messages table - Real-time communication
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'system', 'alert')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_edited BOOLEAN DEFAULT FALSE,
    reply_to UUID REFERENCES messages(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Message recipients - For read receipts and notifications
CREATE TABLE message_recipients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    read_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(message_id, user_id)
);

-- Notifications table - System-wide alerts
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error', 'critical')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE,
    action_url TEXT,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- User profiles - Extended user data
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255),
    avatar_url TEXT,
    company VARCHAR(255),
    position VARCHAR(255),
    phone VARCHAR(50),
    preferences JSONB DEFAULT '{"notifications": {"email": true, "push": true, "sms": false}, "theme": "dark", "language": "en"}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity logs - Audit trail
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);
CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_created_at ON projects(created_at);
CREATE INDEX idx_project_users_project_id ON project_users(project_id);
CREATE INDEX idx_project_users_user_id ON project_users(user_id);
CREATE INDEX idx_documents_project_id ON documents(project_id);
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX idx_messages_project_id ON messages(project_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read_at ON notifications(read_at);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_project_id ON activity_logs(project_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);

-- Full-text search indexes
CREATE INDEX idx_projects_search ON projects USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));
CREATE INDEX idx_documents_search ON documents USING gin(to_tsvector('english', name));
CREATE INDEX idx_messages_search ON messages USING gin(to_tsvector('english', content));

-- Triggers for automatic updates

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Activity logging trigger
CREATE OR REPLACE FUNCTION log_activity()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO activity_logs (user_id, project_id, action, resource_type, resource_id, details)
    VALUES (
        COALESCE(current_user_id(), NEW.created_by, OLD.created_by),
        COALESCE(NEW.project_id, OLD.project_id),
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        jsonb_build_object(
            'old', to_jsonb(OLD),
            'new', to_jsonb(NEW)
        )
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

CREATE TRIGGER log_projects_activity AFTER INSERT OR UPDATE OR DELETE ON projects
    FOR EACH ROW EXECUTE FUNCTION log_activity();

CREATE TRIGGER log_documents_activity AFTER INSERT OR UPDATE OR DELETE ON documents
    FOR EACH ROW EXECUTE FUNCTION log_activity();

CREATE TRIGGER log_messages_activity AFTER INSERT OR UPDATE OR DELETE ON messages
    FOR EACH ROW EXECUTE FUNCTION log_activity();

-- Functions for common operations

-- Function to get user's projects with role
CREATE OR REPLACE FUNCTION get_user_projects(user_uuid UUID)
RETURNS TABLE (
    project_id UUID,
    project_name VARCHAR(255),
    project_status VARCHAR(50),
    user_role VARCHAR(50),
    member_count BIGINT,
    document_count BIGINT,
    message_count BIGINT,
    last_activity TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.status,
        pu.role,
        (SELECT COUNT(*) FROM project_users WHERE project_id = p.id),
        (SELECT COUNT(*) FROM documents WHERE project_id = p.id AND status = 'active'),
        (SELECT COUNT(*) FROM messages WHERE project_id = p.id),
        (SELECT MAX(created_at) FROM messages WHERE project_id = p.id)
    FROM projects p
    JOIN project_users pu ON p.id = pu.project_id
    WHERE pu.user_id = user_uuid
    ORDER BY p.updated_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get project statistics
CREATE OR REPLACE FUNCTION get_project_stats(project_uuid UUID)
RETURNS TABLE (
    total_members BIGINT,
    total_documents BIGINT,
    total_messages BIGINT,
    active_documents BIGINT,
    recent_activity TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM project_users WHERE project_id = project_uuid),
        (SELECT COUNT(*) FROM documents WHERE project_id = project_uuid),
        (SELECT COUNT(*) FROM messages WHERE project_id = project_uuid),
        (SELECT COUNT(*) FROM documents WHERE project_id = project_uuid AND status = 'active'),
        (SELECT MAX(created_at) FROM messages WHERE project_id = project_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to authenticate user
CREATE OR REPLACE FUNCTION authenticate_user(user_email VARCHAR, user_password VARCHAR)
RETURNS TABLE (
    user_id UUID,
    email VARCHAR,
    role VARCHAR,
    full_name VARCHAR,
    is_authenticated BOOLEAN
) AS $$
DECLARE
    user_record RECORD;
BEGIN
    SELECT id, email, password_hash, role INTO user_record
    FROM users 
    WHERE email = user_email AND is_active = TRUE;
    
    IF user_record IS NULL THEN
        RETURN QUERY SELECT NULL::UUID, NULL::VARCHAR, NULL::VARCHAR, NULL::VARCHAR, FALSE;
        RETURN;
    END IF;
    
    IF crypt(user_password, user_record.password_hash) = user_record.password_hash THEN
        -- Update last login
        UPDATE users SET last_login = NOW() WHERE id = user_record.id;
        
        RETURN QUERY
        SELECT 
            user_record.id,
            user_record.email,
            user_record.role,
            up.full_name,
            TRUE
        FROM users u
        LEFT JOIN user_profiles up ON u.id = up.id
        WHERE u.id = user_record.id;
    ELSE
        RETURN QUERY SELECT NULL::UUID, NULL::VARCHAR, NULL::VARCHAR, NULL::VARCHAR, FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create session
CREATE OR REPLACE FUNCTION create_user_session(user_uuid UUID, session_token VARCHAR, expires_at TIMESTAMP WITH TIME ZONE)
RETURNS BOOLEAN AS $$
BEGIN
    INSERT INTO user_sessions (user_id, session_token, expires_at)
    VALUES (user_uuid, session_token, expires_at);
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate session
CREATE OR REPLACE FUNCTION validate_session(session_token VARCHAR)
RETURNS TABLE (
    user_id UUID,
    email VARCHAR,
    role VARCHAR,
    is_valid BOOLEAN
) AS $$
DECLARE
    session_record RECORD;
BEGIN
    SELECT us.user_id, u.email, u.role INTO session_record
    FROM user_sessions us
    JOIN users u ON us.user_id = u.id
    WHERE us.session_token = session_token 
    AND us.expires_at > NOW() 
    AND us.is_active = TRUE
    AND u.is_active = TRUE;
    
    IF session_record IS NULL THEN
        RETURN QUERY SELECT NULL::UUID, NULL::VARCHAR, NULL::VARCHAR, FALSE;
    ELSE
        RETURN QUERY SELECT session_record.user_id, session_record.email, session_record.role, TRUE;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default admin user (password: admin123)
INSERT INTO users (email, password_hash, role, email_verified, is_active)
VALUES (
    'admin@covrenfirm.com',
    crypt('admin123', gen_salt('bf')),
    'admin',
    TRUE,
    TRUE
) ON CONFLICT (email) DO NOTHING;

-- Insert admin profile
INSERT INTO user_profiles (id, full_name, company, position)
SELECT 
    id,
    'Admin User',
    'Covren Firm LLC',
    'System Administrator'
FROM users 
WHERE email = 'admin@covrenfirm.com'
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS user_session_context (
    session_id VARCHAR(255) PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Function to get current user ID from session context
CREATE OR REPLACE FUNCTION current_user_id()
RETURNS UUID AS $$
DECLARE
    user_uuid UUID;
    session_token VARCHAR(255);
BEGIN
    session_token := current_setting('app.current_session_token', true);
    
    IF session_token IS NULL OR session_token = '' THEN
        RETURN NULL;
    END IF;
    
    SELECT us.user_id INTO user_uuid
    FROM user_sessions us
    WHERE us.session_token = session_token 
    AND us.expires_at > NOW() 
    AND us.is_active = TRUE;
    
    RETURN user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to set current session
CREATE OR REPLACE FUNCTION set_current_session(session_token VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
    PERFORM set_config('app.current_session_token', session_token, true);
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (id = current_user_id());

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (id = current_user_id());

CREATE POLICY "Users can view their own sessions" ON user_sessions
    FOR SELECT USING (user_id = current_user_id());

CREATE POLICY "Users can manage their own sessions" ON user_sessions
    FOR ALL USING (user_id = current_user_id());

-- Projects RLS Policies
CREATE POLICY "Users can view projects they are members of" ON projects
    FOR SELECT USING (
        current_user_id() IN (
            SELECT user_id FROM project_users WHERE project_id = id
        ) OR created_by = current_user_id() OR client_id = current_user_id()
    );

CREATE POLICY "Project owners and admins can update projects" ON projects
    FOR UPDATE USING (
        current_user_id() IN (
            SELECT user_id FROM project_users 
            WHERE project_id = id AND role IN ('owner', 'admin')
        ) OR created_by = current_user_id()
    );

CREATE POLICY "Project owners can delete projects" ON projects
    FOR DELETE USING (
        current_user_id() IN (
            SELECT user_id FROM project_users 
            WHERE project_id = id AND role = 'owner'
        ) OR created_by = current_user_id()
    );

CREATE POLICY "Authenticated users can create projects" ON projects
    FOR INSERT WITH CHECK (current_user_id() IS NOT NULL);

-- Project Users RLS Policies
CREATE POLICY "Users can view project members" ON project_users
    FOR SELECT USING (
        current_user_id() IN (
            SELECT user_id FROM project_users WHERE project_id = project_users.project_id
        )
    );

CREATE POLICY "Project owners and admins can manage members" ON project_users
    FOR ALL USING (
        current_user_id() IN (
            SELECT user_id FROM project_users 
            WHERE project_id = project_users.project_id AND role IN ('owner', 'admin')
        )
    );

-- Documents RLS Policies
CREATE POLICY "Users can view documents in their projects" ON documents
    FOR SELECT USING (
        current_user_id() IN (
            SELECT user_id FROM project_users WHERE project_id = documents.project_id
        ) OR is_public = true
    );

CREATE POLICY "Project editors and above can upload documents" ON documents
    FOR INSERT WITH CHECK (
        current_user_id() IN (
            SELECT user_id FROM project_users 
            WHERE project_id = documents.project_id AND role IN ('owner', 'admin', 'editor')
        )
    );

CREATE POLICY "Document uploaders and project admins can update documents" ON documents
    FOR UPDATE USING (
        uploaded_by = current_user_id() OR
        current_user_id() IN (
            SELECT user_id FROM project_users 
            WHERE project_id = documents.project_id AND role IN ('owner', 'admin')
        )
    );

-- Messages RLS Policies
CREATE POLICY "Users can view messages in their projects" ON messages
    FOR SELECT USING (
        current_user_id() IN (
            SELECT user_id FROM project_users WHERE project_id = messages.project_id
        )
    );

CREATE POLICY "Project members can send messages" ON messages
    FOR INSERT WITH CHECK (
        current_user_id() IN (
            SELECT user_id FROM project_users WHERE project_id = messages.project_id
        )
    );

CREATE POLICY "Message senders can edit their messages" ON messages
    FOR UPDATE USING (sender_id = current_user_id());

-- Message Recipients RLS Policies
CREATE POLICY "Users can view their message receipts" ON message_recipients
    FOR SELECT USING (user_id = current_user_id());

CREATE POLICY "Users can update their message receipts" ON message_recipients
    FOR UPDATE USING (user_id = current_user_id());

CREATE POLICY "System can create message receipts" ON message_recipients
    FOR INSERT WITH CHECK (true);

-- Notifications RLS Policies
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (user_id = current_user_id());

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (user_id = current_user_id());

CREATE POLICY "System can create notifications" ON notifications
    FOR INSERT WITH CHECK (true);

-- User Profiles RLS Policies
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (id = current_user_id());

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (id = current_user_id());

CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT WITH CHECK (id = current_user_id());

-- Activity Logs RLS Policies
CREATE POLICY "Users can view activity logs for their projects" ON activity_logs
    FOR SELECT USING (
        user_id = current_user_id() OR
        project_id IN (
            SELECT project_id FROM project_users WHERE user_id = current_user_id()
        )
    );

CREATE POLICY "System can create activity logs" ON activity_logs
    FOR INSERT WITH CHECK (true);
