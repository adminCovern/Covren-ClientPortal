// Sovereign Command Center Collaborative Intelligence Framework
// Covren Firm LLC - Production Grade Collaboration System

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { 
  CollaborationEvent, 
  TeamNotification, 
  WorkflowState, 
  AuditTrail, 
  PermissionMatrix,
  CommunicationChannel,
  CollaborationMetrics
} from '../../types';

interface CollaborativeIntelligenceContextType {
  // Team Notification Orchestration
  notifications: TeamNotification[];
  sendNotification: (notification: Omit<TeamNotification, 'id' | 'timestamp'>) => void;
  markNotificationRead: (id: string) => void;
  getUnreadCount: () => number;
  
  // Collaborative Workflows
  workflows: WorkflowState[];
  startWorkflow: (workflow: Omit<WorkflowState, 'id' | 'startedAt'>) => void;
  updateWorkflow: (id: string, updates: Partial<WorkflowState>) => void;
  completeWorkflow: (id: string) => void;
  
  // Audit Trail Excellence
  auditTrail: AuditTrail[];
  logAuditEvent: (event: Omit<AuditTrail, 'id' | 'timestamp'>) => void;
  getAuditHistory: (filters?: any) => AuditTrail[];
  
  // Permission Granularity
  permissions: PermissionMatrix;
  checkPermission: (userId: string, action: string, resource: string) => boolean;
  grantPermission: (userId: string, action: string, resource: string) => void;
  revokePermission: (userId: string, action: string, resource: string) => void;
  
  // Communication Integration
  channels: CommunicationChannel[];
  sendMessage: (channelId: string, message: string, metadata?: any) => void;
  joinChannel: (channelId: string, userId: string) => void;
  leaveChannel: (channelId: string, userId: string) => void;
  
  // Collaboration Metrics
  metrics: CollaborationMetrics;
  updateMetrics: (updates: Partial<CollaborationMetrics>) => void;
}

const CollaborativeIntelligenceContext = createContext<CollaborativeIntelligenceContextType | undefined>(undefined);

export const CollaborativeIntelligenceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<TeamNotification[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowState[]>([]);
  const [auditTrail, setAuditTrail] = useState<AuditTrail[]>([]);
  const [permissions, setPermissions] = useState<PermissionMatrix>({});
  const [channels, setChannels] = useState<CommunicationChannel[]>([]);
  const [metrics, setMetrics] = useState<CollaborationMetrics>({
    totalCollaborations: 0,
    activeWorkflows: 0,
    averageResponseTime: 0,
    satisfactionScore: 0,
    efficiencyGains: 0
  });

  // Team Notification Orchestration
  const sendNotification = useCallback((notification: Omit<TeamNotification, 'id' | 'timestamp'>) => {
    const newNotification: TeamNotification = {
      ...notification,
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev]);
    
    // Intelligent routing based on notification type and user preferences
    if (notification.priority === 'urgent') {
      // Send immediate alerts
      if (notification.channel === 'email') {
        // Trigger email notification
        console.log('Sending urgent email notification:', newNotification);
      }
      if (notification.channel === 'sms') {
        // Trigger SMS notification
        console.log('Sending urgent SMS notification:', newNotification);
      }
    }

    // Log audit event
    logAuditEvent({
      userId: notification.senderId,
      action: 'notification_sent',
      resource: 'team_notification',
      details: {
        notificationId: newNotification.id,
        recipientId: notification.recipientId,
        priority: notification.priority,
        channel: notification.channel
      }
    });
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true, readAt: new Date().toISOString() }
          : notification
      )
    );
  }, []);

  const getUnreadCount = useCallback(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  // Collaborative Workflows
  const startWorkflow = useCallback((workflow: Omit<WorkflowState, 'id' | 'startedAt'>) => {
    const newWorkflow: WorkflowState = {
      ...workflow,
      id: `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      startedAt: new Date().toISOString(),
      status: 'active',
      participants: workflow.participants || [],
      steps: workflow.steps || [],
      currentStep: 0
    };

    setWorkflows(prev => [...prev, newWorkflow]);

    // Notify all participants
    newWorkflow.participants.forEach(participantId => {
      sendNotification({
        senderId: 'system',
        recipientId: participantId,
        type: 'workflow_started',
        title: `Workflow Started: ${newWorkflow.name}`,
        message: `You have been added to workflow "${newWorkflow.name}". Please review and begin your tasks.`,
        priority: 'normal',
        channel: 'in-app',
        metadata: {
          workflowId: newWorkflow.id,
          workflowName: newWorkflow.name
        }
      });
    });

    logAuditEvent({
      userId: workflow.initiatorId,
      action: 'workflow_started',
      resource: 'collaborative_workflow',
      details: {
        workflowId: newWorkflow.id,
        workflowName: newWorkflow.name,
        participants: newWorkflow.participants
      }
    });
  }, [sendNotification]);

  const updateWorkflow = useCallback((id: string, updates: Partial<WorkflowState>) => {
    setWorkflows(prev => 
      prev.map(workflow => 
        workflow.id === id 
          ? { ...workflow, ...updates, updatedAt: new Date().toISOString() }
          : workflow
      )
    );

    logAuditEvent({
      userId: updates.updatedBy || 'system',
      action: 'workflow_updated',
      resource: 'collaborative_workflow',
      details: {
        workflowId: id,
        updates: Object.keys(updates)
      }
    });
  }, []);

  const completeWorkflow = useCallback((id: string) => {
    setWorkflows(prev => 
      prev.map(workflow => 
        workflow.id === id 
          ? { ...workflow, status: 'completed', completedAt: new Date().toISOString() }
          : workflow
      )
    );

    // Notify completion to all participants
    const workflow = workflows.find(w => w.id === id);
    if (workflow) {
      workflow.participants.forEach(participantId => {
        sendNotification({
          senderId: 'system',
          recipientId: participantId,
          type: 'workflow_completed',
          title: `Workflow Completed: ${workflow.name}`,
          message: `Workflow "${workflow.name}" has been completed successfully.`,
          priority: 'normal',
          channel: 'in-app',
          metadata: {
            workflowId: workflow.id,
            workflowName: workflow.name
          }
        });
      });
    }

    logAuditEvent({
      userId: 'system',
      action: 'workflow_completed',
      resource: 'collaborative_workflow',
      details: {
        workflowId: id,
        workflowName: workflow?.name
      }
    });
  }, [workflows, sendNotification]);

  // Audit Trail Excellence
  const logAuditEvent = useCallback((event: Omit<AuditTrail, 'id' | 'timestamp'>) => {
    const auditEvent: AuditTrail = {
      ...event,
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      sessionId: 'current_session', // This would be managed by session context
      ipAddress: 'client_ip', // This would be captured from request
      userAgent: navigator.userAgent
    };

    setAuditTrail(prev => [auditEvent, ...prev]);

    // Store in persistent storage for compliance
    const auditLog = JSON.parse(localStorage.getItem('audit_trail') || '[]');
    auditLog.push(auditEvent);
    localStorage.setItem('audit_trail', JSON.stringify(auditLog.slice(-1000))); // Keep last 1000 events
  }, []);

  const getAuditHistory = useCallback((filters?: any) => {
    let filtered = auditTrail;

    if (filters?.userId) {
      filtered = filtered.filter(event => event.userId === filters.userId);
    }
    if (filters?.action) {
      filtered = filtered.filter(event => event.action === filters.action);
    }
    if (filters?.resource) {
      filtered = filtered.filter(event => event.resource === filters.resource);
    }
    if (filters?.dateRange) {
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.timestamp);
        return eventDate >= filters.dateRange.start && eventDate <= filters.dateRange.end;
      });
    }

    return filtered;
  }, [auditTrail]);

  // Permission Granularity
  const checkPermission = useCallback((userId: string, action: string, resource: string) => {
    const userPermissions = permissions[userId];
    if (!userPermissions) return false;

    const resourcePermissions = userPermissions[resource];
    if (!resourcePermissions) return false;

    return resourcePermissions.includes(action);
  }, [permissions]);

  const grantPermission = useCallback((userId: string, action: string, resource: string) => {
    setPermissions(prev => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [resource]: [...(prev[userId]?.[resource] || []), action]
      }
    }));

    logAuditEvent({
      userId: 'system',
      action: 'permission_granted',
      resource: 'user_permissions',
      details: {
        targetUserId: userId,
        action,
        resource
      }
    });
  }, [logAuditEvent]);

  const revokePermission = useCallback((userId: string, action: string, resource: string) => {
    setPermissions(prev => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [resource]: (prev[userId]?.[resource] || []).filter(a => a !== action)
      }
    }));

    logAuditEvent({
      userId: 'system',
      action: 'permission_revoked',
      resource: 'user_permissions',
      details: {
        targetUserId: userId,
        action,
        resource
      }
    });
  }, [logAuditEvent]);

  // Communication Integration
  const sendMessage = useCallback((channelId: string, message: string, metadata?: any) => {
    const channel = channels.find(c => c.id === channelId);
    if (!channel) return;

    const newMessage = {
      id: `message_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      channelId,
      senderId: 'current_user', // This would come from auth context
      content: message,
      timestamp: new Date().toISOString(),
      metadata
    };

    setChannels(prev => 
      prev.map(channel => 
        channel.id === channelId 
          ? { 
              ...channel, 
              messages: [...channel.messages, newMessage],
              lastActivity: new Date().toISOString()
            }
          : channel
      )
    );

    // Notify channel participants
    channel.participants.forEach(participantId => {
      if (participantId !== 'current_user') {
        sendNotification({
          senderId: 'current_user',
          recipientId: participantId,
          type: 'new_message',
          title: `New message in ${channel.name}`,
          message: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
          priority: 'normal',
          channel: 'in-app',
          metadata: {
            channelId,
            channelName: channel.name,
            messageId: newMessage.id
          }
        });
      }
    });

    logAuditEvent({
      userId: 'current_user',
      action: 'message_sent',
      resource: 'communication_channel',
      details: {
        channelId,
        channelName: channel.name,
        messageLength: message.length
      }
    });
  }, [channels, sendNotification, logAuditEvent]);

  const joinChannel = useCallback((channelId: string, userId: string) => {
    setChannels(prev => 
      prev.map(channel => 
        channel.id === channelId 
          ? { 
              ...channel, 
              participants: [...channel.participants, userId],
              lastActivity: new Date().toISOString()
            }
          : channel
      )
    );

    logAuditEvent({
      userId,
      action: 'channel_joined',
      resource: 'communication_channel',
      details: { channelId }
    });
  }, [logAuditEvent]);

  const leaveChannel = useCallback((channelId: string, userId: string) => {
    setChannels(prev => 
      prev.map(channel => 
        channel.id === channelId 
          ? { 
              ...channel, 
              participants: channel.participants.filter(p => p !== userId),
              lastActivity: new Date().toISOString()
            }
          : channel
      )
    );

    logAuditEvent({
      userId,
      action: 'channel_left',
      resource: 'communication_channel',
      details: { channelId }
    });
  }, [logAuditEvent]);

  // Collaboration Metrics
  const updateMetrics = useCallback((updates: Partial<CollaborationMetrics>) => {
    setMetrics(prev => ({ ...prev, ...updates }));
  }, []);

  // Real-time collaboration monitoring
  useEffect(() => {
    const updateCollaborationMetrics = () => {
      const activeWorkflowsCount = workflows.filter(w => w.status === 'active').length;
      const unreadNotificationsCount = getUnreadCount();
      const totalCollaborations = workflows.length + channels.length;

      updateMetrics({
        activeWorkflows: activeWorkflowsCount,
        totalCollaborations,
        // Calculate efficiency gains based on workflow completion rates
        efficiencyGains: workflows.length > 0 
          ? (workflows.filter(w => w.status === 'completed').length / workflows.length) * 100
          : 0
      });
    };

    updateCollaborationMetrics();
  }, [workflows, getUnreadCount, updateMetrics]);

  const value: CollaborativeIntelligenceContextType = {
    notifications,
    sendNotification,
    markNotificationRead,
    getUnreadCount,
    workflows,
    startWorkflow,
    updateWorkflow,
    completeWorkflow,
    auditTrail,
    logAuditEvent,
    getAuditHistory,
    permissions,
    checkPermission,
    grantPermission,
    revokePermission,
    channels,
    sendMessage,
    joinChannel,
    leaveChannel,
    metrics,
    updateMetrics
  };

  return (
    <CollaborativeIntelligenceContext.Provider value={value}>
      {children}
    </CollaborativeIntelligenceContext.Provider>
  );
};

export const useCollaborativeIntelligence = () => {
  const context = useContext(CollaborativeIntelligenceContext);
  if (!context) {
    throw new Error('useCollaborativeIntelligence must be used within CollaborativeIntelligenceProvider');
  }
  return context;
};

// Collaboration Components
export const TeamNotificationCenter: React.FC = () => {
  const { notifications, markNotificationRead, getUnreadCount } = useCollaborativeIntelligence();
  const unreadCount = getUnreadCount();

  return (
    <div className="team-notification-center">
      <div className="notification-header">
        <h3>Team Notifications</h3>
        {unreadCount > 0 && (
          <span className="unread-badge">{unreadCount}</span>
        )}
      </div>
      <div className="notification-list">
        {notifications.slice(0, 10).map(notification => (
          <div 
            key={notification.id} 
            className={`notification-item ${notification.read ? 'read' : 'unread'}`}
            onClick={() => markNotificationRead(notification.id)}
          >
            <div className="notification-content">
              <h4>{notification.title}</h4>
              <p>{notification.message}</p>
              <span className="notification-time">
                {new Date(notification.timestamp).toLocaleString()}
              </span>
            </div>
            {notification.priority === 'urgent' && (
              <span className="priority-badge urgent">Urgent</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export const WorkflowCollaboration: React.FC<{ workflowId: string }> = ({ workflowId }) => {
  const { workflows, updateWorkflow } = useCollaborativeIntelligence();
  const workflow = workflows.find(w => w.id === workflowId);

  if (!workflow) return <div>Workflow not found</div>;

  return (
    <div className="workflow-collaboration">
      <div className="workflow-header">
        <h3>{workflow.name}</h3>
        <span className={`status-badge ${workflow.status}`}>
          {workflow.status}
        </span>
      </div>
      <div className="workflow-participants">
        <h4>Participants</h4>
        <div className="participant-list">
          {workflow.participants.map(participantId => (
            <div key={participantId} className="participant">
              {participantId}
            </div>
          ))}
        </div>
      </div>
      <div className="workflow-steps">
        <h4>Workflow Steps</h4>
        {workflow.steps.map((step, index) => (
          <div 
            key={index} 
            className={`workflow-step ${index === workflow.currentStep ? 'current' : ''}`}
          >
            <span className="step-number">{index + 1}</span>
            <span className="step-title">{step.title}</span>
            <span className="step-status">{step.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const AuditTrailViewer: React.FC<{ filters?: any }> = ({ filters }) => {
  const { getAuditHistory } = useCollaborativeIntelligence();
  const auditHistory = getAuditHistory(filters);

  return (
    <div className="audit-trail-viewer">
      <h3>Audit Trail</h3>
      <div className="audit-list">
        {auditHistory.map(audit => (
          <div key={audit.id} className="audit-item">
            <div className="audit-header">
              <span className="audit-action">{audit.action}</span>
              <span className="audit-resource">{audit.resource}</span>
              <span className="audit-timestamp">
                {new Date(audit.timestamp).toLocaleString()}
              </span>
            </div>
            <div className="audit-details">
              <span className="audit-user">User: {audit.userId}</span>
              {audit.details && (
                <div className="audit-metadata">
                  {Object.entries(audit.details).map(([key, value]) => (
                    <span key={key} className="audit-detail">
                      {key}: {String(value)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 