-- Sovereign Command Center Database Schema
-- Covren Firm LLC - Production Grade with RLS & Security

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Projects table - Core asset management
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    budget DECIMAL(15,2),
    deadline DATE,
    tags TEXT[],
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Project users - Role-based access control
CREATE TABLE project_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'viewer' CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
    permissions JSONB DEFAULT '{"can_edit": false, "can_delete": false, "can_invite": false}'::jsonb,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
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
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
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
    sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
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
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    read_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(message_id, user_id)
);

-- Notifications table - System-wide alerts
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
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
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
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

-- RLS Policies - Row Level Security

-- Enable RLS on all tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Projects RLS Policies
CREATE POLICY "Users can view projects they are members of" ON projects
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM project_users WHERE project_id = id
        ) OR created_by = auth.uid() OR client_id = auth.uid()
    );

CREATE POLICY "Project owners and admins can update projects" ON projects
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT user_id FROM project_users 
            WHERE project_id = id AND role IN ('owner', 'admin')
        ) OR created_by = auth.uid()
    );

CREATE POLICY "Project owners can delete projects" ON projects
    FOR DELETE USING (
        auth.uid() IN (
            SELECT user_id FROM project_users 
            WHERE project_id = id AND role = 'owner'
        ) OR created_by = auth.uid()
    );

CREATE POLICY "Authenticated users can create projects" ON projects
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Project Users RLS Policies
CREATE POLICY "Users can view project members" ON project_users
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM project_users WHERE project_id = project_users.project_id
        )
    );

CREATE POLICY "Project owners and admins can manage members" ON project_users
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_id FROM project_users 
            WHERE project_id = project_users.project_id AND role IN ('owner', 'admin')
        )
    );

-- Documents RLS Policies
CREATE POLICY "Users can view documents in their projects" ON documents
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM project_users WHERE project_id = documents.project_id
        ) OR is_public = true
    );

CREATE POLICY "Project editors and above can upload documents" ON documents
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM project_users 
            WHERE project_id = documents.project_id AND role IN ('owner', 'admin', 'editor')
        )
    );

CREATE POLICY "Document uploaders and project admins can update documents" ON documents
    FOR UPDATE USING (
        uploaded_by = auth.uid() OR
        auth.uid() IN (
            SELECT user_id FROM project_users 
            WHERE project_id = documents.project_id AND role IN ('owner', 'admin')
        )
    );

-- Messages RLS Policies
CREATE POLICY "Users can view messages in their projects" ON messages
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM project_users WHERE project_id = messages.project_id
        )
    );

CREATE POLICY "Project members can send messages" ON messages
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM project_users WHERE project_id = messages.project_id
        )
    );

CREATE POLICY "Message senders can edit their messages" ON messages
    FOR UPDATE USING (sender_id = auth.uid());

-- Notifications RLS Policies
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (user_id = auth.uid());

-- User Profiles RLS Policies
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT WITH CHECK (id = auth.uid());

-- Activity Logs RLS Policies
CREATE POLICY "Users can view activity logs for their projects" ON activity_logs
    FOR SELECT USING (
        user_id = auth.uid() OR
        project_id IN (
            SELECT project_id FROM project_users WHERE user_id = auth.uid()
        )
    );

-- Triggers for automatic updates

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

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
        auth.uid(),
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

-- Insert default data for testing
INSERT INTO user_profiles (id, full_name, company, position)
VALUES 
    (auth.uid(), 'Test User', 'Covren Firm LLC', 'Client')
ON CONFLICT (id) DO NOTHING; 