import React, { useState } from 'react';

interface Props {
  videoIds: string[];
  launchDate: Date;
  onSave: (ids: string[], newLaunchDate: Date) => void;
  onClose: () => void;
}

const SettingsPanel: React.FC<Props> = ({ videoIds, launchDate, onSave, onClose }) => {
  const [tempIds, setTempIds] = useState([...videoIds]);
  const [isSaving, setIsSaving] = useState(false);
  
  /**
   * Formats a Date object specifically to the America/New_York timezone string
   * compatible with the datetime-local input field.
   */
  const formatDateForETInput = (date: Date) => {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    
    const parts = formatter.formatToParts(date);
    const p: Record<string, string> = {};
    parts.forEach(({ type, value }) => { p[type] = value; });
    
    // Handle edge case where hour12: false returns "24" for midnight
    let hour = p.hour;
    if (hour === '24') hour = '00';
    
    // Returns YYYY-MM-DDTHH:mm:ss
    return `${p.year}-${p.month}-${p.day}T${hour}:${p.minute}:${p.second}`;
  };

  const [tempDateStr, setTempDateStr] = useState(formatDateForETInput(launchDate));

  const handleIdChange = (idx: number, val: string) => {
    let id = val;
    if (val.includes('v=')) {
      id = val.split('v=')[1].split('&')[0];
    } else if (val.includes('be/')) {
      id = val.split('be/')[1].split('?')[0];
    } else if (val.includes('embed/')) {
      id = val.split('embed/')[1].split('?')[0];
    }
    
    const newIds = [...tempIds];
    newIds[idx] = id;
    setTempIds(newIds);
  };

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);

    // Artificial delay to allow user to perceive the "Saving" state
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      // tempDateStr is in YYYY-MM-DDTHH:mm:ss format (Wall clock time in ET)
      const dummyDate = new Date(tempDateStr);
      
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        timeZoneName: 'longOffset'
      });
      
      const formattedParts = formatter.formatToParts(dummyDate);
      const offsetPart = formattedParts.find(p => p.type === 'timeZoneName')?.value || "";
      
      const offsetMatch = offsetPart.match(/[+-]\d{2}:?\d{2}/);
      const offset = offsetMatch ? offsetMatch[0] : "-05:00";
      
      let finalOffset = offset;
      if (offset.length === 5 && !offset.includes(':')) {
        finalOffset = offset.substring(0, 3) + ":" + offset.substring(3);
      }

      const isoWithOffset = `${tempDateStr}${finalOffset}`;
      const newDate = new Date(isoWithOffset);

      if (!isNaN(newDate.getTime())) {
        onSave(tempIds, newDate);
      } else {
        console.error("Mission Control: Invalid Launch Date generated", isoWithOffset);
        setIsSaving(false);
      }
    } catch (err) {
      console.error("Mission Control: Configuration save failed", err);
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
      <div className="glass w-full max-w-md border border-slate-700 rounded-2xl overflow-hidden animate-in fade-in zoom-in duration-200 shadow-[0_0_100px_rgba(0,0,0,0.5)]">
        <div className="bg-slate-900 p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold mono tracking-widest text-slate-100 uppercase">Mission Configuration</h2>
          <button 
            onClick={onClose} 
            disabled={isSaving}
            className="text-slate-500 hover:text-white text-2xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            &times;
          </button>
        </div>
        
        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
          {/* Video Feeds Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">Video Feed Sources</h3>
              <span className="text-[9px] text-slate-600 mono italic">YouTube IDs or URLs</span>
            </div>
            {tempIds.map((id, idx) => {
              let label = `Feed 0${idx + 1}`;
              if (idx === 0) label = "Primary Mission Feed";
              if (idx > 0 && idx < 4) label = `Secondary Feed 0${idx}`;
              if (idx >= 4) label = `Auxiliary Feed 0${idx - 3}`;

              return (
                <div key={idx} className="group">
                  <label className="text-[9px] text-slate-400 uppercase tracking-widest block mb-1">{label}</label>
                  <input 
                    type="text" 
                    value={id}
                    disabled={isSaving}
                    placeholder="Enter ID..."
                    onChange={(e) => handleIdChange(idx, e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs mono text-blue-400 focus:outline-none focus:border-blue-500 transition-colors group-hover:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              );
            })}
          </section>

          {/* Launch Time Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">Launch Parameters</h3>
              <div className="flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[9px] text-emerald-500 mono font-bold uppercase">EST/EDT SYNC</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-baseline mb-1">
                <label className="text-[9px] text-slate-400 uppercase tracking-widest block">Target Launch Time (Eastern Time)</label>
                <span className="text-[7px] text-blue-500 font-bold uppercase tracking-tighter bg-blue-500/10 px-1 rounded">KSC Reference</span>
              </div>
              <input 
                type="datetime-local" 
                step="1"
                disabled={isSaving}
                value={tempDateStr}
                onChange={(e) => setTempDateStr(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs mono text-emerald-400 focus:outline-none focus:border-emerald-500 appearance-none [color-scheme:dark] disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <div className="mt-3 p-3 rounded bg-slate-900/50 border border-slate-800">
                <p className="text-[9px] text-slate-500 mono leading-relaxed uppercase">
                  Clock synchronized to Kennedy Space Center (Florida). Date/time input uses Wall Clock time.
                </p>
              </div>
            </div>
          </section>
        </div>

        <div className="p-4 bg-slate-900 border-t border-slate-800 flex justify-end space-x-3">
          <button 
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 text-xs uppercase tracking-widest font-bold text-slate-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Abort
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-xs uppercase tracking-widest font-bold text-white rounded shadow-lg shadow-blue-900/20 transition-all active:scale-95 disabled:bg-blue-800/50 disabled:text-blue-300 disabled:cursor-not-allowed"
          >
            {isSaving && (
              <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            <span>{isSaving ? 'Processing Uplink...' : 'Update Flight Plan'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
