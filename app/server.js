const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Database connection
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'sovereign_command_center',
  password: 'postgres123',
  port: 5432,
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// File upload configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});
const upload = multer({ storage: storage });

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Routes

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const result = await pool.query(
      'SELECT * FROM authenticate_user($1, $2)',
      [email, password]
    );
    
    if (result.rows[0].is_authenticated) {
      const user = result.rows[0];
      const token = jwt.sign(
        { id: user.user_id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );
      
      res.json({
        token,
        user: {
          id: user.user_id,
          email: user.email,
          role: user.role,
          full_name: user.full_name
        }
      });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user projects
app.get('/api/projects', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM get_user_projects($1)',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create project
app.post('/api/projects', authenticateToken, async (req, res) => {
  try {
    const { name, description, budget, deadline } = req.body;
    const result = await pool.query(
      'INSERT INTO projects (name, description, budget, deadline, created_by, client_id) VALUES ($1, $2, $3, $4, $5, $5) RETURNING *',
      [name, description, budget, deadline, req.user.id]
    );
    
    // Add user as project owner
    await pool.query(
      'INSERT INTO project_users (project_id, user_id, role) VALUES ($1, $2, $3)',
      [result.rows[0].id, req.user.id, 'owner']
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get project details
app.get('/api/projects/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM projects WHERE id = $1',
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload document
app.post('/api/projects/:id/documents', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const { id } = req.params;
    const { originalname, filename, path, size } = req.file;
    
    const result = await pool.query(
      'INSERT INTO documents (project_id, name, file_path, file_size, mime_type, uploaded_by) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [id, originalname, path, size, req.file.mimetype, req.user.id]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get project documents
app.get('/api/projects/:id/documents', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM documents WHERE project_id = $1 ORDER BY uploaded_at DESC',
      [req.params.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send message
app.post('/api/projects/:id/messages', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { content, message_type = 'text' } = req.body;
    
    const result = await pool.query(
      'INSERT INTO messages (project_id, sender_id, content, message_type) VALUES ($1, $2, $3, $4) RETURNING *',
      [id, req.user.id, content, message_type]
    );
    
    // Emit to socket
    io.to(`project-${id}`).emit('new_message', result.rows[0]);
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get project messages
app.get('/api/projects/:id/messages', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT m.*, u.email as sender_email FROM messages m LEFT JOIN users u ON m.sender_id = u.id WHERE m.project_id = $1 ORDER BY m.created_at ASC',
      [req.params.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Socket connection
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join_project', (projectId) => {
    socket.join(`project-${projectId}`);
    console.log(`User joined project: ${projectId}`);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
