
import React from 'react';
import { PrimaryFeed } from './LiveFeeds';
import TacticalCard from './TacticalCard';
import { Video } from 'lucide-react';

interface Props {
  videoIds: string[];
}

const MissionVisualFeeds: React.FC<Props> = ({ videoIds }) => {
  return (
    <TacticalCard
      title="Mission Visual Feeds"
      subtitle="Dual-Stream Uplink // Signal: Optimal"
      icon={<Video className="w-3.5 h-3.5" />}
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-4">
            <span>Active Streams: 2</span>
            <span>Bandwidth: 24.1 Mbps</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]"></div>
            <span>Encryption: AES-256</span>
          </div>
        </div>
      }
    >
      <div className={`h-full p-2 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 transition-colors duration-500 ${
        document.documentElement.classList.contains('light') ? 'bg-slate-50/50' : 'bg-black/20'
      }`}>
        <div className="flex-1 min-h-0 relative group">
          <div className="absolute top-2 left-2 z-10 px-2 py-0.5 bg-blue-600/80 backdrop-blur-md text-[8px] font-black text-white rounded border border-blue-400/30 shadow-lg uppercase tracking-widest">CAM-01 // UP</div>
          <PrimaryFeed videoId={videoIds[0]} />
        </div>
        <div className="flex-1 min-h-0 relative group">
          <div className="absolute top-2 left-2 z-10 px-2 py-0.5 bg-emerald-600/80 backdrop-blur-md text-[8px] font-black text-white rounded border border-emerald-400/30 shadow-lg uppercase tracking-widest">CAM-02 // DOWN</div>
          <PrimaryFeed videoId={videoIds[1]} />
        </div>
      </div>
    </TacticalCard>
  );
};

export default React.memo(MissionVisualFeeds);
