
import React, { useEffect, useRef, useMemo, useState } from 'react';
import { TimelineEvent } from '../types';

interface Props {
  elapsedSeconds: number;
  isCompressed?: boolean;
}

export const MISSION_EVENTS: TimelineEvent[] = [
  // --- EXHAUSTIVE PRE-LAUNCH SEQUENCE (L-49H 15M to Liftoff) ---
  { offsetSeconds: -177300, phase: 'pre-launch', label: "L-49H 15M: Call to Stations", description: "The launch team arrives on their stations and the countdown begins." },
  { offsetSeconds: -175500, phase: 'pre-launch', label: "Propulsion Prep Start", description: "LOX/LH2 system preparations for vehicle loading begins (L-48H 45M)." },
  { offsetSeconds: -175200, phase: 'pre-launch', label: "L-48H 40M: Clock Start", description: "The countdown clock begins its initial run." },
  { offsetSeconds: -171000, phase: 'pre-launch', label: "Sound Suppression Prep", description: "Fill the water tank for the sound suppression system (L-47H 30M)." },
  { offsetSeconds: -160200, phase: 'pre-launch', label: "Orion Spacecraft Power-up", description: "The Orion spacecraft is powered up if not already powered at call to stations (L-44H 30M)." },
  { offsetSeconds: -144000, phase: 'pre-launch', label: "ICPS Power-up", description: "The interim cryogenic propulsion stage (ICPS) is powered up (L-40H)." },
  { offsetSeconds: -142200, phase: 'pre-launch', label: "Core Stage Power-up", description: "The core stage is powered up (L-39H 30M)." },
  { offsetSeconds: -139500, phase: 'pre-launch', label: "RS-25 Final Prep", description: "Final preparations of the four RS-25 engines (L-38H 45M)." },
  { offsetSeconds: -121500, phase: 'pre-launch', label: "ICPS Power-down", description: "The ICPS is powered down for pre-launch system cycling (L-33H 45M)." },
  { offsetSeconds: -117000, phase: 'pre-launch', label: "Orion Battery Charge", description: "Charge Orion flight batteries to 100% (L-32H 30M)." },
  { offsetSeconds: -109800, phase: 'pre-launch', label: "Core Battery Charge", description: "Charge core stage flight batteries (L-30H 30M)." },
  { offsetSeconds: -67500, phase: 'pre-launch', label: "ICPS Launch Power-up", description: "The ICPS is powered-up for launch sequence (L-18H 45M)." },
  { offsetSeconds: -64800, phase: 'pre-launch', label: "Crew Suit Reg Leak Check", description: "Orion crew suit regulator leak checks begin (L-18H)." },
  { offsetSeconds: -52200, phase: 'pre-launch', label: "L-15H: Pad Evacuation", description: "All non-essential personnel leave Launch Complex 39B (L-14H 30M)." },
  { offsetSeconds: -47700, phase: 'pre-launch', label: "GN2 Cavity Inerting", description: "Air-to-gaseous nitrogen (GN2) changeover and vehicle cavity inerting (L-13H 15M)." },
  { offsetSeconds: -45900, phase: 'pre-launch', label: "GLS Activation", description: "Ground Launch Sequencer (GLS) activation (L-12H 45M)." },
  { offsetSeconds: -42000, phase: 'pre-launch', label: "L-11H 40M: Weather Brief", description: "Launch team conducts a weather and tanking briefing." },
  { offsetSeconds: -41700, phase: 'pre-launch', label: "Hold (L-11H 35M)", description: "2-hour 15-minute built-in countdown hold begins." },
  { offsetSeconds: -37200, phase: 'pre-launch', label: "L-10H 20M: Tanking Go Poll", description: "Launch team decides if they are “go” or “no-go” to begin tanking." },
  { offsetSeconds: -37200, phase: 'pre-launch', label: "Orion Cold Soak", description: "Orion spacecraft cold soak sequence (L-10H 20M)." },
  { offsetSeconds: -36600, phase: 'pre-launch', label: "Core LOX Chilldown", description: "Core stage LOX transfer line chilldown (L-10H 10M)." },
  { offsetSeconds: -36600, phase: 'pre-launch', label: "Core LH2 Chilldown", description: "Core stage LH2 chilldown (L-10H 10M)." },
  { offsetSeconds: -35400, phase: 'pre-launch', label: "Core LOX MPS Chilldown", description: "Core stage LOX main propulsion system chilldown (L-9H 50M)." },
  { offsetSeconds: -33900, phase: 'pre-launch', label: "Core LH2 Slow Fill", description: "Core stage LH2 slow fill start (L-9H 25M)." },
  { offsetSeconds: -33600, phase: 'pre-launch', label: "Resume T-Clock", description: "Resume T-Clock from T-8H 10M (L-9H 20M)." },
  { offsetSeconds: -33000, phase: 'pre-launch', label: "Core LOX Slow Fill", description: "Core stage LOX slow fill start (L-9H 10M)." },
  { offsetSeconds: -32400, phase: 'pre-launch', label: "Core LH2 Fast Fill", description: "Core stage LH2 fast fill (L-9H)." },
  { offsetSeconds: -32100, phase: 'pre-launch', label: "Core LOX Fast Fill", description: "Core stage LOX fast fill (L-8H 55M)." },
  { offsetSeconds: -31500, phase: 'pre-launch', label: "ICPS LH2 Chilldown", description: "ICPS LH2 chilldown (L-8H 45M)." },
  { offsetSeconds: -31200, phase: 'pre-launch', label: "L-8H 40M: Crew Wake-up", description: "Flight crew wake up and launch countdown status check." },
  { offsetSeconds: -29400, phase: 'pre-launch', label: "ICPS LH2 Fast Fill", description: "ICPS LH2 fast fill start (L-8H 10M)." },
  { offsetSeconds: -27600, phase: 'pre-launch', label: "Core LH2 Topping", description: "Core stage LH2 topping (L-7H 40M)." },
  { offsetSeconds: -27000, phase: 'pre-launch', label: "Core LH2 Replenish", description: "Core stage LH2 replenish mode (L-7H 30M – launch)." },
  { offsetSeconds: -26700, phase: 'pre-launch', label: "ICPS LH2 Vent/Relief Test", description: "ICPS LH2 vent and relief test (L-7H 25M)." },
  { offsetSeconds: -25500, phase: 'pre-launch', label: "ICPS LH2 Tank Topping", description: "ICPS LH2 tank topping start (L-7H 05M)." },
  { offsetSeconds: -24600, phase: 'pre-launch', label: "ICPS LH2 Replenish", description: "ICPS LH2 replenish (L-6H 50M-launch)." },
  { offsetSeconds: -22200, phase: 'pre-launch', label: "Orion Comms Activated", description: "Orion communications system activated (L-6H 10M)." },
  { offsetSeconds: -22200, phase: 'pre-launch', label: "Core LOX Topping", description: "Core stage LOX topping (L-6H 10M)." },
  { offsetSeconds: -22200, phase: 'pre-launch', label: "ICPS LOX MPS Chilldown", description: "ICPS LOX main propulsion system chilldown (L-6H 10M)." },
  { offsetSeconds: -21600, phase: 'pre-launch', label: "L-6H: Crew Weather Brief", description: "Flight crew weather brief." },
  { offsetSeconds: -21600, phase: 'pre-launch', label: "ICPS LOX Fast Fill", description: "ICPS LOX fast fill (L-6H)." },
  { offsetSeconds: -20400, phase: 'pre-launch', label: "Core LOX Replenish", description: "Core stage LOX replenish (L-5H 40M – launch)." },
  { offsetSeconds: -20400, phase: 'pre-launch', label: "Pad Rescue Ready", description: "Stage pad rescue team and closeout crew assembly (L-5H 40M)." },
  { offsetSeconds: -20400, phase: 'pre-launch', label: "Suit Donning", description: "Flight crew begins donning launch and entry spacesuits (L-5H 40M)." },
  { offsetSeconds: -18900, phase: 'pre-launch', label: "ICPS LOX Relief Test", description: "ICPS LOX vent and relief test (L-5H 15M)." },
  { offsetSeconds: -18000, phase: 'pre-launch', label: "ICPS LOX Topping", description: "ICPS LOX topping (L-5H)." },
  { offsetSeconds: -16800, phase: 'pre-launch', label: "Hold (L-4H 40M)", description: "Start 40-minute built-in hold; Closeout crew to white room." },
  { offsetSeconds: -16800, phase: 'pre-launch', label: "Crew Departure (O&C)", description: "Flight crew departs O&C suit room for launch complex (L-4H 40M)." },
  { offsetSeconds: -16200, phase: 'pre-launch', label: "Arrival at Pad 39B", description: "Flight crew departs to Launch Complex 39B (L-4H 30M)." },
  { offsetSeconds: -15900, phase: 'pre-launch', label: "Orion Ingress Prep", description: "Orion preps for flight crew ingress (L-4H 25M)." },
  { offsetSeconds: -15200, phase: 'pre-launch', label: "White Room Access", description: "Flight crew heads to white room (L-4H 20M)." },
  { offsetSeconds: -15000, phase: 'pre-launch', label: "Helmets/Gloves Donning", description: "Flight crew puts on helmets and gloves (L-4H 10M)." },
  { offsetSeconds: -14400, phase: 'pre-launch', label: "L-4H: Crew Ingress", description: "Flight crew ingress, communication checks and suit leak checks." },
  { offsetSeconds: -12300, phase: 'pre-launch', label: "White Room Closeout", description: "White room closeout complete (L-3H 25M)." },
  { offsetSeconds: -12000, phase: 'pre-launch', label: "Hatch Closure", description: "Crew module hatch preps and closure (L-3H 20M)." },
  { offsetSeconds: -11700, phase: 'pre-launch', label: "Hatch Seal Checks", description: "Counterbalance mechanism hatch seal press decay checks (L-3H 15M)." },
  { offsetSeconds: -8400, phase: 'pre-launch', label: "Service Panel Closeout", description: "Crew module hatch service panel install/closeouts (L-2H 20M)." },
  { offsetSeconds: -6000, phase: 'pre-launch', label: "LAS Hatch Closure", description: "Launch abort system (LAS) hatch closure for flight (L-1H 40M)." },
  { offsetSeconds: -4200, phase: 'pre-launch', label: "LD Briefing (L-70M)", description: "Launch Director brief – Flight vehicle/TPS Scan results." },
  { offsetSeconds: -2700, phase: 'pre-launch', label: "Pad Clear", description: "Closeout crew departs Launch Complex 39B (L-45M)." },
  { offsetSeconds: -2400, phase: 'pre-launch', label: "L-40M: Final Built-in Hold", description: "Built in 30-minute countdown hold begins." },
  { offsetSeconds: -1800, phase: 'pre-launch', label: "NTD Briefing (L-30M)", description: "Final NASA Test Director (NTD) briefing is held." },
  { offsetSeconds: -1500, phase: 'pre-launch', label: "L-25M: Hold Transition", description: "Transition team to Orion Earth comm loop." },
  { offsetSeconds: -960, phase: 'pre-launch', label: "L-16M: Final Launch Poll", description: "Launch director polls team to ensure they are “go” for launch." },
  { offsetSeconds: -900, phase: 'pre-launch', label: "Visors Down (L-15M)", description: "Flight crew visors down." },
  { offsetSeconds: -840, phase: 'pre-launch', label: "Short Purge Check", description: "Flight crew short purge verification (L-14M)." },
  { offsetSeconds: -600, phase: 'pre-launch', label: "T-10M: Terminal Count", description: "Ground Launch Sequencer initiates terminal count." },
  { offsetSeconds: -480, phase: 'pre-launch', label: "Access Arm Retract (T-8M)", description: "Crew Access Arm retract." },
  { offsetSeconds: -360, phase: 'pre-launch', label: "T-6M: Tank Pressurization", description: "GLS go for core stage tank pressurization." },
  { offsetSeconds: -360, phase: 'pre-launch', label: "Orion Internal Power", description: "Orion set to internal power (T-6M)." },
  { offsetSeconds: -360, phase: 'pre-launch', label: "Ascent Pyros Armed", description: "Orion ascent pyros are armed (T-6M)." },
  { offsetSeconds: -357, phase: 'pre-launch', label: "Core LH2 Terminate", description: "Core stage LH2 terminate replenish (T-5M 57S)." },
  { offsetSeconds: -320, phase: 'pre-launch', label: "LAS Capability Active", description: "Launch Abort System capability is available (T-5M 20S)." },
  { offsetSeconds: -280, phase: 'pre-launch', label: "High Flow Bleed", description: "GLS is go for LH2 high flow bleed check (T-4M 40S)." },
  { offsetSeconds: -270, phase: 'pre-launch', label: "FTS Arming", description: "GLS is go for flight termination system arm (T-4M 30S)." },
  { offsetSeconds: -240, phase: 'pre-launch', label: "Core APU Start (T-4M)", description: "Core stage auxiliary power unit (APU) start." },
  { offsetSeconds: -240, phase: 'pre-launch', label: "Core LOX Terminate", description: "Core stage LOX terminate replenish (T-4M)." },
  { offsetSeconds: -210, phase: 'pre-launch', label: "ICPS LOX Terminate", description: "ICPS LOX terminate replenish (T-3M 30S)." },
  { offsetSeconds: -190, phase: 'pre-launch', label: "Purge Sequence 4", description: "GLS is go for purge sequence 4 (T-3M 10S)." },
  { offsetSeconds: -122, phase: 'pre-launch', label: "ICPS Internal Power", description: "ICPS switches to internal battery power (T-2M 02S)." },
  { offsetSeconds: -120, phase: 'pre-launch', label: "Booster Internal Power", description: "Booster switches to internal battery power (T-2M)." },
  { offsetSeconds: -90, phase: 'pre-launch', label: "Core Internal Power", description: "Core stage switches to internal power (T-1M 30S)." },
  { offsetSeconds: -80, phase: 'pre-launch', label: "ICPS Terminal Mode", description: "ICPS enters terminal countdown mode (T-1M 20S)." },
  { offsetSeconds: -50, phase: 'pre-launch', label: "ICPS LH2 Terminate", description: "ICPS LH2 terminate replenish (T-50S)." },
  { offsetSeconds: -33, phase: 'pre-launch', label: "ALS Go Command", description: "GLS sends “go for automated launch sequencer” command (T-33S)." },
  { offsetSeconds: -30, phase: 'pre-launch', label: "Flight Computer ALS", description: "Core stage flight computer to automated launching sequencer (T-30S)." },
  { offsetSeconds: -12, phase: 'pre-launch', label: "Hydrogen Burn Off", description: "Hydrogen burn off igniters initiated (T-12S)." },
  { offsetSeconds: -10, phase: 'ascent', label: "Engine Start Command", description: "GLS sends the command for core stage engine start (T-10S)." },
  { offsetSeconds: -6.36, phase: 'ascent', label: "RS-25 Startup", description: "RS-25 engines startup sequence begins." },
  
  // --- MISSION ASCENT ---
  { offsetSeconds: 0, phase: 'ascent', label: "T-0: LIFTOFF", description: "Booster ignition, umbilical separation, and liftoff." },
  { offsetSeconds: 9, phase: 'ascent', label: "Tower Clear", description: "SLS clears the launch tower." },
  { offsetSeconds: 70, phase: 'ascent', label: "Max Q", description: "Maximum dynamic pressure on vehicle structure." },
  { offsetSeconds: 128, phase: 'ascent', label: "SRB Separation", description: "Solid Rocket Booster burnout and separation." },
  { offsetSeconds: 198, phase: 'ascent', label: "LAS Jettison", description: "Launch abort system jettison – safe to orbit." },
  { offsetSeconds: 486, phase: 'ascent', label: "MECO", description: "SLS core stage main engine cutoff." },
  { offsetSeconds: 498, phase: 'ascent', label: "Core Stage Separation", description: "Core stage separates from ICPS." },
  
  // --- MISSION PHASES (Summarized) ---
  { offsetSeconds: 6477, phase: 'orbit', label: "Apogee Raise Burn", description: "Insertion into high Earth orbit." },
  { offsetSeconds: 92220, phase: 'transit', label: "TLI Burn", description: "Translunar Injection - departing for the Moon." },
  { offsetSeconds: 436980, phase: 'lunar', label: "Lunar Flyby", description: "Closest approach to the Lunar surface." },
  { offsetSeconds: 783180, phase: 'recovery', label: "Entry Interface", description: "Orion hits atmosphere." },
  { offsetSeconds: 783960, phase: 'splashdown', label: "SPLASHDOWN", description: "Artemis II splashdown in the Pacific Ocean." },
];

const formatTimeShort = (seconds: number) => {
  const abs = Math.abs(seconds);
  const d = Math.floor(abs / 86400);
  const h = Math.floor((abs % 86400) / 3600);
  const m = Math.floor((abs % 3600) / 60);
  const s = Math.floor(abs % 60);
  const prefix = seconds < 0 ? 'L-' : 'T+';
  
  if (d > 0) return `${prefix}${d}d ${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${prefix}${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const MissionTimeline: React.FC<Props> = ({ elapsedSeconds, isCompressed }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLDivElement>(null);
  const [hoveredEvent, setHoveredEvent] = useState<TimelineEvent | null>(null);

  const activeIndex = useMemo(() => {
    let bestIdx = -1;
    for (let i = 0; i < MISSION_EVENTS.length; i++) {
      if (elapsedSeconds >= MISSION_EVENTS[i].offsetSeconds) {
        bestIdx = i;
      } else {
        break;
      }
    }
    return bestIdx;
  }, [elapsedSeconds]);

  useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeIndex]);

  const getPhaseStyles = (phase?: string) => {
    switch(phase) {
      case 'pre-launch': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'ascent': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'orbit': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'transit': return 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20';
      case 'lunar': return 'text-slate-100 bg-slate-100/10 border-slate-100/20';
      case 'recovery': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'splashdown': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      default: return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
    }
  };

  return (
    <div className={`glass rounded-xl h-full border border-white/10 flex flex-col overflow-hidden shadow-2xl relative ${isCompressed ? 'bg-slate-900/80' : 'bg-slate-900/60'}`}>
      <div className={`bg-slate-800/80 px-4 py-3 border-b border-white/10 flex items-center justify-between z-10 shrink-0`}>
        <div className="flex flex-col">
          <h3 className="text-[10px] uppercase tracking-[0.25em] font-black text-slate-300">Sequence Monitor</h3>
          {!isCompressed && <span className="text-[9px] text-blue-400 font-bold italic mt-0.5 tracking-tighter uppercase">High-Fidelity Flight Profile</span>}
        </div>
        <div className="flex items-center space-x-2">
           <div className={`px-2 py-0.5 bg-emerald-500/10 rounded border border-emerald-500/30`}>
              <span className="text-[8px] mono text-emerald-400 font-black animate-pulse uppercase tracking-wider">Telemetry Locked</span>
           </div>
        </div>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar bg-black/30"
      >
        <div className={`relative ${isCompressed ? 'py-4' : 'py-8'}`}>
          <div className={`absolute top-0 bottom-0 w-0.5 bg-white/5 ${isCompressed ? 'left-[18px]' : 'left-[34px]'}`}></div>
          
          <div className="space-y-1">
            {MISSION_EVENTS.map((event, idx) => {
              const isActive = idx === activeIndex;
              const isPast = idx < activeIndex;
              const isHovered = hoveredEvent === event;

              return (
                <div 
                  key={idx}
                  ref={isActive ? activeItemRef : null}
                  onMouseEnter={() => setHoveredEvent(event)}
                  onMouseLeave={() => setHoveredEvent(null)}
                  className={`relative flex items-center transition-all duration-300 cursor-help ${
                    isActive ? 'bg-blue-600/20 border-y border-blue-500/30 z-20 py-4' : 'py-1 opacity-60 hover:opacity-100 hover:bg-white/5'
                  } ${isCompressed ? 'px-2' : 'px-6'}`}
                >
                  {isHovered && (
                    <div className="absolute z-[100] right-[105%] top-1/2 -translate-y-1/2 animate-in fade-in slide-in-from-right-4 zoom-in duration-200">
                      <div className="bg-slate-950/95 border border-blue-500/50 rounded-xl p-4 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,0,0,0.9)] min-w-[220px] max-w-[280px] overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-[2px] bg-blue-500/40 animate-[scanLine_2s_linear_infinite] pointer-events-none"></div>
                        <div className="flex items-center justify-between mb-3">
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border shadow-sm ${getPhaseStyles(hoveredEvent?.phase)}`}>
                            {hoveredEvent?.phase}
                          </span>
                          <span className="text-[10px] mono text-blue-400 font-black tabular-nums">{formatTimeShort(hoveredEvent?.offsetSeconds || 0)}</span>
                        </div>
                        <div className="flex items-center space-x-2 mb-2">
                           <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                           <h4 className="text-[12px] font-black text-white uppercase tracking-wider">{hoveredEvent?.label}</h4>
                        </div>
                        <div className="h-px bg-white/10 my-2"></div>
                        <div className="flex flex-col space-y-2">
                          <p className="text-[10px] text-slate-400 leading-relaxed font-medium italic">"{hoveredEvent?.description}"</p>
                          <div className="flex items-center justify-between pt-2 border-t border-white/5">
                             <span className="text-[7px] text-slate-600 font-bold uppercase tracking-widest">Stage Status</span>
                             <span className={`text-[7px] font-black uppercase ${isPast ? 'text-emerald-500' : isActive ? 'text-blue-500' : 'text-slate-500'}`}>
                                {isPast ? 'Executed' : isActive ? 'Active' : 'Queued'}
                             </span>
                          </div>
                        </div>
                      </div>
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 bg-slate-950 border-r border-t border-blue-500/50 rotate-45"></div>
                    </div>
                  )}

                  <div className="relative flex items-center justify-center shrink-0">
                    {isActive && <div className="absolute rounded-full bg-blue-500/30 animate-ping w-10 h-10"></div>}
                    <div className={`relative z-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                      isActive ? 'w-6 h-6 bg-blue-500 border-white shadow-[0_0_15px_rgba(59,130,246,0.8)]' : isPast ? 'w-3 h-3 bg-emerald-500 border-emerald-300' : 'w-3 h-3 bg-slate-800 border-slate-600'
                    }`}>
                      {isActive && <div className="w-2 h-2 bg-white rounded-full"></div>}
                    </div>
                  </div>

                  <div className={`${isCompressed ? 'ml-3' : 'ml-6'} flex-1 overflow-hidden`}>
                    <div className="flex flex-col">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex flex-col truncate">
                          <span className={`font-bold transition-colors truncate ${isCompressed ? 'text-[10px]' : 'text-[12px]'} ${isActive ? 'text-white' : isPast ? 'text-slate-300' : 'text-slate-500'}`}>
                            {event.label}
                          </span>
                          {!isCompressed && event.phase && <span className={`text-[7px] font-black uppercase tracking-tighter ${getPhaseStyles(event.phase).split(' ')[0]}`}>{event.phase}</span>}
                        </div>
                        <span className={`mono tabular-nums shrink-0 font-bold ${isCompressed ? 'text-[8px]' : 'text-[10px]'} ${isActive ? 'text-blue-300' : 'text-slate-600'}`}>
                          {formatTimeShort(event.offsetSeconds)}
                        </span>
                      </div>
                      {isActive && !isCompressed && <p className="text-[10px] text-slate-400 mt-1 leading-relaxed max-w-sm">{event.description}</p>}
                      {isActive && <div className="mt-2 h-[2px] w-full bg-blue-500/20 rounded-full overflow-hidden"><div className="h-full bg-blue-400 animate-[progress_3s_linear_infinite]" style={{ width: '40%' }}></div></div>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      <div className={`bg-slate-900 border-t border-white/10 px-4 py-2 flex justify-between items-center text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500 shrink-0`}>
        <span>Station: FD_SYNC</span>
        <span className="mono">Epoch: 2026.02.07</span>
      </div>

      <style>{`
        @keyframes scanLine { 0% { transform: translateY(0); } 100% { transform: translateY(180px); } }
        @keyframes progress { 0% { transform: translateX(-100%); } 100% { transform: translateX(250%); } }
      `}</style>
    </div>
  );
};

export default MissionTimeline;
