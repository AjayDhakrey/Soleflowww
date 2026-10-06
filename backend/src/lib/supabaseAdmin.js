import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { logger } from './logger.js';

dotenv.config();

// URL is read from env only (SUPABASE_URL, or the VITE_/NEXT_PUBLIC_ names the root .env uses)
const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error(
    '[soleflow] FATAL: No Supabase URL configured. Set SUPABASE_URL (or VITE_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL) in the environment.'
  );
}

if (!serviceRoleKey) {
  console.error(
    '[soleflow] FATAL: SUPABASE_SERVICE_ROLE_KEY is not set. Authenticated API routes will respond 503 until it is provided.'
  );
}

export const supabaseAdmin = supabaseUrl && serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;
