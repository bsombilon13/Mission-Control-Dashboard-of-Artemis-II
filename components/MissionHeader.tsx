
import React, { useState, useEffect } from 'react';
import { MissionPhase } from '../types';

interface Props {
  phase: MissionPhase;
  setPhase: (phase: MissionPhase) => void;
  countdownMs: number;
  onOpenSettings: () => void;
  isAudioEnabled: boolean;
  onToggleAudio: () => void;
}

interface PhaseConfig {
  id: MissionPhase;
  label: string;
  shortLabel: string;
  color: string;
  glow: string;
  icon: React.ReactNode;
}

const PHASE_CONFIG: PhaseConfig[] = [
  {
    id: MissionPhase.PRE_LAUNCH,
    label: 'Pre-Launch Sequence',
    shortLabel: 'PRE',
    color: '#fbbf24', // Amber
    glow: 'rgba(251,191,36,0.6)',
    icon: (
      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  {
    id: MissionPhase.ASCENT,
    label: 'Ascent & Injection',
    shortLabel: 'ASC',
    color: '#f97316', // Orange
    glow: 'rgba(249,115,22,0.6)',
    icon: (
      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.5 14h.5a2 2 0 100-4h-.5M8 20l4-9 4 9m-4-9V3m-4 5h8" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 3l1.5 3h-3L12 3zM9 16h6" />
      </svg>
    )
  },
  {
    id: MissionPhase.ORBIT,
    label: 'Trans-Lunar Transit',
    shortLabel: 'TRN',
    color: '#3b82f6', // Blue
    glow: 'rgba(59,130,246,0.6)',
    icon: (
      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="3" />
        <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-45 12 12)" />
      </svg>
    )
  },
  {
    id: MissionPhase.LUNAR_FLYBY,
    label: 'Lunar Sphere of Influence',
    shortLabel: 'LUN',
    color: '#6366f1', // Indigo
    glow: 'rgba(99,102,241,0.6)',
    icon: (
      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    )
  },
  {
    id: MissionPhase.RETURN,
    label: 'Earth Re-Entry',
    shortLabel: 'RET',
    color: '#ef4444', // Red
    glow: 'rgba(239,68,68,0.6)',
    icon: (
      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    )
  },
  {
    id: MissionPhase.SPLASHDOWN,
    label: 'Recovery Operations',
    shortLabel: 'SPL',
    color: '#10b981', // Emerald
    glow: 'rgba(16,185,129,0.6)',
    icon: (
      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 15a4 4 0 004 4h10a4 4 0 004-4M3 15a4 4 0 014-4h10a4 4 0 014 4M3 15V9m18 6V9" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 11V7m10 4V7m-5 4V5" />
      </svg>
    )
  }
];

const MissionHeader: React.FC<Props> = ({ phase, setPhase, countdownMs, onOpenSettings, isAudioEnabled, onToggleAudio }) => {
  const [displayPhase, setDisplayPhase] = useState(phase);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (phase !== displayPhase) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setDisplayPhase(phase);
        setIsTransitioning(false);
      }, 400); // Wait for fade-out (400ms) before switching data
      return () => clearTimeout(timer);
    }
  }, [phase, displayPhase]);

  const activePhaseIdx = PHASE_CONFIG.findIndex(p => p.id === displayPhase);
  const activePhase = PHASE_CONFIG[activePhaseIdx] || PHASE_CONFIG[0];

  const formatCountdown = (msTotal: number) => {
    const abs = Math.abs(msTotal);
    const d = Math.floor(abs / (1000 * 60 * 60 * 24));
    const h = Math.floor((abs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((abs % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((abs % (1000 * 60)) / 1000);
    const ms = Math.floor((abs % 1000) / 10);
    
    return {
      d: d.toString().padStart(2, '0'),
      h: h.toString().padStart(2, '0'),
      m: m.toString().padStart(2, '0'),
      s: s.toString().padStart(2, '0'),
      ms: ms.toString().padStart(2, '0')
    };
  };

  const timeParts = formatCountdown(countdownMs);
  const isTMinus = countdownMs > 0;
  const isCritical = isTMinus && countdownMs < 60000 && phase === MissionPhase.PRE_LAUNCH;

  return (
    <header className="relative z-50 flex flex-col border-b border-white/20 shadow-[0_8px_30px_rgba(0,0,0,0.5)] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900"></div>
      
      {/* Dynamic Top Accent Bar */}
      <div 
        className={`absolute top-0 left-0 w-full h-1 transition-colors duration-1000 ${isTransitioning ? 'animate-phase-out' : 'animate-phase-in'}`} 
        style={{ 
          backgroundColor: activePhase.color, 
          boxShadow: `0 0 15px ${activePhase.glow}` 
        }}
      ></div>

      <div className="relative px-8 py-4 flex items-center justify-between">
        {/* Mission Brand & Dynamic Phase Badge */}
        <div className="flex items-center space-x-10">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-5">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/e/e5/NASA_logo.svg" 
                alt="NASA" 
                className="w-16 h-auto" 
              />
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/e/e2/Artemis_program_%28original_with_wordmark%29.svg" 
                alt="Artemis Program" 
                className="w-14 h-auto brightness-0 invert" 
              />
            </div>
            <div className="h-8 w-px bg-white/10"></div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-black tracking-tight leading-none text-white uppercase drop-shadow-md">Artemis II</h1>
                {/* TACTICAL PHASE BADGE */}
                <div 
                  className={`px-3 py-1 rounded-full border flex items-center space-x-2 transition-all duration-700 ${isTransitioning ? 'animate-phase-out' : 'animate-phase-in'}`}
                  style={{ 
                    backgroundColor: `${activePhase.color}25`, 
                    borderColor: `${activePhase.color}80`,
                    boxShadow: `0 0 15px ${activePhase.color}40` 
                  }}
                >
                  <div className="w-4 h-4" style={{ color: activePhase.color }}>
                    {activePhase.icon}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.15em] text-white">
                    {activePhase.label}
                  </span>
                </div>
              </div>
              <p className="text-[8px] text-white/50 font-bold uppercase tracking-[0.3em] mt-1.5">Launch Operations Control</p>
            </div>
          </div>
        </div>

        {/* Master Mission Clock */}
        <div className="flex flex-col items-center">
          <div className="flex items-center space-x-4 mb-1">
            {isCritical ? (
              <p className="text-[8px] text-red-400 uppercase tracking-[0.5em] font-black animate-pulse">
                Terminal Count Initiation // Warning
              </p>
            ) : (
              <p className="text-[8px] text-white/30 uppercase tracking-[0.5em] font-black">
                {isTMinus ? 'Countdown to Liftoff' : 'Mission Elapsed Time'}
              </p>
            )}
          </div>
          
          <div 
            className={`flex items-baseline font-black mono tracking-tighter tabular-nums transition-all duration-300 relative px-4 py-1 rounded-lg ${
              isCritical 
                ? 'text-white bg-red-600/10 animate-[criticalGlow_0.5s_ease-in-out_infinite_alternate]' 
                : 'text-white'
            }`}
          >
            {isCritical && (
              <div className="absolute inset-0 rounded-lg border border-red-500/30 animate-[criticalBorderFlash_0.5s_step-end_infinite]"></div>
            )}
            
            <span className={`text-4xl font-bold ${isCritical ? 'text-red-100' : 'opacity-40'}`}>
              {isTMinus ? 'L-' : 'T+'}
            </span>
            <span className={`text-4xl font-bold ${isCritical ? 'text-red-50' : ''}`}>{timeParts.d}</span>
            <span className={`text-xl mx-0.5 ${isCritical ? 'text-red-400' : 'opacity-20'}`}>:</span>
            <span className={`text-4xl font-bold ${isCritical ? 'text-red-50' : ''}`}>{timeParts.h}</span>
            <span className={`text-xl mx-0.5 ${isCritical ? 'text-red-400' : 'opacity-20'}`}>:</span>
            <span className={`text-4xl font-bold ${isCritical ? 'text-red-50' : ''}`}>{timeParts.m}</span>
            <span className={`text-xl mx-0.5 ${isCritical ? 'text-red-400' : 'opacity-20'}`}>:</span>
            <span className={`text-4xl font-bold ${isCritical ? 'text-red-50' : ''}`}>{timeParts.s}</span>
            <span className={`text-xl mx-0.5 ${isCritical ? 'text-red-400' : 'opacity-20'}`}>:</span>
            <span className={`text-2xl font-bold ${isCritical ? 'text-red-200' : 'opacity-60'}`}>{timeParts.ms}</span>
          </div>
        </div>
        
        {/* Settings, Audio & System Status */}
        <div className="flex items-center space-x-4">
          <div className="text-right hidden sm:block mr-2">
            <p className="text-[8px] text-white/40 font-bold uppercase tracking-widest leading-none">System Status</p>
            <div className="flex items-center space-x-2 mt-1 justify-end">
              <p className={`text-[10px] font-black uppercase ${isCritical ? 'text-red-500 animate-pulse' : 'text-emerald-400'}`}>
                {isCritical ? 'TERMINAL_CRITICAL' : 'ALL_SYSTEMS_NOMINAL'}
              </p>
              <div className={`w-1.5 h-1.5 rounded-full ${isCritical ? 'bg-red-500 animate-ping' : 'bg-emerald-500 animate-pulse'}`}></div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={onToggleAudio}
              className={`p-2.5 rounded-xl border transition-all group flex items-center justify-center ${
                isAudioEnabled 
                  ? 'bg-blue-600/20 border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
              title={isAudioEnabled ? "Mute Comms" : "Enable Audio Comms"}
            >
              {isAudioEnabled ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </button>

            <button 
              onClick={onOpenSettings}
              className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all group"
            >
              <svg className="w-5 h-5 text-slate-400 group-hover:text-blue-400 group-hover:rotate-45 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* PHASE PROGRESSION BAR */}
      <div className="relative bg-black/40 border-t border-white/5 px-8 py-3 flex items-center">
        <div className="flex flex-1 items-center max-w-5xl mx-auto justify-between">
          {PHASE_CONFIG.map((p, idx) => {
            const isPast = idx < activePhaseIdx;
            const isActive = idx === activePhaseIdx;
            
            return (
              <React.Fragment key={p.id}>
                {/* Node */}
                <div 
                  className={`flex items-center group relative cursor-pointer ${isActive ? 'z-20' : 'z-10'}`} 
                  onClick={() => setPhase(p.id)}
                >
                  <div 
                    className={`relative w-9 h-9 rounded-xl flex items-center justify-center border transition-all duration-700 ${
                      isActive 
                        ? `bg-blue-600/20 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)] scale-110` 
                        : isPast 
                          ? `bg-slate-800/80 border-slate-700 opacity-60` 
                          : `bg-slate-900 border-slate-800 opacity-30`
                    }`}
                    style={{ borderColor: isActive ? p.color : undefined }}
                  >
                    <div className="w-4 h-4 transition-colors duration-500" style={{ color: isActive ? p.color : isPast ? '#94a3b8' : '#475569' }}>
                      {p.icon}
                    </div>
                    {isActive && (
                      <div className="absolute -inset-1 rounded-xl border border-blue-500/20 animate-ping opacity-40"></div>
                    )}
                  </div>
                  
                  <div className="ml-3 hidden lg:flex flex-col">
                    <span className={`text-[8px] font-black uppercase tracking-widest transition-colors duration-500 ${
                      isActive ? 'text-white' : 'text-slate-500'
                    }`}>
                      {p.shortLabel}
                    </span>
                    <span className={`text-[7px] font-bold uppercase transition-colors duration-500 ${
                      isActive ? 'text-blue-400' : 'text-slate-700'
                    }`} style={{ color: isActive ? p.color : undefined }}>
                      {isActive ? 'Current' : isPast ? 'Complete' : 'Pending'}
                    </span>
                  </div>
                </div>

                {/* Connector */}
                {idx < PHASE_CONFIG.length - 1 && (
                  <div className="flex-1 h-px mx-4 relative overflow-hidden bg-white/5">
                    <div 
                      className={`absolute inset-0 transition-all duration-[2000ms] ${isPast ? 'bg-blue-500' : isActive ? 'bg-gradient-to-r from-blue-500 to-transparent animate-[progressSweep_3s_linear_infinite]' : 'bg-transparent'}`}
                      style={{ backgroundColor: isPast ? p.color : undefined }}
                    ></div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes criticalPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.02); opacity: 0.8; }
        }
        @keyframes criticalGlow {
          0% { box-shadow: 0 0 10px rgba(239, 68, 68, 0.1); transform: scale(1); }
          100% { box-shadow: 0 0 30px rgba(239, 68, 68, 0.4); transform: scale(1.02); }
        }
        @keyframes criticalBorderFlash {
          0%, 49% { border-color: rgba(239, 68, 68, 0.4); background-color: rgba(239, 68, 68, 0.05); }
          50%, 100% { border-color: rgba(239, 68, 68, 0.8); background-color: rgba(239, 68, 68, 0.2); }
        }
        @keyframes progressSweep {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </header>
  );
};

export default MissionHeader;
