
import React, { useEffect, useRef, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import TacticalCard from './TacticalCard';
import { TimelineEvent } from '../types';
import { Info, Clock, Activity, CheckCircle2, Circle, Tag, Box, Target, Layers } from 'lucide-react';

interface Props {
  elapsedSeconds: number;
  isCompressed?: boolean;
}

export const MISSION_EVENTS: TimelineEvent[] = [
  // --- EXHAUSTIVE PRE-LAUNCH SEQUENCE (L-49H 15M to Liftoff) ---
  { offsetSeconds: -177300, phase: 'pre-launch', category: 'countdown', label: "L-49H 15M: Call to Stations", description: "The launch team arrives on their stations and the countdown begins." },
  { offsetSeconds: -175500, phase: 'pre-launch', category: 'countdown', label: "Propulsion Prep Start", description: "LOX/LH2 system preparations for vehicle loading begins (L-48H 45M)." },
  { offsetSeconds: -175200, phase: 'pre-launch', category: 'countdown', label: "L-48H 40M: Clock Start", description: "The countdown clock begins its initial run." },
  { offsetSeconds: -171000, phase: 'pre-launch', category: 'countdown', label: "Sound Suppression Prep", description: "Fill the water tank for the sound suppression system (L-47H 30M)." },
  { offsetSeconds: -160200, phase: 'pre-launch', category: 'countdown', label: "Orion Spacecraft Power-up", description: "The Orion spacecraft is powered up if not already powered at call to stations (L-44H 30M).", associatedModule: "Orion Crew Module" },
  { offsetSeconds: -144000, phase: 'pre-launch', category: 'countdown', label: "ICPS Power-up", description: "The interim cryogenic propulsion stage (ICPS) is powered up (L-40H).", associatedModule: "ICPS" },
  { offsetSeconds: -142200, phase: 'pre-launch', category: 'countdown', label: "Core Stage Power-up", description: "The core stage is powered up (L-39H 30M).", associatedModule: "SLS Core Stage" },
  { offsetSeconds: -139500, phase: 'pre-launch', category: 'countdown', label: "RS-25 Final Prep", description: "Final preparations of the four RS-25 engines (L-38H 45M).", associatedModule: "RS-25 Engines" },
  { offsetSeconds: -121500, phase: 'pre-launch', category: 'countdown', label: "ICPS Power-down", description: "The ICPS is powered down for pre-launch system cycling (L-33H 45M).", associatedModule: "ICPS" },
  { offsetSeconds: -117000, phase: 'pre-launch', category: 'countdown', label: "Orion Battery Charge", description: "Charge Orion flight batteries to 100% (L-32H 30M).", associatedModule: "Orion Crew Module" },
  { offsetSeconds: -109800, phase: 'pre-launch', category: 'countdown', label: "Core Battery Charge", description: "Charge core stage flight batteries (L-30H 30M).", associatedModule: "SLS Core Stage" },
  { offsetSeconds: -67500, phase: 'pre-launch', category: 'countdown', label: "ICPS Launch Power-up", description: "The ICPS is powered-up for launch sequence (L-18H 45M).", associatedModule: "ICPS" },
  { offsetSeconds: -64800, phase: 'pre-launch', category: 'countdown', label: "Crew Suit Reg Leak Check", description: "Orion crew suit regulator leak checks begin (L-18H).", associatedModule: "Orion Crew Module" },
  { offsetSeconds: -52200, phase: 'pre-launch', category: 'countdown', label: "L-15H: Pad Evacuation", description: "All non-essential personnel leave Launch Complex 39B (L-14H 30M)." },
  { offsetSeconds: -47700, phase: 'pre-launch', category: 'countdown', label: "GN2 Cavity Inerting", description: "Air-to-gaseous nitrogen (GN2) changeover and vehicle cavity inerting (L-13H 15M)." },
  { offsetSeconds: -45900, phase: 'pre-launch', category: 'countdown', label: "GLS Activation", description: "Ground Launch Sequencer (GLS) activation (L-12H 45M)." },
  { offsetSeconds: -42000, phase: 'pre-launch', category: 'countdown', label: "L-11H 40M: Weather Brief", description: "Launch team conducts a weather and tanking briefing." },
  { offsetSeconds: -41700, phase: 'pre-launch', category: 'countdown', label: "Hold (L-11H 35M)", description: "2-hour 15-minute built-in countdown hold begins." },
  { offsetSeconds: -37200, phase: 'pre-launch', category: 'countdown', label: "L-10H 20M: Tanking Go Poll", description: "Launch team decides if they are “go” or “no-go” to begin tanking." },
  { offsetSeconds: -37200, phase: 'pre-launch', category: 'countdown', label: "Orion Cold Soak", description: "Orion spacecraft cold soak sequence (L-10H 20M)." },
  { offsetSeconds: -36600, phase: 'pre-launch', category: 'countdown', label: "Core LOX Chilldown", description: "Core stage LOX transfer line chilldown (L-10H 10M)." },
  { offsetSeconds: -36600, phase: 'pre-launch', category: 'countdown', label: "Core LH2 Chilldown", description: "Core stage LH2 chilldown (L-10H 10M)." },
  { offsetSeconds: -35400, phase: 'pre-launch', category: 'countdown', label: "Core LOX MPS Chilldown", description: "Core stage LOX main propulsion system chilldown (L-9H 50M)." },
  { offsetSeconds: -33900, phase: 'pre-launch', category: 'countdown', label: "Core LH2 Slow Fill", description: "Core stage LH2 slow fill start (L-9H 25M)." },
  { offsetSeconds: -33600, phase: 'pre-launch', category: 'countdown', label: "Resume T-Clock", description: "Resume T-Clock from T-8H 10M (L-9H 20M)." },
  { offsetSeconds: -33000, phase: 'pre-launch', category: 'countdown', label: "Core LOX Slow Fill", description: "Core stage LOX slow fill start (L-9H 10M)." },
  { offsetSeconds: -32400, phase: 'pre-launch', category: 'countdown', label: "Core LH2 Fast Fill", description: "Core stage LH2 fast fill (L-9H)." },
  { offsetSeconds: -32100, phase: 'pre-launch', category: 'countdown', label: "Core LOX Fast Fill", description: "Core stage LOX fast fill (L-8H 55M)." },
  { offsetSeconds: -31500, phase: 'pre-launch', category: 'countdown', label: "ICPS LH2 Chilldown", description: "ICPS LH2 chilldown (L-8H 45M)." },
  { offsetSeconds: -31200, phase: 'pre-launch', category: 'countdown', label: "L-8H 40M: Crew Wake-up", description: "Flight crew wake up and launch countdown status check." },
  { offsetSeconds: -29400, phase: 'pre-launch', category: 'countdown', label: "ICPS LH2 Fast Fill", description: "ICPS LH2 fast fill start (L-8H 10M)." },
  { offsetSeconds: -27600, phase: 'pre-launch', category: 'countdown', label: "Core LH2 Topping", description: "Core stage LH2 topping (L-7H 40M)." },
  { offsetSeconds: -27000, phase: 'pre-launch', category: 'countdown', label: "Core LH2 Replenish", description: "Core stage LH2 replenish mode (L-7H 30M – launch)." },
  { offsetSeconds: -26700, phase: 'pre-launch', category: 'countdown', label: "ICPS LH2 Vent/Relief Test", description: "ICPS LH2 vent and relief test (L-7H 25M)." },
  { offsetSeconds: -25500, phase: 'pre-launch', category: 'countdown', label: "ICPS LH2 Tank Topping", description: "ICPS LH2 tank topping start (L-7H 05M)." },
  { offsetSeconds: -24600, phase: 'pre-launch', category: 'countdown', label: "ICPS LH2 Replenish", description: "ICPS LH2 replenish (L-6H 50M-launch)." },
  { offsetSeconds: -22200, phase: 'pre-launch', category: 'countdown', label: "Orion Comms Activated", description: "Orion communications system activated (L-6H 10M)." },
  { offsetSeconds: -22200, phase: 'pre-launch', category: 'countdown', label: "Core LOX Topping", description: "Core stage LOX topping (L-6H 10M)." },
  { offsetSeconds: -22200, phase: 'pre-launch', category: 'countdown', label: "ICPS LOX MPS Chilldown", description: "ICPS LOX main propulsion system chilldown (L-6H 10M)." },
  { offsetSeconds: -21600, phase: 'pre-launch', category: 'countdown', label: "L-6H: Crew Weather Brief", description: "Flight crew weather brief." },
  { offsetSeconds: -21600, phase: 'pre-launch', category: 'countdown', label: "ICPS LOX Fast Fill", description: "ICPS LOX fast fill (L-6H)." },
  { offsetSeconds: -20400, phase: 'pre-launch', category: 'countdown', label: "Core LOX Replenish", description: "Core stage LOX replenish (L-5H 40M – launch)." },
  { offsetSeconds: -20400, phase: 'pre-launch', category: 'countdown', label: "Pad Rescue Ready", description: "Stage pad rescue team and closeout crew assembly (L-5H 40M)." },
  { offsetSeconds: -20400, phase: 'pre-launch', category: 'countdown', label: "Suit Donning", description: "Flight crew begins donning launch and entry spacesuits (L-5H 40M)." },
  { offsetSeconds: -18900, phase: 'pre-launch', category: 'countdown', label: "ICPS LOX Relief Test", description: "ICPS LOX vent and relief test (L-5H 15M)." },
  { offsetSeconds: -18000, phase: 'pre-launch', category: 'countdown', label: "ICPS LOX Topping", description: "ICPS LOX topping (L-5H)." },
  { offsetSeconds: -16800, phase: 'pre-launch', category: 'countdown', label: "Hold (L-4H 40M)", description: "Start 40-minute built-in hold; Closeout crew to white room." },
  { offsetSeconds: -16800, phase: 'pre-launch', category: 'countdown', label: "Crew Departure (O&C)", description: "Flight crew departs O&C suit room for launch complex (L-4H 40M)." },
  { offsetSeconds: -16200, phase: 'pre-launch', category: 'countdown', label: "Arrival at Pad 39B", description: "Flight crew departs to Launch Complex 39B (L-4H 30M)." },
  { offsetSeconds: -15900, phase: 'pre-launch', category: 'countdown', label: "Orion Ingress Prep", description: "Orion preps for flight crew ingress (L-4H 25M)." },
  { offsetSeconds: -15200, phase: 'pre-launch', category: 'countdown', label: "White Room Access", description: "Flight crew heads to white room (L-4H 20M)." },
  { offsetSeconds: -15000, phase: 'pre-launch', category: 'countdown', label: "Helmets/Gloves Donning", description: "Flight crew puts on helmets and gloves (L-4H 10M)." },
  { offsetSeconds: -14400, phase: 'pre-launch', category: 'countdown', label: "L-4H: Crew Ingress", description: "Flight crew ingress, communication checks and suit leak checks." },
  { offsetSeconds: -12300, phase: 'pre-launch', category: 'countdown', label: "White Room Closeout", description: "White room closeout complete (L-3H 25M)." },
  { offsetSeconds: -12000, phase: 'pre-launch', category: 'countdown', label: "Hatch Closure", description: "Crew module hatch preps and closure (L-3H 20M)." },
  { offsetSeconds: -11700, phase: 'pre-launch', category: 'countdown', label: "Hatch Seal Checks", description: "Counterbalance mechanism hatch seal press decay checks (L-3H 15M)." },
  { offsetSeconds: -8400, phase: 'pre-launch', category: 'countdown', label: "Service Panel Closeout", description: "Crew module hatch service panel install/closeouts (L-2H 20M)." },
  { offsetSeconds: -6000, phase: 'pre-launch', category: 'countdown', label: "LAS Hatch Closure", description: "Launch abort system (LAS) hatch closure for flight (L-1H 40M)." },
  { offsetSeconds: -4200, phase: 'pre-launch', category: 'countdown', label: "LD Briefing (L-70M)", description: "Launch Director brief – Flight vehicle/TPS Scan results." },
  { offsetSeconds: -2700, phase: 'pre-launch', category: 'countdown', label: "Pad Clear", description: "Closeout crew departs Launch Complex 39B (L-45M)." },
  { offsetSeconds: -2400, phase: 'pre-launch', category: 'countdown', label: "L-40M: Final Built-in Hold", description: "Built in 30-minute countdown hold begins." },
  { offsetSeconds: -1800, phase: 'pre-launch', category: 'countdown', label: "NTD Briefing (L-30M)", description: "Final NASA Test Director (NTD) briefing is held." },
  { offsetSeconds: -1500, phase: 'pre-launch', category: 'countdown', label: "L-25M: Hold Transition", description: "Transition team to Orion Earth comm loop." },
  { offsetSeconds: -960, phase: 'pre-launch', category: 'countdown', label: "L-16M: Final Launch Poll", description: "Launch director polls team to ensure they are “go” for launch." },
  { offsetSeconds: -900, phase: 'pre-launch', category: 'countdown', label: "Visors Down (L-15M)", description: "Flight crew visors down." },
  { offsetSeconds: -840, phase: 'pre-launch', category: 'countdown', label: "Short Purge Check", description: "Flight crew short purge verification (L-14M)." },
  { offsetSeconds: -600, phase: 'pre-launch', category: 'countdown', label: "T-10M: Terminal Count", description: "Ground Launch Sequencer initiates terminal count." },
  { offsetSeconds: -480, phase: 'pre-launch', category: 'countdown', label: "Access Arm Retract (T-8M)", description: "Crew Access Arm retract." },
  { offsetSeconds: -360, phase: 'pre-launch', category: 'countdown', label: "T-6M: Tank Pressurization", description: "GLS go for core stage tank pressurization." },
  { offsetSeconds: -360, phase: 'pre-launch', category: 'countdown', label: "Orion Internal Power", description: "Orion set to internal power (T-6M)." },
  { offsetSeconds: -360, phase: 'pre-launch', category: 'countdown', label: "Ascent Pyros Armed", description: "Orion ascent pyros are armed (T-6M)." },
  { offsetSeconds: -357, phase: 'pre-launch', category: 'countdown', label: "Core LH2 Terminate", description: "Core stage LH2 terminate replenish (T-5M 57S)." },
  { offsetSeconds: -320, phase: 'pre-launch', category: 'countdown', label: "LAS Capability Active", description: "Launch Abort System capability is available (T-5M 20S)." },
  { offsetSeconds: -280, phase: 'pre-launch', category: 'countdown', label: "High Flow Bleed", description: "GLS is go for LH2 high flow bleed check (T-4M 40S)." },
  { offsetSeconds: -270, phase: 'pre-launch', category: 'countdown', label: "FTS Arming", description: "GLS is go for flight termination system arm (T-4M 30S)." },
  { offsetSeconds: -240, phase: 'pre-launch', category: 'countdown', label: "Core APU Start (T-4M)", description: "Core stage auxiliary power unit (APU) start." },
  { offsetSeconds: -240, phase: 'pre-launch', category: 'countdown', label: "Core LOX Terminate", description: "Core stage LOX terminate replenish (T-4M)." },
  { offsetSeconds: -210, phase: 'pre-launch', category: 'countdown', label: "ICPS LOX Terminate", description: "ICPS LOX terminate replenish (T-3M 30S)." },
  { offsetSeconds: -190, phase: 'pre-launch', category: 'countdown', label: "Purge Sequence 4", description: "GLS is go for purge sequence 4 (T-3M 10S)." },
  { offsetSeconds: -122, phase: 'pre-launch', category: 'countdown', label: "ICPS Internal Power", description: "ICPS switches to internal battery power (T-2M 02S)." },
  { offsetSeconds: -120, phase: 'pre-launch', category: 'countdown', label: "Booster Internal Power", description: "Booster switches to internal battery power (T-2M)." },
  { offsetSeconds: -90, phase: 'pre-launch', category: 'countdown', label: "Core Internal Power", description: "Core stage switches to internal power (T-1M 30S)." },
  { offsetSeconds: -80, phase: 'pre-launch', category: 'countdown', label: "ICPS Terminal Mode", description: "ICPS enters terminal countdown mode (T-1M 20S)." },
  { offsetSeconds: -50, phase: 'pre-launch', category: 'countdown', label: "ICPS LH2 Terminate", description: "ICPS LH2 terminate replenish (T-50S)." },
  { offsetSeconds: -33, phase: 'pre-launch', category: 'countdown', label: "ALS Go Command", description: "GLS sends “go for automated launch sequencer” command (T-33S)." },
  { offsetSeconds: -30, phase: 'pre-launch', category: 'countdown', label: "Flight Computer ALS", description: "Core stage flight computer to automated launching sequencer (T-30S)." },
  { offsetSeconds: -12, phase: 'pre-launch', category: 'countdown', label: "Hydrogen Burn Off", description: "Hydrogen burn off igniters initiated (T-12S)." },
  { offsetSeconds: -10, phase: 'ascent', category: 'ascent', label: "Engine Start Command", description: "GLS sends the command for core stage engine start (T-10S)." },
  { offsetSeconds: -6.36, phase: 'ascent', category: 'ascent', label: "RS-25 Startup", description: "RS-25 engines startup sequence begins." },
  
  // --- MISSION ASCENT ---
  { offsetSeconds: 0, phase: 'ascent', category: 'ascent', label: "T-0: LIFTOFF", description: "Booster ignition, umbilical separation, and liftoff.", associatedModule: "SLS Block 1" },
  { offsetSeconds: 9, phase: 'ascent', category: 'ascent', label: "Tower Clear", description: "SLS clears the launch tower.", estimatedDuration: "9s" },
  { offsetSeconds: 70, phase: 'ascent', category: 'ascent', label: "Max Q", description: "Maximum dynamic pressure on vehicle structure.", estimatedDuration: "12s" },
  { offsetSeconds: 128, phase: 'ascent', category: 'ascent', label: "SRB Separation", description: "Solid Rocket Booster burnout and separation.", associatedModule: "SRBs" },
  { offsetSeconds: 198, phase: 'ascent', category: 'ascent', label: "LAS Jettison", description: "Launch abort system jettison – safe to orbit.", associatedModule: "LAS" },
  { offsetSeconds: 486, phase: 'ascent', category: 'ascent', label: "MECO", description: "SLS core stage main engine cutoff.", estimatedDuration: "8m 6s" },
  { offsetSeconds: 498, phase: 'ascent', category: 'ascent', label: "Core Stage Separation", description: "Core stage separates from ICPS.", associatedModule: "SLS Core Stage" },
  
  // --- MISSION PHASES (Summarized) ---
  { offsetSeconds: 6477, phase: 'orbit', category: 'transit', label: "Apogee Raise Burn", description: "Insertion into high Earth orbit.", estimatedDuration: "20s", associatedModule: "ICPS" },
  { offsetSeconds: 92220, phase: 'transit', category: 'transit', label: "TLI Burn", description: "Translunar Injection - departing for the Moon.", estimatedDuration: "18m", associatedModule: "ICPS" },
  { offsetSeconds: 436980, phase: 'lunar', category: 'lunar', label: "Lunar Flyby", description: "Closest approach to the Lunar surface.", associatedModule: "Orion & ESM" },
  { offsetSeconds: 783180, phase: 'recovery', category: 'recovery', label: "Entry Interface", description: "Orion hits atmosphere.", associatedModule: "Orion Crew Module" },
  { offsetSeconds: 783960, phase: 'splashdown', category: 'recovery', label: "SPLASHDOWN", description: "Artemis II splashdown in the Pacific Ocean.", associatedModule: "Orion Crew Module" },
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
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [hoverPos, setHoverPos] = useState<{ top: number, left: number } | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  const scrollToEvent = (index: number) => {
    const element = scrollRef.current?.querySelector(`[data-event-index="${index}"]`);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeItemRef.current) {
        activeItemRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [activeIndex]);

  const [tooltipSide, setTooltipSide] = useState<'left' | 'right'>('left');

  const handleMouseEnter = (event: TimelineEvent, index: number, e: React.MouseEvent) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    
    const rect = e.currentTarget.getBoundingClientRect();
    const parentRect = scrollRef.current?.getBoundingClientRect();
    if (parentRect) {
      // Determine which side to show the tooltip based on card position in viewport
      const side = parentRect.left < 320 ? 'right' : 'left';
      setTooltipSide(side);
      
      setHoveredEvent(event);
      setHoveredIndex(index);
      setHoverPos({ 
        top: rect.top - parentRect.top + (rect.height / 2),
        left: side === 'left' ? (isCompressed ? -10 : -20) : (isCompressed ? 40 : 60)
      });
    }
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredEvent(null);
      setHoveredIndex(null);
      setHoverPos(null);
    }, 150);
  };

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
    <TacticalCard
      title="Sequence Monitor"
      subtitle="High-Fidelity Flight Profile"
      icon={<Activity className="w-3.5 h-3.5" />}
      allowOverflow={true}
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-emerald-400">Telemetry Locked</span>
          </div>
          <span className="mono text-slate-600">SYNC_ID: {Math.abs(elapsedSeconds).toString(16).toUpperCase()}</span>
        </div>
      }
    >
      <div 
        ref={scrollRef}
        className={`h-full overflow-y-auto scroll-smooth custom-scrollbar transition-colors duration-500 ${
          document.documentElement.classList.contains('light') ? 'bg-slate-50/50' : 'bg-black/30'
        }`}
      >
        <div className={`relative ${isCompressed ? 'py-4' : 'py-6'}`}>
          <div className={`absolute top-0 bottom-0 w-px bg-white/5 ${isCompressed ? 'left-[18px]' : 'left-[34px]'}`}></div>
          
          <div className="space-y-0.5">
            {MISSION_EVENTS.map((event, idx) => {
              const isActive = idx === activeIndex;
              const isPast = idx < activeIndex;
              const isHovered = hoveredEvent === event;

              return (
                <div 
                  key={idx}
                  data-event-index={idx}
                  ref={isActive ? activeItemRef : null}
                  onMouseEnter={(e) => handleMouseEnter(event, idx, e)}
                  onMouseLeave={handleMouseLeave}
                  className={`relative flex items-center transition-all duration-300 cursor-help ${
                    isActive 
                      ? 'bg-blue-600/20 border-y border-blue-500/30 z-20 py-5 shadow-[inset_0_0_20px_rgba(59,130,246,0.1)]' 
                      : `py-1.5 opacity-60 hover:opacity-100 ${document.documentElement.classList.contains('light') ? 'hover:bg-slate-200/50' : 'hover:bg-white/5'}`
                  } ${isCompressed ? 'px-2' : 'px-6'}`}
                >
                  <div className="relative flex items-center justify-center shrink-0">
                    {isActive && <div className="absolute rounded-full bg-blue-500/30 animate-ping w-12 h-12"></div>}
                    <div className={`relative z-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                      isActive ? 'w-7 h-7 bg-blue-500 border-white shadow-[0_0_20px_rgba(59,130,246,0.8)]' : isPast ? 'w-5 h-5 bg-emerald-500/20 border-emerald-500/50' : 'w-3 h-3 bg-slate-800 border-slate-600'
                    }`}>
                      {isActive ? (
                        <div className="w-2.5 h-2.5 bg-white rounded-full shadow-inner"></div>
                      ) : isPast ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      ) : null}
                    </div>
                  </div>

                  <div className={`${isCompressed ? 'ml-3' : 'ml-6'} flex-1 overflow-hidden`}>
                    <div className="flex flex-col">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex flex-row items-center gap-2 truncate">
                          <span className={`font-black transition-colors truncate uppercase tracking-tight ${isCompressed ? 'text-[10px]' : 'text-[12px]'} ${
                            isActive 
                              ? (document.documentElement.classList.contains('light') ? 'text-blue-700' : 'text-white') 
                              : isPast 
                                ? (document.documentElement.classList.contains('light') ? 'text-slate-600' : 'text-slate-300') 
                                : (document.documentElement.classList.contains('light') ? 'text-slate-400' : 'text-slate-500')
                          }`}>
                            {event.label}
                          </span>
                          {isPast && (
                            <span className="text-[7px] font-black bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded border border-emerald-500/20 uppercase tracking-widest">
                              Completed
                            </span>
                          )}
                        </div>
                          {!isCompressed && event.phase && (
                            <div className="flex items-center space-x-2 mt-0.5">
                              <span className={`text-[7px] font-black uppercase tracking-widest ${getPhaseStyles(event.phase).split(' ')[0]}`}>{event.phase}</span>
                              <div className="w-1 h-1 rounded-full bg-white/10"></div>
                              <span className="text-[7px] text-slate-600 font-bold uppercase tracking-widest">ID: {Math.abs(event.offsetSeconds).toString(16).toUpperCase()}</span>
                            </div>
                          )}
                        </div>
                        <span className={`mono tabular-nums shrink-0 font-black tracking-tighter ${isCompressed ? 'text-[9px]' : 'text-[11px]'} ${isActive ? 'text-blue-300' : 'text-slate-600'}`}>
                          {formatTimeShort(event.offsetSeconds)}
                        </span>
                      </div>
                      {isActive && !isCompressed && (
                        <motion.p 
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`text-[11px] mt-2 leading-relaxed max-w-sm font-medium transition-colors duration-500 ${
                            document.documentElement.classList.contains('light') ? 'text-slate-600' : 'text-slate-400'
                          }`}
                        >
                          {event.description}
                        </motion.p>
                      )}
                      {isActive && (
                        <div className="mt-3 h-[2px] w-full bg-blue-500/20 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-400 animate-[progress_3s_linear_infinite] shadow-[0_0_10px_rgba(96,165,250,0.5)]" style={{ width: '40%' }}></div>
                        </div>
                      )}
                    </div>
                  </div>
              );
            })}
          </div>
        </div>
      </div>
      
      <div className={`border-t px-4 py-2 flex justify-between items-center text-[9px] font-bold uppercase tracking-[0.2em] shrink-0 transition-colors duration-500 ${
        document.documentElement.classList.contains('light') ? 'bg-slate-100 border-slate-200 text-slate-500' : 'bg-slate-900 border-white/10 text-slate-500'
      }`}>
        <span>Station: FD_SYNC</span>
        <span className="mono">Epoch: 2026.02.07</span>
      </div>

      {/* Interactive Tooltip Portal-like Overlay */}
      <AnimatePresence>
        {hoveredEvent && hoverPos && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            style={{ 
              position: 'absolute',
              top: hoverPos.top,
              ...(tooltipSide === 'left' 
                ? { right: '100%', marginRight: '12px' } 
                : { left: '100%', marginLeft: '12px' }),
              transform: 'translateY(-50%)',
              zIndex: 1000,
              pointerEvents: 'auto'
            }}
            onMouseEnter={() => {
              if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
            }}
            onMouseLeave={handleMouseLeave}
          >
            <div className={`border rounded-xl p-4 backdrop-blur-3xl shadow-[0_0_40px_rgba(0,0,0,0.8)] min-w-[240px] max-w-[300px] relative overflow-hidden transition-colors duration-500 ${
              document.documentElement.classList.contains('light') ? 'bg-white/95 border-slate-200' : 'bg-slate-950/95 border-blue-500/40'
            }`}>
              {/* Tactical Accents */}
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
              <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-blue-500/30 to-transparent"></div>
              
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="p-1 bg-blue-500/10 rounded border border-blue-500/20">
                    <Info size={10} className="text-blue-400" />
                  </div>
                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border tracking-widest ${getPhaseStyles(hoveredEvent.phase)}`}>
                    {hoveredEvent.phase}
                  </span>
                </div>
                <div className="flex items-center space-x-1 text-blue-400">
                  <Clock size={10} />
                  <span className="text-[10px] mono font-black tabular-nums">{formatTimeShort(hoveredEvent.offsetSeconds)}</span>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-3">
                <div>
                  <h4 className={`text-[13px] font-black uppercase tracking-wider leading-tight mb-1 transition-colors duration-500 ${
                    document.documentElement.classList.contains('light') ? 'text-slate-900' : 'text-white'
                  }`}>{hoveredEvent.label}</h4>
                  <div className="flex items-center space-x-2">
                    <div className="h-[1px] flex-1 bg-white/10"></div>
                    <span className="text-[7px] text-slate-600 font-bold uppercase tracking-[0.2em]">Event_ID: {Math.abs(hoveredEvent.offsetSeconds).toString(16).toUpperCase()}</span>
                  </div>
                </div>

                <p className={`text-[11px] leading-relaxed font-medium transition-colors duration-500 ${
                  document.documentElement.classList.contains('light') ? 'text-slate-600' : 'text-slate-300'
                }`}>
                  {hoveredEvent.description}
                </p>

                {/* Detailed Metrics */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10">
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center space-x-1 text-slate-500">
                      <Layers size={8} />
                      <span className="text-[7px] font-bold uppercase tracking-widest">Category</span>
                    </div>
                    <span className="text-[9px] mono text-blue-400 font-bold uppercase truncate">
                      {hoveredEvent.category || 'General'}
                    </span>
                  </div>

                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center space-x-1 text-slate-500">
                      <Target size={8} />
                      <span className="text-[7px] font-bold uppercase tracking-widest">Module</span>
                    </div>
                    <span className="text-[9px] mono text-blue-400 font-bold truncate">
                      {hoveredEvent.associatedModule || 'Integrated Stack'}
                    </span>
                  </div>

                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center space-x-1 text-slate-500">
                      <Clock size={8} />
                      <span className="text-[7px] font-bold uppercase tracking-widest">Offset</span>
                    </div>
                    <span className="text-[9px] mono text-blue-400 font-bold">
                      {hoveredEvent.offsetSeconds.toFixed(1)}s
                    </span>
                  </div>

                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center space-x-1 text-slate-500">
                      <Activity size={8} />
                      <span className="text-[7px] font-bold uppercase tracking-widest">Status</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {elapsedSeconds >= hoveredEvent.offsetSeconds ? (
                        <CheckCircle2 size={9} className="text-emerald-500" />
                      ) : (
                        <Circle size={9} className="text-blue-500 animate-pulse" />
                      )}
                      <span className={`text-[8px] font-black uppercase ${elapsedSeconds >= hoveredEvent.offsetSeconds ? 'text-emerald-500' : 'text-blue-500'}`}>
                        {elapsedSeconds >= hoveredEvent.offsetSeconds ? 'Executed' : 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Go to Event Button */}
                <button
                  onClick={() => hoveredIndex !== null && scrollToEvent(hoveredIndex)}
                  className="w-full mt-2 py-2 bg-blue-600 hover:bg-blue-500 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-lg transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] active:scale-95 pointer-events-auto"
                >
                  Go to Event
                </button>
              </div>

              {/* Decorative Corner */}
              <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-blue-500/5 rounded-full blur-xl"></div>
            </div>
            
            {/* Pointer Arrow */}
            <div className={`absolute ${tooltipSide === 'left' ? 'right-[-6px]' : 'left-[-6px]'} top-1/2 -translate-y-1/2 w-3 h-3 border-r border-t rotate-45 z-[-1] transition-colors duration-500 ${
              document.documentElement.classList.contains('light') ? 'bg-white border-slate-200' : 'bg-slate-950 border-blue-500/40'
            }`}></div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes scanLine { 0% { transform: translateY(0); } 100% { transform: translateY(180px); } }
        @keyframes progress { 0% { transform: translateX(-100%); } 100% { transform: translateX(250%); } }
      `}</style>
    </TacticalCard>
  );
};

export default MissionTimeline;
