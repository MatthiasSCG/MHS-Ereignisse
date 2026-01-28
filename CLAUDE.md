# Claude Code Projekthinweise

## Projekt

- **Typ:** Single-Page Web-Anwendung (HTML/CSS/JS, keine externen Abhängigkeiten)
- **Hauptdatei:** `Ereignisse.html` (alles in einer Datei)
- **Dokumentation:** `PROJEKT.md` (Architektur), `CHANGELOG.md` (Änderungshistorie)
- **Repository:** https://github.com/MatthiasSCG/MHS-Ereignisse (privat)

## Workflow

### Issues
Zu jeder Änderung am Code muss ein GitHub Issue existieren. Bevor eine Änderung implementiert wird:
1. Prüfen, ob ein passendes Issue vorhanden ist
2. Falls nicht, neues Issue erstellen
3. Issue-Nummer im Commit referenzieren (z.B. `feat: Neue Funktion (#12)`)

### Nach Änderungen aktualisieren
1. `CHANGELOG.md` - Änderung dokumentieren (Keep a Changelog Format)
2. `PROJEKT.md` - Versionsnummer und Roadmap-Status aktualisieren
3. Commit mit Issue-Referenz erstellen

### Commit-Format
```
<type>: <Beschreibung> (#<issue>)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```
Types: `feat`, `fix`, `docs`, `refactor`, `style`, `test`

## Code-Richtlinien

### Sicherheit
- `escapeHTML()` für alle Benutzereingaben (XSS-Schutz)
- `sanitizeText()` für Textbereinigung
- Datumsvalidierung (Start vor Ende)

### Sprache
- Code und Kommentare: Englisch
- UI-Texte und Dokumentation: Deutsch

## Windows-Umgebung

### GitHub CLI (gh)
Der `gh`-Befehl ist nicht im Bash-PATH verfügbar. Verwende stattdessen:

```powershell
powershell -Command "& 'C:\Program Files\GitHub CLI\gh.exe' <command>"
```

Beispiel:
```powershell
powershell -Command "& 'C:\Program Files\GitHub CLI\gh.exe' issue view 12 --repo MatthiasSCG/MHS-Ereignisse"
```
