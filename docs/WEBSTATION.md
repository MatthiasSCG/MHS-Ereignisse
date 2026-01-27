# Synology Web Station Setup

Anleitung zur Bereitstellung der Ereignisse-App auf einem Synology NAS mit Web Station.

## Voraussetzungen

- Synology NAS mit DSM 7.x
- Web Station Paket installiert
- Optional: Gültiges SSL-Zertifikat (für PWA-Installation erforderlich)

## Installation

### 1. Verzeichnis erstellen

Erstelle einen Ordner für die Web-Anwendung:

```
/web/ereignisse/
```

Oder über File Station:
- Öffne File Station
- Navigiere zu `web` (wird von Web Station erstellt)
- Erstelle neuen Ordner `ereignisse`

### 2. Dateien kopieren

Kopiere folgende Dateien in den Ordner:

```
/web/ereignisse/
├── Ereignisse.html
├── manifest.json
├── sw.js
└── icons/
    ├── icon-192.png
    └── icon-512.png
```

**Wichtig:** Die PNG-Icons müssen zuerst generiert werden:
1. Öffne `icons/generate-icons.html` im Browser
2. Lade die Icons herunter
3. Kopiere sie in den `icons/` Ordner

### 3. Web Station konfigurieren

1. Öffne **Systemsteuerung** → **Web Station**
2. Klicke auf **Webdienst-Portal** → **Erstellen**
3. Wähle **Virtueller Host**
4. Konfiguriere:
   - **Name:** ereignisse
   - **Dokumentenstamm:** web/ereignisse
   - **HTTP Backend:** Apache oder Nginx
   - **Port:** 80 (oder eigener Port)

### 4. HTTPS aktivieren (empfohlen)

Für PWA-Installation ist HTTPS erforderlich:

1. **Systemsteuerung** → **Sicherheit** → **Zertifikat**
2. Zertifikat hinzufügen (Let's Encrypt oder eigenes)
3. In Web Station dem virtuellen Host zuweisen

## Zugriff

### Lokal (LAN)
```
http://[NAS-IP]/ereignisse/Ereignisse.html
https://[NAS-IP]/ereignisse/Ereignisse.html
```

### Mit Domain
```
https://ereignisse.meine-domain.de/Ereignisse.html
```

## PWA Installation

Nach dem Öffnen im Browser:

### Chrome/Edge (Desktop)
- Klicke auf das Install-Icon in der Adressleiste (⊕)
- Oder: Menü → "Ereignisse installieren"

### Chrome (Android)
- Menü → "Zum Startbildschirm hinzufügen"
- Oder: Banner erscheint automatisch

### Safari (iOS)
- Teilen-Button → "Zum Home-Bildschirm"

## Fehlerbehebung

### Service Worker registriert nicht
- Prüfe, ob HTTPS aktiv ist (Pflicht für Service Worker)
- Prüfe Browser-Konsole auf Fehler (F12)

### Icons werden nicht angezeigt
- Prüfe, ob die PNG-Dateien existieren
- Prüfe die Pfade in `manifest.json`

### Offline-Modus funktioniert nicht
- Lade die Seite mindestens einmal mit Internet
- Prüfe in DevTools → Application → Service Workers

## Updates

Bei neuen Versionen:

1. Dateien auf NAS überschreiben
2. CACHE_NAME in `sw.js` ist bereits an Version gebunden
3. Benutzer erhalten automatisch Update-Hinweis
4. Browser-Cache leeren falls nötig: `Ctrl+Shift+R`

## Datenspeicherung

Die Daten werden im **LocalStorage des Browsers** gespeichert:
- Jeder Browser hat eigene Daten
- Export/Import über JSON für Datenaustausch
- Keine serverseitige Speicherung
