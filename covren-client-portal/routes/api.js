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

    res.json({
      success: true,
      token,
      user: {
        id: user.user_id,
        email: user.email,
        role: user.role,
        name: user.full_name || user.email
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Authentication failed' });
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

    res.status(201).json({
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
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Logout endpoint
router.post('/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ success: true, message: 'Logged out successfully' });
  });
});

// Get user profile
router.get('/auth/profile', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT u.id, u.email, u.role, up.full_name as name, u.created_at FROM users u LEFT JOIN user_profiles up ON u.id = up.id WHERE u.id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
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

// Health check for API
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Covren Client Portal API'
  });
});

module.exports = router; 