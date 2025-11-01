import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
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
  name?: string;
  value?: string; // ISO string or empty string
  onChange?: (event: { target: { name?: string; value: string; valueAsDate: Date | null } }) => void;
  preferredLanguage?: string;
}

const EthiopianDateTimePicker: React.FC<EthiopianDateTimePickerProps> = ({
  name,
  value,
  onChange,
  preferredLanguage,
}) => {
  const currentLanguage = (
    preferredLanguage === "or" ? "om" : preferredLanguage || "en"
  ) as keyof typeof monthNames;

  // Parse initial value - handle both string and empty values
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

  // Update when value prop changes
  useEffect(() => {
    const newDate = parseInitialDate();
    setSelectedDate(newDate);
    if (newDate) {
      setEthiopianDate(gregorianToEthiopic(newDate));
    }
  }, [value]);

  // Close popup on outside click
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

  const updateDate = useCallback((newEthDate: EthiopianDate) => {
    const newGregorian = ethiopicToGregorian(newEthDate);
    setEthiopianDate(newEthDate);
    setSelectedDate(newGregorian);
    
    // Emit onChange event in the same format as native input
    if (onChange) {
      onChange({
        target: {
          name,
          value: newGregorian.toISOString(),
          valueAsDate: newGregorian,
        },
      });
    }
  }, [onChange, name]);

  const handleDayClick = useCallback((day: number) => {
    const newEthDate = { ...ethiopianDate, day };
    updateDate(newEthDate);
  }, [ethiopianDate, updateDate]);

  const handleMonthSelect = useCallback((monthIndex: number) => {
    updateDate({ ...ethiopianDate, month: monthIndex + 1 });
    setView("calendar");
  }, [ethiopianDate, updateDate]);

  const handleYearSelect = useCallback((year: number) => {
    updateDate({ ...ethiopianDate, year });
    setView("calendar");
  }, [ethiopianDate, updateDate]);

  const handleTimeChange = useCallback((field: keyof EthiopianDate, value: number) => {
    const newEthDate = { ...ethiopianDate, [field]: value };
    updateDate(newEthDate);
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
        includeTime: true,
        timeFormat: "12h",
      })
    : "|--|--|----|📅", [selectedDate, ethiopianDate, currentLanguage]);

  const hours = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);
  const minutes = useMemo(() => Array.from({ length: 60 }, (_, i) => i), []);
  const ampm = ethiopianDate.hour >= 12 ? "PM" : "AM";
  const totalDays = getDaysInMonth(ethiopianDate.month, ethiopianDate.year);

  const getFirstDayOfMonth = (): number => {
    const firstDay = { ...ethiopianDate, day: 1 };
    const gregorianFirstDay = ethiopicToGregorian(firstDay);
    // Adjust to make Monday (1) the first day instead of Sunday (0)
    // Sunday becomes 6, Monday becomes 0, Tuesday becomes 1, etc.
    return gregorianFirstDay.getDay() === 0 ? 6 : gregorianFirstDay.getDay() - 1;
  };

  const firstDayIndex = getFirstDayOfMonth();
  
  const yearRange = useMemo(() => 
    Array.from({ length: 21 }, (_, i) => ethiopianDate.year - 10 + i),
    [ethiopianDate.year]
  );

  const ethiopianMonths = useMemo(() => 
    monthNames[currentLanguage] || monthNames["en"],
    [currentLanguage]
  );

  // Reorder weekdays to start from Monday (index 1) and end on Sunday (index 0)
  const weekdays = useMemo(() => {
    const weekdaysData = weekdayNames[currentLanguage]?.short || weekdayNames["en"].short;
    // Move Sunday from index 0 to the end: [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
    return [...weekdaysData.slice(1), weekdaysData[0]];
  }, [currentLanguage]);

  // --- Inline styles ---
  const styles: Record<string, React.CSSProperties> = {
    container: { 
      fontFamily: "sans-serif", 
      position: "relative", 
      display: "inline-block" 
    },
    trigger: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "0.625rem 1rem",
      borderRadius: "0.5rem",
      border: "1px solid #d1d5db",
      backgroundColor: "white",
      minWidth: "160px",
      cursor: "pointer",
      transition: "all 0.2s",
    },
    triggerText: { 
      fontSize: "12px", 
      fontWeight: 500, 
      color: "#1f2937" 
    },
    popup: {
      position: "absolute",
      zIndex: 50,
      marginTop: "0.25rem",
      backgroundColor: "white",
      border: "1px solid #e5e7eb",
      borderRadius: "0.75rem",
      boxShadow: "0 10px 15px rgba(0,0,0,0.1)",
      display: "flex",
      width: "440px",
      height: "380px",
      overflow: "hidden",
      top: "100%",
      left: 0,
    },
    calendarSection: {
      width: "60%",
      display: "flex",
      flexDirection: "column",
      borderRight: "1px solid #f3f4f6",
      padding: "1rem",
    },
    timeSection: {
      width: "40%",
      display: "flex",
      flexDirection: "column",
      padding: "1rem",
      backgroundColor: "#f9fafb",
    },
    headerButton: {
      padding: "0.5rem",
      borderRadius: "0.5rem",
      transition: "all 0.15s",
      cursor: "pointer",
      border: "none",
      backgroundColor: "transparent",
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
      backgroundColor: "white",
    },
    selectedDay: {
      backgroundColor: "#3b82f6",
      color: "white",
      boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
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
      textAlign: "center",
    },
    selectedTimeButton: {
      backgroundColor: "#3b82f6",
      color: "white",
      boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
    },
    hiddenInput: {
      display: "none",
    },
  };

  return (
    <div style={styles.container}>
      {/* Hidden native input for form compatibility */}
      <input
        ref={hiddenInputRef}
        type="text"
        name={name}
        value={selectedDate ? selectedDate.toISOString() : ""}
        onChange={() => {}} // Handled by our component
        style={styles.hiddenInput}
      />
      
      {/* Trigger */}
      <div
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        style={styles.trigger}
        role="button"
        tabIndex={0}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={`Ethiopian date picker, selected: ${formattedDate}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
      >
        <span style={styles.triggerText}>{formattedDate}</span>
        <svg
          style={{
            width: 16,
            height: 16,
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
          }}
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

      {/* Popup */}
      {isOpen && (
        <div ref={popupRef} style={styles.popup}>
          {/* Calendar Section */}
          <div style={styles.calendarSection}>
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
              }}
            >
              <button
                type="button"
                onClick={() => {
                  if (view === "calendar") {
                    updateDate({
                      ...ethiopianDate,
                      month:
                        ethiopianDate.month === 1
                          ? 13
                          : ethiopianDate.month - 1,
                      year:
                        ethiopianDate.month === 1
                          ? ethiopianDate.year - 1
                          : ethiopianDate.year,
                    });
                  }
                }}
                style={styles.headerButton}
                aria-label="Previous month"
              >
                ◀
              </button>

              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => setView("month")}
                  style={{ ...styles.headerButton, fontWeight: 600 }}
                  aria-label="Select month"
                >
                  {ethiopianMonths[ethiopianDate.month - 1]}
                </button>
                <button
                  type="button"
                  onClick={() => setView("year")}
                  style={{ ...styles.headerButton, fontWeight: 600 }}
                  aria-label="Select year"
                >
                  {ethiopianDate.year}
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (view === "calendar") {
                    updateDate({
                      ...ethiopianDate,
                      month:
                        ethiopianDate.month === 13
                          ? 1
                          : ethiopianDate.month + 1,
                      year:
                        ethiopianDate.month === 13
                          ? ethiopianDate.year + 1
                          : ethiopianDate.year,
                    });
                  }
                }}
                style={styles.headerButton}
                aria-label="Next month"
              >
                ▶
              </button>
            </div>

            {/* Month view */}
            {view === "month" && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "0.5rem",
                }}
              >
                {ethiopianMonths.map((m, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => handleMonthSelect(i)}
                    style={{
                      ...styles.dayButton,
                      backgroundColor:
                        ethiopianDate.month === i + 1 ? "#3b82f6" : "white",
                      color:
                        ethiopianDate.month === i + 1 ? "white" : "#374151",
                    }}
                    aria-label={`Select ${m}`}
                    aria-selected={ethiopianDate.month === i + 1}
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}

            {/* Year view */}
            {view === "year" && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "0.5rem",
                  overflowY: "auto",
                }}
              >
                {yearRange.map((y) => (
                  <button
                    type="button"
                    key={y}
                    onClick={() => handleYearSelect(y)}
                    style={{
                      ...styles.dayButton,
                      backgroundColor:
                        ethiopianDate.year === y ? "#3b82f6" : "white",
                      color: ethiopianDate.year === y ? "white" : "#374151",
                    }}
                    aria-label={`Select year ${y}`}
                    aria-selected={ethiopianDate.year === y}
                  >
                    {y}
                  </button>
                ))}
              </div>
            )}

            {/* Calendar days */}
            {view === "calendar" && (
              <>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, 1fr)",
                    textAlign: "center",
                    fontSize: "10px",
                    fontWeight: 600,
                    color: "#4b5563",
                    marginBottom: "0.5rem",
                  }}
                >
                  {weekdays.map((w, i) => (
                    <div
                      key={i}
                      style={{ 
                        // Saturday (index 5) and Sunday (index 6) are weekends
                        color: i >= 5 ? "#b91c1c" : "#4b5563",
                      }}
                      aria-label={w}
                    >
                      {w}
                    </div>
                  ))}
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, 1fr)",
                    gap: "0.25rem",
                  }}
                >
                  {Array.from({ length: firstDayIndex }, (_, i) => (
                    <div key={`empty-${i}`} style={{ width: 32, height: 32 }} />
                  ))}
                  {Array.from({ length: totalDays }, (_, i) => i + 1).map(
                    (d) => {
                      const dayIndex = (firstDayIndex + d - 1) % 7;
                      const isWeekend = dayIndex >= 5; // Saturday (5) and Sunday (6) are weekends
                      const isSelected = d === ethiopianDate.day;
                      return (
                        <button
                          type="button"
                          key={d}
                          onClick={() => handleDayClick(d)}
                          style={{
                            ...styles.dayButton,
                            ...(isSelected ? styles.selectedDay : {}),
                            color: isSelected
                              ? "white"
                              : isWeekend
                              ? "#b91c1c"
                              : "#374151",
                          }}
                          aria-label={`Select ${d} ${ethiopianMonths[ethiopianDate.month - 1]} ${ethiopianDate.year}`}
                          aria-selected={isSelected}
                        >
                          {d}
                        </button>
                      );
                    }
                  )}
                </div>
              </>
            )}
          </div>

          {/* Time picker - simplified */}
          <div style={styles.timeSection}>
            <div
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "#374151",
                textAlign: "center",
                marginBottom: "0.75rem",
              }}
            >
              Time
            </div>
            <div
              style={{
                display: "flex",
                gap: "0.75rem",
                justifyContent: "center",
              }}
            >
              {/* Hour */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <label
                  style={{
                    fontSize: "10px",
                    color: "#6b7280",
                    marginBottom: "0.5rem",
                  }}
                >
                  Hour
                </label>
                <div
                  style={{
                    width: 48,
                    height: 192,
                    overflowY: "auto",
                    border: "1px solid #d1d5db",
                    borderRadius: "0.5rem",
                  }}
                >
                  {hours.map((h) => (
                    <div
                      key={h}
                      onClick={() =>
                        handleTimeChange(
                          "hour",
                          ampm === "PM" ? (h % 12) + 12 : h % 12
                        )
                      }
                      style={{
                        ...styles.timeButton,
                        ...((ethiopianDate.hour % 12 || 12) === h
                          ? styles.selectedTimeButton
                          : { backgroundColor: "white", color: "#374151" }),
                      }}
                    >
                      {String(h).padStart(2, "0")}
                    </div>
                  ))}
                </div>
              </div>

              {/* Minute */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <label
                  style={{
                    fontSize: "10px",
                    color: "#6b7280",
                    marginBottom: "0.5rem",
                  }}
                >
                  Minute
                </label>
                <div
                  style={{
                    width: 48,
                    height: 192,
                    overflowY: "auto",
                    border: "1px solid #d1d5db",
                    borderRadius: "0.5rem",
                  }}
                >
                  {minutes.map((m) => (
                    <div
                      key={m}
                      onClick={() => handleTimeChange("minute", m)}
                      style={{
                        ...styles.timeButton,
                        ...(ethiopianDate.minute === m
                          ? styles.selectedTimeButton
                          : { backgroundColor: "white", color: "#374151" }),
                      }}
                    >
                      {String(m).padStart(2, "0")}
                    </div>
                  ))}
                </div>
              </div>

              {/* AM/PM */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <label
                  style={{
                    fontSize: "10px",
                    color: "#6b7280",
                    marginBottom: "0.5rem",
                  }}
                >
                  AM/PM
                </label>
                <button
                  type="button"
                  onClick={() => toggleAMPM("AM")}
                  style={{
                    ...styles.timeButton,
                    ...(ampm === "AM"
                      ? styles.selectedTimeButton
                      : {
                          backgroundColor: "white",
                          color: "#374151",
                          border: "1px solid #d1d5db",
                        }),
                    marginBottom: "0.25rem",
                  }}
                >
                  AM
                </button>
                <button
                  type="button"
                  onClick={() => toggleAMPM("PM")}
                  style={{
                    ...styles.timeButton,
                    ...(ampm === "PM"
                      ? styles.selectedTimeButton
                      : {
                          backgroundColor: "white",
                          color: "#374151",
                          border: "1px solid #d1d5db",
                        }),
                  }}
                >
                  PM
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EthiopianDateTimePicker;