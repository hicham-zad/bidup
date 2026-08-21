import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/utils/supabase-admin';

/**
 * GET /api/cron
 *
 * Lightweight cron endpoint — returns the current #1 entry stats.
 * Call this every minute from your scheduler (Vercel Cron / GitHub Actions).
 *
 * Optionally protected by CRON_SECRET env var:
 *   Authorization: Bearer <CRON_SECRET>
 */
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = req.headers.get('authorization') ?? '';
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    const supabase = getSupabaseAdmin();

    const { data: top, error } = await supabase
      .from('entries')
      .select('id, handle, amount_cents, last_bid_at, clicks')
      .order('amount_cents', { ascending: false })
      .limit(1)
      .single();

    if (error || !top) {
      return NextResponse.json({ ok: true, message: 'No entries yet' });
    }

    const holdingMs = Date.now() - new Date(top.last_bid_at).getTime();
    const holdingSecs = Math.floor(holdingMs / 1000);
    const h = Math.floor(holdingSecs / 3600);
    const m = Math.floor((holdingSecs % 3600) / 60);
    const s = holdingSecs % 60;

    return NextResponse.json({
      ok: true,
      top: {
        id: top.id,
        handle: top.handle,
        amount_cents: top.amount_cents,
        clicks: top.clicks,
        last_bid_at: top.last_bid_at,
        holding_duration: `${h}h ${m}m ${s}s`,
      },
      checked_at: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
