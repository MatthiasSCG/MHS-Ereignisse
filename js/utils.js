/**
 * utils.js - Hilfsfunktionen, Datum-Berechnungen
 * Ereignisse v1.11.0
 */
'use strict';

/**
 * DOM-Selektor-Hilfsfunktion
 * @param {string} s - CSS-Selektor
 * @param {Element} [el=document] - Eltern-Element
 * @returns {Element|null} Gefundenes Element oder null
 */
const $ = (s, el = document) => el.querySelector(s);

/**
 * DOM-Selektor für mehrere Elemente
 * @param {string} s - CSS-Selektor
 * @param {Element} [el=document] - Eltern-Element
 * @returns {Element[]} Array der gefundenen Elemente
 */
const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));

/**
 * Gibt das heutige Datum im ISO-Format zurück
 * @returns {string} Datum im Format YYYY-MM-DD
 */
const todayISO = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const da = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${da}`;
};

/**
 * Gibt den aktuellen Zeitstempel im ISO-Format zurück
 * @returns {string} ISO-Zeitstempel
 */
const nowISOTimestamp = () => new Date().toISOString();

/**
 * Generiert eine eindeutige ID
 * @returns {string} Eindeutige ID aus Zeitstempel und Zufallsstring
 */
const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

/**
 * Bereinigt Text durch Entfernen von Zeilenumbrüchen und Tabs
 * @param {string} [s=''] - Eingabetext
 * @returns {string} Bereinigter Text
 */
const sanitizeText = (s = '') => String(s).replace(/\r?\n/g, ' ').replace(/\t/g, ' ').trim();

/**
 * Escaped HTML-Sonderzeichen zur Vermeidung von XSS
 * @param {string} [str=''] - Eingabetext
 * @returns {string} HTML-sicherer Text
 */
const escapeHTML = (str = '') => String(str).replace(/[&<>"']/g, (ch) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  '\'': '&#39;'
}[ch]));

// ---------- Date math & formatting ----------
const MS_PER_DAY = 86400000;
const NF_DE = new Intl.NumberFormat('de-DE');

const fmtNum = (n) => NF_DE.format(Math.trunc(n));

const parseISODateOnly = (s) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || '');
  if (!m) return null;
  return Date.UTC(+m[1], +m[2] - 1, +m[3]);
};

const todayUTC = () => {
  const n = new Date();
  return Date.UTC(n.getFullYear(), n.getMonth(), n.getDate());
};

const daysFromToday = (iso) => {
  const t = parseISODateOnly(iso);
  if (t == null) return null;
  return Math.round((t - todayUTC()) / MS_PER_DAY);
};

const joinWithAnd = (parts) => {
  const a = parts.filter(Boolean);
  if (a.length === 0) return '';
  if (a.length === 1) return a[0];
  if (a.length === 2) return `${a[0]} und ${a[1]}`;
  return `${a.slice(0, -1).join(', ')} und ${a[a.length - 1]}`;
};

const fmtDays = (n) => {
  if (n == null) return '';
  if (n === 0) return 'heute';
  const abs = Math.abs(n);
  const unit = abs === 1 ? 'Tag' : 'Tagen';
  return (n > 0 ? 'in ' : 'vor ') + `${fmtNum(abs)} ${unit}`;
};

const fmtWeeksDays = (n) => {
  if (n == null) return '';
  if (n === 0) return 'heute';
  const abs = Math.abs(n);
  const w = Math.floor(abs / 7);
  const d = abs % 7;
  const parts = [];
  if (w) parts.push(`${fmtNum(w)} ${w === 1 ? 'Woche' : 'Wochen'}`);
  if (d) parts.push(`${fmtNum(d)} ${d === 1 ? 'Tag' : 'Tagen'}`);
  return (n > 0 ? 'in ' : 'vor ') + joinWithAnd(parts);
};

const addMonthsUTC = (date, months) => {
  const d = new Date(date.getTime());
  d.setUTCMonth(d.getUTCMonth() + months);
  return d;
};

const partsFromTodayISO = (iso) => {
  const t = parseISODateOnly(iso);
  if (t == null) return null;
  const today = todayUTC();
  if (t === today) return { sign: 0, years: 0, months: 0, weeks: 0, days: 0, totalMonths: 0 };
  const start = new Date(Math.min(t, today));
  const end = new Date(Math.max(t, today));
  let monthsTotal = (end.getUTCFullYear() - start.getUTCFullYear()) * 12 + (end.getUTCMonth() - start.getUTCMonth());
  let anchor = addMonthsUTC(start, monthsTotal);
  if (anchor.getTime() > end.getTime()) {
    monthsTotal--;
    anchor = addMonthsUTC(start, monthsTotal);
  }
  let daysRem = Math.round((end.getTime() - anchor.getTime()) / MS_PER_DAY);
  const years = Math.floor(monthsTotal / 12);
  const months = monthsTotal % 12;
  const weeks = Math.floor(daysRem / 7);
  const days = daysRem % 7;
  const sign = t > today ? 1 : -1;
  return { sign, years, months, weeks, days, totalMonths: monthsTotal };
};

const fmtMonthsWeeksDaysISO = (iso) => {
  const p = partsFromTodayISO(iso);
  if (!p) return '';
  if (p.sign === 0) return 'heute';
  const monthsAll = Math.abs(p.totalMonths ?? (p.years * 12 + p.months));
  const parts = [];
  if (monthsAll) parts.push(`${fmtNum(monthsAll)} ${monthsAll === 1 ? 'Monat' : 'Monaten'}`);
  if (p.weeks) parts.push(`${fmtNum(p.weeks)} ${p.weeks === 1 ? 'Woche' : 'Wochen'}`);
  if (p.days) parts.push(`${fmtNum(p.days)} ${p.days === 1 ? 'Tag' : 'Tagen'}`);
  return (p.sign > 0 ? 'in ' : 'vor ') + joinWithAnd(parts);
};

const fmtYearsMonthsWeeksDaysISO = (iso) => {
  const p = partsFromTodayISO(iso);
  if (!p) return '';
  if (p.sign === 0) return 'heute';
  const parts = [];
  if (p.years) parts.push(`${fmtNum(p.years)} ${p.years === 1 ? 'Jahr' : 'Jahren'}`);
  if (p.months) parts.push(`${fmtNum(p.months)} ${p.months === 1 ? 'Monat' : 'Monaten'}`);
  if (p.weeks) parts.push(`${fmtNum(p.weeks)} ${p.weeks === 1 ? 'Woche' : 'Wochen'}`);
  if (p.days) parts.push(`${fmtNum(p.days)} ${p.days === 1 ? 'Tag' : 'Tagen'}`);
  return (p.sign > 0 ? 'in ' : 'vor ') + joinWithAnd(parts);
};

const linesForDateISO_TODAY = (iso) => {
  const d = daysFromToday(iso);
  const arr = [fmtDays(d), fmtWeeksDays(d), fmtMonthsWeeksDaysISO(iso), fmtYearsMonthsWeeksDaysISO(iso)].filter(Boolean);
  const seen = new Set();
  const uniq = [];
  for (const s of arr) {
    if (!seen.has(s)) {
      seen.add(s);
      uniq.push(s);
    }
  }
  return uniq;
};

// --- Between two dates (start -> end) ---
const daysBetween = (aIso, bIso) => {
  const a = parseISODateOnly(aIso);
  const b = parseISODateOnly(bIso);
  if (a == null || b == null) return null;
  return Math.round((b - a) / MS_PER_DAY);
};

const partsBetweenISO = (aIso, bIso) => {
  const a = parseISODateOnly(aIso);
  const b = parseISODateOnly(bIso);
  if (a == null || b == null) return null;
  if (a === b) return { sign: 0, years: 0, months: 0, weeks: 0, days: 0, totalMonths: 0 };
  const start = new Date(Math.min(a, b));
  const end = new Date(Math.max(a, b));
  let monthsTotal = (end.getUTCFullYear() - start.getUTCFullYear()) * 12 + (end.getUTCMonth() - start.getUTCMonth());
  let anchor = addMonthsUTC(start, monthsTotal);
  if (anchor.getTime() > end.getTime()) {
    monthsTotal--;
    anchor = addMonthsUTC(start, monthsTotal);
  }
  let daysRem = Math.round((end.getTime() - anchor.getTime()) / MS_PER_DAY);
  const years = Math.floor(monthsTotal / 12);
  const months = monthsTotal % 12;
  const weeks = Math.floor(daysRem / 7);
  const days = daysRem % 7;
  const sign = b > a ? 1 : -1;
  return { sign, years, months, weeks, days, totalMonths: monthsTotal };
};

const fmtDaysBetween = (aIso, bIso) => {
  const d = daysBetween(aIso, bIso);
  if (d == null) return '';
  const abs = Math.abs(d);
  return `${fmtNum(abs)} ${abs === 1 ? 'Tag' : 'Tage'}`;
};

const fmtWeeksDaysBetween = (aIso, bIso) => {
  const d = daysBetween(aIso, bIso);
  if (d == null) return '';
  const abs = Math.abs(d);
  const w = Math.floor(abs / 7);
  const r = abs % 7;
  const parts = [];
  if (w) parts.push(`${fmtNum(w)} ${w === 1 ? 'Woche' : 'Wochen'}`);
  if (r) parts.push(`${fmtNum(r)} ${r === 1 ? 'Tag' : 'Tagen'}`);
  return joinWithAnd(parts);
};

const fmtMonthsWeeksDaysBetween = (aIso, bIso) => {
  const p = partsBetweenISO(aIso, bIso);
  if (!p) return '';
  const monthsAll = Math.abs(p.totalMonths ?? (p.years * 12 + p.months));
  const parts = [];
  if (monthsAll) parts.push(`${fmtNum(monthsAll)} ${monthsAll === 1 ? 'Monat' : 'Monaten'}`);
  if (p.weeks) parts.push(`${fmtNum(p.weeks)} ${p.weeks === 1 ? 'Woche' : 'Wochen'}`);
  if (p.days) parts.push(`${fmtNum(p.days)} ${p.days === 1 ? 'Tag' : 'Tagen'}`);
  return joinWithAnd(parts);
};

const fmtYearsMonthsWeeksDaysBetween = (aIso, bIso) => {
  const p = partsBetweenISO(aIso, bIso);
  if (!p) return '';
  const parts = [];
  if (p.years) parts.push(`${fmtNum(p.years)} ${p.years === 1 ? 'Jahr' : 'Jahren'}`);
  if (p.months) parts.push(`${fmtNum(p.months)} ${p.months === 1 ? 'Monat' : 'Monaten'}`);
  if (p.weeks) parts.push(`${fmtNum(p.weeks)} ${p.weeks === 1 ? 'Woche' : 'Wochen'}`);
  if (p.days) parts.push(`${fmtNum(p.days)} ${p.days === 1 ? 'Tag' : 'Tagen'}`);
  return joinWithAnd(parts);
};

// --- helpers for milestone-only text (weeks / months) ---
const weeksOnlyRelative = (iso) => {
  const d = daysFromToday(iso);
  if (d == null) return '';
  const abs = Math.abs(d);
  const w = Math.floor(abs / 7);
  if (!w) return '';
  return (d > 0 ? 'in ' : 'vor ') + `${fmtNum(w)} ${w === 1 ? 'Woche' : 'Wochen'}`;
};

const monthsOnlyRelativeISO = (iso) => {
  const p = partsFromTodayISO(iso);
  if (!p || p.sign === 0) return '';
  const monthsAll = Math.abs(p.totalMonths ?? (p.years * 12 + p.months));
  if (!monthsAll) return '';
  return (p.sign > 0 ? 'in ' : 'vor ') + `${fmtNum(monthsAll)} ${monthsAll === 1 ? 'Monat' : 'Monaten'}`;
};

const weeksOnlyBetweenText = (aIso, bIso) => {
  const d = daysBetween(aIso, bIso);
  if (d == null) return '';
  const w = Math.floor(Math.abs(d) / 7);
  if (!w) return '';
  return `${fmtNum(w)} ${w === 1 ? 'Woche' : 'Wochen'}`;
};

const monthsOnlyBetweenText = (aIso, bIso) => {
  const p = partsBetweenISO(aIso, bIso);
  if (!p) return '';
  const monthsAll = Math.abs(p.totalMonths ?? (p.years * 12 + p.months));
  if (!monthsAll) return '';
  return `${fmtNum(monthsAll)} ${monthsAll === 1 ? 'Monat' : 'Monaten'}`;
};

// ---------- Wiederkehrende Ereignisse ----------
/**
 * Berechnet das nächste jährliche Vorkommen eines Datums
 * @param {string} isoDate - Datum im ISO-Format
 * @returns {number|null} UTC-Timestamp des nächsten Vorkommens
 */
const getNextOccurrence = (isoDate) => {
  const d = parseISODateOnly(isoDate);
  if (d == null) return null;
  const orig = new Date(d);
  const today = new Date(todayUTC());

  let next = Date.UTC(today.getUTCFullYear(), orig.getUTCMonth(), orig.getUTCDate());
  if (next <= todayUTC()) {
    next = Date.UTC(today.getUTCFullYear() + 1, orig.getUTCMonth(), orig.getUTCDate());
  }
  return next;
};

/**
 * Berechnet das Alter/Jahre seit einem Ereignis zu einem Zieldatum
 * @param {string} origIso - Ursprungsdatum im ISO-Format
 * @param {number} targetUTC - Ziel-UTC-Timestamp
 * @returns {number|null} Anzahl der Jahre
 */
const getAgeAtDate = (origIso, targetUTC) => {
  const orig = parseISODateOnly(origIso);
  if (orig == null || targetUTC == null) return null;
  const o = new Date(orig);
  const t = new Date(targetUTC);
  return t.getUTCFullYear() - o.getUTCFullYear();
};

/**
 * Konvertiert UTC-Timestamp zu ISO-Datumsstring
 * @param {number} utc - UTC-Timestamp
 * @returns {string} ISO-Datumsstring (YYYY-MM-DD)
 */
const utcToISO = (utc) => {
  if (utc == null) return '';
  const d = new Date(utc);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

/**
 * Berechnet Tage bis zum nächsten Vorkommen
 * @param {string} isoDate - Datum im ISO-Format
 * @returns {number|null} Anzahl der Tage
 */
const daysUntilNext = (isoDate) => {
  const next = getNextOccurrence(isoDate);
  if (next == null) return null;
  return Math.round((next - todayUTC()) / MS_PER_DAY);
};

/** @constant {number[]} Meilenstein-Jahre für Jubiläen */
const YEAR_MILESTONES = [10, 18, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90, 100];

/**
 * Findet den nächsten Meilenstein für ein wiederkehrendes Ereignis
 * @param {string} origIso - Ursprungsdatum im ISO-Format
 * @param {number} [yearsAhead=10] - Wie viele Jahre vorausschauen
 * @returns {{milestone: number, yearsUntil: number}|null} Meilenstein-Info oder null
 */
const getNextMilestone = (origIso, yearsAhead = 10) => {
  const next = getNextOccurrence(origIso);
  const age = getAgeAtDate(origIso, next);
  if (age == null) return null;

  for (const m of YEAR_MILESTONES) {
    if (m >= age && m < age + yearsAhead) {
      return { milestone: m, yearsUntil: m - age };
    }
  }
  return null;
};

// Unified line builder: if end given -> between dates, else -> relative to today
const linesForDisplay = (startIso, endIso) => {
  if (endIso) {
    const arr = [
      fmtDaysBetween(startIso, endIso),
      fmtWeeksDaysBetween(startIso, endIso),
      fmtMonthsWeeksDaysBetween(startIso, endIso),
      fmtYearsMonthsWeeksDaysBetween(startIso, endIso)
    ].filter(Boolean);
    const seen = new Set();
    const out = [];
    for (const s of arr) {
      if (!seen.has(s)) {
        seen.add(s);
        out.push(s);
      }
    }
    return out;
  }
  return linesForDateISO_TODAY(startIso);
};

function shouldMarkLine(i, startIso, endIso) {
  if (endIso) {
    const d = daysBetween(startIso, endIso);
    if (d == null) return false;
    const absd = Math.abs(d);
    const daysR = absd % 7;
    const weeks = Math.floor(absd / 7);
    const p = partsBetweenISO(startIso, endIso);
    const monthsAll = p ? Math.abs(p.totalMonths ?? (p.years * 12 + p.months)) : 0;
    const onlyYears = !!(p && p.years > 0 && p.months === 0 && p.weeks === 0 && p.days === 0);
    if (i === 0) return absd !== 0 && (absd % 1000 === 0);
    if (i === 1) return weeks !== 0 && (weeks % 100 === 0) && daysR === 0; // Wochen-Meilenstein nur ohne Resttage
    if (i === 2) return monthsAll !== 0 && (monthsAll % 100 === 0) && p && p.weeks === 0 && p.days === 0; // Monate-Meilenstein nur ohne Wochen/Tage
    if (i === 3) return onlyYears;
    return false;
  }
  const d = daysFromToday(startIso);
  if (d == null) return false;
  const absd = Math.abs(d);
  const weeks = Math.floor(absd / 7);
  const p = partsFromTodayISO(startIso);
  const monthsAll = p ? Math.abs(p.totalMonths ?? (p.years * 12 + p.months)) : 0;
  const onlyYears = !!(p && p.sign !== 0 && p.years > 0 && p.months === 0 && p.weeks === 0 && p.days === 0);
  if (i === 0) return absd !== 0 && (absd % 1000 === 0);
  if (i === 1) return weeks !== 0 && (weeks % 100 === 0) && (absd % 7 === 0);
  if (i === 2) return monthsAll !== 0 && (monthsAll % 100 === 0) && p && p.weeks === 0 && p.days === 0;
  if (i === 3) return onlyYears;
  return false;
}
