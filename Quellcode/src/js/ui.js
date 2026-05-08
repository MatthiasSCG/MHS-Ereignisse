/**
 * ui.js - Rendering, Dialoge, Events
 * Ereignisse v1.16.0
 */
'use strict';

/**
 * Erstellt HTML für ein Kategorie-Badge
 * @param {string} cat - Kategorie-Schlüssel
 * @returns {string} HTML-String für das Badge
 */
const buildCategoryBadge = (cat) => {
  const css = getCategoryCss(cat);
  const label = getCategoryLabel(cat);
  return `<span class="cat-badge ${css}">${label}</span>`;
};

/**
 * Erstellt HTML für ein Kategorie-Dropdown
 * @param {string} selectedCat - Ausgewählte Kategorie
 * @param {string} [id=''] - Optionale ID für das Select-Element
 * @returns {string} HTML-String für das Select-Element
 */
const buildCategorySelect = (selectedCat, id = '') => {
  const idAttr = id ? `id="${id}"` : '';
  const options = Object.entries(CATEGORIES).map(([key, val]) => {
    const selected = key === selectedCat ? 'selected' : '';
    return `<option value="${key}" ${selected}>${val.label}</option>`;
  }).join('');
  return `<select ${idAttr} style="width:100%">${options}</select>`;
};

/**
 * Erstellt HTML für die Notizen-Anzeige
 * @param {string} notes - Notizen-Text
 * @returns {string} HTML-String für die Notizen oder leerer String
 */
const buildNotesDisplay = (notes) => {
  if (!notes || !notes.trim()) return '';
  const escaped = escapeHTML(notes);
  return `<div class="notes-display">${escaped}</div>`;
};

/**
 * Erstellt HTML für die Notizen-Anzeige mit Suchhervorhebung
 * @param {string} notes - Notizen-Text
 * @param {string} query - Suchbegriff
 * @returns {string} HTML-String für die Notizen oder leerer String
 */
const buildNotesDisplayWithHighlight = (notes, query) => {
  if (!notes || !notes.trim()) return '';
  if (!query) return buildNotesDisplay(notes);

  const escaped = escapeHTML(notes);
  const queryLower = query.toLowerCase();
  const textLower = escaped.toLowerCase();

  // Check if query exists in notes
  if (!textLower.includes(queryLower)) {
    return `<div class="notes-display">${escaped}</div>`;
  }

  // Highlight matches
  let result = '';
  let lastIndex = 0;
  let index = textLower.indexOf(queryLower);
  while (index !== -1) {
    result += escaped.slice(lastIndex, index);
    result += `<mark class="search-highlight">${escaped.slice(index, index + query.length)}</mark>`;
    lastIndex = index + query.length;
    index = textLower.indexOf(queryLower, lastIndex);
  }
  result += escaped.slice(lastIndex);

  return `<div class="notes-display">${result}</div>`;
};

/**
 * Erstellt HTML für die Verknüpfungs-Indikatoren in der Tabellenansicht
 * @param {Entry} entry - Der Eintrag
 * @returns {string} HTML-String für die Indikatoren
 */
const buildLinkIndicators = (entry) => {
  const predCount = (entry.predecessors || []).length;
  const succCount = (entry.successors || []).length;
  if (predCount === 0 && succCount === 0) return '';

  const predEntries = (entry.predecessors || [])
    .map(id => entries.find(e => e.id === id))
    .filter(Boolean);
  const succEntries = (entry.successors || [])
    .map(id => entries.find(e => e.id === id))
    .filter(Boolean);

  const predLabel = typeof t === 'function' ? t('link.predecessors') : 'Vorgänger';
  const succLabel = typeof t === 'function' ? t('link.successors') : 'Nachfolger';
  const predTooltip = predEntries.length > 0
    ? `${predLabel}:\n${predEntries.map(e => `• ${e.date}: ${e.text}`).join('\n')}`
    : '';
  const succTooltip = succEntries.length > 0
    ? `${succLabel}:\n${succEntries.map(e => `• ${e.date}: ${e.text}`).join('\n')}`
    : '';

  let html = '<div class="link-indicators">';
  if (predCount > 0) {
    html += `<span class="link-indicator" title="${escapeHTML(predTooltip)}">
      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"/></svg>
      ${predCount}
    </span>`;
  }
  if (succCount > 0) {
    html += `<span class="link-indicator" title="${escapeHTML(succTooltip)}">
      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>
      ${succCount}
    </span>`;
  }
  html += '</div>';
  return html;
};

/**
 * Erstellt HTML für die Verknüpfungs-Buttons im Bearbeiten-Modus
 * @param {Entry} entry - Der Eintrag
 * @returns {string} HTML-String für die Buttons
 */
const buildLinkEditButtons = (entry) => {
  const predCount = (entry.predecessors || []).length;
  const succCount = (entry.successors || []).length;
  const predTitle = typeof t === 'function' ? t('dialog.predecessors') : 'Vorgänger festlegen';
  const succTitle = typeof t === 'function' ? t('dialog.successors') : 'Nachfolger festlegen';
  const managePredTitle = typeof t === 'function' ? t('dialog.managePredecessors') : 'Vorgänger pflegen';
  const manageSuccTitle = typeof t === 'function' ? t('dialog.manageSuccessors') : 'Nachfolger pflegen';
  return `
    <div class="link-edit-row">
      <button type="button" class="link-edit-btn" data-link-action="add-predecessor" title="${predTitle}">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"/></svg>
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
      </button>
      <button type="button" class="link-edit-btn" data-link-action="manage-predecessors" title="${managePredTitle} (${predCount})">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"/></svg>
        ${predCount}
      </button>
      <button type="button" class="link-edit-btn" data-link-action="add-successor" title="${succTitle}">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
      </button>
      <button type="button" class="link-edit-btn" data-link-action="manage-successors" title="${manageSuccTitle} (${succCount})">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>
        ${succCount}
      </button>
    </div>
  `;
};

/**
 * Erstellt HTML für die Endzeitpunkt-Spalte (inkl. wiederkehrende Ereignisse)
 * @param {Entry} e - Der Eintrag
 * @returns {string} HTML-String
 */
const buildEndCell = (e) => {
  let html = `<span class="badge">${e.end || ''}</span>`;

  if (e.recurring && e.date) {
    const nextUTC = getNextOccurrence(e.date);
    const nextISO = utcToISO(nextUTC);
    const age = getAgeAtDate(e.date, nextUTC);
    const daysUntil = daysUntilNext(e.date);

    html += `<div class="recurring-info">`;
    const nextOccTitle = typeof t === 'function' ? t('time.nextOccurrence') : 'Nächstes Vorkommen';
    html += `<span class="recurring-badge" title="${nextOccTitle}">`;
    html += `${nextISO}`;
    if (age != null) {
      html += ` (${age}.)`;
    }
    html += `</span>`;

    // Countdown
    if (daysUntil != null && daysUntil > 0) {
      const inWord = typeof t === 'function' ? t('time.in') : 'in';
      const daysWord = typeof tn === 'function' ? tn('unit.day', daysUntil) : (daysUntil === 1 ? 'Tag' : 'Tagen');
      html += `<span class="recurring-countdown">${inWord} ${fmtNum(daysUntil)} ${daysWord}</span>`;
    } else if (daysUntil === 0) {
      const todayText = typeof t === 'function' ? t('time.todayExclaim') : 'heute!';
      html += `<span class="recurring-countdown recurring-today">${todayText}</span>`;
    }

    // Meilenstein-Hinweis
    const ms = getNextMilestone(e.date);
    if (ms && ms.yearsUntil > 0 && ms.yearsUntil <= 5) {
      const inWord = typeof t === 'function' ? t('time.in') : 'in';
      const yearsWord = typeof tn === 'function' ? tn('unit.year', ms.yearsUntil) : (ms.yearsUntil === 1 ? 'Jahr' : 'Jahren');
      html += `<span class="recurring-milestone">${ms.milestone}. ${inWord} ${ms.yearsUntil} ${yearsWord}</span>`;
    }

    html += `</div>`;
  }

  return html;
};

const buildDaysInner = (iso, endIso) => {
  const lines = linesForDisplay(iso, endIso);
  return lines
    .map((s, i) => {
      let cls = (i === 0 ? 'days-badge' : 'days-sub');
      if (shouldMarkLine(i, iso, endIso)) cls += ' days-milestone';
      if (endIso) cls += ' days-range';
      return `<span class="${cls}">${s}</span>`;
    })
    .join('');
};

const buildDaysCell = (iso, endIso) => `<div class="days-wrap">${buildDaysInner(iso, endIso)}</div>`;

const adjustDaysColWidth = () => {
  const badges = $$('.days .days-badge, .days .days-sub');
  let maxW = 120;
  for (const el of badges) {
    const w = el ? el.scrollWidth : 0;
    if (w > maxW) maxW = w;
  }
  document.documentElement.style.setProperty('--days-col-w', (maxW + 20) + 'px');
};

// ---------- Edit-Mode Helpers ----------
/**
 * Deaktiviert Aktions-Buttons bei anderen Einträgen während der Bearbeitung
 * Verhindert gleichzeitiges Bearbeiten mehrerer Einträge
 */
const disableOtherActions = () => {
  tbody.querySelectorAll('tr').forEach(tr => {
    if (tr.dataset.id !== editingId) {
      tr.querySelectorAll('.btn-icon[data-action]').forEach(btn => {
        btn.disabled = true;
      });
    }
  });
};

/**
 * Aktiviert alle Aktions-Buttons wieder nach Beenden der Bearbeitung
 */
const enableAllActions = () => {
  editingId = null;
  tbody.querySelectorAll('.btn-icon[data-action]').forEach(btn => {
    btn.disabled = false;
  });
};

// ---------- Rendering ----------
/**
 * Renders the table view
 */
const renderTable = () => {
  // Suchtext aus Filter-Zustand
  const q = currentFilter.query.toLowerCase();

  const filtered = entries
    .slice()
    .sort((a, b) => {
      const key = sortKey;
      const va = (a[key] || '').toString().toLowerCase();
      const vb = (b[key] || '').toString().toLowerCase();
      const cmp = va < vb ? -1 : (va > vb ? 1 : 0);
      const dir = (sortDir === 'asc') ? 1 : -1;
      if (cmp !== 0) return cmp * dir;
      // tie-breaker: Zeitpunkt absteigend
      if ((a.date || '') < (b.date || '')) return 1;
      if ((a.date || '') > (b.date || '')) return -1;
      return 0;
    })
    .filter(e => {
      // Textsuche (inkl. Notizen)
      const matchesText = !q || e.text.toLowerCase().includes(q) || (e.notes || '').toLowerCase().includes(q) || (e.date || '').includes(q) || (e.end || '').includes(q) || getCategoryLabel(e.category).toLowerCase().includes(q);

      // Kategorie-Filter (Multi-Select)
      let matchesCat = true;
      if (currentFilter.categories.length > 0) {
        if (currentFilter.categories.includes('none')) {
          matchesCat = currentFilter.categories.includes(e.category || 'none') ||
            (currentFilter.categories.includes('none') && !e.category);
        } else {
          matchesCat = currentFilter.categories.includes(e.category);
        }
      }

      // Datumsbereich-Filter
      let matchesDate = true;
      if (currentFilter.dateFrom || currentFilter.dateTo) {
        const entryDate = e.date || '';
        const entryEnd = e.end || entryDate;
        if (currentFilter.dateFrom && entryEnd < currentFilter.dateFrom) matchesDate = false;
        if (currentFilter.dateTo && entryDate > currentFilter.dateTo) matchesDate = false;
      }

      // Weitere Filter
      let matchesOther = true;
      if (currentFilter.hasNotes && !(e.notes && e.notes.trim())) matchesOther = false;
      if (currentFilter.isRecurring && !e.recurring) matchesOther = false;
      if (currentFilter.hasTimespan && !e.end) matchesOther = false;

      return matchesText && matchesCat && matchesDate && matchesOther;
    });

  tbody.innerHTML = '';
  for (const e of filtered) {
    const tr = document.createElement('tr');
    tr.dataset.id = e.id;

    // Text mit Hervorhebung
    const textDisplay = q ? highlightText(e.text, currentFilter.query) : escapeHTML(e.text);
    const notesDisplay = e.notes ? buildNotesDisplayWithHighlight(e.notes, currentFilter.query) : '';

    tr.innerHTML = `
      <td><span class="badge">${e.date || ''}</span>${buildLinkIndicators(e)}</td>
      <td>${buildEndCell(e)}</td>
      <td>${buildCategoryBadge(e.category)}</td>
      <td>${textDisplay}${notesDisplay}</td>
      <td class="days">${buildDaysCell(e.date, e.end)}</td>
      <td class="actions">
        <div class="actions-row">
          <button class="btn-icon" data-action="edit" title="${typeof t === 'function' ? t('btn.edit') : 'Bearbeiten'}" aria-label="${typeof t === 'function' ? t('btn.edit') : 'Bearbeiten'}"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"/><path d="M20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.82 1.82 3.75 3.75 1.82-1.82z"/></svg></button>
          <button class="btn-icon" data-action="dup" title="${typeof t === 'function' ? t('btn.duplicate') : 'Duplizieren'}" aria-label="${typeof t === 'function' ? t('btn.duplicate') : 'Duplizieren'}"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v12h2V3h12V1z"/><path d="M19 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v13z"/></svg></button>
          <button class="btn-icon danger" data-action="del" title="${typeof t === 'function' ? t('btn.delete') : 'Löschen'}" aria-label="${typeof t === 'function' ? t('btn.delete') : 'Löschen'}"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19a2 2 0 002 2h8a2 2 0 002-2V7H6v12z"/><path d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg></button>
        </div>
      </td>`;
    tbody.appendChild(tr);
  }
  adjustDaysColWidth();
  updateStatusBar();
};

/**
 * Renders the current view (table, month, week, or timeline)
 * View-aware wrapper that delegates to the appropriate renderer
 */
const render = () => {
  if (typeof getCurrentView !== 'function') {
    renderTable();
    return;
  }

  const view = getCurrentView();
  switch (view) {
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
      renderTable();
  }
};

function enterEditMode(tr, e) {
  // Bearbeitungsmodus aktivieren und andere Buttons deaktivieren
  editingId = e.id;

  const editable = document.createElement('tr');
  editable.dataset.id = e.id;
  editable.innerHTML = `
    <td>
      <input type="date" value="${e.date || ''}"/>
      ${buildLinkEditButtons(e)}
    </td>
    <td>
      <input type="date" value="${e.end || ''}"/>
      <label class="recurring-edit-label" style="display:flex;align-items:center;gap:0.4rem;margin-top:6px;font-size:0.8rem;color:var(--muted);cursor:pointer;">
        <input type="checkbox" class="recurring-checkbox" ${e.recurring ? 'checked' : ''} style="width:1rem;height:1rem;cursor:pointer;accent-color:var(--primary);"/>
        Wiederkehrend
      </label>
    </td>
    <td>${buildCategorySelect(e.category || '')}</td>
    <td>
      <input type="text" value="${escapeHTML(e.text)}" style="margin-bottom:6px"/>
      <textarea rows="2" placeholder="Notizen...">${escapeHTML(e.notes || '')}</textarea>
    </td>
    <td class="days">${buildDaysCell(e.date, e.end)}</td>
    <td class="actions"><div class="actions-row">
      <button class="btn-icon" data-action="save" title="${typeof t === 'function' ? t('btn.save') : 'Speichern'}" aria-label="${typeof t === 'function' ? t('btn.save') : 'Speichern'}"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.2l-3.5-3.5-1.4 1.4L9 19l12-12-1.4-1.4z"/></svg></button>
      <button class="btn-icon" data-action="cancel" title="${typeof t === 'function' ? t('btn.cancel') : 'Abbrechen'}" aria-label="${typeof t === 'function' ? t('btn.cancel') : 'Abbrechen'}"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.3 5.7L12 12l6.3 6.3-1.4 1.4L12 13.4l-6.3 6.3-1.4-1.4L10.6 12 4.3 5.7l1.4-1.4L12 10.6l4.9-4.9z"/></svg></button>
    </div></td>`;
  tbody.replaceChild(editable, tr);

  // Andere Aktions-Buttons deaktivieren
  disableOtherActions();

  const [dateIn, endIn] = editable.querySelectorAll('input[type="date"]');
  const textIn = editable.querySelector('input[type="text"]');
  const notesIn = editable.querySelector('textarea');
  const catIn = editable.querySelector('select');
  const recurringIn = editable.querySelector('.recurring-checkbox');
  const wrap = editable.querySelector('.days-wrap');
  const updateDays = () => { wrap.innerHTML = buildDaysInner(dateIn.value, endIn.value); adjustDaysColWidth(); };
  dateIn.addEventListener('input', updateDays);

  // Enddatum deaktiviert "wiederkehrend" im Edit-Modus
  const updateRecurringState = () => {
    if (endIn.value) {
      recurringIn.checked = false;
      recurringIn.disabled = true;
    } else {
      recurringIn.disabled = false;
    }
  };
  endIn.addEventListener('input', updateRecurringState);
  // Initial-Zustand setzen
  updateRecurringState();

  // Verknüpfungs-Buttons Event-Handler
  editable.querySelectorAll('[data-link-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.linkAction;
      if (action === 'add-predecessor') {
        showLinkSelectDialog(e.id, 'predecessor');
      } else if (action === 'manage-predecessors') {
        showLinkManageDialog(e.id, 'predecessor');
      } else if (action === 'add-successor') {
        showLinkSelectDialog(e.id, 'successor');
      } else if (action === 'manage-successors') {
        showLinkManageDialog(e.id, 'successor');
      }
    });
  });

  editable.querySelector('[data-action="save"]').addEventListener('click', () => {
    const newDate = dateIn.value || e.date;
    const newEnd = endIn.value || e.end;
    const newCat = catIn.value || '';
    const newNotes = notesIn.value || '';
    if (!validateDates(newDate, newEnd)) {
      alert(typeof t === 'function' ? t('msg.invalidDateRange') : 'Der Endzeitpunkt muss nach dem Zeitpunkt liegen.');
      endIn.focus();
      return;
    }
    const newRecurring = recurringIn.checked;
    const updated = { ...e, date: newDate, end: newEnd, category: newCat, text: textIn.value, notes: newNotes, recurring: newRecurring, updatedAt: nowISOTimestamp() };
    const idx = entries.findIndex(x => x.id === e.id); if (idx !== -1) entries[idx] = updated;
    enableAllActions();
    saveToLocalStorage(); render();
  });
  editable.querySelector('[data-action="cancel"]').addEventListener('click', () => {
    enableAllActions();
    render();
  });
}

// ---------- CRUD ----------
/**
 * Fügt einen neuen Eintrag hinzu
 * Liest Werte aus dem Eingabeformular und speichert den Eintrag
 */
function addEntry() {
  const date = dateEl.value || todayISO();
  const end = (endEl.value || '').trim();
  const category = categoryEl.value || '';
  const text = textEl.value.trim();
  const notes = notesEl.value.trim();
  if (!text) { textEl.focus(); return; }
  if (!validateDates(date, end)) {
    alert(typeof t === 'function' ? t('msg.invalidDateRange') : 'Der Endzeitpunkt muss nach dem Zeitpunkt liegen.');
    endEl.focus();
    return;
  }
  const t = nowISOTimestamp();
  const recurring = recurringEl.checked;
  entries.push({ id: uid(), date, end, category, text, notes, recurring, predecessors: [], successors: [], createdAt: t, updatedAt: t });
  dateEl.value = ''; endEl.value = ''; categoryEl.value = ''; textEl.value = ''; notesEl.value = ''; recurringEl.checked = false; recurringEl.disabled = false;
  dateEl.focus(); saveToLocalStorage(); render();
}

/**
 * Dupliziert einen bestehenden Eintrag
 * @param {string} id - ID des zu duplizierenden Eintrags
 */
function duplicateEntry(id) {
  const e = entries.find(x => x.id === id); if (!e) return;
  const t = nowISOTimestamp();
  // Duplizierte Einträge haben keine Verknüpfungen
  entries.push({ id: uid(), date: e.date, end: e.end, category: e.category || '', text: e.text, notes: e.notes || '', recurring: e.recurring || false, predecessors: [], successors: [], createdAt: t, updatedAt: t });
  saveToLocalStorage(); render();
}

/**
 * Löscht einen Eintrag nach Bestätigung
 * @param {string} id - ID des zu löschenden Eintrags
 */
function deleteEntry(id) {
  const confirmMsg = typeof t === 'function' ? t('dialog.confirmDelete') : 'Eintrag wirklich löschen?';
  if (!confirm(confirmMsg)) return;
  // Verknüpfungen zu diesem Eintrag bereinigen
  cleanupLinksForDeletedEntry(id);
  entries = entries.filter(e => e.id !== id);
  saveToLocalStorage();
  render();
}

// ---------- Verknüpfungs-Dialoge ----------
/**
 * Zeigt einen Dialog zum Festlegen einer Verknüpfung an
 * @param {string} entryId - ID des Eintrags
 * @param {'predecessor'|'successor'} type - Art der Verknüpfung
 */
function showLinkSelectDialog(entryId, type) {
  const entry = entries.find(e => e.id === entryId);
  if (!entry) return;

  const title = type === 'predecessor'
    ? (typeof t === 'function' ? t('dialog.predecessors') : 'Vorgänger festlegen')
    : (typeof t === 'function' ? t('dialog.successors') : 'Nachfolger festlegen');
  const existingLinks = type === 'predecessor' ? entry.predecessors : entry.successors;

  // Alle Einträge außer dem aktuellen und bereits verknüpften
  const availableEntries = entries.filter(e =>
    e.id !== entryId && !existingLinks.includes(e.id)
  ).sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h2 class="modal-title">${title}</h2>
        <button class="modal-close" title="${typeof t === 'function' ? t('btn.close') : 'Schließen'}">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
        </button>
      </div>
      <div class="modal-body">
        <div class="modal-filter">
          <input type="text" placeholder="${typeof t === 'function' ? t('placeholder.filterList') : 'Filter...'}" id="linkFilterInput" />
        </div>
        <div class="link-select-list" id="linkSelectList">
          ${availableEntries.length === 0
      ? '<div class="link-empty">Keine weiteren Ereignisse verfügbar</div>'
      : availableEntries.map(e => `
              <label class="link-select-item" data-id="${e.id}">
                <input type="radio" name="linkSelect" value="${e.id}" />
                <div class="link-select-info">
                  <div class="link-select-date">${e.date || 'Kein Datum'}${e.end ? ` – ${e.end}` : ''}</div>
                  <div class="link-select-text">${escapeHTML(e.text)}</div>
                </div>
              </label>
            `).join('')
    }
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" data-modal-action="cancel">${typeof t === 'function' ? t('btn.cancel') : 'Abbrechen'}</button>
        <button class="btn btn-primary" data-modal-action="confirm" ${availableEntries.length === 0 ? 'disabled' : ''}>${typeof t === 'function' ? t('btn.add') : 'Hinzufügen'}</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Filter-Funktionalität
  const filterInput = overlay.querySelector('#linkFilterInput');
  const listContainer = overlay.querySelector('#linkSelectList');

  filterInput.addEventListener('input', () => {
    const q = filterInput.value.toLowerCase();
    const items = listContainer.querySelectorAll('.link-select-item');
    items.forEach(item => {
      const text = item.textContent.toLowerCase();
      item.style.display = text.includes(q) ? '' : 'none';
    });
  });

  // Radio-Button Klick-Handler
  listContainer.addEventListener('click', (e) => {
    const item = e.target.closest('.link-select-item');
    if (item) {
      listContainer.querySelectorAll('.link-select-item').forEach(i => i.classList.remove('selected'));
      item.classList.add('selected');
      item.querySelector('input[type="radio"]').checked = true;
    }
  });

  // Schließen-Button
  overlay.querySelector('.modal-close').addEventListener('click', () => {
    overlay.remove();
  });

  // Abbrechen-Button
  overlay.querySelector('[data-modal-action="cancel"]').addEventListener('click', () => {
    overlay.remove();
  });

  // Hinzufügen-Button
  overlay.querySelector('[data-modal-action="confirm"]').addEventListener('click', () => {
    const selected = listContainer.querySelector('input[type="radio"]:checked');
    if (selected) {
      addLink(entryId, selected.value, type);
      saveToLocalStorage();
      overlay.remove();
      render();
    }
  });

  // ESC zum Schließen
  const handleEsc = (e) => {
    if (e.key === 'Escape') {
      overlay.remove();
      document.removeEventListener('keydown', handleEsc);
    }
  };
  document.addEventListener('keydown', handleEsc);

  // Fokus auf Filterfeld
  filterInput.focus();
}

/**
 * Zeigt einen Dialog zum Pflegen (Entfernen) von Verknüpfungen an
 * @param {string} entryId - ID des Eintrags
 * @param {'predecessor'|'successor'} type - Art der Verknüpfung
 */
function showLinkManageDialog(entryId, type) {
  const entry = entries.find(e => e.id === entryId);
  if (!entry) return;

  const title = type === 'predecessor'
    ? (typeof t === 'function' ? t('dialog.managePredecessors') : 'Vorgänger pflegen')
    : (typeof t === 'function' ? t('dialog.manageSuccessors') : 'Nachfolger pflegen');
  const linkedIds = type === 'predecessor' ? entry.predecessors : entry.successors;

  const linkedEntries = linkedIds
    .map(id => entries.find(e => e.id === id))
    .filter(Boolean)
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h2 class="modal-title">${title}</h2>
        <button class="modal-close" title="Schließen">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
        </button>
      </div>
      <div class="modal-body">
        <div class="link-manage-list" id="linkManageList">
          ${linkedEntries.length === 0
      ? '<div class="link-empty">Keine Verknüpfungen vorhanden</div>'
      : linkedEntries.map(e => `
              <div class="link-manage-item" data-id="${e.id}">
                <div class="link-manage-info">
                  <div class="link-manage-date">${e.date || 'Kein Datum'}${e.end ? ` – ${e.end}` : ''}</div>
                  <div class="link-manage-text">${escapeHTML(e.text)}</div>
                </div>
                <button class="link-manage-remove" data-remove-id="${e.id}">Entfernen</button>
              </div>
            `).join('')
    }
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" data-modal-action="close">Schließen</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const listContainer = overlay.querySelector('#linkManageList');

  // Entfernen-Buttons
  listContainer.addEventListener('click', (e) => {
    const removeBtn = e.target.closest('.link-manage-remove');
    if (removeBtn) {
      const targetId = removeBtn.dataset.removeId;
      removeLink(entryId, targetId, type);
      saveToLocalStorage();
      // Element aus der Liste entfernen
      const item = removeBtn.closest('.link-manage-item');
      item.remove();
      // Prüfen ob Liste leer ist
      if (listContainer.querySelectorAll('.link-manage-item').length === 0) {
        listContainer.innerHTML = '<div class="link-empty">Keine Verknüpfungen vorhanden</div>';
      }
      render();
    }
  });

  // Schließen-Button
  overlay.querySelector('.modal-close').addEventListener('click', () => {
    overlay.remove();
  });

  // Schließen-Button unten
  overlay.querySelector('[data-modal-action="close"]').addEventListener('click', () => {
    overlay.remove();
  });

  // ESC zum Schließen
  const handleEsc = (e) => {
    if (e.key === 'Escape') {
      overlay.remove();
      document.removeEventListener('keydown', handleEsc);
    }
  };
  document.addEventListener('keydown', handleEsc);
}

// ---------- Statusleiste ----------
/**
 * Aktualisiert die Statusleiste mit Dateiname und Eintragsanzahl
 */
const updateStatusBar = () => {
  // Dateiname
  const noFileText = typeof t === 'function' ? t('msg.noFile') : 'Keine Datei';
  statusFileEl.textContent = fileHandle ? fileHandle.name : noFileText;
  // Anzahl Einträge
  const total = entries.length;
  const visibleRows = tbody.querySelectorAll('tr').length;
  if (visibleRows < total) {
    const filteredText = typeof t === 'function'
      ? t('status.filtered', { visible: visibleRows, total: total })
      : `${visibleRows} von ${total} Einträgen`;
    statusCountEl.textContent = filteredText;
  } else {
    const entryLabel = typeof tn === 'function'
      ? tn('status.entries', total)
      : (total === 1 ? 'Eintrag' : 'Einträge');
    statusCountEl.textContent = `${total} ${entryLabel}`;
  }
};

/**
 * Aktualisiert den Speicherstatus in der Statusleiste
 * @param {string} status - 'saved', 'unsaved' oder anderer Wert für neutral
 */
const updateSaveStatus = (status) => {
  statusSavedEl.classList.remove('saved', 'unsaved');
  if (status === 'saved') {
    const lang = typeof i18n !== 'undefined' ? i18n.getCurrentLang() : 'de';
    const now = new Date();
    const time = now.toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' });
    statusSavedEl.textContent = `✓ ${typeof t === 'function' ? t('btn.save') : 'Gespeichert'} ${time}`;
    statusSavedEl.classList.add('saved');
  } else if (status === 'unsaved') {
    statusSavedEl.textContent = `● ${typeof t === 'function' ? t('msg.unsaved') : 'Ungespeichert'}`;
    statusSavedEl.classList.add('unsaved');
  } else {
    statusSavedEl.textContent = '—';
  }
};
