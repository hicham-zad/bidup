import { NextResponse } from 'next/server';
import { stripe } from '@/utils/stripe';
import { getSupabaseAdmin } from '@/utils/supabase-admin';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature') as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error.message);
    return NextResponse.json({ error: 'Webhook Error' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    
    // We only care about paid sessions
    if (session.payment_status === 'paid') {
      const metadata = session.metadata;
      const amount_cents = session.amount_total; // This is the total paid in cents

      if (metadata && metadata.url && metadata.handle) {
        const supabase = getSupabaseAdmin();
        
        // 1. Check if the entry already exists
        const { data: existing } = await supabase
          .from('entries')
          .select('id, amount_cents, lifetime_cents')
          .eq('handle', metadata.handle)
          .eq('url', metadata.url)
          .single();

        if (existing) {
          // Upsert: update amount_cents (only if higher) and add to lifetime_cents
          const newAmountCents = Math.max(existing.amount_cents, amount_cents);
          const newLifetimeCents = existing.lifetime_cents + amount_cents;
          
          await supabase
            .from('entries')
            .update({
              amount_cents: newAmountCents,
              lifetime_cents: newLifetimeCents,
              title: metadata.title || null,
              description: metadata.description || null,
              image_url: metadata.image_url || null,
              last_bid_at: new Date().toISOString(),
            })
            .eq('id', existing.id);
        } else {
          // Insert new row
          await supabase
            .from('entries')
            .insert({
              url: metadata.url,
              handle: metadata.handle,
              title: metadata.title || null,
              description: metadata.description || null,
              image_url: metadata.image_url || null,
              amount_cents: amount_cents,
              lifetime_cents: amount_cents,
              last_bid_at: new Date().toISOString(),
            });
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
