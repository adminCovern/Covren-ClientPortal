const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres123@localhost:5432/sovereign_command_center',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret-change-in-production', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Validation failed',
      details: errors.array() 
    });
  }
  next();
};

// Login endpoint
router.post('/auth/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 })
], validate, async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Login attempt for:', email);

    // Query user from database using the correct function
    const result = await pool.query(
      'SELECT * FROM authenticate_user($1, $2)',
      [email, password]
    );

    console.log('Database result:', result.rows);

    // Check if user exists and password is correct
    // The function returns is_authenticated boolean
    if (result.rows.length === 0 || !result.rows[0].is_authenticated) {
      console.log('Authentication failed - invalid credentials');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    console.log('Authentication successful for user:', user.email);
    
    // Generate JWT token with UUID user_id
    const token = jwt.sign(
      { 
        id: user.user_id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'your-jwt-secret-change-in-production',
      { expiresIn: '24h' }
    );

    // Set session
    req.session.userId = user.user_id;
    req.session.userEmail = user.email;
    req.session.userRole = user.role;

    // Get user metadata for complete profile
    const metadata = user.metadata || {};

    return res.json({
      success: true,
      token,
      user: {
        id: user.user_id,
        email: user.email,
        role: user.role,
        name: metadata.name || user.email
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Authentication failed' });
    }
  }
});

// Register endpoint
router.post('/auth/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').isLength({ min: 1, max: 100 }).trim().escape(),
  body('company').optional().isLength({ max: 100 }).trim().escape(),
  body('position').optional().isLength({ max: 100 }).trim().escape()
], validate, async (req, res) => {
  try {
    const { email, password, name, company, position } = req.body;

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user with UUID
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role',
      [email, hashedPassword, 'client']
    );

    const user = result.rows[0];
    
    // Create user profile
    await pool.query(
      'INSERT INTO user_profiles (id, full_name, company, position) VALUES ($1, $2, $3, $4)',
      [user.id, name, company, position]
    );
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'your-jwt-secret-change-in-production',
      { expiresIn: '24h' }
    );

    // Set session
    req.session.userId = user.id;
    req.session.userEmail = user.email;
    req.session.userRole = user.role;

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: name
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Registration failed' });
    }
  }
});

// Logout endpoint
router.post('/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    return res.json({ success: true, message: 'Logged out successfully' });
  });
});

// Get user profile
router.get('/auth/profile', authenticateToken, async (req, res) => {
  try {
    console.log('Profile request for user ID:', req.user.id);
    
    // Query the users table directly with the correct structure
    const result = await pool.query(
      'SELECT id, email, role, metadata FROM users WHERE id = $1',
      [req.user.id]
    );

    console.log('Profile query result:', result.rows);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    const metadata = user.metadata || {};
    
    return res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      name: metadata.name || user.email,
      company: metadata.company,
      position: metadata.position
    });

  } catch (error) {
    console.error('Profile error:', error);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Get user projects
router.get('/projects', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM get_user_projects($1)',
      [req.user.id]
    );

    res.json({ projects: result.rows });
  } catch (error) {
    console.error('Projects error:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Create new project
router.post('/projects', authenticateToken, [
  body('name').isLength({ min: 1, max: 100 }).trim().escape(),
  body('description').optional().isLength({ max: 500 }).trim().escape()
], validate, async (req, res) => {
  try {
    const { name, description } = req.body;
    
    const result = await pool.query(
      'INSERT INTO projects (name, description, client_id) VALUES ($1, $2, $3) RETURNING *',
      [name, description, req.user.id]
    );

    res.status(201).json({ 
      success: true, 
      project: result.rows[0] 
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Update project
router.put('/projects/:id', authenticateToken, [
  body('name').optional().isLength({ min: 1, max: 100 }).trim().escape(),
  body('description').optional().isLength({ max: 500 }).trim().escape()
], validate, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    // Check if user owns the project
    const ownershipCheck = await pool.query(
      'SELECT id FROM projects WHERE id = $1 AND client_id = $2',
      [id, req.user.id]
    );

    if (ownershipCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found or access denied' });
    }

    const result = await pool.query(
      'UPDATE projects SET name = COALESCE($1, name), description = COALESCE($2, description), updated_at = NOW() WHERE id = $3 RETURNING *',
      [name, description, id]
    );

    res.json({ 
      success: true, 
      project: result.rows[0] 
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// Delete project
router.delete('/projects/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user owns the project
    const ownershipCheck = await pool.query(
      'SELECT id FROM projects WHERE id = $1 AND client_id = $2',
      [id, req.user.id]
    );

    if (ownershipCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found or access denied' });
    }

    await pool.query('DELETE FROM projects WHERE id = $1', [id]);

    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// Create notification endpoint
router.post('/notifications', authenticateToken, [
  body('title').isLength({ min: 1, max: 255 }).trim().escape(),
  body('message').isLength({ min: 1, max: 1000 }).trim().escape(),
  body('type').isIn(['info', 'success', 'warning', 'error', 'critical']),
  body('action_url').optional().isURL(),
  body('user_ids').isArray().withMessage('user_ids must be an array')
], validate, async (req, res) => {
  try {
    const { title, message, type, action_url, user_ids } = req.body;
    
    // Create notifications for multiple users
    const notifications = [];
    for (const user_id of user_ids) {
      const result = await pool.query(
        'INSERT INTO notifications (user_id, title, message, type, action_url, metadata) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [user_id, title, message, type, action_url, { created_by: req.user.id }]
      );
      notifications.push(result.rows[0]);
    }

    res.status(201).json({ success: true, notifications });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

// Get user notification preferences
router.get('/notifications/preferences', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT preferences FROM user_profiles WHERE id = $1',
      [req.user.id]
    );

    const preferences = result.rows[0]?.preferences?.notifications || {
      email: true,
      push: true,
      sms: false
    };

    res.json({ preferences });
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({ error: 'Failed to get preferences' });
  }
});

// Update notification preferences
router.put('/notifications/preferences', authenticateToken, [
  body('email').isBoolean(),
  body('push').isBoolean(),
  body('sms').isBoolean()
], validate, async (req, res) => {
  try {
    const { email, push, sms } = req.body;
    
    await pool.query(
      'UPDATE user_profiles SET preferences = jsonb_set(preferences, \'{notifications}\', $1) WHERE id = $2',
      [JSON.stringify({ email, push, sms }), req.user.id]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

// Send email notification endpoint
router.post('/notifications/email', authenticateToken, [
  body('to').isEmail(),
  body('subject').isLength({ min: 1, max: 255 }),
  body('body').isLength({ min: 1, max: 5000 })
], validate, async (req, res) => {
  try {
    console.log('Email notification request:', req.body);
    res.json({ success: true, message: 'Email notification queued' });
  } catch (error) {
    console.error('Email notification error:', error);
    res.status(500).json({ error: 'Failed to send email notification' });
  }
});

// Health check for API
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Covren Client Portal API'
  });
});

module.exports = router;    