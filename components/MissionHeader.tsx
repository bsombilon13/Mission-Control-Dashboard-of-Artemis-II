
import React, { useState, useEffect, useMemo } from 'react';
import { MissionPhase } from '../types';
import { MISSION_EVENTS } from './MissionTimeline';

interface Props {
  phase: MissionPhase;
  setPhase: (phase: MissionPhase) => void;
  countdownMs: number;
  onOpenSettings: () => void;
  isAudioEnabled: boolean;
  onToggleAudio: () => void;
  onOpenNotifications: () => void;
  notificationCount: number;
  missionDay: number | null;
  elapsedSeconds: number;
  theme: 'dark' | 'light';
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

const MissionHeader: React.FC<Props> = ({ 
  phase, 
  setPhase, 
  countdownMs, 
  onOpenSettings, 
  isAudioEnabled, 
  onToggleAudio,
  onOpenNotifications,
  notificationCount,
  missionDay,
  elapsedSeconds,
  theme
}) => {
  const [displayPhase, setDisplayPhase] = useState(phase);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [centralTime, setCentralTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCentralTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCentralTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Chicago',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(date);
  };
  const nextMilestone = useMemo(() => {
    return MISSION_EVENTS.find(m => m.offsetSeconds > elapsedSeconds);
  }, [elapsedSeconds]);

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
    <header className={`relative z-50 flex flex-col border-b shadow-[0_8px_30px_rgba(0,0,0,0.5)] overflow-hidden transition-colors duration-500 ${
      theme === 'dark' ? 'border-white/20' : 'border-slate-200'
    }`}>
      <div className={`absolute inset-0 transition-colors duration-500 ${
        theme === 'dark' ? 'bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900' : 'bg-gradient-to-r from-slate-50 via-white to-slate-50'
      }`}></div>
      
      {/* Dynamic Top Accent Bar */}
      <div 
        className={`absolute top-0 left-0 w-full h-1 transition-colors duration-1000 ${isTransitioning ? 'animate-phase-out' : 'animate-phase-in'}`} 
        style={{ 
          backgroundColor: activePhase.color, 
          boxShadow: `0 0 15px ${activePhase.glow}` 
        }}
      ></div>

      <div className="relative px-4 sm:px-6 py-2 sm:py-3 flex flex-col lg:flex-row items-center justify-between space-y-3 lg:space-y-0">
        {/* Mission Brand & Dynamic Phase Badge */}
        <div className="flex items-center space-x-4 sm:space-x-10 w-full lg:w-auto justify-between lg:justify-start">
          <div className="flex items-center space-x-3 sm:space-x-6">
            <div className="flex items-center space-x-3 sm:space-x-5">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/e/e5/NASA_logo.svg" 
                alt="NASA" 
                className="w-10 sm:w-16 h-auto" 
              />
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/e/e2/Artemis_program_%28original_with_wordmark%29.svg" 
                alt="Artemis Program" 
                className="w-10 sm:w-14 h-auto brightness-0 invert" 
              />
            </div>
            <div className="h-6 sm:h-8 w-px bg-white/10"></div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <h1 className={`text-lg sm:text-xl font-black tracking-tight leading-none uppercase drop-shadow-md transition-colors duration-500 ${
                  theme === 'dark' ? 'text-white' : 'text-slate-900'
                }`}>Artemis II</h1>
                {missionDay !== null && (
                  <div className={`px-1.5 sm:px-2 py-0.5 rounded border transition-colors duration-500 ${
                    theme === 'dark' ? 'bg-blue-500/10 border-blue-500/30' : 'bg-blue-500/5 border-blue-500/20'
                  }`}>
                    <span className="text-[7px] sm:text-[9px] font-black text-blue-500 uppercase tracking-widest">Day {missionDay}</span>
                  </div>
                )}
              </div>
              <p className={`text-[7px] sm:text-[8px] font-bold uppercase tracking-[0.3em] mt-1 sm:mt-1.5 transition-colors duration-500 ${
                theme === 'dark' ? 'text-white/50' : 'text-slate-500'
              }`}>Launch Control</p>
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            {/* TACTICAL PHASE BADGE - Compact on mobile */}
            <div 
              className={`px-2 sm:px-3 py-1 rounded-full border flex items-center space-x-1.5 sm:space-x-2 transition-all duration-700 ${isTransitioning ? 'animate-phase-out' : 'animate-phase-in'}`}
              style={{ 
                backgroundColor: `${activePhase.color}25`, 
                borderColor: `${activePhase.color}80`,
                boxShadow: `0 0 15px ${activePhase.color}40` 
              }}
            >
              <div className="w-3 h-3 sm:w-4 sm:h-4" style={{ color: activePhase.color }}>
                {activePhase.icon}
              </div>
              <span className={`text-[8px] sm:text-[10px] font-black uppercase tracking-[0.1em] sm:tracking-[0.15em] whitespace-nowrap transition-colors duration-500 ${
                theme === 'dark' ? 'text-white' : 'text-slate-800'
              }`}>
                <span className="hidden xs:inline">{activePhase.label}</span>
                <span className="xs:hidden">{activePhase.shortLabel}</span>
              </span>
            </div>

            {/* NEXT MILESTONE BADGE */}
            {nextMilestone && (
              <div className="flex items-center space-x-2 px-2 py-0.5 bg-white/5 rounded border border-white/10">
                <div className="w-1 h-1 rounded-full bg-blue-400 animate-pulse"></div>
                <span className="text-[7px] sm:text-[8px] font-black text-slate-400 uppercase tracking-widest truncate max-w-[120px] sm:max-w-[200px]">
                  NEXT: {nextMilestone.label.split(':')[0]}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Master Mission Clock */}
        <div className="flex flex-col items-center w-full lg:w-auto group">
          <div className="flex items-center space-x-4 mb-1.5">
            {isCritical ? (
              <p className="text-[8px] sm:text-[10px] text-red-500 uppercase tracking-[0.4em] sm:tracking-[0.6em] font-black animate-pulse">
                Terminal Count Initiation
              </p>
            ) : (
              <div className="flex items-center space-x-3">
                <p className={`text-[8px] sm:text-[10px] uppercase tracking-[0.3em] sm:tracking-[0.5em] font-black transition-colors duration-500 ${
                  theme === 'dark' ? 'text-white/40' : 'text-slate-500'
                }`}>
                  {isTMinus ? 'Countdown to Liftoff' : 'Mission Elapsed Time'}
                </p>
                <div className={`h-[1px] w-8 sm:w-12 transition-colors duration-500 ${theme === 'dark' ? 'bg-white/10' : 'bg-slate-200'}`}></div>
                <div className="flex items-center space-x-2">
                  <span className={`text-[8px] sm:text-[10px] font-black uppercase tracking-widest transition-colors duration-500 ${
                    theme === 'dark' ? 'text-blue-400/60' : 'text-blue-600/60'
                  }`}>CT:</span>
                  <span className={`text-[10px] sm:text-[12px] font-bold mono tabular-nums transition-colors duration-500 ${
                    theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                  }`}>
                    {formatCentralTime(centralTime)}
                  </span>
                </div>
              </div>
            )}
          </div>
          
          <div 
            className={`flex items-baseline font-black mono tracking-tighter tabular-nums transition-all duration-500 relative px-4 sm:px-8 py-1.5 sm:py-2.5 rounded-xl border-2 shadow-2xl ${
              isCritical 
                ? 'bg-red-600/10 border-red-500/50 animate-[criticalGlow_0.5s_ease-in-out_infinite_alternate]' 
                : theme === 'dark' 
                  ? 'bg-black/40 border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)] group-hover:border-blue-500/30 group-hover:shadow-[0_0_40px_rgba(59,130,246,0.15)]' 
                  : 'bg-white border-slate-200 shadow-[0_10px_40px_rgba(0,0,0,0.05)] group-hover:border-blue-500/30 group-hover:shadow-[0_10px_40px_rgba(59,130,246,0.1)]'
            } ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}
          >
            {isCritical && (
              <div className="absolute inset-0 rounded-xl border-2 border-red-500/30 animate-[criticalBorderFlash_0.5s_step-end_infinite]"></div>
            )}
            
            <span className={`text-3xl sm:text-5xl font-black ${isCritical ? 'text-red-500' : theme === 'dark' ? 'text-blue-500/40' : 'text-blue-600/30'}`}>
              {isTMinus ? 'L-' : 'T+'}
            </span>
            <span className={`text-3xl sm:text-5xl font-black ${isCritical ? 'text-red-600' : ''}`}>{timeParts.d}</span>
            <span className={`text-xl sm:text-2xl mx-1 ${isCritical ? 'text-red-400' : 'opacity-20'}`}>:</span>
            <span className={`text-3xl sm:text-5xl font-black ${isCritical ? 'text-red-600' : ''}`}>{timeParts.h}</span>
            <span className={`text-xl sm:text-2xl mx-1 ${isCritical ? 'text-red-400' : 'opacity-20'}`}>:</span>
            <span className={`text-3xl sm:text-5xl font-black ${isCritical ? 'text-red-600' : ''}`}>{timeParts.m}</span>
            <span className={`text-xl sm:text-2xl mx-1 ${isCritical ? 'text-red-400' : 'opacity-20'}`}>:</span>
            <span className={`text-3xl sm:text-5xl font-black ${isCritical ? 'text-red-600' : ''}`}>{timeParts.s}</span>
            <span className={`text-xl sm:text-2xl mx-1 ${isCritical ? 'text-red-400' : 'opacity-20'}`}>:</span>
            <span className={`text-2xl sm:text-3xl font-black ${isCritical ? 'text-red-400' : theme === 'dark' ? 'text-white/60' : 'text-slate-500'}`}>{timeParts.ms}</span>
          </div>
        </div>
        
        {/* Settings, Audio & System Status */}
        <div className="flex items-center space-x-2 sm:space-x-4 w-full lg:w-auto justify-center lg:justify-end">
          <div className="text-right hidden md:block mr-2">
            <p className={`text-[8px] font-bold uppercase tracking-widest leading-none transition-colors duration-500 ${
              theme === 'dark' ? 'text-white/40' : 'text-slate-500'
            }`}>System Status</p>
            <div className="flex items-center space-x-2 mt-1 justify-end">
              <p className={`text-[10px] font-black uppercase ${isCritical ? 'text-red-500 animate-pulse' : 'text-emerald-500'}`}>
                {isCritical ? 'TERMINAL_CRITICAL' : 'ALL_SYSTEMS_NOMINAL'}
              </p>
              <div className={`w-1.5 h-1.5 rounded-full ${isCritical ? 'bg-red-500 animate-ping' : 'bg-emerald-500 animate-pulse'}`}></div>
            </div>
          </div>
          
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            <button 
              onClick={onOpenNotifications}
              className={`p-2 sm:p-2.5 border rounded-lg sm:rounded-xl transition-all group relative ${
                theme === 'dark' ? 'bg-white/5 hover:bg-white/10 border-white/10' : 'bg-slate-100 hover:bg-slate-200 border-slate-200'
              }`}
              title="Mission Advisories"
            >
              <svg className={`w-4 h-4 sm:w-5 sm:h-5 transition-all ${
                theme === 'dark' ? 'text-slate-400 group-hover:text-blue-400' : 'text-slate-600 group-hover:text-blue-600'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[7px] sm:text-[8px] font-black w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center border border-slate-900 shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                  {notificationCount}
                </span>
              )}
            </button>

            <button 
              onClick={onToggleAudio}
              className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl border transition-all group flex items-center justify-center ${
                isAudioEnabled 
                  ? 'bg-blue-600/20 border-blue-500 text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
                  : theme === 'dark' 
                    ? 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10' 
                    : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
              title={isAudioEnabled ? "Mute Comms" : "Enable Audio Comms"}
            >
              {isAudioEnabled ? (
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </button>

            <button 
              onClick={onOpenSettings}
              className={`p-2 sm:p-2.5 border rounded-lg sm:rounded-xl transition-all group ${
                theme === 'dark' ? 'bg-white/5 hover:bg-white/10 border-white/10' : 'bg-slate-100 hover:bg-slate-200 border-slate-200'
              }`}
            >
              <svg className={`w-4 h-4 sm:w-5 sm:h-5 transition-all group-hover:rotate-45 ${
                theme === 'dark' ? 'text-slate-400 group-hover:text-blue-400' : 'text-slate-600 group-hover:text-blue-600'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* PHASE PROGRESSION BAR */}
      <div className={`relative border-t px-4 sm:px-6 py-1.5 sm:py-2 flex items-center transition-colors duration-500 ${
        theme === 'dark' ? 'bg-black/40 border-white/5' : 'bg-slate-100 border-slate-200'
      }`}>
        <div className="flex flex-1 items-center max-w-5xl mx-auto justify-between space-x-4 sm:space-x-0">
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
                    className={`relative w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center border transition-all duration-700 ${
                      isActive 
                        ? `bg-blue-600/20 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)] scale-110` 
                        : isPast 
                          ? `${theme === 'dark' ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-200 border-slate-300'} opacity-60` 
                          : `${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'} opacity-30`
                    }`}
                    style={{ borderColor: isActive ? p.color : undefined }}
                  >
                    <div className="w-3 h-3 sm:w-4 sm:h-4 transition-colors duration-500" style={{ color: isActive ? p.color : isPast ? (theme === 'dark' ? '#94a3b8' : '#64748b') : (theme === 'dark' ? '#475569' : '#94a3b8') }}>
                      {p.icon}
                    </div>
                    {isActive && (
                      <div className="absolute -inset-1 rounded-lg sm:rounded-xl border border-blue-500/20 animate-ping opacity-40"></div>
                    )}
                  </div>
                  
                  <div className="ml-2 sm:ml-3 hidden md:flex flex-col">
                    <span className={`text-[7px] sm:text-[8px] font-black uppercase tracking-widest transition-colors duration-500 ${
                      isActive ? (theme === 'dark' ? 'text-white' : 'text-slate-900') : 'text-slate-500'
                    }`}>
                      {p.shortLabel}
                    </span>
                    <span className={`text-[6px] sm:text-[7px] font-bold uppercase transition-colors duration-500 ${
                      isActive ? 'text-blue-400' : 'text-slate-700'
                    }`} style={{ color: isActive ? p.color : undefined }}>
                      {isActive ? 'Current' : isPast ? 'Complete' : 'Pending'}
                    </span>
                  </div>
                </div>

                {/* Connector */}
                {idx < PHASE_CONFIG.length - 1 && (
                  <div className={`flex-1 min-w-[1rem] sm:min-w-[2rem] h-px mx-2 sm:mx-4 relative overflow-hidden ${
                    theme === 'dark' ? 'bg-white/5' : 'bg-slate-200'
                  }`}>
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
