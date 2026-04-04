
import React from 'react';
import TacticalCard from './TacticalCard';
import { Navigation } from 'lucide-react';

const ArowMonitor: React.FC = () => {
  return (
    <TacticalCard
      title="Artemis Orbit Uplink"
      subtitle="NASA AROW // Live Trajectory"
      icon={<Navigation className="w-3.5 h-3.5" />}
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></div>
            <span className="text-emerald-400">Telemetry Sync: Active</span>
          </div>
          <span className="mono text-slate-600">ID: ARW_772</span>
        </div>
      }
    >
      <div className="relative w-full h-full bg-black overflow-y-auto custom-scrollbar">
        <div className="w-full h-[150%] relative">
          <iframe
            src="https://www.nasa.gov/missions/artemis-ii/arow/"
            className="absolute inset-0 w-full h-full border-0 grayscale-[0.2] hover:grayscale-0 transition-all duration-700"
            title="NASA AROW"
            referrerPolicy="no-referrer"
          />
        </div>
        
        {/* Overlay for better integration */}
        <div className="absolute inset-0 pointer-events-none border-[10px] border-black/20 z-10"></div>
      </div>
    </TacticalCard>
  );
};

export default React.memo(ArowMonitor);
