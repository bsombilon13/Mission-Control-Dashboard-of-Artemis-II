
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MissionPhase, TelemetryData } from './types';
import MissionHeader from './components/MissionHeader';
import { PrimaryFeed, SecondaryFeeds } from './components/LiveFeeds';
import MissionTimeline, { MISSION_EVENTS } from './components/MissionTimeline';
import MultiViewMonitor from './components/MultiViewMonitor';
import SettingsPanel from './components/SettingsPanel';
import HorizontalTimeline from './components/HorizontalTimeline';
import NextMilestoneCard from './components/NextMilestoneCard';

const INITIAL_LAUNCH_DATE = new Date('2026-02-07T02:41:00Z');
const INITIAL_VIDEO_IDS = [
  'nrVnsO_rdew', // NASA TV
  'Jm8wRjD3xVA', // ISS Live
  '9vX2P4w6u-4', // Artemis Highlights
  '21X5lGlDOfg', // Starship
  '_6_87-m8S_8', // NASA Live 2
  'D-m09l6K9S8'  // NASA Live 3
];
const HISTORY_LIMIT = 40;
const STORAGE_KEY = 'artemis_mission_config_v3';

// Tactical Sound Engine
class MissionAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;

  init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.connect(this.ctx.destination);
    this.masterGain.gain.value = 0.25;
  }

  private playTone(freq: number, type: OscillatorType, duration: number, gainValue: number = 1.0) {
    if (!this.ctx || !this.masterGain) return;
    
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.5, this.ctx.currentTime + duration);
    
    g.gain.setValueAtTime(gainValue, this.ctx.currentTime);
    g.gain.linearRampToValueAtTime(0, this.ctx.currentTime + duration);
    
    osc.connect(g);
    g.connect(this.masterGain);
    
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playMilestone() {
    this.playTone(880, 'sine', 0.1, 0.3);
  }

  playPhase() {
    this.playTone(220, 'square', 0.6, 0.2);
    setTimeout(() => this.playTone(440, 'sine', 0.3, 0.2), 50);
  }

  playCriticalWarning() {
    this.playTone(660, 'sine', 0.05, 0.1);
    setTimeout(() => this.playTone(550, 'sine', 0.05, 0.1), 100);
  }
}

const audioEngine = new MissionAudioEngine();

const App: React.FC = () => {
  const [phase, setPhase] = useState<MissionPhase>(MissionPhase.PRE_LAUNCH);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  
  const [isPhaseTransitioning, setIsPhaseTransitioning] = useState(false);
  const [displayPhase, setDisplayPhase] = useState<MissionPhase>(MissionPhase.PRE_LAUNCH);

  const [launchDate, setLaunchDate] = useState<Date>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const config = JSON.parse(saved);
        if (config.launchDate) return new Date(config.launchDate);
      } catch (e) {
        console.error("Hydration Error: Launch Date", e);
      }
    }
    return INITIAL_LAUNCH_DATE;
  });

  const [videoIds, setVideoIds] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    let currentIds = [...INITIAL_VIDEO_IDS];
    if (saved) {
      try {
        const config = JSON.parse(saved);
        if (Array.isArray(config.videoIds) && config.videoIds.length > 0) {
          // Merge saved IDs with defaults to ensure we have exactly 6
          const merged = [...config.videoIds];
          while (merged.length < INITIAL_VIDEO_IDS.length) {
            merged.push(INITIAL_VIDEO_IDS[merged.length]);
          }
          currentIds = merged.slice(0, INITIAL_VIDEO_IDS.length);
        }
      } catch (e) {
        console.error("Hydration Error: Video IDs", e);
      }
    }
    return currentIds;
  });
  
  const [currentMs, setCurrentMs] = useState<number>(Date.now());
  const [telemetryHistory, setTelemetryHistory] = useState<TelemetryData[]>([]);
  
  const elapsedSeconds = useMemo(() => {
    return (currentMs - launchDate.getTime()) / 1000;
  }, [currentMs, launchDate]);

  const activeMilestoneIndex = useMemo(() => {
    let idx = -1;
    for (let i = 0; i < MISSION_EVENTS.length; i++) {
      if (elapsedSeconds >= MISSION_EVENTS[i].offsetSeconds) {
        idx = i;
      } else {
        break;
      }
    }
    return idx;
  }, [elapsedSeconds]);

  // Audio Side Effects
  const prevActiveIndex = useRef(activeMilestoneIndex);
  useEffect(() => {
    if (isAudioEnabled && activeMilestoneIndex > prevActiveIndex.current) {
      audioEngine.playMilestone();
    }
    prevActiveIndex.current = activeMilestoneIndex;
  }, [activeMilestoneIndex, isAudioEnabled]);

  useEffect(() => {
    if (isAudioEnabled) {
      audioEngine.playPhase();
    }
  }, [phase, isAudioEnabled]);

  // Critical Warning Heartbeat
  useEffect(() => {
    if (!isAudioEnabled || phase !== MissionPhase.PRE_LAUNCH) return;
    
    const remaining = launchDate.getTime() - currentMs;
    if (remaining > 0 && remaining < 60000) {
      const interval = remaining < 10000 ? 500 : 1000;
      const timer = setInterval(() => {
        audioEngine.playCriticalWarning();
      }, interval);
      return () => clearInterval(timer);
    }
  }, [currentMs, launchDate, phase, isAudioEnabled]);

  // Sync config to storage
  useEffect(() => {
    const config = {
      videoIds,
      launchDate: launchDate.toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }, [videoIds, launchDate]);

  useEffect(() => {
    setTelemetryHistory([]);
  }, [launchDate]);

  useEffect(() => {
    if (phase !== displayPhase) {
      setIsPhaseTransitioning(true);
      const timer = setTimeout(() => {
        setDisplayPhase(phase);
        setIsPhaseTransitioning(false);
      }, 450); 
      return () => clearTimeout(timer);
    }
  }, [phase, displayPhase]);

  const telemetry = useMemo((): TelemetryData => {
    const t = elapsedSeconds;
    if (t < 0) return { timestamp: Date.now(), altitude: 0, velocity: 0, fuel: 100, heartRate: 72 };
    let alt = 0, vel = 0;
    if (t < 128) { vel = t * 150; alt = Math.pow(t, 2.1) / 50; }
    else if (t < 486) { vel = 19200 + (t - 128) * 30; alt = 50 + (t - 128) * 0.5; }
    else { vel = 28000; alt = 200 + (t / 1000); }
    return { timestamp: Date.now(), altitude: alt, velocity: vel, fuel: Math.max(0, 100 - (t / 100)), heartRate: 70 + Math.random() * 5 };
  }, [elapsedSeconds]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setCurrentMs(now);
      const t = (now - launchDate.getTime()) / 1000;
      
      let newPhase: MissionPhase;
      if (t < 0) newPhase = MissionPhase.PRE_LAUNCH;
      else if (t < 486) newPhase = MissionPhase.ASCENT;
      else if (t < 92220) newPhase = MissionPhase.ORBIT;
      else if (t < 436980) newPhase = MissionPhase.LUNAR_FLYBY;
      else if (t < 786780) newPhase = MissionPhase.RETURN;
      else newPhase = MissionPhase.SPLASHDOWN;
      
      if (newPhase !== phase) setPhase(newPhase);
    }, 50); 
    return () => clearInterval(timer);
  }, [launchDate, phase]);

  const telemetryRef = useRef(telemetry);
  useEffect(() => {
    telemetryRef.current = telemetry;
  }, [telemetry]);

  useEffect(() => {
    const historyTimer = setInterval(() => {
      setTelemetryHistory(prev => {
        const next = [...prev, telemetryRef.current];
        return next.length > HISTORY_LIMIT ? next.slice(1) : next;
      });
    }, 1000);
    return () => clearInterval(historyTimer);
  }, []);

  const handlePromoteToPrimary = (index: number) => {
    const actualIndex = index + 1;
    const newVideoIds = [...videoIds];
    [newVideoIds[0], newVideoIds[actualIndex]] = [newVideoIds[actualIndex], newVideoIds[0]];
    setVideoIds(newVideoIds);
  };

  const handleToggleAudio = () => {
    if (!isAudioEnabled) {
      audioEngine.init();
    }
    setIsAudioEnabled(!isAudioEnabled);
  };

  const countdownMs = useMemo(() => launchDate.getTime() - currentMs, [currentMs, launchDate]);

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-200 overflow-hidden relative">
      <div className="fixed inset-0 pointer-events-none z-[9999] opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_2px,3px_100%]"></div>

      {isSettingsOpen && (
        <SettingsPanel 
          videoIds={videoIds} 
          launchDate={launchDate} 
          onSave={(ids, newDate) => {
            setVideoIds(ids);
            setLaunchDate(newDate);
            setIsSettingsOpen(false);
          }} 
          onClose={() => setIsSettingsOpen(false)} 
        />
      )}

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <MissionHeader 
          phase={phase} 
          setPhase={setPhase} 
          countdownMs={countdownMs} 
          onOpenSettings={() => setIsSettingsOpen(true)} 
          isAudioEnabled={isAudioEnabled}
          onToggleAudio={handleToggleAudio}
        />
        
        <div className="flex-1 p-4 flex flex-col overflow-hidden space-y-4">
          <div className="shrink-0 flex space-x-4">
            <NextMilestoneCard elapsedSeconds={elapsedSeconds} />
            <div className="flex-1">
              <HorizontalTimeline elapsedSeconds={elapsedSeconds} />
            </div>
          </div>

          <div className="flex-1 grid grid-cols-12 gap-4 min-h-0 overflow-hidden">
            <div className="col-span-12 lg:col-span-8 flex flex-col h-full min-h-0 space-y-4">
              <div className="flex space-x-4 h-full min-h-0">
                <div className="flex-[2] min-h-0">
                  <PrimaryFeed videoId={videoIds[0]} />
                </div>
                <div className="flex-1 flex flex-col space-y-4 min-h-0 hidden lg:flex">
                  <div className="flex-1 min-h-0">
                    <SecondaryFeeds videoIds={[videoIds[4]]} onPromote={() => handlePromoteToPrimary(3)} fillContainer={true} />
                  </div>
                  <div className="flex-1 min-h-0">
                    <SecondaryFeeds videoIds={[videoIds[5]]} onPromote={() => handlePromoteToPrimary(4)} fillContainer={true} />
                  </div>
                </div>
              </div>
              <div className="shrink-0">
                <SecondaryFeeds videoIds={videoIds.slice(1, 4)} onPromote={handlePromoteToPrimary} />
              </div>
            </div>

            <div className="col-span-12 lg:col-span-4 flex h-full min-h-0 space-x-4">
              <div className="flex-1 min-h-0 h-full">
                <MultiViewMonitor 
                  key={`monitor-${launchDate.getTime()}`} 
                  elapsedSeconds={elapsedSeconds} 
                  telemetry={telemetry} 
                  telemetryHistory={telemetryHistory} 
                />
              </div>
              <div 
                key={`timeline-transition-${displayPhase}`}
                className={`w-64 shrink-0 h-full min-h-0 ${isPhaseTransitioning ? 'animate-phase-out' : 'animate-phase-in'}`}
              >
                <MissionTimeline elapsedSeconds={elapsedSeconds} isCompressed={true} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
