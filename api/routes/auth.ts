/**
 * This is a user authentication API route demo.
 * Handle user registration, login, token management, etc.
 */
import { Router, type Request, type Response, type NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// for esm mode
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from root directory
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const router = Router();

// Initialize Supabase client with service role key for admin operations
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Initialize regular Supabase client for auth operations
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Validation middleware for registration
const validateRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters')
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
    .withMessage('Full name can only contain letters and spaces')
];

/**
 * User Registration
 * POST /api/auth/register
 */
router.post('/register', validateRegistration, async (req: Request, res: Response): Promise<void> => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
      return;
    }

    const { email, password, fullName } = req.body;

    console.log('Attempting to create user with Supabase...');
    console.log('Supabase URL:', process.env.SUPABASE_URL);
    console.log('Service Role Key exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
    
    // Try to create user with admin client first (bypasses email confirmation)
    let authData, authError;
    
    try {
      // First try with admin client
      const adminResult = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName
        }
      });
      authData = adminResult.data;
      authError = adminResult.error;
      console.log('Admin client result:', { authData: !!authData, authError });
    } catch (adminErr) {
      console.log('Admin client failed, trying regular client:', adminErr);
      
      // If admin fails, try regular client
      const regularResult = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });
      authData = regularResult.data;
      authError = regularResult.error;
      console.log('Regular client result:', { authData: !!authData, authError });
    }

    if (authError) {
      console.error('Auth error details:', {
        message: authError.message,
        status: authError.status,
        code: authError.code,
        details: authError
      });
      res.status(400).json({
        success: false,
        error: authError.message || 'Error creating user',
        details: process.env.NODE_ENV === 'development' ? authError.message : undefined
      });
      return;
    }

    if (!authData.user) {
      console.log('No user data returned from Supabase');
      res.status(500).json({ 
        success: false, 
        error: 'Database error creating new user',
        details: 'No user data returned from Supabase'
      });
      return;
    }

    console.log('User created successfully in auth.users:', authData.user.id);
    console.log('User metadata:', authData.user.user_metadata);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        name: fullName
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * User Login
 * POST /api/auth/login
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  // TODO: Implement login logic
});

/**
 * User Logout
 * POST /api/auth/logout
 */
router.post('/logout', async (req: Request, res: Response): Promise<void> => {
  // TODO: Implement logout logic
});

/**
 * error handler middleware
 */
router.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Auth route error:', error);
  console.error('Error stack:', error.stack);
  console.error('Error message:', error.message);
  res.status(500).json({
    success: false,
    error: 'Server internal error',
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

export default router;