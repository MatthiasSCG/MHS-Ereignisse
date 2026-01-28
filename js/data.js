/**
 * data.js - Datenmodell, Serialisierung, Storage
 * Ereignisse v1.16.0
 */
'use strict';

/**
 * Ein Ereignis-Eintrag mit allen relevanten Feldern
 * @typedef {Object} Entry
 * @property {string} id - Eindeutige ID (Zeitstempel + Zufallsstring)
 * @property {string} date - Startdatum im ISO-Format (YYYY-MM-DD)
 * @property {string} end - Enddatum im ISO-Format (optional)
 * @property {string} text - Beschreibung des Ereignisses
 * @property {string} category - Kategorie-Schlüssel (optional)
 * @property {string} notes - Mehrzeilige Notizen (optional)
 * @property {boolean} recurring - Jährlich wiederkehrendes Ereignis (optional)
 * @property {string[]} predecessors - IDs der Vorgänger-Ereignisse (optional)
 * @property {string[]} successors - IDs der Nachfolger-Ereignisse (optional)
 * @property {string} createdAt - Erstellungszeitpunkt (ISO-Timestamp)
 * @property {string} updatedAt - Letzter Änderungszeitpunkt (ISO-Timestamp)
 */

/** @constant {string} LocalStorage-Schlüssel für Einträge */
const LS_KEY = 'zeiten-eintraege-v2';

/** @constant {string} LocalStorage-Schlüssel für gespeicherte Filter */
const SAVED_FILTERS_KEY = 'zeiten-saved-filters';

/** @type {Entry[]} */
let entries = [];

/** @type {FileSystemFileHandle|null} */
let fileHandle = null;

/** @type {string|null} ID des aktuell bearbeiteten Eintrags */
let editingId = null;

// Kategorie-Definitionen mit i18n-Keys
const CATEGORIES = {
  '': { key: 'cat.none', css: 'cat-none' },
  'geburtstag': { key: 'cat.geburtstag', css: 'cat-geburtstag' },
  'todestag': { key: 'cat.todestag', css: 'cat-todestag' },
  'jahrestag': { key: 'cat.jahrestag', css: 'cat-jahrestag' },
  'jubilaeum': { key: 'cat.jubilaeum', css: 'cat-jubilaeum' },
  'projekt': { key: 'cat.projekt', css: 'cat-projekt' },
  'termin': { key: 'cat.termin', css: 'cat-termin' },
  'erinnerung': { key: 'cat.erinnerung', css: 'cat-erinnerung' },
  'sonstiges': { key: 'cat.sonstiges', css: 'cat-sonstiges' }
};

// Kategorien, die automatisch "wiederkehrend" aktivieren
const RECURRING_CATEGORIES = ['geburtstag', 'todestag', 'jahrestag'];

/**
 * Gibt das Label einer Kategorie zurück (i18n-aware)
 * @param {string} cat - Kategorie-Schlüssel
 * @returns {string} Kategorie-Label oder 'Keine'
 */
const getCategoryLabel = (cat) => {
  const catDef = CATEGORIES[cat];
  if (catDef && typeof t === 'function') {
    return t(catDef.key);
  }
  // Fallback without i18n
  const fallbackLabels = {
    '': 'Keine', 'geburtstag': 'Geburtstag', 'todestag': 'Todestag',
    'jahrestag': 'Jahrestag', 'jubilaeum': 'Jubiläum', 'projekt': 'Projekt',
    'termin': 'Termin', 'erinnerung': 'Erinnerung', 'sonstiges': 'Sonstiges'
  };
  return fallbackLabels[cat] || 'Keine';
};

/**
 * Gibt die CSS-Klasse einer Kategorie zurück
 * @param {string} cat - Kategorie-Schlüssel
 * @returns {string} CSS-Klassenname
 */
const getCategoryCss = (cat) => CATEGORIES[cat]?.css || 'cat-none';

/**
 * Speichert alle Einträge im LocalStorage
 */
const saveToLocalStorage = () => {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(entries));
  } catch (e) { }
};

/**
 * Lädt Einträge aus dem LocalStorage
 * Migriert automatisch von v1 zu v2 falls notwendig
 */
const loadFromLocalStorage = () => {
  try {
    // Versuche zuerst neue Version zu laden
    let raw = localStorage.getItem(LS_KEY);
    if (raw) {
      entries = JSON.parse(raw);
    } else {
      // Fallback: alte Version migrieren
      raw = localStorage.getItem('zeiten-eintraege-v1');
      if (raw) {
        entries = JSON.parse(raw);
        // Migration: Kategorie- und Notizen-Felder hinzufügen
        entries = entries.map(e => ({ ...e, category: e.category || '', notes: e.notes || '' }));
        saveToLocalStorage();
      }
    }
    // Sicherstellen, dass alle Einträge category-, notes-, recurring-, predecessors- und successors-Felder haben
    entries = entries.map(e => ({
      ...e,
      category: e.category || '',
      notes: e.notes || '',
      recurring: e.recurring || false,
      predecessors: Array.isArray(e.predecessors) ? e.predecessors : [],
      successors: Array.isArray(e.successors) ? e.successors : []
    }));
  } catch (e) {
    entries = [];
  }
};

// ---------- Serialization ----------
const serializePlain = () => entries.map(e => `${e.date || ''}\t${e.end || ''}\t${sanitizeText(e.text || '')}`).join('\n');

const serializeJSON = () => JSON.stringify({ entries, savedFilters }, null, 2);

const parsePlain = (text = '') => {
  const lines = String(text || '').replace(/\r/g, '').split('\n');
  const arr = [];
  for (const ln of lines) {
    if (!ln || !ln.trim()) continue;
    const parts = ln.split('\t');
    const date = (parts[0] || '').trim();
    let end = '', txt = '';
    if (parts.length >= 3) {
      end = (parts[1] || '').trim();
      txt = sanitizeText(parts.slice(2).join('\t'));
    } else {
      txt = sanitizeText(parts[1] || '');
    }
    const t = nowISOTimestamp();
    arr.push({ id: uid(), date, end, text: txt, category: '', notes: '', predecessors: [], successors: [], createdAt: t, updatedAt: t });
  }
  return arr;
};

const deserializeSmart = (text) => {
  try {
    const obj = JSON.parse(text);
    if (Array.isArray(obj)) return { entries: obj, savedFilters: [] };
    if (obj && Array.isArray(obj.entries)) {
      return { entries: obj.entries, savedFilters: Array.isArray(obj.savedFilters) ? obj.savedFilters : [] };
    }
  } catch (e) { }
  return { entries: parsePlain(text), savedFilters: [] };
};

// ---------- Verknüpfungs-Hilfsfunktionen ----------
/**
 * Fügt eine bidirektionale Verknüpfung zwischen zwei Einträgen hinzu
 * @param {string} sourceId - ID des Quell-Eintrags
 * @param {string} targetId - ID des Ziel-Eintrags
 * @param {'predecessor'|'successor'} type - Art der Verknüpfung
 */
const addLink = (sourceId, targetId, type) => {
  const source = entries.find(e => e.id === sourceId);
  const target = entries.find(e => e.id === targetId);
  if (!source || !target || sourceId === targetId) return;

  if (type === 'predecessor') {
    // source bekommt target als Vorgänger
    if (!source.predecessors.includes(targetId)) {
      source.predecessors.push(targetId);
    }
    // target bekommt source als Nachfolger (bidirektional)
    if (!target.successors.includes(sourceId)) {
      target.successors.push(sourceId);
    }
  } else if (type === 'successor') {
    // source bekommt target als Nachfolger
    if (!source.successors.includes(targetId)) {
      source.successors.push(targetId);
    }
    // target bekommt source als Vorgänger (bidirektional)
    if (!target.predecessors.includes(sourceId)) {
      target.predecessors.push(sourceId);
    }
  }
  source.updatedAt = nowISOTimestamp();
  target.updatedAt = nowISOTimestamp();
};

/**
 * Entfernt eine bidirektionale Verknüpfung zwischen zwei Einträgen
 * @param {string} sourceId - ID des Quell-Eintrags
 * @param {string} targetId - ID des Ziel-Eintrags
 * @param {'predecessor'|'successor'} type - Art der Verknüpfung
 */
const removeLink = (sourceId, targetId, type) => {
  const source = entries.find(e => e.id === sourceId);
  const target = entries.find(e => e.id === targetId);
  if (!source || !target) return;

  if (type === 'predecessor') {
    // target aus source.predecessors entfernen
    source.predecessors = source.predecessors.filter(id => id !== targetId);
    // source aus target.successors entfernen (bidirektional)
    target.successors = target.successors.filter(id => id !== sourceId);
  } else if (type === 'successor') {
    // target aus source.successors entfernen
    source.successors = source.successors.filter(id => id !== targetId);
    // source aus target.predecessors entfernen (bidirektional)
    target.predecessors = target.predecessors.filter(id => id !== sourceId);
  }
  source.updatedAt = nowISOTimestamp();
  target.updatedAt = nowISOTimestamp();
};

/**
 * Bereinigt alle Verknüpfungen zu einem gelöschten Eintrag
 * @param {string} deletedId - ID des gelöschten Eintrags
 */
const cleanupLinksForDeletedEntry = (deletedId) => {
  entries.forEach(e => {
    if (e.predecessors.includes(deletedId)) {
      e.predecessors = e.predecessors.filter(id => id !== deletedId);
      e.updatedAt = nowISOTimestamp();
    }
    if (e.successors.includes(deletedId)) {
      e.successors = e.successors.filter(id => id !== deletedId);
      e.updatedAt = nowISOTimestamp();
    }
  });
};

/**
 * Merges imported filters with existing filters, avoiding duplicates by ID
 * @param {Array} importedFilters - Filters from imported file
 */
const mergeFilters = (importedFilters) => {
  if (!Array.isArray(importedFilters) || importedFilters.length === 0) return;
  const existingIds = new Set(savedFilters.map(f => f.id));
  let addedCount = 0;
  for (const filter of importedFilters) {
    if (filter && filter.id && !existingIds.has(filter.id)) {
      savedFilters.push(filter);
      existingIds.add(filter.id);
      addedCount++;
    }
  }
  if (addedCount > 0) {
    localStorage.setItem(SAVED_FILTERS_KEY, JSON.stringify(savedFilters));
    renderSavedFilters();
  }
};

/**
 * Validiert, dass das Enddatum nach dem Startdatum liegt
 * @param {string} startDate - Startdatum im ISO-Format
 * @param {string} endDate - Enddatum im ISO-Format
 * @returns {boolean} true wenn gültig oder eines der Daten leer ist
 */
function validateDates(startDate, endDate) {
  if (!startDate || !endDate) return true;
  return startDate <= endDate;
}

/**
 * Generates sample entries with English content
 * Dates are calculated relative to today for realistic demonstration
 * @returns {Entry[]} Array of sample event entries
 */
function getSampleEntries() {
  const now = new Date();
  const ts = nowISOTimestamp();

  // Helper: add/subtract days from today
  const addDays = (days) => {
    const d = new Date(now);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  // Helper: add/subtract months from today
  const addMonths = (months) => {
    const d = new Date(now);
    d.setMonth(d.getMonth() + months);
    return d.toISOString().split('T')[0];
  };

  // Helper: add/subtract years from today
  const addYears = (years) => {
    const d = new Date(now);
    d.setFullYear(d.getFullYear() + years);
    return d.toISOString().split('T')[0];
  };

  return [
    // === Birthdays (recurring) - relative dates for realistic age display ===
    {
      id: uid(), date: addYears(-36), end: '', category: 'geburtstag',
      text: 'Emma Thompson - Birthday',
      notes: 'Loves chocolate cake and gardening books',
      recurring: true, predecessors: [], successors: [], createdAt: ts, updatedAt: ts
    },
    {
      id: uid(), date: addDays(-120), end: '', category: 'geburtstag',
      text: 'James Wilson - Birthday',
      notes: 'Tech enthusiast, prefers experience gifts. Turns 41 this year.',
      recurring: true, predecessors: [], successors: [], createdAt: ts, updatedAt: ts
    },
    {
      id: uid(), date: addDays(25), end: '', category: 'geburtstag',
      text: 'Sophie Miller - Birthday',
      notes: 'Daughter, loves unicorns and painting. Turning 11!',
      recurring: true, predecessors: [], successors: [], createdAt: ts, updatedAt: ts
    },

    // === Anniversaries (recurring) ===
    {
      id: uid(), date: addYears(-15), end: '', category: 'jahrestag',
      text: 'Wedding Anniversary',
      notes: 'Married at St. Mary\'s Church',
      recurring: true, predecessors: [], successors: [], createdAt: ts, updatedAt: ts
    },
    {
      id: uid(), date: addDays(-200), end: '', category: 'jahrestag',
      text: 'Started at Current Company',
      notes: 'First day as Software Developer',
      recurring: true, predecessors: [], successors: [], createdAt: ts, updatedAt: ts
    },

    // === Death anniversaries (recurring) ===
    {
      id: uid(), date: addYears(-6), end: '', category: 'todestag',
      text: 'Grandma Helen - Memorial',
      notes: 'Visit the cemetery, bring white roses',
      recurring: true, predecessors: [], successors: [], createdAt: ts, updatedAt: ts
    },

    // === Upcoming appointments ===
    {
      id: uid(), date: addDays(3), end: '', category: 'termin',
      text: 'Dentist Appointment',
      notes: 'Dr. Smith, 10:30 AM, regular checkup',
      recurring: false, predecessors: [], successors: [], createdAt: ts, updatedAt: ts
    },
    {
      id: uid(), date: addDays(14), end: '', category: 'termin',
      text: 'Team Meeting - Q1 Review',
      notes: 'Prepare presentation slides',
      recurring: false, predecessors: [], successors: [], createdAt: ts, updatedAt: ts
    },

    // === Projects with timespans ===
    {
      id: uid(), date: addDays(7), end: addDays(21), category: 'projekt',
      text: 'Home Renovation - Kitchen',
      notes: 'New countertops and backsplash installation',
      recurring: false, predecessors: [], successors: [], createdAt: ts, updatedAt: ts
    },
    {
      id: uid(), date: addDays(-30), end: addDays(60), category: 'projekt',
      text: 'Online Course - Web Development',
      notes: 'Udemy course, complete 3 modules per week',
      recurring: false, predecessors: [], successors: [], createdAt: ts, updatedAt: ts
    },

    // === Reminders ===
    {
      id: uid(), date: addDays(5), end: '', category: 'erinnerung',
      text: 'Renew Car Insurance',
      notes: 'Compare quotes from at least 3 providers',
      recurring: false, predecessors: [], successors: [], createdAt: ts, updatedAt: ts
    },
    {
      id: uid(), date: addMonths(1), end: '', category: 'erinnerung',
      text: 'Submit Tax Documents',
      notes: 'Gather receipts and contact accountant',
      recurring: false, predecessors: [], successors: [], createdAt: ts, updatedAt: ts
    },

    // === Jubilees ===
    {
      id: uid(), date: addYears(-25), end: '', category: 'jubilaeum',
      text: 'Company Founded',
      notes: '25th anniversary celebration planned',
      recurring: true, predecessors: [], successors: [], createdAt: ts, updatedAt: ts
    },

    // === Past events ===
    {
      id: uid(), date: addDays(-10), end: '', category: 'termin',
      text: 'Annual Health Checkup',
      notes: 'Results: all good, next checkup in 12 months',
      recurring: false, predecessors: [], successors: [], createdAt: ts, updatedAt: ts
    },
    {
      id: uid(), date: addDays(-60), end: addDays(-30), category: 'projekt',
      text: 'Garden Landscaping Project',
      notes: 'Completed: new flower beds and patio area',
      recurring: false, predecessors: [], successors: [], createdAt: ts, updatedAt: ts
    },

    // === Other/Miscellaneous ===
    {
      id: uid(), date: addMonths(3), end: '', category: 'sonstiges',
      text: 'Summer Vacation Planning',
      notes: 'Research destinations: Italy or Greece',
      recurring: false, predecessors: [], successors: [], createdAt: ts, updatedAt: ts
    },
    {
      id: uid(), date: addDays(45), end: addDays(52), category: 'sonstiges',
      text: 'Family Reunion',
      notes: 'Book hotel rooms and coordinate travel plans',
      recurring: false, predecessors: [], successors: [], createdAt: ts, updatedAt: ts
    }
  ];
}

/**
 * Loads predefined sample data (English content)
 * Shows confirmation dialog if existing data is present
 */
function loadSampleData() {
  // Check for existing data and confirm replacement
  const confirmMsg = typeof t === 'function'
    ? t('msg.confirmLoadSample')
    : 'Existing data will be replaced with sample data. Continue?';

  if (entries.length > 0 && !confirm(confirmMsg)) {
    return;
  }

  // Load sample entries
  entries = getSampleEntries();
  savedFilters = [];
  fileHandle = null;

  // Save and update UI
  saveToLocalStorage();
  localStorage.setItem(SAVED_FILTERS_KEY, JSON.stringify(savedFilters));
  updateStatusBar();
  updateSaveStatus('unsaved');
  if (typeof renderSavedFilters === 'function') renderSavedFilters();
  render();
}
