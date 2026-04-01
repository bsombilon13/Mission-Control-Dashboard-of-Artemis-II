
import React, { useMemo } from 'react';

interface Props {
  elapsedSeconds: number;
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

const HorizontalTimeline: React.FC<Props> = ({ elapsedSeconds }) => {
  const minOffset = MAJOR_MILESTONES[0].offset;
  const maxOffset = MAJOR_MILESTONES[MAJOR_MILESTONES.length - 1].offset;
  const totalDuration = maxOffset - minOffset;
  
  const progress = useMemo(() => {
    if (elapsedSeconds <= minOffset) return 0;
    if (elapsedSeconds >= maxOffset) return 100;
    return ((elapsedSeconds - minOffset) / totalDuration) * 100;
  }, [elapsedSeconds, minOffset, totalDuration, maxOffset]);

  const nextMilestone = useMemo(() => {
    return MAJOR_MILESTONES.find(m => m.offset > elapsedSeconds);
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

  return (
    <div className="glass rounded-xl px-6 py-4 border border-white/10 shadow-2xl h-full relative overflow-hidden group transition-all duration-500 hover:bg-slate-900/40 flex flex-col justify-center">
      <div className="flex justify-between items-center mb-4 relative z-10">
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 uppercase tracking-[0.3em] font-black leading-none">Mission Trajectory Status</span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-black mono text-white tracking-tighter">
              {progress.toFixed(3)}<span className="text-sm text-blue-400 ml-1">%</span>
            </span>
            <span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">Global Index</span>
          </div>
        </div>

        {nextMilestone && (
          <div className="flex flex-col items-end bg-blue-500/10 border border-blue-400/30 rounded-lg px-3 py-1.5">
            <span className="text-[8px] text-blue-300 uppercase tracking-[0.2em] font-black mb-0.5 flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse mr-1.5"></span>
              Next: {nextMilestone.label}
            </span>
            <div className="text-sm font-black mono text-white tabular-nums tracking-tight">
              T-Minus {formatCountdown(nextMilestone.offset - elapsedSeconds)}
            </div>
          </div>
        )}
      </div>
      
      <div className="relative h-12 flex items-center z-10">
        <div className="absolute left-0 right-0 h-1.5 bg-slate-950 rounded-full border border-white/10 shadow-inner"></div>
        
        <div 
          className="absolute left-0 h-1.5 bg-gradient-to-r from-blue-700 via-blue-500 to-blue-400 rounded-full transition-all duration-1000 ease-out z-10"
          style={{ width: `${progress}%`, boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)' }}
        >
          <div className="absolute top-0 left-0 w-full h-full bg-white/20 animate-pulse rounded-full"></div>
        </div>

        {MAJOR_MILESTONES.map((m, i) => {
          const mPos = ((m.offset - minOffset) / totalDuration) * 100;
          const isReached = elapsedSeconds >= m.offset;
          const isNext = nextMilestone?.label === m.label;
          
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
                  <span className={`text-[8px] font-black whitespace-nowrap px-1.5 py-0.5 rounded ${
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
          <div className="flex flex-col items-center -mt-8">
            <div className="px-1.5 py-0.5 bg-white text-slate-950 text-[7px] font-black rounded shadow-[0_2px_8px_rgba(255,255,255,0.4)] uppercase">
               Orion V4
            </div>
            <div className="w-px h-6 bg-gradient-to-t from-white to-transparent"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HorizontalTimeline;
