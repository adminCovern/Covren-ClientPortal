// Sovereign Command Center Real-time Service
// Covren Firm LLC - Production Grade WebSocket Integration

import type { 
  Project, 
  Document, 
  Message, 
  Notification, 
  RealtimeEvent,
  User 
} from '../types';

// WebSocket Configuration
const REALTIME_CONFIG = {
  url: 'wss://flyflafbdqhdhgxngahz.supabase.co/realtime/v1/websocket',
  apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZseWZsYWZiZHFoZGhneG5nYWh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyMzMzMzAsImV4cCI6MjA2ODgwOTMzMH0.pRpNyNwr6AQRg3eHA5XDgxJwhGZXwlakVx7in9ciOms',
  heartbeatInterval: 30000,
  reconnectAttempts: 5,
  reconnectDelay: 1000,
};

// Event Types
export type RealtimeChannel = 'projects' | 'documents' | 'messages' | 'notifications' | 'users';

export interface RealtimeSubscription {
  channel: RealtimeChannel;
  event: 'INSERT' | 'UPDATE' | 'DELETE';
  filter?: string;
  callback: (payload: RealtimeEvent<any>) => void;
}

export interface ConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  lastHeartbeat: number;
  reconnectAttempts: number;
}

class RealtimeService {
  private socket: WebSocket | null = null;
  private subscriptions: Map<string, RealtimeSubscription> = new Map();
  private connectionState: ConnectionState = {
    isConnected: false,
    isConnecting: false,
    lastHeartbeat: 0,
    reconnectAttempts: 0,
  };
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private messageQueue: any[] = [];

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners() {
    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pauseConnection();
      } else {
        this.resumeConnection();
      }
    });

    // Handle online/offline events
    window.addEventListener('online', () => {
      this.reconnect();
    });

    window.addEventListener('offline', () => {
      this.disconnect();
    });
  }

  async connect(): Promise<boolean> {
    if (this.connectionState.isConnected || this.connectionState.isConnecting) {
      return this.connectionState.isConnected;
    }

    this.connectionState.isConnecting = true;

    try {
      this.socket = new WebSocket(REALTIME_CONFIG.url);
      
      this.socket.onopen = () => {
        this.connectionState.isConnected = true;
        this.connectionState.isConnecting = false;
        this.connectionState.reconnectAttempts = 0;
        this.startHeartbeat();
        this.processMessageQueue();
        console.log('Realtime connection established');
      };

      this.socket.onmessage = (event) => {
        this.handleMessage(event);
      };

      this.socket.onclose = (event) => {
        this.handleDisconnect(event);
      };

      this.socket.onerror = (error) => {
        this.handleError(error);
      };

      return new Promise((resolve) => {
        const checkConnection = () => {
          if (this.connectionState.isConnected) {
            resolve(true);
          } else if (!this.connectionState.isConnecting) {
            resolve(false);
          } else {
            setTimeout(checkConnection, 100);
          }
        };
        checkConnection();
      });
    } catch (error) {
      this.connectionState.isConnecting = false;
      console.error('Failed to establish realtime connection:', error);
      return false;
    }
  }

  private handleMessage(event: MessageEvent) {
    try {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'heartbeat':
          this.connectionState.lastHeartbeat = Date.now();
          break;
        
        case 'subscription':
          this.handleSubscriptionEvent(data);
          break;
        
        case 'error':
          console.error('Realtime error:', data.error);
          break;
        
        default:
          console.log('Unknown realtime message type:', data.type);
      }
    } catch (error) {
      console.error('Failed to parse realtime message:', error);
    }
  }

  private handleSubscriptionEvent(data: any) {
    const { channel, event, record, old_record } = data;
    const subscriptionKey = `${channel}:${event}`;
    const subscription = this.subscriptions.get(subscriptionKey);

    if (subscription) {
      const payload: RealtimeEvent<any> = {
        eventType: event,
        schema: 'public',
        table: channel,
        record,
        oldRecord: old_record,
      };

      subscription.callback(payload);
    }
  }

  private handleDisconnect(event: CloseEvent) {
    this.connectionState.isConnected = false;
    this.connectionState.isConnecting = false;
    this.stopHeartbeat();

    console.log('Realtime connection closed:', event.code, event.reason);

    if (event.code !== 1000) { // Not a normal closure
      this.scheduleReconnect();
    }
  }

  private handleError(error: Event) {
    console.error('Realtime connection error:', error);
    this.connectionState.isConnecting = false;
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.socket && this.connectionState.isConnected) {
        this.socket.send(JSON.stringify({ type: 'heartbeat' }));
      }
    }, REALTIME_CONFIG.heartbeatInterval);
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private scheduleReconnect() {
    if (this.connectionState.reconnectAttempts >= REALTIME_CONFIG.reconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.connectionState.reconnectAttempts++;
    const delay = REALTIME_CONFIG.reconnectDelay * this.connectionState.reconnectAttempts;

    this.reconnectTimeout = setTimeout(() => {
      this.reconnect();
    }, delay);
  }

  private async reconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    console.log('Attempting to reconnect...');
    const success = await this.connect();
    
    if (success) {
      // Resubscribe to all channels
      this.resubscribeAll();
    }
  }

  private resubscribeAll() {
    this.subscriptions.forEach((subscription, key) => {
      this.subscribe(subscription.channel, subscription.event, subscription.filter, subscription.callback);
    });
  }

  private processMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (this.socket && this.connectionState.isConnected) {
        this.socket.send(JSON.stringify(message));
      }
    }
  }

  subscribe<T>(
    channel: RealtimeChannel,
    event: 'INSERT' | 'UPDATE' | 'DELETE',
    filter?: string,
    callback?: (payload: RealtimeEvent<T>) => void
  ): string {
    const subscriptionKey = `${channel}:${event}`;
    
    if (callback) {
      this.subscriptions.set(subscriptionKey, {
        channel,
        event,
        filter,
        callback,
      });
    }

    const message = {
      type: 'subscription',
      channel,
      event,
      filter: filter || '',
    };

    if (this.socket && this.connectionState.isConnected) {
      this.socket.send(JSON.stringify(message));
    } else {
      this.messageQueue.push(message);
    }

    return subscriptionKey;
  }

  unsubscribe(subscriptionKey: string): boolean {
    const subscription = this.subscriptions.get(subscriptionKey);
    if (!subscription) return false;

    this.subscriptions.delete(subscriptionKey);

    const message = {
      type: 'unsubscription',
      channel: subscription.channel,
      event: subscription.event,
    };

    if (this.socket && this.connectionState.isConnected) {
      this.socket.send(JSON.stringify(message));
    }

    return true;
  }

  // Project-specific subscriptions
  subscribeToProjects(callback: (payload: RealtimeEvent<Project>) => void): string {
    return this.subscribe<Project>('projects', 'INSERT', '', callback);
  }

  subscribeToProjectUpdates(projectId: string, callback: (payload: RealtimeEvent<Project>) => void): string {
    return this.subscribe<Project>('projects', 'UPDATE', `id=eq.${projectId}`, callback);
  }

  subscribeToProjectDeletions(callback: (payload: RealtimeEvent<Project>) => void): string {
    return this.subscribe<Project>('projects', 'DELETE', '', callback);
  }

  // Document-specific subscriptions
  subscribeToDocuments(projectId: string, callback: (payload: RealtimeEvent<Document>) => void): string {
    return this.subscribe<Document>('documents', 'INSERT', `project_id=eq.${projectId}`, callback);
  }

  subscribeToDocumentUpdates(documentId: string, callback: (payload: RealtimeEvent<Document>) => void): string {
    return this.subscribe<Document>('documents', 'UPDATE', `id=eq.${documentId}`, callback);
  }

  // Message-specific subscriptions
  subscribeToMessages(projectId: string, callback: (payload: RealtimeEvent<Message>) => void): string {
    return this.subscribe<Message>('messages', 'INSERT', `project_id=eq.${projectId}`, callback);
  }

  subscribeToMessageUpdates(messageId: string, callback: (payload: RealtimeEvent<Message>) => void): string {
    return this.subscribe<Message>('messages', 'UPDATE', `id=eq.${messageId}`, callback);
  }

  // Notification-specific subscriptions
  subscribeToNotifications(userId: string, callback: (payload: RealtimeEvent<Notification>) => void): string {
    return this.subscribe<Notification>('notifications', 'INSERT', `user_id=eq.${userId}`, callback);
  }

  // User-specific subscriptions
  subscribeToUserUpdates(userId: string, callback: (payload: RealtimeEvent<User>) => void): string {
    return this.subscribe<User>('users', 'UPDATE', `id=eq.${userId}`, callback);
  }

  // Connection management
  disconnect() {
    this.connectionState.isConnected = false;
    this.connectionState.isConnecting = false;
    this.stopHeartbeat();
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.socket) {
      this.socket.close(1000, 'Normal closure');
      this.socket = null;
    }
  }

  pauseConnection() {
    if (this.connectionState.isConnected) {
      this.disconnect();
    }
  }

  resumeConnection() {
    if (!this.connectionState.isConnected && !this.connectionState.isConnecting) {
      this.connect();
    }
  }

  getConnectionState(): ConnectionState {
    return { ...this.connectionState };
  }

  isConnected(): boolean {
    return this.connectionState.isConnected;
  }

  // Utility methods
  getSubscriptionCount(): number {
    return this.subscriptions.size;
  }

  clearAllSubscriptions() {
    this.subscriptions.clear();
  }
}

// Export singleton instance
export const realtimeService = new RealtimeService();

// Export types for external use
export type { RealtimeSubscription, ConnectionState }; 