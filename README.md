# Ereignisse

> Lokale Web-Anwendung zur Verwaltung von Ereignissen mit automatischer Berechnung der Zeitdifferenz zum aktuellen Datum

<!-- Screenshots werden hier eingebunden, sobald vorhanden:
![Light Mode](docs/screenshots/light-mode.png)
![Dark Mode](docs/screenshots/dark-mode.png)
-->

## Features

- **Ereignisverwaltung** – Hinzufügen, Bearbeiten, Duplizieren und Löschen
- **Zeitberechnung** – Automatische Anzeige in Tagen, Wochen, Monaten und Jahren
- **Zeitspannen** – Unterstützung von Start- und Endzeitpunkt
- **Meilensteine** – Visuelle Hervorhebung bei runden Zahlen (1000 Tage, 100 Wochen, etc.)
- **Kategorien** – Farbcodierte Tags mit Filterfunktion
- **Notizen** – Mehrzeilige Notizen pro Ereignis
- **Verknüpfungen** – Vorgänger/Nachfolger-Beziehungen zwischen Ereignissen
- **Datenpersistenz** – LocalStorage + JSON-Export/Import
- **Dark Mode** – Automatisch oder manuell umschaltbar

## Verwendung

1. `Ereignisse.html` im Browser öffnen
2. Ereignisse über das Formular hinzufügen
3. Daten werden automatisch im Browser gespeichert

**Empfohlene Browser:** Chrome oder Edge (für volle File System API Unterstützung)

## Tastaturkürzel

| Kürzel | Aktion |
|--------|--------|
| `Ctrl + S` | Speichern |
| `Ctrl + Shift + S` | Speichern unter... |
| `Ctrl + O` | Datei öffnen |
| `Ctrl + Enter` | Ereignis hinzufügen (im Textfeld) |

## Browser-Kompatibilität

| Browser | File System API | Fallback |
|---------|-----------------|----------|
| Chrome 86+ | ✅ | – |
| Edge 86+ | ✅ | – |
| Firefox | ❌ | ✅ Download/Upload |
| Safari | ❌ | ✅ Download/Upload |

## Dokumentation

Ausführliche technische Dokumentation in [PROJEKT.md](PROJEKT.md)

Änderungshistorie in [CHANGELOG.md](CHANGELOG.md)

## Lizenz

Interne Verwendung – Alle Rechte vorbehalten.

---

*Version 1.6 · Entwickelt von Matthias*
