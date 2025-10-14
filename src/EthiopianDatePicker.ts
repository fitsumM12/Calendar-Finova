import { EthiopicDate, Locale, EthiopianDateTimePickerOptions, EthiopianDateTimePickerInstance } from "./types";
import { gregorianToEthiopic, ethiopicToGregorian } from "./convert";
import { monthNames, weekdayNames } from "./i18n";
import { isEthiopianLeap } from "./utils";
import './ethio-datetime-picker.css';
/**
 * Create an Ethiopian date-time picker instance with full time support
 */
export function createEthiopianDateTimePicker(
  element: HTMLElement,
  options: EthiopianDateTimePickerOptions = {}
): EthiopianDateTimePickerInstance {
  const {
    locale = 'en',
    minDate,
    maxDate,
    showGregorian = true,
    showTime = true,
    timeFormat = '24h',
    autoClose = true,
    defaultTime = { hour: 0, minute: 0, second: 0 }
  } = options;

  let currentDateTime: EthiopicDate = {
    ...gregorianToEthiopic(new Date()),
    hour: defaultTime.hour,
    minute: defaultTime.minute,
    second: defaultTime.second
  };

  let isOpen = false;
  let activeTab: 'date' | 'time' = 'date';

  // Initialize the picker
  function init() {
    renderInput();
    attachEvents();
  }

  function renderInput() {
    const displayText = formatEthiopianDateTime(currentDateTime, locale, showTime, timeFormat);
    element.innerHTML = `
      <div class="ethio-datetime-picker">
        <div class="ethio-datetime-input">
          <input type="text" readonly value="${displayText}" 
                 class="ethio-datetime-display" />
          <button type="button" class="ethio-calendar-toggle">📅</button>
        </div>
        <div class="ethio-datetime-popup" style="display: none;">
          ${renderDateTimePicker()}
        </div>
      </div>
    `;
  }

  function renderDateTimePicker(): string {
    return `
      <div class="ethio-datetime-container">
        <div class="ethio-tabs">
          <button class="ethio-tab ${activeTab === 'date' ? 'ethio-tab-active' : ''}" 
                  data-tab="date">Date</button>
          ${showTime ? `
            <button class="ethio-tab ${activeTab === 'time' ? 'ethio-tab-active' : ''}" 
                    data-tab="time">Time</button>
          ` : ''}
        </div>
        
        <div class="ethio-tab-content">
          ${activeTab === 'date' ? renderCalendar() : ''}
          ${activeTab === 'time' ? renderTimePicker() : ''}
        </div>
        
        ${showGregorian ? `
          <div class="ethio-gregorian-display">
            ${formatGregorianDateTime(currentDateTime)}
          </div>
        ` : ''}
        
        <div class="ethio-datetime-actions">
          <button class="ethio-now-btn" type="button">Now</button>
          <button class="ethio-close-btn" type="button">Close</button>
        </div>
      </div>
    `;
  }

  function renderCalendar(): string {
    const months = monthNames[locale];
    const weekdays = weekdayNames[locale].short;
    const daysInMonth = getDaysInEthiopianMonth(currentDateTime.month, currentDateTime.year);
    
    return `
      <div class="ethio-calendar">
        <div class="ethio-calendar-header">
          <button class="ethio-nav ethio-prev-year" type="button">«</button>
          <button class="ethio-nav ethio-prev-month" type="button">‹</button>
          <select class="ethio-month-select">
            ${months.map((month, index) => 
              `<option value="${index + 1}" ${currentDateTime.month === index + 1 ? 'selected' : ''}>
                ${month}
              </option>`
            ).join('')}
          </select>
          <select class="ethio-year-select">
            ${generateYearOptions().join('')}
          </select>
          <button class="ethio-nav ethio-next-month" type="button">›</button>
          <button class="ethio-nav ethio-next-year" type="button">»</button>
        </div>
        
        <div class="ethio-weekdays">
          ${weekdays.map(day => `<div class="ethio-weekday">${day}</div>`).join('')}
        </div>
        
        <div class="ethio-days-grid">
          ${generateDaysGrid().join('')}
        </div>
      </div>
    `;
  }

  function renderTimePicker(): string {
    const hours = timeFormat === '12h' 
      ? [...Array(12).keys()].map(h => h + 1) // 1-12 for 12h format
      : [...Array(24).keys()]; // 0-23 for 24h format
    
    const minutes = [...Array(60).keys()];
    const seconds = [...Array(60).keys()];
    
    const displayHour = timeFormat === '12h' 
      ? (currentDateTime.hour % 12 || 12)
      : currentDateTime.hour;
    
    const ampm = currentDateTime.hour >= 12 ? 'PM' : 'AM';

    return `
      <div class="ethio-time-picker">
        <div class="ethio-time-section">
          <label class="ethio-time-label">Hour</label>
          <select class="ethio-hour-select">
            ${hours.map(hour => `
              <option value="${timeFormat === '12h' ? (hour === 12 ? 0 : hour) : hour}" 
                      ${displayHour === hour ? 'selected' : ''}>
                ${hour.toString().padStart(2, '0')}
              </option>
            `).join('')}
          </select>
        </div>
        
        <div class="ethio-time-section">
          <label class="ethio-time-label">Minute</label>
          <select class="ethio-minute-select">
            ${minutes.map(minute => `
              <option value="${minute}" ${currentDateTime.minute === minute ? 'selected' : ''}>
                ${minute.toString().padStart(2, '0')}
              </option>
            `).join('')}
          </select>
        </div>
        
        <div class="ethio-time-section">
          <label class="ethio-time-label">Second</label>
          <select class="ethio-second-select">
            ${seconds.map(second => `
              <option value="${second}" ${currentDateTime.second === second ? 'selected' : ''}>
                ${second.toString().padStart(2, '0')}
              </option>
            `).join('')}
          </select>
        </div>
        
        ${timeFormat === '12h' ? `
          <div class="ethio-time-section">
            <label class="ethio-time-label">AM/PM</label>
            <select class="ethio-ampm-select">
              <option value="AM" ${ampm === 'AM' ? 'selected' : ''}>AM</option>
              <option value="PM" ${ampm === 'PM' ? 'selected' : ''}>PM</option>
            </select>
          </div>
        ` : ''}
        
        <div class="ethio-current-time">
          Selected: ${formatTime(currentDateTime, timeFormat)}
        </div>
      </div>
    `;
  }

  function generateYearOptions(): string[] {
    const currentYear = currentDateTime.year;
    const years = [];
    for (let i = currentYear - 10; i <= currentYear + 10; i++) {
      years.push(`
        <option value="${i}" ${currentDateTime.year === i ? 'selected' : ''}>
          ${i}
        </option>
      `);
    }
    return years;
  }

  function generateDaysGrid(): string[] {
    const daysInMonth = getDaysInEthiopianMonth(currentDateTime.month, currentDateTime.year);
    const days = [];
    
    const startWeekday = calculateEthiopianWeekday(1, currentDateTime.month, currentDateTime.year);
    
    for (let i = 0; i < startWeekday; i++) {
      days.push('<div class="ethio-day ethio-day-empty"></div>');
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = day === currentDateTime.day;
      const isDisabled = isDateDisabled(day);
      const weekday = (startWeekday + day - 1) % 7;
      
      days.push(`
        <div class="ethio-day 
                    ${isSelected ? 'ethio-day-selected' : ''} 
                    ${isDisabled ? 'ethio-day-disabled' : ''}
                    ${weekday === 6 ? 'ethio-day-sunday' : ''}" 
             data-day="${day}">
          ${day}
        </div>
      `);
    }
    
    return days;
  }

  function calculateEthiopianWeekday(day: number, month: number, year: number): number {
    const jdn = (year - 1) * 365 + Math.floor(year / 4) + (month - 1) * 30 + day;
    return jdn % 7;
  }

  function getDaysInEthiopianMonth(month: number, year: number): number {
    if (month === 13) {
      return isEthiopianLeap(year) ? 6 : 5;
    }
    return 30;
  }

  function isDateDisabled(day: number): boolean {
    const testDate: EthiopicDate = { ...currentDateTime, day };
    const gregorianDate = ethiopicToGregorian(testDate);
    
    if (minDate && gregorianDate < minDate) return true;
    if (maxDate && gregorianDate > maxDate) return true;
    
    return false;
  }

  function formatEthiopianDateTime(
    date: EthiopicDate, 
    locale: Locale, 
    includeTime: boolean = true, 
    timeFormat: '12h' | '24h' = '24h'
  ): string {
    const monthName = monthNames[locale][date.month - 1];
    let formatted = `${date.day} ${monthName} ${date.year}`;
    
    if (includeTime) {
      formatted += ` ${formatTime(date, timeFormat)}`;
    }
    
    return formatted;
  }

  function formatTime(date: EthiopicDate, timeFormat: '12h' | '24h' = '24h'): string {
    let hours = date.hour;
    let ampm = '';
    
    if (timeFormat === '12h') {
      ampm = hours >= 12 ? ' PM' : ' AM';
      hours = hours % 12 || 12;
    }
    
    return `${hours.toString().padStart(2, '0')}:${date.minute.toString().padStart(2, '0')}:${date.second.toString().padStart(2, '0')}${ampm}`;
  }

  function formatGregorianDateTime(ethioDate: EthiopicDate): string {
    const gregDate = ethiopicToGregorian(ethioDate);
    return gregDate.toISOString().replace('T', ' ').substring(0, 19);
  }

  function attachEvents() {
    const toggleBtn = element.querySelector('.ethio-calendar-toggle') as HTMLButtonElement;
    const popup = element.querySelector('.ethio-datetime-popup') as HTMLDivElement;
    
    toggleBtn.addEventListener('click', togglePicker);
    
    // Tab switching
    element.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      
      if (target.classList.contains('ethio-tab')) {
        const tab = target.getAttribute('data-tab') as 'date' | 'time';
        switchTab(tab);
      }
    });
    
    // Calendar navigation
    element.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      
      if (target.classList.contains('ethio-prev-year')) {
        navigateYear(-1);
      } else if (target.classList.contains('ethio-next-year')) {
        navigateYear(1);
      } else if (target.classList.contains('ethio-prev-month')) {
        navigateMonth(-1);
      } else if (target.classList.contains('ethio-next-month')) {
        navigateMonth(1);
      } else if (target.classList.contains('ethio-day') && !target.classList.contains('ethio-day-disabled')) {
        const day = parseInt(target.getAttribute('data-day') || '1');
        selectDay(day);
      } else if (target.classList.contains('ethio-now-btn')) {
        selectNow();
      } else if (target.classList.contains('ethio-close-btn')) {
        closePicker();
      }
    });
    
    // Month/year selection
    const monthSelect = element.querySelector('.ethio-month-select') as HTMLSelectElement;
    const yearSelect = element.querySelector('.ethio-year-select') as HTMLSelectElement;
    
    monthSelect?.addEventListener('change', (e) => {
      const month = parseInt((e.target as HTMLSelectElement).value);
      currentDateTime = { ...currentDateTime, month, day: 1 };
      updatePicker();
    });
    
    yearSelect?.addEventListener('change', (e) => {
      const year = parseInt((e.target as HTMLSelectElement).value);
      currentDateTime = { ...currentDateTime, year, day: 1 };
      updatePicker();
    });
    
    // Time selection
    if (showTime) {
      attachTimeEvents();
    }
    
    // Close picker when clicking outside
    document.addEventListener('click', (e) => {
      if (!element.contains(e.target as Node)) {
        closePicker();
      }
    });
  }

  function attachTimeEvents() {
    const hourSelect = element.querySelector('.ethio-hour-select') as HTMLSelectElement;
    const minuteSelect = element.querySelector('.ethio-minute-select') as HTMLSelectElement;
    const secondSelect = element.querySelector('.ethio-second-select') as HTMLSelectElement;
    const ampmSelect = element.querySelector('.ethio-ampm-select') as HTMLSelectElement;
    
    hourSelect?.addEventListener('change', (e) => {
      let hour = parseInt((e.target as HTMLSelectElement).value);
      
      if (timeFormat === '12h' && ampmSelect) {
        const ampm = ampmSelect.value;
        if (ampm === 'PM' && hour < 12) hour += 12;
        if (ampm === 'AM' && hour === 12) hour = 0;
      }
      
      currentDateTime = { ...currentDateTime, hour };
      updateTimeDisplay();
    });
    
    minuteSelect?.addEventListener('change', (e) => {
      const minute = parseInt((e.target as HTMLSelectElement).value);
      currentDateTime = { ...currentDateTime, minute };
      updateTimeDisplay();
    });
    
    secondSelect?.addEventListener('change', (e) => {
      const second = parseInt((e.target as HTMLSelectElement).value);
      currentDateTime = { ...currentDateTime, second };
      updateTimeDisplay();
    });
    
    ampmSelect?.addEventListener('change', (e) => {
      const ampm = (e.target as HTMLSelectElement).value;
      let hour = currentDateTime.hour;
      
      if (ampm === 'PM' && hour < 12) {
        hour += 12;
      } else if (ampm === 'AM' && hour >= 12) {
        hour -= 12;
      }
      
      currentDateTime = { ...currentDateTime, hour };
      updateTimeDisplay();
    });
  }

  function switchTab(tab: 'date' | 'time') {
    activeTab = tab;
    updatePicker();
  }

  function togglePicker() {
    isOpen = !isOpen;
    const popup = element.querySelector('.ethio-datetime-popup') as HTMLDivElement;
    popup.style.display = isOpen ? 'block' : 'none';
  }

  function openPicker() {
    isOpen = true;
    const popup = element.querySelector('.ethio-datetime-popup') as HTMLDivElement;
    popup.style.display = 'block';
    updatePicker();
  }

  function closePicker() {
    isOpen = false;
    const popup = element.querySelector('.ethio-datetime-popup') as HTMLDivElement;
    popup.style.display = 'none';
  }

  function navigateMonth(direction: number) {
    let newMonth = currentDateTime.month + direction;
    let newYear = currentDateTime.year;
    
    if (newMonth > 13) {
      newMonth = 1;
      newYear++;
    } else if (newMonth < 1) {
      newMonth = 13;
      newYear--;
    }
    
    currentDateTime = { ...currentDateTime, month: newMonth, year: newYear, day: 1 };
    updatePicker();
  }

  function navigateYear(direction: number) {
    currentDateTime = { ...currentDateTime, year: currentDateTime.year + direction, day: 1 };
    updatePicker();
  }

  function selectDay(day: number) {
    currentDateTime = { ...currentDateTime, day };
    updateDisplay();
    triggerChangeEvent();
    
    if (autoClose && !showTime) {
      closePicker();
    } else if (showTime) {
      switchTab('time');
    }
  }

  function selectNow() {
    const now = new Date();
    currentDateTime = {
      ...gregorianToEthiopic(now),
      hour: now.getHours(),
      minute: now.getMinutes(),
      second: now.getSeconds()
    };
    updateDisplay();
    updatePicker();
    triggerChangeEvent();
  }

  function updateTimeDisplay() {
    triggerChangeEvent();
  }

  function updatePicker() {
    const popup = element.querySelector('.ethio-datetime-popup') as HTMLDivElement;
    if (popup) {
      popup.innerHTML = renderDateTimePicker();
      reattachPickerEvents();
    }
  }

  function updateDisplay() {
    const display = element.querySelector('.ethio-datetime-display') as HTMLInputElement;
    display.value = formatEthiopianDateTime(currentDateTime, locale, showTime, timeFormat);
  }

  function reattachPickerEvents() {
    // Re-attach event listeners after picker update
    const monthSelect = element.querySelector('.ethio-month-select') as HTMLSelectElement;
    const yearSelect = element.querySelector('.ethio-year-select') as HTMLSelectElement;
    
    monthSelect?.addEventListener('change', (e) => {
      const month = parseInt((e.target as HTMLSelectElement).value);
      currentDateTime = { ...currentDateTime, month, day: 1 };
      updatePicker();
    });
    
    yearSelect?.addEventListener('change', (e) => {
      const year = parseInt((e.target as HTMLSelectElement).value);
      currentDateTime = { ...currentDateTime, year, day: 1 };
      updatePicker();
    });
    
    if (showTime) {
      attachTimeEvents();
    }
  }

  function triggerChangeEvent() {
    const event = new CustomEvent('ethioDateTimeChange', {
      detail: {
        ethiopian: currentDateTime,
        gregorian: ethiopicToGregorian(currentDateTime)
      }
    });
    element.dispatchEvent(event);
  }

  // Public API
  const instance: EthiopianDateTimePickerInstance = {
    setDateTime(date: Date | EthiopicDate) {
      if (date instanceof Date) {
        currentDateTime = {
          ...gregorianToEthiopic(date),
          hour: date.getHours(),
          minute: date.getMinutes(),
          second: date.getSeconds()
        };
      } else {
        currentDateTime = date;
      }
      updateDisplay();
      updatePicker();
    },
    
    getDateTime(): EthiopicDate {
      return { ...currentDateTime };
    },
    
    getGregorianDateTime(): Date {
      return ethiopicToGregorian(currentDateTime);
    },
    
    destroy() {
      element.innerHTML = '';
    }
  };

  init();
  return instance;
}

/**
 * Utility function to create a simple Ethiopian date-time input
 */
export function createEthiopianDateTimeInput(options: {
  onDateTimeChange?: (ethioDate: EthiopicDate, gregDate: Date) => void;
  locale?: Locale;
  showTime?: boolean;
  timeFormat?: '12h' | '24h';
  initialDateTime?: Date;
} = {}): HTMLElement {
  const container = document.createElement('div');
  container.className = 'ethiopian-datetime-input-container';
  
  const picker = createEthiopianDateTimePicker(container, {
    locale: options.locale,
    showTime: options.showTime,
    timeFormat: options.timeFormat,
    autoClose: true
  });
  
  if (options.initialDateTime) {
    picker.setDateTime(options.initialDateTime);
  }
  
  if (options.onDateTimeChange) {
    container.addEventListener('ethioDateTimeChange', (e: any) => {
      options.onDateTimeChange?.(e.detail.ethiopian, e.detail.gregorian);
    });
  }
  
  return container;
}