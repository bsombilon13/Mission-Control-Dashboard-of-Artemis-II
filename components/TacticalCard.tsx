
import React from 'react';

interface TacticalCardProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  headerAction?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  isCritical?: boolean;
}

const TacticalCard: React.FC<TacticalCardProps> = ({ 
  children, 
  title, 
  subtitle, 
  icon, 
  headerAction, 
  footer, 
  className = '',
  isCritical = false
}) => {
  return (
    <div className={`glass rounded-xl border transition-all duration-500 flex flex-col h-full relative overflow-hidden group ${
      isCritical 
        ? 'border-red-500/30 bg-red-950/10' 
        : 'border-white/10 dark:border-white/10 border-slate-200 hover:border-blue-500/30 dark:hover:border-blue-500/30'
    } ${className}`}>
      {/* Corner Accents */}
      <div className="tactical-corner tactical-corner-tl opacity-40 group-hover:opacity-100 transition-opacity"></div>
      <div className="tactical-corner tactical-corner-tr opacity-40 group-hover:opacity-100 transition-opacity"></div>
      <div className="tactical-corner tactical-corner-bl opacity-40 group-hover:opacity-100 transition-opacity"></div>
      <div className="tactical-corner tactical-corner-br opacity-40 group-hover:opacity-100 transition-opacity"></div>

      {/* Card Header */}
      <div className="px-4 py-3 border-b border-white/5 dark:border-white/5 bg-black/20 dark:bg-black/20 light:bg-slate-50 flex items-center justify-between shrink-0 z-10">
        <div className="flex flex-col">
          <h3 className={`text-[10px] uppercase tracking-[0.3em] font-black drop-shadow-lg transition-colors ${
            isCritical 
              ? 'text-red-400' 
              : 'text-slate-700 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-white'
          }`}>
            {title}
          </h3>
          {subtitle && (
            <div className="flex items-center space-x-2 mt-0.5">
              <span className={`text-[8px] mono font-black uppercase tracking-widest ${
                isCritical ? 'text-red-500/70' : 'text-blue-400/70 group-hover:text-blue-400 transition-colors'
              }`}>
                {subtitle}
              </span>
              <div className={`w-1 h-1 rounded-full ${
                isCritical ? 'bg-red-500 animate-pulse' : 'bg-blue-500 animate-pulse'
              }`}></div>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-3">
          {headerAction}
          {icon && (
            <div className={`p-1.5 rounded-lg border transition-colors ${
              isCritical ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-blue-500/10 border-blue-500/20 text-blue-400 group-hover:border-blue-500/40'
            }`}>
              {icon}
            </div>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="flex-1 min-h-0 relative z-0">
        {children}
      </div>

      {/* Card Footer */}
      {footer && (
        <div className="px-4 py-2 bg-black/40 dark:bg-black/40 border-t border-white/5 dark:border-white/5 flex justify-between items-center text-[8px] font-black uppercase tracking-[0.25em] text-slate-500 dark:text-slate-500 shrink-0 z-10">
          {footer}
        </div>
      )}
    </div>
  );
};

export default TacticalCard;
