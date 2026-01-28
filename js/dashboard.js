/**
 * dashboard.js - Dashboard View Logic
 * Ereignisse v1.15.0
 *
 * Renders the dashboard with upcoming events, recent events,
 * milestones and statistics.
 */
'use strict';

/** @constant {number} Days to look ahead for upcoming events */
const UPCOMING_DAYS = 30;

/** @constant {number} Days to look back for recent events */
const RECENT_DAYS = 7;

/** @constant {number} Years to look ahead for milestones */
const MILESTONE_YEARS = 10;

/** @constant {number[]} Milestone ages/years to highlight */
const MILESTONE_NUMBERS = [10, 18, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90, 100];

/** @constant {number[]} Day milestones (1000, 2000, etc.) */
const DAY_MILESTONES = [100, 500, 1000, 2000, 3000, 5000, 10000];

/**
 * Category icons for dashboard display
 */
const CATEGORY_ICONS = {
  '': '',
  'geburtstag': '\uD83C\uDF82',
  'todestag': '\uD83D\uDD6F\uFE0F',
  'jahrestag': '\uD83D\uDC8D',
  'jubilaeum': '\uD83C\uDF89',
  'projekt': '\uD83D\uDCCC',
  'termin': '\uD83D\uDCC5',
  'erinnerung': '\uD83D\uDD14',
  'sonstiges': '\uD83D\uDCDD'
};

/**
 * Checks if a date is today
 * @param {Date} date - Date to check
 * @returns {boolean}
 */
const isToday = (date) => {
  const today = new Date();
  return date.getFullYear() === today.getFullYear() &&
         date.getMonth() === today.getMonth() &&
         date.getDate() === today.getDate();
};

/**
 * Checks if a date is in the current week (Mon-Sun)
 * @param {Date} date - Date to check
 * @returns {boolean}
 */
const isThisWeek = (date) => {
  const today = new Date();
  const dayOfWeek = today.getDay() || 7; // Convert Sunday from 0 to 7
  const monday = new Date(today);
  monday.setDate(today.getDate() - dayOfWeek + 1);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return date >= monday && date <= sunday;
};

/**
 * Checks if a date is in the current month
 * @param {Date} date - Date to check
 * @returns {boolean}
 */
const isThisMonth = (date) => {
  const today = new Date();
  return date.getFullYear() === today.getFullYear() &&
         date.getMonth() === today.getMonth();
};

/**
 * Gets the effective date for sorting (next occurrence for recurring)
 * @param {Entry} entry - Event entry
 * @returns {Date}
 */
const getEffectiveDate = (entry) => {
  if (entry.recurring) {
    const next = getNextOccurrence(entry.date);
    return next ? new Date(next) : new Date(entry.date);
  }
  return new Date(entry.date);
};

/**
 * Gets upcoming events within the specified days
 * @param {Entry[]} allEntries - All entries
 * @param {number} [days=30] - Days to look ahead
 * @returns {Entry[]} Sorted upcoming events
 */
const getUpcomingEvents = (allEntries, days = UPCOMING_DAYS) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const future = new Date(today);
  future.setDate(future.getDate() + days);

  return allEntries
    .filter(e => {
      const date = getEffectiveDate(e);
      return date >= today && date <= future;
    })
    .sort((a, b) => getEffectiveDate(a) - getEffectiveDate(b));
};

/**
 * Gets recent past events within the specified days
 * @param {Entry[]} allEntries - All entries
 * @param {number} [days=7] - Days to look back
 * @returns {Entry[]} Sorted recent events (most recent first)
 */
const getRecentEvents = (allEntries, days = RECENT_DAYS) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const past = new Date(today);
  past.setDate(past.getDate() - days);

  return allEntries
    .filter(e => {
      // For recurring events, check the previous occurrence
      if (e.recurring) {
        const next = getNextOccurrence(e.date);
        if (!next) return false;
        // Previous occurrence is roughly 1 year before next
        const prev = new Date(next);
        prev.setFullYear(prev.getFullYear() - 1);
        return prev >= past && prev < today;
      }
      const date = new Date(e.date);
      return date >= past && date < today;
    })
    .sort((a, b) => {
      const dateA = a.recurring ? getPreviousOccurrence(a.date) : new Date(a.date);
      const dateB = b.recurring ? getPreviousOccurrence(b.date) : new Date(b.date);
      return dateB - dateA; // Most recent first
    });
};

/**
 * Gets the previous occurrence of a recurring event
 * @param {string} isoDate - Original date
 * @returns {Date}
 */
const getPreviousOccurrence = (isoDate) => {
  const next = getNextOccurrence(isoDate);
  if (!next) return new Date(isoDate);
  const prev = new Date(next);
  prev.setFullYear(prev.getFullYear() - 1);
  return prev;
};

/**
 * Groups events by timeframe (today, this week, this month, later)
 * @param {Entry[]} events - Events to group
 * @returns {Object} Grouped events
 */
const groupByTimeframe = (events) => {
  const groups = {
    today: [],
    thisWeek: [],
    thisMonth: [],
    later: []
  };

  events.forEach(event => {
    const date = getEffectiveDate(event);
    if (isToday(date)) {
      groups.today.push(event);
    } else if (isThisWeek(date)) {
      groups.thisWeek.push(event);
    } else if (isThisMonth(date)) {
      groups.thisMonth.push(event);
    } else {
      groups.later.push(event);
    }
  });

  return groups;
};

/**
 * Gets upcoming milestones (round anniversaries, day counts)
 * @param {Entry[]} allEntries - All entries
 * @param {number} [years=10] - Years to look ahead
 * @returns {Array} Milestone objects with event and milestone info
 */
const getMilestones = (allEntries, years = MILESTONE_YEARS) => {
  const milestones = [];
  const today = new Date();
  const maxDate = new Date(today);
  maxDate.setFullYear(maxDate.getFullYear() + years);

  allEntries.forEach(entry => {
    if (!entry.date) return;

    // Check for year milestones (recurring events)
    if (entry.recurring) {
      const origDate = new Date(entry.date);
      const currentAge = today.getFullYear() - origDate.getFullYear();

      MILESTONE_NUMBERS.forEach(milestone => {
        if (milestone > currentAge && milestone <= currentAge + years) {
          const yearsUntil = milestone - currentAge;
          const milestoneDate = new Date(origDate);
          milestoneDate.setFullYear(origDate.getFullYear() + milestone);

          const catLabel = entry.category === 'geburtstag'
            ? (typeof t === 'function' ? t('cat.geburtstag') : 'Geburtstag')
            : (typeof t === 'function' ? t('cat.jahrestag') : 'Jahrestag');
          milestones.push({
            entry,
            type: 'year',
            milestone,
            yearsUntil,
            date: milestoneDate,
            label: `${milestone}. ${catLabel}`
          });
        }
      });
    }

    // Check for day milestones (all events)
    const startDate = new Date(entry.date);
    const daysSinceStart = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));

    DAY_MILESTONES.forEach(dayMilestone => {
      const daysUntil = dayMilestone - daysSinceStart;
      if (daysUntil > 0 && daysUntil <= years * 365) {
        const milestoneDate = new Date(startDate);
        milestoneDate.setDate(milestoneDate.getDate() + dayMilestone);

        if (milestoneDate <= maxDate) {
          const lang = typeof i18n !== 'undefined' ? i18n.getCurrentLang() : 'de';
          const daysWord = typeof tn === 'function' ? tn('unit.day.nom', dayMilestone) : 'Tage';
          milestones.push({
            entry,
            type: 'days',
            milestone: dayMilestone,
            daysUntil,
            date: milestoneDate,
            label: `${dayMilestone.toLocaleString(lang)} ${daysWord}`
          });
        }
      }
    });
  });

  // Sort by date and limit to most relevant
  return milestones
    .sort((a, b) => a.date - b.date)
    .slice(0, 10);
};

/**
 * Calculates statistics for all entries
 * @param {Entry[]} allEntries - All entries
 * @returns {Object} Statistics object
 */
const getStatistics = (allEntries) => {
  const byCategory = {};
  let oldest = null;
  let newest = null;
  let nextUpcoming = null;

  allEntries.forEach(e => {
    // Count by category
    const cat = e.category || '';
    byCategory[cat] = (byCategory[cat] || 0) + 1;

    // Find oldest
    if (!oldest || e.date < oldest.date) {
      oldest = e;
    }

    // Find newest
    if (!newest || e.date > newest.date) {
      newest = e;
    }
  });

  // Find next upcoming
  const upcoming = getUpcomingEvents(allEntries, 365);
  if (upcoming.length > 0) {
    nextUpcoming = upcoming[0];
  }

  return {
    total: allEntries.length,
    byCategory,
    oldest,
    newest,
    nextUpcoming
  };
};

/**
 * Formats a date for display (locale-aware)
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string
 */
const formatDateShort = (date) => {
  const lang = typeof i18n !== 'undefined' ? i18n.getCurrentLang() : 'de';
  const options = { day: '2-digit', month: '2-digit' };
  return date.toLocaleDateString(lang === 'en' ? 'en-GB' : lang, options);
};

/**
 * Formats a weekday name (using i18n)
 * @param {Date} date - Date to get weekday from
 * @returns {string} Abbreviated weekday name
 */
const formatWeekday = (date) => {
  const dayOfWeek = date.getDay();
  const weekdayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert to Mon=0, Sun=6
  if (typeof getWeekday === 'function') {
    return getWeekday(weekdayIndex, true);
  }
  return date.toLocaleDateString('de-DE', { weekday: 'short' });
};

/**
 * Formats relative time (e.g., "in 3 Tagen", "vor 2 Tagen") using i18n
 * @param {Date} date - Target date
 * @returns {string} Relative time string
 */
const formatRelativeTime = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  const diff = Math.round((target - today) / (1000 * 60 * 60 * 24));

  if (diff === 0) return typeof t === 'function' ? t('time.today') : 'heute';
  if (diff === 1) return typeof t === 'function' ? t('time.tomorrow') : 'morgen';
  if (diff === -1) return typeof t === 'function' ? t('time.yesterday') : 'gestern';

  const abs = Math.abs(diff);
  const unit = typeof tn === 'function' ? tn('unit.day', abs) : (abs === 1 ? 'Tag' : 'Tagen');

  if (diff > 0) {
    const inWord = typeof t === 'function' ? t('time.in') : 'in';
    return `${inWord} ${abs} ${unit}`;
  }
  const agoWord = typeof t === 'function' ? t('time.ago') : 'vor';
  return `${agoWord} ${abs} ${unit}`;
};

/**
 * Renders the upcoming events section
 * @param {Entry[]} allEntries - All entries
 */
const renderUpcoming = (allEntries) => {
  const container = document.getElementById('dashboardUpcoming');
  if (!container) return;

  const upcoming = getUpcomingEvents(allEntries);
  const groups = groupByTimeframe(upcoming);

  if (upcoming.length === 0) {
    const msg = typeof t === 'function' ? t('dashboard.noUpcoming') : 'Keine anstehenden Ereignisse in den nächsten 30 Tagen';
    container.innerHTML = `<div class="dashboard-empty">${msg}</div>`;
    return;
  }

  let html = '';

  if (groups.today.length > 0) {
    html += '<div class="dashboard-group">';
    html += `<div class="dashboard-group-header">${typeof t === 'function' ? t('dashboard.groupToday') : 'Heute'}</div>`;
    groups.today.forEach(e => {
      html += renderEventItem(e, getEffectiveDate(e));
    });
    html += '</div>';
  }

  if (groups.thisWeek.length > 0) {
    html += '<div class="dashboard-group">';
    html += `<div class="dashboard-group-header">${typeof t === 'function' ? t('dashboard.groupThisWeek') : 'Diese Woche'}</div>`;
    groups.thisWeek.forEach(e => {
      html += renderEventItem(e, getEffectiveDate(e));
    });
    html += '</div>';
  }

  if (groups.thisMonth.length > 0) {
    html += '<div class="dashboard-group">';
    html += `<div class="dashboard-group-header">${typeof t === 'function' ? t('dashboard.groupThisMonth') : 'Dieser Monat'}</div>`;
    groups.thisMonth.forEach(e => {
      html += renderEventItem(e, getEffectiveDate(e));
    });
    html += '</div>';
  }

  if (groups.later.length > 0) {
    html += '<div class="dashboard-group">';
    html += `<div class="dashboard-group-header">${typeof t === 'function' ? t('dashboard.groupLater') : 'Später'}</div>`;
    groups.later.forEach(e => {
      html += renderEventItem(e, getEffectiveDate(e));
    });
    html += '</div>';
  }

  container.innerHTML = html;
  attachEventClickHandlers(container);
};

/**
 * Renders a single event item
 * @param {Entry} entry - Event entry
 * @param {Date} date - Display date
 * @returns {string} HTML string
 */
const renderEventItem = (entry, date) => {
  const icon = CATEGORY_ICONS[entry.category] || '';
  const catClass = getCategoryCss(entry.category);
  const weekday = formatWeekday(date);
  const dateStr = formatDateShort(date);
  const relative = formatRelativeTime(date);

  let ageInfo = '';
  if (entry.recurring && entry.date) {
    const age = getAgeAtDate(entry.date, date.getTime());
    if (age !== null && age > 0) {
      const yearsLabel = entry.category === 'geburtstag'
        ? (typeof tn === 'function' ? tn('unit.year.nom', age) : (age === 1 ? 'Jahr' : 'Jahre'))
        : (typeof t === 'function' ? t('dashboard.yearsShort') : 'J.');
      ageInfo = `<span class="dashboard-event-age">${age} ${yearsLabel}</span>`;
    }
  }

  return `
    <div class="dashboard-event" data-id="${escapeHTML(entry.id)}">
      <span class="dashboard-event-icon ${catClass}">${icon}</span>
      <span class="dashboard-event-text">${escapeHTML(entry.text)}</span>
      ${ageInfo}
      <span class="dashboard-event-date">${weekday}, ${dateStr}</span>
      <span class="dashboard-event-relative">${relative}</span>
    </div>
  `;
};

/**
 * Renders the recent events section
 * @param {Entry[]} allEntries - All entries
 */
const renderRecent = (allEntries) => {
  const container = document.getElementById('dashboardRecent');
  if (!container) return;

  const recent = getRecentEvents(allEntries);

  if (recent.length === 0) {
    const msg = typeof t === 'function' ? t('dashboard.noRecent') : 'Keine Ereignisse in den letzten 7 Tagen';
    container.innerHTML = `<div class="dashboard-empty">${msg}</div>`;
    return;
  }

  let html = '';
  recent.forEach(e => {
    const date = e.recurring ? getPreviousOccurrence(e.date) : new Date(e.date);
    const icon = CATEGORY_ICONS[e.category] || '';
    const catClass = getCategoryCss(e.category);
    const relative = formatRelativeTime(date);

    let ageInfo = '';
    if (e.recurring && e.date) {
      const age = getAgeAtDate(e.date, date.getTime());
      if (age !== null && age > 0) {
        const yearsLabel = e.category === 'geburtstag'
          ? (typeof tn === 'function' ? tn('unit.year.nom', age) : (age === 1 ? 'Jahr' : 'Jahre'))
          : (typeof t === 'function' ? t('dashboard.yearsShort') : 'J.');
        ageInfo = `<span class="dashboard-event-age">${age} ${yearsLabel}</span>`;
      }
    }

    html += `
      <div class="dashboard-event" data-id="${escapeHTML(e.id)}">
        <span class="dashboard-event-icon ${catClass}">${icon}</span>
        <span class="dashboard-event-text">${escapeHTML(e.text)}</span>
        ${ageInfo}
        <span class="dashboard-event-relative">${relative}</span>
      </div>
    `;
  });

  container.innerHTML = html;
  attachEventClickHandlers(container);
};

/**
 * Renders the milestones section
 * @param {Entry[]} allEntries - All entries
 */
const renderMilestones = (allEntries) => {
  const container = document.getElementById('dashboardMilestones');
  if (!container) return;

  const milestones = getMilestones(allEntries);

  if (milestones.length === 0) {
    const msg = typeof t === 'function' ? t('dashboard.noMilestones') : 'Keine Meilensteine in den nächsten Jahren';
    container.innerHTML = `<div class="dashboard-empty">${msg}</div>`;
    return;
  }

  let html = '';
  milestones.forEach(m => {
    const icon = CATEGORY_ICONS[m.entry.category] || '';
    const catClass = getCategoryCss(m.entry.category);
    const dateStr = formatDateShort(m.date);
    const year = m.date.getFullYear();

    let timeInfo = '';
    if (m.type === 'year') {
      if (m.yearsUntil === 1) {
        timeInfo = typeof t === 'function' ? t('dashboard.inOneYear') : 'in 1 Jahr';
      } else {
        timeInfo = typeof t === 'function' ? t('dashboard.inYears', { n: m.yearsUntil }) : `in ${m.yearsUntil} Jahren`;
      }
    } else {
      if (m.daysUntil === 1) {
        timeInfo = typeof t === 'function' ? t('time.tomorrow') : 'morgen';
      } else {
        timeInfo = typeof t === 'function' ? t('dashboard.inDays', { n: m.daysUntil }) : `in ${m.daysUntil} Tagen`;
      }
    }

    html += `
      <div class="dashboard-milestone" data-id="${escapeHTML(m.entry.id)}">
        <span class="dashboard-milestone-icon ${catClass}">${icon}</span>
        <div class="dashboard-milestone-info">
          <span class="dashboard-milestone-text">${escapeHTML(m.entry.text)}</span>
          <span class="dashboard-milestone-label">${m.label}</span>
        </div>
        <div class="dashboard-milestone-when">
          <span class="dashboard-milestone-date">${dateStr}.${year}</span>
          <span class="dashboard-milestone-relative">${timeInfo}</span>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
  attachEventClickHandlers(container);
};

/**
 * Renders the statistics section
 * @param {Entry[]} allEntries - All entries
 */
const renderStats = (allEntries) => {
  const container = document.getElementById('dashboardStats');
  if (!container) return;

  const stats = getStatistics(allEntries);

  if (stats.total === 0) {
    const msg = typeof t === 'function' ? t('dashboard.noEvents') : 'Keine Ereignisse vorhanden';
    container.innerHTML = `<div class="dashboard-empty">${msg}</div>`;
    return;
  }

  // Find max count for bar scaling
  const maxCount = Math.max(...Object.values(stats.byCategory), 1);

  const totalLabel = typeof t === 'function' ? t('dashboard.totalEvents') : 'Ereignisse gesamt';
  let html = `<div class="dashboard-stats-total">${stats.total} ${totalLabel}</div>`;

  // Category bars
  html += '<div class="dashboard-stats-categories">';
  const categoryOrder = ['geburtstag', 'todestag', 'jahrestag', 'jubilaeum', 'projekt', 'termin', 'erinnerung', 'sonstiges', ''];

  categoryOrder.forEach(cat => {
    const count = stats.byCategory[cat];
    if (!count) return;

    const label = getCategoryLabel(cat);
    const icon = CATEGORY_ICONS[cat] || '';
    const catClass = getCategoryCss(cat);
    const percentage = (count / maxCount) * 100;

    html += `
      <div class="dashboard-stat-row">
        <span class="dashboard-stat-icon ${catClass}">${icon}</span>
        <span class="dashboard-stat-label">${label}</span>
        <div class="dashboard-stat-bar-container">
          <div class="dashboard-stat-bar ${catClass}" style="width: ${percentage}%"></div>
        </div>
        <span class="dashboard-stat-count">${count}</span>
      </div>
    `;
  });
  html += '</div>';

  // Oldest and next upcoming
  html += '<div class="dashboard-stats-info">';

  if (stats.oldest) {
    const oldestDate = new Date(stats.oldest.date);
    const oldestStr = oldestDate.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    html += `<div class="dashboard-stat-info-item">\u00C4ltestes: ${escapeHTML(stats.oldest.text)} (${oldestStr})</div>`;
  }

  if (stats.nextUpcoming) {
    const nextDate = getEffectiveDate(stats.nextUpcoming);
    const relative = formatRelativeTime(nextDate);
    html += `<div class="dashboard-stat-info-item">N\u00E4chstes: ${escapeHTML(stats.nextUpcoming.text)} (${relative})</div>`;
  }

  html += '</div>';

  container.innerHTML = html;
};

/**
 * Attaches click handlers to event items
 * @param {HTMLElement} container - Container element
 */
const attachEventClickHandlers = (container) => {
  container.querySelectorAll('[data-id]').forEach(el => {
    el.addEventListener('click', () => {
      const id = el.dataset.id;
      if (id && typeof startEdit === 'function') {
        startEdit(id);
      }
    });
  });
};

/**
 * Main render function for the dashboard
 */
const renderDashboard = () => {
  renderUpcoming(entries);
  renderRecent(entries);
  renderMilestones(entries);
  renderStats(entries);
};
