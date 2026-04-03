
import React from 'react';
import { PrimaryFeed } from './LiveFeeds';

interface Props {
  videoIds: string[];
}

const MissionVisualFeeds: React.FC<Props> = ({ videoIds }) => {
  return (
    <div className="glass rounded-2xl border border-white/10 flex flex-col h-full bg-black overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black border-b border-white/10 z-30 shrink-0">
        <div className="flex flex-col">
          <h3 className="text-[10px] uppercase tracking-[0.25em] font-black text-slate-300">Mission Visual Feeds</h3>
          <div className="flex items-center space-x-2">
            <span className="text-[8px] text-blue-400 mono font-bold uppercase tracking-widest">Dual-Stream Uplink</span>
            <span className="text-[8px] text-slate-600 mono">|</span>
            <span className="text-[8px] text-emerald-400 mono font-bold animate-pulse uppercase tracking-widest">Signal: Optimal</span>
          </div>
        </div>
        <div className="flex space-x-2">
          <div className="flex items-center space-x-1">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
            <span className="text-[8px] mono text-blue-400 font-bold uppercase">UP</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[8px] mono text-emerald-400 font-bold uppercase">DOWN</span>
          </div>
        </div>
      </div>

      {/* Content Area - Vertical Stack for 2 Feeds */}
      <div className="flex-1 min-h-0 p-4 overflow-hidden flex flex-col space-y-4">
        <div className="flex-1 min-h-0 relative group">
          <div className="absolute -top-2 -left-2 z-10 px-2 py-0.5 bg-blue-600 text-[8px] font-black text-white rounded skew-x-[-15deg] shadow-lg">CAM-01 // UP</div>
          <PrimaryFeed videoId={videoIds[0]} />
        </div>
        <div className="flex-1 min-h-0 relative group">
          <div className="absolute -top-2 -left-2 z-10 px-2 py-0.5 bg-emerald-600 text-[8px] font-black text-white rounded skew-x-[-15deg] shadow-lg">CAM-02 // DOWN</div>
          <PrimaryFeed videoId={videoIds[1]} />
        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-black border-t border-white/10 px-4 py-2 flex justify-between items-center text-[8px] font-bold uppercase tracking-[0.2em] text-slate-500 shrink-0">
        <div className="flex items-center space-x-4">
          <span>Active Streams: 2</span>
          <span>Bandwidth: 24.1 Mbps</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]"></div>
          <span>Encryption: AES-256</span>
        </div>
      </div>
    </div>
  );
};

export default React.memo(MissionVisualFeeds);
