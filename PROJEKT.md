# Projekt: Ereignisse

## Projektübersicht

**Name:** Ereignisse und deren Zeitraum zu heute
**Typ:** Single-Page Web-Anwendung (SPA)
**Autor:** Matthias
**Version:** 1.9
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
- **Kategorien:** Farbcodierte Kategorisierung von Ereignissen mit Multi-Select-Filter
- **Erweiterte Suche:** Datumsbereich-Filter, Multi-Kategorie-Filter, speicherbare Filter
- **Notizen:** Mehrzeilige Notizen für jedes Ereignis mit scrollbarer Anzeige
- **Verknüpfungen:** Vorgänger/Nachfolger-Beziehungen zwischen Ereignissen (n:m)
- **Wiederkehrende Ereignisse:** Jährliche Termine mit automatischer Berechnung des nächsten Vorkommens
- **Datenpersistenz:** Lokale Speicherung im Browser und Export/Import als JSON
- **Dark Mode:** Automatische Erkennung der Systemeinstellung mit manueller Umschaltung
- **PWA:** Installierbar als App mit Offline-Unterstützung

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
├── README.md             # GitHub-Startseite
├── Ereignisse.html       # Hauptanwendung (Single-File)
├── manifest.json         # PWA Web App Manifest
├── sw.js                 # PWA Service Worker
├── icons/                # PWA App-Icons
│   ├── icon.svg          # Vektor-Quelle
│   ├── icon-192.png      # Android/Chrome Icon
│   └── icon-512.png      # Splash Screen Icon
├── PROJEKT.md            # Projektdokumentation
├── CHANGELOG.md          # Änderungshistorie (Keep a Changelog)
├── Pruefergebnisse.md    # Code-Review und Qualitätsprüfung
├── docs/                 # Dokumentation
│   └── screenshots/      # UI-Screenshots
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
  notes: string;       // Mehrzeilige Notizen (optional)
  recurring: boolean;  // Jährlich wiederkehrendes Ereignis (optional)
  predecessors: string[];  // IDs der Vorgänger-Ereignisse (optional)
  successors: string[];    // IDs der Nachfolger-Ereignisse (optional)
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
    "notes": "Erste Notizen zum Projekt",
    "recurring": false,
    "predecessors": [],
    "successors": ["m2def456-abc123"],
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
| `Ctrl + F` | Suche fokussieren |
| `Ctrl + Shift + F` | Erweiterte Filter öffnen |
| `Escape` | Filter zurücksetzen |

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

Die vollständige Änderungshistorie befindet sich in [CHANGELOG.md](CHANGELOG.md).

Das Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.1.0/) und das Projekt verwendet [Semantic Versioning](https://semver.org/lang/de/).

---

## Erweiterungsideen & Roadmap

Alle geplanten Erweiterungen werden als [GitHub Issues](https://github.com/MatthiasSCG/MHS-Ereignisse/issues) verwaltet.

### Priorisierte Roadmap

| Phase | Features | Issues |
|-------|----------|--------|
| **v1.1** | Kategorien/Tags | ✅ Abgeschlossen |
| **v1.2** | Bugfix: Mehrfachbearbeitung | ✅ Abgeschlossen |
| **v1.3** | UI-Verbesserungen | ✅ Abgeschlossen |
| **v1.4** | Notizen | ✅ Abgeschlossen (#3, #20) |
| **v1.5** | Zentrale Versionsverwaltung | ✅ Abgeschlossen (#22) |
| **v1.6** | Ereignis-Verknüpfungen | ✅ Abgeschlossen (#24) |
| **v1.7** | PWA-Unterstützung | ✅ Abgeschlossen (#9) |
| **v1.8** | Wiederkehrende Ereignisse | ✅ Abgeschlossen (#1) |
| **v1.9** | Erweiterte Suche | ✅ Abgeschlossen (#12) |
| **v2.0** | Kalenderansicht, Dashboard | #5, #6 |
| **v2.1** | Import/Export-Formate, Benachrichtigungen | #11, #4, #2 |
| **v2.2** | Drag & Drop, Theme-Optionen | #7, #8 |
| **v3.0** | Mehrsprachigkeit (i18n) | #13 |
| **v4.0** | Cloud-Synchronisation | #10 |

### Offene Issues nach Priorität

#### Mittlere Priorität
| Issue | Titel |
|-------|-------|
| #2 | Benachrichtigungen/Erinnerungen |
| #5 | Kalenderansicht |
| #6 | Dashboard/Startseite |
| #11 | Import-Funktionen |
| #13 | Mehrsprachigkeit (i18n) |

#### Niedrige Priorität
| Issue | Titel |
|-------|-------|
| #4 | Export-Formate erweitern |
| #7 | Drag & Drop |
| #8 | Erweiterte Theme-Optionen |
| #10 | Cloud-Synchronisation |

### Labels

| Label | Beschreibung |
|-------|--------------|
| `bug` | Fehler beheben |
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
