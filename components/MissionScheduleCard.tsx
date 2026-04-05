
import React, { useMemo, useEffect, useRef, useState } from 'react';
import { Clock, User, Target, Zap, CheckCircle2, Info, MapPin } from 'lucide-react';
import TacticalCard from './TacticalCard';
import { motion, AnimatePresence } from 'motion/react';

interface ScheduleEvent {
  met: number;
  label: string;
  type: 'milestone' | 'crew' | 'attitude' | 'phase';
  duration?: number;
  summary?: string;
}

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
  onGoToEvent?: (met: number) => void;
}

const MissionScheduleCard: React.FC<Props> = ({ elapsedSeconds, onGoToEvent }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLDivElement>(null);
  const [schedule, setSchedule] = useState<ScheduleEvent[]>([]);
  const [metadata, setMetadata] = useState<{ lastUpdated?: string; launchTime?: string }>({});
  const [loading, setLoading] = useState(true);
  const [hoveredEvent, setHoveredEvent] = useState<number | null>(null);
  const [tooltipSide, setTooltipSide] = useState<'left' | 'right'>('left');

  const handleMouseEnter = (index: number, e: React.MouseEvent) => {
    const parentRect = scrollRef.current?.getBoundingClientRect();
    if (parentRect) {
      setTooltipSide(parentRect.left < 320 ? 'right' : 'left');
    }
    setHoveredEvent(index);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://raw.githubusercontent.com/jakobrosin/artemis-data/main/schedule.json');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        
        const events: ScheduleEvent[] = (data.events || []).map((e: any) => ({
          met: e.metHours * 3600,
          label: e.title,
          type: 'milestone',
          summary: e.summary
        }));

        const crew: ScheduleEvent[] = (data.crewSchedule || []).map((c: any) => ({
          met: c.startMET * 3600,
          label: c.label,
          type: 'crew',
          duration: (c.endMET - c.startMET) * 3600,
          summary: c.desc
        }));

        const combined = [...events, ...crew].sort((a, b) => a.met - b.met);
        setSchedule(combined);
        setMetadata({ lastUpdated: data.lastUpdated, launchTime: data.launchTime });
      } catch (error) {
        console.error('Failed to fetch schedule:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 300000); // 5 minutes
    return () => clearInterval(interval);
  }, []);

  const activeIndex = useMemo(() => {
    let index = -1;
    for (let i = 0; i < schedule.length; i++) {
      if (elapsedSeconds >= schedule[i].met) {
        index = i;
      } else {
        break;
      }
    }
    return index;
  }, [elapsedSeconds, schedule]);

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
      allowOverflow={true}
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-4">
            <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest">
              FD_SYNC: {loading ? 'FETCHING...' : 'NOMINAL'}
            </span>
            {metadata.lastUpdated && (
              <span className="text-[8px] text-slate-600 mono uppercase tracking-tighter">
                Updated: {new Date(metadata.lastUpdated).toLocaleTimeString()}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${loading ? 'bg-amber-500' : 'bg-emerald-500'} animate-pulse`}></div>
            <span className={loading ? 'text-amber-500' : 'text-emerald-500'}>
              {loading ? 'Connecting...' : 'Live Uplink'}
            </span>
          </div>
        </div>
      }
    >
      <div ref={scrollRef} className="h-full overflow-y-auto p-1 space-y-0.5 custom-scrollbar bg-black/10 relative">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full space-y-2 opacity-50">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-[8px] mono uppercase tracking-widest">Synchronizing Timeline...</span>
          </div>
        ) : schedule.length === 0 ? (
          <div className="flex items-center justify-center h-full opacity-50">
            <span className="text-[8px] mono uppercase tracking-widest">No Schedule Data Available</span>
          </div>
        ) : (
          schedule.map((event, i) => {
            const isActive = i === activeIndex;
            const isPast = i < activeIndex;

            return (
              <div
                key={i}
                ref={isActive ? activeRef : null}
                onMouseEnter={(e) => handleMouseEnter(i, e)}
                onMouseLeave={() => setHoveredEvent(null)}
                className={`relative flex items-center p-1.5 rounded-lg transition-all duration-300 ${
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
                  {i < schedule.length - 1 && (
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
                      {event.summary && (
                        <span className={`text-[7px] truncate ${isActive ? 'text-blue-200/70' : 'text-slate-500'}`}>
                          {event.summary}
                        </span>
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
                  <Info size={8} className="text-slate-600 hover:text-slate-400 cursor-help" />
                </div>

                {/* Hover Popup */}
                <AnimatePresence>
                  {hoveredEvent === i && (
                    <motion.div
                      initial={{ opacity: 0, x: tooltipSide === 'left' ? -10 : 10, scale: 0.95 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: tooltipSide === 'left' ? -10 : 10, scale: 0.95 }}
                      className={`absolute ${tooltipSide === 'left' ? 'right-full mr-3' : 'left-full ml-3'} top-0 z-50 w-64 p-4 bg-slate-900/95 backdrop-blur-xl border border-blue-500/30 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden`}
                      onMouseEnter={() => setHoveredEvent(i)}
                      onMouseLeave={() => setHoveredEvent(null)}
                    >
                      {/* Tactical Accents */}
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-transparent opacity-50"></div>
                      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-600 to-transparent opacity-30"></div>

                      <div className="flex flex-col space-y-3 relative z-10">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                          <div className={`px-2 py-0.5 rounded text-[7px] font-black uppercase tracking-widest border ${
                            event.type === 'crew' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 
                            event.type === 'milestone' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' :
                            'bg-slate-500/10 border-slate-500/30 text-slate-400'
                          }`}>
                            {event.type}
                          </div>
                          <span className="text-[9px] text-slate-500 mono font-bold">{formatMET(event.met)}</span>
                        </div>

                        {/* Title */}
                        <h4 className="text-[11px] font-black text-white uppercase tracking-wider leading-tight border-b border-white/5 pb-2">
                          {event.label}
                        </h4>

                        {/* Summary */}
                        {event.summary && (
                          <div className="space-y-1">
                            <span className="text-[7px] text-slate-500 font-black uppercase tracking-widest">Briefing // Summary</span>
                            <p className="text-[9px] text-slate-300 leading-relaxed font-medium">
                              {event.summary}
                            </p>
                          </div>
                        )}

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5">
                          {event.duration && (
                            <div className="flex flex-col">
                              <span className="text-[7px] text-slate-500 font-black uppercase tracking-widest mb-0.5">Duration</span>
                              <div className="flex items-center space-x-1">
                                <Clock size={8} className="text-blue-400" />
                                <span className="text-[9px] mono text-blue-300 font-bold">{Math.round(event.duration / 60)}m</span>
                              </div>
                            </div>
                          )}
                          <div className="flex flex-col items-end">
                            <span className="text-[7px] text-slate-500 font-black uppercase tracking-widest mb-0.5">Status</span>
                            <div className="flex items-center space-x-1">
                              {isPast ? (
                                <>
                                  <CheckCircle2 size={8} className="text-emerald-500" />
                                  <span className="text-[8px] text-emerald-500 font-black uppercase">Completed</span>
                                </>
                              ) : isActive ? (
                                <>
                                  <Zap size={8} className="text-blue-400 animate-pulse" />
                                  <span className="text-[8px] text-blue-400 font-black uppercase">Active</span>
                                </>
                              ) : (
                                <>
                                  <Clock size={8} className="text-slate-500" />
                                  <span className="text-[8px] text-slate-500 font-black uppercase">Scheduled</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Footer ID */}
                        <div className="flex flex-col space-y-3 pt-2 border-t border-white/5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onGoToEvent?.(event.met);
                              setHoveredEvent(null);
                            }}
                            className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-lg transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] active:scale-95 flex items-center justify-center space-x-2 group/btn"
                          >
                            <MapPin size={10} className="group-hover/btn:animate-bounce" />
                            <span>Go to Event</span>
                          </button>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-[6px] text-slate-600 mono uppercase">Ref: SCHED_{Math.abs(event.met).toString(16).toUpperCase()}</span>
                            <div className="flex space-x-0.5">
                              {[1, 2, 3].map(dot => (
                                <div key={dot} className="w-1 h-1 rounded-full bg-blue-500/20"></div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>
    </TacticalCard>
  );
};

export default React.memo(MissionScheduleCard);
