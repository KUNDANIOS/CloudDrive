import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from backend root directory
dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY; // Changed from SUPABASE_ANON_KEY

console.log('🔍 Supabase Configuration Check:');
console.log('   URL exists:', !!supabaseUrl);
console.log('   Service Key exists:', !!supabaseServiceKey);

if (!supabaseUrl) {
  throw new Error('❌ SUPABASE_URL is missing from environment variables');
}

if (!supabaseServiceKey) {
  throw new Error('❌ SUPABASE_SERVICE_KEY is missing from environment variables');
}

console.log('✅ Supabase admin client created successfully');

// Create admin client with service role key for backend operations
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});