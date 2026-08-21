'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
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

function getDomain(url: string): string {
  try {
    let u = url;
    if (!u.startsWith('http')) u = 'https://' + u;
    return new URL(u).hostname.replace('www.', '');
  } catch {
    return url;
  }
}

function isWebUrl(url: string): boolean {
  try {
    const u = url.startsWith('http') ? url : 'https://' + url;
    const parsed = new URL(u);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

function useElapsedTimer(isoDate: string | null) {
  const [elapsed, setElapsed] = useState('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const compute = useCallback(() => {
    if (!isoDate) return '';
    const diffMs = Date.now() - new Date(isoDate).getTime();
    const totalSecs = Math.max(0, Math.floor(diffMs / 1000));
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  }, [isoDate]);

  useEffect(() => {
    setElapsed(compute());
    timerRef.current = setInterval(() => setElapsed(compute()), 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [compute]);

  return elapsed;
}

function timeAgo(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const totalSecs = Math.floor(diffMs / 1000);
  if (totalSecs < 60) return `${totalSecs}s ago`;
  const m = Math.floor(totalSecs / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hour${h > 1 ? 's' : ''} ago`;
  const d = Math.floor(h / 24);
  return `${d} day${d > 1 ? 's' : ''} ago`;
}

function TopCard({ entry }: { entry: Entry }) {
  const elapsed = useElapsedTimer(entry.last_bid_at);
  const nextBid = Math.floor(entry.amount_cents / 100) + 1;

  const stopProp = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div className="relative mb-6 mt-3">
      {/* Crown */}
      <div
        className="absolute -top-[18px] left-2 text-[26px] z-10 select-none -rotate-[18deg]"
        style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.18))' }}
        aria-hidden="true"
      >
        👑
      </div>

      <a
        href={getDestinationUrl(entry.url)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => handleCardClickOuter(entry.id)}
        className="group relative flex flex-row items-start justify-between p-3.5 sm:p-5 rounded-2xl border border-[#E8DFCE] bg-[#FDFAF4] shadow-md hover:shadow-lg transition-shadow duration-200 w-full gap-3"
        style={{ boxShadow: '0 2px 16px 0 rgba(180,155,100,0.10), 0 1px 4px 0 rgba(0,0,0,0.06)' }}
        id={`top-card-${entry.id}`}
      >
        {/* Icon — visible on all sizes */}
        <div className="shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden flex items-center justify-center bg-[#1A1A1A] border border-[#333] shadow-sm mt-0.5">
          {entry.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={entry.image_url}
              alt=""
              className="w-6 h-6 sm:w-7 sm:h-7 object-contain"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="1.5" className="w-5 h-5 sm:w-6 sm:h-6">
              <path d="M9 18V5l12-2v13" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
          )}
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Title row */}
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-bold text-sm sm:text-base text-[#2D2416] group-hover:text-[#7A6535] transition-colors truncate">
              {entry.title || entry.handle}
            </span>
            {isWebUrl(entry.url) && (
              <span className="shrink-0 text-[10px] font-semibold text-[#7A6535] bg-[#EDE4CE] border border-[#D9CBA8] px-1.5 py-0.5 rounded-md tracking-wide uppercase">
                WEB
              </span>
            )}
          </div>

          {/* Description */}
          {entry.description && (
            <p className="text-xs sm:text-sm text-[#7A6535]/80 line-clamp-2 leading-relaxed mb-1 mt-0.5">
              {entry.description}
            </p>
          )}

          {/* Stats row — the live holding timer */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-medium text-[#B8942A] mt-1.5">
            <span className="flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#B8942A] animate-pulse" />
              holding #1 for&nbsp;<strong className="font-mono tabular-nums">{elapsed}</strong>
            </span>
            <span className="text-[#D9CBA8]">·</span>
            <span className="text-[#EC5B38] font-bold">{entry.clicks.toLocaleString()} click{entry.clicks !== 1 ? 's' : ''}</span>
            <span className="text-[#D9CBA8]">·</span>
            <span>{timeAgo(entry.last_bid_at)}</span>
          </div>
        </div>

        {/* Right side — price + steal button, always column-stacked */}
        <div className="shrink-0 flex flex-col items-end justify-between gap-2 self-stretch">
          <span className="font-mono font-bold text-base sm:text-lg text-[#2D2416]">
            ${Math.floor(entry.amount_cents / 100)}
          </span>
          <button
            type="button"
            onClick={(e) => {
              stopProp(e);
              const el = document.getElementById('bid-form');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="shrink-0 text-[11px] sm:text-xs font-semibold text-[#7A6535] border border-[#C9B87A] rounded-lg px-2 sm:px-3 py-1 hover:bg-[#F5EDD8] hover:border-[#B8942A] transition-all whitespace-nowrap"
          >
            steal #1 for ${nextBid}
          </button>
        </div>
      </a>
    </div>
  );
}

// Module-level click tracker (shared with card click handler below)
let _dispatchClick: ((id: string) => void) | null = null;

function handleCardClickOuter(id: string) {
  _dispatchClick?.(id);
}

export default function Leaderboard({ initialEntries }: { initialEntries: Entry[] }) {
  const [entries, setEntries] = useState<Entry[]>(initialEntries);

  const handleCardClick = useCallback((id: string) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, clicks: (e.clicks || 0) + 1 } : e))
    );
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
  }, []);

  // Wire up module-level dispatcher
  useEffect(() => {
    _dispatchClick = handleCardClick;
    return () => { _dispatchClick = null; };
  }, [handleCardClick]);

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

  const top = entries[0];
  const rest = entries.slice(1);

  return (
    <div className="w-full flex flex-col font-sans relative">
      {/* Refresh Button */}
      <div className="flex justify-start mb-4">
        <button
          className="flex items-center gap-1.5 text-xs font-medium text-[#524646] bg-white hover:bg-[#FCF2E5] border border-[#A8A492]/40 px-3 py-1 rounded-full shadow-2xs transition-colors"
          onClick={() => window.location.reload()}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-[#A8A492]">
            <path d="M21 2v6h-6" />
            <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
            <path d="M3 22v-6h6" />
            <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
          </svg>
          Refresh
        </button>
      </div>

      {/* #1 Card */}
      {top && <TopCard entry={top} />}

      {/* Rest of leaderboard */}
      <div className="flex flex-col gap-2">
        {rest.map((entry, i) => {
          const index = i + 1; // 0-indexed rest → rank 2+
          return (
            <a
              key={entry.id}
              href={getDestinationUrl(entry.url)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleCardClick(entry.id)}
              className="group relative flex flex-row items-center justify-between p-3 sm:p-4 rounded-2xl transition-all duration-200 border bg-white border-[#A8A492]/30 hover:border-[#524646]/40 shadow-2xs gap-3"
              id={`entry-card-${entry.id}`}
            >
              {/* Rank badge */}
              <span className="shrink-0 w-6 text-center font-bold text-xs text-[#A8A492] tabular-nums">
                #{index + 1}
              </span>

              {/* Icon — visible on all sizes */}
              <div className="shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden flex items-center justify-center bg-[#FCF2E5] border border-[#A8A492]/30">
                {entry.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={entry.image_url}
                    alt=""
                    className="w-6 h-6 object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 sm:w-5 sm:h-5 text-[#A8A492]">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                )}
              </div>

              {/* Text content */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm sm:text-base truncate text-[#524646] group-hover:text-[#EC5B38] transition-colors">
                  {entry.title || entry.handle}
                </h3>
                {entry.description && (
                  <p className="text-xs text-[#524646]/75 line-clamp-2 mt-0.5 leading-relaxed">
                    {entry.description}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-0.5 sm:mt-1.5 text-xs text-[#A8A492]">
                  <span className="truncate max-w-[120px] sm:max-w-[200px] text-[#A8A492] font-medium">{getDomain(entry.url)}</span>
                  <span className="w-1 h-1 rounded-full bg-[#A8A492] shrink-0" />
                  <span className="font-bold text-[#EC5B38] shrink-0">{entry.clicks.toLocaleString()} clicks</span>
                </div>
              </div>

              {/* Price — always on right */}
              <div className="shrink-0">
                <p className="font-mono text-sm sm:text-base font-bold text-[#524646]">
                  {(entry.amount_cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })}
                </p>
              </div>
            </a>
          );
        })}
      </div>

      {entries.length === 0 && (
        <div className="text-center p-8 bg-white rounded-2xl border border-[#A8A492]/40 text-[#524646]/70 font-sans shadow-2xs text-sm">
          No bids yet. Be the first to claim #1!
        </div>
      )}
    </div>
  );
}
