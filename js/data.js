/**
 * data.js - Datenmodell, Serialisierung, Storage
 * Ereignisse v1.15.0
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
