
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, AlertTriangle, Info, RefreshCw, X, ChevronRight } from 'lucide-react';
import { MissionUpdate } from '../services/geminiService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  updates: MissionUpdate[];
  isLoading: boolean;
  onRefresh: () => void;
  lastRefreshed: Date;
}

const MissionNotifications: React.FC<Props> = ({ 
  isOpen, 
  onClose, 
  updates, 
  isLoading, 
  onRefresh, 
  lastRefreshed 
}) => {
  const getTypeStyles = (type: MissionUpdate['type']) => {
    switch (type) {
      case 'critical':
        return {
          bg: 'bg-red-500/10',
          border: 'border-red-500/30',
          text: 'text-red-400',
          icon: <AlertTriangle size={14} className="text-red-500" />,
          glow: 'shadow-[0_0_15px_rgba(239,68,68,0.2)]'
        };
      case 'advisory':
        return {
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/30',
          text: 'text-amber-400',
          icon: <Info size={14} className="text-amber-500" />,
          glow: 'shadow-[0_0_15px_rgba(245,158,11,0.2)]'
        };
      default:
        return {
          bg: 'bg-blue-500/10',
          border: 'border-blue-500/30',
          text: 'text-blue-400',
          icon: <Bell size={14} className="text-blue-500" />,
          glow: 'shadow-[0_0_15px_rgba(59,130,246,0.2)]'
        };
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className={`absolute inset-0 backdrop-blur-md transition-colors duration-500 ${
              document.documentElement.classList.contains('light') ? 'bg-slate-200/60' : 'bg-slate-950/60'
            }`}
          ></motion.div>

          {/* Modal */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className={`relative w-full max-w-2xl max-h-[80vh] glass rounded-3xl border flex flex-col overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-colors duration-500 ${
              document.documentElement.classList.contains('light') ? 'bg-white/95 border-slate-200' : 'bg-slate-900/90 border-white/10'
            }`}
          >
            {/* Header */}
            <div className={`px-6 py-4 border-b flex items-center justify-between z-10 shrink-0 transition-colors duration-500 ${
              document.documentElement.classList.contains('light') ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/80 border-white/10'
            }`}>
              <div className="flex flex-col">
                <h3 className={`text-xs uppercase tracking-[0.3em] font-black flex items-center space-x-3 transition-colors duration-500 ${
                  document.documentElement.classList.contains('light') ? 'text-slate-900' : 'text-white'
                }`}>
                  <Bell size={14} className="text-blue-500" />
                  <span>Mission Advisories & Alerts</span>
                </h3>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`text-[9px] font-bold uppercase tracking-widest transition-colors duration-500 ${
                    document.documentElement.classList.contains('light') ? 'text-blue-600/60' : 'text-blue-400/60'
                  }`}>Direct Uplink // NASA Artemis II Newsroom</span>
                  <span className={`text-[8px] px-1.5 py-0.5 rounded border font-bold uppercase tracking-tighter transition-colors duration-500 ${
                    document.documentElement.classList.contains('light') ? 'bg-slate-200 text-slate-600 border-slate-300' : 'bg-slate-700/50 text-slate-400 border-white/5'
                  }`}>
                    {updates.some(u => u.id.includes('fallback')) ? 'Offline Mode' : 'Live Uplink'}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={onRefresh}
                  disabled={isLoading}
                  className={`p-2 rounded-xl border transition-all ${
                    document.documentElement.classList.contains('light') ? 'border-slate-200 bg-slate-100 hover:bg-slate-200' : 'border-white/5 bg-white/5 hover:bg-white/10'
                  } ${isLoading ? 'animate-spin opacity-50' : ''}`}
                  title="Refresh Uplink"
                >
                  <RefreshCw size={14} className={document.documentElement.classList.contains('light') ? 'text-slate-600' : 'text-slate-400'} />
                </button>
                <button 
                  onClick={onClose}
                  className={`p-2 rounded-xl border transition-all ${
                    document.documentElement.classList.contains('light') ? 'border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900' : 'border-white/5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className={`flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4 transition-colors duration-500 ${
              document.documentElement.classList.contains('light') ? 'bg-slate-50/50' : 'bg-black/20'
            }`}>
              {updates.length === 0 && !isLoading ? (
                <div className="flex flex-col items-center justify-center h-64 opacity-30">
                  <Bell size={48} className="mb-4" />
                  <p className="text-sm font-black uppercase tracking-widest">No active advisories</p>
                </div>
              ) : (
                updates.map((update, idx) => {
                  const styles = getTypeStyles(update.type);
                  return (
                    <motion.div
                      key={update.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <a
                        href={update.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`block p-5 rounded-2xl border ${styles.bg} ${styles.border} ${styles.glow} relative overflow-hidden group/card transition-all cursor-pointer ${
                          document.documentElement.classList.contains('light') ? 'hover:border-blue-500/50' : 'hover:border-white/20'
                        }`}
                      >
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-current opacity-40" style={{ color: styles.text.replace('text-', '') }}></div>
                        
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className={`p-1.5 rounded-lg ${styles.bg} border ${styles.border}`}>
                              {styles.icon}
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${styles.text}`}>
                              {update.type}
                            </span>
                          </div>
                          <span className={`text-[10px] mono font-bold tabular-nums transition-colors duration-500 ${
                            document.documentElement.classList.contains('light') ? 'text-slate-400' : 'text-slate-500'
                          }`}>
                            {new Date(update.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>

                        <h4 className={`text-base font-black uppercase tracking-wide leading-tight mb-3 group-hover/card:text-blue-500 transition-colors duration-500 ${
                          document.documentElement.classList.contains('light') ? 'text-slate-900' : 'text-white'
                        }`}>
                          {update.title}
                        </h4>
                        
                        <p className={`text-xs leading-relaxed font-medium transition-colors duration-500 ${
                          document.documentElement.classList.contains('light') ? 'text-slate-600' : 'text-slate-400'
                        }`}>
                          {update.summary}
                        </p>

                        <div className={`mt-4 flex items-center justify-between pt-4 border-t transition-colors duration-500 ${
                          document.documentElement.classList.contains('light') ? 'border-slate-200' : 'border-white/5'
                        }`}>
                          <span className={`text-[9px] font-bold uppercase tracking-widest transition-colors duration-500 ${
                            document.documentElement.classList.contains('light') ? 'text-slate-400' : 'text-slate-600'
                          }`}>Source: NASA.GOV / NEWS</span>
                          <div className="flex items-center space-x-2 text-blue-500 group-hover/card:translate-x-1 transition-transform">
                            <span className="text-[10px] font-black uppercase tracking-widest">Access Full Report</span>
                            <ChevronRight size={12} />
                          </div>
                        </div>
                      </a>
                    </motion.div>
                  );
                })
              )}
              
              {isLoading && (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="w-10 h-10 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 animate-pulse">Synchronizing with NASA Newsroom...</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className={`px-6 py-3 border-t flex items-center justify-between shrink-0 transition-colors duration-500 ${
              document.documentElement.classList.contains('light') ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/80 border-white/10'
            }`}>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_100px_rgba(16,185,129,0.5)]"></div>
                <span className={`text-[9px] font-black uppercase tracking-[0.25em] transition-colors duration-500 ${
                  document.documentElement.classList.contains('light') ? 'text-slate-500' : 'text-slate-400'
                }`}>Uplink Status: Nominal</span>
              </div>
              <span className={`text-[9px] mono font-bold transition-colors duration-500 ${
                document.documentElement.classList.contains('light') ? 'text-slate-400' : 'text-slate-500'
              }`}>
                Last Sync: {lastRefreshed.toLocaleTimeString()}
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default React.memo(MissionNotifications);
