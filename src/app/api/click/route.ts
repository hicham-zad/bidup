import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/utils/supabase-admin';

export async function POST(req: Request) {
  try {
    let id: string | null = null;
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const body = await req.json();
      id = body.id;
    } else {
      const text = await req.text();
      try {
        const parsed = JSON.parse(text);
        id = parsed.id;
      } catch {
        id = text;
      }
    }

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const { data: entry } = await supabase
      .from('entries')
      .select('clicks')
      .eq('id', id)
      .single();

    if (entry) {
      await supabase
        .from('entries')
        .update({ clicks: (entry.clicks ?? 0) + 1 })
        .eq('id', id);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
