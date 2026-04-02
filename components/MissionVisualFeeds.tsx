
import React, { useState, useMemo, useCallback } from 'react';
import { PrimaryFeed, SecondaryFeeds } from './LiveFeeds';

interface Props {
  videoIds: string[];
  onPromote: (idx: number) => void;
}

type ViewMode = 'COMMAND' | 'QUAD' | 'SOLO';

const MissionVisualFeeds: React.FC<Props> = ({ videoIds, onPromote }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('COMMAND');
  const [soloIdx, setSoloIdx] = useState(0);

  const viewModes: { id: ViewMode; label: string }[] = [
    { id: 'COMMAND', label: 'Command' },
    { id: 'QUAD', label: 'Quad' },
    { id: 'SOLO', label: 'Solo' },
  ];

  const handlePromote1 = useCallback(() => onPromote(0), [onPromote]);
  const handlePromote2 = useCallback(() => onPromote(1), [onPromote]);
  const handlePromote3 = useCallback(() => onPromote(2), [onPromote]);

  return (
    <div className="glass rounded-2xl border border-white/10 flex flex-col h-full bg-slate-900/40 overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900/80 border-b border-white/10 z-30 shrink-0">
        <div className="flex flex-col">
          <h3 className="text-[10px] uppercase tracking-[0.25em] font-black text-slate-300">Mission Visual Feeds</h3>
          <div className="flex items-center space-x-2">
            <span className="text-[8px] text-blue-400 mono font-bold uppercase tracking-widest">Multi-Stream Uplink</span>
            <span className="text-[8px] text-slate-600 mono">|</span>
            <span className="text-[8px] text-emerald-400 mono font-bold animate-pulse uppercase tracking-widest">Signal: Optimal</span>
          </div>
        </div>

        {/* View Selector */}
        <div className="flex space-x-1 p-1 bg-slate-950/60 border border-white/5 rounded-lg">
          {viewModes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id)}
              className={`px-2 py-1 text-[8px] mono font-bold uppercase tracking-widest rounded transition-all ${
                viewMode === mode.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 min-h-0 p-4 overflow-hidden relative">
        {viewMode === 'COMMAND' && (
          <div className="flex flex-col h-full space-y-4">
            <div className="flex-1 flex space-x-4 min-h-0">
              <div className="flex-[2] min-h-0">
                <PrimaryFeed videoId={videoIds[0]} />
              </div>
              <div className="flex-1 flex flex-col space-y-4 min-h-0 hidden lg:flex">
                <div className="flex-1 min-h-0">
                  <SecondaryFeeds videoIds={[videoIds[1]]} onPromote={handlePromote1} fillContainer={true} />
                </div>
                <div className="flex-1 min-h-0">
                  <SecondaryFeeds videoIds={[videoIds[2]]} onPromote={handlePromote2} fillContainer={true} />
                </div>
              </div>
            </div>
            <div className="shrink-0 h-32">
              <SecondaryFeeds videoIds={[videoIds[3]]} onPromote={handlePromote3} fillContainer={true} />
            </div>
          </div>
        )}

        {viewMode === 'QUAD' && (
          <div className="grid grid-cols-2 grid-rows-2 gap-4 h-full">
            {videoIds.slice(0, 4).map((id, idx) => (
              <div key={`quad-${id}-${idx}`} className="h-full w-full">
                <SecondaryFeeds videoIds={[id]} onPromote={idx === 0 ? undefined : () => onPromote(idx - 1)} fillContainer={true} />
              </div>
            ))}
          </div>
        )}

        {viewMode === 'SOLO' && (
          <div className="flex flex-col h-full space-y-4">
            <div className="flex-1 min-h-0">
              <PrimaryFeed videoId={videoIds[soloIdx]} />
            </div>
            <div className="flex space-x-2 overflow-x-auto pb-2 shrink-0 h-20">
              {videoIds.map((id, idx) => (
                <button
                  key={`solo-sel-${id}-${idx}`}
                  onClick={() => setSoloIdx(idx)}
                  className={`shrink-0 w-32 h-full rounded-lg overflow-hidden border-2 transition-all ${
                    soloIdx === idx ? 'border-blue-500 scale-95' : 'border-white/10 opacity-50 hover:opacity-100'
                  }`}
                >
                  <img 
                    src={`https://img.youtube.com/vi/${id}/mqdefault.jpg`} 
                    alt={`Feed ${idx + 1}`}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="bg-slate-900/80 border-t border-white/10 px-4 py-2 flex justify-between items-center text-[8px] font-bold uppercase tracking-[0.2em] text-slate-500 shrink-0">
        <div className="flex items-center space-x-4">
          <span>Active Streams: {videoIds.length}</span>
          <span>Bandwidth: 48.2 Mbps</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]"></div>
          <span>Encryption: AES-256</span>
        </div>
      </div>
    </div>
  );
};

export default React.memo(MissionVisualFeeds);
