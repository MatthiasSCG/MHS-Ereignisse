#!/usr/bin/env python3
"""
Build-Skript fuer Ereignisse.html.

Verarbeitet das Template `src/template.html` mit drei Marker-Typen:

1. **INSERT-Marker** (`<!--{{INSERT:relative/pfad}}-->`)
   werden durch den verbatim-Inhalt der Quelldatei ersetzt.
   Genutzt, um CSS, JS und i18n-Sprachdateien einzubetten.

2. **DATA_URL-Marker** (`<!--{{DATA_URL:relative/pfad}}-->`)
   werden durch eine `data:<mime>;base64,...`-URL der Quelldatei
   ersetzt. Genutzt fuer Icons (SVG-Favicon, PNG-Icons).

3. **MANIFEST_DATA_URL-Marker** (`<!--{{MANIFEST_DATA_URL:pfad}}-->`)
   liest ein PWA-Manifest, ersetzt darin die `icons[*].src`-Pfade
   durch Data-URLs der Icon-Dateien und gibt das Ergebnis als
   `data:application/manifest+json;base64,...`-URL zurueck.

Schreibt das Ergebnis als `Ereignisse.html` in das Repo-Wurzelverzeichnis
(eine Ebene ueber dem Quellcode-Ordner).

Aufruf (aus dem Repo-Wurzelverzeichnis):
    python Quellcode/build.py

oder direkt im Quellcode-Ordner:
    python build.py
"""
from __future__ import annotations
import base64
import json
import mimetypes
import re
import sys
from pathlib import Path

# ---------------------------------------------------------------------------
# Konfiguration
# ---------------------------------------------------------------------------

ROOT     = Path(__file__).resolve().parent
SRC      = ROOT / "src"
TEMPLATE = SRC / "template.html"
OUTPUT   = ROOT.parent / "Ereignisse.html"

INSERT_MARKER       = re.compile(r'<!--\s*\{\{INSERT:([^}]+)\}\}\s*-->')
DATA_URL_MARKER     = re.compile(r'<!--\s*\{\{DATA_URL:([^}]+)\}\}\s*-->')
MANIFEST_URL_MARKER = re.compile(r'<!--\s*\{\{MANIFEST_DATA_URL:([^}]+)\}\}\s*-->')

# ---------------------------------------------------------------------------
# Hilfsfunktionen
# ---------------------------------------------------------------------------

def detect_mime(path: Path) -> str:
    """MIME-Type per Dateiendung. Faellt auf octet-stream zurueck."""
    mime, _ = mimetypes.guess_type(str(path))
    return mime or 'application/octet-stream'


def to_data_url(path: Path) -> str:
    """Beliebige Datei als base64-codierte Data-URL."""
    mime = detect_mime(path)
    payload = base64.b64encode(path.read_bytes()).decode('ascii')
    return f'data:{mime};base64,{payload}'


def manifest_to_data_url(manifest_path: Path) -> str:
    """Manifest mit Icon-Pfaden, die durch Data-URLs ersetzt werden."""
    manifest = json.loads(manifest_path.read_text(encoding='utf-8'))
    for icon in manifest.get('icons', []):
        src = icon.get('src')
        if not src:
            continue
        icon_path = (manifest_path.parent / src).resolve()
        if not icon_path.exists():
            raise FileNotFoundError(f'Icon im Manifest nicht gefunden: {icon_path}')
        icon['src'] = to_data_url(icon_path)
    payload_json = json.dumps(manifest, ensure_ascii=False, separators=(',', ':'))
    payload_b64  = base64.b64encode(payload_json.encode('utf-8')).decode('ascii')
    return f'data:application/manifest+json;base64,{payload_b64}'

# ---------------------------------------------------------------------------
# Build
# ---------------------------------------------------------------------------

def main() -> int:
    if not TEMPLATE.exists():
        sys.stderr.write(f'Fehler: Template fehlt: {TEMPLATE}\n')
        return 1

    text = TEMPLATE.read_text(encoding='utf-8')

    insert_log: list[str] = []
    data_url_log: list[str] = []
    manifest_log: list[str] = []

    # ----- Schritt 1: INSERT (Text einbetten) -----
    def insert_repl(m: re.Match) -> str:
        rel = m.group(1).strip()
        path = SRC / rel
        if not path.exists():
            raise FileNotFoundError(f'INSERT-Quelle fehlt: {path}')
        insert_log.append(rel)
        # Trailing newline strippen, damit das nachfolgende Template-Zeichen
        # (typischerweise </script> oder </style>) ohne Leerzeile anschliesst.
        return path.read_text(encoding='utf-8').rstrip('\n')
    text = INSERT_MARKER.sub(insert_repl, text)

    # ----- Schritt 2: DATA_URL (Asset als base64) -----
    def data_url_repl(m: re.Match) -> str:
        rel = m.group(1).strip()
        path = SRC / rel
        if not path.exists():
            raise FileNotFoundError(f'DATA_URL-Quelle fehlt: {path}')
        data_url_log.append(rel)
        return to_data_url(path)
    text = DATA_URL_MARKER.sub(data_url_repl, text)

    # ----- Schritt 3: MANIFEST_DATA_URL (Manifest mit eingebetteten Icons) -----
    def manifest_repl(m: re.Match) -> str:
        rel = m.group(1).strip()
        path = SRC / rel
        if not path.exists():
            raise FileNotFoundError(f'MANIFEST-Quelle fehlt: {path}')
        manifest_log.append(rel)
        return manifest_to_data_url(path)
    text = MANIFEST_URL_MARKER.sub(manifest_repl, text)

    # ----- Schritt 4: Sicherheitsnetz: keine Marker mehr im Output -----
    for marker_name, pattern in [
        ('INSERT',            INSERT_MARKER),
        ('DATA_URL',          DATA_URL_MARKER),
        ('MANIFEST_DATA_URL', MANIFEST_URL_MARKER),
    ]:
        leftover = pattern.findall(text)
        if leftover:
            sys.stderr.write(
                f'Fehler: {marker_name}-Marker nicht ersetzt: {leftover}\n'
            )
            return 1

    OUTPUT.write_text(text, encoding='utf-8')

    print(f'OK: {OUTPUT.relative_to(ROOT.parent)} geschrieben '
          f'({OUTPUT.stat().st_size:,} Bytes, {len(text.splitlines())} Zeilen)')
    if insert_log:
        print(f'    {len(insert_log)} INSERT')
    if data_url_log:
        print(f'    {len(data_url_log)} DATA_URL: {", ".join(data_url_log)}')
    if manifest_log:
        print(f'    {len(manifest_log)} MANIFEST_DATA_URL: {", ".join(manifest_log)}')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
