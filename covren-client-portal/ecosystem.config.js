// Sovereign Command Center PM2 Ecosystem Configuration
// Covren Firm LLC - Bare Metal Production Deployment
// NO CONTAINERS, NO DOCKER, NO VIRTUAL ENVIRONMENTS

module.exports = {
  apps: [{
    name: 'sovereign-command-center',
    script: 'server.js',
               instances: 'max', // Utilize all 6 vCPUs
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      HOST: '0.0.0.0',
      // Database configuration
      DATABASE_URL: 'postgresql://sovren_user:secure_password_here@localhost:5432/sovereign_command_center',
      // Redis configuration
      REDIS_URL: 'redis://:your_redis_password_here@localhost:6379',
      // Supabase configuration
      SUPABASE_URL: 'https://flyflafbdqhdhgxngahz.supabase.co',
      SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZseWZsYWZiZHFoZGhneG5nYWh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyMzMzMzAsImV4cCI6MjA2ODgwOTMzMH0.pRpNyNwr6AQRg3eHA5XDgxJwhGZXwlakVx7in9ciOms',
      // Security configuration
      SESSION_SECRET: 'your_session_secret_here',
      JWT_SECRET: 'your_jwt_secret_here',
      // Performance configuration
      MAX_FILE_SIZE: '50MB',
      UPLOAD_PATH: '/var/www/uploads',
      LOG_LEVEL: 'info',
                   // Memory optimization for 128GB RAM
             NODE_OPTIONS: '--max-old-space-size=65536 --optimize-for-size',
             // CPU optimization for 6 vCPUs
             UV_THREADPOOL_SIZE: '12'
    },
    // Logging configuration
    error_file: '/var/log/pm2/sovereign-command-center-error.log',
    out_file: '/var/log/pm2/sovereign-command-center-out.log',
    log_file: '/var/log/pm2/sovereign-command-center-combined.log',
    time: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    
               // Memory management for 128GB RAM
           max_memory_restart: '16G', // Restart if memory exceeds 16GB per instance
           node_args: '--max-old-space-size=16384', // 16GB per Node.js process
    
    // Performance optimization
    watch: false,
    ignore_watch: ['node_modules', 'logs', 'uploads', 'dist'],
    
    // Process management
    min_uptime: '10s',
    max_restarts: 10,
    restart_delay: 4000,
    
    // Health monitoring
    health_check_grace_period: 3000,
    health_check_fatal_exceptions: true,
    
    // Security
    uid: 'www-data',
    gid: 'www-data',
    
    // File permissions
    cwd: '/var/www/sovereign-command-center',
    
    // Environment-specific overrides
    env_production: {
      NODE_ENV: 'production',
      LOG_LEVEL: 'warn',
      ENABLE_METRICS: 'true',
      ENABLE_DEBUG: 'false'
    },
    
    env_staging: {
      NODE_ENV: 'staging',
      LOG_LEVEL: 'info',
      ENABLE_METRICS: 'true',
      ENABLE_DEBUG: 'true'
    }
  }],
  
  // Deployment configuration
  deploy: {
    production: {
      user: 'www-data',
      host: 'your-vultr-server-ip',
      ref: 'origin/main',
      repo: 'https://github.com/covren-firm/sovereign-command-center.git',
      path: '/var/www/sovereign-command-center',
      'pre-deploy-local': '',
      'post-deploy': 'npm ci --production && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
}; 