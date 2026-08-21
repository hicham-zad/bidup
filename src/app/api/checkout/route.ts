import { NextResponse } from 'next/server';
import { stripe } from '@/utils/stripe';
import { getSupabaseAdmin } from '@/utils/supabase-admin';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url, handle, amount_cents, title, description, image_url } = body;

    if (!url || !handle || !amount_cents) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (amount_cents < 100) {
      return NextResponse.json({ error: 'Minimum bid is $1.00' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    
    // Check if entry exists to validate minimum bid if it's an update
    const { data: existing } = await supabase
      .from('entries')
      .select('amount_cents')
      .eq('handle', handle)
      .eq('url', url)
      .single();

    if (existing && amount_cents <= existing.amount_cents) {
      return NextResponse.json(
        { error: `Bid must be higher than your current bid of $${(existing.amount_cents / 100).toFixed(2)}` },
        { status: 400 }
      );
    }

    // Check top bid if this is a new bid aiming for #1 (Optional anti-abuse logic)
    // We could enforce that the user must outbid the #1 spot if they want, but the requirement said: 
    // "Minimum bid = current #1 + $1" - wait, the user spec specifically says:
    // "Minimum bid = current #1 + $1 (enforce server-side in the checkout-session route)"
    const { data: topEntry } = await supabase
      .from('entries')
      .select('amount_cents')
      .order('amount_cents', { ascending: false })
      .limit(1)
      .single();

    const topBid = topEntry?.amount_cents || 0;
    
    // If we want to strictly enforce that ANY bid must outbid the #1 spot:
    if (amount_cents < topBid + 100) {
       return NextResponse.json(
         { error: `To claim #1, you must bid at least $${((topBid + 100) / 100).toFixed(2)}` },
         { status: 400 }
       );
    }

    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Rank Bid for ${handle}`,
              description: `Bid for URL: ${url}`,
            },
            unit_amount: amount_cents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_creation: 'always',
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/`,
      metadata: {
        url,
        handle,
        title: title || '',
        description: description || '',
        image_url: image_url || '',
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
