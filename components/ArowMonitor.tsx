
import React from 'react';
import TacticalCard from './TacticalCard';
import { Navigation } from 'lucide-react';

interface Props {
  title?: string;
  subtitle?: string;
  url: string;
  id?: string;
}

const ArowMonitor: React.FC<Props> = ({ 
  title = "Artemis Orbit Uplink", 
  subtitle = "NASA AROW // Live Trajectory",
  url,
  id = "ARW_772"
}) => {
  return (
    <TacticalCard
      title={title}
      subtitle={subtitle}
      icon={<Navigation className="w-3.5 h-3.5" />}
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></div>
            <span className="text-emerald-400">Telemetry Sync: Active</span>
          </div>
          <span className="mono text-slate-600">ID: {id}</span>
        </div>
      }
    >
      <div className="relative w-full h-full bg-black overflow-hidden">
        <iframe
          src={url}
          className="w-full h-full border-0 grayscale-[0.2] hover:grayscale-0 transition-all duration-700"
          title={title}
          referrerPolicy="no-referrer"
        />
        
        {/* Overlay for better integration */}
        <div className="absolute inset-0 pointer-events-none border-[4px] border-black/20 z-10"></div>
      </div>
    </TacticalCard>
  );
};

export default React.memo(ArowMonitor);
