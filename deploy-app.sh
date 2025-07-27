#!/bin/bash

# Deploy Covren Firm Client Portal
echo "Deploying Covren Firm Client Portal..."

# Install required packages
sudo apt update
sudo apt install -y nodejs npm nginx

# Create application directory structure
sudo mkdir -p /var/www/client-portal/app
sudo mkdir -p /var/www/client-portal/app/uploads
sudo mkdir -p /var/www/client-portal/app/public
sudo chown -R ubuntu:ubuntu /var/www/client-portal

# Install PM2 for process management
sudo npm install -g pm2

# Create package.json
cat > /var/www/client-portal/app/package.json << 'EOF'
{
  "name": "covren-client-portal",
  "version": "1.0.0",
  "description": "Covren Firm Client Portal",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.3",
    "bcrypt": "^5.1.1",
    "jsonwebtoken": "^9.0.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "multer": "^1.4.5-lts.1",
    "socket.io": "^4.7.4"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
EOF

# Create server.js
cat > /var/www/client-portal/app/server.js << 'EOF'
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
  password: '', // No password for local PostgreSQL
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
EOF

# Create basic HTML frontend
cat > /var/www/client-portal/app/public/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Covren Firm - Client Portal</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="/socket.io/socket.io.js"></script>
</head>
<body class="bg-gray-100">
    <div id="app" class="min-h-screen">
        <!-- Login Form -->
        <div id="loginForm" class="flex items-center justify-center min-h-screen">
            <div class="bg-white p-8 rounded-lg shadow-md w-96">
                <h1 class="text-2xl font-bold text-center mb-6">Covren Firm</h1>
                <h2 class="text-xl text-center mb-6">Client Portal</h2>
                <form id="loginFormElement" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" id="email" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Password</label>
                        <input type="password" id="password" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                    </div>
                    <button type="submit" class="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                        Sign In
                    </button>
                </form>
            </div>
        </div>

        <!-- Dashboard -->
        <div id="dashboard" class="hidden">
            <nav class="bg-white shadow-sm">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="flex justify-between h-16">
                        <div class="flex items-center">
                            <h1 class="text-xl font-semibold">Covren Firm Client Portal</h1>
                        </div>
                        <div class="flex items-center space-x-4">
                            <span id="userEmail" class="text-gray-700"></span>
                            <button id="logoutBtn" class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">Logout</button>
                        </div>
                    </div>
                </div>
            </nav>

            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div class="mb-8">
                    <h2 class="text-2xl font-bold mb-4">My Projects</h2>
                    <button id="newProjectBtn" class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">New Project</button>
                </div>
                
                <div id="projectsList" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <!-- Projects will be loaded here -->
                </div>
            </div>
        </div>
    </div>

    <script>
        let currentUser = null;
        let socket = null;

        // Login form handler
        document.getElementById('loginFormElement').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password }),
                });
                
                if (response.ok) {
                    const data = await response.json();
                    localStorage.setItem('token', data.token);
                    currentUser = data.user;
                    showDashboard();
                    loadProjects();
                } else {
                    alert('Login failed. Please check your credentials.');
                }
            } catch (error) {
                console.error('Login error:', error);
                alert('Login failed. Please try again.');
            }
        });

        // Logout handler
        document.getElementById('logoutBtn').addEventListener('click', () => {
            localStorage.removeItem('token');
            currentUser = null;
            showLogin();
        });

        function showDashboard() {
            document.getElementById('loginForm').classList.add('hidden');
            document.getElementById('dashboard').classList.remove('hidden');
            document.getElementById('userEmail').textContent = currentUser.email;
        }

        function showLogin() {
            document.getElementById('loginForm').classList.remove('hidden');
            document.getElementById('dashboard').classList.add('hidden');
        }

        async function loadProjects() {
            try {
                const response = await fetch('/api/projects', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                
                if (response.ok) {
                    const projects = await response.json();
                    displayProjects(projects);
                }
            } catch (error) {
                console.error('Load projects error:', error);
            }
        }

        function displayProjects(projects) {
            const container = document.getElementById('projectsList');
            container.innerHTML = '';
            
            projects.forEach(project => {
                const projectCard = document.createElement('div');
                projectCard.className = 'bg-white p-6 rounded-lg shadow-md';
                projectCard.innerHTML = `
                    <h3 class="text-lg font-semibold mb-2">${project.project_name}</h3>
                    <p class="text-gray-600 mb-4">${project.project_status}</p>
                    <div class="flex justify-between text-sm text-gray-500">
                        <span>Role: ${project.user_role}</span>
                        <span>Members: ${project.member_count}</span>
                    </div>
                `;
                container.appendChild(projectCard);
            });
        }

        // Check if user is already logged in
        const token = localStorage.getItem('token');
        if (token) {
            // Validate token and show dashboard
            showDashboard();
            loadProjects();
        }
    </script>
</body>
</html>
EOF

# Install dependencies
cd /var/www/client-portal/app
npm install

# Create PM2 ecosystem file
cat > /var/www/client-portal/app/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'covren-client-portal',
    script: 'server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
EOF

# Start the application with PM2
cd /var/www/client-portal/app
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Configure Nginx
sudo tee /etc/nginx/sites-available/covren-client-portal << 'EOF'
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/covren-client-portal /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

echo "Deployment complete!"
echo "Your application is now running at: http://131.153.165.103"
echo ""
echo "Default login credentials:"
echo "Email: admin@covrenfirm.com"
echo "Password: admin123"
EOF

After pasting the content:

1. **Save the file**: Press `Ctrl + X`, then `Y`, then `Enter`
2. **Make it executable**: `sudo chmod +x /var/www/client-portal/deploy-app.sh`
3. **Run the deployment**: `sudo /var/www/client-portal/deploy-app.sh`

This will:
- Install Node.js and Nginx
- Create your Express.js backend
- Set up a basic React-like frontend
- Configure PM2 for process management
- Set up Nginx as a reverse proxy
- Start your application

After running the script, your client portal will be accessible at `http://131.153.165.103`!
