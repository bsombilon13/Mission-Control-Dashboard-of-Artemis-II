
import React from 'react';
import TacticalCard from './TacticalCard';
import { Compass, RotateCcw, RotateCw, Move } from 'lucide-react';
import { TelemetryData } from '../types';
import { ResponsiveContainer, LineChart, Line, YAxis, CartesianGrid } from 'recharts';

interface Props {
  telemetryHistory: TelemetryData[];
}

const OrionAttitudeCard: React.FC<Props> = ({ telemetryHistory }) => {
  const telemetry = telemetryHistory.length > 0 ? telemetryHistory[telemetryHistory.length - 1] : null;

  const formatNumber = (num?: number) => {
    if (num === undefined) return '---';
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(num);
  };

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
                {formatNumber(telemetry?.pitch)}
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
                {formatNumber(telemetry?.yaw)}
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
                {formatNumber(telemetry?.roll)}
              </span>
              <span className="text-[8px] mono text-slate-600">DEG</span>
            </div>
          </div>
        </div>

        {/* Visual Indicators & Graph */}
        <div className="flex-1 grid grid-cols-2 gap-4 min-h-[120px]">
          {/* Attitude Indicator */}
          <div className="relative flex items-center justify-center bg-black/20 rounded-xl border border-white/5 overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              <div className="w-24 h-24 border border-slate-500 rounded-full" />
              <div className="w-16 h-16 border border-slate-500 rounded-full absolute" />
              <div className="w-px h-24 bg-slate-500 absolute" />
              <div className="w-24 h-px bg-slate-500 absolute" />
            </div>
            
            <div className="relative w-20 h-20 flex items-center justify-center">
              {/* Horizon Line (Pitch/Roll) */}
              <div 
                className="w-16 h-[2px] bg-blue-500/80 rounded-full absolute transition-all duration-500"
                style={{ 
                  transform: `rotate(${telemetry?.roll || 0}deg) translateY(${(telemetry?.pitch || 0) * 0.5}px)`,
                  boxShadow: '0 0 10px rgba(59,130,246,0.5)'
                }}
              />
              {/* Vertical Line (Yaw) */}
              <div 
                className="w-[2px] h-16 bg-emerald-500/80 rounded-full absolute transition-all duration-500"
                style={{ 
                  transform: `rotate(${telemetry?.yaw || 0}deg)`,
                  boxShadow: '0 0 10px rgba(16,185,129,0.5)'
                }}
              />
              <div className="w-2 h-2 bg-white rounded-full shadow-[0_0_10px_white] z-10" />
            </div>
            <span className="absolute bottom-2 left-2 text-[6px] text-slate-500 uppercase font-bold">Visual Vector</span>
          </div>

          {/* Real-time Graph */}
          <div className="bg-black/20 rounded-xl border border-white/5 p-2 flex flex-col">
            <span className="text-[6px] text-slate-500 uppercase font-bold mb-1">Stability History</span>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={telemetryHistory.slice(-20)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <YAxis hide domain={['auto', 'auto']} />
                  <Line type="monotone" dataKey="pitch" stroke="#60a5fa" strokeWidth={1} dot={false} isAnimationActive={false} />
                  <Line type="monotone" dataKey="yaw" stroke="#34d399" strokeWidth={1} dot={false} isAnimationActive={false} />
                  <Line type="monotone" dataKey="roll" stroke="#fbbf24" strokeWidth={1} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
          <div className="flex flex-col">
            <span className="text-[7px] text-slate-500 uppercase font-bold">Stabilization</span>
            <span className="text-[9px] mono text-emerald-400">ACTIVE</span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-[7px] text-slate-500 uppercase font-bold">Thruster Status</span>
            <span className="text-[9px] mono text-slate-400">STANDBY</span>
          </div>
        </div>
      </div>
    </TacticalCard>
  );
};

export default React.memo(OrionAttitudeCard);
