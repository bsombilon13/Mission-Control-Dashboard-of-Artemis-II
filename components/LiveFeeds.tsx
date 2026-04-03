
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';

interface SharedProps {
  videoIds: string[];
  onPromote?: (idx: number) => void;
  fillContainer?: boolean;
}

const getEmbedUrl = (id: string) => {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const params = new URLSearchParams({
    autoplay: '1',
    mute: '1',
    rel: '0',
    enablejsapi: '1',
    origin: origin,
    widget_referrer: origin,
    iv_load_policy: '3',
    modestbranding: '1',
    cc_load_policy: '0',
    controls: '0',
    disablekb: '1',
    fs: '0'
  });
  return `https://www.youtube.com/embed/${id}?${params.toString()}`;
};

const sendCommand = (iframe: HTMLIFrameElement | null, func: string, args: any[] = []) => {
  if (iframe && iframe.contentWindow) {
    try {
      iframe.contentWindow.postMessage(JSON.stringify({
        event: 'command',
        func: func,
        args: args
      }), '*');
    } catch (e) {
      console.warn("YouTube Command Hub Error:", e);
    }
  }
};

interface ControlProps {
  isMuted: boolean;
  isPlaying: boolean;
  volume: number;
  onToggleMute: () => void;
  onTogglePlay: () => void;
  onVolumeChange: (val: number) => void;
  onToggleFullscreen: () => void;
  onRefresh: () => void;
  onPromote?: () => void;
  size?: 'sm' | 'md' | 'xs';
}

const ControlBar: React.FC<ControlProps> = ({ 
  isMuted, 
  isPlaying, 
  volume, 
  onToggleMute, 
  onTogglePlay, 
  onVolumeChange, 
  onToggleFullscreen,
  onRefresh,
  onPromote,
  size = 'md' 
}) => {
  const isXS = size === 'xs';
  const buttonClass = `bg-black/90 border border-white/20 hover:border-blue-500 rounded text-slate-100 uppercase font-black transition-all active:scale-90 flex items-center justify-center hover:bg-blue-600/20 ${
    isXS ? 'px-1.5 py-1 text-[7px]' : 'px-3 py-1.5 text-[11px]'
  }`;

  return (
    <div className={`absolute bottom-3 right-3 flex items-center space-x-2 z-30 transition-all opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 bg-slate-900/95 backdrop-blur-xl p-2 rounded-xl border border-white/10 shadow-2xl`}>
      {onPromote && (
        <button onClick={onPromote} className={`${buttonClass} bg-blue-600/40 border-blue-400/60 text-white hover:bg-blue-500`}>
           {isXS ? 'PRM' : 'Promote'}
        </button>
      )}

      <button onClick={onRefresh} className={buttonClass} title="Reconnect Feed">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>

      <button onClick={onTogglePlay} className={buttonClass}>
        {isPlaying ? 'Pause' : 'Play'}
      </button>
      
      <button onClick={onToggleMute} className={buttonClass}>
        {isMuted ? 'Unmute' : 'Mute'}
      </button>

      <button onClick={onToggleFullscreen} className={buttonClass}>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
        </svg>
      </button>
    </div>
  );
};

export const PrimaryFeed = React.memo(({ videoId }: { videoId: string }) => {
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(50);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const embedUrl = useMemo(() => getEmbedUrl(videoId), [videoId, refreshKey]);

  const toggleMute = useCallback(() => {
    sendCommand(iframeRef.current, isMuted ? 'unMute' : 'mute');
    setIsMuted(!isMuted);
  }, [isMuted]);

  const togglePlay = useCallback(() => {
    sendCommand(iframeRef.current, isPlaying ? 'pauseVideo' : 'playVideo');
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleVolumeChange = useCallback((newVol: number) => {
    setVolume(newVol);
    if (isMuted && newVol > 0) {
      sendCommand(iframeRef.current, 'unMute');
      setIsMuted(false);
    }
    sendCommand(iframeRef.current, 'setVolume', [newVol]);
  }, [isMuted]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  const handleRefresh = useCallback(() => {
    setIsLoading(true);
    setRefreshKey(k => k + 1);
  }, []);

  useEffect(() => {
    // Faster fallback to hide loading state
    const timer = setTimeout(() => setIsLoading(false), 4000);
    return () => clearTimeout(timer);
  }, [videoId, refreshKey]);

  return (
    <div ref={containerRef} className="h-full w-full glass rounded-2xl overflow-hidden border border-white/10 relative group bg-black shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
      {isLoading && (
        <div className="absolute inset-0 z-30 bg-slate-950/90 flex flex-col items-center justify-center space-y-6">
           <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin shadow-[0_0_30px_rgba(59,130,246,0.2)]"></div>
           <div className="flex flex-col items-center">
             <span className="text-sm text-blue-400 font-black animate-pulse uppercase tracking-[0.4em]">Establishing Uplink</span>
           </div>
        </div>
      )}

      <ControlBar 
        isMuted={isMuted} 
        isPlaying={isPlaying} 
        volume={volume}
        onToggleMute={toggleMute} 
        onTogglePlay={togglePlay} 
        onVolumeChange={handleVolumeChange}
        onToggleFullscreen={toggleFullscreen}
        onRefresh={handleRefresh}
        size="md"
      />

        <iframe
          ref={iframeRef}
          key={`primary-feed-${videoId}-${refreshKey}`}
          onLoad={() => setIsLoading(false)}
          className={`w-full h-full border-0 bg-black transition-all duration-1000 ${isLoading ? 'opacity-0 scale-105' : 'opacity-100 scale-100'}`}
          src={embedUrl}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          referrerPolicy="strict-origin-when-cross-origin"
        ></iframe>
    </div>
  );
});

export const SecondaryFeeds = React.memo(({ videoIds, onPromote, fillContainer }: SharedProps) => {
  const [muteStates, setMuteStates] = useState<boolean[]>(videoIds.map(() => true));
  const [playStates, setPlayStates] = useState<boolean[]>(videoIds.map(() => true));
  const [loadingStates, setLoadingStates] = useState<boolean[]>(videoIds.map(() => true));
  const [refreshKeys, setRefreshKeys] = useState<number[]>(videoIds.map(() => 0));
  
  const iframeRefs = useRef<(HTMLIFrameElement | null)[]>([]);
  const containerRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    setMuteStates(videoIds.map(() => true));
    setPlayStates(videoIds.map(() => true));
    setLoadingStates(videoIds.map(() => true));
    setRefreshKeys(videoIds.map(() => 0));

    // Fallback for each feed
    const timers = videoIds.map((_, idx) => setTimeout(() => handleLoad(idx), 4000));
    return () => timers.forEach(t => clearTimeout(t));
  }, [videoIds.length]);

  const toggleMute = (idx: number) => {
    sendCommand(iframeRefs.current[idx], muteStates[idx] ? 'unMute' : 'mute');
    setMuteStates(prev => {
        const next = [...prev];
        next[idx] = !prev[idx];
        return next;
    });
  };

  const togglePlay = (idx: number) => {
    sendCommand(iframeRefs.current[idx], playStates[idx] ? 'pauseVideo' : 'playVideo');
    setPlayStates(prev => {
        const next = [...prev];
        next[idx] = !prev[idx];
        return next;
    });
  };

  const toggleFullscreen = (idx: number) => {
    if (!document.fullscreenElement) {
      containerRefs.current[idx]?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handleRefresh = (idx: number) => {
    setLoadingStates(prev => { const next = [...prev]; next[idx] = true; return next; });
    setRefreshKeys(prev => { const next = [...prev]; next[idx] += 1; return next; });
  };

  const handleLoad = (idx: number) => {
    setLoadingStates(prev => { const next = [...prev]; next[idx] = false; return next; });
  };

  return (
    <div className={`grid gap-4 ${fillContainer ? 'h-full' : ''} ${
      videoIds.length === 3 ? 'grid-cols-3' : 
      videoIds.length === 1 ? 'grid-cols-1' : 
      'grid-cols-2'
    }`}>
      {videoIds.map((id, idx) => (
        <div 
          key={`secondary-feed-${idx}-${id}`} 
          ref={el => { containerRefs.current[idx] = el; }} 
          className={`${fillContainer ? 'h-full w-full' : 'aspect-video'} glass rounded-xl overflow-hidden border border-white/10 relative bg-black group shadow-xl hover:ring-2 hover:ring-blue-500/50 transition-all duration-300`}
        >
           {loadingStates[idx] && (
             <div className="absolute inset-0 z-30 bg-slate-950/90 flex items-center justify-center">
                <div className="w-8 h-8 border-3 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
             </div>
           )}

           <ControlBar 
              isMuted={muteStates[idx]} 
              isPlaying={playStates[idx]} 
              volume={50}
              onToggleMute={() => toggleMute(idx)} 
              onTogglePlay={() => togglePlay(idx)}
              onVolumeChange={() => {}} 
              onToggleFullscreen={() => toggleFullscreen(idx)}
              onRefresh={() => handleRefresh(idx)}
              onPromote={onPromote ? () => onPromote(idx) : undefined}
              size="xs" 
           />

           <iframe
              ref={el => { iframeRefs.current[idx] = el; }}
              key={`iframe-secondary-${idx}-${id}-${refreshKeys[idx]}`}
              onLoad={() => handleLoad(idx)}
              className={`w-full h-full border-0 bg-black transition-all duration-700 ${loadingStates[idx] ? 'opacity-0 scale-105' : 'opacity-100 scale-100'}`}
              src={getEmbedUrl(id)}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              referrerPolicy="strict-origin-when-cross-origin"
            ></iframe>
        </div>
      ))}
    </div>
  );
});
