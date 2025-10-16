import React, { useState, useRef, useEffect } from "react";
import { ethiopicToGregorian, gregorianToEthiopic } from "./convert";
import { isEthiopianLeap } from "./utils";
import { format } from "./format";
import { monthNames, weekdayNames } from "./i18n";
export * from "./types";
export * from "./convert";
export * from "./format";
export { monthNames, weekdayNames } from "./i18n";
export { isGregorianLeap, isEthiopianLeap } from "./utils";

interface EthiopianDate {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

interface EthiopianDateTimePickerProps {
  value?: Date | string;
  onChange?: (date: Date) => void;
  preferredLanguage?: string
}


const EthiopianDateTimePicker: React.FC<EthiopianDateTimePickerProps> = ({
  value,
  onChange,
  preferredLanguage
}) => {
  const currentLanguage = (preferredLanguage === "or" ? "om" : (preferredLanguage || "en")) as keyof typeof monthNames;

  const initialDate =
    value instanceof Date ? value : new Date(value || Date.now());

  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
  const [ethiopianDate, setEthiopianDate] = useState<EthiopianDate>(
    gregorianToEthiopic(initialDate)
  );
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [view, setView] = useState<"calendar" | "month" | "year">("calendar");

  const popupRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLDivElement | null>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setView("calendar");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getDaysInMonth = (month: number, year: number) =>
    month === 13 ? (isEthiopianLeap(year) ? 6 : 5) : 30;

  const handleDayClick = (day: number) => {
    const newEthDate = { ...ethiopianDate, day };
    updateDate(newEthDate);
  };

  const handleTimeChange = (field: keyof EthiopianDate, value: number) => {
    const newEthDate = { ...ethiopianDate, [field]: value };
    updateDate(newEthDate);
  };

  const toggleAMPM = (type: "AM" | "PM") => {
    let h = ethiopianDate.hour;
    if (type === "AM" && h >= 12) h -= 12;
    if (type === "PM" && h < 12) h += 12;
    handleTimeChange("hour", h);
  };

  const updateDate = (newEthDate: EthiopianDate) => {
    const newGregorian = ethiopicToGregorian(newEthDate);
    setEthiopianDate(newEthDate);
    setSelectedDate(newGregorian);
    onChange?.(newGregorian);
  };

  const handleMonthSelect = (monthIndex: number) => {
    updateDate({
      ...ethiopianDate,
      month: monthIndex + 1,
    });
    setView("calendar");
  };

  const handleYearSelect = (year: number) => {
    updateDate({
      ...ethiopianDate,
      year,
    });
    setView("calendar");
  };

  const formattedDate = format(ethiopianDate, {
    locale: currentLanguage as any,
    weekday: "short",
    includeTime: true,
    timeFormat: "12h",
  });

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i);
  const ampm = ethiopianDate.hour >= 12 ? "PM" : "AM";
  const totalDays = getDaysInMonth(ethiopianDate.month, ethiopianDate.year);

  // Compute first day index
  const getFirstDayOfMonth = (): number => {
    const firstDay = { ...ethiopianDate, day: 1 };
    const gregorianFirstDay = ethiopicToGregorian(firstDay);
    return gregorianFirstDay.getDay();
  };

  const firstDayIndex = getFirstDayOfMonth();

  // Year range and months
  const yearRange = Array.from(
    { length: 21 },
    (_, i) => ethiopianDate.year - 10 + i
  );

  const ethiopianMonths = monthNames[currentLanguage] || monthNames["en"];
  const weekdays = weekdayNames[currentLanguage]?.short || weekdayNames["en"].short;

  return (
    <div className="relative font-sans">
      {/* Display selected date */}
      <div
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between px-4 py-2.5 rounded-lg border border-gray-300 bg-white shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer min-w-[260px] hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
      >
        <span className="text-gray-800 font-medium text-[12px]">
          {formattedDate}
        </span>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      {/* Popup Calendar */}
      {isOpen && (
        <div
          ref={popupRef}
          className="absolute z-50 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl flex w-[440px] h-[380px] overflow-hidden top-full left-0"
        >
          {/* Calendar Section */}
          <div className="w-[60%] flex flex-col border-r border-gray-100 p-4">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              {/* Previous */}
              <button
                onClick={() => {
                  if (view === "calendar") {
                    updateDate({
                      ...ethiopianDate,
                      month:
                        ethiopianDate.month === 1 ? 13 : ethiopianDate.month - 1,
                      year:
                        ethiopianDate.month === 1
                          ? ethiopianDate.year - 1
                          : ethiopianDate.year,
                    });
                  }
                }}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-150 text-gray-600 hover:text-gray-800"
                disabled={view !== "calendar"}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Month / Year Select */}
              <div className="flex gap-2">
                <button
                  onClick={() => setView("month")}
                  className="px-3 py-1 rounded-lg hover:bg-gray-100 transition-colors duration-150 text-base font-semibold text-gray-800 hover:text-blue-600"
                >
                  {ethiopianMonths[ethiopianDate.month - 1]}
                </button>
                <button
                  onClick={() => setView("year")}
                  className="px-3 py-1 rounded-lg hover:bg-gray-100 transition-colors duration-150 text-base font-semibold text-gray-800 hover:text-blue-600"
                >
                  {ethiopianDate.year}
                </button>
              </div>

              {/* Next */}
              <button
                onClick={() => {
                  if (view === "calendar") {
                    updateDate({
                      ...ethiopianDate,
                      month:
                        ethiopianDate.month === 13 ? 1 : ethiopianDate.month + 1,
                      year:
                        ethiopianDate.month === 13
                          ? ethiopianDate.year + 1
                          : ethiopianDate.year,
                    });
                  }
                }}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-150 text-gray-600 hover:text-gray-800"
                disabled={view !== "calendar"}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Month Selection */}
            {view === "month" && (
              <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-3 gap-2">
                  {ethiopianMonths.map((month, index) => (
                    <button
                      key={index}
                      onClick={() => handleMonthSelect(index)}
                      className={`p-3 rounded-lg text-[10px] font-medium transition-all duration-150 text-center ${
                        ethiopianDate.month === index + 1
                          ? "bg-blue-500 text-white shadow-sm"
                          : "text-gray-700 hover:bg-blue-50 hover:text-blue-700 border border-gray-200"
                      }`}
                    >
                      {month}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Year Selection */}
            {view === "year" && (
              <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-3 gap-2">
                  {yearRange.map((year) => (
                    <button
                      key={year}
                      onClick={() => handleYearSelect(year)}
                      className={`p-3 rounded-lg text-[12px] font-medium transition-all duration-150 text-center ${
                        ethiopianDate.year === year
                          ? "bg-blue-500 text-white shadow-sm"
                          : "text-gray-700 hover:bg-blue-50 hover:text-blue-700 border border-gray-200"
                      }`}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Calendar Days */}
            {view === "calendar" && (
              <>
                <div className="grid grid-cols-7 text-xs font-medium text-gray-600 mb-2">
                  {weekdays.map((w, i) => {
                    const isWeekend = i === 5 || i === 6;
                    return (
                      <div
                        key={i}
                        className={`text-center py-1.5 ${
                          isWeekend ? "text-red-500" : "text-gray-600"
                        }`}
                      >
                        {w}
                      </div>
                    );
                  })}
                </div>

                <div className="grid grid-cols-7 gap-1 text-[12px] flex-1">
                  {Array.from({ length: firstDayIndex }, (_, i) => (
                    <div key={`empty-${i}`} className="w-8 h-8" />
                  ))}

                  {Array.from({ length: totalDays }, (_, i) => i + 1).map((d) => {
                    const dayIndex = (firstDayIndex + d - 1) % 7;
                    const isWeekend = dayIndex === 5 || dayIndex === 6;
                    const isSelected = d === ethiopianDate.day;

                    return (
                      <button
                        key={d}
                        onClick={() => handleDayClick(d)}
                        className={`w-8 h-8 rounded-lg text-[12px] font-medium transition-all duration-150 ${
                          isSelected
                            ? isWeekend
                              ? "bg-red-500 text-white shadow-sm"
                              : "bg-blue-500 text-white shadow-sm"
                            : isWeekend
                            ? "text-red-600 hover:bg-red-50 hover:text-red-700"
                            : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                        }`}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Time Picker */}
          <div className="w-[40%] flex flex-col p-4 bg-gray-50">
            <div className="text-[12px] font-semibold text-gray-700 mb-3 text-center">
              Time
            </div>

            <div className="flex gap-3 justify-center items-start">
              {/* Hour */}
              <div className="flex flex-col items-center">
                <label className="text-xs text-gray-500 mb-2">Hour</label>
                <div className="h-48 overflow-y-auto border border-gray-300 rounded-lg w-12 bg-white scrollbar-thin">
                  {hours.map((h) => (
                    <div
                      key={h}
                      onClick={() =>
                        handleTimeChange(
                          "hour",
                          ampm === "PM" ? (h % 12) + 12 : h % 12
                        )
                      }
                      className={`py-2 cursor-pointer text-[12px] text-center transition-colors duration-150 ${
                        (ethiopianDate.hour % 12 || 12) === h
                          ? "bg-blue-500 text-white font-medium"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {String(h).padStart(2, "0")}
                    </div>
                  ))}
                </div>
              </div>

              {/* Minute */}
              <div className="flex flex-col items-center">
                <label className="text-xs text-gray-500 mb-2">Minute</label>
                <div className="h-48 overflow-y-auto border border-gray-300 rounded-lg w-12 bg-white scrollbar-thin">
                  {minutes.map((m) => (
                    <div
                      key={m}
                      onClick={() => handleTimeChange("minute", m)}
                      className={`py-2 cursor-pointer text-[12px] text-center transition-colors duration-150 ${
                        ethiopianDate.minute === m
                          ? "bg-blue-500 text-white font-medium"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {String(m).padStart(2, "0")}
                    </div>
                  ))}
                </div>
              </div>

              {/* AM/PM */}
              <div className="flex flex-col items-center">
                <label className="text-xs text-gray-500 mb-2">AM/PM</label>
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => toggleAMPM("AM")}
                    className={`px-3 py-2 rounded-lg text-[12px] font-medium transition-colors duration-150 ${
                      ampm === "AM"
                        ? "bg-blue-500 text-white shadow-sm"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    AM
                  </button>
                  <button
                    onClick={() => toggleAMPM("PM")}
                    className={`px-3 py-2 rounded-lg text-[12px] font-medium transition-colors duration-150 ${
                      ampm === "PM"
                        ? "bg-blue-500 text-white shadow-sm"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    PM
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EthiopianDateTimePicker;
