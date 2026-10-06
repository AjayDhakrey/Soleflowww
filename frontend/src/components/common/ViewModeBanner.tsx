import React, { useState, useEffect } from 'react';
import { Eye, LogOut, Lock, Clock } from 'lucide-react';
import { useViewMode } from '../../context/ViewModeContext';

interface ViewModeBannerProps {
  onExitNavigate?: () => void;
}

export const ViewModeBanner: React.FC<ViewModeBannerProps> = ({ onExitNavigate }) => {
  const { isReadOnly, viewOrgName, sessionStartedAt, exitViewMode } = useViewMode();
  const [elapsed, setElapsed] = useState('00:00');

  useEffect(() => {
    if (!isReadOnly) return;

    const calculateElapsed = () => {
      if (!sessionStartedAt) return '00:00';
      const start = new Date(sessionStartedAt).getTime();
      const diffMs = Math.max(0, Date.now() - start);
      const totalSec = Math.floor(diffMs / 1000);
      const hrs = Math.floor(totalSec / 3600);
      const mins = Math.floor((totalSec % 3600) / 60);
      const secs = totalSec % 60;

      if (hrs > 0) {
        return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      }
      return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    setElapsed(calculateElapsed());
    const interval = setInterval(() => {
      setElapsed(calculateElapsed());
    }, 1000);

    return () => clearInterval(interval);
  }, [isReadOnly, sessionStartedAt]);

  if (!isReadOnly) return null;

  const handleExit = async () => {
    await exitViewMode();
    if (onExitNavigate) {
      onExitNavigate();
    }
  };

  return (
    <div className="sticky top-0 z-50 bg-amber-500 text-slate-950 px-4 py-2 text-xs font-semibold flex items-center justify-between border-b border-amber-600/40 shadow-sm select-none">
      <div className="flex items-center gap-2.5 truncate">
        <div className="w-5 h-5 rounded-md bg-slate-950 text-amber-300 flex items-center justify-center shrink-0">
          <Eye size={12} strokeWidth={2.5} />
        </div>
        <div className="truncate">
          <span>Viewing: </span>
          <strong className="underline underline-offset-2">{viewOrgName || 'Organization'}</strong>
          <span className="opacity-90 ml-1.5 font-normal">· Strict Read-Only View Mode</span>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="hidden sm:flex items-center gap-1 text-[11px] font-mono bg-amber-600/30 px-2 py-0.5 rounded text-slate-950">
          <Clock size={12} className="opacity-80" />
          <span>{elapsed}</span>
        </div>

        <button
          type="button"
          onClick={handleExit}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-900 text-amber-300 font-bold text-xs transition-all shadow-2xs cursor-pointer"
        >
          <LogOut size={13} strokeWidth={2.5} />
          <span>Exit View</span>
        </button>
      </div>
    </div>
  );
};

export default ViewModeBanner;
