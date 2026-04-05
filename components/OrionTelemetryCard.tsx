
import React from 'react';
import TacticalCard from './TacticalCard';
import { Activity, Gauge, Navigation, Zap, Target } from 'lucide-react';
import { TelemetryData } from '../types';

interface Props {
  telemetryHistory: TelemetryData[];
}

const OrionTelemetryCard: React.FC<Props> = ({ telemetryHistory }) => {
  const telemetry = telemetryHistory.length > 0 ? telemetryHistory[telemetryHistory.length - 1] : null;
  const status = telemetryHistory.length > 0 ? 'connected' : 'connecting';

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(num);
  };

  return (
    <TacticalCard
      title="Orion Real-Time Telemetry"
      subtitle="Live Spacecraft Uplink // Artemis II"
      icon={<Activity className="w-3.5 h-3.5" />}
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-2">
            <div className={`w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)] ${
              status === 'connected' ? 'bg-emerald-500 animate-pulse' : 
              status === 'connecting' ? 'bg-amber-500 animate-pulse' : 'bg-red-500'
            }`}></div>
            <span className={status === 'connected' ? 'text-emerald-400' : status === 'connecting' ? 'text-amber-400' : 'text-red-400'}>
              {status === 'connected' ? 'Uplink: Active' : status === 'connecting' ? 'Uplink: Synchronizing' : 'Uplink: Error'}
            </span>
          </div>
          <span className="mono text-slate-600">ID: ORN_TLM_02</span>
        </div>
      }
    >
      <div className="p-4 h-full flex flex-col justify-between space-y-4">
        {/* Main Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
              <Navigation className="w-3 h-3" />
              <span className="text-[10px] uppercase tracking-wider font-bold">Altitude</span>
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-black mono text-blue-500 dark:text-blue-400">
                {telemetry ? formatNumber(telemetry.altitude) : '---'}
              </span>
              <span className="text-[10px] mono text-slate-500">KM</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
              <Gauge className="w-3 h-3" />
              <span className="text-[10px] uppercase tracking-wider font-bold">Velocity</span>
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-black mono text-emerald-500 dark:text-emerald-400">
                {telemetry ? formatNumber(telemetry.velocity) : '---'}
              </span>
              <span className="text-[10px] mono text-slate-500">KM/H</span>
            </div>
          </div>
        </div>

        {/* Fuel Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
              <Zap className="w-3 h-3" />
              <span className="text-[10px] uppercase tracking-wider font-bold">Propellant Reserves</span>
            </div>
            <span className={`text-xs font-black mono ${
              telemetry && telemetry.fuel < 20 ? 'text-red-500 animate-pulse' : 'text-slate-300'
            }`}>
              {telemetry ? `${formatNumber(telemetry.fuel)}%` : '---%'}
            </span>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden border border-white/5">
            <div 
              className={`h-full transition-all duration-1000 ease-out rounded-full ${
                telemetry && telemetry.fuel < 20 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]'
              }`}
              style={{ width: `${telemetry ? telemetry.fuel : 0}%` }}
            ></div>
          </div>
        </div>

        {/* Distance Metrics */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
              <Navigation className="w-3 h-3 rotate-180" />
              <span className="text-[10px] uppercase tracking-wider font-bold">Dist from Earth</span>
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-xl font-black mono text-blue-400">
                {typeof telemetry?.distanceFromEarth === 'number' && !isNaN(telemetry.distanceFromEarth) 
                  ? formatNumber(telemetry.distanceFromEarth) 
                  : '---'}
              </span>
              <span className="text-[10px] mono text-slate-500">KM</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
              <Target className="w-3 h-3" />
              <span className="text-[10px] uppercase tracking-wider font-bold">Dist from Moon</span>
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-xl font-black mono text-amber-400">
                {typeof telemetry?.distanceFromMoon === 'number' && !isNaN(telemetry.distanceFromMoon) 
                  ? formatNumber(telemetry.distanceFromMoon) 
                  : '---'}
              </span>
              <span className="text-[10px] mono text-slate-500">KM</span>
            </div>
          </div>
        </div>

        {/* System Diagnostics */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5">
          <div className="flex flex-col">
            <span className="text-[8px] text-slate-500 uppercase font-bold">Comm Link</span>
            <span className="text-[10px] mono text-emerald-400">Nominal</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] text-slate-500 uppercase font-bold">Data Epoch</span>
            <span className="text-[10px] mono text-slate-400 truncate">
              {telemetry?.telemetryDate ? new Date(telemetry.telemetryDate).toLocaleTimeString() : '---'}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] text-slate-500 uppercase font-bold">Life Support</span>
            <span className="text-[10px] mono text-emerald-400">Active</span>
          </div>
        </div>
      </div>
    </TacticalCard>
  );
};

export default React.memo(OrionTelemetryCard);
