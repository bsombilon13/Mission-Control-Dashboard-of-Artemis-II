
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TelemetryData } from '../types';

interface Props {
  data: TelemetryData[];
}

const TelemetryGraphs: React.FC<Props> = ({ data }) => {
  const current = data[data.length - 1] || { altitude: 0, velocity: 0, fuel: 0, heartRate: 0 };

  return (
    <div className="flex flex-col h-full space-y-4 p-4 overflow-y-auto custom-scrollbar">
      {/* Velocity Display */}
      <div className="glass rounded-xl p-4 border border-slate-800 bg-slate-900/40">
        <div className="flex justify-between items-end mb-4">
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Velocity Profile</p>
            <h3 className="text-2xl font-bold mono text-blue-400 tabular-nums">
              {current.velocity.toFixed(1)} <span className="text-xs text-slate-500">km/h</span>
            </h3>
          </div>
          <div className="text-right">
             <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Altitude</p>
             <h3 className="text-xl font-bold mono text-emerald-400 tabular-nums">
               {current.altitude.toFixed(1)} <span className="text-xs text-slate-500">km</span>
             </h3>
          </div>
        </div>
        
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorVel" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.3} />
              <XAxis dataKey="timestamp" hide />
              <YAxis hide domain={['auto', 'auto']} />
              <Tooltip 
                contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                itemStyle={{ color: '#3b82f6', fontFamily: 'JetBrains Mono' }}
                labelStyle={{ display: 'none' }}
              />
              <Area 
                type="monotone" 
                dataKey="velocity" 
                stroke="#3b82f6" 
                fillOpacity={1} 
                fill="url(#colorVel)" 
                strokeWidth={2} 
                isAnimationActive={true}
                animationDuration={800}
                animationEasing="ease-in-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Heart Rate / Biometrics */}
      <div className="glass rounded-xl p-4 border border-slate-800 bg-slate-900/40">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Crew Bio: CDR Wiseman</p>
          </div>
          <span className="text-[8px] mono text-slate-600 uppercase">Status: Nominal</span>
        </div>
        <div className="flex justify-between items-center">
          <div className="text-3xl font-bold mono text-red-500 tabular-nums">
            {current.heartRate.toFixed(0)} <span className="text-xs text-slate-500">BPM</span>
          </div>
          <div className="h-12 w-48">
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorHeart" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area 
                    type="monotone" 
                    dataKey="heartRate" 
                    stroke="#ef4444" 
                    fill="url(#colorHeart)" 
                    strokeWidth={1.5} 
                    isAnimationActive={true}
                    animationDuration={1000}
                    animationEasing="ease-in-out"
                  />
                </AreaChart>
             </ResponsiveContainer>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
           <div className="bg-black/20 p-1.5 rounded border border-white/5">
              <span className="text-[7px] text-slate-600 block uppercase font-bold">O2 SAT</span>
              <span className="text-[10px] mono text-slate-300 font-bold">98%</span>
           </div>
           <div className="bg-black/20 p-1.5 rounded border border-white/5">
              <span className="text-[7px] text-slate-600 block uppercase font-bold">CO2 RESP</span>
              <span className="text-[10px] mono text-slate-300 font-bold">14.2</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default TelemetryGraphs;
