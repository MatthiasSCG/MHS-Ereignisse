# Projekt: Ereignisse

## Projektübersicht

**Name:** Ereignisse und deren Zeitraum zu heute
**Typ:** Single-Page Web-Anwendung (SPA)
**Autor:** Matthias
**Version:** 1.1
**Letzte Aktualisierung:** 2026-01-26

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
├── Ereignisse.html       # Hauptanwendung (Single-File)
├── PROJEKT.md            # Projektdokumentation
├── Pruefergebnisse.md    # Code-Review und Qualitätsprüfung
├── Ereignisse_Daten.json # Exportierte Daten (optional)
└── Archiv/               # Versionierte Sicherungen
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

### Versionierung

Bei jeder neuen Version sind folgende Schritte durchzuführen:

1. **Projektdokumentation aktualisieren:**
   - Versionsnummer in PROJEKT.md anpassen
   - Änderungshistorie mit neuen Features/Fixes ergänzen
   - Roadmap-Status aktualisieren (falls Features abgeschlossen)

2. **Archiv-Ordner erstellen:**
   - Neuen Unterordner im Archiv anlegen
   - Namensformat: `vXX.YY` (z.B. `v01.02` für Version 1.2)
   - Alle wichtigen Dateien in den Archiv-Ordner kopieren:
     - `Ereignisse.html`
     - `PROJEKT.md`
     - Weitere relevante Dateien (z.B. `Pruefergebnisse.md`)

3. **Qualitätsprüfung:**
   - Funktionalität im Browser testen
   - Pruefergebnisse.md bei Bedarf aktualisieren

### Archiv-Struktur

```
Archiv/
├── v01.00/           # Version 1.0
│   ├── Ereignisse.html
│   └── PROJEKT.md
├── v01.01/           # Version 1.1
│   ├── Ereignisse.html
│   └── PROJEKT.md
└── v01.02/           # Version 1.2 (Beispiel)
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

## Erweiterungsideen

Die folgenden Ideen sind für zukünftige Versionen vorgesehen und nach Kategorien geordnet.

### Funktionale Erweiterungen

#### ~~1. Kategorien/Tags~~ ✅ Implementiert in v1.1
- ~~Ereignisse mit Kategorien versehen (z.B. "Geburtstag", "Projekt", "Jubiläum")~~
- ~~Farbcodierung pro Kategorie~~
- ~~Filter nach Kategorien~~
- **Status:** ✅ Abgeschlossen

#### 2. Wiederkehrende Ereignisse
- Jährliche Wiederholungen (Geburtstage, Jahrestage)
- Automatische Berechnung des nächsten Vorkommens
- Option: "Zeige nur zukünftige Termine"
- **Aufwand:** Mittel | **Priorität:** Hoch

#### 3. Benachrichtigungen/Erinnerungen
- Browser-Notifications für bevorstehende Ereignisse
- Konfigurierbare Vorlaufzeit (1 Tag, 1 Woche, 1 Monat)
- Tägliche Zusammenfassung beim Öffnen
- **Aufwand:** Mittel | **Priorität:** Mittel

#### 4. Notizen/Beschreibungen
- Mehrzeiliges Notizfeld pro Ereignis
- Markdown-Unterstützung für Formatierung
- Anhänge/Links speichern
- **Aufwand:** Niedrig | **Priorität:** Mittel

#### 5. Export-Formate
- CSV-Export für Excel
- iCal-Export (.ics) für Kalender-Apps
- PDF-Export mit Druckansicht
- **Aufwand:** Mittel | **Priorität:** Niedrig

---

### Benutzeroberfläche

#### 6. Kalenderansicht
- Monatsansicht mit Ereignis-Markierungen
- Wochenansicht für detaillierte Planung
- Timeline-Darstellung für Zeitspannen
- **Aufwand:** Hoch | **Priorität:** Mittel

#### 7. Dashboard/Startseite
- Anstehende Ereignisse der nächsten 7/30 Tage
- Kürzlich vergangene Meilensteine
- Statistiken (ältestes Ereignis, Anzahl pro Kategorie)
- **Aufwand:** Mittel | **Priorität:** Mittel

#### 8. Drag & Drop
- Ereignisse per Drag & Drop neu anordnen
- Datum durch Ziehen ändern
- Mehrfachauswahl für Bulk-Aktionen
- **Aufwand:** Mittel | **Priorität:** Niedrig

#### 9. Erweiterte Theme-Optionen
- Automatischer Wechsel nach Tageszeit
- Zusätzliche Themes (High Contrast, Sepia)
- Benutzerdefinierte Farbschemata
- **Aufwand:** Niedrig | **Priorität:** Niedrig

---

### Technische Erweiterungen

#### 10. Progressive Web App (PWA)
- Vollständige Offline-Funktionalität mit Service Worker
- Installierbar auf Desktop und Mobile
- Hintergrund-Synchronisation
- **Aufwand:** Mittel | **Priorität:** Hoch

#### 11. Cloud-Synchronisation
- Optional: Synchronisation mit Google Drive/OneDrive
- Mehrere Geräte synchron halten
- Versionierung/Backup
- **Aufwand:** Hoch | **Priorität:** Niedrig

#### 12. Import-Funktionen
- CSV-Import aus Excel
- iCal-Import aus anderen Kalendern
- Merge-Funktion für mehrere Dateien
- **Aufwand:** Mittel | **Priorität:** Mittel

#### 13. Erweiterte Suche
- Volltextsuche in Notizen
- Datumsbereich-Filter (von-bis)
- Regex-Unterstützung für Power-User
- Speicherbare Suchfilter
- **Aufwand:** Niedrig | **Priorität:** Mittel

---

### Priorisierte Roadmap

| Phase | Features | Status |
|-------|----------|--------|
| **v1.1** | Kategorien/Tags | ✅ Abgeschlossen |
| **v1.2** | Wiederkehrende Ereignisse, Erweiterte Suche | Geplant |
| **v1.3** | PWA-Unterstützung, Notizen | Geplant |
| **v1.4** | Import/Export-Formate | Geplant |
| **v2.0** | Kalenderansicht, Dashboard | Idee |
| **v2.1** | Benachrichtigungen, Drag & Drop | Idee |
| **v3.0** | Cloud-Synchronisation | Idee |

---

## Lizenz

Interne Verwendung - Alle Rechte vorbehalten.

---

*Dokumentation erstellt mit Claude Code*
