
import React, { useState } from 'react';
import ArtemisHUD from './ArtemisHUD';
import MissionTrajectoryMap from './MissionTrajectoryMap';
import { TelemetryData } from '../types';

interface Props {
  elapsedSeconds: number;
  telemetry: TelemetryData;
  telemetryHistory: TelemetryData[];
}

const MultiViewMonitor: React.FC<Props> = ({ elapsedSeconds, telemetry, telemetryHistory }) => {
  const [activeView, setActiveView] = useState<'hud' | 'trajectory'>('hud');

  return (
    <div className="glass rounded-xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col h-full bg-slate-900/40 relative">
      {/* Integrated Header/Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900/80 border-b border-slate-800 z-30">
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
            {activeView === 'hud' ? 'Vehicle System Monitor' : 'Flight Plan Trajectory'}
          </span>
          <div className="flex items-center space-x-2">
            <span className="text-[8px] text-blue-400 mono font-bold">
              {activeView === 'hud' ? 'MODE: TELEMETRY_HUD' : 'MODE: NAV_ORBITAL'}
            </span>
            <span className="text-[8px] text-slate-600 mono">|</span>
            <span className="text-[8px] text-emerald-400 mono font-bold animate-pulse">LIVE_SYNC</span>
          </div>
        </div>

        {/* View Switcher Buttons inside the card */}
        <div className="flex space-x-1 p-1 bg-slate-950/60 border border-slate-800 rounded-lg">
          <button 
            onClick={() => setActiveView('hud')}
            className={`px-2 py-1 text-[8px] mono font-bold uppercase tracking-widest rounded transition-all ${
              activeView === 'hud' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            HUD
          </button>
          <button 
            onClick={() => setActiveView('trajectory')}
            className={`px-2 py-1 text-[8px] mono font-bold uppercase tracking-widest rounded transition-all ${
              activeView === 'trajectory' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            NAV
          </button>
        </div>
      </div>

      {/* Display Area */}
      <div className="flex-1 min-h-0 relative flex items-center justify-center overflow-hidden">
        {activeView === 'hud' && (
          <ArtemisHUD elapsedSeconds={elapsedSeconds} telemetry={telemetry} hideContainer={true} />
        )}
        {activeView === 'trajectory' && (
          <MissionTrajectoryMap elapsedSeconds={elapsedSeconds} hideContainer={true} />
        )}
      </div>
    </div>
  );
};

export default MultiViewMonitor;
