'use client';

import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/utils/supabase';

type Entry = {
  id: string;
  handle: string;
  url: string;
  title: string | null;
  description: string | null;
  image_url: string | null;
  amount_cents: number;
  clicks: number;
  last_bid_at: string;
};

function getDestinationUrl(url: string) {
  let destination = url;
  if (!destination.startsWith('http://') && !destination.startsWith('https://')) {
    destination = 'https://' + destination;
  }
  try {
    const parsed = new URL(destination);
    parsed.searchParams.set('utm_source', 'bidup');
    return parsed.toString();
  } catch {
    const separator = destination.includes('?') ? '&' : '?';
    return `${destination}${separator}utm_source=bidup`;
  }
}

export default function Leaderboard({ initialEntries }: { initialEntries: Entry[] }) {
  const [entries, setEntries] = useState<Entry[]>(initialEntries);

  const handleCardClick = (id: string) => {
    // Optimistic UI update
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, clicks: (e.clicks || 0) + 1 } : e))
    );

    // Track click in database
    try {
      if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
        navigator.sendBeacon('/api/click', JSON.stringify({ id }));
      } else {
        fetch('/api/click', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
          keepalive: true,
        }).catch(() => {});
      }
    } catch {}
  };

  useEffect(() => {
    let supabase: ReturnType<typeof getSupabaseClient>;
    try {
      supabase = getSupabaseClient();
    } catch (e) {
      console.error('Supabase client not configured for realtime yet', e);
      return;
    }

    const channel = supabase
      .channel('leaderboard-entries')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'entries' },
        (payload) => {
          const updated = payload.new as Entry;
          setEntries((prev) =>
            prev.map((e) => (e.id === updated.id ? { ...e, ...updated } : e))
          );
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'entries' },
        (payload) => {
          const newEntry = payload.new as Entry;
          setEntries((prev) => {
            // Insert and re-sort by amount_cents desc
            const next = [...prev.filter((e) => e.id !== newEntry.id), newEntry];
            return next.sort((a, b) => b.amount_cents - a.amount_cents);
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="w-full flex flex-col gap-2.5 font-sans relative">
      {/* Refresh Button */}
      <div className="flex justify-start mb-1">
         <button className="flex items-center gap-1.5 text-xs font-medium text-[#524646] bg-white hover:bg-[#FCF2E5] border border-[#A8A492]/40 px-3 py-1 rounded-full shadow-2xs transition-colors"
                 onClick={() => window.location.reload()}>
           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-[#A8A492]">
             <path d="M21 2v6h-6"></path>
             <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
             <path d="M3 22v-6h6"></path>
             <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
           </svg>
           Refresh
         </button>
      </div>

      {entries.map((entry, index) => {
        const isFirst = index === 0;
        return (
          <a
            key={entry.id}
            href={getDestinationUrl(entry.url)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleCardClick(entry.id)}
            className={`group relative flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 sm:p-4.5 rounded-2xl transition-all duration-200 border ${
              isFirst
                ? 'bg-white border-2 border-[#EC5B38] shadow-2xs'
                : 'bg-white border-[#A8A492]/30 hover:border-[#524646]/40 shadow-2xs'
            }`}
          >
            <div className="flex items-start sm:items-center gap-3.5 sm:gap-5 w-full">
              {/* Rank Badge */}
              <div className={`shrink-0 flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full font-bold text-xs sm:text-sm ${
                isFirst ? 'bg-[#EC5B38] text-white shadow-2xs' :
                'bg-[#FCF2E5] text-[#524646] border border-[#A8A492]/40 group-hover:bg-white transition-colors'
              }`}>
                #{index + 1}
              </div>
              
              {/* Real favicon / icon from scraped data */}
              <div className="hidden sm:flex shrink-0 w-11 h-11 rounded-xl overflow-hidden items-center justify-center bg-[#FCF2E5] border border-[#A8A492]/30">
                {entry.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={entry.image_url}
                    alt=""
                    className="w-7 h-7 object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={`w-5 h-5 ${isFirst ? 'text-[#EC5B38]' : 'text-[#A8A492]'}`}>
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="2" y1="12" x2="22" y2="12"></line>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                  </svg>
                )}
              </div>

              <div className="flex-1 min-w-0 pr-3">
                <h3 className="font-bold text-sm sm:text-base truncate text-[#524646] group-hover:text-[#EC5B38] transition-colors">
                  {entry.title || entry.handle}
                </h3>
                {entry.description && (
                  <p className="text-xs sm:text-sm text-[#524646]/75 line-clamp-2 mt-0.5 leading-relaxed">
                    {entry.description}
                  </p>
                )}
                <div className="flex items-center gap-2.5 mt-1.5 text-xs text-[#A8A492]">
                   <span className="truncate max-w-[180px] text-[#A8A492] font-medium">{entry.url.replace(/^https?:\/\//, '')}</span>
                   <span className="w-1 h-1 rounded-full bg-[#A8A492] shrink-0"></span>
                   <span className="font-semibold text-[#524646]/70 group-hover:text-[#524646] transition-colors shrink-0">{entry.clicks.toLocaleString()} clicks</span>
                </div>
              </div>
            </div>
            
            <div className="mt-3 sm:mt-0 ml-11 sm:ml-0 shrink-0">
              <p className={`font-mono text-base sm:text-lg font-bold ${isFirst ? 'text-[#EC5B38]' : 'text-[#524646]'}`}>
                {(entry.amount_cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })}
              </p>
            </div>

            {/* If first, add the takeover badge below */}
            {isFirst && (
               <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#EC5B38] text-white px-3 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap shadow-2xs hidden sm:flex items-center">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-white mr-1.5 animate-pulse"></span>
                  {entry.handle} took over the leaderboard
               </div>
            )}
          </a>
        );
      })}

      {entries.length === 0 && (
        <div className="text-center p-8 bg-white rounded-2xl border border-[#A8A492]/40 text-[#524646]/70 font-sans shadow-2xs text-sm">
          No bids yet. Be the first to claim #1!
        </div>
      )}
    </div>
  );
}
