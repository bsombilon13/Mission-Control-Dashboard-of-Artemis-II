
import React from 'react';
import TacticalCard from './TacticalCard';
import { Compass, RotateCcw, RotateCw, Move, Activity } from 'lucide-react';
import { TelemetryData } from '../types';
import { ResponsiveContainer, LineChart, Line, YAxis, CartesianGrid } from 'recharts';
import { motion } from 'motion/react';

interface Props {
  telemetryHistory: TelemetryData[];
}

const OrionAttitudeCard: React.FC<Props> = ({ telemetryHistory }) => {
  const telemetry = telemetryHistory.length > 0 ? telemetryHistory[telemetryHistory.length - 1] : null;

  const formatNumber = (num?: number) => {
    if (num === undefined) return '---';
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(num);
  };

  const pitch = telemetry?.pitch || 0;
  const yaw = telemetry?.yaw || 0;
  const roll = telemetry?.roll || 0;

  return (
    <TacticalCard
      title="Attitude Control System"
      subtitle="Orientation & Stabilization // ACS"
      icon={<Compass className="w-3.5 h-3.5" />}
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] animate-pulse"></div>
            <span className="text-blue-400">ACS: Nominal</span>
          </div>
          <span className="mono text-slate-600">ID: ORN_ACS_01</span>
        </div>
      }
    >
      <div className="p-4 h-full flex flex-col justify-between space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-1 p-2 bg-white/5 rounded-lg border border-white/5">
            <div className="flex items-center space-x-1 text-slate-500">
              <Move className="w-2.5 h-2.5" />
              <span className="text-[8px] uppercase font-bold tracking-widest">Pitch</span>
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-lg font-black mono text-blue-400">
                {formatNumber(pitch)}
              </span>
              <span className="text-[8px] mono text-slate-600">DEG</span>
            </div>
          </div>

          <div className="space-y-1 p-2 bg-white/5 rounded-lg border border-white/5">
            <div className="flex items-center space-x-1 text-slate-500">
              <RotateCw className="w-2.5 h-2.5" />
              <span className="text-[8px] uppercase font-bold tracking-widest">Yaw</span>
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-lg font-black mono text-emerald-400">
                {formatNumber(yaw)}
              </span>
              <span className="text-[8px] mono text-slate-600">DEG</span>
            </div>
          </div>

          <div className="space-y-1 p-2 bg-white/5 rounded-lg border border-white/5">
            <div className="flex items-center space-x-1 text-slate-500">
              <RotateCcw className="w-2.5 h-2.5" />
              <span className="text-[8px] uppercase font-bold tracking-widest">Roll</span>
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-lg font-black mono text-amber-400">
                {formatNumber(roll)}
              </span>
              <span className="text-[8px] mono text-slate-600">DEG</span>
            </div>
          </div>
        </div>

        {/* Visual Indicators & Graph */}
        <div className="flex-1 grid grid-cols-2 gap-4 min-h-[140px]">
          {/* Attitude Indicator (ADI) */}
          <div className="relative flex items-center justify-center bg-black/40 rounded-xl border border-white/10 overflow-hidden group">
            {/* Background Grid/Circles */}
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <div className="w-32 h-32 border border-slate-700 rounded-full" />
              <div className="w-24 h-24 border border-slate-700 rounded-full absolute" />
              <div className="w-16 h-16 border border-slate-700 rounded-full absolute" />
              <div className="w-px h-32 bg-slate-700 absolute" />
              <div className="w-32 h-px bg-slate-700 absolute" />
            </div>
            
            {/* Roll Scale (Top) */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-8 overflow-hidden">
               <motion.div 
                 className="flex space-x-4 items-end justify-center h-full"
                 animate={{ x: -roll * 0.5 }}
                 transition={{ type: "spring", stiffness: 100, damping: 20 }}
               >
                 {[-90, -60, -30, 0, 30, 60, 90].map(deg => (
                   <div key={deg} className="flex flex-col items-center shrink-0">
                     <span className="text-[6px] mono text-slate-500 mb-1">{deg}°</span>
                     <div className={`w-px ${deg === 0 ? 'h-3 bg-blue-400' : 'h-1.5 bg-slate-600'}`} />
                   </div>
                 ))}
               </motion.div>
            </div>

            {/* Main Instrument Area */}
            <div className="relative w-28 h-28 flex items-center justify-center rounded-full border border-white/5 shadow-[inset_0_0_30px_rgba(0,0,0,0.5)] overflow-hidden">
              
              {/* Pitch Ladder & Horizon */}
              <motion.div 
                className="absolute w-full h-full flex flex-col items-center justify-center"
                animate={{ 
                  rotate: -roll,
                  y: pitch * 1.5
                }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
              >
                {/* Horizon Line */}
                <div className="w-40 h-[1.5px] bg-blue-500/80 shadow-[0_0_10px_rgba(59,130,246,0.8)] z-10" />
                
                {/* Pitch Marks */}
                {[-30, -20, -10, 10, 20, 30].map(p => (
                  <div 
                    key={p} 
                    className="absolute flex items-center justify-center w-full"
                    style={{ transform: `translateY(${-p * 1.5}px)` }}
                  >
                    <div className="w-8 h-[1px] bg-slate-600" />
                    <span className="absolute left-10 text-[6px] mono text-slate-500">{p}</span>
                    <span className="absolute right-10 text-[6px] mono text-slate-500">{p}</span>
                  </div>
                ))}
              </motion.div>

              {/* Yaw Ring (Outer) */}
              <motion.div 
                className="absolute inset-0 border-2 border-emerald-500/10 rounded-full"
                animate={{ rotate: yaw }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
              >
                {[0, 90, 180, 270].map(deg => (
                  <div 
                    key={deg} 
                    className="absolute top-0 left-1/2 -translate-x-1/2 h-full flex flex-col justify-between py-1"
                    style={{ transform: `translateX(-50%) rotate(${deg}deg)` }}
                  >
                    <div className="w-1 h-1 bg-emerald-500/40 rounded-full" />
                  </div>
                ))}
              </motion.div>

              {/* Static Reference (Orion Crosshair) */}
              <div className="relative z-20 flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white rounded-full shadow-[0_0_10px_white]" />
                <div className="absolute w-8 h-px bg-white/50" />
                <div className="absolute h-8 w-px bg-white/50" />
              </div>
            </div>

            {/* Labels */}
            <div className="absolute bottom-2 left-2 flex flex-col">
              <span className="text-[6px] text-slate-500 uppercase font-black tracking-tighter">Visual Vector</span>
              <span className="text-[8px] mono text-blue-400 font-bold">ADI_ACTIVE</span>
            </div>
            
            {/* Scanline Effect */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_2px,3px_100%] z-30 opacity-30"></div>
          </div>

          {/* Real-time Graph */}
          <div className="bg-black/40 rounded-xl border border-white/10 p-3 flex flex-col shadow-inner">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[7px] text-slate-500 uppercase font-black tracking-widest">Stability History</span>
              <div className="flex space-x-2">
                <div className="w-1 h-1 rounded-full bg-blue-400" />
                <div className="w-1 h-1 rounded-full bg-emerald-400" />
                <div className="w-1 h-1 rounded-full bg-amber-400" />
              </div>
            </div>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={telemetryHistory.slice(-30)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <YAxis hide domain={['auto', 'auto']} />
                  <Line type="monotone" dataKey="pitch" stroke="#60a5fa" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                  <Line type="monotone" dataKey="yaw" stroke="#34d399" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                  <Line type="monotone" dataKey="roll" stroke="#fbbf24" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
          <div className="flex flex-col">
            <span className="text-[7px] text-slate-500 uppercase font-black tracking-widest">Stabilization</span>
            <div className="flex items-center space-x-1">
              <Activity size={8} className="text-emerald-400 animate-pulse" />
              <span className="text-[9px] mono text-emerald-400 font-bold">ACTIVE</span>
            </div>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-[7px] text-slate-500 uppercase font-black tracking-widest">Thruster Status</span>
            <span className="text-[9px] mono text-slate-400 font-bold">STANDBY</span>
          </div>
        </div>
      </div>
    </TacticalCard>
  );
};

export default React.memo(OrionAttitudeCard);
