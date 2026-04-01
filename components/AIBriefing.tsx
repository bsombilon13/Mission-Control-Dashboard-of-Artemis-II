
import React, { useState, useEffect } from 'react';
import { MissionPhase, TelemetryData } from '../types';
import { getMissionBriefing } from '../services/geminiService';

interface Props {
  phase: MissionPhase;
  telemetry: TelemetryData;
  onNewAnalysis: (text: string) => void;
}

const AIBriefing: React.FC<Props> = ({ phase, telemetry, onNewAnalysis }) => {
  const [briefing, setBriefing] = useState<string>("Analyzing mission data...");
  const [loading, setLoading] = useState(false);

  const fetchBriefing = async () => {
    if (!telemetry) return;
    setLoading(true);
    const result = await getMissionBriefing(phase, telemetry);
    setBriefing(result);
    onNewAnalysis(result);
    setLoading(false);
  };

  useEffect(() => {
    fetchBriefing();
    // Auto refresh every 60 seconds
    const interval = setInterval(fetchBriefing, 60000);
    return () => clearInterval(interval);
  }, [phase]);

  return (
    <div className="glass rounded-xl p-4 border border-blue-500/30 bg-blue-600/5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <p className="text-[10px] text-blue-400 uppercase tracking-widest font-bold">AI Flight Assistant Briefing</p>
        </div>
        <button 
          onClick={fetchBriefing}
          className="text-[10px] text-slate-500 hover:text-blue-400 transition-colors uppercase font-bold tracking-widest"
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Sync Now'}
        </button>
      </div>
      
      <div className="relative">
        <p className="text-sm leading-relaxed text-slate-300 italic">
          "{briefing}"
        </p>
      </div>

      <div className="mt-4 flex items-center space-x-2 text-[8px] text-slate-500 mono uppercase">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
        <span>Neural link active • Processing telemetry stream • 10.4ms latency</span>
      </div>
    </div>
  );
};

export default AIBriefing;
