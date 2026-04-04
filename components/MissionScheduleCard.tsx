
import React, { useMemo, useEffect, useRef } from 'react';
import { Clock, User, Target, Zap, CheckCircle2 } from 'lucide-react';
import TacticalCard from './TacticalCard';

interface ScheduleEvent {
  met: number;
  label: string;
  type: 'milestone' | 'crew' | 'attitude' | 'phase';
  duration?: number;
}

const SCHEDULE: ScheduleEvent[] = [
  { met: 0, label: "Liftoff", type: "milestone" },
  { met: 3000, label: "ICPS PRM", type: "milestone" },
  { met: 6480, label: "ARB TIG", type: "milestone" },
  { met: 7200, duration: 3600, label: "Crew: ARB Ops", type: "crew" },
  { met: 10800, duration: 3600, label: "Crew: DCAM Ops", type: "crew" },
  { met: 12240, label: "Orion/ICPS Spring Sep", type: "milestone" },
  { met: 14400, duration: 5400, label: "Crew: Prox Ops Demo", type: "crew" },
  { met: 17520, label: "Orion USS", type: "milestone" },
  { met: 18120, label: "ICPS Disposal Burn", type: "milestone" },
  { met: 19620, label: "SPL Deploys", type: "milestone" },
  { met: 28800, duration: 14400, label: "Crew Sleep (4h)", type: "crew" },
  { met: 36360, label: "OpComm Initial Act", type: "milestone" },
  { met: 46800, duration: 16200, label: "Crew Sleep (4.5h)", type: "crew" },
  { met: 49500, label: "Orion PRB", type: "milestone" },
  { met: 50160, label: "OpNav C/O", type: "milestone" },
  { met: 92220, label: "Orion TLI", type: "milestone" },
  { met: 122400, duration: 30600, label: "Crew Sleep (8.5h)", type: "crew" },
  { met: 129600, label: "CM/SM Survey", type: "milestone" },
  { met: 173220, label: "OTC-1", type: "milestone" },
  { met: 208800, duration: 30600, label: "Crew Sleep (8.5h)", type: "crew" },
  { met: 259920, label: "OTC-2", type: "milestone" },
  { met: 295200, duration: 30600, label: "Crew Sleep (8.5h)", type: "crew" },
  { met: 315000, label: "Dock Cam Misalign", type: "milestone" },
  { met: 364980, label: "OTC-3", type: "milestone" },
  { met: 370740, label: "Lunar SOI Entry", type: "milestone" },
  { met: 381600, duration: 30600, label: "Crew Sleep (8.5h)", type: "crew" },
  { met: 437000, label: "Lunar Close Approach", type: "milestone" },
  { met: 437217, label: "Max Earth Distance", type: "milestone" },
  { met: 468000, duration: 30600, label: "Crew Sleep (8.5h)", type: "crew" },
  { met: 503220, label: "Lunar SOI Exit", type: "milestone" },
  { met: 534180, label: "RTC-1", type: "milestone" },
  { met: 554400, duration: 32400, label: "Crew Sleep (9h)", type: "crew" },
  { met: 783180, label: "Entry Interface", type: "milestone" },
  { met: 783960, label: "Splashdown", type: "milestone" },
];

const formatMET = (seconds: number) => {
  const abs = Math.abs(seconds);
  const d = Math.floor(abs / 86400);
  const h = Math.floor((abs % 86400) / 3600);
  const m = Math.floor((abs % 3600) / 60);
  const s = Math.floor(abs % 60);
  return `${d}d ${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

interface Props {
  elapsedSeconds: number;
}

const MissionScheduleCard: React.FC<Props> = ({ elapsedSeconds }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLDivElement>(null);

  const activeIndex = useMemo(() => {
    let index = -1;
    for (let i = 0; i < SCHEDULE.length; i++) {
      if (elapsedSeconds >= SCHEDULE[i].met) {
        index = i;
      } else {
        break;
      }
    }
    return index;
  }, [elapsedSeconds]);

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeIndex]);

  return (
    <TacticalCard
      title="Mission Schedule"
      subtitle="Operational Timeline & Crew Activities"
      icon={<Clock className="w-3.5 h-3.5" />}
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-4">
            <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest">FD_SYNC: NOMINAL</span>
            <span className="text-[8px] text-slate-600 mono uppercase tracking-tighter">Epoch: 2026.02.07</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-emerald-500">Live Uplink</span>
          </div>
        </div>
      }
    >
      <div ref={scrollRef} className="h-full overflow-y-auto p-1 space-y-0.5 custom-scrollbar bg-black/10">
        {SCHEDULE.map((event, i) => {
          const isActive = i === activeIndex;
          const isPast = i < activeIndex;

          return (
            <div
              key={i}
              ref={isActive ? activeRef : null}
              className={`relative flex items-center p-1 rounded-lg transition-all duration-300 ${
                isActive 
                  ? 'bg-blue-600/20 border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.15)] scale-[1.01] z-10' 
                  : isPast 
                    ? 'opacity-40 grayscale hover:opacity-70 hover:grayscale-0' 
                    : 'opacity-60 hover:opacity-90'
              }`}
            >
              <div className="flex flex-col shrink-0 w-16">
                <span className={`text-[7px] mono font-black tracking-tighter ${isActive ? 'text-blue-300' : 'text-slate-500'}`}>
                  MET {formatMET(event.met)}
                </span>
              </div>

              <div className="mx-2 flex flex-col items-center shrink-0">
                <div className={`flex items-center justify-center rounded-full transition-all duration-500 ${
                  isActive 
                    ? 'w-2 h-2 bg-blue-400 animate-pulse ring-2 ring-blue-400/20' 
                    : isPast 
                      ? 'w-3 h-3 bg-emerald-500/20 border border-emerald-500/40' 
                      : 'w-1.5 h-1.5 bg-slate-700'
                }`}>
                  {isPast && <CheckCircle2 size={8} className="text-emerald-500" />}
                </div>
                {i < SCHEDULE.length - 1 && (
                  <div className={`w-px h-3 mt-0.5 ${isPast ? 'bg-emerald-500/30' : 'bg-slate-800'}`} />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-1.5">
                  <div className={`p-0.5 rounded ${isActive ? 'bg-blue-500/20' : 'bg-slate-800/50'}`}>
                    {event.type === 'crew' ? <User size={8} className="text-amber-400" /> : <Target size={8} className="text-blue-400" />}
                  </div>
                  <div className="flex flex-col truncate">
                    <div className="flex items-center space-x-1">
                      <span className={`text-[10px] font-black truncate uppercase tracking-wider ${isActive ? 'text-white' : isPast ? 'text-slate-400' : 'text-slate-300'}`}>
                        {event.label}
                      </span>
                      {isPast && <CheckCircle2 size={8} className="text-emerald-500/70 shrink-0" />}
                    </div>
                    {event.duration && (
                      <span className="text-[6px] text-slate-500 font-bold uppercase tracking-widest">Duration: {event.duration / 60}m</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-1 ml-2">
                {isPast && (
                  <div className="flex items-center space-x-1 px-1.5 py-0.5 bg-emerald-500/10 rounded border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                    <span className="text-[6px] text-emerald-500 font-black uppercase tracking-tighter">Completed</span>
                  </div>
                )}
                {isActive && (
                  <div className="flex items-center space-x-1 px-1.5 py-0.5 bg-blue-500/20 rounded border border-blue-500/30 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                    <Zap size={7} className="text-blue-400" />
                    <span className="text-[6px] text-blue-400 font-black uppercase tracking-tighter">Active</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </TacticalCard>
  );
};

export default React.memo(MissionScheduleCard);
