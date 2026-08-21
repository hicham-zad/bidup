'use client';

import { useState, useEffect, useRef } from 'react';

type SiteMeta = {
  title: string | null;
  description: string | null;
  image: string | null;
  favicon: string | null;
  url: string;
};

export default function BidForm({ topBid }: { topBid: number }) {
  const minBid = topBid / 100 + 1;
  const [handle, setHandle] = useState('');
  const [amount, setAmount] = useState(String(Math.ceil(minBid)));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [meta, setMeta] = useState<SiteMeta | null>(null);
  const [fetchingMeta, setFetchingMeta] = useState(false);
  const [urlFound, setUrlFound] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced URL meta fetch
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = handle.trim();
    if (!trimmed || trimmed.startsWith('@') || trimmed.length < 5) {
      setMeta(null);
      setUrlFound(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setFetchingMeta(true);
      try {
        const res = await fetch(`/api/fetch-meta?url=${encodeURIComponent(trimmed)}`);
        if (res.ok) {
          const data = await res.json();
          setMeta(data);
          setUrlFound(true);
        } else {
          setMeta(null);
          setUrlFound(false);
        }
      } catch {
        setMeta(null);
        setUrlFound(false);
      } finally {
        setFetchingMeta(false);
      }
    }, 700);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [handle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    let parsedHandle = handle.trim();
    let parsedUrl = meta?.url || handle.trim();

    if (parsedHandle.startsWith('@')) {
      parsedUrl = `https://twitter.com/${parsedHandle.substring(1)}`;
    } else if (!parsedUrl.startsWith('http')) {
      parsedUrl = `https://${parsedUrl}`;
    }

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          handle: parsedHandle,
          url: parsedUrl,
          amount_cents: Math.round(parseFloat(amount) * 100),
          title: meta?.title || '',
          description: meta?.description || '',
          image_url: meta?.favicon || meta?.image || '',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      window.location.href = data.url;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div id="bid-form" className="w-full max-w-3xl flex flex-col items-center">
      {/* Interactive Claim & Bid Stepper */}
      <div className="flex flex-col items-center gap-2 mb-5">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-2xl sm:text-4xl font-bold tracking-tight text-[#524646]">
          <h2>Claim #1 for</h2>
          
          <div className="inline-flex items-center bg-white border border-[#A8A492]/40 rounded-2xl p-1 shadow-xs">
            <button
              type="button"
              onClick={() => {
                setAmount((prev) => {
                  const val = parseFloat(prev) || Math.ceil(minBid);
                  return String(Math.max(Math.ceil(minBid), val - 1));
                });
              }}
              disabled={parseFloat(amount) <= Math.ceil(minBid)}
              className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl text-[#524646] hover:bg-[#FCF2E5] disabled:opacity-25 disabled:cursor-not-allowed transition-colors text-xl font-bold active:scale-95"
              aria-label="Decrease bid price"
            >
              −
            </button>
            
            <div className="flex items-center px-1 text-[#EC5B38]">
              <span className="text-xl sm:text-3xl font-bold mr-0.5">$</span>
              <input
                type="number"
                min={Math.ceil(minBid)}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-14 sm:w-20 bg-transparent border-none p-0 text-center font-mono font-bold focus:outline-none focus:ring-0 text-2xl sm:text-4xl text-[#EC5B38]"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                setAmount((prev) => {
                  const val = parseFloat(prev) || 0;
                  return String(val + 1);
                });
              }}
              className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl text-[#524646] hover:bg-[#FCF2E5] transition-colors text-xl font-bold active:scale-95"
              aria-label="Increase bid price"
            >
              +
            </button>
          </div>
        </div>

        {/* Quick Increment Buttons */}
        <div className="flex items-center gap-1.5 text-xs text-[#524646]/80 font-sans">
          <span className="text-[#A8A492] text-[11px]">Quick add:</span>
          {[1, 5, 10, 25].map((inc) => (
            <button
              key={inc}
              type="button"
              onClick={() => {
                setAmount((prev) => {
                  const val = parseFloat(prev) || Math.ceil(minBid);
                  return String(val + inc);
                });
              }}
              className="bg-white hover:bg-[#FCF2E5] border border-[#A8A492]/40 px-2 py-0.5 rounded-lg font-medium text-[#524646] hover:text-[#EC5B38] hover:border-[#EC5B38]/50 transition-all active:scale-95 shadow-2xs"
            >
              +${inc}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="w-full flex flex-col items-center gap-3">
        {/* URL / Handle input */}
        <div
          className={`w-full relative flex items-center bg-white border rounded-2xl transition-all duration-200 shadow-2xs ${
            isHovered || handle ? 'border-[#EC5B38] ring-1 ring-[#EC5B38]/30' : 'border-[#A8A492]/40'
          }`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="pl-4 pr-1 text-[#A8A492]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
          </div>
          <input
            type="text"
            required
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            className="w-full bg-transparent border-none py-3.5 px-2 text-[#524646] placeholder-[#A8A492] focus:outline-none focus:ring-0 text-sm md:text-base font-medium"
            placeholder="Your product URL or @handle"
          />
          {fetchingMeta && (
            <div className="pr-4 text-[#A8A492] animate-pulse text-xs">fetching…</div>
          )}
          <button
            type="submit"
            disabled={loading}
            onAnimationEnd={() => setUrlFound(false)}
            className={`m-1.5 shrink-0 bg-[#EC5B38] text-white font-bold py-2 px-5 rounded-xl transition-all shadow-2xs disabled:opacity-50 active:scale-95 text-sm ${
              urlFound
                ? 'animate-bid-cta'
                : 'hover:bg-[#d94d2c]'
            }`}
          >
            {loading ? 'Processing...' : 'Outbid ↑'}
          </button>
        </div>

        {/* Live preview card */}
        {meta && (
          <div className="w-full flex items-start gap-3.5 p-3.5 bg-white border border-[#EC5B38]/40 rounded-2xl shadow-2xs animate-in fade-in duration-200">
            {/* Favicon / icon */}
            <div className="shrink-0 w-11 h-11 rounded-xl overflow-hidden bg-[#FCF2E5] flex items-center justify-center border border-[#A8A492]/40">
              {meta.favicon ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={meta.favicon}
                  alt=""
                  className="w-7 h-7 object-contain"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 text-[#A8A492]">
                  <circle cx="12" cy="12" r="10"></circle>
                </svg>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[#524646] font-bold text-sm truncate">{meta.title || handle}</p>
              {meta.description && (
                <p className="text-[#524646]/70 text-xs mt-0.5 line-clamp-2 leading-relaxed">{meta.description}</p>
              )}
              <p className="text-[#EC5B38] font-medium text-xs mt-0.5 truncate">{meta.url}</p>
            </div>
          </div>
        )}

        {error && <div className="text-red-500 text-xs w-full font-medium">{error}</div>}
      </form>

      {/* Takeover pill */}
      <div className="mt-4 border border-[#A8A492]/40 bg-white/70 backdrop-blur-sm px-5 py-2 rounded-full text-xs flex items-center gap-2 shadow-2xs">
        <span className="text-[#EC5B38] font-semibold">Leaderboard takeover is live.</span>
        <span className="text-[#524646]/70">The first page is locked · 1h 36m left.</span>
      </div>
    </div>
  );
}
