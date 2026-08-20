import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/utils/supabase-admin';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  if (!id) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  const supabase = getSupabaseAdmin();

  // Fetch the URL to redirect to
  const { data: entry } = await supabase
    .from('entries')
    .select('url, clicks')
    .eq('id', id)
    .single();

  if (!entry || !entry.url) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // Atomically increment clicks — fire and forget
  supabase
    .from('entries')
    .update({ clicks: (entry.clicks ?? 0) + 1 })
    .eq('id', id)
    .then(); // Supabase realtime will broadcast the UPDATE event to subscribed clients

  // Ensure URL is absolute
  let destination = entry.url;
  if (!destination.startsWith('http://') && !destination.startsWith('https://')) {
    destination = 'https://' + destination;
  }

  // Append utm_source=bidup
  try {
    const parsed = new URL(destination);
    parsed.searchParams.set('utm_source', 'bidup');
    destination = parsed.toString();
  } catch {
    const separator = destination.includes('?') ? '&' : '?';
    destination = `${destination}${separator}utm_source=bidup`;
  }

  return NextResponse.redirect(destination);
}
