const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { Pool } = require('pg');
const crypto = require('crypto');

// Database connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'sovereign_command_center',
  password: process.env.DB_PASSWORD || 'your_secure_password',
  port: process.env.DB_PORT || 5432,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-production-secret-key-change-this';

function generateJWT(payload) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

function verifyJWT(token) {
  try {
    const [header, payload, signature] = token.split('.');
    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${payload}`)
      .digest('base64url');
    
    if (signature !== expectedSignature) {
      throw new Error('Invalid signature');
    }
    
    const decodedPayload = JSON.parse(Buffer.from(payload, 'base64url').toString());
    
    if (decodedPayload.exp && Date.now() >= decodedPayload.exp * 1000) {
      throw new Error('Token expired');
    }
    
    return decodedPayload;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

function setCORSHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

// Authentication middleware
async function authenticateRequest(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No token provided');
  }
  
  const token = authHeader.substring(7);
  const decoded = verifyJWT(token);
  
  const result = await pool.query(
    'SELECT id, email, role FROM users WHERE id = $1 AND is_active = TRUE',
    [decoded.userId]
  );
  
  if (result.rows.length === 0) {
    throw new Error('User not found or inactive');
  }
  
  return {
    userId: decoded.userId,
    email: decoded.email,
    role: decoded.role
  };
}

const apiHandlers = {
  'POST /api/auth/login': async (req, res, body) => {
    try {
      const { email, password } = JSON.parse(body);
      
      const result = await pool.query(
        'SELECT * FROM authenticate_user($1, $2)',
        [email, password]
      );
      
      if (result.rows.length === 0) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Invalid credentials' }));
        return;
      }
      
      const user = result.rows[0];
      const token = generateJWT({
        userId: user.id,
        email: user.email,
        role: user.role,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
      });
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            full_name: user.full_name || 'Admin User',
            role: user.role
          },
          token
        }
      }));
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Internal server error' }));
    }
  },

  'GET /api/auth/me': async (req, res) => {
    try {
      const user = await authenticateRequest(req);
      
      const result = await pool.query(
        `SELECT u.id, u.email, u.role, up.full_name, up.company, up.position
         FROM users u
         LEFT JOIN user_profiles up ON u.id = up.id
         WHERE u.id = $1`,
        [user.userId]
      );
      
      if (result.rows.length === 0) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'User not found' }));
        return;
      }
      
      const userData = result.rows[0];
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        data: {
          user: {
            id: userData.id,
            email: userData.email,
            full_name: userData.full_name || 'Admin User',
            role: userData.role,
            company: userData.company,
            position: userData.position
          }
        }
      }));
    } catch (error) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Invalid or expired token' }));
    }
  },

  'GET /api/projects': async (req, res) => {
    try {
      const user = await authenticateRequest(req);
      
      const result = await pool.query(
        'SELECT * FROM projects WHERE created_by = $1 OR client_id = $1 ORDER BY created_at DESC',
        [user.userId]
      );
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        data: result.rows
      }));
    } catch (error) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Invalid or expired token' }));
    }
  },

  'POST /api/projects': async (req, res, body) => {
    try {
      const user = await authenticateRequest(req);
      const { name, description, priority, status } = JSON.parse(body);
      
      const result = await pool.query(
        `INSERT INTO projects (name, description, priority, status, created_by, client_id)
         VALUES ($1, $2, $3, $4, $5, $5)
         RETURNING *`,
        [name, description, priority || 'medium', status || 'active', user.userId]
      );
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        data: result.rows[0]
      }));
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Internal server error' }));
    }
  },

  'POST /api/documents/upload': async (req, res, body) => {
    try {
      const user = await authenticateRequest(req);
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        data: {
          id: crypto.randomUUID(),
          filename: 'test-document.pdf',
          size: 1024,
          upload_url: '/api/documents/test-document.pdf',
          message: 'Document upload endpoint ready'
        }
      }));
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Internal server error' }));
    }
  },

  'GET /api/documents': async (req, res) => {
    try {
      const user = await authenticateRequest(req);
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        data: []
      }));
    } catch (error) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Invalid or expired token' }));
    }
  },

  'GET /api/messages': async (req, res) => {
    try {
      const user = await authenticateRequest(req);
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        data: []
      }));
    } catch (error) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Invalid or expired token' }));
    }
  },

  'POST /api/messages': async (req, res, body) => {
    try {
      const user = await authenticateRequest(req);
      const { content, project_id } = JSON.parse(body);
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        data: {
          id: crypto.randomUUID(),
          content,
          project_id,
          sender_id: user.userId,
          created_at: new Date().toISOString()
        }
      }));
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Internal server error' }));
    }
  },

  'GET /api/notifications': async (req, res) => {
    try {
      const user = await authenticateRequest(req);
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        data: []
      }));
    } catch (error) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Invalid or expired token' }));
    }
  },

  'GET /api/analytics': async (req, res) => {
    try {
      const user = await authenticateRequest(req);
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        data: {
          total_projects: 2,
          active_projects: 2,
          completed_projects: 0,
          total_documents: 0,
          total_messages: 0,
          user_activity: []
        }
      }));
    } catch (error) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Invalid or expired token' }));
    }
  }
};

function serveStaticFile(req, res) {
  let filePath = path.join(__dirname, 'dist', req.url === '/' ? 'index.html' : req.url);
  
  if (!filePath.startsWith(path.join(__dirname, 'dist'))) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  
  if (!fs.existsSync(filePath)) {
    if (!req.url.startsWith('/api/')) {
      filePath = path.join(__dirname, 'dist', 'index.html');
    } else {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }
  }
  
  const ext = path.extname(filePath);
  const contentType = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.ico': 'image/x-icon'
  }[ext] || 'application/octet-stream';
  
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500);
      res.end('Server Error');
      return;
    }
    
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
}

const server = http.createServer(async (req, res) => {
  setCORSHeaders(res);
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  const parsedUrl = url.parse(req.url, true);
  const method = req.method;
  const pathname = parsedUrl.pathname;
  
  const handlerKey = `${method} ${pathname}`;
  if (apiHandlers[handlerKey]) {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      apiHandlers[handlerKey](req, res, body);
    });
    return;
  }
  
  if (method === 'GET') {
    serveStaticFile(req, res);
    return;
  }
  
  res.writeHead(404);
  res.end('Not Found');
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`React-only server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    pool.end();
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    pool.end();
    process.exit(0);
  });
});
