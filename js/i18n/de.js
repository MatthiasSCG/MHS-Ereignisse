/**
 * German translations (Deutsch)
 * Ereignisse v1.16.0
 */
'use strict';

i18n.registerLanguage('de', {
  // === App ===
  'app.title': 'Ereignisse',
  'app.description': 'Ereignisse und deren Zeitraum zu heute',

  // === Menu: File ===
  'menu.file': 'Datei',
  'menu.open': 'Öffnen',
  'menu.loadSample': 'Beispieldatei laden',
  'menu.save': 'Speichern',
  'menu.saveAs': 'Speichern unter…',

  // === Buttons & Actions ===
  'btn.add': 'Hinzufügen',
  'btn.save': 'Speichern',
  'btn.cancel': 'Abbrechen',
  'btn.delete': 'Löschen',
  'btn.edit': 'Bearbeiten',
  'btn.duplicate': 'Duplizieren',
  'btn.reset': 'Zurücksetzen',
  'btn.close': 'Schließen',
  'btn.today': 'Heute',
  'btn.resetAll': 'Alle zurücksetzen',
  'btn.saveFilter': 'Speichern...',

  // === Labels ===
  'label.date': 'Zeitpunkt',
  'label.endDate': 'Endzeitpunkt',
  'label.category': 'Kategorie',
  'label.event': 'Ereignis',
  'label.notes': 'Notizen (optional)',
  'label.recurring': 'Jährlich wiederkehrend',
  'label.search': 'Suche...',
  'label.filter': 'Filter',
  'label.advancedFilters': 'Erweiterte Filter',
  'label.dateRange': 'Datumsbereich',
  'label.from': 'Von',
  'label.to': 'Bis',
  'label.selectPeriod': 'Zeitraum wählen...',
  'label.categories': 'Kategorien',
  'label.moreFilters': 'Weitere Filter',
  'label.onlyWithNotes': 'Nur mit Notizen',
  'label.onlyRecurring': 'Nur wiederkehrende',
  'label.onlyWithTimespan': 'Nur mit Zeitspanne',
  'label.savedFilters': 'Gespeicherte Filter',
  'label.newEvent': 'Neues Ereignis',
  'label.differenceToToday': 'Differenz zu heute oder Endzeitpunkt',

  // === Placeholders ===
  'placeholder.event': 'Beschreibe das Ereignis…',
  'placeholder.notes': 'Zusätzliche Informationen...',
  'placeholder.filterList': 'Filter...',

  // === Tooltips ===
  'tooltip.darkMode': 'Dark Mode umschalten',
  'tooltip.search': 'Strg+F',
  'tooltip.advancedFilters': 'Erweiterte Filter (Strg+Umschalt+F)',
  'tooltip.sortDirection': 'Sortierrichtung umschalten',
  'tooltip.prevMonth': 'Vorheriger Monat',
  'tooltip.nextMonth': 'Nächster Monat',
  'tooltip.prevWeek': 'Vorherige Woche',
  'tooltip.nextWeek': 'Nächste Woche',
  'tooltip.earlier': 'Früher',
  'tooltip.later': 'Später',
  'tooltip.period': 'Zeitraum',
  'tooltip.sortAsc': 'Sortierung: aufsteigend',
  'tooltip.sortDesc': 'Sortierung: absteigend',
  'tooltip.themeLight': 'Helles Design',
  'tooltip.themeDark': 'Dunkles Design',
  'tooltip.remove': 'Entfernen',

  // === View Titles ===
  'view.dashboard': 'Dashboard',
  'view.table': 'Tabellenansicht',
  'view.month': 'Monatsansicht',
  'view.week': 'Wochenansicht',
  'view.timeline': 'Timeline-Ansicht',

  // === Sort Options ===
  'sort.date': 'Zeitpunkt',
  'sort.endDate': 'Endzeitpunkt',
  'sort.event': 'Ereignis',
  'sort.category': 'Kategorie',

  // === Categories ===
  'cat.none': 'Keine',
  'cat.geburtstag': 'Geburtstag',
  'cat.todestag': 'Todestag',
  'cat.jahrestag': 'Jahrestag',
  'cat.jubilaeum': 'Jubiläum',
  'cat.projekt': 'Projekt',
  'cat.termin': 'Termin',
  'cat.erinnerung': 'Erinnerung',
  'cat.sonstiges': 'Sonstiges',
  'cat.without': 'Ohne',

  // === Date Presets ===
  'preset.today': 'Heute',
  'preset.thisWeek': 'Diese Woche',
  'preset.thisMonth': 'Dieser Monat',
  'preset.thisYear': 'Dieses Jahr',
  'preset.last7Days': 'Letzte 7 Tage',
  'preset.last30Days': 'Letzte 30 Tage',
  'preset.next7Days': 'Nächste 7 Tage',
  'preset.next30Days': 'Nächste 30 Tage',
  'preset.past': 'Vergangene Ereignisse',
  'preset.future': 'Zukünftige Ereignisse',

  // === Time: Relative ===
  'time.today': 'heute',
  'time.tomorrow': 'morgen',
  'time.yesterday': 'gestern',
  'time.in': 'in',
  'time.ago': 'vor',
  'time.and': 'und',
  'time.nextOccurrence': 'Nächstes Vorkommen',
  'time.todayExclaim': 'heute!',

  // === Time: Units (1 = singular, 2 = plural/dative) ===
  'unit.day.1': 'Tag',
  'unit.day.2': 'Tagen',
  'unit.week.1': 'Woche',
  'unit.week.2': 'Wochen',
  'unit.month.1': 'Monat',
  'unit.month.2': 'Monaten',
  'unit.year.1': 'Jahr',
  'unit.year.2': 'Jahren',

  // === Time: Units nominative (for "X days" without preposition) ===
  'unit.day.nom.1': 'Tag',
  'unit.day.nom.2': 'Tage',
  'unit.week.nom.1': 'Woche',
  'unit.week.nom.2': 'Wochen',
  'unit.month.nom.1': 'Monat',
  'unit.month.nom.2': 'Monate',
  'unit.year.nom.1': 'Jahr',
  'unit.year.nom.2': 'Jahre',

  // === Calendar: Months ===
  'month.0': 'Januar',
  'month.1': 'Februar',
  'month.2': 'März',
  'month.3': 'April',
  'month.4': 'Mai',
  'month.5': 'Juni',
  'month.6': 'Juli',
  'month.7': 'August',
  'month.8': 'September',
  'month.9': 'Oktober',
  'month.10': 'November',
  'month.11': 'Dezember',

  // === Calendar: Months Short ===
  'month.short.0': 'Jan',
  'month.short.1': 'Feb',
  'month.short.2': 'Mär',
  'month.short.3': 'Apr',
  'month.short.4': 'Mai',
  'month.short.5': 'Jun',
  'month.short.6': 'Jul',
  'month.short.7': 'Aug',
  'month.short.8': 'Sep',
  'month.short.9': 'Okt',
  'month.short.10': 'Nov',
  'month.short.11': 'Dez',

  // === Calendar: Weekdays (0=Monday) ===
  'weekday.0': 'Montag',
  'weekday.1': 'Dienstag',
  'weekday.2': 'Mittwoch',
  'weekday.3': 'Donnerstag',
  'weekday.4': 'Freitag',
  'weekday.5': 'Samstag',
  'weekday.6': 'Sonntag',

  // === Calendar: Weekdays Short ===
  'weekday.short.0': 'Mo',
  'weekday.short.1': 'Di',
  'weekday.short.2': 'Mi',
  'weekday.short.3': 'Do',
  'weekday.short.4': 'Fr',
  'weekday.short.5': 'Sa',
  'weekday.short.6': 'So',

  // === Dashboard ===
  'dashboard.upcoming': 'Anstehend',
  'dashboard.recent': 'Kürzlich vergangen',
  'dashboard.milestones': 'Meilensteine',
  'dashboard.stats': 'Statistiken',
  'dashboard.groupToday': 'Heute',
  'dashboard.groupThisWeek': 'Diese Woche',
  'dashboard.groupThisMonth': 'Dieser Monat',
  'dashboard.groupLater': 'Später',
  'dashboard.noUpcoming': 'Keine anstehenden Ereignisse in den nächsten 30 Tagen',
  'dashboard.noRecent': 'Keine Ereignisse in den letzten 7 Tagen',
  'dashboard.noMilestones': 'Keine Meilensteine in den nächsten Jahren',
  'dashboard.noEvents': 'Keine Ereignisse vorhanden',
  'dashboard.totalEvents': 'Ereignisse gesamt',
  'dashboard.withTimespan': 'Mit Zeitspanne',
  'dashboard.recurringEvents': 'Wiederkehrend',
  'dashboard.categoriesUsed': 'Kategorien verwendet',
  'dashboard.years': 'Jahre',
  'dashboard.yearsShort': 'J.',
  'dashboard.inOneYear': 'in 1 Jahr',
  'dashboard.inYears': 'in {n} Jahren',
  'dashboard.inDays': 'in {n} Tagen',

  // === Dialogs ===
  'dialog.confirmDelete': 'Eintrag wirklich löschen?',
  'dialog.predecessors': 'Vorgänger festlegen',
  'dialog.successors': 'Nachfolger festlegen',
  'dialog.managePredecessors': 'Vorgänger pflegen',
  'dialog.manageSuccessors': 'Nachfolger pflegen',
  'dialog.filterName': 'Name für diesen Filter:',

  // === Messages ===
  'msg.confirmLoadSample': 'Vorhandene Daten werden durch Beispieldaten ersetzt. Fortfahren?',
  'msg.invalidDateRange': 'Der Endzeitpunkt muss nach dem Zeitpunkt liegen.',
  'msg.noFile': 'Keine Datei',
  'msg.unsaved': 'Ungespeichert',
  'msg.noEventsOnDay': 'Keine Ereignisse an diesem Tag',
  'msg.noEventsInRange': 'Keine Ereignisse im gewählten Zeitraum',
  'msg.updateAvailable': 'Eine neue Version ist verfügbar. Jetzt aktualisieren?',
  'msg.openError': 'Konnte Datei nicht öffnen: ',
  'msg.saveError': 'Konnte nicht speichern: ',
  'msg.saveAsError': 'Konnte nicht "Speichern unter" ausführen: ',

  // === Status Bar ===
  'status.entries.1': 'Eintrag',
  'status.entries.2': 'Einträge',
  'status.filtered': '{visible} von {total}',

  // === Table ===
  'table.hint': 'Tipp: Doppelklick auf eine Zeile zum Bearbeiten.',

  // === Links ===
  'link.predecessors': 'Vorgänger',
  'link.successors': 'Nachfolger',

  // === Language Names ===
  'lang.de': 'Deutsch',
  'lang.en': 'English',
  'lang.fr': 'Français',
  'lang.it': 'Italiano',
  'lang.es': 'Español'
});
