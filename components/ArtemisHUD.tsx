
import React, { useMemo, Suspense, useState } from 'react';
import { TelemetryData, MissionPhase } from '../types';
import ArtemisModel3D from './ArtemisModel3D';
import { RotateCcw, ZoomIn } from 'lucide-react';

interface Props {
  phase: MissionPhase;
  elapsedSeconds: number;
  telemetry: TelemetryData;
  hideContainer?: boolean;
}

const ArtemisHUD: React.FC<Props> = ({ phase, elapsedSeconds, telemetry, hideContainer }) => {
  const { altitude, velocity } = telemetry;
  const [resetTrigger, setResetTrigger] = useState(0);

  const isPreLaunch = elapsedSeconds < 0;
  const isAscent = elapsedSeconds >= 0 && elapsedSeconds < 486;
  const isOrbit = elapsedSeconds >= 486 && elapsedSeconds < 786780;
  const isReturn = elapsedSeconds >= 786780 && elapsedSeconds < 787560;
  const isLanded = elapsedSeconds >= 787560;

  // Deep space window for starlight effects (TLI completion to Re-entry)
  const isDeepSpace = elapsedSeconds >= 92220 && elapsedSeconds < 786780;

  const isSupersonic = velocity > 1234 && isAscent;
  const isMaxQ = elapsedSeconds >= 60 && elapsedSeconds <= 85;
  
  const isBoosterSeparated = elapsedSeconds >= 128;
  const isBoosterSepFlash = elapsedSeconds >= 128 && elapsedSeconds < 131;
  
  const isLASJettisoned = elapsedSeconds >= 198;
  const isCoreSeparated = elapsedSeconds >= 498;
  const isCoreSepFlash = elapsedSeconds >= 498 && elapsedSeconds < 501.5;
  
  const isICPSActive = elapsedSeconds >= 498 && elapsedSeconds < 12255;
  const isOrionSeparated = elapsedSeconds >= 12255;
  const isOrionSepFlash = elapsedSeconds >= 12255 && elapsedSeconds < 12258;

  const isSolarArrayDeployed = elapsedSeconds >= 13455;

  // Telemetry-driven Environment Physics
  const atmosphereDensity = Math.max(0, Math.exp(-altitude / 8.5)); // 1.0 at SL, exponential decay
  const atmosphereOpacity = atmosphereDensity * 0.25;
  const spaceOpacity = Math.min(1, altitude / 60);
  const speedFactor = Math.min(1, velocity / 28000);

  // Dynamic Pitch (Gravity Turn)
  const pitchAngle = useMemo(() => {
    if (elapsedSeconds < 10) return 0;
    if (isAscent) {
      return Math.min(80, ((elapsedSeconds - 10) / 476) * 80);
    }
    if (isReturn) return 160; 
    return 85; 
  }, [elapsedSeconds, isAscent, isReturn]);
  
  // Re-entry or high-speed ascent atmospheric compression
  const plasmaIntensity = Math.max(0, (speedFactor * 1.5) * atmosphereDensity * (altitude > 20 ? 1 : 0)) + (isReturn ? 0.8 : 0);

  // ENHANCED: Physics-accurate Multi-frequency Camera Shake
  const { shakeX, shakeY, aeroStress } = useMemo(() => {
    let x = 0;
    let y = 0;
    let stress = 0;

    if (isAscent) {
      // 1. Engine Vibration (High Frequency jitter)
      const engineVib = (Math.sin(elapsedSeconds * 95.3) * 0.6 + Math.sin(elapsedSeconds * 144.7) * 0.4);
      
      // 2. Aerodynamic Buffeting (Mid-Freq rumble)
      // Buffeting peaks at Max Q (Dynamic Pressure)
      // Max Q Bell Curve: Peaks at 70s, lasts roughly 25s
      const maxQIntensity = Math.exp(-Math.pow(elapsedSeconds - 70, 2) / 450);
      const buffetFreq = 18 + Math.sin(elapsedSeconds) * 4;
      const buffetVib = Math.sin(elapsedSeconds * buffetFreq) * 2.5 * maxQIntensity;
      
      stress = maxQIntensity * 100;
      
      // Combine and scale by density (vibration stops in vacuum)
      const totalShake = (engineVib + buffetVib) * (0.3 + (atmosphereDensity * 0.7));
      
      x = totalShake * 1.2;
      y = totalShake * 0.9;
      
      if (isSupersonic) { x *= 1.4; y *= 1.4; }
    } else if (isReturn) {
      // High-intensity re-entry shake
      x = (Math.sin(elapsedSeconds * 80) * 4 + Math.sin(elapsedSeconds * 12) * 2);
      y = (Math.sin(elapsedSeconds * 70) * 3 + Math.sin(elapsedSeconds * 15) * 1.5);
      stress = 80;
    }
    
    // Separation Events
    if (isBoosterSepFlash || isCoreSepFlash || isOrionSepFlash) {
      const pulse = Math.sin(elapsedSeconds * 200) * 10;
      x += pulse;
      y += pulse;
    }

    return { shakeX: x, shakeY: y, aeroStress: stress };
  }, [elapsedSeconds, isAscent, isReturn, isSupersonic, atmosphereDensity, isBoosterSepFlash, isCoreSepFlash, isOrionSepFlash]);

  // Enhanced Distortion Scaling
  const distortionScale = useMemo(() => {
    if (!isAscent && !isReturn) return 0;
    // Higher speed + Higher density = More compression / shimmering
    let scale = (velocity / 4000) * atmosphereDensity * 20;
    if (isMaxQ) scale *= 1.5;
    if (isReturn) scale += 30;
    return Math.min(60, scale);
  }, [velocity, atmosphereDensity, isAscent, isReturn, isMaxQ]);

  return (
    <div className={`relative h-full w-full flex items-center justify-center overflow-hidden transition-all duration-700 ${hideContainer ? 'bg-transparent' : 'glass rounded-xl p-4 border border-slate-800 bg-slate-950/40 min-h-[400px]'}`}>
      
      {/* SVG Filters for Atmospheric Distortion */}
      <svg className="absolute w-0 h-0 overflow-hidden">
        <defs>
          <filter id="heatHaze">
            <feTurbulence type="fractalNoise" baseFrequency="0.02 0.08" numOctaves="4" seed={Math.floor(elapsedSeconds % 100)}>
              <animate attributeName="baseFrequency" dur="3s" values="0.02 0.08;0.025 0.12;0.02 0.08" repeatCount="indefinite" />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" scale={distortionScale} />
          </filter>
        </defs>
      </svg>

      {/* HUD State & Tactical Readouts */}
      <div className="absolute top-4 right-4 z-40 flex flex-col items-end space-y-2">
        <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border transition-all duration-500 flex items-center space-x-2 ${
          isAscent ? 'bg-orange-500/20 border-orange-500 text-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.2)]' :
          isOrbit ? 'bg-blue-500/20 border-blue-500 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.2)]' :
          isReturn ? 'bg-red-500/20 border-red-500 text-red-400 shadow-[0_0_100px_rgba(239,68,68,0.2)]' : 'bg-slate-800 border-slate-700 text-slate-500'
        }`}>
          <div className={`w-1 h-1 rounded-full bg-current ${isAscent || isReturn ? 'animate-ping' : ''}`}></div>
          <span>{isAscent ? 'Propulsion Nominal' : isOrbit ? 'Orbital Ops' : isReturn ? 'Thermal Interface' : 'Standby'}</span>
        </div>
        
        {/* AERO STRESS HUD INDICATOR */}
        {aeroStress > 5 && (
          <div className="flex flex-col items-end">
            <div className="flex items-center space-x-1 mb-1">
              <span className={`text-[7px] font-black uppercase tracking-widest ${aeroStress > 80 ? 'text-red-500' : 'text-blue-400'}`}>Aero_Stress</span>
              <span className="text-[9px] mono text-white font-bold">{Math.round(aeroStress)}%</span>
            </div>
            <div className="w-24 h-1 bg-slate-900 border border-white/5 rounded-full overflow-hidden">
              <div className={`h-full transition-all duration-300 ${aeroStress > 80 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${aeroStress}%` }}></div>
            </div>
            {isMaxQ && (
              <div className="mt-2 text-[10px] text-orange-500 font-black uppercase animate-pulse tracking-tighter shadow-orange-500/20 drop-shadow-md">
                Critical // Max_Q_Zone
              </div>
            )}
          </div>
        )}
      </div>

      {/* Atmospheric & Space Effects */}
      <div className="absolute inset-0 pointer-events-none transition-opacity duration-1000" style={{ opacity: atmosphereOpacity, background: 'radial-gradient(circle at 50% 100%, rgba(59, 130, 246, 0.2) 0%, transparent 90%)' }}></div>
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ opacity: spaceOpacity }}>
        {Array.from({ length: 40 }).map((_, i) => (
          <div key={`star star-${i}`} className="absolute bg-white rounded-full" style={{ left: `${(i * 137.45) % 100}%`, top: `${(i * 71.89) % 100}%`, width: `${0.5 + (i % 1)}px`, height: `${0.5 + (i % 1)}px`, opacity: 0.1 + Math.random() * 0.4, animation: `starFlow ${5 + (1 - speedFactor) * 25}s linear infinite`, animationDelay: `-${Math.random() * 20}s` }} />
        ))}
      </div>

      {/* Re-entry / Ascent Glow Layer */}
      {(plasmaIntensity > 0.05 || isReturn) && (
        <div 
          className="absolute inset-0 pointer-events-none z-20 mix-blend-screen transition-opacity duration-700" 
          style={{ 
            opacity: plasmaIntensity, 
            background: isReturn ? 'radial-gradient(ellipse at center, rgba(255, 60, 0, 0.4) 0%, rgba(255, 120, 0, 0.2) 40%, transparent 80%)' : 'radial-gradient(ellipse at center, rgba(255, 120, 50, 0.3) 0%, rgba(255, 30, 0, 0.2) 50%, transparent 95%)',
            filter: 'url(#heatHaze)' 
          }}
        >
           <div className="absolute inset-0 opacity-30 animate-pulse bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')] bg-fixed"></div>
        </div>
      )}

      {/* 3D VEHICLE MODEL */}
      <Suspense fallback={<div className="text-blue-500 mono text-[10px] animate-pulse">INITIALIZING 3D ENGINE...</div>}>
        <ArtemisModel3D 
          phase={phase}
          elapsedSeconds={elapsedSeconds}
          pitchAngle={pitchAngle}
          isBoosterSeparated={isBoosterSeparated}
          isLASJettisoned={isLASJettisoned}
          isCoreSeparated={isCoreSeparated}
          isOrionSeparated={isOrionSeparated}
          isSolarArrayDeployed={isSolarArrayDeployed}
          isAscent={isAscent}
          isICPSActive={isICPSActive}
          isReturn={isReturn}
          shakeX={shakeX}
          shakeY={shakeY}
          resetCameraTrigger={resetTrigger}
        />
      </Suspense>

      {/* 3D Controls Overlay */}
      <div className="absolute bottom-4 right-4 z-40 flex flex-col space-y-2">
        <button 
          onClick={() => setResetTrigger(prev => prev + 1)}
          className="p-2 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all group flex items-center space-x-2"
          title="Reset View"
        >
          <RotateCcw size={12} className="group-hover:rotate-[-45deg] transition-transform" />
          <span className="text-[8px] mono font-bold uppercase tracking-widest">Reset View</span>
        </button>
        <div className="p-2 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-lg text-slate-500 flex items-center space-x-2">
          <ZoomIn size={12} />
          <span className="text-[8px] mono font-bold uppercase tracking-widest">Scroll to Zoom</span>
        </div>
      </div>

      {/* TECHNICAL LABELS OVERLAY */}
      <div className="absolute inset-0 pointer-events-none z-30">
        <TechnicalLabel text="ORION_MPC" top="25%" left="60%" visible={!isOrionSeparated} />
        <TechnicalLabel text="ICPS_STAGE" top="40%" left="60%" visible={!isOrionSeparated && !isCoreSeparated} />
        <TechnicalLabel text="SLS_CORE" top="60%" left="65%" visible={!isCoreSeparated} />
        <TechnicalLabel text="SRB_R" top="75%" left="75%" visible={!isBoosterSeparated} />
        <TechnicalLabel text="SRB_L" top="75%" left="25%" visible={!isBoosterSeparated} />
      </div>

      {/* METRICS HUD */}
      <div className="absolute bottom-6 left-6 space-y-4 z-30 pointer-events-none scale-75 md:scale-90 origin-bottom-left">
        <MetricItem label="Trajectory Pitch" value={pitchAngle} unit="DEG" color="text-white" progress={pitchAngle/90} />
        <MetricItem label="V-Speed" value={velocity} unit="KM/H" color="text-blue-400" progress={velocity/28000} />
        <MetricItem label="Radar Altitude" value={altitude} unit="KM" color="text-emerald-400" progress={altitude/400} />
      </div>

      <style>{`
        @keyframes starFlow { 0% { transform: translateY(-100vh); } 100% { transform: translateY(100vh); } }
        @keyframes blink-fast { 0%, 100% { opacity: 1; } 50% { opacity: 0.2; } }
        @keyframes blink-slow { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
      `}</style>
    </div>
  );
};

const MetricItem: React.FC<{ label: string, value: number, unit: string, color: string, progress: number }> = ({ label, value, unit, color, progress }) => (
  <div className="flex flex-col">
    <span className="text-[10px] text-slate-500 uppercase font-black tracking-[0.4em] mb-1">{label}</span>
    <div className="flex items-center space-x-3">
      <div className="flex items-baseline w-36">
        <span className={`text-4xl mono font-black tabular-nums ${color} drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]`}>
          {value.toLocaleString(undefined, { maximumFractionDigits: label.includes('Pitch') ? 1 : 0 })}
        </span>
        <span className="text-[10px] text-slate-600 mono font-black ml-2">{unit}</span>
      </div>
      <div className="w-32 h-1 bg-slate-900 rounded-full overflow-hidden border border-white/5">
        <div className={`h-full transition-all duration-700 ease-out ${color.replace('text-', 'bg-')}`} style={{ width: `${Math.min(100, progress * 100)}%`, boxShadow: '0 0 10px currentColor' }}></div>
      </div>
    </div>
  </div>
);

const TechnicalLabel: React.FC<{ text: string, top: string, left: string, visible: boolean }> = ({ text, top, left, visible }) => (
  <div 
    className="absolute flex items-center space-x-2 transition-all duration-1000"
    style={{ top, left, opacity: visible ? 0.6 : 0, transform: `scale(${visible ? 1 : 0.8})` }}
  >
    <div className="w-8 h-px bg-blue-500/50"></div>
    <span className="text-[8px] mono text-blue-400 font-bold tracking-tighter whitespace-nowrap bg-slate-950/80 px-1 border border-blue-500/20">{text}</span>
  </div>
);

export default ArtemisHUD;
