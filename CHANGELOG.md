# Changelog

Alle wesentlichen Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

Das Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.1.0/),
und dieses Projekt verwendet [Semantic Versioning](https://semver.org/lang/de/).

## [Unreleased]

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

[Unreleased]: https://github.com/MatthiasSCG/MHS-Ereignisse/compare/v1.6.0...HEAD
[1.6.0]: https://github.com/MatthiasSCG/MHS-Ereignisse/compare/v1.5.0...v1.6.0
[1.5.0]: https://github.com/MatthiasSCG/MHS-Ereignisse/compare/v1.4.0...v1.5.0
[1.4.0]: https://github.com/MatthiasSCG/MHS-Ereignisse/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/MatthiasSCG/MHS-Ereignisse/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/MatthiasSCG/MHS-Ereignisse/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/MatthiasSCG/MHS-Ereignisse/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/MatthiasSCG/MHS-Ereignisse/releases/tag/v1.0.0
