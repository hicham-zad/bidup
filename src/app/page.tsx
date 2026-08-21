import Link from 'next/link';
import Leaderboard from '@/components/Leaderboard';
import BidForm from '@/components/BidForm';
import { getSupabaseAdmin } from '@/utils/supabase-admin';
import { HeaderStats } from '@/components/HeaderStats';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const supabase = getSupabaseAdmin();

  const { data: entries, error } = await supabase
    .from('entries')
    .select('id, handle, url, title, description, image_url, amount_cents, clicks, last_bid_at')
    .order('amount_cents', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching entries:', error);
  }

  const validEntries = entries || [];
  const topBid = validEntries.length > 0 ? validEntries[0].amount_cents : 0;

  return (
    <main className="min-h-screen bg-[#FCF2E5] text-[#524646] flex flex-col items-center pt-8 sm:pt-10 pb-14 px-4 sm:px-6">

      {/* Logo */}
      <div className="flex items-center justify-center gap-2.5 mb-2">
        <div className="w-7 h-7 md:w-8 md:h-8 text-[#EC5B38] shrink-0">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="3.29 7 12 12 20.71 7"></polyline>
            <line x1="12" y1="22" x2="12" y2="12"></line>
          </svg>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#524646]">
          BidUp<span className="text-[#EC5B38]">.lol</span>
        </h1>
      </div>

      <p className="text-[#524646]/80 text-xs sm:text-sm text-center max-w-lg mb-3.5 leading-relaxed font-sans px-2">
        No ads, no API keys, no revenue sharing. Just outbid your competition to get to the top. Will you take #1 when this site goes viral?
      </p>

      <HeaderStats />

      <div className="mt-6 sm:mt-7 w-full max-w-3xl">
        <BidForm topBid={topBid} />
      </div>

      {/* Leaderboard */}
      <div className="w-full max-w-3xl mt-8 sm:mt-10">
        <Leaderboard initialEntries={validEntries} />
      </div>

      {/* Footer */}
      <footer className="w-full max-w-3xl mt-12 sm:mt-14 pt-6 border-t border-[#A8A492]/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#524646]/75 font-sans">
        {/* Left: Brand */}
        <div className="flex items-center gap-2 font-bold text-sm text-[#524646]">
          <div className="w-5 h-5 text-[#EC5B38] shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.29 7 12 12 20.71 7"></polyline>
              <line x1="12" y1="22" x2="12" y2="12"></line>
            </svg>
          </div>
          <span>bidup<span className="text-[#EC5B38]">.lol</span></span>
        </div>

        {/* Right: Links & Copyright */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs text-[#524646]/80 font-medium">
          <a 
            href="https://outbid.lol" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="underline underline-offset-2 hover:text-[#EC5B38] transition-colors"
          >
            Inspired by outbid.lol
          </a>
          <span className="text-[#A8A492]">·</span>
          <Link href="/rules" className="underline underline-offset-2 hover:text-[#EC5B38] transition-colors">
            Rules
          </Link>
          <span className="text-[#A8A492]">·</span>
          <a href="mailto:hi@bidup.lol" className="hover:text-[#EC5B38] transition-colors">
            Contact
          </a>
          <span className="text-[#A8A492]">·</span>
          <span className="text-[#A8A492]">© 2026. All rights reserved.</span>
        </div>
      </footer>

    </main>
  );
}
