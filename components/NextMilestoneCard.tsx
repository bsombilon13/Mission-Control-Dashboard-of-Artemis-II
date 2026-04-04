
import React, { useMemo } from 'react';
import { MISSION_EVENTS } from './MissionTimeline';
import TacticalCard from './TacticalCard';
import { Target } from 'lucide-react';

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
    <TacticalCard
      title="Next Milestone"
      subtitle={`SEQ_${Math.abs(Math.round(nextMilestone.offsetSeconds % 1000)).toString(16).toUpperCase()}`}
      isCritical={isCritical}
      icon={<Target className="w-3.5 h-3.5" />}
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-2">
            <div className={`w-1.5 h-1.5 rounded-full ${isCritical ? 'bg-red-500 animate-ping' : 'bg-blue-500 animate-pulse'}`}></div>
            <span>T-GO STATUS: {isCritical ? 'CRITICAL' : 'NOMINAL'}</span>
          </div>
          <span className="mono text-slate-600">ID: {Math.abs(nextMilestone.offsetSeconds).toString(16).toUpperCase()}</span>
        </div>
      }
    >
      <div className="p-5 flex flex-col justify-center h-full">
        <h3 className="text-[13px] font-black text-white uppercase truncate tracking-tight mb-2 leading-none">
          {nextMilestone.label.split(':')[0]}
        </h3>
        
        <div className="flex items-baseline space-x-1.5">
          <span className={`text-3xl font-black mono tabular-nums tracking-tighter leading-none ${
            isCritical ? 'text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.6)]' : 'text-white'
          }`}>
            -{main}
          </span>
          <span className={`text-sm font-bold mono ${isCritical ? 'text-red-400' : 'text-slate-500'}`}>.{ms}</span>
          <span className="text-[9px] text-slate-600 font-black uppercase ml-1 tracking-[0.2em]">T-Go</span>
        </div>

        {/* Mini Progress Bar to next event */}
        <div className="mt-4 h-[3px] w-full bg-white/5 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ${isCritical ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]'}`}
            style={{ width: `${Math.max(0, 100 - ((nextMilestone.offsetSeconds - elapsedSeconds) / 3600) * 100)}%` }}
          ></div>
        </div>
      </div>
    </TacticalCard>
  );
};

export default NextMilestoneCard;
