/**
 * i18n.js - Internationalization Module
 * Ereignisse v1.15.0
 *
 * Provides multi-language support with:
 * - Translation API (t, tn)
 * - Pluralization rules per language
 * - Dynamic language loading
 * - HTML data-i18n attribute handling
 */
'use strict';

/** @constant {string} LocalStorage key for language preference */
const LANG_KEY = 'zeiten-lang';

/** @constant {string[]} Supported languages */
const SUPPORTED_LANGS = ['de', 'en', 'fr', 'it', 'es'];

/** @constant {string} Default/fallback language */
const DEFAULT_LANG = 'de';

/**
 * i18n namespace object
 * @namespace
 */
const i18n = {
  /** @type {string} Current language code */
  _currentLang: DEFAULT_LANG,

  /** @type {Object.<string, Object>} Loaded language strings */
  _languages: {},

  /** @type {Set<string>} Languages that have been loaded */
  _loadedLanguages: new Set(),

  /**
   * Registers a language with its translations
   * @param {string} lang - Language code
   * @param {Object} strings - Translation strings
   */
  registerLanguage(lang, strings) {
    this._languages[lang] = strings;
    this._loadedLanguages.add(lang);
  },

  /**
   * Gets the current language code
   * @returns {string}
   */
  getCurrentLang() {
    return this._currentLang;
  },

  /**
   * Checks if a language is loaded
   * @param {string} lang - Language code
   * @returns {boolean}
   */
  isLanguageLoaded(lang) {
    return this._loadedLanguages.has(lang);
  },

  /**
   * Loads a language file dynamically
   * @param {string} lang - Language code
   * @returns {Promise<void>}
   */
  async loadLanguage(lang) {
    if (this._loadedLanguages.has(lang)) return;
    if (!SUPPORTED_LANGS.includes(lang)) return;

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `js/i18n/${lang}.js`;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load language: ${lang}`));
      document.head.appendChild(script);
    });
  },

  /**
   * Sets the current language
   * @param {string} lang - Language code
   * @param {boolean} [persist=true] - Save to localStorage
   * @returns {Promise<void>}
   */
  async setLanguage(lang, persist = true) {
    if (!SUPPORTED_LANGS.includes(lang)) {
      lang = DEFAULT_LANG;
    }

    // Load language if not already loaded
    if (!this._loadedLanguages.has(lang)) {
      await this.loadLanguage(lang);
    }

    this._currentLang = lang;

    if (persist) {
      localStorage.setItem(LANG_KEY, lang);
    }

    // Update HTML lang attribute
    document.documentElement.lang = lang;

    // Update all static HTML elements
    this.translateStaticHTML();

    // Trigger re-render if render function exists
    if (typeof render === 'function') {
      render();
    }

    // Update status bar if function exists
    if (typeof updateStatusBar === 'function') {
      updateStatusBar();
    }
  },

  /**
   * Gets a translated string
   * @param {string} key - Translation key
   * @param {Object} [params] - Parameters for interpolation
   * @returns {string} Translated string or key if not found
   */
  t(key, params = {}) {
    const strings = this._languages[this._currentLang] || this._languages[DEFAULT_LANG] || {};
    const fallback = this._languages[DEFAULT_LANG] || {};

    let str = strings[key] || fallback[key] || key;

    // Replace placeholders: {name}
    for (const [k, v] of Object.entries(params)) {
      str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
    }

    return str;
  },

  /**
   * Gets a pluralized string
   * @param {string} baseKey - Base key without number suffix
   * @param {number} n - Number for plural determination
   * @param {Object} [params] - Additional parameters
   * @returns {string} Pluralized string
   */
  tn(baseKey, n, params = {}) {
    const form = this.getPluralForm(n);
    const key = `${baseKey}.${form}`;
    return this.t(key, { n, ...params });
  },

  /**
   * Gets the plural form index for the current language
   * @param {number} n - Number
   * @returns {number} Plural form index (1 = singular, 2 = plural)
   */
  getPluralForm(n) {
    const absN = Math.abs(n);
    const lang = this._currentLang;

    switch (lang) {
      case 'fr':
        // French: 0 and 1 are singular
        return absN <= 1 ? 1 : 2;

      case 'de':
      case 'en':
      case 'es':
      case 'it':
      default:
        // Simple: 1 = singular, else plural
        return absN === 1 ? 1 : 2;
    }
  },

  /**
   * Gets month name by index (0-11)
   * @param {number} idx - Month index
   * @param {boolean} [short=false] - Return short form
   * @returns {string}
   */
  getMonth(idx, short = false) {
    const prefix = short ? 'month.short.' : 'month.';
    return this.t(prefix + idx);
  },

  /**
   * Gets weekday name by index (0=Monday, 6=Sunday)
   * @param {number} idx - Weekday index
   * @param {boolean} [short=false] - Return short form
   * @returns {string}
   */
  getWeekday(idx, short = false) {
    const prefix = short ? 'weekday.short.' : 'weekday.';
    return this.t(prefix + idx);
  },

  /**
   * Detects browser language and returns best match
   * @returns {string} Language code
   */
  detectLanguage() {
    const browserLang = navigator.language || navigator.userLanguage || '';
    const primary = browserLang.split('-')[0].toLowerCase();

    if (SUPPORTED_LANGS.includes(primary)) {
      return primary;
    }
    return DEFAULT_LANG;
  },

  /**
   * Initializes i18n module
   * Does NOT trigger render - call setLanguage after app is ready
   */
  init() {
    // Check localStorage first
    let lang = localStorage.getItem(LANG_KEY);

    // Fallback to browser detection
    if (!lang || !SUPPORTED_LANGS.includes(lang)) {
      lang = this.detectLanguage();
    }

    // Set language without triggering render (de.js is already loaded)
    this._currentLang = lang;
    document.documentElement.lang = lang;

    // Return the detected language so caller can load it if needed
    return lang;
  },

  /**
   * Translates all static HTML elements with data-i18n attributes
   */
  translateStaticHTML() {
    // Elements with text content
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      const attrs = el.dataset.i18nAttr;

      if (attrs) {
        // Translate specified attributes
        attrs.split(',').forEach(attr => {
          el.setAttribute(attr.trim(), this.t(key));
        });
      } else {
        // Translate text content (only if no children or only text nodes)
        if (el.children.length === 0) {
          el.textContent = this.t(key);
        }
      }
    });

    // Update document title
    const titleKey = 'app.title';
    const title = this.t(titleKey);
    if (title !== titleKey) {
      document.title = title;
    }

    // Update calendar weekdays if present
    this.translateCalendarWeekdays();

    // Update language dropdown selection
    const langSelect = document.getElementById('langSelect');
    if (langSelect) {
      langSelect.value = this._currentLang;
    }
  },

  /**
   * Translates calendar weekday headers
   */
  translateCalendarWeekdays() {
    const weekdaysEl = document.getElementById('calendarWeekdays');
    if (!weekdaysEl) return;

    const spans = weekdaysEl.querySelectorAll('span');
    if (spans.length === 7) {
      for (let i = 0; i < 7; i++) {
        spans[i].textContent = this.getWeekday(i, true);
      }
    }
  }
};

// Global shorthand functions for convenience
const t = (key, params) => i18n.t(key, params);
const tn = (baseKey, n, params) => i18n.tn(baseKey, n, params);
const getMonth = (idx, short) => i18n.getMonth(idx, short);
const getWeekday = (idx, short) => i18n.getWeekday(idx, short);

// Alias names used by other modules
const getMonthName = (idx, short) => i18n.getMonth(idx, short);
const getWeekdayName = (idx, short) => i18n.getWeekday(idx, short);
