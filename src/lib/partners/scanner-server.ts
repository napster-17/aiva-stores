//src/lib/partners/scanner-server.ts
import 'server-only';

import { createHash, randomBytes } from 'crypto';
import { createClient, type User } from '@supabase/supabase-js';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const scannerAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export function hashScannerToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export function generateScannerToken() {
  return randomBytes(32).toString('hex');
}

export async function getWebScannerUser(): Promise<User | null> {
  const supabase = createRouteHandlerClient({
    cookies: () => cookies(),
  });

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  return error ? null : user;
}

export async function getAppScannerUser(
  request: Request
): Promise<User | null> {
  const authorization = request.headers.get('authorization');

  if (!authorization?.startsWith('Bearer ')) {
    return null;
  }

  const accessToken = authorization.slice(7).trim();

  if (!accessToken) return null;

  const {
    data: { user },
    error,
  } = await scannerAdmin.auth.getUser(accessToken);

  return error ? null : user;
}

export async function isValidScannerStore(userId: string) {
  const { data, error } = await scannerAdmin
    .from('store_profiles')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  return !error && Boolean(data);
}