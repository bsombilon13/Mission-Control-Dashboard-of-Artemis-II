
import React, { useMemo } from 'react';
import { TelemetryData } from '../types';

interface Props {
  elapsedSeconds: number;
  telemetry: TelemetryData;
  hideContainer?: boolean;
}

const ArtemisHUD: React.FC<Props> = ({ elapsedSeconds, telemetry, hideContainer }) => {
  const { altitude, velocity } = telemetry;

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

  const thrustParticles = useMemo(() => {
    if (!isAscent && !isICPSActive) return [];
    return Array.from({ length: 32 }).map((_, i) => ({
      id: i,
      left: 15 + (i * 9) % 70,
      delay: (i * 0.04) % 1.2,
      duration: 0.2 + (i * 0.03) % 0.6,
      scale: 0.2 + (i % 5) * 0.5,
      opacity: 0.3 + (i % 3) * 0.4
    }));
  }, [isAscent, isICPSActive]);

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

      {/* ROCKET VIEWPORT - High frequency transformation for shake */}
      <div 
        className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
        style={{ 
          transform: `translate(${shakeX}px, ${shakeY}px)`,
          perspective: '2000px'
        }}
      >
        <div 
          className="relative transition-all duration-700 ease-out scale-[0.45] sm:scale-[0.55] md:scale-[0.6] lg:scale-[0.5] xl:scale-[0.6]"
          style={{ 
            filter: distortionScale > 3 ? 'url(#heatHaze)' : 'none',
            backdropFilter: aeroStress > 10 ? `blur(${Math.min(2, aeroStress / 50)}px)` : 'none'
          }}
        >
          {/* Main Assembly Container with fixed dimensions for consistent labeling */}
          <div className="relative w-64 h-[500px] flex flex-col items-center justify-center preserve-3d transition-transform duration-[1500ms] ease-out-expo" style={{ transform: `rotateX(${pitchAngle}deg)`, transformStyle: 'preserve-3d' }}>
            
            {/* ORION ASSEMBLY */}
            <div 
              className="relative preserve-3d transition-all duration-[3500ms] z-30"
              style={{
                transform: isOrionSeparated 
                  ? 'translateZ(300px) translateY(-400px) rotateX(15deg) scale(1.1)' 
                  : 'none'
              }}
            >
              
              {/* Launch Abort System */}
              <div 
                className="absolute bottom-[98%] left-1/2 -translate-x-1/2 preserve-3d transition-all duration-[2800ms]"
                style={{
                  transform: isLASJettisoned 
                    ? 'translateY(-2000px) rotateX(180deg) scale(1.5)' 
                    : 'none',
                  opacity: isLASJettisoned ? 0 : 1
                }}
              >
                 <div className="w-3 h-24 bg-gradient-to-r from-slate-400 via-white to-slate-400 border-x border-slate-500/30 mx-auto relative">
                    <div className="w-full h-6 bg-slate-200" style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }}></div>
                 </div>
                 <div className="relative w-16 h-10 preserve-3d -mt-1">
                    <div className="absolute inset-0 bg-slate-200 border border-slate-400" style={{ clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)' }}></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                 </div>
              </div>

              {/* Orion Capsule */}
              <div className={`w-16 h-14 bg-slate-50 mx-auto relative z-10 transition-all duration-1000 overflow-hidden ${isOrionSepFlash ? 'brightness-200 scale-125 shadow-[0_0_100px_#fff]' : ''} ${isOrbit && !isReturn ? 'shadow-[0_0_40px_rgba(59,130,246,0.4)]' : ''}`} style={{ clipPath: 'polygon(30% 0%, 70% 0%, 100% 100%, 0% 100%)' }}>
                 <div className="absolute inset-0 bg-gradient-to-tr from-white/40 via-transparent to-black/30"></div>
                 
                 {/* STARLIGHT REFLECTION - Orion Capsule */}
                 {isDeepSpace && (
                   <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-full animate-[starlightSweep_12s_ease-in-out_infinite] pointer-events-none"></div>
                 )}

                 {isOrbit && (
                   <>
                     <div className="absolute inset-0 bg-blue-400/5 animate-pulse"></div>
                     <div className="absolute top-2 left-2 w-1 h-1 bg-green-400 rounded-full animate-blink-fast shadow-[0_0_5px_#4ade80]"></div>
                     <div className="absolute top-2 right-2 w-1 h-1 bg-red-400 rounded-full animate-blink-slow shadow-[0_0_5px_#f87171]"></div>
                   </>
                 )}

                 {isReturn && (
                   <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-900/40 to-red-600/60 shadow-[inset_0_-15px_30px_rgba(255,0,0,0.6),0_5px_30px_rgba(255,60,0,0.8)] border-b-2 border-red-500/50"></div>
                 )}

                 {isPreLaunch && (
                   <div className="absolute -left-2 top-2 w-8 h-4 bg-white/10 blur-md animate-venting rotate-12"></div>
                 )}

                 <div className="absolute top-4 left-1/2 -translate-x-1/2 flex space-x-2">
                   <div className="w-3 h-2 bg-slate-900/90 rounded-sm"></div>
                   <div className="w-3 h-2 bg-slate-900/90 rounded-sm"></div>
                 </div>
              </div>

              {/* Solar Arrays */}
              {isSolarArrayDeployed && (
                <div className="absolute top-10 left-1/2 -translate-x-1/2 w-0 h-0 preserve-3d">
                  {[0, 90, 180, 270].map((angle) => (
                    <div key={angle} className="absolute top-0 left-0 w-48 h-12 bg-blue-800/90 border border-blue-400/60 transition-all duration-1000 shadow-[0_0_10px_rgba(59,130,246,0.1)]" style={{ transformOrigin: 'left center', transform: `rotateY(${angle}deg) rotateX(15deg) scaleX(${Math.min(1, (elapsedSeconds - 13455) / 15)})`, clipPath: 'polygon(0% 20%, 98% 0%, 100% 100%, 0% 80%)' }}>
                      <div className="w-full h-full bg-[linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:10px_100%] opacity-40"></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-sweep"></div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ICPS */}
            <div 
              className="transition-all duration-[4500ms] ease-out-expo z-20"
              style={{
                transform: isOrionSeparated 
                  ? 'translateZ(300px) translateY(400px) rotateX(-45deg)' 
                  : isCoreSeparated 
                    ? 'translateY(-60px)' 
                    : 'none',
                opacity: isOrionSeparated ? 0.1 : 1,
                filter: isOrionSeparated ? 'blur(8px)' : 'none'
              }}
            >
               <div className="w-18 h-28 bg-gradient-to-r from-slate-300 via-white to-slate-300 border-x border-slate-400/30 mx-auto relative -mt-1 shadow-xl">
                  <div className="absolute bottom-0 w-full h-12 bg-slate-400/50" style={{ clipPath: 'polygon(0% 0%, 100% 0%, 80% 100%, 20% 100%)' }}></div>
                  {isICPSActive && !isOrionSeparated && (
                     <div className="absolute -bottom-48 left-1/2 -translate-x-1/2 w-20 h-64">
                        <div className="w-full h-full bg-gradient-to-b from-blue-400/70 via-blue-700/5 to-transparent blur-2xl animate-pulse"></div>
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-32 bg-cyan-100 blur-lg opacity-60"></div>
                     </div>
                  )}
               </div>
            </div>

            {/* SLS CORE STAGE & SIDE BOOSTERS */}
            <div 
              className="transition-all duration-[5500ms] ease-out-expo z-10"
              style={{
                transform: isCoreSeparated 
                  ? 'translateY(1200px) rotateX(-90deg)' 
                  : 'none',
                opacity: isCoreSeparated ? 0 : 1
              }}
            >
              <div className="relative preserve-3d w-24 h-[420px] bg-[#e67e22] mx-auto -mt-1 shadow-2xl border-x border-[#d35400]/50 overflow-hidden">
                <div className="absolute inset-0 bg-[repeating-linear-gradient(rgba(0,0,0,0.1)_0px,rgba(0,0,0,0.1)_2px,transparent_2px,transparent_8px)] opacity-30"></div>
                
                {/* STARLIGHT REFLECTION - Core Stage */}
                {isDeepSpace && (
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full animate-[starlightSweep_15s_ease-in-out_infinite_1s] pointer-events-none"></div>
                )}

                {isPreLaunch && (
                  <div className="absolute inset-0 bg-white/5 animate-pulse overflow-hidden">
                     <div className="absolute top-1/4 left-0 w-full h-20 bg-white/10 blur-xl animate-venting"></div>
                     <div className="absolute top-2/4 right-0 w-full h-20 bg-white/10 blur-xl animate-venting" style={{ animationDelay: '2s' }}></div>
                  </div>
                )}

                {/* SRBs */}
                <div className="absolute inset-0 preserve-3d">
                  {[ -1, 1 ].map(side => (
                    <div 
                      key={side} 
                      className="absolute top-28 w-14 h-[350px] bg-white transition-all duration-[6000ms] ease-out-expo"
                      style={{ 
                        [side === -1 ? 'right' : 'left']: '105%', 
                        marginRight: side === -1 ? '-4px' : '0', 
                        marginLeft: side === 1 ? '-4px' : '0', 
                        border: '1px solid #ddd', 
                        boxShadow: side === -1 ? '-5px 0 15px rgba(0,0,0,0.3)' : '5px 0 15px rgba(0,0,0,0.3)',
                        transform: isBoosterSeparated 
                          ? `translateX(${side * 600}px) translateY(1000px) rotate(${side * 150}deg)` 
                          : 'none',
                        opacity: isBoosterSeparated ? 0 : 1
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-80"></div>
                      <div className="absolute inset-x-0 top-1/4 h-1 bg-black/20 rotate-12"></div>
                      <div className="absolute inset-x-0 top-1/2 h-1 bg-black/20 -rotate-12"></div>
                      <div className="absolute bottom-full left-0 w-full h-14 bg-white" style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }}>
                         <div className="absolute top-4 left-1/2 -translate-x-1/2 w-5 h-5 bg-black/5 rounded-full"></div>
                      </div>
                      {isBoosterSepFlash && <div className="absolute top-4 left-0 right-0 h-8 bg-orange-500 blur-xl animate-ping opacity-70"></div>}
                      {!isBoosterSeparated && isAscent && (
                        <div className="absolute -bottom-72 left-1/2 -translate-x-1/2 w-24 h-[450px] z-[-1]">
                           <div className="w-full h-full bg-gradient-to-b from-orange-400 via-orange-600/30 to-transparent blur-[40px] animate-pulse"></div>
                           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-14 h-80 bg-white/95 blur-xl shadow-[0_0_60px_#fff]"></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* BOOSTER SEPARATION FLARE */}
                {isBoosterSepFlash && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 z-50 pointer-events-none">
                    <div className="w-full h-full bg-white rounded-full blur-[60px] animate-ping opacity-90"></div>
                    <div className="absolute inset-0 w-full h-full bg-orange-400 rounded-full blur-[80px] animate-pulse opacity-60"></div>
                  </div>
                )}

                {/* CORE STAGE ENGINE GLOW */}
                {isAscent && !isCoreSeparated && (
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-32 h-32 pointer-events-none z-10">
                     <div className="w-full h-full bg-gradient-to-t from-orange-500/80 via-yellow-400/40 to-transparent blur-2xl rounded-full animate-[enginePulse_0.15s_infinite]"></div>
                     <div className="absolute inset-0 w-full h-full bg-white/20 blur-xl rounded-full animate-[enginePulse_0.08s_infinite] scale-75"></div>
                  </div>
                )}

                {/* CORE STAGE RS-25 ENGINES */}
                {isAscent && !isCoreSeparated && (
                  <div className="absolute -bottom-96 left-1/2 -translate-x-1/2 flex flex-col items-center">
                    <div className="absolute -top-10 w-48 h-48 bg-blue-500/5 blur-3xl animate-venting scale-150"></div>
                    <div className="w-40 h-[600px] bg-gradient-to-b from-orange-500/50 via-red-900/10 to-transparent blur-[80px]"></div>
                    <div className="absolute top-0 w-20 h-96 bg-gradient-to-b from-cyan-400/80 via-blue-600/20 to-transparent blur-3xl animate-pulse opacity-90"></div>
                    {thrustParticles.map(p => (
                      <div 
                        key={p.id} 
                        className="absolute w-2 h-2 rounded-full blur-[2px]" 
                        style={{ 
                          left: `${p.left}%`, 
                          backgroundColor: p.id % 3 === 0 ? '#60a5fa' : '#fdba74',
                          animation: `thrustParticle ${p.duration}s linear infinite`, 
                          animationDelay: `${p.delay}s`, 
                          transform: `scale(${p.scale})`,
                          opacity: p.opacity
                        }} 
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* TECHNICAL LABELS */}
              <div className="absolute inset-0 pointer-events-none">
                <TechnicalLabel text="ORION_MPC" top="5%" left="65%" visible={!isOrionSeparated} />
                <TechnicalLabel text="ICPS_STAGE" top="20%" left="65%" visible={!isOrionSeparated && !isCoreSeparated} />
                <TechnicalLabel text="SLS_CORE" top="50%" left="70%" visible={!isCoreSeparated} />
                <TechnicalLabel text="SRB_R" top="75%" left="85%" visible={!isBoosterSeparated} />
                <TechnicalLabel text="SRB_L" top="75%" left="15%" visible={!isBoosterSeparated} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* METRICS HUD */}
      <div className="absolute bottom-6 left-6 space-y-4 z-30 pointer-events-none scale-75 md:scale-90 origin-bottom-left">
        <MetricItem label="Trajectory Pitch" value={pitchAngle} unit="DEG" color="text-white" progress={pitchAngle/90} />
        <MetricItem label="V-Speed" value={velocity} unit="KM/H" color="text-blue-400" progress={velocity/28000} />
        <MetricItem label="Radar Altitude" value={altitude} unit="KM" color="text-emerald-400" progress={altitude/400} />
      </div>

      <style>{`
        @keyframes starFlow { 0% { transform: translateY(-100vh); } 100% { transform: translateY(100vh); } }
        @keyframes thrustParticle {
          0% { transform: translateY(0) scale(1); opacity: 1; filter: blur(0); }
          50% { opacity: 0.8; filter: blur(2px); }
          100% { transform: translateY(500px) scale(0.1); opacity: 0; filter: blur(8px); }
        }
        @keyframes venting {
          0%, 100% { opacity: 0.05; transform: translateX(0) translateY(0) scale(1); }
          50% { opacity: 0.2; transform: translateX(-10px) translateY(-5px) scale(1.1); }
        }
        @keyframes blink-fast { 0%, 100% { opacity: 1; } 50% { opacity: 0.2; } }
        @keyframes blink-slow { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes sweep {
          0% { transform: translateX(-100%); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateX(200%); opacity: 0; }
        }
        @keyframes enginePulse {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        @keyframes starlightSweep {
          0% { transform: translateX(-200%) rotate(45deg); opacity: 0; }
          20%, 30% { opacity: 0.6; }
          40% { transform: translateX(200%) rotate(45deg); opacity: 0; }
          100% { transform: translateX(200%) rotate(45deg); opacity: 0; }
        }
        .preserve-3d { transform-style: preserve-3d; }
        .ease-out-expo { transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1); }
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
