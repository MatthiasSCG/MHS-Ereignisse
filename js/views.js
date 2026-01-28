/**
 * views.js - View State Management
 * Ereignisse v1.13.0
 *
 * Manages switching between table, month, week and timeline views.
 */
'use strict';

/** @type {'dashboard'|'table'|'month'|'week'|'timeline'} Current active view */
let currentView = 'table';

/** @constant {string} LocalStorage key for view preference */
const VIEW_KEY = 'zeiten-view';

/** @constant {string[]} Valid view types */
const VALID_VIEWS = ['dashboard', 'table', 'month', 'week', 'timeline'];

/**
 * Initializes view state from localStorage
 * Migrates 'calendar' to 'month' for backwards compatibility
 */
const initViewState = () => {
  let saved = localStorage.getItem(VIEW_KEY);

  // Migrate old 'calendar' value to 'month'
  if (saved === 'calendar') {
    saved = 'month';
    localStorage.setItem(VIEW_KEY, 'month');
  }

  if (VALID_VIEWS.includes(saved)) {
    currentView = saved;
  }
};

/**
 * Gets the current view
 * @returns {'table'|'month'|'week'|'timeline'}
 */
const getCurrentView = () => currentView;

/**
 * Checks if current view is a calendar-type view (month, week, timeline)
 * @returns {boolean}
 */
const isCalendarView = () => currentView !== 'table';

/**
 * Switches to a different view
 * @param {'table'|'month'|'week'|'timeline'} view - Target view
 */
const switchView = (view) => {
  if (!VALID_VIEWS.includes(view)) return;
  if (view === currentView) return;

  currentView = view;
  localStorage.setItem(VIEW_KEY, view);
  updateViewUI();
  renderCurrentView();
};

/**
 * Updates UI elements to reflect current view
 */
const updateViewUI = () => {
  // Update toggle buttons
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === currentView);
  });

  // Get all view containers
  const dashboardView = document.getElementById('dashboardView');
  const tableCard = document.querySelector('.card-table');
  const monthView = document.getElementById('calendarView');
  const weekView = document.getElementById('weekView');
  const timelineView = document.getElementById('timelineView');

  // Hide all views
  if (dashboardView) dashboardView.style.display = 'none';
  if (tableCard) tableCard.style.display = 'none';
  if (monthView) monthView.style.display = 'none';
  if (weekView) weekView.style.display = 'none';
  if (timelineView) timelineView.style.display = 'none';

  // Show the active view
  switch (currentView) {
    case 'dashboard':
      if (dashboardView) dashboardView.style.display = '';
      break;
    case 'table':
      if (tableCard) tableCard.style.display = '';
      break;
    case 'month':
      if (monthView) monthView.style.display = '';
      break;
    case 'week':
      if (weekView) weekView.style.display = '';
      break;
    case 'timeline':
      if (timelineView) timelineView.style.display = '';
      break;
  }
};

/**
 * Renders the current view
 */
const renderCurrentView = () => {
  switch (currentView) {
    case 'dashboard':
      if (typeof renderDashboard === 'function') renderDashboard();
      break;
    case 'month':
      if (typeof renderCalendar === 'function') renderCalendar();
      break;
    case 'week':
      if (typeof renderWeek === 'function') renderWeek();
      break;
    case 'timeline':
      if (typeof renderTimeline === 'function') renderTimeline();
      break;
    default:
      if (typeof renderTable === 'function') renderTable();
  }
};
