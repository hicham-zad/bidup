'use client';

import { useEffect, useState } from 'react';

export function HeaderStats() {
  const [onlineCount, setOnlineCount] = useState<number | null>(null);

  useEffect(() => {
    // Only run on client — avoids SSR hydration mismatch
    setOnlineCount(Math.floor(Math.random() * 50) + 1000);

    const interval = setInterval(() => {
      setOnlineCount((prev) => {
        const base = prev ?? 1000;
        const change = Math.floor(Math.random() * 7) - 3;
        return Math.max(800, base + change);
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-3 text-xs sm:text-sm border border-[#A8A492]/40 bg-white/70 backdrop-blur-sm shadow-xs px-4 py-1.5 rounded-full text-[#524646]">
      <div className="flex items-center gap-2 font-medium" suppressHydrationWarning>
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#EC5B38] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#EC5B38]"></span>
        </span>
        <span suppressHydrationWarning className="text-[#524646]">
          {onlineCount !== null ? (
            <>
              <strong className="font-semibold text-[#EC5B38]">{onlineCount.toLocaleString()}</strong> visitors online
            </>
          ) : (
            'visitors online'
          )}
        </span>
      </div>
    </div>
  );
}
