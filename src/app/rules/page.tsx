import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Rules — BidUp.lol',
  description: 'How BidUp.lol works. Short, honest, no fluff.',
};

const rules = [
  {
    n: '01',
    title: 'Highest bid wins the top spot.',
    body: 'The leaderboard is sorted by how much you paid. That\'s it. No algorithm, no clout, no followers required.',
  },
  {
    n: '02',
    title: 'Bids are non-refundable.',
    body: 'Every bid goes through Stripe and is final. You\'re paying for placement, not a promise.',
  },
  {
    n: '03',
    title: 'One entry per URL.',
    body: 'Submitting the same URL again just replaces your previous bid. You keep one slot.',
  },
  {
    n: '04',
    title: 'No NSFW, illegal, or spam content.',
    body: 'We remove entries that link to illegal content, malware, explicit material, or obvious spam — no warning, no refund.',
  },
  {
    n: '05',
    title: 'Your URL must be real.',
    body: 'Broken links, parked domains, or placeholder pages will be removed. Point to something that actually works.',
  },
  {
    n: '06',
    title: 'We reserve the right to remove any entry.',
    body: 'At our sole discretion. We\'re not a court — if something looks off, it\'s gone.',
  },
];

export default function RulesPage() {
  return (
    <main className="min-h-screen bg-[#FCF2E5] text-[#524646] flex flex-col items-center pt-16 pb-24 px-4 sm:px-6">

      {/* Back link */}
      <div className="w-full max-w-2xl mb-12">
        <Link href="/" className="text-[#A8A492] hover:text-[#EC5B38] font-medium transition-colors text-sm">
          ← back to BidUp.lol
        </Link>
      </div>

      {/* Heading */}
      <div className="w-full max-w-2xl mb-10">
        <h1 className="text-3xl font-bold text-[#524646] tracking-tight">Rules</h1>
        <p className="text-[#A8A492] text-sm mt-2 font-medium">Short. Honest. No fluff.</p>
      </div>

      {/* Rules list */}
      <div className="w-full max-w-2xl flex flex-col gap-6">
        {rules.map((r) => (
          <div key={r.n} className="flex gap-5 border-t border-[#A8A492]/30 pt-6">
            <span className="text-[#EC5B38] font-mono text-xs mt-1 shrink-0 w-6 font-bold">{r.n}</span>
            <div>
              <p className="text-[#524646] font-bold text-sm">{r.title}</p>
              <p className="text-[#524646]/75 text-sm mt-1 leading-relaxed">{r.body}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer className="w-full max-w-2xl mt-24 pt-8 border-t border-[#A8A492]/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#524646]/75 font-sans">
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
