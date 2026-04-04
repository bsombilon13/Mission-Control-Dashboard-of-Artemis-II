
import React, { useMemo } from 'react';
import { DsnStatus, DsnSignal } from '../types';
import { Radio, Signal, MapPin, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import TacticalCard from './TacticalCard';
import { VariableSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

interface Props {
  status: DsnStatus | null;
  isLoading: boolean;
}

interface FlattenedItem {
  type: 'station' | 'header' | 'signal';
  stationName?: string;
  stationLocation?: string;
  signal?: DsnSignal;
}

const SignalItem = React.memo(({ signal }: { signal: DsnSignal }) => (
  <div className="grid grid-cols-12 gap-2 bg-black/40 rounded-lg p-1.5 items-center group/sig hover:bg-blue-500/10 transition-all duration-300 border border-white/5 hover:border-blue-500/20 mx-2">
    <div className="col-span-5 flex flex-col min-w-0">
      <span className="text-[10px] font-black text-blue-400 uppercase tracking-wider truncate" title={signal.spacecraft}>
        {signal.spacecraft}
      </span>
    </div>
    <div className="col-span-3">
      <span className="text-[8px] text-slate-300 mono uppercase font-bold">{signal.antenna}</span>
    </div>
    <div className="col-span-2 text-center">
      <span className="text-[8px] text-slate-400 mono uppercase font-bold">{signal.type}</span>
    </div>
    <div className="col-span-2 flex justify-end">
      <div className={`flex items-center space-x-1 px-1.5 py-0.5 rounded border ${
        signal.direction === 'up' 
          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' 
          : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
      }`}>
        {signal.direction === 'up' ? (
          <ArrowUpRight className="w-2 h-2" />
        ) : (
          <ArrowDownRight className="w-2 h-2" />
        )}
        <span className="text-[7px] font-black uppercase tracking-widest">
          {signal.direction}
        </span>
      </div>
    </div>
  </div>
));

const StationHeader = React.memo(({ name, location }: { name: string; location: string }) => (
  <div className="space-y-2 bg-white/5 p-2 rounded-t-xl border-x border-t border-white/5 mx-2 mt-2">
    <div className="flex items-center justify-between border-b border-white/5 pb-2">
      <div className="flex items-center space-x-2">
        <div className="p-1 bg-slate-800 rounded">
          <MapPin className="w-2.5 h-2.5 text-blue-400" />
        </div>
        <span className="text-[11px] font-black text-white uppercase tracking-widest">{name}</span>
      </div>
      <div className="px-2 py-0.5 bg-black/40 rounded border border-white/5">
        <span className="text-[7px] text-slate-500 mono uppercase font-bold tracking-widest">{location}</span>
      </div>
    </div>
  </div>
));

const SignalHeader = React.memo(() => (
  <div className="grid grid-cols-12 gap-2 text-[7px] font-black text-slate-600 uppercase tracking-widest px-4 mb-1 bg-white/5 border-x border-white/5 mx-2 py-1">
    <div className="col-span-5">Spacecraft</div>
    <div className="col-span-3">Antenna</div>
    <div className="col-span-2 text-center">Type</div>
    <div className="col-span-2 text-right">Link</div>
  </div>
));

const DsnMonitor: React.FC<Props> = ({ status, isLoading }) => {
  const stations = useMemo(() => (status?.stations || []).map(station => ({
    ...station,
    signals: station.signals.filter(sig => 
      sig.spacecraft.toLowerCase().includes('artemis')
    )
  })).filter(station => station.signals.length > 0), [status]);

  const flattenedItems = useMemo(() => {
    const items: FlattenedItem[] = [];
    stations.forEach(station => {
      items.push({ type: 'station', stationName: station.name, stationLocation: station.location });
      if (station.signals.length > 0) {
        items.push({ type: 'header' });
        station.signals.forEach(signal => {
          items.push({ type: 'signal', signal });
        });
      }
    });
    return items;
  }, [stations]);

  const getItemSize = (index: number) => {
    const item = flattenedItems[index];
    if (item.type === 'station') return 50;
    if (item.type === 'header') return 20;
    return 42; // signal item height + padding
  };

  if (isLoading && !status) {
    return (
      <TacticalCard
        title="Deep Space Network"
        subtitle="Artemis II Link Status"
        icon={<Radio className="w-3.5 h-3.5 animate-pulse" />}
      >
        <div className="flex flex-col h-full items-center justify-center space-y-4 p-6">
          <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
          <span className="text-[10px] text-blue-400 mono font-bold uppercase tracking-[0.3em] animate-pulse">Establishing DSN Link</span>
        </div>
      </TacticalCard>
    );
  }

  return (
    <TacticalCard
      title="Deep Space Network"
      subtitle="Artemis II Link Status"
      icon={<Radio className="w-3.5 h-3.5 animate-pulse" />}
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1.5">
              <div className="w-1 h-1 rounded-full bg-blue-500"></div>
              <span>STATIONS: {stations.length}</span>
            </div>
            <span className="mono text-slate-600">SYNC: {new Date(status?.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
          </div>
          <div className="flex items-center space-x-2 px-2 py-0.5 bg-blue-500/10 rounded border border-blue-500/20">
            <div className="w-1 h-1 rounded-full bg-blue-500 animate-pulse"></div>
            <span className="text-blue-400">DSN-NOW</span>
          </div>
        </div>
      }
    >
      <div className="h-full bg-black/40 relative">
        {flattenedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-600 space-y-3 py-10">
            <div className="p-4 bg-slate-900/50 rounded-full border border-white/5">
              <Signal className="w-8 h-8 opacity-20" />
            </div>
            <span className="text-[10px] mono uppercase tracking-[0.3em] font-black text-center px-4">No active Artemis II signals detected on DSN</span>
          </div>
        ) : (
          <div className="h-full w-full">
            <AutoSizer>
              {({ height, width }: { height: number; width: number }) => (
                <VariableSizeList
                  height={height}
                  itemCount={flattenedItems.length}
                  itemSize={getItemSize}
                  width={width}
                  className="custom-scrollbar"
                >
                  {({ index, style }: { index: number; style: React.CSSProperties }) => {
                    const item = flattenedItems[index];
                    return (
                      <div style={style}>
                        {item.type === 'station' && <StationHeader name={item.stationName!} location={item.stationLocation!} />}
                        {item.type === 'header' && <SignalHeader />}
                        {item.type === 'signal' && <SignalItem signal={item.signal!} />}
                      </div>
                    );
                  }}
                </VariableSizeList>
              )}
            </AutoSizer>
          </div>
        )}
      </div>
    </TacticalCard>
  );
};

export default React.memo(DsnMonitor);
