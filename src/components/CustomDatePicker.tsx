import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface CustomDatePickerProps {
  selectedDate: string; // YYYY-MM-DD format
  onChange: (date: string) => void;
  label?: string;
}

export function CustomDatePicker({ selectedDate, onChange, label = 'Select Date' }: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const today = new Date();
  
  const getInitialMonth = (dateStr: string) => {
    if (!dateStr) return new Date();
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? new Date() : d;
  };

  const [currentMonth, setCurrentMonth] = useState<Date>(() => getInitialMonth(selectedDate));

  // Sync currentMonth when selectedDate changes (critical for edit modal pre-fills)
  React.useEffect(() => {
    if (selectedDate) {
      const d = new Date(selectedDate);
      if (!isNaN(d.getTime())) {
        setCurrentMonth(d);
      }
    }
  }, [selectedDate]);

  const formatDateLabel = (dateStr: string) => {
    if (!dateStr) return 'Select Date';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    if (dateStr === todayStr) return 'Today';
    if (dateStr === yesterdayStr) return 'Yesterday';
    
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay(); // 0 is Sunday
  };

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const selectDate = (day: number) => {
    const y = currentMonth.getFullYear();
    const m = String(currentMonth.getMonth() + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    const newDateStr = `${y}-${m}-${d}`;
    onChange(newDateStr);
    setIsOpen(false);
  };

  const setPreset = (preset: 'today' | 'yesterday', e: React.MouseEvent) => {
    e.stopPropagation();
    let date = new Date();
    if (preset === 'yesterday') {
      date.setDate(date.getDate() - 1);
    }
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    onChange(`${y}-${m}-${d}`);
    setIsOpen(false);
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  
  const monthName = currentMonth.toLocaleString('en-US', { month: 'long' });
  const year = currentMonth.getFullYear();

  // Create calendar grids
  const blanks = Array(firstDay).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const calendarCells = [...blanks, ...days];

  const weekdayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <div className="w-full relative">
      <label className="block text-xs font-semibold text-emerald-800 mb-1 px-1">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full h-12 px-4 rounded-xl border border-emerald-100 flex items-center justify-between text-left glass-panel hover:bg-emerald-50/50 transition-all duration-200"
      >
        <span className="text-sm font-medium text-emerald-950">
          {formatDateLabel(selectedDate)}
        </span>
        <Calendar size={18} className="text-emerald-600" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black z-40"
            />

            {/* Bottom Calendar Sheet (Mobile app standard) */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed bottom-0 left-0 right-0 mx-auto max-w-[480px] bg-cream rounded-t-3xl border-t border-emerald-100/30 p-6 z-50 shadow-2xl glass-panel-dark pb-8"
            >
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-lg font-bold text-emerald-950 flex items-center gap-2">
                  <Calendar size={20} className="text-emerald-600" />
                  Select Date
                </h3>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-full hover:bg-emerald-50 transition-colors text-emerald-600"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Presets */}
              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={(e) => setPreset('today', e)}
                  className="flex-1 py-2 px-3 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-100 hover:bg-emerald-100/50 active:scale-95 transition-all text-center"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={(e) => setPreset('yesterday', e)}
                  className="flex-1 py-2 px-3 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-100 hover:bg-emerald-100/50 active:scale-95 transition-all text-center"
                >
                  Yesterday
                </button>
              </div>

              {/* Month Navigator */}
              <div className="flex justify-between items-center mb-4 px-1">
                <span className="text-sm font-bold text-emerald-900">
                  {monthName} {year}
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-800 transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-800 transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* Weekdays */}
              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {weekdayNames.map((name) => (
                  <span key={name} className="text-[11px] font-bold text-emerald-600/70 uppercase">
                    {name}
                  </span>
                ))}
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-1.5 text-center">
                {calendarCells.map((day, idx) => {
                  if (day === null) {
                    return <div key={`empty-${idx}`} />;
                  }

                  const cellDateStr = `${currentMonth.getFullYear()}-${String(
                    currentMonth.getMonth() + 1
                  ).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const isSelected = selectedDate === cellDateStr;
                  const isToday = today.toISOString().split('T')[0] === cellDateStr;

                  return (
                    <button
                      key={`day-${day}`}
                      type="button"
                      onClick={() => selectDate(day)}
                      className={`
                        h-9 w-9 mx-auto rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-150 active:scale-90
                        ${isSelected 
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30' 
                          : isToday 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-400 font-bold' 
                            : 'text-emerald-950 hover:bg-emerald-50 hover:text-emerald-800'
                        }
                      `}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
