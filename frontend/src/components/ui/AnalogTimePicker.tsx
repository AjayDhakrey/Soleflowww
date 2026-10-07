import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Clock, Sun, Moon, Check, Sparkles, X, ChevronRight } from 'lucide-react';

export interface AnalogTimePickerProps {
  value: string; // e.g. "11:30 AM", "02:15 PM", "14:30"
  onChange: (newTime: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

// Parse string time into { hours (1-12), minutes (0-59), period ('AM' | 'PM') }
function parseTimeString(timeStr: string): { hours: number; minutes: number; period: 'AM' | 'PM' } {
  if (!timeStr || !timeStr.trim()) {
    const now = new Date();
    let h = now.getHours();
    const period: 'AM' | 'PM' = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    const m = Math.round(now.getMinutes() / 5) * 5 % 60;
    return { hours: h, minutes: m, period };
  }

  const str = timeStr.trim();
  let period: 'AM' | 'PM' = 'AM';
  let cleanStr = str;

  if (/pm/i.test(str)) {
    period = 'PM';
    cleanStr = str.replace(/pm/i, '').trim();
  } else if (/am/i.test(str)) {
    period = 'AM';
    cleanStr = str.replace(/am/i, '').trim();
  }

  const parts = cleanStr.split(':').map((p) => parseInt(p, 10));
  let hours = 11;
  let minutes = 30;

  if (parts.length >= 1 && !isNaN(parts[0])) {
    hours = parts[0];
    if (hours === 0) {
      hours = 12;
      period = 'AM';
    } else if (hours > 12 && !/pm|am/i.test(str)) {
      hours = hours - 12;
      period = 'PM';
    } else if (hours > 12) {
      hours = hours % 12 || 12;
    }
  }

  if (parts.length >= 2 && !isNaN(parts[1])) {
    minutes = Math.max(0, Math.min(59, parts[1]));
  }

  return { hours: Math.max(1, Math.min(12, hours)), minutes, period };
}

// Format to 12-hour display string (e.g. "11:30 AM")
function formatTime(hours: number, minutes: number, period: 'AM' | 'PM'): string {
  const h = hours.toString().padStart(2, '0');
  const m = minutes.toString().padStart(2, '0');
  return `${h}:${m} ${period}`;
}

export const AnalogTimePicker: React.FC<AnalogTimePickerProps> = ({
  value,
  onChange,
  label,
  placeholder = 'Select Time',
  className = '',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const parsed = parseTimeString(value);

  const [selectedHours, setSelectedHours] = useState<number>(parsed.hours);
  const [selectedMinutes, setSelectedMinutes] = useState<number>(parsed.minutes);
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>(parsed.period);
  const [viewMode, setViewMode] = useState<'hours' | 'minutes'>('hours');
  const [isDragging, setIsDragging] = useState(false);

  const clockRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Sync state when external value changes
  useEffect(() => {
    const p = parseTimeString(value);
    setSelectedHours(p.hours);
    setSelectedMinutes(p.minutes);
    setSelectedPeriod(p.period);
  }, [value]);

  // Quick Preset Handlers
  const applyPreset = (h: number, m: number, p: 'AM' | 'PM') => {
    setSelectedHours(h);
    setSelectedMinutes(m);
    setSelectedPeriod(p);
  };

  const setNow = () => {
    const now = new Date();
    let h = now.getHours();
    const p: 'AM' | 'PM' = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    const m = Math.round(now.getMinutes() / 5) * 5 % 60;
    applyPreset(h, m, p);
  };

  // Convert click/drag coordinates to Clock angle & value
  const handleClockInteraction = useCallback(
    (clientX: number, clientY: number, snapToStep: boolean = true) => {
      if (!clockRef.current) return;
      const rect = clockRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = clientX - centerX;
      const deltaY = clientY - centerY;

      // Angle from 12 o'clock in radians (0 at top, clockwise)
      let rad = Math.atan2(deltaX, -deltaY);
      if (rad < 0) rad += 2 * Math.PI;

      const deg = (rad * 180) / Math.PI;

      if (viewMode === 'hours') {
        // 360 deg / 12 hours = 30 deg per hour
        let h = Math.round(deg / 30);
        if (h === 0) h = 12;
        if (h > 12) h = 12;
        setSelectedHours(h);
      } else {
        // 360 deg / 60 minutes = 6 deg per minute
        let m = Math.round(deg / 6) % 60;
        if (snapToStep) {
          m = Math.round(m / 5) * 5 % 60;
        }
        setSelectedMinutes(m);
      }
    },
    [viewMode]
  );

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    handleClockInteraction(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    handleClockInteraction(e.clientX, e.clientY, false);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      handleClockInteraction(e.clientX, e.clientY, true);
      // If we just set hour, smoothly transition to minutes view
      if (viewMode === 'hours') {
        setTimeout(() => setViewMode('minutes'), 180);
      }
    }
  };

  const handleConfirm = () => {
    const formatted = formatTime(selectedHours, selectedMinutes, selectedPeriod);
    onChange(formatted);
    setIsOpen(false);
  };

  // Close on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutside);
    }
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isOpen]);

  // Hand Rotation Angles
  const hourAngle = (selectedHours % 12) * 30 + (selectedMinutes / 60) * 30;
  const minuteAngle = selectedMinutes * 6;
  const activeHandAngle = viewMode === 'hours' ? hourAngle : minuteAngle;

  const displayString = value ? value : formatTime(selectedHours, selectedMinutes, selectedPeriod);

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="text-xs font-semibold text-muted-foreground block mb-1">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setViewMode('hours');
            setIsOpen(true);
          }
        }}
        className="w-full h-11 px-3.5 bg-surface border border-border rounded-xl text-foreground flex items-center justify-between text-xs font-medium hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer shadow-2xs group"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
            <Clock size={15} strokeWidth={2.2} />
          </div>
          <span className="font-mono text-xs text-foreground tracking-wide font-semibold">
            {displayString || placeholder}
          </span>
        </div>

        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-muted text-muted-foreground group-hover:text-primary transition-colors">
          Set Clock
        </span>
      </button>

      {/* Analog Clock Popover Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 dark:bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            ref={modalRef}
            className="relative w-full max-w-sm bg-surface rounded-2xl shadow-2xl border border-border p-5 space-y-4 animate-in zoom-in-95 duration-200 overflow-hidden text-foreground"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Clock size={16} strokeWidth={2.5} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground leading-tight">Analog Time Picker</h4>
                  <p className="text-[10px] text-muted-foreground">Tap or drag clock hands to set schedule</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Digital Display & AM/PM Selector */}
            <div className="flex items-center justify-between bg-muted/40 p-2.5 rounded-xl border border-border">
              {/* Digital Time Buttons */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setViewMode('hours')}
                  className={`px-3 py-1.5 rounded-lg font-mono text-xl font-bold transition-all cursor-pointer ${
                    viewMode === 'hours'
                      ? 'bg-primary text-white shadow-sm scale-105'
                      : 'bg-surface hover:bg-muted text-foreground border border-border'
                  }`}
                >
                  {selectedHours.toString().padStart(2, '0')}
                </button>

                <span className="font-mono text-xl font-bold text-muted-foreground px-0.5 animate-pulse">:</span>

                <button
                  type="button"
                  onClick={() => setViewMode('minutes')}
                  className={`px-3 py-1.5 rounded-lg font-mono text-xl font-bold transition-all cursor-pointer ${
                    viewMode === 'minutes'
                      ? 'bg-primary text-white shadow-sm scale-105'
                      : 'bg-surface hover:bg-muted text-foreground border border-border'
                  }`}
                >
                  {selectedMinutes.toString().padStart(2, '0')}
                </button>
              </div>

              {/* AM / PM Segmented Control */}
              <div className="flex items-center bg-surface p-1 rounded-lg border border-border shadow-2xs">
                <button
                  type="button"
                  onClick={() => setSelectedPeriod('AM')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    selectedPeriod === 'AM'
                      ? 'bg-amber-500 text-white shadow-2xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Sun size={12} />
                  <span>AM</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPeriod('PM')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    selectedPeriod === 'PM'
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Moon size={12} />
                  <span>PM</span>
                </button>
              </div>
            </div>

            {/* Quick Switch View Tabs */}
            <div className="flex rounded-lg bg-muted/60 p-0.5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setViewMode('hours')}
                className={`flex-1 py-1 rounded-md transition-all cursor-pointer ${
                  viewMode === 'hours'
                    ? 'bg-surface text-primary shadow-2xs font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                1. Set Hour ({selectedHours})
              </button>
              <button
                type="button"
                onClick={() => setViewMode('minutes')}
                className={`flex-1 py-1 rounded-md transition-all cursor-pointer ${
                  viewMode === 'minutes'
                    ? 'bg-surface text-primary shadow-2xs font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                2. Set Minute ({selectedMinutes.toString().padStart(2, '0')})
              </button>
            </div>

            {/* 3D Analog Clock Dial */}
            <div className="flex items-center justify-center py-1">
              <div
                ref={clockRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                className="relative w-52 h-52 sm:w-56 sm:h-56 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 border-4 border-slate-300 dark:border-slate-700 shadow-inner flex items-center justify-center select-none cursor-pointer touch-none"
              >
                {/* Dial numbers & markers */}
                {viewMode === 'hours' ? (
                  // Hours 1 to 12
                  [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((h) => {
                    const angle = (h % 12) * 30 * (Math.PI / 180);
                    const radius = 80; // Distance from center
                    const x = Math.sin(angle) * radius;
                    const y = -Math.cos(angle) * radius;
                    const isSelected = selectedHours === h;

                    return (
                      <div
                        key={h}
                        style={{
                          transform: `translate(${x}px, ${y}px)`,
                        }}
                        className={`absolute w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-transform ${
                          isSelected
                            ? 'bg-primary text-white shadow-md scale-110 z-10'
                            : 'text-slate-700 dark:text-slate-300 hover:text-primary font-mono'
                        }`}
                      >
                        {h}
                      </div>
                    );
                  })
                ) : (
                  // Minutes (0, 5, 10 ... 55)
                  [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((m) => {
                    const angle = m * 6 * (Math.PI / 180);
                    const radius = 80;
                    const x = Math.sin(angle) * radius;
                    const y = -Math.cos(angle) * radius;
                    const isSelected = selectedMinutes === m;

                    return (
                      <div
                        key={m}
                        style={{
                          transform: `translate(${x}px, ${y}px)`,
                        }}
                        className={`absolute w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-transform ${
                          isSelected
                            ? 'bg-primary text-white shadow-md scale-110 z-10'
                            : 'text-slate-700 dark:text-slate-300 hover:text-primary font-mono'
                        }`}
                      >
                        {m.toString().padStart(2, '0')}
                      </div>
                    );
                  })
                )}

                {/* Clock Hand Pointer */}
                <div
                  style={{
                    transform: `rotate(${activeHandAngle}deg)`,
                    transformOrigin: '50% 100%',
                    bottom: '50%',
                    left: 'calc(50% - 1.5px)',
                  }}
                  className={`absolute w-1 rounded-full transition-transform duration-75 pointer-events-none ${
                    viewMode === 'hours'
                      ? 'h-18 bg-primary shadow-sm'
                      : 'h-22 bg-blue-500 shadow-sm'
                  }`}
                >
                  {/* Selector Tip Circle */}
                  <div className="absolute -top-3 -left-2.5 w-6 h-6 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                </div>

                {/* Center Pin */}
                <div className="w-3.5 h-3.5 rounded-full bg-primary border-2 border-surface shadow-xs z-20" />
              </div>
            </div>

            {/* Quick B2B Route Presets */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                Quick Route Presets
              </span>
              <div className="grid grid-cols-4 gap-1.5 text-[10px] font-semibold">
                <button
                  type="button"
                  onClick={() => applyPreset(10, 0, 'AM')}
                  className="py-1 px-1 rounded-md bg-muted/60 hover:bg-muted text-foreground border border-border/60 transition-colors cursor-pointer text-center"
                >
                  10:00 AM
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset(12, 30, 'PM')}
                  className="py-1 px-1 rounded-md bg-muted/60 hover:bg-muted text-foreground border border-border/60 transition-colors cursor-pointer text-center"
                >
                  12:30 PM
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset(3, 30, 'PM')}
                  className="py-1 px-1 rounded-md bg-muted/60 hover:bg-muted text-foreground border border-border/60 transition-colors cursor-pointer text-center"
                >
                  03:30 PM
                </button>
                <button
                  type="button"
                  onClick={setNow}
                  className="py-1 px-1 rounded-md bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-colors cursor-pointer text-center font-bold"
                >
                  Now
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-between gap-3 border-t border-border">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                className="px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-all shadow-sm cursor-pointer active:scale-95"
              >
                <Check size={14} strokeWidth={2.5} />
                <span>Confirm Time</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
