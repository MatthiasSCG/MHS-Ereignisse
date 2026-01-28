/**
 * calendar.js - Calendar View Rendering and Logic
 * Ereignisse v1.15.0
 *
 * Implements month, week, and timeline calendar views with event display.
 */
'use strict';

/** @type {Date} Currently displayed month */
let calendarDate = new Date();

/** @type {Date} Currently displayed week (any date in that week) */
let weekDate = new Date();

/** @type {Date} Timeline start date */
let timelineStart = new Date();

/** @type {number} Timeline duration in months */
let timelineMonths = 6;

// Note: getMonthName and getWeekdayName are provided globally by i18n.js

/** @constant {number} Max events to show as dots before "+N" indicator */
const MAX_VISIBLE_DOTS = 3;

/**
 * Gets the number of days in a month
 * @param {number} year
 * @param {number} month - 0-indexed
 * @returns {number}
 */
const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

/**
 * Gets the day of week for first day of month (0=Mon, 6=Sun)
 * @param {number} year
 * @param {number} month
 * @returns {number}
 */
const getFirstDayOfWeek = (year, month) => {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // Convert Sunday=0 to Monday=0
};

/**
 * Formats date as ISO string (YYYY-MM-DD)
 * @param {number} year
 * @param {number} month - 0-indexed
 * @param {number} day
 * @returns {string}
 */
const formatDateISO = (year, month, day) => {
  const m = String(month + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
};

/**
 * Formats month and year for display
 * @param {Date} date
 * @returns {string}
 */
const formatMonthYear = (date) => {
  return `${getMonthName(date.getMonth())} ${date.getFullYear()}`;
};

/**
 * Gets filtered entries based on currentFilter
 * Reuses filter logic from ui.js render()
 * @returns {Entry[]}
 */
const getFilteredEntries = () => {
  const q = currentFilter.query.toLowerCase();

  return entries.filter(e => {
    // Text search (including notes)
    const matchesText = !q ||
      e.text.toLowerCase().includes(q) ||
      (e.notes || '').toLowerCase().includes(q) ||
      (e.date || '').includes(q) ||
      (e.end || '').includes(q) ||
      getCategoryLabel(e.category).toLowerCase().includes(q);

    // Category filter (multi-select)
    let matchesCat = true;
    if (currentFilter.categories.length > 0) {
      if (currentFilter.categories.includes('none')) {
        matchesCat = currentFilter.categories.includes(e.category || 'none') ||
          (currentFilter.categories.includes('none') && !e.category);
      } else {
        matchesCat = currentFilter.categories.includes(e.category);
      }
    }

    // Date range filter
    let matchesDate = true;
    if (currentFilter.dateFrom || currentFilter.dateTo) {
      const entryDate = e.date || '';
      const entryEnd = e.end || entryDate;
      if (currentFilter.dateFrom && entryEnd < currentFilter.dateFrom) matchesDate = false;
      if (currentFilter.dateTo && entryDate > currentFilter.dateTo) matchesDate = false;
    }

    // Other filters
    let matchesOther = true;
    if (currentFilter.hasNotes && !(e.notes && e.notes.trim())) matchesOther = false;
    if (currentFilter.isRecurring && !e.recurring) matchesOther = false;
    if (currentFilter.hasTimespan && !e.end) matchesOther = false;

    return matchesText && matchesCat && matchesDate && matchesOther;
  });
};

/**
 * Gets events for a specific date
 * @param {string} dateISO - Date in YYYY-MM-DD format
 * @param {Entry[]} filteredEntries - Pre-filtered entries
 * @returns {Entry[]} Matching entries
 */
const getEventsForDate = (dateISO, filteredEntries) => {
  return filteredEntries.filter(e => {
    // Single date events (exact match)
    if (e.date === dateISO && !e.end) return true;

    // Date range events (spans include this date)
    if (e.date && e.end) {
      return dateISO >= e.date && dateISO <= e.end;
    }

    // Recurring events (check if this date matches anniversary)
    if (e.recurring && e.date && !e.end) {
      const entryMMDD = e.date.slice(5); // MM-DD
      const checkMMDD = dateISO.slice(5);
      return entryMMDD === checkMMDD;
    }

    return false;
  });
};

/**
 * Builds HTML for event dots in a day cell
 * @param {Entry[]} events
 * @returns {string}
 */
const buildEventDots = (events) => {
  if (events.length === 0) return '';

  const visible = events.slice(0, MAX_VISIBLE_DOTS);
  const remaining = events.length - MAX_VISIBLE_DOTS;

  let html = '<div class="day-events">';

  for (const e of visible) {
    const css = getCategoryCss(e.category);
    const title = escapeHTML(e.text);
    html += `<span class="event-dot ${css}" title="${title}"></span>`;
  }

  if (remaining > 0) {
    html += `<span class="event-more">+${remaining}</span>`;
  }

  html += '</div>';
  return html;
};

/**
 * Navigates to previous month
 */
const calendarPrev = () => {
  calendarDate.setMonth(calendarDate.getMonth() - 1);
  renderCalendar();
};

/**
 * Navigates to next month
 */
const calendarNext = () => {
  calendarDate.setMonth(calendarDate.getMonth() + 1);
  renderCalendar();
};

/**
 * Navigates to today
 */
const calendarToday = () => {
  calendarDate = new Date();
  renderCalendar();
};

/**
 * Renders the calendar month view
 */
const renderCalendar = () => {
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const today = todayISO();

  // Update header
  const monthYearEl = document.getElementById('calMonthYear');
  if (monthYearEl) {
    monthYearEl.textContent = formatMonthYear(calendarDate);
  }

  const daysContainer = document.getElementById('calendarDays');
  if (!daysContainer) return;

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOffset = getFirstDayOfWeek(year, month);

  // Get filtered entries once
  const filteredEntries = getFilteredEntries();

  // Get previous month info for leading days
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);

  let html = '';

  // Leading days from previous month
  for (let i = firstDayOffset - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const dateISO = formatDateISO(prevYear, prevMonth, day);
    const events = getEventsForDate(dateISO, filteredEntries);
    const hasEvents = events.length > 0 ? ' has-events' : '';

    html += `<div class="calendar-day other-month${hasEvents}" data-date="${dateISO}">
      <span class="day-number">${day}</span>
      ${buildEventDots(events)}
    </div>`;
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const dateISO = formatDateISO(year, month, day);
    const events = getEventsForDate(dateISO, filteredEntries);
    const isToday = dateISO === today;
    const dayOfWeek = new Date(year, month, day).getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    let classes = 'calendar-day';
    if (isToday) classes += ' today';
    if (isWeekend) classes += ' weekend';
    if (events.length > 0) classes += ' has-events';

    html += `<div class="${classes}" data-date="${dateISO}">
      <span class="day-number">${day}</span>
      ${buildEventDots(events)}
    </div>`;
  }

  // Trailing days from next month
  const totalCells = firstDayOffset + daysInMonth;
  const trailingDays = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;

  for (let day = 1; day <= trailingDays; day++) {
    const dateISO = formatDateISO(nextYear, nextMonth, day);
    const events = getEventsForDate(dateISO, filteredEntries);
    const hasEvents = events.length > 0 ? ' has-events' : '';

    html += `<div class="calendar-day other-month${hasEvents}" data-date="${dateISO}">
      <span class="day-number">${day}</span>
      ${buildEventDots(events)}
    </div>`;
  }

  daysContainer.innerHTML = html;
  updateStatusBar();
};

/**
 * Formats a date for the day detail popup header
 * @param {string} dateISO - Date in YYYY-MM-DD format
 * @returns {string}
 */
const formatDateForPopup = (dateISO) => {
  const date = new Date(dateISO + 'T00:00:00');
  const dayOfWeek = date.getDay();
  const weekdayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const weekday = getWeekdayName(weekdayIndex);
  const day = date.getDate();
  const month = getMonthName(date.getMonth());
  const year = date.getFullYear();
  return `${weekday}, ${day}. ${month} ${year}`;
};

/**
 * Shows the day detail popup
 * @param {string} dateISO - Date in YYYY-MM-DD format
 */
const showDayDetail = (dateISO) => {
  const filteredEntries = getFilteredEntries();
  const events = getEventsForDate(dateISO, filteredEntries);
  const formatted = formatDateForPopup(dateISO);

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'dayDetailOverlay';

  let eventsHtml = '';
  if (events.length === 0) {
    const noEventsText = typeof t === 'function' ? t('msg.noEventsOnDay') : 'Keine Ereignisse an diesem Tag';
    eventsHtml = `<div class="day-no-events">${noEventsText}</div>`;
  } else {
    eventsHtml = events.map(e => {
      let dateInfo = '';
      // Show date info if event spans multiple days or is recurring
      if (e.end) {
        dateInfo = `<div class="day-event-dates">${e.date} – ${e.end}</div>`;
      } else if (e.recurring && e.date !== dateISO) {
        dateInfo = `<div class="day-event-dates">Ursprung: ${e.date}</div>`;
      }

      let recurringInfo = '';
      if (e.recurring) {
        const recurringText = typeof t === 'function' ? t('label.recurring') : 'Jährlich wiederkehrend';
        recurringInfo = `<div class="day-event-recurring">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8A5.87 5.87 0 016 12c0-3.31 2.69-6 6-6zm6.76 1.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z"/></svg>
          ${recurringText}
        </div>`;
      }

      return `
        <div class="day-event-item" data-id="${e.id}">
          <div class="day-event-category">${buildCategoryBadge(e.category)}</div>
          <div class="day-event-info">
            <div class="day-event-text">${escapeHTML(e.text)}</div>
            ${e.notes ? `<div class="day-event-notes">${escapeHTML(e.notes)}</div>` : ''}
            ${dateInfo}
            ${recurringInfo}
          </div>
          <button class="btn-icon" data-action="edit-from-calendar" title="${typeof t === 'function' ? t('btn.edit') : 'Bearbeiten'}">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"/><path d="M20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.82 1.82 3.75 3.75 1.82-1.82z"/></svg>
          </button>
        </div>
      `;
    }).join('');
  }

  overlay.innerHTML = `
    <div class="modal day-detail-modal">
      <div class="modal-header">
        <h2 class="modal-title">${formatted}</h2>
        <button class="modal-close" title="${typeof t === 'function' ? t('btn.close') : 'Schließen'}">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
        </button>
      </div>
      <div class="modal-body">
        <div class="day-events-list">${eventsHtml}</div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" data-action="close">${typeof t === 'function' ? t('btn.close') : 'Schließen'}</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Close button handlers
  const closeOverlay = () => overlay.remove();

  overlay.querySelector('.modal-close').addEventListener('click', closeOverlay);
  overlay.querySelector('[data-action="close"]').addEventListener('click', closeOverlay);

  // Click outside to close
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeOverlay();
  });

  // ESC to close
  const handleEsc = (e) => {
    if (e.key === 'Escape') {
      closeOverlay();
      document.removeEventListener('keydown', handleEsc);
    }
  };
  document.addEventListener('keydown', handleEsc);

  // Edit button handler - switch to table view and highlight entry
  overlay.querySelectorAll('[data-action="edit-from-calendar"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.closest('.day-event-item').dataset.id;
      closeOverlay();
      switchView('table');
      // Scroll to and highlight the entry after view switch
      setTimeout(() => {
        const row = document.querySelector(`tr[data-id="${id}"]`);
        if (row) {
          row.scrollIntoView({ behavior: 'smooth', block: 'center' });
          row.classList.add('highlight-row');
          setTimeout(() => row.classList.remove('highlight-row'), 2000);
        }
      }, 100);
    });
  });
};

/* ========================================
   Week View Functions
   ======================================== */

/**
 * Gets the ISO week number
 * @param {Date} date
 * @returns {number}
 */
const getWeekNumber = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

/**
 * Gets the Monday of the week containing the given date
 * @param {Date} date
 * @returns {Date}
 */
const getWeekStart = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};

/**
 * Gets the Sunday of the week containing the given date
 * @param {Date} date
 * @returns {Date}
 */
const getWeekEnd = (date) => {
  const start = getWeekStart(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return end;
};

/**
 * Formats the week title
 * @param {Date} date
 * @returns {string}
 */
const formatWeekTitle = (date) => {
  const weekNum = getWeekNumber(date);
  const start = getWeekStart(date);
  const end = getWeekEnd(date);

  const startStr = `${String(start.getDate()).padStart(2, '0')}.${String(start.getMonth() + 1).padStart(2, '0')}`;
  const endStr = `${String(end.getDate()).padStart(2, '0')}.${String(end.getMonth() + 1).padStart(2, '0')}.${end.getFullYear()}`;

  return `KW ${weekNum} (${startStr} - ${endStr})`;
};

/**
 * Navigates to previous week
 */
const weekPrev = () => {
  weekDate.setDate(weekDate.getDate() - 7);
  renderWeek();
};

/**
 * Navigates to next week
 */
const weekNext = () => {
  weekDate.setDate(weekDate.getDate() + 7);
  renderWeek();
};

/**
 * Navigates to current week
 */
const weekToday = () => {
  weekDate = new Date();
  renderWeek();
};

/**
 * Builds HTML for a week event block
 * @param {Entry} e - Event entry
 * @returns {string}
 */
const buildWeekEvent = (e) => {
  const css = getCategoryCss(e.category);
  let recurring = '';
  if (e.recurring) {
    const yearsDiff = calculateYearsSince(e.date);
    if (yearsDiff > 0) {
      recurring = `<span class="week-event-recurring">(${yearsDiff}.)</span>`;
    }
  }
  return `<div class="week-event ${css}" data-id="${e.id}" title="${escapeHTML(e.text)}${e.notes ? '\n' + escapeHTML(e.notes) : ''}">
    <span class="week-event-text">${escapeHTML(e.text)}</span>
    ${recurring}
  </div>`;
};

/**
 * Calculates years since date
 * @param {string} dateStr - Date in YYYY-MM-DD format
 * @returns {number}
 */
const calculateYearsSince = (dateStr) => {
  const eventDate = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  let years = today.getFullYear() - eventDate.getFullYear();
  const monthDiff = today.getMonth() - eventDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < eventDate.getDate())) {
    years--;
  }
  return years;
};

/**
 * Renders the week view
 */
const renderWeek = () => {
  const titleEl = document.getElementById('weekTitle');
  if (titleEl) {
    titleEl.textContent = formatWeekTitle(weekDate);
  }

  const gridEl = document.getElementById('weekGrid');
  if (!gridEl) return;

  const today = todayISO();
  const filteredEntries = getFilteredEntries();
  const weekStart = getWeekStart(weekDate);

  let html = '';

  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(weekStart);
    currentDate.setDate(weekStart.getDate() + i);

    const dateISO = formatDateISO(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    const events = getEventsForDate(dateISO, filteredEntries);

    const isToday = dateISO === today;
    const isWeekend = i >= 5; // Saturday = 5, Sunday = 6

    let classes = 'week-day';
    if (isToday) classes += ' today';
    if (isWeekend) classes += ' weekend';

    const dayName = getWeekdayName(i, true);
    const dayNum = currentDate.getDate();

    html += `
      <div class="${classes}" data-date="${dateISO}">
        <div class="week-day-label">
          <span class="week-day-name">${dayName}</span>
          <span class="week-day-date">${dayNum}</span>
        </div>
        <div class="week-day-events">
          ${events.map(e => buildWeekEvent(e)).join('')}
        </div>
      </div>
    `;
  }

  gridEl.innerHTML = html;

  // Add click handlers for events
  gridEl.querySelectorAll('.week-event').forEach(el => {
    el.addEventListener('click', () => {
      const id = el.dataset.id;
      switchView('table');
      setTimeout(() => {
        const row = document.querySelector(`tr[data-id="${id}"]`);
        if (row) {
          row.scrollIntoView({ behavior: 'smooth', block: 'center' });
          row.classList.add('highlight-row');
          setTimeout(() => row.classList.remove('highlight-row'), 2000);
        }
      }, 100);
    });
  });

  // Add click handlers for day labels to show detail
  gridEl.querySelectorAll('.week-day-label').forEach(el => {
    el.style.cursor = 'pointer';
    el.addEventListener('click', () => {
      const dateISO = el.closest('.week-day').dataset.date;
      showDayDetail(dateISO);
    });
  });

  updateStatusBar();
};

/* ========================================
   Timeline View Functions
   ======================================== */

/**
 * Initializes timeline start to beginning of current month
 */
const initTimelineStart = () => {
  const now = new Date();
  timelineStart = new Date(now.getFullYear(), now.getMonth(), 1);
};

/**
 * Gets timeline end date based on start and months
 * @returns {Date}
 */
const getTimelineEnd = () => {
  const end = new Date(timelineStart);
  end.setMonth(end.getMonth() + timelineMonths, 0); // Last day of the final month
  return end;
};

/**
 * Formats timeline title
 * @returns {string}
 */
const formatTimelineTitle = () => {
  const end = getTimelineEnd();
  const startMonth = getMonthName(timelineStart.getMonth(), true);
  const endMonth = getMonthName(end.getMonth(), true);
  const startYear = timelineStart.getFullYear();
  const endYear = end.getFullYear();

  if (startYear === endYear) {
    return `${startMonth} - ${endMonth} ${startYear}`;
  }
  return `${startMonth} ${startYear} - ${endMonth} ${endYear}`;
};

/**
 * Navigates timeline backward
 */
const timelinePrevFn = () => {
  timelineStart.setMonth(timelineStart.getMonth() - timelineMonths);
  renderTimeline();
};

/**
 * Navigates timeline forward
 */
const timelineNextFn = () => {
  timelineStart.setMonth(timelineStart.getMonth() + timelineMonths);
  renderTimeline();
};

/**
 * Centers timeline on today
 */
const timelineTodayFn = () => {
  const now = new Date();
  // Center today in the timeline
  const offset = Math.floor(timelineMonths / 2);
  timelineStart = new Date(now.getFullYear(), now.getMonth() - offset, 1);
  renderTimeline();
};

/**
 * Sets timeline zoom (months to display)
 * @param {number} months
 */
const setTimelineZoom = (months) => {
  timelineMonths = months;
  renderTimeline();
};

/**
 * Gets all events visible in the timeline range
 * @param {Entry[]} filteredEntries
 * @returns {Entry[]}
 */
const getTimelineEvents = (filteredEntries) => {
  const startISO = formatDateISO(timelineStart.getFullYear(), timelineStart.getMonth(), 1);
  const end = getTimelineEnd();
  const endISO = formatDateISO(end.getFullYear(), end.getMonth(), end.getDate());

  return filteredEntries.filter(e => {
    if (!e.date) return false;

    // Recurring events - check if any occurrence falls in range
    if (e.recurring && !e.end) {
      const eventMonth = parseInt(e.date.slice(5, 7)) - 1;
      const eventDay = parseInt(e.date.slice(8, 10));

      // Check each year in the timeline
      for (let year = timelineStart.getFullYear(); year <= end.getFullYear(); year++) {
        const occurrenceISO = formatDateISO(year, eventMonth, eventDay);
        if (occurrenceISO >= startISO && occurrenceISO <= endISO) {
          return true;
        }
      }
      return false;
    }

    // Single date event
    if (!e.end) {
      return e.date >= startISO && e.date <= endISO;
    }

    // Date range event - check for overlap
    return e.date <= endISO && e.end >= startISO;
  });
};

/**
 * Calculates position (left %) and width (%) for a timeline bar
 * Since months have equal width (flex: 1), position is calculated based on
 * which month the event falls in, plus the day offset within that month.
 * @param {Entry} e - Event entry
 * @returns {{ left: number, width: number, isMarker: boolean }}
 */
const calculateTimelinePosition = (e) => {
  const monthWidth = 100 / timelineMonths; // Each month takes equal width

  /**
   * Calculates position percentage for a given date
   * @param {Date} date
   * @returns {number} Position as percentage (0-100)
   */
  const getPositionForDate = (date) => {
    // Find which month index this date falls into
    const dateYear = date.getFullYear();
    const dateMonth = date.getMonth();
    const dateDay = date.getDate();

    // Calculate month offset from timeline start
    const startYear = timelineStart.getFullYear();
    const startMonth = timelineStart.getMonth();
    const monthIndex = (dateYear - startYear) * 12 + (dateMonth - startMonth);

    if (monthIndex < 0 || monthIndex >= timelineMonths) {
      return monthIndex < 0 ? 0 : 100;
    }

    // Calculate day position within the month
    const daysInMonth = new Date(dateYear, dateMonth + 1, 0).getDate();
    const dayOffset = (dateDay - 1) / daysInMonth; // 0 to ~1

    return (monthIndex + dayOffset) * monthWidth;
  };

  // For recurring single-day events
  if (e.recurring && !e.end) {
    const eventMonth = parseInt(e.date.slice(5, 7)) - 1;
    const eventDay = parseInt(e.date.slice(8, 10));
    const timelineEndDate = getTimelineEnd();

    // Find the occurrence that falls in the timeline
    for (let year = timelineStart.getFullYear(); year <= timelineEndDate.getFullYear(); year++) {
      const occurrence = new Date(year, eventMonth, eventDay);
      if (occurrence >= timelineStart && occurrence <= timelineEndDate) {
        return {
          left: getPositionForDate(occurrence),
          width: 0,
          isMarker: true
        };
      }
    }
    return null;
  }

  // Single date event (no end)
  if (!e.end) {
    const eventDate = new Date(e.date + 'T00:00:00');
    return {
      left: Math.max(0, getPositionForDate(eventDate)),
      width: 0,
      isMarker: true
    };
  }

  // Date range event
  const eventStart = new Date(e.date + 'T00:00:00');
  const eventEnd = new Date(e.end + 'T00:00:00');
  const timelineEndDate = getTimelineEnd();

  // Clamp to timeline bounds
  const clampedStart = eventStart < timelineStart ? timelineStart : eventStart;
  const clampedEnd = eventEnd > timelineEndDate ? timelineEndDate : eventEnd;

  const leftPos = getPositionForDate(clampedStart);
  const rightPos = getPositionForDate(clampedEnd);

  // Add a small amount for the end day to make the bar include it visually
  const endDayWidth = monthWidth / new Date(clampedEnd.getFullYear(), clampedEnd.getMonth() + 1, 0).getDate();

  return {
    left: leftPos,
    width: Math.max(rightPos - leftPos + endDayWidth, 1), // Min 1% width
    isMarker: false
  };
};

/**
 * Assigns events to tracks (rows) to avoid overlap
 * Markers (single-day events) are all placed on track 0 (top)
 * Bars (date ranges) are assigned to tracks starting at 1 to avoid overlap
 * @param {Entry[]} events
 * @returns {Array<{ event: Entry, track: number, position: object }>}
 */
const assignTracks = (events) => {
  const assignments = [];
  const barTracks = []; // Array of end positions for each bar track

  // Separate bars and markers
  const bars = [];
  const markers = [];

  for (const event of events) {
    const position = calculateTimelinePosition(event);
    if (!position) continue;

    if (position.isMarker) {
      markers.push({ event, position });
    } else {
      bars.push({ event, position });
    }
  }

  // All markers go to track 0 (top row)
  for (const { event, position } of markers) {
    assignments.push({ event, track: 0, position });
  }

  // Sort bars by start date
  bars.sort((a, b) => (a.event.date || '').localeCompare(b.event.date || ''));

  // Assign bars to tracks starting at 1 (below markers) to avoid overlap
  const barTrackOffset = markers.length > 0 ? 1 : 0;

  for (const { event, position } of bars) {
    let trackIndex = 0;
    for (let i = 0; i < barTracks.length; i++) {
      if (position.left >= barTracks[i]) {
        trackIndex = i;
        break;
      }
      trackIndex = i + 1;
    }

    // Update track end position
    barTracks[trackIndex] = position.left + position.width + 1; // +1 for spacing

    assignments.push({ event, track: trackIndex + barTrackOffset, position });
  }

  return assignments;
};

/**
 * Renders the timeline view
 */
const renderTimeline = () => {
  // Initialize timeline start if needed
  if (!timelineStart || isNaN(timelineStart.getTime())) {
    initTimelineStart();
  }

  const titleEl = document.getElementById('timelineTitle');
  if (titleEl) {
    titleEl.textContent = formatTimelineTitle();
  }

  const monthsEl = document.getElementById('timelineMonths');
  const tracksEl = document.getElementById('timelineTracks');
  const todayLineEl = document.getElementById('timelineTodayLine');

  if (!monthsEl || !tracksEl) return;

  // Build month headers (equal width via CSS flex: 1)
  let monthsHtml = '';
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  for (let i = 0; i < timelineMonths; i++) {
    const monthDate = new Date(timelineStart);
    monthDate.setMonth(timelineStart.getMonth() + i);
    const monthName = getMonthName(monthDate.getMonth(), true);
    const year = monthDate.getFullYear();
    const isCurrent = monthDate.getMonth() === currentMonth && year === currentYear;

    monthsHtml += `<div class="timeline-month${isCurrent ? ' current' : ''}">${monthName}${year !== timelineStart.getFullYear() ? ' ' + year : ''}</div>`;
  }
  monthsEl.innerHTML = monthsHtml;

  // Get and position events
  const filteredEntries = getFilteredEntries();
  const timelineEvents = getTimelineEvents(filteredEntries);
  const trackAssignments = assignTracks(timelineEvents);

  if (trackAssignments.length === 0) {
    const emptyMsg = typeof t === 'function' ? t('msg.noEventsInRange') : 'Keine Ereignisse im gewählten Zeitraum';
    tracksEl.innerHTML = `<div class="timeline-empty">${emptyMsg}</div>`;
    if (todayLineEl) todayLineEl.style.display = 'none';
    updateStatusBar();
    return;
  }

  // Find max track
  const maxTrack = Math.max(...trackAssignments.map(a => a.track));

  // Build tracks HTML
  let tracksHtml = '';
  for (let t = 0; t <= maxTrack; t++) {
    tracksHtml += `<div class="timeline-track" data-track="${t}"></div>`;
  }
  tracksEl.innerHTML = tracksHtml;

  // Add events to tracks
  for (const { event, track, position } of trackAssignments) {
    const trackEl = tracksEl.querySelector(`[data-track="${track}"]`);
    if (!trackEl) continue;

    const css = getCategoryCss(event.category);

    if (position.isMarker) {
      // Single-day event as marker dot
      const marker = document.createElement('div');
      marker.className = `timeline-marker ${css}`;
      marker.style.left = `${position.left}%`;
      marker.dataset.id = event.id;
      marker.title = escapeHTML(event.text);

      marker.addEventListener('click', () => {
        if (event.date) showDayDetail(event.date);
      });

      trackEl.appendChild(marker);
    } else {
      // Date range as bar
      const bar = document.createElement('div');
      bar.className = `timeline-bar ${css}`;
      bar.style.left = `${position.left}%`;
      bar.style.width = `${Math.max(position.width, 2)}%`; // Min width for visibility
      bar.dataset.id = event.id;
      bar.innerHTML = `<span class="timeline-bar-text">${escapeHTML(event.text)}</span>`;
      bar.title = `${escapeHTML(event.text)}\n${event.date} – ${event.end}`;

      bar.addEventListener('click', () => {
        switchView('table');
        setTimeout(() => {
          const row = document.querySelector(`tr[data-id="${event.id}"]`);
          if (row) {
            row.scrollIntoView({ behavior: 'smooth', block: 'center' });
            row.classList.add('highlight-row');
            setTimeout(() => row.classList.remove('highlight-row'), 2000);
          }
        }, 100);
      });

      trackEl.appendChild(bar);
    }
  }

  // Position today line using same calculation as events
  if (todayLineEl) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to midnight
    const timelineEndDate = getTimelineEnd();

    if (today >= timelineStart && today <= timelineEndDate) {
      // Use same month-based calculation as events
      const monthWidth = 100 / timelineMonths;
      const startYear = timelineStart.getFullYear();
      const startMonth = timelineStart.getMonth();
      const monthIndex = (today.getFullYear() - startYear) * 12 + (today.getMonth() - startMonth);
      const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
      const dayOffset = (today.getDate() - 1) / daysInMonth;
      const leftPercent = (monthIndex + dayOffset) * monthWidth;

      todayLineEl.style.display = '';
      todayLineEl.style.left = `${leftPercent}%`;
    } else {
      todayLineEl.style.display = 'none';
    }
  }

  updateStatusBar();
};
