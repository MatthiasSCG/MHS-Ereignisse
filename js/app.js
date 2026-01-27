/**
 * app.js - Initialisierung, Datei-Handling
 * Ereignisse v1.11.0
 */
'use strict';

/** @constant {string} Zentrale Versionsnummer der Anwendung */
const APP_VERSION = '1.11.0';

/**
 * Prüft, ob die File System Access API verfügbar ist
 * Unterstützt Chrome, Edge und Opera auf sicherem Kontext (HTTPS/localhost)
 * @constant {boolean}
 */
const supportsFS = (() => {
  if (!window.isSecureContext) return false;
  if (typeof window.showOpenFilePicker !== 'function') return false;
  if (typeof window.showSaveFilePicker !== 'function') return false;
  const ua = navigator.userAgent;
  const isChromium = !!window.chrome || ua.includes('Chromium');
  const isEdge = ua.includes('Edg/');
  const isChrome = ua.includes('Chrome/') && !isEdge;
  return isChromium || isEdge || isChrome;
})();

// ---------- DOM refs ----------
const tbody = document.getElementById('tbody');
const dateEl = document.getElementById('date');
const endEl = document.getElementById('end');
const textEl = document.getElementById('text');
const categoryEl = document.getElementById('category');
const notesEl = document.getElementById('notes');
const recurringEl = document.getElementById('recurring');
const searchEl = document.getElementById('search');
const sortKeyEl = document.getElementById('sortKey');
const sortDirBtn = document.getElementById('sortDirBtn');
const themeBtn = document.getElementById('themeBtn');

// Statusleisten-Elemente
const statusFileEl = document.getElementById('statusFile');
const statusCountEl = document.getElementById('statusCount');
const statusSavedEl = document.getElementById('statusSaved');
const statusVersionEl = document.getElementById('statusVersion');

// Erweiterte Filter DOM-Elemente
const advancedFilterBtn = document.getElementById('advancedFilterBtn');
const advancedFilterPanel = document.getElementById('advancedFilterPanel');
const filterBadge = document.getElementById('filterBadge');
const filterResetBtn = document.getElementById('filterResetBtn');
const filterDateFrom = document.getElementById('filterDateFrom');
const filterDateTo = document.getElementById('filterDateTo');
const filterDatePreset = document.getElementById('filterDatePreset');
const categoryCheckboxes = document.getElementById('categoryCheckboxes');
const filterHasNotes = document.getElementById('filterHasNotes');
const filterRecurring = document.getElementById('filterRecurring');
const filterHasTimespan = document.getElementById('filterHasTimespan');
const activeFiltersEl = document.getElementById('activeFilters');
const savedFiltersList = document.getElementById('savedFiltersList');
const saveFilterBtn = document.getElementById('saveFilterBtn');

// Sortierung und Theme
let sortKey = 'date';
let sortDir = 'desc';
const THEME_KEY = 'zeiten-theme';
let theme = localStorage.getItem(THEME_KEY) || ((window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light');

// Version in Statusleiste anzeigen
if (statusVersionEl) {
  statusVersionEl.textContent = `v${APP_VERSION} · Matthias`;
}

// ---------- Datei-Handling ----------
/**
 * Fallback-Methode zum Öffnen von Dateien (für Browser ohne File System API)
 */
const fallbackOpen = () => {
  const input = document.getElementById('fileInput');
  input.onchange = async () => {
    const f = input.files[0];
    if (!f) return;
    const text = await f.text();
    const data = deserializeSmart(text);
    entries = data.entries;
    mergeFilters(data.savedFilters);
    fileHandle = null;
    updateStatusBar();
    updateSaveStatus('saved');
    render();
    input.value = '';
  };
  input.click();
};

/**
 * Öffnet eine JSON-Datei mit Ereignisdaten
 * Verwendet File System Access API falls verfügbar, sonst Fallback
 * @async
 */
async function openFile() {
  try {
    if (supportsFS) {
      try {
        const [handle] = await window.showOpenFilePicker({
          types: [{
            description: 'JSON-Dateien',
            accept: { 'application/json': ['.json'] }
          }],
          excludeAcceptAllOption: false,
          multiple: false
        });
        // Verify read permission (important for Edge)
        const hasPermission = await verifyPermission(handle, 'read');
        if (!hasPermission) {
          console.warn('Read permission denied, falling back');
          fallbackOpen();
          return;
        }
        fileHandle = handle;
        const file = await handle.getFile();
        const text = await file.text();
        const data = deserializeSmart(text);
        entries = data.entries;
        mergeFilters(data.savedFilters);
        saveToLocalStorage();
        updateStatusBar(); updateSaveStatus('saved');
        render();
      } catch (err) {
        if (err && err.name === 'AbortError') return;
        if (err && err.name === 'NotAllowedError') {
          console.warn('Permission not allowed, falling back');
          fallbackOpen();
          return;
        }
        console.warn('FS open failed, falling back', err);
        fallbackOpen();
      }
    } else {
      fallbackOpen();
    }
  } catch (e) {
    alert('Konnte Datei nicht öffnen: ' + (e && e.message ? e.message : e));
  }
}

/**
 * Fallback-Methode zum Speichern (für Browser ohne File System API)
 */
function fallbackSave() {
  const blob = new Blob([serializeJSON()], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Ereignisse_Daten.json';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 0);
  updateStatusBar();
  updateSaveStatus('saved');
}

/**
 * Fallback-Methode für "Speichern unter" (für Browser ohne File System API)
 */
function fallbackSaveAs() {
  let name = prompt('Dateiname für Export:', 'Ereignisse_Daten.json');
  if (name === null) return;
  name = (name || 'Ereignisse_Daten.json').trim();
  const blob = new Blob([serializeJSON()], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 0);
  updateStatusBar();
  updateSaveStatus('saved');
}

/**
 * Schreibt Inhalt in ein FileHandle
 * @async
 * @param {FileSystemFileHandle} handle - Datei-Handle
 * @param {string|Object} content - Zu schreibender Inhalt
 * @throws {Error} Bei Schreibfehlern
 */
async function writeHandle(handle, content) {
  // Write robustly as a Blob to avoid UA quirks when passing raw strings
  // Compatible with Chrome and Edge (Chromium-based)
  let writable = null;
  try {
    writable = await handle.createWritable({ keepExistingData: false });
    const blob = new Blob(
      [typeof content === 'string' ? content : JSON.stringify(content)],
      { type: 'application/json;charset=utf-8' }
    );
    await writable.write(blob);
    await writable.close();
    writable = null;
  } catch (err) {
    // Ensure writable is closed even on error to prevent file locks
    if (writable) {
      try { await writable.abort(); } catch (_) { }
    }
    throw err;
  }
}

/**
 * Prüft und fordert Dateiberechtigungen an
 * Wichtig für Edge-Kompatibilität
 * @async
 * @param {FileSystemFileHandle} handle - Datei-Handle
 * @param {string} [mode='readwrite'] - Berechtigungsmodus
 * @returns {Promise<boolean>} true wenn Berechtigung erteilt
 */
async function verifyPermission(handle, mode = 'readwrite') {
  const options = { mode };
  if ((await handle.queryPermission(options)) === 'granted') return true;
  if ((await handle.requestPermission(options)) === 'granted') return true;
  return false;
}

/**
 * Speichert die Ereignisse in die aktuelle Datei
 * Bei erstem Speichern wird "Speichern unter" aufgerufen
 * @async
 */
async function saveFile() {
  try {
    if (supportsFS) {
      try {
        if (fileHandle && fileHandle.createWritable) {
          // Verify permission before writing (important for Edge)
          const hasPermission = await verifyPermission(fileHandle, 'readwrite');
          if (!hasPermission) {
            console.warn('Permission denied, falling back');
            fallbackSave();
            return;
          }
          await writeHandle(fileHandle, serializeJSON());
          updateStatusBar(); updateSaveStatus('saved');
        } else {
          await saveFileAs();
        }
      } catch (err) {
        if (err && err.name === 'AbortError') return;
        if (err && err.name === 'NotAllowedError') {
          console.warn('Permission not allowed, falling back');
          fallbackSave();
          return;
        }
        console.warn('FS save failed, falling back', err);
        fallbackSave();
      }
    } else {
      fallbackSave();
    }
  } catch (e) {
    alert('Konnte nicht speichern: ' + (e && e.message ? e.message : e));
  }
}

/**
 * Speichert die Ereignisse unter einem neuen Dateinamen
 * @async
 */
async function saveFileAs() {
  try {
    if (supportsFS) {
      try {
        // Reset Handle so the picker does not reuse an old filename
        fileHandle = null;
        const handle = await window.showSaveFilePicker({
          suggestedName: 'Ereignisse_Daten.json',
          types: [{
            description: 'JSON-Dateien',
            accept: { 'application/json': ['.json'] }
          }],
          excludeAcceptAllOption: false
        });
        // Verify write permission (important for Edge)
        const hasPermission = await verifyPermission(handle, 'readwrite');
        if (!hasPermission) {
          console.warn('Write permission denied, falling back');
          fallbackSaveAs();
          return;
        }
        fileHandle = handle;
        await writeHandle(fileHandle, serializeJSON());
        updateStatusBar(); updateSaveStatus('saved');
      } catch (err) {
        if (err && err.name === 'AbortError') return;
        if (err && err.name === 'NotAllowedError') {
          console.warn('Permission not allowed, falling back');
          fallbackSaveAs();
          return;
        }
        console.warn('FS save-as failed, falling back', err);
        fallbackSaveAs();
      }
    } else {
      fallbackSaveAs();
    }
  } catch (e) {
    alert('Konnte nicht "Speichern unter" ausführen: ' + (e && e.message ? e.message : e));
  }
}

// ---------- Events & Init ----------
document.getElementById('addBtn').addEventListener('click', addEntry);
document.getElementById('clearBtn').addEventListener('click', () => {
  dateEl.value = '';
  endEl.value = '';
  categoryEl.value = '';
  textEl.value = '';
  notesEl.value = '';
  dateEl.focus();
});

// Datei-Dropdown
const fileDropdown = document.getElementById('fileDropdown');
const fileMenuBtn = document.getElementById('fileMenuBtn');
const fileMenu = document.getElementById('fileMenu');

fileMenuBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  fileDropdown.classList.toggle('open');
});

// Außerhalb klicken schließt Menü
document.addEventListener('click', () => {
  fileDropdown.classList.remove('open');
});

// Menü-Aktionen
fileMenu.addEventListener('click', (e) => {
  const item = e.target.closest('[data-action]');
  if (!item) return;
  const action = item.dataset.action;
  if (action === 'open') openFile();
  else if (action === 'save') saveFile();
  else if (action === 'saveAs') saveFileAs();
  fileDropdown.classList.remove('open');
});

// Auto-Aktivierung bei Kategorie-Änderung (nur wenn kein Enddatum)
categoryEl.addEventListener('change', () => {
  if (RECURRING_CATEGORIES.includes(categoryEl.value) && !endEl.value) {
    recurringEl.checked = true;
  }
});

// Enddatum deaktiviert "wiederkehrend"
endEl.addEventListener('input', () => {
  if (endEl.value) {
    recurringEl.checked = false;
    recurringEl.disabled = true;
  } else {
    recurringEl.disabled = false;
  }
});

// Sorting controls
function updateSortIcon() {
  sortDirBtn.innerHTML = (sortDir === 'asc')
    ? '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 8l6 6H6z"/></svg>'
    : '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 16l-6-6h12z"/></svg>';
  sortDirBtn.title = 'Sortierung: ' + (sortDir === 'asc' ? 'aufsteigend' : 'absteigend');
}
sortKeyEl.addEventListener('change', () => { sortKey = sortKeyEl.value; render(); });
sortDirBtn.addEventListener('click', () => {
  sortDir = (sortDir === 'asc' ? 'desc' : 'asc');
  updateSortIcon();
  render();
});

// Theme controls
function updateThemeIcon() {
  themeBtn.innerHTML = (theme === 'dark')
    ? '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="5"/></svg>'
    : '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z"/></svg>';
  themeBtn.title = (theme === 'dark') ? 'Helles Design' : 'Dunkles Design';
}
function applyTheme() {
  document.documentElement.setAttribute('data-theme', theme);
  updateThemeIcon();
}
themeBtn.addEventListener('click', () => {
  theme = (theme === 'dark' ? 'light' : 'dark');
  localStorage.setItem(THEME_KEY, theme);
  applyTheme();
});
(function () {
  const mq = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
  if (mq && typeof mq.addEventListener === 'function') {
    mq.addEventListener('change', e => {
      if (!localStorage.getItem(THEME_KEY)) {
        theme = e.matches ? 'dark' : 'light';
        applyTheme();
      }
    });
  }
})();

textEl.addEventListener('keydown', (e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) addEntry(); });

// Suchfeld-Event
searchEl.addEventListener('input', () => {
  currentFilter.query = searchEl.value || '';
  render();
});

// Erweiterter Filter-Button
advancedFilterBtn.addEventListener('click', () => {
  advancedFilterPanel.classList.toggle('open');
  advancedFilterBtn.setAttribute('aria-expanded', advancedFilterPanel.classList.contains('open'));
});

// Filter zurücksetzen
filterResetBtn.addEventListener('click', resetAllFilters);

// Datumsbereich-Filter
filterDateFrom.addEventListener('change', () => {
  currentFilter.dateFrom = filterDateFrom.value;
  filterDatePreset.value = '';
  updateFilterBadge();
  updateActiveFilters();
  render();
});
filterDateTo.addEventListener('change', () => {
  currentFilter.dateTo = filterDateTo.value;
  filterDatePreset.value = '';
  updateFilterBadge();
  updateActiveFilters();
  render();
});
filterDatePreset.addEventListener('change', () => {
  const preset = filterDatePreset.value;
  if (preset) {
    const { from, to } = getDatePreset(preset);
    currentFilter.dateFrom = from;
    currentFilter.dateTo = to;
    filterDateFrom.value = from;
    filterDateTo.value = to;
  } else {
    currentFilter.dateFrom = '';
    currentFilter.dateTo = '';
    filterDateFrom.value = '';
    filterDateTo.value = '';
  }
  updateFilterBadge();
  updateActiveFilters();
  render();
});

// Kategorie-Checkboxen
categoryCheckboxes.querySelectorAll('input[type="checkbox"]').forEach(cb => {
  cb.addEventListener('change', () => {
    const label = cb.closest('.category-checkbox');
    if (cb.checked) {
      currentFilter.categories.push(cb.value);
      label.classList.add('selected');
    } else {
      currentFilter.categories = currentFilter.categories.filter(c => c !== cb.value);
      label.classList.remove('selected');
    }
    updateFilterBadge();
    updateActiveFilters();
    render();
  });
});

// Weitere Filter-Checkboxen
filterHasNotes.addEventListener('change', () => {
  currentFilter.hasNotes = filterHasNotes.checked;
  updateFilterBadge();
  updateActiveFilters();
  render();
});
filterRecurring.addEventListener('change', () => {
  currentFilter.isRecurring = filterRecurring.checked;
  updateFilterBadge();
  updateActiveFilters();
  render();
});
filterHasTimespan.addEventListener('change', () => {
  currentFilter.hasTimespan = filterHasTimespan.checked;
  updateFilterBadge();
  updateActiveFilters();
  render();
});

// Event-Delegation für tbody
tbody.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  // Deaktivierte Buttons ignorieren
  if (btn.disabled) return;
  const tr = btn.closest('tr');
  if (!tr) return;
  const id = tr.dataset.id;
  const entry = entries.find(x => x.id === id);
  if (!entry) return;
  const action = btn.dataset.action;
  if (action === 'edit') enterEditMode(tr, entry);
  else if (action === 'del') deleteEntry(id);
  else if (action === 'dup') duplicateEntry(id);
});

tbody.addEventListener('dblclick', (e) => {
  // Blockieren wenn bereits ein Eintrag bearbeitet wird
  if (editingId) return;
  const tr = e.target.closest('tr');
  if (!tr || tr.querySelector('input')) return;
  const id = tr.dataset.id;
  const entry = entries.find(x => x.id === id);
  if (entry) enterEditMode(tr, entry);
});

// Resize-Event für Spaltenbreite
window.addEventListener('resize', adjustDaysColWidth);

// ---------- Initialisierung ----------
dateEl.value = todayISO();
loadFromLocalStorage();
applyTheme();
updateSortIcon();
renderSavedFilters();
render();

// Tastenkürzel
document.addEventListener('keydown', (e) => {
  const k = e.key.toLowerCase();
  // Datei-Operationen
  if ((e.ctrlKey || e.metaKey) && k === 's' && !e.shiftKey) { e.preventDefault(); saveFile(); }
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && k === 's') { e.preventDefault(); saveFileAs(); }
  if ((e.ctrlKey || e.metaKey) && k === 'o') { e.preventDefault(); openFile(); }
  // Suchfunktionen
  if ((e.ctrlKey || e.metaKey) && k === 'f' && !e.shiftKey) {
    e.preventDefault();
    searchEl.focus();
    searchEl.select();
  }
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && k === 'f') {
    e.preventDefault();
    advancedFilterPanel.classList.add('open');
    advancedFilterBtn.setAttribute('aria-expanded', 'true');
    filterDateFrom.focus();
  }
  // Escape zum Zurücksetzen der Filter
  if (e.key === 'Escape' && !editingId) {
    if (document.activeElement === searchEl || advancedFilterPanel.classList.contains('open')) {
      resetAllFilters();
      advancedFilterPanel.classList.remove('open');
      advancedFilterBtn.setAttribute('aria-expanded', 'false');
      searchEl.blur();
    }
  }
});

// Service Worker Registration (PWA)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then((registration) => {
        console.log('[PWA] Service Worker registered:', registration.scope);

        // Update-Check bei Seitenladung
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Neue Version verfügbar
              if (confirm('Eine neue Version ist verfügbar. Jetzt aktualisieren?')) {
                newWorker.postMessage({ type: 'SKIP_WAITING' });
                window.location.reload();
              }
            }
          });
        });
      })
      .catch((error) => {
        console.log('[PWA] Service Worker registration failed:', error);
      });
  });
}
