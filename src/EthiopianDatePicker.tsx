import React, { useState, useRef, useEffect } from 'react';
import { EthiopicDate, Locale, EthiopianDateTimePickerOptions } from "./types";
import { gregorianToEthiopic, ethiopicToGregorian } from "./convert";
import { monthNames, weekdayNames } from "./i18n";
import { isEthiopianLeap } from "./utils";

interface EthiopianCalendarPopupProps {
  value?: EthiopicDate;
  onChange?: (date: EthiopicDate) => void;
  locale?: Locale;
  minDate?: Date;
  maxDate?: Date;
  showGregorian?: boolean;
  showTime?: boolean;
  timeFormat?: '12h' | '24h';
  className?: string;
}

const EthiopianCalendarPopup : React.FC<EthiopianCalendarPopupProps> = ({
  value,
  onChange,
  locale = 'en',
  minDate,
  maxDate,
  showGregorian = true,
  showTime = true,
  timeFormat = '24h',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'date' | 'time'>('date');
  const [currentDateTime, setCurrentDateTime] = useState<EthiopicDate>(() => {
    if (value) return value;
    const now = new Date();
    const ethNow = gregorianToEthiopic(now);
    return {
      ...ethNow,
      hour: now.getHours(),
      minute: now.getMinutes(),
      second: now.getSeconds(),
    };
  });

  const popupRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current && 
        !popupRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatEthiopianDateTime = (date: EthiopicDate): string => {
    const monthName = monthNames[locale][date.month - 1];
    let formatted = `${date.day} ${monthName} ${date.year}`;
    
    if (showTime) {
      formatted += ` ${formatTime(date)}`;
    }
    
    return formatted;
  };

  const formatTime = (date: EthiopicDate): string => {
    let hours = date.hour;
    let ampm = '';
    
    if (timeFormat === '12h') {
      ampm = hours >= 12 ? ' PM' : ' AM';
      hours = hours % 12 || 12;
    }
    
    return `${hours.toString().padStart(2, '0')}:${date.minute.toString().padStart(2, '0')}:${date.second.toString().padStart(2, '0')}${ampm}`;
  };

  const formatGregorianDateTime = (ethioDate: EthiopicDate): string => {
    const gregDate = ethiopicToGregorian(ethioDate);
    return gregDate.toISOString().replace('T', ' ').substring(0, 19);
  };

  const getDaysInEthiopianMonth = (month: number, year: number): number => {
    if (month === 13) {
      return isEthiopianLeap(year) ? 6 : 5;
    }
    return 30;
  };

  const calculateEthiopianWeekday = (day: number, month: number, year: number): number => {
    const jdn = (year - 1) * 365 + Math.floor(year / 4) + (month - 1) * 30 + day;
    return jdn % 7;
  };

  const isDateDisabled = (day: number): boolean => {
    const testDate: EthiopicDate = { ...currentDateTime, day };
    const gregorianDate = ethiopicToGregorian(testDate);
    
    if (minDate && gregorianDate < minDate) return true;
    if (maxDate && gregorianDate > maxDate) return true;
    
    return false;
  };

  const navigateMonth = (direction: number) => {
    let newMonth = currentDateTime.month + direction;
    let newYear = currentDateTime.year;
    
    if (newMonth > 13) {
      newMonth = 1;
      newYear++;
    } else if (newMonth < 1) {
      newMonth = 13;
      newYear--;
    }
    
    setCurrentDateTime(prev => ({ ...prev, month: newMonth, year: newYear, day: 1 }));
  };

  const navigateYear = (direction: number) => {
    setCurrentDateTime(prev => ({ ...prev, year: prev.year + direction, day: 1 }));
  };

  const selectDay = (day: number) => {
    const newDateTime = { ...currentDateTime, day };
    setCurrentDateTime(newDateTime);
    onChange?.(newDateTime);
    
    if (!showTime) {
      setIsOpen(false);
    } else {
      setActiveTab('time');
    }
  };

  const selectNow = () => {
    const now = new Date();
    const ethNow = gregorianToEthiopic(now);
    const newDateTime = {
      ...ethNow,
      hour: now.getHours(),
      minute: now.getMinutes(),
      second: now.getSeconds(),
    };
    setCurrentDateTime(newDateTime);
    onChange?.(newDateTime);
  };

  const handleTimeChange = (field: keyof EthiopicDate, value: number) => {
    const newDateTime = { ...currentDateTime, [field]: value };
    setCurrentDateTime(newDateTime);
    onChange?.(newDateTime);
  };

  const generateYearOptions = () => {
    const currentYear = currentDateTime.year;
    const years = [];
    for (let i = currentYear - 10; i <= currentYear + 10; i++) {
      years.push(i);
    }
    return years;
  };

  const renderCalendar = () => {
    const months = monthNames[locale];
    const weekdays = weekdayNames[locale].short;
    const daysInMonth = getDaysInEthiopianMonth(currentDateTime.month, currentDateTime.year);
    const startWeekday = calculateEthiopianWeekday(1, currentDateTime.month, currentDateTime.year);

    const days = [];
    
    // Empty days for alignment
    for (let i = 0; i < startWeekday; i++) {
      days.push(<div key={`empty-${i}`} className="w-8 h-8" />);
    }
    
    // Actual days
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = day === currentDateTime.day;
      const isDisabled = isDateDisabled(day);
      const weekday = (startWeekday + day - 1) % 7;
      const isSunday = weekday === 6;

      days.push(
        <button
          key={day}
          onClick={() => !isDisabled && selectDay(day)}
          disabled={isDisabled}
          className={`
            w-8 h-8 rounded text-sm font-medium transition-colors
            ${isSelected 
              ? 'bg-blue-600 text-white' 
              : isDisabled
              ? 'text-gray-400 cursor-not-allowed'
              : isSunday
              ? 'text-red-500 hover:bg-red-50'
              : 'text-gray-700 hover:bg-blue-500 hover:text-white'
            }
          `}
        >
          {day}
        </button>
      );
    }

    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-1 mb-2">
          <button
            onClick={() => navigateYear(-1)}
            className="p-1 rounded border border-gray-300 bg-white hover:bg-gray-50 text-sm"
          >
            «
          </button>
          <button
            onClick={() => navigateMonth(-1)}
            className="p-1 rounded border border-gray-300 bg-white hover:bg-gray-50 text-sm"
          >
            ‹
          </button>
          
          <select
            value={currentDateTime.month}
            onChange={(e) => setCurrentDateTime(prev => ({ ...prev, month: parseInt(e.target.value), day: 1 }))}
            className="px-2 py-1 rounded border border-gray-300 bg-white text-sm"
          >
            {months.map((month, index) => (
              <option key={index} value={index + 1}>
                {month}
              </option>
            ))}
          </select>
          
          <select
            value={currentDateTime.year}
            onChange={(e) => setCurrentDateTime(prev => ({ ...prev, year: parseInt(e.target.value), day: 1 }))}
            className="px-2 py-1 rounded border border-gray-300 bg-white text-sm"
          >
            {generateYearOptions().map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          
          <button
            onClick={() => navigateMonth(1)}
            className="p-1 rounded border border-gray-300 bg-white hover:bg-gray-50 text-sm"
          >
            ›
          </button>
          <button
            onClick={() => navigateYear(1)}
            className="p-1 rounded border border-gray-300 bg-white hover:bg-gray-50 text-sm"
          >
            »
          </button>
        </div>
        
        <div className="grid grid-cols-7 gap-1 mb-1">
          {weekdays.map((day, index) => (
            <div key={index} className="text-center text-xs font-semibold text-gray-600 py-1">
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

  const renderTimePicker = () => {
    const hours = timeFormat === '12h' 
      ? [...Array(12).keys()].map(h => h + 1)
      : [...Array(24).keys()];
    
    const minutes = [...Array(60).keys()];
    const seconds = [...Array(60).keys()];
    
    const displayHour = timeFormat === '12h' 
      ? (currentDateTime.hour % 12 || 12)
      : currentDateTime.hour;
    
    const ampm = currentDateTime.hour >= 12 ? 'PM' : 'AM';

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-700">Hour</label>
            <select
              value={displayHour}
              onChange={(e) => {
                let hour = parseInt(e.target.value);
                if (timeFormat === '12h') {
                  const currentAmpm = currentDateTime.hour >= 12 ? 'PM' : 'AM';
                  if (currentAmpm === 'PM' && hour < 12) hour += 12;
                  if (currentAmpm === 'AM' && hour === 12) hour = 0;
                }
                handleTimeChange('hour', hour);
              }}
              className="px-2 py-1 rounded border border-gray-300 bg-white text-sm"
            >
              {hours.map(hour => (
                <option key={hour} value={hour}>
                  {hour.toString().padStart(2, '0')}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-700">Minute</label>
            <select
              value={currentDateTime.minute}
              onChange={(e) => handleTimeChange('minute', parseInt(e.target.value))}
              className="px-2 py-1 rounded border border-gray-300 bg-white text-sm"
            >
              {minutes.map(minute => (
                <option key={minute} value={minute}>
                  {minute.toString().padStart(2, '0')}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-700">Second</label>
            <select
              value={currentDateTime.second}
              onChange={(e) => handleTimeChange('second', parseInt(e.target.value))}
              className="px-2 py-1 rounded border border-gray-300 bg-white text-sm"
            >
              {seconds.map(second => (
                <option key={second} value={second}>
                  {second.toString().padStart(2, '0')}
                </option>
              ))}
            </select>
          </div>
          
          {timeFormat === '12h' && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-700">AM/PM</label>
              <select
                value={ampm}
                onChange={(e) => {
                  let hour = currentDateTime.hour;
                  if (e.target.value === 'PM' && hour < 12) {
                    hour += 12;
                  } else if (e.target.value === 'AM' && hour >= 12) {
                    hour -= 12;
                  }
                  handleTimeChange('hour', hour);
                }}
                className="px-2 py-1 rounded border border-gray-300 bg-white text-sm"
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
          )}
        </div>
        
        <div className="text-center text-sm text-gray-600">
          Selected: {formatTime(currentDateTime)}
        </div>
      </div>
    );
  };

  return (
    <div className={`relative ${className}`}>
      {/* Trigger */}
      <div
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded bg-white cursor-pointer hover:bg-gray-50"
      >
        <input
          type="text"
          readOnly
          value={formatEthiopianDateTime(currentDateTime)}
          className="flex-1 bg-transparent outline-none cursor-pointer"
        />
        <span className="text-gray-500">📅</span>
      </div>

      {/* Popup */}
      {isOpen && (
        <div
          ref={popupRef}
          className="absolute top-full left-0 mt-1 z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-4 min-w-80"
        >
          <div className="flex flex-col gap-4">
            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('date')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'date'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Date
              </button>
              {showTime && (
                <button
                  onClick={() => setActiveTab('time')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'time'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Time
                </button>
              )}
            </div>

            {/* Content */}
            <div className="min-h-48">
              {activeTab === 'date' ? renderCalendar() : renderTimePicker()}
            </div>

            {/* Gregorian Display */}
            {showGregorian && (
              <div className="text-xs text-gray-500 text-center border-t pt-2">
                Gregorian: {formatGregorianDateTime(currentDateTime)}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-between pt-2 border-t">
              <button
                onClick={selectNow}
                className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                Now
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EthiopianCalendarPopup;