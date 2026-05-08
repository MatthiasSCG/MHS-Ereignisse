# Claude Code Projekthinweise

## Projekt

- **Typ:** Single-Page Web-Anwendung (HTML/CSS/JS, keine externen Abhängigkeiten)
- **Endprodukt:** `Ereignisse.html` am Repo-Root (Single-File, autark — wird durch den Build erzeugt, nicht direkt bearbeitet)
- **Quellcode:** `Quellcode/src/` (modular: `css/`, `js/`, `i18n/`, `icons/`, `manifest.json`, `template.html`)
- **Build:** `python Quellcode/build.py` bündelt den Quellcode zu `Ereignisse.html`
- **Dokumentation:** `PROJEKT.md` (Architektur), `CHANGELOG.md` (Änderungshistorie)
- **Repository:** https://github.com/MatthiasSCG/MHS-Ereignisse (privat)

## Architektur

Der Quellcode wird modular gepflegt und per Build zu einer einzigen, autarken `Ereignisse.html` zusammengefügt. Marker im Template `Quellcode/src/template.html`:

- `<!--{{INSERT:path}}-->` — Text einbetten (CSS, JS, i18n)
- `<!--{{DATA_URL:path}}-->` — Asset als base64-Data-URL (Icons)
- `<!--{{MANIFEST_DATA_URL:path}}-->` — Manifest mit eingebetteten Icon-Data-URLs

**Wichtig:** Niemals direkt in `Ereignisse.html` editieren — Änderungen am Quellcode müssen in `Quellcode/src/` erfolgen, dann `python Quellcode/build.py` ausführen.

## Workflow

### Issues
Zu jeder Änderung am Code muss ein GitHub Issue existieren. Bevor eine Änderung implementiert wird:
1. Prüfen, ob ein passendes Issue vorhanden ist
2. Falls nicht, neues Issue erstellen
3. Issue-Nummer im Commit referenzieren (z.B. `feat: Neue Funktion (#12)`)

### Nach Änderungen aktualisieren
1. `python Quellcode/build.py` ausführen — baut `Ereignisse.html` aus `Quellcode/src/` neu
2. `CHANGELOG.md` - Änderung dokumentieren (Keep a Changelog Format)
3. `PROJEKT.md` - Versionsnummer und Roadmap-Status aktualisieren
4. Commit mit Issue-Referenz erstellen (sowohl Quellcode unter `Quellcode/src/` als auch generierte `Ereignisse.html` einchecken)

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
