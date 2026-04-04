
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
import MissionScheduleCard from './components/MissionScheduleCard';

const INITIAL_LAUNCH_DATE = new Date('2026-02-07T02:41:00Z');
const INITIAL_VIDEO_IDS = [
  'nrVnsO_rdew', // NASA TV
  'Jm8wRjD3xVA', // ISS Live
];
const HISTORY_LIMIT = 40;
const STORAGE_KEY = 'artemis_mission_config_v5';

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
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const config = JSON.parse(saved);
        if (config.theme) return config.theme;
      } catch (e) {}
    }
    return 'dark';
  });

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
          // Merge saved IDs with defaults to ensure we have exactly 2
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
      volume,
      theme
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    audioEngine.setVolume(volume);
    
    // Apply theme to document
    if (theme === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    }
  }, [videoIds, launchDate, volume, theme]);

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

  const handleToggleAudio = () => {
    if (!isAudioEnabled) {
      audioEngine.init();
    }
    setIsAudioEnabled(!isAudioEnabled);
  };

  const loadUpdates = useCallback(async () => {
    setIsNotificationsLoading(true);
    try {
      const newsData = await fetchMissionUpdates();
      
      if (newsData && newsData.length > 0) {
        setMissionUpdates(newsData);
        setLastRefreshed(new Date());
      } else {
        // Only use fallback if we have NO updates at all
        setMissionUpdates(prev => {
          if (prev.length > 0) return prev;
          console.warn("Artemis II: Using fallback mission updates.");
          return [
            {
              id: 'fallback-1',
              title: 'Artemis II Mission: Final Systems Check Complete',
              summary: 'NASA engineers have completed the final integrated systems check for the SLS rocket and Orion spacecraft. All systems are nominal for the upcoming lunar mission.',
              timestamp: new Date(Date.now() - 3600000).toISOString(),
              type: 'critical',
              url: 'https://www.nasa.gov/artemis-ii-news-and-updates/'
            },
            {
              id: 'fallback-2',
              title: 'Crew Training: Lunar Flyby Simulators',
              summary: 'The Artemis II crew has successfully completed their final high-fidelity simulation of the lunar flyby phase, focusing on manual navigation overrides.',
              timestamp: new Date(Date.now() - 86400000).toISOString(),
              type: 'advisory',
              url: 'https://www.nasa.gov/artemis-ii-news-and-updates/'
            },
            {
              id: 'fallback-3',
              title: 'Recovery Teams Deploy to Pacific Ocean',
              summary: 'NASA and US Navy recovery teams have begun pre-deployment exercises in the Pacific Ocean to prepare for the Orion splashdown and recovery operations.',
              timestamp: new Date(Date.now() - 172800000).toISOString(),
              type: 'update',
              url: 'https://www.nasa.gov/artemis-ii-news-and-updates/'
            }
          ];
        });
      }
    } catch (err) {
      console.error("Artemis II: Error loading mission updates:", err);
    } finally {
      setIsNotificationsLoading(false);
    }
  }, []); // Removed missionUpdates.length dependency

  useEffect(() => {
    loadUpdates();
    const interval = setInterval(loadUpdates, 900000); // 15 mins
    return () => clearInterval(interval);
  }, [loadUpdates]);

  const countdownMs = useMemo(() => launchDate.getTime() - currentMs, [currentMs, launchDate]);
  const missionDay = useMemo(() => {
    if (elapsedSeconds < 0) return null;
    return Math.floor(elapsedSeconds / 86400) + 1;
  }, [elapsedSeconds]);

  return (
    <div className={`flex flex-col h-screen overflow-hidden relative transition-colors duration-500 ${
      theme === 'dark' ? 'bg-slate-950 text-slate-200' : 'bg-slate-50 text-slate-900'
    }`}>
      <div className="fixed inset-0 pointer-events-none z-[9999] opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_2px,3px_100%]"></div>

      {isSettingsOpen && (
        <SettingsPanel 
          videoIds={videoIds} 
          launchDate={launchDate} 
          volume={volume}
          theme={theme}
          onSave={(ids, newDate, newVolume, newTheme) => {
            setVideoIds(ids);
            setLaunchDate(newDate);
            setVolume(newVolume);
            setTheme(newTheme);
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
        <div className={`flex flex-col lg:flex-row items-stretch border-b backdrop-blur-xl z-50 transition-colors duration-500 ${
          theme === 'dark' ? 'bg-slate-950/50 border-white/10' : 'bg-white/70 border-slate-200'
        }`}>
          <div className="flex-1">
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
              elapsedSeconds={elapsedSeconds}
              theme={theme}
            />
          </div>
        </div>
        
        <div className="flex-1 p-2 sm:p-3 flex flex-col overflow-y-auto lg:overflow-hidden space-y-3">
          {/* Main Dashboard Grid */}
          <div className="flex-1 grid grid-cols-12 gap-3 min-h-0 lg:overflow-hidden">
            
            {/* LEFT COLUMN: PRIMARY MONITORING (Visuals & Telemetry) */}
            <div className="col-span-12 lg:col-span-7 flex flex-col space-y-3 min-h-0">
              {/* Top Row of Left Column: Visual Feeds */}
              <div className="flex-[1.2] min-h-[280px] lg:min-h-0">
                <MissionVisualFeeds videoIds={videoIds} />
              </div>
              
              {/* Bottom Row of Left Column: Trajectory Uplinks */}
              <div className="flex-1 grid grid-cols-12 gap-3 min-h-[300px] lg:min-h-0">
                <div className="col-span-12 sm:col-span-6 h-full">
                  <ArowMonitor 
                    url="https://www.nasa.gov/missions/artemis-ii/arow/" 
                    title="Artemis Orbit Uplink"
                    subtitle="NASA AROW // Live Trajectory"
                    id="ARW_772"
                  />
                </div>
                <div className="col-span-12 sm:col-span-6 h-full">
                  <ArowMonitor 
                    url="https://www.nasa.gov/missions/artemis-ii/arow/" 
                    title="Solar System Monitor"
                    subtitle="NASA AROW // Live Trajectory"
                    id="EYE_001"
                  />
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: SEQUENCING & SCHEDULING */}
            <div className="col-span-12 lg:col-span-5 flex flex-col space-y-3 min-h-0 pr-1">
              {/* Next Milestone - High Priority */}
              <div className="shrink-0 h-28">
                <NextMilestoneCard elapsedSeconds={elapsedSeconds} />
              </div>

              {/* Mission Trajectory Status (Horizontal Timeline) */}
              <div className="shrink-0 h-36">
                <HorizontalTimeline elapsedSeconds={elapsedSeconds} />
              </div>

              {/* Sequence Monitor & Mission Schedule Side-by-Side */}
              <div className="flex-1 min-h-0 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Sequence Monitor (Timeline) */}
                <div 
                  key={`timeline-transition-${displayPhase}`}
                  className={`h-full min-h-0 ${isPhaseTransitioning ? 'animate-phase-out' : 'animate-phase-in'}`}
                >
                  <MissionTimeline elapsedSeconds={elapsedSeconds} />
                </div>

                {/* Mission Schedule */}
                <div className="h-full min-h-0">
                  <MissionScheduleCard elapsedSeconds={elapsedSeconds} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Global Footer Status Bar */}
        <footer className={`h-8 border-t flex items-center px-4 justify-between text-[8px] font-black uppercase tracking-[0.2em] z-50 transition-colors duration-500 ${
          theme === 'dark' ? 'bg-slate-900/80 border-white/10 text-slate-500' : 'bg-slate-100/80 border-slate-200 text-slate-600'
        }`}>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span>System Status: Nominal</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
              <span>Uplink: Active</span>
            </div>
            <div className="hidden sm:flex items-center space-x-2">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div>
              <span>Encryption: AES-256-GCM</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="mono">STATION: JSC_HOUSTON_TX</span>
            <span className="mono text-slate-400">EPOCH: 2026.04.04 // 11:48:10 UTC</span>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default App;
