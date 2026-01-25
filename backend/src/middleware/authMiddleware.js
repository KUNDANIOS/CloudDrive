import { supabase } from '../utils/supabase.js';

/**
 * Middleware to protect routes with Supabase authentication
 * Verifies the JWT token from Supabase Auth
 */
export async function protect(req, res, next) {
  try {
    // Get authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        message: "No authentication token provided" 
      });
    }

    // Extract token
    const token = authHeader.split(' ')[1];

    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error) {
      console.error('Auth verification error:', error.message);
      return res.status(401).json({ 
        message: "Invalid or expired token",
        error: error.message 
      });
    }

    if (!user) {
      return res.status(401).json({ 
        message: "User not found" 
      });
    }

    // Attach user data to request object
    req.user = {
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || user.email.split('@')[0],
      ...user.user_metadata
    };

    // Continue to next middleware/route handler
    next();
    
  } catch (error) {
    console.error('Authentication middleware error:', error);
    return res.status(500).json({ 
      message: "Authentication failed",
      error: error.message 
    });
  }
}

/**
 * Optional: Middleware to check if user is authenticated but don't block request
 * Useful for routes that work with or without auth
 */
export async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (!error && user) {
        req.user = {
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email.split('@')[0],
          ...user.user_metadata
        };
      }
    }
    
    // Continue regardless of auth status
    next();
    
  } catch (error) {
    // Log but don't block
    console.warn('Optional auth failed:', error.message);
    next();
  }
}

/**
 * Middleware to check if user has specific role
 * Usage: app.use('/admin', protect, requireRole('admin'))
 */
export function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: "Authentication required" 
      });
    }

    const userRole = req.user.role || 'user';
    
    if (userRole !== role) {
      return res.status(403).json({ 
        message: `Access denied. Required role: ${role}` 
      });
    }

    next();
  };
}

/**
 * Middleware to verify user owns a resource
 * Checks if req.user.id matches a specific field in the resource
 */
export function verifyOwnership(resourceUserIdField = 'user_id') {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: "Authentication required" 
      });
    }

    // This assumes the resource data is already loaded
    // You'll need to customize this based on your route structure
    const resourceUserId = req.resource?.[resourceUserIdField];
    
    if (resourceUserId && resourceUserId !== req.user.id) {
      return res.status(403).json({ 
        message: "You don't have permission to access this resource" 
      });
    }

    next();
  };
}

export default protect;