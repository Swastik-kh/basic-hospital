
import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
// @ts-ignore
import NepaliDate from 'nepali-date-converter';

interface NepaliDatePickerProps {
  value: string; // Format: YYYY-MM-DD or YYYY/MM/DD
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  format?: 'YYYY-MM-DD' | 'YYYY/MM/DD';
  inputClassName?: string;
  wrapperClassName?: string;
  hideIcon?: boolean;
  popupAlign?: 'left' | 'right';
  minDate?: string;
  maxDate?: string;
}

const NEPALI_MONTHS = [
  'बैशाख', 'जेठ', 'असार', 'साउन', 'भदौ', 'असोज',
  'कार्तिक', 'मंसिर', 'पुष', 'माघ', 'फागुन', 'चैत्र'
];

const WEEK_DAYS = ['आइ', 'सोम', 'मंगल', 'बुध', 'बिही', 'शुक्र', 'शनि'];

export const NepaliDatePicker: React.FC<NepaliDatePickerProps> = ({
  value,
  onChange,
  label = "मिति (Date)",
  required = false,
  disabled = false,
  format = 'YYYY-MM-DD',
  inputClassName = '',
  wrapperClassName = '',
  hideIcon = false,
  popupAlign = 'left',
  minDate,
  maxDate
}) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const normalizeDate = (dateStr?: string) => {
    if (!dateStr) return '';
    return dateStr.replace(/-/g, '/');
  };

  const parseDate = (val: string) => {
    if (val) {
      const parts = val.split(/[-/]/);
      if (parts.length === 3) {
        return {
          year: parseInt(parts[0]),
          month: parseInt(parts[1]) - 1, // 0-indexed month
          day: parseInt(parts[2])
        };
      }
    }
    const now = new NepaliDate();
    return {
      year: now.getYear(),
      month: now.getMonth(), // 0-indexed month
      day: now.getDate()
    };
  };

  const initial = parseDate(value);
  const [viewYear, setViewYear] = useState(initial.year);
  const [viewMonth, setViewMonth] = useState(initial.month);
  
  const [selectedYear, setSelectedYear] = useState(initial.year);
  const [selectedMonth, setSelectedMonth] = useState(initial.month);
  const [selectedDay, setSelectedDay] = useState(initial.day);

  useEffect(() => {
    if (value) {
      const { year, month, day } = parseDate(value);
      setSelectedYear(year);
      setSelectedMonth(month);
      setSelectedDay(day);
      setViewYear(year);
      setViewMonth(month);
    }
  }, [value]);

  const updatePosition = useCallback(() => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      const calendarWidth = 288;
      const calendarHeight = 320;
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      let top = rect.bottom + window.scrollY + 5;
      let left = rect.left + window.scrollX;

      // Adjust if bottom overflow
      if (rect.bottom + calendarHeight > viewportHeight) {
        top = rect.top + window.scrollY - calendarHeight - 5;
      }
      
      // Adjust alignment
      if (popupAlign === 'right' || (left + calendarWidth > viewportWidth)) {
         left = rect.right + window.scrollX - calendarWidth;
      }
      
      setDropdownPosition({ top, left });
    }
  }, [popupAlign]);

  useLayoutEffect(() => {
    if (showCalendar) {
      updatePosition();
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true);
    }
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [showCalendar, updatePosition]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current && 
        !containerRef.current.contains(event.target as Node) &&
        !(document.getElementById('nepali-calendar-portal')?.contains(event.target as Node))
      ) {
        setShowCalendar(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDaysInMonth = (year: number, month: number) => {
    // nepali-date-converter uses 0-11 for months
    // We can create a date for first day of next month and subtract 1 day
    // Or just use the library features if available. The library structure is slightly different per version.
    // Standard hack:
    let currentMonth = new NepaliDate(year, month, 1);
    let nextMonthYear = month === 11 ? year + 1 : year;
    let nextMonth = month === 11 ? 0 : month + 1;
    // The library calculates days correctly.
    // Let's rely on iterating until month changes.
    // Actually, bs2ad/ad2bs logic is internal. 
    // We can just trust the library to handle valid dates.
    // Let's assume standard max 32.
    // Better approach:
    // Create a date object and check last day.
    // Hardcoded array for 2081 as fallback if library fails in some envs? 
    // No, reliance on library is preferred.
    // We will just try to render 32 days and dim invalid ones?
    // No, let's find the last day.
    // We can try:
    // new NepaliDate(year, month, 32) -> if month changes, it was 31 or less.
    for (let d = 32; d >= 29; d--) {
        try {
            const date = new NepaliDate(year, month, d);
            if (date.getMonth() === month) return d;
        } catch (e) {}
    }
    return 30; // Fallback
  };

  const changeMonth = (offset: number) => {
    let newMonth = viewMonth + offset;
    let newYear = viewYear;
    if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    } else if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    }
    setViewMonth(newMonth);
    setViewYear(newYear);
  };

  const handleDateSelect = (day: number) => {
    const formattedMonth = String(viewMonth + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const delimiter = format.includes('/') ? '/' : '-';
    const dateString = `${viewYear}${delimiter}${formattedMonth}${delimiter}${formattedDay}`;
    onChange(dateString);
    setShowCalendar(false);
  };

  const renderCalendar = () => {
    const firstDayOfMonth = new NepaliDate(viewYear, viewMonth, 1);
    // getDay() returns 0 for Sunday, 1 for Monday...
    const startDayIndex = firstDayOfMonth.getDay(); 
    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    
    const days = [];
    // Empty cells for days before start
    for (let i = 0; i < startDayIndex; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8" />);
    }
    
    // Days
    for (let i = 1; i <= daysInMonth; i++) {
      const isSelected = selectedYear === viewYear && selectedMonth === viewMonth && selectedDay === i;
      const isToday = false; // Could check against new NepaliDate()
      
      days.push(
        <button
          key={i}
          onClick={(e) => { e.preventDefault(); handleDateSelect(i); }}
          className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors
            ${isSelected ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-blue-50 text-slate-700'}
            ${isToday ? 'border border-blue-600' : ''}
          `}
        >
          {i}
        </button>
      );
    }

    return (
      <div 
        id="nepali-calendar-portal"
        className="fixed z-[9999] bg-white rounded-xl shadow-xl border border-slate-200 p-4 w-72 animate-in fade-in zoom-in-95 duration-100"
        style={{ top: dropdownPosition.top, left: dropdownPosition.left }}
      >
        <div className="flex items-center justify-between mb-4">
          <button onClick={(e) => { e.preventDefault(); changeMonth(-1); }} className="p-1 hover:bg-slate-100 rounded-lg text-slate-500">
            <ChevronLeft size={20} />
          </button>
          <div className="font-bold text-slate-800">
            {NEPALI_MONTHS[viewMonth]} {viewYear}
          </div>
          <button onClick={(e) => { e.preventDefault(); changeMonth(1); }} className="p-1 hover:bg-slate-100 rounded-lg text-slate-500">
            <ChevronRight size={20} />
          </button>
        </div>
        
        <div className="grid grid-cols-7 gap-1 mb-2">
          {WEEK_DAYS.map(day => (
            <div key={day} className="text-center text-xs font-bold text-slate-400">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {days}
        </div>
      </div>
    );
  };

  return (
    <div className={`relative ${wrapperClassName}`} ref={containerRef}>
      {label && <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</label>}
      <div 
        className="relative cursor-pointer"
        onClick={() => !disabled && setShowCalendar(!showCalendar)}
      >
        <input
          ref={inputRef}
          type="text"
          readOnly
          required={required}
          disabled={disabled}
          value={value}
          className={`w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold bg-white text-slate-700 cursor-pointer ${inputClassName} ${disabled ? 'bg-slate-100 cursor-not-allowed' : ''}`}
          placeholder="YYYY-MM-DD"
        />
        {!hideIcon && (
          <CalendarIcon 
            size={18} 
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" 
          />
        )}
      </div>

      {showCalendar && createPortal(renderCalendar(), document.body)}
    </div>
  );
};
