
import React, { useMemo } from 'react';
import { MISSION_EVENTS } from './MissionTimeline';
import TacticalCard from './TacticalCard';
import { Route } from 'lucide-react';

interface Props {
  elapsedSeconds: number;
  isCompact?: boolean;
}

const MAJOR_MILESTONES = [
  { label: "Countdown Start", offset: -175200, color: "amber" },
  { label: "Liftoff", offset: 0, color: "blue" },
  { label: "Staging", offset: 128, color: "blue" },
  { label: "Apogee Raise", offset: 6477, color: "cyan" },
  { label: "TLI Burn", offset: 92220, color: "indigo" },
  { label: "Lunar Flyby", offset: 436980, color: "purple" },
  { label: "Splashdown", offset: 783960, color: "emerald" }
];

const HorizontalTimeline: React.FC<Props> = ({ elapsedSeconds, isCompact }) => {
  const minOffset = MAJOR_MILESTONES[0].offset;
  const maxOffset = MAJOR_MILESTONES[MAJOR_MILESTONES.length - 1].offset;
  const totalDuration = maxOffset - minOffset;
  
  const progress = useMemo(() => {
    if (elapsedSeconds <= minOffset) return 0;
    if (elapsedSeconds >= maxOffset) return 100;
    return ((elapsedSeconds - minOffset) / totalDuration) * 100;
  }, [elapsedSeconds, minOffset, totalDuration, maxOffset]);

  const nextSequenceMilestone = useMemo(() => {
    return MISSION_EVENTS.find(m => m.offsetSeconds > elapsedSeconds);
  }, [elapsedSeconds]);

  const formatCountdown = (seconds: number) => {
    const abs = Math.abs(seconds);
    const d = Math.floor(abs / 86400);
    const h = Math.floor((abs % 86400) / 3600);
    const m = Math.floor((abs % 3600) / 60);
    const s = Math.floor(abs % 60);
    
    let parts = [];
    if (d > 0) parts.push(`${d}d`);
    parts.push(`${h.toString().padStart(2, '0')}h`);
    parts.push(`${m.toString().padStart(2, '0')}m`);
    parts.push(`${s.toString().padStart(2, '0')}s`);
    return parts.join(":");
  };

  const content = (
    <div className="flex flex-col justify-center h-full">
      <div className={`flex justify-between items-center relative z-10 ${isCompact ? 'mb-2' : 'mb-4'}`}>
        <div className="flex flex-col">
          {!isCompact && <span className="text-[8px] sm:text-[10px] text-slate-400 uppercase tracking-[0.3em] font-black leading-none">Global Trajectory</span>}
          <div className="flex items-baseline space-x-2 mt-1">
            <span className={`${isCompact ? 'text-lg' : 'text-2xl'} font-black mono text-white tracking-tighter`}>
              {progress.toFixed(3)}<span className="text-xs text-blue-400 ml-1">%</span>
            </span>
            {!isCompact && <span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">Index</span>}
          </div>
        </div>

        {nextSequenceMilestone && (
          <div className={`flex flex-col items-end bg-blue-500/10 border border-blue-400/30 rounded-lg ${isCompact ? 'px-2 py-1' : 'px-3 py-1.5'}`}>
            <span className="text-[7px] sm:text-[8px] text-blue-300 uppercase tracking-[0.2em] font-black mb-0.5 flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse mr-1.5"></span>
              Next: {nextSequenceMilestone.label.split(':')[0]}
            </span>
            <div className={`${isCompact ? 'text-xs' : 'text-sm'} font-black mono text-white tabular-nums tracking-tight`}>
              T-{formatCountdown(nextSequenceMilestone.offsetSeconds - elapsedSeconds)}
            </div>
          </div>
        )}
      </div>
      
      <div className={`relative flex items-center z-10 ${isCompact ? 'h-8' : 'h-12'}`}>
        <div className="absolute left-0 right-0 h-1.5 bg-slate-950 rounded-full border border-white/10 shadow-inner"></div>
        
        <div 
          className="absolute left-0 h-1.5 bg-gradient-to-r from-blue-700 via-blue-500 to-blue-400 rounded-full transition-all duration-1000 ease-out z-10"
          style={{ width: `${progress}%`, boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)' }}
        >
          <div className="absolute top-0 left-0 w-full h-full bg-white/20 animate-pulse rounded-full"></div>
        </div>

        {!isCompact && MAJOR_MILESTONES.map((m, i) => {
          const mPos = ((m.offset - minOffset) / totalDuration) * 100;
          const isReached = elapsedSeconds >= m.offset;
          const isNext = nextSequenceMilestone?.label.includes(m.label);
          
          return (
            <div 
              key={i} 
              className="absolute flex flex-col items-center z-20" 
              style={{ left: `${mPos}%`, transform: 'translateX(-50%)' }}
            >
              <div className="relative">
                {isNext && (
                   <div className="absolute inset-0 w-4 h-4 -left-1 -top-1 rounded-full bg-blue-400/30 animate-ping"></div>
                )}
                
                <div className={`w-2 h-2 rounded-full border transition-all duration-500 ${
                  isReached ? 'bg-blue-400 border-white scale-110' : 'bg-slate-800 border-slate-600'
                }`}></div>
                
                <div className={`absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center transition-all duration-500 ${
                  isReached ? 'opacity-100 translate-y-0' : 'opacity-40 translate-y-1'
                }`}>
                  <span className={`text-[7px] sm:text-[8px] font-black whitespace-nowrap px-1.5 py-0.5 rounded ${
                    isReached ? 'text-white bg-blue-600/20' : 'text-slate-500'
                  }`}>
                    {m.label}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        
        <div 
          className="absolute z-30 transition-all duration-1000 ease-out"
          style={{ left: `${progress}%`, transform: 'translateX(-50%)' }}
        >
          <div className={`flex flex-col items-center ${isCompact ? '-mt-6' : '-mt-8'}`}>
            <div className="px-1.5 py-0.5 bg-white text-slate-950 text-[7px] font-black rounded shadow-[0_2px_8px_rgba(255,255,255,0.4)] uppercase">
               Orion
            </div>
            <div className={`w-px bg-gradient-to-t from-white to-transparent ${isCompact ? 'h-4' : 'h-6'}`}></div>
          </div>
        </div>
      </div>
    </div>
  );

  if (isCompact) {
    return (
      <div className="glass rounded-xl border border-white/10 shadow-2xl relative overflow-hidden group transition-all duration-500 hover:bg-slate-900/40 px-4 py-2 h-full">
        {content}
      </div>
    );
  }

  return (
    <TacticalCard
      title="Mission Trajectory Status"
      subtitle="Global Flight Path Index"
      icon={<Route className="w-3.5 h-3.5" />}
    >
      <div className="p-4 h-full">
        {content}
      </div>
    </TacticalCard>
  );
};

export default HorizontalTimeline;
