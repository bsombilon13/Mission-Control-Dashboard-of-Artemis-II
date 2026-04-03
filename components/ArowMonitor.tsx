
import React from 'react';

const ArowMonitor: React.FC = () => {
  return (
    <div className="glass rounded-2xl border border-white/10 flex flex-col h-full bg-black overflow-hidden shadow-2xl relative group">
      {/* Floating Tactical Label */}
      <div className="absolute top-3 left-3 z-30 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="bg-black/90 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg flex flex-col">
          <h3 className="text-[8px] uppercase tracking-[0.25em] font-black text-slate-300">Artemis Orbit Uplink</h3>
          <span className="text-[7px] text-blue-400 mono font-bold uppercase tracking-widest">NASA AROW // Live Trajectory</span>
        </div>
      </div>

      <div className="flex-1 min-h-0 relative overflow-hidden">
        <iframe
          src="https://www.nasa.gov/missions/artemis-ii/arow/"
          className="absolute inset-0 w-full h-full border-0"
          title="NASA AROW"
          scrolling="no"
        />
      </div>

      {/* Floating Status Indicator */}
      <div className="absolute bottom-3 right-3 z-30 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="bg-black/90 backdrop-blur-md border border-white/10 px-2 py-1 rounded-md flex items-center space-x-2">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.5)] animate-pulse"></div>
          <span className="text-[7px] font-bold uppercase tracking-widest text-slate-400">Real-time Sync</span>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ArowMonitor);
