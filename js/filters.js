/**
 * filters.js - Filter-Logik, gespeicherte Filter
 * Ereignisse v1.15.0
 */
'use strict';

// Gespeicherte Filter
let savedFilters = [];
try {
  savedFilters = JSON.parse(localStorage.getItem(SAVED_FILTERS_KEY) || '[]');
} catch (e) {
  savedFilters = [];
}

// Aktueller Filter-Zustand
let currentFilter = {
  query: '',
  categories: [],
  dateFrom: '',
  dateTo: '',
  hasNotes: false,
  isRecurring: false,
  hasTimespan: false
};

/**
 * Berechnet Datum-Presets
 * @param {string} preset - Preset-Schlüssel
 * @returns {{from: string, to: string}} Datumsbereich
 */
const getDatePreset = (preset) => {
  const today = new Date();
  const todayStr = todayISO();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Montag
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const startOfYear = new Date(today.getFullYear(), 0, 1);
  const endOfYear = new Date(today.getFullYear(), 11, 31);

  const formatDate = (d) => d.toISOString().split('T')[0];
  const addDays = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };

  switch (preset) {
    case 'today': return { from: todayStr, to: todayStr };
    case 'this-week': return { from: formatDate(startOfWeek), to: formatDate(endOfWeek) };
    case 'this-month': return { from: formatDate(startOfMonth), to: formatDate(endOfMonth) };
    case 'this-year': return { from: formatDate(startOfYear), to: formatDate(endOfYear) };
    case 'last-7-days': return { from: formatDate(addDays(today, -7)), to: todayStr };
    case 'last-30-days': return { from: formatDate(addDays(today, -30)), to: todayStr };
    case 'next-7-days': return { from: todayStr, to: formatDate(addDays(today, 7)) };
    case 'next-30-days': return { from: todayStr, to: formatDate(addDays(today, 30)) };
    case 'past': return { from: '', to: formatDate(addDays(today, -1)) };
    case 'future': return { from: todayStr, to: '' };
    default: return { from: '', to: '' };
  }
};

/**
 * Zählt aktive Filter
 * @returns {number} Anzahl aktiver Filter
 */
const countActiveFilters = () => {
  let count = 0;
  if (currentFilter.categories.length > 0) count++;
  if (currentFilter.dateFrom || currentFilter.dateTo) count++;
  if (currentFilter.hasNotes) count++;
  if (currentFilter.isRecurring) count++;
  if (currentFilter.hasTimespan) count++;
  return count;
};

/**
 * Aktualisiert die Anzeige der aktiven Filter
 */
const updateActiveFilters = () => {
  const tags = [];

  // Kategorien
  if (currentFilter.categories.length > 0) {
    for (const cat of currentFilter.categories) {
      const label = cat === 'none'
        ? (typeof t === 'function' ? t('cat.without') : 'Ohne Kategorie')
        : getCategoryLabel(cat);
      tags.push({ type: 'category', value: cat, label });
    }
  }

  // Datumsbereich
  if (currentFilter.dateFrom || currentFilter.dateTo) {
    let label = '';
    const fromLabel = typeof t === 'function' ? t('label.from') : 'Von';
    const toLabel = typeof t === 'function' ? t('label.to') : 'Bis';
    if (currentFilter.dateFrom && currentFilter.dateTo) {
      label = `${currentFilter.dateFrom} – ${currentFilter.dateTo}`;
    } else if (currentFilter.dateFrom) {
      label = `${fromLabel} ${currentFilter.dateFrom}`;
    } else {
      label = `${toLabel} ${currentFilter.dateTo}`;
    }
    tags.push({ type: 'date', value: 'date', label: `📅 ${label}` });
  }

  // Weitere Filter
  if (currentFilter.hasNotes) {
    const notesLabel = typeof t === 'function' ? t('label.onlyWithNotes') : 'Mit Notizen';
    tags.push({ type: 'hasNotes', value: 'hasNotes', label: `📝 ${notesLabel}` });
  }
  if (currentFilter.isRecurring) {
    const recurLabel = typeof t === 'function' ? t('label.onlyRecurring') : 'Wiederkehrend';
    tags.push({ type: 'isRecurring', value: 'isRecurring', label: `🔄 ${recurLabel}` });
  }
  if (currentFilter.hasTimespan) {
    const spanLabel = typeof t === 'function' ? t('label.onlyWithTimespan') : 'Mit Zeitspanne';
    tags.push({ type: 'hasTimespan', value: 'hasTimespan', label: `📊 ${spanLabel}` });
  }

  // HTML erstellen
  if (tags.length === 0) {
    activeFiltersEl.innerHTML = '';
    return;
  }

  const activeLabel = typeof t === 'function' ? t('label.filter') : 'Aktive Filter';
  const removeTitle = typeof t === 'function' ? t('tooltip.remove') : 'Entfernen';
  let html = `<span class="active-filters-label">${activeLabel}:</span>`;
  for (const tag of tags) {
    html += `<span class="filter-tag" data-type="${tag.type}" data-value="${tag.value}">
      ${escapeHTML(tag.label)}
      <button class="filter-tag-remove" title="${removeTitle}">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.3 5.7L12 12l6.3 6.3-1.4 1.4L12 13.4l-6.3 6.3-1.4-1.4L10.6 12 4.3 5.7l1.4-1.4L12 10.6l4.9-4.9z"/></svg>
      </button>
    </span>`;
  }
  activeFiltersEl.innerHTML = html;

  // Event-Listener für Entfernen-Buttons
  activeFiltersEl.querySelectorAll('.filter-tag-remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tag = e.target.closest('.filter-tag');
      const type = tag.dataset.type;
      const value = tag.dataset.value;
      removeFilter(type, value);
    });
  });
};

/**
 * Entfernt einen Filter
 */
const removeFilter = (type, value) => {
  switch (type) {
    case 'category':
      currentFilter.categories = currentFilter.categories.filter(c => c !== value);
      const checkbox = categoryCheckboxes.querySelector(`input[value="${value}"]`);
      if (checkbox) {
        checkbox.checked = false;
        checkbox.closest('.category-checkbox').classList.remove('selected');
      }
      break;
    case 'date':
      currentFilter.dateFrom = '';
      currentFilter.dateTo = '';
      filterDateFrom.value = '';
      filterDateTo.value = '';
      filterDatePreset.value = '';
      break;
    case 'hasNotes':
      currentFilter.hasNotes = false;
      filterHasNotes.checked = false;
      break;
    case 'isRecurring':
      currentFilter.isRecurring = false;
      filterRecurring.checked = false;
      break;
    case 'hasTimespan':
      currentFilter.hasTimespan = false;
      filterHasTimespan.checked = false;
      break;
  }
  updateFilterBadge();
  updateActiveFilters();
  render();
};

/**
 * Aktualisiert das Filter-Badge
 */
const updateFilterBadge = () => {
  const count = countActiveFilters();
  if (count > 0) {
    filterBadge.textContent = count;
    filterBadge.style.display = 'inline-flex';
    advancedFilterBtn.classList.add('active');
  } else {
    filterBadge.style.display = 'none';
    advancedFilterBtn.classList.remove('active');
  }
};

/**
 * Setzt alle Filter zurück
 */
const resetAllFilters = () => {
  currentFilter = {
    query: '',
    categories: [],
    dateFrom: '',
    dateTo: '',
    hasNotes: false,
    isRecurring: false,
    hasTimespan: false
  };
  searchEl.value = '';
  filterDateFrom.value = '';
  filterDateTo.value = '';
  filterDatePreset.value = '';
  filterHasNotes.checked = false;
  filterRecurring.checked = false;
  filterHasTimespan.checked = false;
  categoryCheckboxes.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.checked = false;
    cb.closest('.category-checkbox').classList.remove('selected');
  });
  updateFilterBadge();
  updateActiveFilters();
  render();
};

/**
 * Hebt Suchbegriff im Text hervor
 */
const highlightText = (text, query) => {
  if (!query || !text) return escapeHTML(text);
  const escaped = escapeHTML(text);
  const queryLower = query.toLowerCase();
  const textLower = escaped.toLowerCase();
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
  return result;
};

/**
 * Speichert einen neuen Filter
 */
const saveCurrentFilter = () => {
  const promptText = typeof t === 'function' ? t('dialog.filterName') : 'Name für diesen Filter:';
  const name = prompt(promptText);
  if (!name || !name.trim()) return;

  const filter = {
    id: uid(),
    name: name.trim(),
    filter: { ...currentFilter }
  };
  savedFilters.push(filter);
  localStorage.setItem(SAVED_FILTERS_KEY, JSON.stringify(savedFilters));
  renderSavedFilters();
};

/**
 * Lädt einen gespeicherten Filter
 */
const loadSavedFilter = (id) => {
  const filter = savedFilters.find(f => f.id === id);
  if (!filter) return;

  currentFilter = { ...filter.filter };
  searchEl.value = currentFilter.query || '';
  filterDateFrom.value = currentFilter.dateFrom || '';
  filterDateTo.value = currentFilter.dateTo || '';
  filterDatePreset.value = '';
  filterHasNotes.checked = currentFilter.hasNotes || false;
  filterRecurring.checked = currentFilter.isRecurring || false;
  filterHasTimespan.checked = currentFilter.hasTimespan || false;

  categoryCheckboxes.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    const isSelected = currentFilter.categories.includes(cb.value);
    cb.checked = isSelected;
    cb.closest('.category-checkbox').classList.toggle('selected', isSelected);
  });

  updateFilterBadge();
  updateActiveFilters();
  render();
};

/**
 * Löscht einen gespeicherten Filter
 */
const deleteSavedFilter = (id) => {
  savedFilters = savedFilters.filter(f => f.id !== id);
  localStorage.setItem(SAVED_FILTERS_KEY, JSON.stringify(savedFilters));
  renderSavedFilters();
};

/**
 * Rendert die Liste der gespeicherten Filter
 */
const renderSavedFilters = () => {
  const deleteTitle = typeof t === 'function' ? t('btn.delete') : 'Löschen';
  const saveLabel = typeof t === 'function' ? t('btn.saveFilter') : 'Speichern...';
  let html = '';
  for (const filter of savedFilters) {
    html += `<button class="saved-filter-btn" data-id="${filter.id}" title="${escapeHTML(filter.name)}">
      ${escapeHTML(filter.name)}
      <button class="saved-filter-delete" data-id="${filter.id}" title="${deleteTitle}">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.3 5.7L12 12l6.3 6.3-1.4 1.4L12 13.4l-6.3 6.3-1.4-1.4L10.6 12 4.3 5.7l1.4-1.4L12 10.6l4.9-4.9z"/></svg>
      </button>
    </button>`;
  }
  html += `<button id="saveFilterBtn" class="save-filter-btn" title="${saveLabel}">
    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
    ${saveLabel}
  </button>`;
  savedFiltersList.innerHTML = html;

  // Event-Listener
  savedFiltersList.querySelectorAll('.saved-filter-btn[data-id]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      if (e.target.closest('.saved-filter-delete')) return;
      loadSavedFilter(btn.dataset.id);
    });
  });
  savedFiltersList.querySelectorAll('.saved-filter-delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteSavedFilter(btn.dataset.id);
    });
  });
  savedFiltersList.querySelector('#saveFilterBtn')?.addEventListener('click', saveCurrentFilter);
};
