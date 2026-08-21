'use client';

import { useEffect, useState } from 'react';

export function HeaderStats() {
  const [stats, setStats] = useState<{ activeUsers: number; last24Hours: number } | null>(null);

  useEffect(() => {
    // Fetch live visitors initially and set up polling
    const fetchVisitors = async () => {
      try {
        const res = await fetch('/api/competing-stats');
        if (res.ok) {
          const data = await res.json();
          if (data && typeof data.activeUsers === 'number') {
            setStats({
              activeUsers: data.activeUsers,
              last24Hours: data.last24Hours ?? 0,
            });
          }
        }
      } catch (err) {
        console.error('Error fetching live visitors:', err);
      }
    };

    fetchVisitors();
    const interval = setInterval(fetchVisitors, 30000); // refresh every 30s

    return () => clearInterval(interval);
  }, []);

  if (!stats) return null;

  return (
    <div className="flex items-center gap-2.5 text-[13px] sm:text-sm border border-[#A8A492]/20 bg-[#FDFBF8]/80 backdrop-blur-sm shadow-sm px-4 py-1.5 rounded-full text-[#524646] font-medium transition-all">
      
      {/* Live Visitors */}
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#EC5B38] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#EC5B38]"></span>
        </span>
        <span className="text-[#EC5B38] font-semibold tracking-tight">
          {stats.activeUsers.toLocaleString()} live visitors
        </span>
      </div>

      <span className="text-[#524646]/30">·</span>

      {/* 24 Hour Stats */}
      <span className="text-[#524646]/80 tracking-tight">
        {stats.last24Hours.toLocaleString()} in the last 24 hours
      </span>

      <span className="text-[#524646]/30">·</span>

      {/* Link to stats */}
      <a 
        href="https://hub.vemetric.com/share/bidup.lol" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="text-[#524646] hover:text-[#EC5B38] transition-colors flex items-center group tracking-tight"
      >
        see stats
        <span className="transform group-hover:translate-x-0.5 transition-transform ml-0.5">→</span>
      </a>

    </div>
  );
}
