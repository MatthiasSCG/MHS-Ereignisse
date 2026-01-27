# Projekt: Ereignisse

## Projektübersicht

**Name:** Ereignisse und deren Zeitraum zu heute
**Typ:** Single-Page Web-Anwendung (SPA)
**Autor:** Matthias
**Version:** 1.1
**Letzte Aktualisierung:** 2026-01-27
**Repository:** https://github.com/MatthiasSCG/MHS-Ereignisse (privat)

---

## Beschreibung

Eine lokale Web-Anwendung zur Verwaltung von Ereignissen mit automatischer Berechnung der Zeitdifferenz zum aktuellen Datum. Die Anwendung ermöglicht das Erfassen, Bearbeiten und Organisieren von wichtigen Terminen und Meilensteinen.

### Hauptfunktionen

- **Ereignisverwaltung:** Hinzufügen, Bearbeiten, Duplizieren und Löschen von Ereignissen
- **Zeitberechnung:** Automatische Anzeige der Differenz in Tagen, Wochen, Monaten und Jahren
- **Zeitspannen:** Unterstützung von Ereignissen mit Start- und Endzeitpunkt
- **Meilenstein-Hervorhebung:** Visuelle Markierung bei runden Zahlen (1000 Tage, 100 Wochen, etc.)
- **Kategorien:** Farbcodierte Kategorisierung von Ereignissen mit Filterfunktion
- **Datenpersistenz:** Lokale Speicherung im Browser und Export/Import als JSON
- **Dark Mode:** Automatische Erkennung der Systemeinstellung mit manueller Umschaltung

---

## Technische Spezifikation

### Technologien

| Komponente | Technologie |
|------------|-------------|
| Markup | HTML5 |
| Styling | CSS3 (CSS-Variablen, Flexbox, Grid) |
| Logik | Vanilla JavaScript (ES6+) |
| Speicherung | LocalStorage, File System Access API |
| Abhängigkeiten | Keine externen Libraries |

### Browser-Kompatibilität

| Browser | Version | File System API | Fallback |
|---------|---------|-----------------|----------|
| Chrome | 86+ | ✅ Vollständig | - |
| Edge | 86+ | ✅ Vollständig | - |
| Opera | 72+ | ✅ Vollständig | - |
| Firefox | Alle | ❌ | ✅ Download/Upload |
| Safari | Alle | ❌ | ✅ Download/Upload |

### Dateistruktur

```
0003_MHS_Ereignisse/
├── .git/                 # Git-Repository
├── .gitignore            # Git-Ignorierungsliste
├── Ereignisse.html       # Hauptanwendung (Single-File)
├── PROJEKT.md            # Projektdokumentation
├── Pruefergebnisse.md    # Code-Review und Qualitätsprüfung
├── Ereignisse_Daten.json # Exportierte Daten (optional, nicht versioniert)
└── Archiv/               # Lokale Sicherungen (nicht versioniert)
    └── v01.01/           # Version 1.1 (Format: vXX.YY)
        ├── Ereignisse.html
        └── PROJEKT.md
```

---

## Datenmodell

### Entry-Objekt

```typescript
interface Entry {
  id: string;          // Eindeutige ID (Zeitstempel + Zufallsstring)
  date: string;        // Startdatum im ISO-Format (YYYY-MM-DD)
  end: string;         // Enddatum im ISO-Format (optional)
  category: string;    // Kategorie-Schlüssel (optional)
  text: string;        // Beschreibung des Ereignisses
  createdAt: string;   // Erstellungszeitpunkt (ISO-Timestamp)
  updatedAt: string;   // Letzter Änderungszeitpunkt (ISO-Timestamp)
}
```

### JSON-Export-Format

```json
[
  {
    "id": "m1abc123-xyz789",
    "date": "2025-01-15",
    "end": "",
    "category": "projekt",
    "text": "Projektstart",
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  }
]
```

### Verfügbare Kategorien

| Schlüssel | Bezeichnung | Farbe (Light) | Farbe (Dark) |
|-----------|-------------|---------------|--------------|
| _(leer)_ | Keine | Grau | Grau |
| `geburtstag` | Geburtstag | Pink | Pink |
| `todestag` | Todestag | Dunkelgrau | Hellgrau |
| `jahrestag` | Jahrestag | Rot | Hellrot |
| `jubilaeum` | Jubiläum | Violett | Violett |
| `projekt` | Projekt | Blau | Hellblau |
| `termin` | Termin | Orange | Gelb |
| `erinnerung` | Erinnerung | Grün | Grün |
| `sonstiges` | Sonstiges | Schiefergrau | Schiefergrau |

---

## Funktionen im Detail

### Zeitberechnung

Die Anwendung berechnet verschiedene Darstellungen der Zeitdifferenz:

1. **Tage:** `vor 365 Tagen` / `in 100 Tagen`
2. **Wochen + Tage:** `vor 52 Wochen und 1 Tag`
3. **Monate + Wochen + Tage:** `vor 12 Monaten, 2 Wochen und 3 Tagen`
4. **Jahre + Monate + Wochen + Tage:** `vor 1 Jahr, 2 Monaten und 5 Tagen`

### Meilenstein-Erkennung

Besondere Zeitpunkte werden visuell hervorgehoben:

- **Tage:** Vielfache von 1000 (1000, 2000, 3000, ...)
- **Wochen:** Vielfache von 100 (100, 200, 300, ...)
- **Monate:** Vielfache von 100 (100, 200, 300, ...)
- **Jahre:** Exakte Jahreszahlen ohne Restmonate/-wochen/-tage

### Tastaturkürzel

| Kürzel | Aktion |
|--------|--------|
| `Ctrl + S` | Speichern |
| `Ctrl + Shift + S` | Speichern unter... |
| `Ctrl + O` | Datei öffnen |
| `Ctrl + Enter` | Ereignis hinzufügen (im Textfeld) |

---

## Sicherheit

### Content Security Policy

```html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self';
               script-src 'self' 'unsafe-inline';
               style-src 'self' 'unsafe-inline';
               img-src 'self' data:;
               font-src 'self';" />
```

### Implementierte Schutzmaßnahmen

- **XSS-Schutz:** `escapeHTML()` für alle Benutzereingaben
- **Input-Sanitization:** `sanitizeText()` für Textbereinigung
- **Keine externen Ressourcen:** Vollständig offline-fähig
- **Validierung:** Prüfung der Datumslogik (Start vor Ende)

---

## Benutzeroberfläche

### Farbschema (Light Mode)

| Variable | Wert | Verwendung |
|----------|------|------------|
| `--primary` | `#2563eb` | Primärfarbe (Buttons, Links) |
| `--ink` | `#111827` | Textfarbe |
| `--bg` | `#f5f7fb` | Hintergrundfarbe |
| `--card` | `#ffffff` | Kartenfarbe |
| `--muted` | `#6b7280` | Sekundärer Text |

### Farbschema (Dark Mode)

| Variable | Wert | Verwendung |
|----------|------|------------|
| `--bg` | `#0b1220` | Hintergrundfarbe |
| `--card` | `#0f172a` | Kartenfarbe |
| `--ink` | `#e5e7eb` | Textfarbe |
| `--muted` | `#94a3b8` | Sekundärer Text |

---

## Installation und Nutzung

### Lokale Nutzung

1. `Ereignisse.html` im Browser öffnen (Chrome oder Edge empfohlen)
2. Ereignisse über das Formular hinzufügen
3. Daten werden automatisch im Browser gespeichert

### Datenexport/-import

1. **Speichern:** `Ctrl + S` oder Button "Speichern"
2. **Speichern unter:** `Ctrl + Shift + S` oder Button "Speichern unter..."
3. **Öffnen:** `Ctrl + O` oder Button "Datei öffnen"

### Auf Netzlaufwerk

Die Datei kann direkt von einem Netzlaufwerk ausgeführt werden. Für volle File System Access API Unterstützung sollte die Datei über einen lokalen Webserver oder `file://` Protokoll geöffnet werden.

---

## Bekannte Einschränkungen

1. **LocalStorage-Limit:** Max. 5-10 MB je nach Browser
2. **File System API:** Nur in Chromium-Browsern (Chrome, Edge) verfügbar
3. **Offline-Modus:** Keine Synchronisation zwischen Geräten

---

## Entwicklungsworkflow

### Git & GitHub

Das Projekt wird über Git versioniert und auf GitHub gehostet.

**Repository:** https://github.com/MatthiasSCG/MHS-Ereignisse

#### Wichtige Git-Befehle

```bash
# Änderungen committen
git add Ereignisse.html PROJEKT.md Pruefergebnisse.md
git commit -m "Beschreibung der Änderungen"

# Zu GitHub hochladen
git push

# Version taggen (bei Releases)
git tag -a v1.2 -m "Version 1.2: Beschreibung"
git push --tags
```

#### Workflow bei Änderungen

1. **Änderungen durchführen** und testen
2. **PROJEKT.md aktualisieren:**
   - Versionsnummer anpassen
   - Änderungshistorie ergänzen
   - Roadmap-Status aktualisieren
3. **Commit erstellen** mit aussagekräftiger Message
4. **Push zu GitHub**
5. **Optional:** Tag für Release erstellen

### Lokales Archiv (optional)

Zusätzlich zur Git-Versionierung können lokale Archiv-Ordner angelegt werden.
Diese werden durch `.gitignore` von der Versionierung ausgeschlossen.

```
Archiv/
├── v01.00/           # Version 1.0
│   ├── Ereignisse.html
│   └── PROJEKT.md
└── v01.01/           # Version 1.1
    ├── Ereignisse.html
    └── PROJEKT.md
```

---

## Änderungshistorie

### Version 1.1 (2026-01-26)

- **Kategorien/Tags implementiert:**
  - 9 vordefinierte Kategorien mit Farbcodierung
  - Kategorie-Dropdown im Eingabeformular
  - Filter nach Kategorie in der Toolbar
  - Kategorie-Badge in der Tabelle
  - Kategorie beim Bearbeiten änderbar
  - Sortierung nach Kategorie möglich
  - Dark Mode Unterstützung für alle Kategorien
- Datenmigration von v1 zu v2 (LocalStorage)

### Version 1.0 (2026-01-26)

- Content Security Policy hinzugefügt
- Event-Delegation für bessere Performance
- Datumsvalidierung (Startdatum vor Enddatum)
- CSS bereinigt (redundante Definitionen entfernt)
- Externes Hintergrundbild entfernt
- Inline-Styles in CSS-Klassen ausgelagert
- File System Access API für Microsoft Edge optimiert
- Berechtigungsprüfung für Dateioperationen
- Verbessertes Error-Handling

---

## Erweiterungsideen & Roadmap

Alle geplanten Erweiterungen werden als [GitHub Issues](https://github.com/MatthiasSCG/MHS-Ereignisse/issues) verwaltet.

### Priorisierte Roadmap

| Phase | Features | Issues |
|-------|----------|--------|
| **v1.1** | Kategorien/Tags | ✅ Abgeschlossen |
| **v1.2** | Wiederkehrende Ereignisse, Erweiterte Suche | #1, #12 |
| **v1.3** | PWA-Unterstützung, Notizen | #9, #3 |
| **v1.4** | Import/Export-Formate | #11, #4 |
| **v2.0** | Kalenderansicht, Dashboard | #5, #6 |
| **v2.1** | Benachrichtigungen, Drag & Drop | #2, #7 |
| **v3.0** | Cloud-Synchronisation | #10 |

### Labels

| Label | Beschreibung |
|-------|--------------|
| `enhancement` | Neue Funktion oder Verbesserung |
| `ui` | Benutzeroberfläche |
| `technical` | Technische Verbesserung |
| `priority:high` | Hohe Priorität |
| `priority:medium` | Mittlere Priorität |
| `priority:low` | Niedrige Priorität |

---

## Lizenz

Interne Verwendung - Alle Rechte vorbehalten.

---

*Dokumentation erstellt mit Claude Code*
