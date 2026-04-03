
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { MissionPhase, TelemetryData } from './types';
import MissionHeader from './components/MissionHeader';
import MissionVisualFeeds from './components/MissionVisualFeeds';
import MissionTimeline, { MISSION_EVENTS } from './components/MissionTimeline';
import ArowMonitor from './components/ArowMonitor';
import MissionNotifications from './components/MissionNotifications';
import SettingsPanel from './components/SettingsPanel';
import { fetchMissionUpdates, MissionUpdate } from './services/geminiService';
import HorizontalTimeline from './components/HorizontalTimeline';
import NextMilestoneCard from './components/NextMilestoneCard';

const INITIAL_LAUNCH_DATE = new Date('2026-02-07T02:41:00Z');
const INITIAL_VIDEO_IDS = [
  'nrVnsO_rdew', // NASA TV
  'Jm8wRjD3xVA', // ISS Live
  '9vX2P4w6u-4', // Artemis Highlights
  '21X5lGlDOfg', // Starship
];
const HISTORY_LIMIT = 40;
const STORAGE_KEY = 'artemis_mission_config_v3';

// Tactical Sound Engine
class MissionAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private currentVolume: number = 0.25;

  init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.connect(this.ctx.destination);
    this.masterGain.gain.value = this.currentVolume;
  }

  setVolume(value: number) {
    this.currentVolume = Math.max(0, Math.min(1, value));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.currentVolume, this.ctx.currentTime, 0.1);
    }
  }

  private playTone(freq: number, type: OscillatorType, duration: number, gainValue: number = 1.0, slide: boolean = true) {
    if (!this.ctx || !this.masterGain) return;
    
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    if (slide) {
      osc.frequency.exponentialRampToValueAtTime(freq * 0.5, this.ctx.currentTime + duration);
    }
    
    g.gain.setValueAtTime(gainValue, this.ctx.currentTime);
    g.gain.linearRampToValueAtTime(0, this.ctx.currentTime + duration);
    
    osc.connect(g);
    g.connect(this.masterGain);
    
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playMilestone() {
    this.playTone(880, 'sine', 0.1, 0.4, false);
  }

  playPhase() {
    // Low frequency notification for phase change
    this.playTone(110, 'triangle', 0.8, 0.3);
    setTimeout(() => this.playTone(220, 'sine', 0.4, 0.2), 100);
  }

  playWarning() {
    this.playTone(440, 'sawtooth', 0.1, 0.15, false);
  }

  playCriticalWarning() {
    this.playTone(660, 'square', 0.05, 0.2, false);
    setTimeout(() => this.playTone(550, 'square', 0.05, 0.2, false), 80);
  }

  playSuccess() {
    this.playTone(523.25, 'sine', 0.1, 0.3, false); // C5
    setTimeout(() => this.playTone(659.25, 'sine', 0.1, 0.3, false), 100); // E5
    setTimeout(() => this.playTone(783.99, 'sine', 0.2, 0.3, false), 200); // G5
  }
}

export const audioEngine = new MissionAudioEngine();

const App: React.FC = () => {
  const [phase, setPhase] = useState<MissionPhase>(MissionPhase.PRE_LAUNCH);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [missionUpdates, setMissionUpdates] = useState<MissionUpdate[]>([]);
  const [isNotificationsLoading, setIsNotificationsLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const config = JSON.parse(saved);
        if (typeof config.volume === 'number') return config.volume;
      } catch (e) {}
    }
    return 0.25;
  });
  
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

  // Critical Warning Heartbeat
  useEffect(() => {
    if (!isAudioEnabled || phase !== MissionPhase.PRE_LAUNCH) return;
    
    const remaining = launchDate.getTime() - currentMs;
    if (remaining > 0 && remaining < 60000) {
      const interval = remaining < 10000 ? 500 : 1000;
      const timer = setInterval(() => {
        if (remaining < 10000) {
          audioEngine.playCriticalWarning();
        } else {
          audioEngine.playWarning();
        }
      }, interval);
      return () => clearInterval(timer);
    }
  }, [currentMs, launchDate, phase, isAudioEnabled]);

  // Sync config to storage
  useEffect(() => {
    const config = {
      videoIds,
      launchDate: launchDate.toISOString(),
      volume
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    audioEngine.setVolume(volume);
  }, [videoIds, launchDate, volume]);

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
      
      if (newPhase !== phase) {
        setPhase(newPhase);
        if (isAudioEnabled) {
          if (newPhase === MissionPhase.ASCENT) {
            audioEngine.playSuccess();
          } else {
            audioEngine.playPhase();
          }
        }
      }
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

  const handlePromoteToPrimary = useCallback((index: number) => {
    const actualIndex = index + 1;
    const newVideoIds = [...videoIds];
    [newVideoIds[0], newVideoIds[actualIndex]] = [newVideoIds[actualIndex], newVideoIds[0]];
    setVideoIds(newVideoIds);
  }, [videoIds]);

  const handleToggleAudio = () => {
    if (!isAudioEnabled) {
      audioEngine.init();
    }
    setIsAudioEnabled(!isAudioEnabled);
  };

  const loadUpdates = useCallback(async () => {
    setIsNotificationsLoading(true);
    try {
      const data = await fetchMissionUpdates();
      console.log("Fetched Mission Updates:", data);
      if (data && data.length > 0) {
        setMissionUpdates(data);
        setLastRefreshed(new Date());
      } else if (missionUpdates.length === 0) {
        // Fallback
        setMissionUpdates([
          {
            id: 'fallback-1',
            title: 'NASA Artemis II Mission Countdown Released',
            summary: 'NASA has officially released the countdown sequence for the Artemis II mission, detailing the final hours before liftoff.',
            timestamp: '2026-04-02T14:30:00Z',
            type: 'critical',
            url: 'https://www.nasa.gov/artemis-ii-news-and-updates/'
          }
        ]);
      }
    } catch (err) {
      console.error("Error loading mission updates:", err);
    } finally {
      setIsNotificationsLoading(false);
    }
  }, [missionUpdates.length]);

  useEffect(() => {
    loadUpdates();
    const interval = setInterval(loadUpdates, 300000); // 5 mins
    return () => clearInterval(interval);
  }, [loadUpdates]);

  const countdownMs = useMemo(() => launchDate.getTime() - currentMs, [currentMs, launchDate]);
  const missionDay = useMemo(() => {
    if (elapsedSeconds < 0) return null;
    return Math.floor(elapsedSeconds / 86400) + 1;
  }, [elapsedSeconds]);

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-200 overflow-hidden relative">
      <div className="fixed inset-0 pointer-events-none z-[9999] opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_2px,3px_100%]"></div>

      {isSettingsOpen && (
        <SettingsPanel 
          videoIds={videoIds} 
          launchDate={launchDate} 
          volume={volume}
          onSave={(ids, newDate, newVolume) => {
            setVideoIds(ids);
            setLaunchDate(newDate);
            setVolume(newVolume);
            setIsSettingsOpen(false);
          }} 
          onClose={() => setIsSettingsOpen(false)} 
        />
      )}

      <MissionNotifications 
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        updates={missionUpdates}
        isLoading={isNotificationsLoading}
        onRefresh={loadUpdates}
        lastRefreshed={lastRefreshed}
      />

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <MissionHeader 
          phase={phase} 
          setPhase={setPhase} 
          countdownMs={countdownMs} 
          onOpenSettings={() => setIsSettingsOpen(true)} 
          isAudioEnabled={isAudioEnabled}
          onToggleAudio={handleToggleAudio}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          notificationCount={missionUpdates.length}
          missionDay={missionDay}
        />
        
        <div className="flex-1 p-4 flex flex-col overflow-hidden space-y-4">
          <div className="shrink-0 flex space-x-4">
            <NextMilestoneCard elapsedSeconds={elapsedSeconds} />
            <div className="flex-1">
              <HorizontalTimeline elapsedSeconds={elapsedSeconds} />
            </div>
          </div>

          <div className="flex-1 grid grid-cols-12 gap-4 min-h-0 overflow-hidden">
            <div className="col-span-12 lg:col-span-4 flex flex-col h-full min-h-0">
              <MissionVisualFeeds videoIds={videoIds} onPromote={handlePromoteToPrimary} />
            </div>

            <div className="col-span-12 lg:col-span-4 flex flex-col h-full min-h-0">
              <ArowMonitor />
            </div>

            <div className="col-span-12 lg:col-span-4 flex h-full min-h-0 space-x-4">
              <div className="flex-1 min-h-0 h-full">
                <ArowMonitor />
              </div>
              <div 
                key={`timeline-transition-${displayPhase}`}
                className={`w-48 shrink-0 h-full min-h-0 ${isPhaseTransitioning ? 'animate-phase-out' : 'animate-phase-in'}`}
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
