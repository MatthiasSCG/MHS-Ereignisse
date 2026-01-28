# Changelog

Alle wesentlichen Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

Das Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.1.0/),
und dieses Projekt verwendet [Semantic Versioning](https://semver.org/lang/de/).

## [Unreleased]

### Fixed
- Verstecktes File-Input Element war sichtbar - CSS-Fix hinzugefügt (#29)

## [1.13.0] - 2026-01-28

### Fixed
- Timeline-Positionierung: Events werden jetzt korrekt unter dem jeweiligen Monat angezeigt (#5)
- Marker in Timeline erscheinen jetzt über den Balken, nicht darunter (#5)

### Added
- Wochenansicht mit 7-Tage-Übersicht (#5)
  - Navigation: vorherige/nächste Woche, Heute-Button
  - Kalenderwoche (KW) und Datumsbereich in der Überschrift
  - Ereignisse als farbige Blöcke mit Kategorie-Farbe
  - Klick auf Ereignis wechselt zur Tabelle und markiert den Eintrag
  - Klick auf Wochentag öffnet Detail-Popup
  - Heutiger Tag und Wochenenden visuell hervorgehoben
- Timeline-Ansicht für Zeitspannen (#5)
  - Horizontale Zeitachse mit Monatsmarkierungen
  - Zoom: 3, 6 oder 12 Monate wählbar
  - Navigation: früher/später, Heute zentrieren
  - Ereignisse mit Zeitspanne als farbige Balken
  - Einzelereignisse als Marker-Punkte
  - "Heute"-Linie als vertikale Markierung
  - Automatische Track-Zuweisung (keine Überlappung)
  - Klick auf Balken/Marker öffnet Detail oder wechselt zur Tabelle
- View-Toggle erweitert auf 4 Ansichten: Tabelle, Monat, Woche, Timeline
- Vollständige Dark Mode Unterstützung für Wochen- und Timeline-Ansicht
- Responsive Design für alle neuen Ansichten

### Changed
- View-System erweitert: `'table' | 'month' | 'week' | 'timeline'`
- Rückwärtskompatibilität: gespeicherter Wert `'calendar'` wird zu `'month'` migriert
- `render()` Funktion delegiert jetzt an alle 4 View-Renderer

## [1.12.0] - 2026-01-28

### Added
- Kalenderansicht als alternative Darstellung der Ereignisse (#5)
- View-Toggle in der Toolbar zum Wechseln zwischen Tabellen- und Kalenderansicht
- Monatskalender mit Navigation (vorheriger/nächster Monat, Heute-Button)
- Farbige Event-Dots zeigen Ereignisse pro Tag nach Kategorie
- Klick auf Tag öffnet Detail-Popup mit Ereignisliste
- "Bearbeiten"-Button im Popup wechselt zur Tabelle und scrollt zum Eintrag
- Zeitspannen werden über mehrere Tage angezeigt
- Wiederkehrende Ereignisse erscheinen am Jahrestag
- Filter wirken auf beide Ansichten (Tabelle und Kalender)
- View-Präferenz wird in localStorage gespeichert
- Vollständige Dark Mode Unterstützung für Kalender
- Responsive Design für Mobile (angepasste Darstellung bei kleinen Bildschirmen)
- Neue Dateien: `css/calendar.css`, `js/views.js`, `js/calendar.js`

### Changed
- `render()` Funktion ist jetzt view-aware und delegiert an `renderTable()` oder `renderCalendar()`

## [1.11.1] - 2026-01-27

### Added
- Favicon für Browser-Tab hinzugefügt (#28)
- SVG-Icon als primäres Favicon (scharf auf allen Auflösungen)
- PNG-Fallback für ältere Browser

## [1.11.0] - 2026-01-27

### Changed
- **Refactoring:** Single-File HTML in separate Dateien aufgeteilt (#27)
- `Ereignisse.html` umbenannt in `index.html` (Web-Standard)
- Neue Struktur mit `css/` und `js/` Ordnern
- 8 CSS-Module: base, layout, components, table, filters, dialogs, statusbar, dark-mode
- 5 JS-Module: utils, data, filters, ui, app
- HTML reduziert von ~3550 auf ~295 Zeilen
- CSP-Header angepasst (`'unsafe-inline'` entfernt)
- Service Worker Cache-Liste für alle neuen Dateien erweitert

### Technical
- Bessere Wartbarkeit durch modulare Struktur
- Jede Datei unter 25.000 Token (AI-Tool-kompatibel)
- Browser-Caching für CSS/JS möglich

## [1.10.0] - 2026-01-27

### Added
- Gespeicherte Filter werden im JSON-Export integriert (#26)
- Neues JSON-Format: `{ entries: [...], savedFilters: [...] }`
- Filter werden beim Import mit bestehenden zusammengeführt (Duplikate werden vermieden)

### Changed
- Rückwärtskompatibilität: Alte JSON-Dateien (nur Array) werden weiterhin unterstützt

## [1.9.0] - 2026-01-27

### Added
- Erweiterte Suche mit umfangreichen Filter-Funktionen (#12)
- Treffer-Hervorhebung in Text und Notizen bei Suche
- Datumsbereich-Filter mit Von/Bis-Auswahl
- Vordefinierte Zeiträume (Heute, Diese Woche, Dieser Monat, etc.)
- Multi-Kategorie-Filter (mehrere Kategorien gleichzeitig auswählbar)
- Zusätzliche Filter: Nur mit Notizen, Nur wiederkehrende, Nur mit Zeitspanne
- Aktive Filter als Tags mit Entfernen-Button angezeigt
- Filter-Badge zeigt Anzahl aktiver Filter
- Gespeicherte Filter: Aktuelle Filtereinstellungen speichern und laden
- Neue Tastenkürzel: Strg+F (Suche fokussieren), Strg+Umschalt+F (Erweiterte Filter öffnen), Escape (Filter zurücksetzen)

### Changed
- Kategorie-Dropdown durch erweitertes Filter-Panel ersetzt
- Suchfeld-Placeholder von "Filtern..." zu "Suche..." geändert

### Removed
- Einfaches Kategorie-Dropdown (ersetzt durch Multi-Select im Filter-Panel)

## [1.8.0] - 2026-01-27

### Added
- Wiederkehrende Ereignisse für jährliche Termine wie Geburtstage, Jahrestage (#1)
- Neues Feld `recurring` im Datenmodell (boolean)
- Checkbox "Jährlich wiederkehrend" im Eingabeformular
- Automatische Aktivierung bei Kategorien: Geburtstag, Todestag, Jahrestag
- Anzeige des nächsten Vorkommens unter der Endzeitpunkt-Spalte
- Countdown bis zum nächsten Vorkommen (z.B. "in 47 Tagen")
- Alter/Jubiläums-Anzeige (z.B. "36.")
- Meilenstein-Hinweise für runde Zahlen (10, 18, 25, 30, 40, 50... Jahre)
- Bearbeiten-Modus: Checkbox zum Ändern des wiederkehrend-Status
- Automatische Datenmigration für bestehende Einträge

## [1.7.0] - 2026-01-27

### Added
- Progressive Web App (PWA) Unterstützung (#9)
- Web App Manifest (`manifest.json`) für App-Installation
- Service Worker (`sw.js`) für Offline-Funktionalität und Caching
- App-Icons in verschiedenen Größen (192x192, 512x512)
- PWA Meta-Tags für iOS und Android
- Update-Benachrichtigung bei neuen Versionen
- Stale-While-Revalidate Caching-Strategie

## [1.6.0] - 2026-01-27

### Added
- Ereignis-Verknüpfungen: Vorgänger und Nachfolger (#24)
- Neue Felder `predecessors` und `successors` im Datenmodell (n:m Beziehung)
- Bidirektionale Verknüpfungen (wenn A Vorgänger von B, dann B automatisch Nachfolger von A)
- 4 Icons im Bearbeiten-Modus unter "Zeitpunkt": Vorgänger festlegen/pflegen, Nachfolger festlegen/pflegen
- Modal-Dialoge zum Festlegen (Radiobutton-Auswahl mit Textfilter) und Pflegen (Entfernen) von Verknüpfungen
- Verknüpfungs-Indikatoren in der Tabellenansicht mit Anzahl und Tooltip
- Automatische Bereinigung von Verknüpfungen beim Löschen eines Eintrags
- Automatische Datenmigration für bestehende Einträge

## [1.5.0] - 2026-01-27

### Added
- Zentrale Versionskonstante `APP_VERSION` für einheitliche Versionsverwaltung (#22)
- Versionsanzeige in der Statusleiste (z.B. "v1.5.0 · Matthias")

### Changed
- JSDoc `@version` durch Referenz auf `APP_VERSION` Konstante ersetzt

## [1.4.0] - 2026-01-27

### Added
- Neues `notes`-Feld im Datenmodell für mehrzeilige Notizen (#3)
- Textarea im Eingabeformular für Notizen
- Notizen beim Bearbeiten änderbar
- Suche durchsucht auch Notizen
- Automatische Datenmigration für bestehende Einträge

### Changed
- Notizen-Anzeige: Direkte Anzeige in der Tabelle statt Icon mit Tooltip (#20)
- Scrollbare Container für längere Notizen (max. 60px Höhe)
- Benutzerdefinierte Scrollbar-Styles für Notizen
- Dark Mode Unterstützung für Notizen-Anzeige

## [1.3.0] - 2026-01-27

### Changed
- Layout-Umstrukturierung: Filter-Toolbar oben, Tabelle im Fokus, Eingabe unten (#15)
- Header-Aktionen in Dropdown-Menü "Datei" zusammengefasst (#16)
- Button "Alle löschen" in "Zurücksetzen" umbenannt (#18)
- Visuelle Hierarchie: Tabellen-Card stärker hervorgehoben, Eingabe-Card dezenter (#19)

### Added
- Statusleiste am unteren Rand mit Dateiname, Eintragsanzahl und Speicherstatus (#17)

## [1.2.0] - 2026-01-27

### Fixed
- Mehrere Einträge gleichzeitig bearbeiten: Beim Speichern eines Eintrags gingen Änderungen in anderen bearbeiteten Einträgen verloren
- Lösung: Während ein Eintrag bearbeitet wird, sind die Bearbeitungs-Buttons bei anderen Einträgen deaktiviert
- Visuelles Feedback durch ausgegraute Buttons

### Added
- GitHub-Integration hinzugefügt
- Projektdokumentation auf GitHub Issues umgestellt

## [1.1.0] - 2026-01-26

### Added
- Kategorien/Tags mit 9 vordefinierten Kategorien und Farbcodierung
- Kategorie-Dropdown im Eingabeformular
- Filter nach Kategorie in der Toolbar
- Kategorie-Badge in der Tabelle
- Kategorie beim Bearbeiten änderbar
- Sortierung nach Kategorie möglich
- Dark Mode Unterstützung für alle Kategorien
- Datenmigration von v1 zu v2 (LocalStorage)

## [1.0.0] - 2026-01-26

### Added
- Content Security Policy für erhöhte Sicherheit
- Event-Delegation für bessere Performance
- Datumsvalidierung (Startdatum vor Enddatum)
- File System Access API für Microsoft Edge optimiert
- Berechtigungsprüfung für Dateioperationen
- Verbessertes Error-Handling

### Changed
- CSS bereinigt (redundante Definitionen entfernt)
- Externes Hintergrundbild entfernt
- Inline-Styles in CSS-Klassen ausgelagert

### Security
- XSS-Schutz durch `escapeHTML()` für alle Benutzereingaben
- Input-Sanitization durch `sanitizeText()` für Textbereinigung

[Unreleased]: https://github.com/MatthiasSCG/MHS-Ereignisse/compare/v1.13.0...HEAD
[1.13.0]: https://github.com/MatthiasSCG/MHS-Ereignisse/compare/v1.12.0...v1.13.0
[1.12.0]: https://github.com/MatthiasSCG/MHS-Ereignisse/compare/v1.11.1...v1.12.0
[1.11.1]: https://github.com/MatthiasSCG/MHS-Ereignisse/compare/v1.11.0...v1.11.1
[1.11.0]: https://github.com/MatthiasSCG/MHS-Ereignisse/compare/v1.10.0...v1.11.0
[1.10.0]: https://github.com/MatthiasSCG/MHS-Ereignisse/compare/v1.9.0...v1.10.0
[1.9.0]: https://github.com/MatthiasSCG/MHS-Ereignisse/compare/v1.8.0...v1.9.0
[1.8.0]: https://github.com/MatthiasSCG/MHS-Ereignisse/compare/v1.7.0...v1.8.0
[1.7.0]: https://github.com/MatthiasSCG/MHS-Ereignisse/compare/v1.6.0...v1.7.0
[1.6.0]: https://github.com/MatthiasSCG/MHS-Ereignisse/compare/v1.5.0...v1.6.0
[1.5.0]: https://github.com/MatthiasSCG/MHS-Ereignisse/compare/v1.4.0...v1.5.0
[1.4.0]: https://github.com/MatthiasSCG/MHS-Ereignisse/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/MatthiasSCG/MHS-Ereignisse/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/MatthiasSCG/MHS-Ereignisse/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/MatthiasSCG/MHS-Ereignisse/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/MatthiasSCG/MHS-Ereignisse/releases/tag/v1.0.0
