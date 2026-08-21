'use client';

import { useEffect, useState } from 'react';

export function HeaderStats() {
  const [stats, setStats] = useState<{ activeUsers: number; lastHour: number } | null>(null);

  useEffect(() => {
    // Fetch live visitors initially and set up polling
    const fetchVisitors = async () => {
      try {
        const res = await fetch('/api/live-stats');
        if (res.ok) {
          const data = await res.json();
          if (data && typeof data.activeUsers === 'number') {
            setStats({
              activeUsers: data.activeUsers,
              lastHour: 3297, // Hardcoded placeholder until Datafast docs are fixed
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

  // Show skeleton immediately; fill in real count once the fetch resolves.
  const isLoaded = stats !== null;

  return (
    <div className="flex items-center gap-2.5 text-[13px] sm:text-sm border border-[#A8A492]/20 bg-[#FDFBF8]/80 backdrop-blur-sm shadow-sm px-4 py-1.5 rounded-full text-[#524646] font-medium transition-all">
      
      {/* Live Visitors */}
      <div className="flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#10B981]"></span>
        </span>
        <span className="text-[#10B981] font-semibold tracking-tight">
          {isLoaded ? (
            <>{stats.activeUsers.toLocaleString()} visitors online</>
          ) : (
            <span className="inline-block w-24 h-3.5 rounded bg-[#10B981]/20 animate-pulse align-middle" />
          )}
        </span>
      </div>

      <span className="text-[#524646]/30 font-bold">·</span>

      {/* Link to stats */}
      <a 
        href="https://datafa.st/share/6a879f1e8b4dc6b85f0c9bc7" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="text-[#524646] hover:text-[#10B981] transition-colors flex items-center group tracking-tight"
      >
        see stats
        <span className="transform group-hover:translate-x-0.5 transition-transform ml-0.5 font-bold">→</span>
      </a>

    </div>
  );
}

