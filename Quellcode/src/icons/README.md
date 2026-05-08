# App-Icons

Dieses Verzeichnis enthält die Icons für die PWA.

## Benötigte Dateien

| Datei | Größe | Verwendung |
|-------|-------|------------|
| `icon-192.png` | 192x192 px | Android, Chrome |
| `icon-512.png` | 512x512 px | Splash Screen, Store |
| `icon.svg` | Vektor | Quelle für PNG-Export |

## Icons generieren

### Option 1: Online-Tool
1. Öffne [PWA Asset Generator](https://progressier.com/pwa-icons-and-splash-screen-generator)
2. Lade `icon.svg` hoch
3. Lade die generierten PNGs herunter

### Option 2: Kommandozeile (mit Inkscape)
```bash
inkscape icon.svg -w 192 -h 192 -o icon-192.png
inkscape icon.svg -w 512 -h 512 -o icon-512.png
```

### Option 3: Browser-basiert
1. Öffne `generate-icons.html` im Browser
2. Klicke auf die Download-Links

## Vorschau

Das Icon zeigt einen stilisierten Kalender mit markierten Tagen in den App-Farben (Blau: #2563eb, Grün: #10b981).
