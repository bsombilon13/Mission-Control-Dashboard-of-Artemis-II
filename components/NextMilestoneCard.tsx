
import React, { useMemo } from 'react';
import { MISSION_EVENTS } from './MissionTimeline';

interface Props {
  elapsedSeconds: number;
}

const NextMilestoneCard: React.FC<Props> = ({ elapsedSeconds }) => {
  const nextMilestone = useMemo(() => {
    return MISSION_EVENTS.find(m => m.offsetSeconds > elapsedSeconds);
  }, [elapsedSeconds]);

  const formatCountdown = (seconds: number) => {
    const abs = Math.abs(seconds);
    const d = Math.floor(abs / 86400);
    const h = Math.floor((abs % 86400) / 3600);
    const m = Math.floor((abs % 3600) / 60);
    const s = Math.floor(abs % 60);
    const ms = Math.floor((abs % 1) * 100);

    const parts = [];
    if (d > 0) parts.push(`${d}d`);
    parts.push(h.toString().padStart(2, '0'));
    parts.push(m.toString().padStart(2, '0'));
    parts.push(s.toString().padStart(2, '0'));
    
    return {
      main: parts.join(':'),
      ms: ms.toString().padStart(2, '0'),
      isCritical: abs < 60
    };
  };

  if (!nextMilestone) return null;

  const { main, ms, isCritical } = formatCountdown(nextMilestone.offsetSeconds - elapsedSeconds);

  return (
    <div className={`glass rounded-xl px-5 py-4 border transition-all duration-300 flex flex-col justify-center min-w-[240px] shadow-2xl relative overflow-hidden ${
      isCritical ? 'border-red-500/50 bg-red-950/20' : 'border-white/10'
    }`}>
      {/* Background Pulse for Criticality */}
      {isCritical && (
        <div className="absolute inset-0 bg-red-600/5 animate-pulse pointer-events-none"></div>
      )}
      
      <div className="flex items-center justify-between mb-2">
        <span className={`text-[9px] font-black uppercase tracking-[0.2em] flex items-center ${
          isCritical ? 'text-red-400' : 'text-blue-400'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full mr-2 ${
            isCritical ? 'bg-red-500 animate-ping' : 'bg-blue-500 animate-pulse'
          }`}></span>
          Next Sequence Milestone
        </span>
        <span className="text-[8px] mono text-slate-500 uppercase font-bold">Event_ID: {Math.abs(Math.round(nextMilestone.offsetSeconds % 1000))}</span>
      </div>

      <div className="flex flex-col">
        <h3 className="text-[11px] font-black text-white uppercase truncate tracking-tight mb-1">
          {nextMilestone.label}
        </h3>
        
        <div className="flex items-baseline space-x-1">
          <span className={`text-2xl font-black mono tabular-nums tracking-tighter ${
            isCritical ? 'text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'text-white'
          }`}>
            -{main}
          </span>
          <span className={`text-xs font-bold mono ${isCritical ? 'text-red-400' : 'text-slate-500'}`}>.{ms}</span>
          <span className="text-[9px] text-slate-600 font-black uppercase ml-1 tracking-widest">To_Go</span>
        </div>
      </div>

      {/* Mini Progress Bar to next event */}
      <div className="mt-3 h-[2px] w-full bg-white/5 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-1000 ${isCritical ? 'bg-red-500' : 'bg-blue-500'}`}
          style={{ width: `${Math.max(0, 100 - ((nextMilestone.offsetSeconds - elapsedSeconds) / 3600) * 100)}%` }}
        ></div>
      </div>
    </div>
  );
};

export default NextMilestoneCard;
