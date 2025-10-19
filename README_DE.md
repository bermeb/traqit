# TraqIt - Datenschutzfreundliches Body-Tracking PWA

Eine vollständig lokale, datenschutzfreundliche Progressive Web App zum Tracking körperbezogener Daten.

## 🎯 Features

### ✅ Bereits implementiert

- **Komplette Projektstruktur** - Modulare, saubere Architektur
- **TypeScript-Typen** - Vollständige Type-Safety
- **IndexedDB-Integration** - Lokale Datenspeicherung für Fields, Entries und Images
- **State Management** - Context API mit AppProvider
- **Custom Hooks** - useFields, useEntries, useImages
- **UI-Komponenten-Bibliothek**:
  - Button (Primary, Secondary, Danger, Ghost)
  - Input mit Label und Error-Handling
  - Card (mit Header, Body, Footer)
  - Modal (mit Backdrop, ESC-Support)
  - Loading (Spinner mit Full-Screen-Option)
- **Responsive Layout**:
  - Header mit Branding
  - Navigation mit Icons
- **Field Management (Vollständig)**:
  - Felder erstellen, bearbeiten, löschen
  - Sortierung
  - Typen (Zahl/Text)
- **Dashboard** - Übersicht mit Statistiken
- **Routing** - Hash-basiertes Routing
- **Global Styles** - CSS Variables, Mobile-First

### 🚧 Noch zu implementieren

#### 1. Entry Management (Priorität: Hoch)
**Dateien erstellen:**
- `src/components/entries/EntryForm.tsx` - Formular mit dynamischen Feldern basierend auf definierten Fields
- `src/components/entries/EntryCard.tsx` - Anzeige eines Eintrags mit Werten und Bild
- `src/components/entries/EntryList.tsx` - Liste aller Einträge
- `src/components/entries/ImageUpload.tsx` - Drag&Drop Upload für Bilder
- `src/pages/EntriesPage.tsx` - Vollständige Seite (aktuell Placeholder)

**Tasks:**
- Dynamisches Formular generieren basierend auf definierten Fields
- Bild-Upload mit Komprimierung
- Tages-basierte Anzeige
- Edit/Delete-Funktionen

#### 2. Chart Visualisierung (Priorität: Hoch)
**Dateien erstellen:**
- `src/components/charts/ChartView.tsx` - Container für Charts
- `src/components/charts/LineChart.tsx` - Liniendiagramm mit Chart.js
- `src/components/charts/BarChart.tsx` - Balkendiagramm
- `src/components/charts/ChartFilters.tsx` - Filter nach Zeitraum und Feldern
- `src/pages/ChartsPage.tsx` - Vollständige Seite (aktuell Placeholder)

**Tasks:**
- Chart.js konfigurieren (bereits installiert)
- Daten von IndexedDB aggregieren
- Filter-Logik implementieren
- Responsive Charts

#### 3. Export/Import (Priorität: Mittel)
**Dateien erstellen:**
- `src/services/export.ts` - CSV + ZIP-Export
- `src/services/import.ts` - ZIP-Import mit Validierung
- `src/components/backup/ExportSection.tsx`
- `src/components/backup/ImportSection.tsx`
- `src/pages/BackupPage.tsx` - Vollständige Seite (aktuell Placeholder)

**Tasks:**
- CSV-Generierung mit allen Feldern
- ZIP mit JSZip erstellen (Bilder + CSV)
- Import mit Konflikt-Behandlung
- Download mit FileSaver

#### 4. PWA-Funktionalität (Priorität: Mittel)
**Dateien konfigurieren:**
- `vite.config.ts` - vite-plugin-pwa setup
- `public/manifest.json` - PWA Manifest
- `public/icons/` - App-Icons generieren

**Tasks:**
- Service Worker konfigurieren
- Offline-Support
- Install-Prompt
- Cache-Strategie

#### 5. Polish & Testing
- Responsive Design testen
- Touch-Gestures für Mobile
- Error Boundaries
- Loading States
- Empty States
- Confirmation Dialogs

## 🚀 Schnellstart

```bash
# Dependencies installieren
npm install

# Dev-Server starten
npm run dev

# Build für Production
npm run build

# Preview Production Build
npm run preview
```

## 📁 Projektstruktur

```
src/
├── components/
│   ├── common/         # Wiederverwendbare UI-Komponenten
│   ├── fields/         # Field Management (✅ Komplett)
│   ├── entries/        # Entry Management (🚧 TODO)
│   ├── charts/         # Chart Visualisierung (🚧 TODO)
│   ├── backup/         # Export/Import (🚧 TODO)
│   └── layout/         # Header, Navigation
├── pages/              # Routen-Pages
├── services/           # Business Logic
│   ├── db.ts          # IndexedDB CRUD (✅ Komplett)
│   ├── storage.ts     # Image-Handling (✅ Komplett)
│   ├── export.ts      # (🚧 TODO)
│   └── import.ts      # (🚧 TODO)
├── hooks/              # Custom Hooks (✅ Komplett)
├── context/            # Global State (✅ Komplett)
├── types/              # TypeScript Types (✅ Komplett)
├── utils/              # Helper-Funktionen (✅ Komplett)
└── styles/             # Global CSS (✅ Komplett)
```

## 🔧 Technologie-Stack

- **React 19** + **TypeScript**
- **Vite** - Build Tool
- **IndexedDB** via `idb` - Lokale Datenbank
- **Chart.js** + `react-chartjs-2` - Visualisierung
- **JSZip** + **FileSaver** - Export/Import
- **date-fns** - Datums-Utilities
- **vite-plugin-pwa** - PWA-Support

## 📝 Nächste Schritte

1. **Entry Management implementieren** (höchste Priorität)
   - Dynamisches Formular
   - Bild-Upload integrieren
   - EntryList mit Datums-Gruppierung

2. **Charts implementieren**
   - LineChart mit mehreren Fields
   - Zeitraum-Filter
   - Responsive Design

3. **Export/Import**
   - CSV-Export mit allen Daten
   - ZIP mit Bildern
   - Import-Validierung

4. **PWA finalisieren**
   - Icons generieren
   - Service Worker konfigurieren
   - Offline-Test

## 🎨 Design-System

- **Colors**: Primär (#4A90E2), Sekundär (#7C4DFF)
- **Spacing**: 4px-System (xs, sm, md, lg, xl, xxl)
- **Typography**: System-Font-Stack
- **Radius**: 4px (sm), 8px (md), 12px (lg)
- **Shadows**: 4 Stufen (sm, md, lg, xl)

## 📄 Lizenz

Dieses Projekt ist für den persönlichen Gebrauch. Alle Daten bleiben lokal auf deinem Gerät.

---

**Status**: MVP (Minimum Viable Product) - Grundlegende Funktionen implementiert
**Version**: 0.1.0
**Letzte Aktualisierung**: 2025-01-18
