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
  preferredLanguage?: string;
}

const EthiopianDateTimePicker: React.FC<EthiopianDateTimePickerProps> = ({
  value,
  onChange,
  preferredLanguage,
}) => {
  const currentLanguage = (
    preferredLanguage === "or" ? "om" : preferredLanguage || "en"
  ) as keyof typeof monthNames;

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

  const updateDate = (newEthDate: EthiopianDate) => {
    const newGregorian = ethiopicToGregorian(newEthDate);
    setEthiopianDate(newEthDate);
    setSelectedDate(newGregorian);
    onChange?.(newGregorian);
  };

  const handleDayClick = (day: number) => {
    const newEthDate = { ...ethiopianDate, day };
    updateDate(newEthDate);
  };

  const handleMonthSelect = (monthIndex: number) => {
    updateDate({ ...ethiopianDate, month: monthIndex + 1 });
    setView("calendar");
  };

  const handleYearSelect = (year: number) => {
    updateDate({ ...ethiopianDate, year });
    setView("calendar");
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

  const getFirstDayOfMonth = (): number => {
    const firstDay = { ...ethiopianDate, day: 1 };
    return ethiopicToGregorian(firstDay).getDay();
  };

  const firstDayIndex = getFirstDayOfMonth();
  const yearRange = Array.from(
    { length: 21 },
    (_, i) => ethiopianDate.year - 10 + i
  );
  const ethiopianMonths = monthNames[currentLanguage] || monthNames["en"];
  const weekdays =
    weekdayNames[currentLanguage]?.short || weekdayNames["en"].short;

  // --- Inline styles ---
  const styles: Record<string, React.CSSProperties> = {
    container: { fontFamily: "sans-serif", position: "relative" },
    trigger: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "0.625rem 1rem",
      borderRadius: "0.5rem",
      border: "1px solid #d1d5db",
      backgroundColor: "white",
      minWidth: "260px",
      cursor: "pointer",
      transition: "all 0.2s",
    },
    triggerText: { fontSize: "12px", fontWeight: 500, color: "#1f2937" },
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
    },
    dayButton: {
      width: "2rem",
      height: "2rem",
      borderRadius: "0.5rem",
      fontSize: "12px",
      fontWeight: 500,
      transition: "all 0.15s",
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
    },
    selectedTimeButton: {
      backgroundColor: "#3b82f6",
      color: "white",
      boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
    },
  };

  return (
    <div style={styles.container}>
      {/* Trigger */}
      <div
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        style={styles.trigger}
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
          {/* Calendar */}
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
              >
                ◀
              </button>

              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => setView("month")}
                  style={{ ...styles.headerButton, fontWeight: 600 }}
                >
                  {ethiopianMonths[ethiopianDate.month - 1]}
                </button>
                <button
                  type="button"
                  onClick={() => setView("year")}
                  style={{ ...styles.headerButton, fontWeight: 600 }}
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
                      style={{ color: i >= 5 ? "#b91c1c" : "#4b5563" }}
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
                      const isWeekend = dayIndex >= 5;
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

          {/* Time picker */}
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
                        ...(ethiopianDate.hour % 12 || 12 === h
                          ? styles.selectedTimeButton
                          : {}),
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
                          : {}),
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
