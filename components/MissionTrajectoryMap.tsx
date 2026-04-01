
import React, { useMemo, useRef, useEffect, useState } from 'react';

interface Props {
  elapsedSeconds: number;
  hideContainer?: boolean;
}

interface Milestone {
  id: number;
  label: string;
  shortLabel: string;
  description: string;
  objective: string;
  historicalFact: string;
  missionFact: string;
  x: number;
  y: number;
  t: number;
  color: string;
}

const MILESTONES: Milestone[] = [
  { 
    id: 0, 
    label: "Launch & Ascent", 
    shortLabel: "LIFT",
    description: "SLS rocket ignites and Orion begins its climb to space.", 
    objective: "Clear the launch tower and execute roll/pitch maneuver to target orbital insertion.",
    historicalFact: "First crewed SLS mission in history.",
    missionFact: "Clears tower at T+09s.",
    x: 21, y: 34, t: 0, color: "#3b82f6" 
  },
  { 
    id: 1, 
    label: "High Earth Orbit", 
    shortLabel: "HEO",
    description: "Apogee raise burn for comprehensive system testing.", 
    objective: "Evaluate life support, comms, and prox ops in a 42-hour high Earth orbit phase.",
    historicalFact: "Longest crewed orbital test prior to TLI.",
    missionFact: "High Earth orbit lasts through the translunar injection.",
    x: 42, y: 14, t: 6477, color: "#60a5fa" 
  },
  { 
    id: 2, 
    label: "Translunar Injection", 
    shortLabel: "TLI",
    description: "The burn that sends crew toward the Moon.", 
    objective: "Execute precision high-velocity burn to depart Earth orbit for lunar trajectory.",
    historicalFact: "Marks the return of humans to the deep space environment.",
    missionFact: "Occurs on Flight Day 2 at T+92,220s.",
    x: 68, y: 22, t: 92220, color: "#10b981" 
  },
  { 
    id: 3, 
    label: "Lunar Flyby", 
    shortLabel: "FLYBY",
    description: "Closest approach to the lunar surface.", 
    objective: "Utilize lunar gravity for a free-return trajectory back to Earth.",
    historicalFact: "Crew will pass behind the Farside, occulted from Earth comms.",
    missionFact: "Closest approach at T+437,000s.",
    x: 84, y: 60, t: 437000, color: "#f1f5f9" 
  },
  { 
    id: 4, 
    label: "Return Cruise", 
    shortLabel: "RTN",
    description: "Long journey home with trajectory correction burns.", 
    objective: "Maintain thermal regulation and prep for high-velocity atmospheric interface.",
    historicalFact: "Trajectory correction burns ensure precise Pacific targeting.",
    missionFact: "Velocity increases as Earth gravity takes over.",
    x: 48, y: 76, t: 600000, color: "#3b82f6" 
  },
  { 
    id: 5, 
    label: "Re-entry & Splashdown", 
    shortLabel: "RECOVERY",
    description: "Atmospheric entry and Pacific splashdown.", 
    objective: "Validate heat shield performance at 25,000 mph and recover crew safely.",
    historicalFact: "Skip-entry maneuver used for precision targeting.",
    missionFact: "Splashdown on Flight Day 10 at T+783,960s.",
    x: 19, y: 38, t: 783960, color: "#ef4444" 
  }
];

const MissionTrajectoryMap: React.FC<Props> = ({ elapsedSeconds, hideContainer }) => {
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [isSynced, setIsSynced] = useState(true);
  const [pathLength, setPathLength] = useState(0);
  
  const fullPathD = "M 21,34 C 28,10 55,5 68,22 C 85,38 95,50 84,60 C 75,70 65,85 45,75 C 28,65 22,45 19,38";
  const pathRef = useRef<SVGPathElement>(null);
  const [indicatorPos, setIndicatorPos] = useState({ x: 0, y: 0, angle: 0 });

  const totalMissionSeconds = 784860;
  const progress = Math.max(0, Math.min(1, elapsedSeconds / totalMissionSeconds));

  useEffect(() => {
    if (pathRef.current) {
      const length = pathRef.current.getTotalLength();
      setPathLength(length);
      const point = pathRef.current.getPointAtLength(length * progress);
      const nextPoint = pathRef.current.getPointAtLength(Math.min(length, length * progress + 0.1));
      const angle = Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x) * (180 / Math.PI);
      setIndicatorPos({ x: point.x, y: point.y, angle });
    }
  }, [progress]);

  const currentActiveMilestone = useMemo(() => {
    const reached = [...MILESTONES].reverse().find(m => elapsedSeconds >= m.t);
    return reached || null;
  }, [elapsedSeconds]);

  useEffect(() => {
    if (isSynced) setSelectedMilestone(currentActiveMilestone);
  }, [currentActiveMilestone, isSynced]);

  const mapContent = (
    <div className="relative h-full w-full flex flex-col p-4 bg-slate-950/40 select-none overflow-hidden min-h-0">
      <div className="flex justify-between items-start mb-4 shrink-0">
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.2em]">Trajectory Status</span>
          <div className="flex items-center space-x-3 mt-1">
             <div className="flex items-center space-x-1">
               <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
               <span className="text-[8px] mono text-blue-400 font-bold uppercase tracking-tight">Active Navigation</span>
             </div>
          </div>
        </div>
        <button 
          onClick={() => setIsSynced(!isSynced)}
          className={`px-2 py-1 rounded text-[8px] mono border transition-all ${isSynced ? 'bg-blue-600/10 border-blue-500/30 text-blue-400' : 'bg-slate-800 text-slate-500 border-slate-700'}`}
        >
          {isSynced ? 'Synced' : 'Manual'}
        </button>
      </div>

      <div className="flex-1 flex space-x-4 min-h-0 overflow-hidden relative">
        <div className="relative flex-1 bg-slate-950/80 rounded-xl border border-slate-800/50 overflow-hidden shadow-inner">
          <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <defs>
              <radialGradient id="earthGrad"><stop offset="0%" stopColor="#3b82f6" /><stop offset="100%" stopColor="#020617" /></radialGradient>
              <radialGradient id="moonGrad"><stop offset="0%" stopColor="#f1f5f9" /><stop offset="100%" stopColor="#1e293b" /></radialGradient>
              <clipPath id="earthClip"><circle r="7" /></clipPath>
              <filter id="trajectoryGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="0.4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            <path d={fullPathD} fill="none" stroke="#3b82f6" strokeWidth="0.5" strokeDasharray="1,1.5" className="opacity-10" />
            <path ref={pathRef} d={fullPathD} fill="none" stroke="transparent" strokeWidth="0" />
            <path d={fullPathD} fill="none" stroke="#fff" strokeWidth="0.8" strokeDasharray={pathLength} strokeDashoffset={pathLength * (1 - progress)} strokeLinecap="round" filter="url(#trajectoryGlow)" className="transition-all duration-300 ease-linear opacity-90" />

            <g transform="translate(20, 35)">
               <circle r="7" fill="#0f172a" stroke="#3b82f6" strokeWidth="0.2" className="opacity-90" />
               <text y="12" textAnchor="middle" className="text-[3px] mono fill-blue-400/60 font-black uppercase">Earth</text>
            </g>
            <g transform="translate(75, 60)">
               <circle r="5" fill="url(#moonGrad)" stroke="#94a3b8" strokeWidth="0.2" className="opacity-80" />
               <text y="10" textAnchor="middle" className="text-[3px] mono fill-slate-400 font-black uppercase">Moon</text>
            </g>

            {MILESTONES.map((m) => {
              const isPassed = elapsedSeconds >= m.t;
              const isCurrent = currentActiveMilestone?.id === m.id;
              const isActive = (selectedMilestone?.id === m.id) || (hoveredId === m.id);
              return (
                <g key={m.id} className="cursor-pointer" onMouseEnter={() => setHoveredId(m.id)} onMouseLeave={() => setHoveredId(null)} onClick={() => { setSelectedMilestone(m); setIsSynced(false); }}>
                  <circle cx={m.x} cy={m.y} r="5" fill="transparent" />
                  <circle cx={m.x} cy={m.y} r={isActive ? "2.5" : "1.2"} fill={isPassed ? m.color : "#020617"} stroke="#fff" strokeWidth={isActive ? "0.8" : "0.3"} className="transition-all duration-300" />
                </g>
              );
            })}

            {progress > 0 && progress < 1 && (
              <g transform={`translate(${indicatorPos.x}, ${indicatorPos.y}) rotate(${indicatorPos.angle})`}>
                <path d="M -1.5,-1 L 2,0 L -1.5,1 Z" fill="#fff" />
                <circle r="2" fill="#3b82f6" className="opacity-20 animate-pulse" />
              </g>
            )}
          </svg>

          {/* TRAJECTORY HOVER TOOLTIP */}
          {hoveredId !== null && !selectedMilestone && (
            <div 
              className="absolute z-[60] pointer-events-none transform -translate-x-1/2 -translate-y-[110%] animate-in fade-in zoom-in duration-150"
              style={{ left: `${MILESTONES.find(m => m.id === hoveredId)?.x}%`, top: `${MILESTONES.find(m => m.id === hoveredId)?.y}%` }}
            >
              <div className="bg-slate-900/95 border border-blue-500/50 rounded-lg p-2 backdrop-blur-md shadow-2xl min-w-[120px]">
                 <span className="text-[9px] font-black text-white uppercase">{MILESTONES.find(m => m.id === hoveredId)?.label}</span>
                 <p className="text-[7px] text-slate-400 font-bold uppercase">{MILESTONES.find(m => m.id === hoveredId)?.shortLabel}</p>
              </div>
            </div>
          )}

          {selectedMilestone && (
            <div className="absolute bottom-2 left-2 right-2 bg-slate-900/95 border border-blue-500/40 rounded-lg p-3 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 duration-300 z-50">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-[10px] font-black text-white uppercase tracking-widest">{selectedMilestone.label}</h4>
                <button onClick={() => { setSelectedMilestone(null); setIsSynced(false); }} className="text-slate-500 hover:text-white"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg></button>
              </div>
              <p className="text-[9px] text-blue-100 italic mb-2">"{selectedMilestone.objective}"</p>
              <div className="text-[8px] text-slate-400 leading-tight">
                {selectedMilestone.missionFact}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return hideContainer ? mapContent : (
    <div className="glass rounded-xl border border-slate-800 shadow-2xl overflow-hidden h-full">{mapContent}</div>
  );
};

export default MissionTrajectoryMap;
