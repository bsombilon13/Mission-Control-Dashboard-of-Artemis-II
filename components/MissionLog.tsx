
import React from 'react';
import { MissionUpdate } from '../types';

interface Props {
  updates: MissionUpdate[];
}

const MissionLog: React.FC<Props> = ({ updates }) => {
  return (
    <div className="glass rounded-xl h-full border border-slate-800 flex flex-col overflow-hidden bg-slate-900/40">
      <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-500"></div>
          <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500">Mission Event Log</h3>
        </div>
        <div className="flex space-x-1">
          <div className="w-1 h-1 rounded-full bg-slate-700"></div>
          <div className="w-1 h-1 rounded-full bg-slate-700"></div>
          <div className="w-1 h-1 rounded-full bg-slate-700"></div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-[10px] custom-scrollbar">
        {updates.length === 0 && (
          <div className="text-slate-700 italic">Awaiting initial telemetry sequence...</div>
        )}
        {updates.map((update, idx) => (
          <div key={idx} className="flex space-x-3 group animate-in slide-in-from-left-2 duration-300">
            <span className="text-slate-600 shrink-0 tabular-nums">[{update.time}]</span>
            <span className={`shrink-0 font-bold uppercase tracking-tighter ${
              update.source === 'SYSTEM' ? 'text-blue-500' : 
              update.source === 'GENI-AI' ? 'text-emerald-500' : 'text-slate-400'
            }`}>
              {update.source}:
            </span>
            <span className="text-slate-300 leading-relaxed">
              {update.message}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MissionLog;
