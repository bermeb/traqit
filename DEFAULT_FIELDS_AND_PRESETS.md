# Standardfelder und Chart-Presets

## Übersicht

In Version 1.1.0 wurden **Standardfelder** und **Chart-Presets** hinzugefügt, um den Einstieg in die App zu erleichtern und häufig verwendete Visualisierungen schnell verfügbar zu machen.

## 🏗️ Standardfelder

### Was sind Standardfelder?

Beim ersten Start der App werden automatisch 10 vordefinierte Messfelder erstellt. Diese Felder decken die häufigsten Körpermessungen ab und ermöglichen einen sofortigen Start ohne manuelle Konfiguration.

### Liste der Standardfelder

| Feld | Einheit | Beschreibung |
|------|---------|--------------|
| **KFA** | % | Körperfettanteil |
| **Knochenmasse** | % | Knochenmasse in Prozent |
| **Muskelmasse** | % | Muskelmasse in Prozent |
| **Wasseranteil** | % | Wasseranteil in Prozent |
| **Gewicht** | kg | Körpergewicht |
| **Bauch** | cm | Bauchumfang |
| **Taille** | cm | Taillenumfang |
| **Nacken** | cm | Nackenumfang |
| **Brustumfang** | cm | Brustumfang |
| **Bizepsumfang** | cm | Bizepsumfang |

### Funktionsweise

1. **Erste App-Start**: Beim ersten Öffnen der App werden die Standardfelder automatisch erstellt
2. **Lokaler Speicher**: Ein Flag wird in `localStorage` gesetzt, um zu verhindern, dass die Felder bei jedem Start neu erstellt werden
3. **Bestehende Daten**: Wenn bereits Felder existieren (z.B. durch Import), werden keine Standardfelder erstellt

### Technische Details

**Datei**: `src/utils/initializeDefaultFields.ts`

```typescript
export async function initializeDefaultFields(): Promise<boolean>
```

- Prüft `localStorage` Flag: `traqit-initial-fields-created`
- Prüft ob bereits Felder in der Datenbank existieren
- Erstellt Standardfelder wenn beide Bedingungen nicht erfüllt sind
- Gibt `true` zurück wenn Felder erstellt wurden, sonst `false`

**Integration**: Die Funktion wird in `AppProvider.tsx` während der App-Initialisierung aufgerufen:

```typescript
await initializeDefaultFields();
```

## 📊 Chart-Presets

### Was sind Chart-Presets?

Chart-Presets sind vorkonfigurierte Diagramm-Einstellungen, die häufig verwendete Visualisierungen mit einem Klick verfügbar machen. Sie wählen automatisch die richtigen Felder, den Zeitraum und den Diagramm-Typ aus.

### Verfügbare Presets

#### 1. 🎯 Körperzusammensetzung

**Beschreibung**: Durchschnittliche Zusammensetzung aus KFA, Knochenmasse, Muskelmasse und Wasseranteil

**Konfiguration**:
- **Felder**: KFA, Knochenmasse, Muskelmasse, Wasseranteil
- **Diagramm-Typ**: Kuchendiagramm
- **Zeitraum**: Letzte 3 Monate
- **Ideal für**: Übersicht über die Körperzusammensetzung

**Verwendung**:
1. Gehe zu **Diagramme** (📈)
2. Klicke im Bereich "Schnellauswahl" auf **"Körperzusammensetzung"**
3. Das Diagramm wird automatisch konfiguriert und angezeigt

### Wie funktionieren Presets?

1. **Feld-Matching**: Presets suchen nach Feldnamen (z.B. "KFA", "Muskelmasse")
2. **Automatische Konfiguration**: Wählt passende Felder, Zeitraum und Diagramm-Typ
3. **Smooth Scroll**: Scrollt automatisch zum Diagramm nach Anwendung
4. **Verfügbarkeits-Check**: Zeigt an, welche Felder verfügbar sind

### Visuelles Feedback

Die Preset-Karte zeigt folgende Informationen:
- **Icon**: Visuelles Symbol (🎯)
- **Name**: "Körperzusammensetzung"
- **Beschreibung**: Kurze Erklärung
- **Badges**:
  - Diagramm-Typ (z.B. "Kuchendiagramm")
  - Zeitraum (z.B. "3 Monate")
  - Feldstatus (z.B. "4/4 Felder" ✅ oder "2/4 Felder" ⚠️)
- **Button**: "Anwenden" (deaktiviert wenn keine Felder verfügbar)

## 🎨 UI/UX Features

### Preset-Komponente

**Datei**: `src/components/charts/ChartPresets.tsx`

**Features**:
- Responsive Card-Layout
- Hover-Effekte
- Disabled-State wenn Felder fehlen
- Warnungs-Badge bei fehlenden Feldern
- Smooth Scroll zum Diagramm

### Styling

**Datei**: `src/components/charts/ChartPresets.css`

**Highlights**:
- Gradient-Hintergrund
- Icon mit Schatten
- Responsive Breakpoints (Mobile/Tablet/Desktop)
- Hover-Animation (translateY + box-shadow)

## 🔧 Eigene Presets hinzufügen

### Konfigurationsdatei

**Datei**: `src/utils/chartPresets.ts`

```typescript
export interface ChartPreset {
  id: string;
  name: string;
  description: string;
  fieldNames: string[];
  chartType: ChartType;
  timeRangeMonths: number;
  icon: string;
}
```

### Beispiel: Neues Preset hinzufügen

```typescript
{
  id: 'weight-tracking',
  name: 'Gewichtsverlauf',
  description: 'Gewicht, Körperfett und Muskelmasse über 6 Monate',
  fieldNames: ['Gewicht', 'KFA', 'Muskelmasse'],
  chartType: 'line',
  timeRangeMonths: 6,
  icon: '📉',
}
```

## 📱 Responsive Design

### Desktop
- Preset-Cards horizontal angeordnet
- Icon links, Content mittig, Button rechts
- Volle Breite der Container

### Tablet (≤768px)
- Kompaktere Darstellung
- Kleinere Icons und Fonts
- Gestapeltes Layout

### Mobile (≤640px)
- Vertikales Layout
- Icon oben zentriert
- Content und Button gestapelt
- Touch-optimierte Button-Größen

## 🚀 Technische Implementierung

### 1. Default Fields Initialization

```typescript
// src/context/AppProvider.tsx
await initializeDefaultFields();
```

Wird nach DB-Initialisierung, aber vor Datenladen aufgerufen.

### 2. Chart Presets Integration

```typescript
// src/pages/ChartsPage.tsx
<ChartPresets
  fields={fields}
  onPresetSelect={handlePresetSelect}
/>
```

### 3. ChartView Enhancement

ChartView wurde erweitert um externe Steuerung zu unterstützen:

```typescript
interface ChartViewProps {
  initialFieldIds?: string[];
  initialStartDate?: Date;
  initialEndDate?: Date;
  initialChartType?: ChartType;
}
```

## 🎯 Vorteile

### Für neue Benutzer
✅ Sofort einsatzbereit ohne Konfiguration
✅ Vorgefertigte Felder für häufige Messungen
✅ Beispiel-Diagramme zum Lernen

### Für erfahrene Benutzer
✅ Schneller Zugriff auf häufig verwendete Ansichten
✅ Zeitersparnis bei Routine-Analysen
✅ Konsistente Visualisierungen

### Für Entwickler
✅ Einfache Erweiterbarkeit
✅ Typsicher mit TypeScript
✅ Saubere Separation of Concerns

## 🔍 Fehlerbehebung

### Standardfelder wurden nicht erstellt

**Ursache**: Flag bereits gesetzt oder Fehler bei DB-Zugriff

**Lösung**:
1. Browser-Console öffnen (F12)
2. Application → Local Storage
3. Eintrag `traqit-initial-fields-created` löschen
4. Seite neu laden

### Preset zeigt "0/4 Felder"

**Ursache**: Standardfelder wurden umbenannt oder gelöscht

**Lösung**:
1. Gehe zu **Felder** (📝)
2. Erstelle die fehlenden Felder manuell:
   - KFA (%)
   - Knochenmasse (%)
   - Muskelmasse (%)
   - Wasseranteil (%)
3. Zurück zu **Diagramme**
4. Preset sollte jetzt "4/4 Felder" zeigen

### Preset-Button ist deaktiviert

**Ursache**: Keine der benötigten Felder vorhanden

**Lösung**:
- Erstelle mindestens eines der im Preset benötigten Felder
- Button wird automatisch aktiviert

## 📊 Statistik-Hinweis

Die App trackt **nicht**:
- Welche Presets verwendet werden
- Wie oft Standardfelder genutzt werden
- Welche Felder erstellt/gelöscht werden

Alle Daten bleiben **100% lokal** auf deinem Gerät.

## 🎉 Zusammenfassung

**Neue Features in v1.1.0**:
- ✅ 10 Standardfelder für Body-Tracking
- ✅ Automatische Initialisierung beim ersten Start
- ✅ Chart-Preset-System
- ✅ "Körperzusammensetzung" Preset (Kuchendiagramm, 3 Monate)
- ✅ Responsive Preset-UI
- ✅ Feld-Verfügbarkeits-Check
- ✅ Smooth Scroll zu Diagrammen

**Kommende Presets** (optional):
- Gewichtsverlauf (Liniendiagramm, 6 Monate)
- Umfang-Tracking (Balkendiagramm, 1 Monat)
- Fortschritts-Übersicht (alle Felder, 12 Monate)

---

**Version**: 1.1.0
**Erstellt**: Oktober 2025
**Status**: ✅ Vollständig implementiert
