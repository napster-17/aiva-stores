//src/app/i/[code]/route.ts: Used in partners/dashboard/walkin for shortening the walkin invoice
import { createClient } from '@/lib/supabase/client';
import { NextResponse } from 'next/server';

export const runtime = 'edge'; 

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> } // Change: params is now a Promise
) {
  // Change: We must await params in newer Next.js versions
  const { code } = await params; 
  const supabase = createClient() as any;

  // 1. Fetch the long URL from Supabase
  const { data, error } = await supabase
    .from('short_links')
    .select('destination_url')
    .eq('code', code)
    .single();

  // 2. If code doesn't exist or there is an error, go to home page
  if (error || !data || !data.destination_url) {
    console.error('Redirect error:', error);
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 3. Perform the redirect
  return NextResponse.redirect(data.destination_url, 307);
}