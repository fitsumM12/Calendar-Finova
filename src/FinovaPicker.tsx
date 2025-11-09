import { useState, useRef, useEffect, useMemo, useCallback } from "react";
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
  ampm: string;
}

interface EthiopianDateTimePickerProps {
  name?: string;
  value?: string;
  onChange?: (event: { target: { name?: string; value: string; valueAsDate: Date | null } }) => void;
  preferredLanguage?: string;
  disabled?: boolean;
  minDate?: string;
  maxDate?: string;
  showTime?: boolean;
}

const EthiopianDateTimePicker: React.FC<EthiopianDateTimePickerProps> = ({
  name,
  value,
  onChange,
  preferredLanguage,
  disabled = false,
  minDate,
  maxDate,
  showTime = true,
}) => {
  const currentLanguage = (
    preferredLanguage === "or" ? "om" : preferredLanguage || "en"
  ) as keyof typeof monthNames;

  const parseInitialDate = (): Date | null => {
    if (!value) return null;
    try {
      return new Date(value);
    } catch {
      return null;
    }
  };

  const initialDate = parseInitialDate() || new Date();

  const [selectedDate, setSelectedDate] = useState<Date | null>(parseInitialDate());
  const [ethiopianDate, setEthiopianDate] = useState<EthiopianDate>(
    selectedDate ? gregorianToEthiopic(initialDate) : gregorianToEthiopic(new Date())
  );
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [view, setView] = useState<"calendar" | "month" | "year">("calendar");

  const popupRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const hiddenInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const newDate = parseInitialDate();
    setSelectedDate(newDate);
    if (newDate) setEthiopianDate(gregorianToEthiopic(newDate));
  }, [value]);

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

  // Helper functions for date validation
  const isDateDisabled = useCallback((ethDate: EthiopianDate): boolean => {
    const date = ethiopicToGregorian(ethDate);

    if (minDate) {
      const min = new Date(minDate);
      if (date < min) return true;
    }

    if (maxDate) {
      const max = new Date(maxDate);
      if (date > max) return true;
    }

    return false;
  }, [minDate, maxDate]);

  const isDayDisabled = useCallback((day: number): boolean => {
    const testDate = { ...ethiopianDate, day };
    return isDateDisabled(testDate);
  }, [ethiopianDate, isDateDisabled]);

  const isMonthDisabled = useCallback((monthIndex: number): boolean => {
    // Test with first day of the month
    const testDate = { ...ethiopianDate, month: monthIndex + 1, day: 1 };
    return isDateDisabled(testDate);
  }, [ethiopianDate, isDateDisabled]);

  const isYearDisabled = useCallback((year: number): boolean => {
    // Test with first day of first month
    const testDate = { ...ethiopianDate, year, month: 1, day: 1 };
    return isDateDisabled(testDate);
  }, [ethiopianDate, isDateDisabled]);

  const updateDate = useCallback((newEthDate: EthiopianDate) => {
    if (disabled) return;

    const newGregorian = ethiopicToGregorian(newEthDate);

    // Validate against min/max dates
    if (minDate && newGregorian < new Date(minDate)) return;
    if (maxDate && newGregorian > new Date(maxDate)) return;

    setEthiopianDate(newEthDate);
    setSelectedDate(newGregorian);

    if (onChange) {
      onChange({
        target: {
          name,
          value: newGregorian.toISOString(),
          valueAsDate: newGregorian,
        },
      });
    }
  }, [onChange, name, disabled, minDate, maxDate]);

  const handleDayClick = useCallback((day: number) => {
    if (isDayDisabled(day)) return;
    updateDate({ ...ethiopianDate, day });
  }, [ethiopianDate, updateDate, isDayDisabled]);

  const handleMonthSelect = useCallback((monthIndex: number) => {
    if (isMonthDisabled(monthIndex)) return;
    updateDate({ ...ethiopianDate, month: monthIndex + 1 });
    setView("calendar");
  }, [ethiopianDate, updateDate, isMonthDisabled]);

  const handleYearSelect = useCallback((year: number) => {
    if (isYearDisabled(year)) return;
    updateDate({ ...ethiopianDate, year });
    setView("calendar");
  }, [ethiopianDate, updateDate, isYearDisabled]);

  const handleTimeChange = useCallback((field: keyof EthiopianDate, value: number) => {
    updateDate({ ...ethiopianDate, [field]: value });
  }, [ethiopianDate, updateDate]);

  const toggleAMPM = useCallback((type: "AM" | "PM") => {
    let h = ethiopianDate.hour;
    if (type === "AM" && h >= 12) h -= 12;
    if (type === "PM" && h < 12) h += 12;
    handleTimeChange("hour", h);
  }, [ethiopianDate.hour, handleTimeChange]);

  const formattedDate = useMemo(() => selectedDate
    ? format(ethiopianDate, {
      locale: currentLanguage as any,
      weekday: "short",
      includeTime: showTime,
      timeFormat: "12h",
    })
    : "|--|--|----|📅", [selectedDate, ethiopianDate, currentLanguage, showTime]);

  const hours = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);
  const minutes = useMemo(() => Array.from({ length: 60 }, (_, i) => i), []);
  const ampm = ethiopianDate.hour >= 12 ? "PM" : "AM";
  const totalDays = getDaysInMonth(ethiopianDate.month, ethiopianDate.year);

  const getFirstDayOfMonth = (): number => {
    const firstDay = { ...ethiopianDate, day: 1 };
    const gregorianFirstDay = ethiopicToGregorian(firstDay);
    const jsDay = gregorianFirstDay.getDay();
    return jsDay === 0 ? 6 : jsDay - 1;
  };
  const firstDayIndex = getFirstDayOfMonth();

  // Enhanced year navigation
  const [yearPage, setYearPage] = useState(0);
  const yearsPerPage = 12;

  const yearRange = useMemo(() => {
    const startYear = ethiopianDate.year - 6 + (yearPage * yearsPerPage);
    return Array.from({ length: yearsPerPage }, (_, i) => startYear + i);
  }, [ethiopianDate.year, yearPage]);

  const ethiopianMonths = useMemo(
    () => monthNames[currentLanguage] || monthNames["en"],
    [currentLanguage]
  );

  const weekdays = useMemo(
    () => weekdayNames[currentLanguage]?.short || weekdayNames["en"].short,
    [currentLanguage]
  );

  const navigateYearPage = useCallback((direction: -1 | 1) => {
    setYearPage(prev => prev + direction);
  }, []);

  const resetYearPage = useCallback(() => {
    setYearPage(0);
  }, []);

  const styles: Record<string, React.CSSProperties> = {
    container: {
      all: "initial",
      fontFamily: "sans-serif",
      position: "relative",
      display: "inline-block",
      direction: "ltr",
    },
    trigger: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "0.625rem 1rem",
      borderRadius: "0.5rem",
      border: "1px solid #d1d5db",
      backgroundColor: disabled ? "#f9fafb" : "white",
      minWidth: "160px",
      cursor: disabled ? "not-allowed" : "pointer",
      transition: "all 0.2s",
      opacity: disabled ? 0.6 : 1
    },
    triggerText: { fontSize: "12px", fontWeight: 500, color: disabled ? "#9ca3af" : "#1f2937" },
    popup: {
      position: "absolute",
      zIndex: 50,
      marginTop: "0.25rem",
      backgroundColor: "white",
      border: "1px solid #e5e7eb",
      borderRadius: "0.75rem",
      boxShadow: "0 10px 15px rgba(0,0,0,0.1)",
      display: "flex",
      width: showTime ? "440px" : "300px",
      height: "380px",
      overflow: "hidden",
      top: "100%",
      left: 0
    },
    calendarSection: {
      width: showTime ? "60%" : "100%",
      display: "flex",
      flexDirection: "column",
      borderRight: showTime ? "1px solid #f3f4f6" : "none",
      padding: "1rem"
    },
    timeSection: {
      width: "40%",
      display: "flex",
      flexDirection: "column",
      padding: "1rem",
      backgroundColor: "#f9fafb"
    },
    headerButton: {
      padding: "0.5rem",
      borderRadius: "0.5rem",
      transition: "all 0.15s",
      cursor: "pointer",
      border: "none",
      backgroundColor: "transparent"
    },
    dayButton: {
      width: "2rem",
      height: "2rem",
      borderRadius: "0.5rem",
      fontSize: "12px",
      fontWeight: 500,
      transition: "all 0.15s",
      border: "none",
      cursor: "pointer",
      backgroundColor: "white"
    },
    disabledButton: {
      opacity: 0.4,
      cursor: "not-allowed",
      backgroundColor: "#f3f4f6",
      color: "#9ca3af"
    },
    selectedDay: {
      backgroundColor: "#3b82f6",
      color: "white",
      boxShadow: "0 1px 2px rgba(0,0,0,0.1)"
    },
    timeButton: {
      padding: "0.25rem 0.5rem",
      borderRadius: "0.5rem",
      fontSize: "12px",
      fontWeight: 500,
      transition: "all 0.15s",
      cursor: "pointer",
      marginBottom: "0.25rem",
      border: "none",
      width: "100%",
      textAlign: "center"
    },
    selectedTimeButton: {
      backgroundColor: "#3b82f6",
      color: "white",
      boxShadow: "0 1px 2px rgba(0,0,0,0.1)"
    },
    hiddenInput: {
      display: "none"
    },
    yearNavigation: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "1rem"
    },
    yearGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: "0.5rem",
      overflowY: "auto"
    }
  };

  const navigateMonth = useCallback((direction: -1 | 1) => {
    if (view === "calendar") {
      let newMonth = ethiopianDate.month + direction;
      let newYear = ethiopianDate.year;

      if (newMonth === 0) {
        newMonth = 13;
        newYear--;
      } else if (newMonth === 14) {
        newMonth = 1;
        newYear++;
      }

      updateDate({
        ...ethiopianDate,
        month: newMonth,
        year: newYear,
      });
    } else if (view === "year") {
      navigateYearPage(direction);
    }
  }, [ethiopianDate, updateDate, view, navigateYearPage]);

  return (
    <div style={styles.container}>
      <input
        ref={hiddenInputRef}
        type="text"
        name={name}
        value={selectedDate ? selectedDate.toISOString() : ""}
        onChange={() => { }}
        style={styles.hiddenInput}
        disabled={disabled}
      />

      {/* Trigger */}
      <div
        ref={triggerRef}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        style={styles.trigger}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-disabled={disabled}
        aria-label={`Ethiopian date picker, selected: ${formattedDate}`}
        onKeyDown={(e) => { if (!disabled && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); setIsOpen(!isOpen); } }}
      >
        <span style={styles.triggerText}>{formattedDate}</span>
        <svg
          style={{
            width: 16,
            height: 16,
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
            opacity: disabled ? 0.5 : 1
          }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Popup */}
      {isOpen && !disabled && (
        <div ref={popupRef} style={styles.popup}>
          {/* Calendar Section */}
          <div style={styles.calendarSection}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <button
                type="button"
                onClick={() => navigateMonth(-1)}
                style={styles.headerButton}
                aria-label={view === "year" ? "Previous years" : "Previous month"}
              >
                ◀
              </button>

              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => { setView("month"); resetYearPage(); }}
                  style={{ ...styles.headerButton, fontWeight: 600 }}
                  aria-label="Select month"
                >
                  {ethiopianMonths[ethiopianDate.month - 1]}
                </button>
                <button
                  type="button"
                  onClick={() => { setView("year"); resetYearPage(); }}
                  style={{ ...styles.headerButton, fontWeight: 600 }}
                  aria-label="Select year"
                >
                  {ethiopianDate.year}
                </button>
              </div>

              <button
                type="button"
                onClick={() => navigateMonth(1)}
                style={styles.headerButton}
                aria-label={view === "year" ? "Next years" : "Next month"}
              >
                ▶
              </button>
            </div>

            {/* Month view */}
            {view === "month" && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem" }}>
                {ethiopianMonths.map((m, i) => {
                  const isDisabled = isMonthDisabled(i);
                  const isSelected = ethiopianDate.month === i + 1;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => !isDisabled && handleMonthSelect(i)}
                      style={{
                        ...styles.dayButton,
                        ...(isDisabled ? styles.disabledButton : {}),
                        backgroundColor: isSelected ? "#3b82f6" : "white",
                        color: isSelected ? "white" : isDisabled ? "#9ca3af" : "#374151",
                        cursor: isDisabled ? "not-allowed" : "pointer",
                      }}
                      aria-label={`Select ${m}`}
                      aria-selected={isSelected}
                      aria-disabled={isDisabled}
                      disabled={isDisabled}
                    >
                      {m}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Year view */}
            {view === "year" && (
              <div style={styles.yearGrid}>

                {yearRange.map((y) => {
                  const isDisabled = isYearDisabled(y);
                  const isSelected = ethiopianDate.year === y;
                  return (
                    <button
                      key={y}
                      type="button"
                      onClick={() => !isDisabled && handleYearSelect(y)}
                      style={{
                        ...styles.dayButton,
                        ...(isDisabled ? styles.disabledButton : {}),
                        backgroundColor: isSelected ? "#3b82f6" : "white",
                        color: isSelected ? "white" : isDisabled ? "#9ca3af" : "#374151",
                        cursor: isDisabled ? "not-allowed" : "pointer",
                      }}
                      aria-label={`Select year ${y}`}
                      aria-selected={isSelected}
                      aria-disabled={isDisabled}
                      disabled={isDisabled}
                    >
                      {y}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Calendar days */}
            {view === "calendar" && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", textAlign: "center", fontSize: "10px", fontWeight: 600, color: "#4b5563", marginBottom: "0.5rem" }}>
                  {weekdays.map((w, i) => (
                    <div key={i} style={{ color: i >= 5 ? "#b91c1c" : "#4b5563" }} aria-label={w}>{w}</div>
                  ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.25rem" }}>
                  {Array.from({ length: firstDayIndex }, (_, i) => (
                    <div key={`empty-${i}`} style={{ width: 32, height: 32 }} />
                  ))}
                  {Array.from({ length: totalDays }, (_, i) => i + 1).map((d) => {
                    const dayIndex = (firstDayIndex + d - 1) % 7;
                    const isWeekend = dayIndex === 5 || dayIndex === 6; // Sat or Sun
                    const isSelected = d === ethiopianDate.day;
                    const isDisabled = isDayDisabled(d);

                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => !isDisabled && handleDayClick(d)}
                        style={{
                          ...styles.dayButton,
                          ...(isDisabled ? styles.disabledButton : {}),
                          ...(isSelected ? styles.selectedDay : {}),
                          color: isSelected ? "white" : isDisabled ? "#9ca3af" : isWeekend ? "#b91c1c" : "#374151",
                          cursor: isDisabled ? "not-allowed" : "pointer",
                        }}
                        aria-label={`Select ${d} ${ethiopianMonths[ethiopianDate.month - 1]} ${ethiopianDate.year}`}
                        aria-selected={isSelected}
                        aria-disabled={isDisabled}
                        disabled={isDisabled}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Time picker - conditionally rendered */}
          {showTime && (
            <div style={styles.timeSection}>
              <div style={{ fontSize: "12px", fontWeight: 600, color: "#374151", textAlign: "center", marginBottom: "0.75rem" }}>Time</div>
              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <label style={{ fontSize: "10px", color: "#6b7280", marginBottom: "0.5rem" }}>Hour</label>
                  <div style={{ width: 48, height: 192, overflowY: "auto", border: "1px solid #d1d5db", borderRadius: "0.5rem" }}>
                    {hours.map((h) => (
                      <div
                        key={h}
                        onClick={() => handleTimeChange("hour", ampm === "PM" ? (h % 12) + 12 : h % 12)}
                        style={{
                          ...styles.timeButton,
                          ...((ethiopianDate.hour % 12 || 12) === h ? styles.selectedTimeButton : { backgroundColor: "white", color: "#374151" }),
                        }}
                      >
                        {String(h).padStart(2, "0")}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <label style={{ fontSize: "10px", color: "#6b7280", marginBottom: "0.5rem" }}>Minute</label>
                  <div style={{ width: 48, height: 192, overflowY: "auto", border: "1px solid #d1d5db", borderRadius: "0.5rem" }}>
                    {minutes.map((m) => (
                      <div
                        key={m}
                        onClick={() => handleTimeChange("minute", m)}
                        style={{
                          ...styles.timeButton,
                          ...(ethiopianDate.minute === m ? styles.selectedTimeButton : { backgroundColor: "white", color: "#374151" }),
                        }}
                      >
                        {String(m).padStart(2, "0")}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <label style={{ fontSize: "10px", color: "#6b7280", marginBottom: "0.5rem" }}>AM/PM</label>
                  <button
                    type="button"
                    onClick={() => toggleAMPM("AM")}
                    style={{
                      ...styles.timeButton,
                      ...(ampm === "AM" ? styles.selectedTimeButton : { backgroundColor: "white", color: "#374151", border: "1px solid #d1d5db" }),
                      marginBottom: "0.25rem"
                    }}
                  >
                    AM
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleAMPM("PM")}
                    style={{
                      ...styles.timeButton,
                      ...(ampm === "PM" ? styles.selectedTimeButton : { backgroundColor: "white", color: "#374151", border: "1px solid #d1d5db" })
                    }}
                  >
                    PM
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EthiopianDateTimePicker;