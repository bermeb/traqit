# Kuchendiagramm Feature

## Übersicht

Das Kuchendiagramm (Pie Chart) wurde in Version 1.1.0 hinzugefügt und bietet eine zusätzliche Visualisierungsmöglichkeit für Ihre Körperdaten.

## 🎯 Zweck

Das Kuchendiagramm zeigt die **durchschnittliche Zusammensetzung** Ihrer ausgewählten Messwerte über einen bestimmten Zeitraum. Dies ist besonders nützlich, um:

- Die relativen Proportionen verschiedener Messwerte zu vergleichen
- Schnell zu erkennen, welche Werte dominant sind
- Eine Übersicht über die durchschnittliche Zusammensetzung zu erhalten
- Datenverteilung auf einen Blick zu verstehen

## 📊 Funktionsweise

### Datenberechnung

Das Kuchendiagramm berechnet für jedes ausgewählte Feld den **Durchschnittswert** über alle Einträge im gewählten Zeitraum:

1. Alle Einträge im Zeitraum werden gefiltert
2. Für jedes Feld werden alle vorhandenen Werte gesammelt
3. Der Durchschnitt wird berechnet: `Summe aller Werte / Anzahl der Werte`
4. Die Durchschnittswerte werden im Kuchendiagramm dargestellt

### Beispiel

Wenn Sie folgende Felder über 7 Tage tracken:
- **Gewicht**: 75kg, 74.5kg, 75kg → Durchschnitt: 74.83kg
- **Körperfett**: 18%, 17.5%, 18% → Durchschnitt: 17.83%
- **Muskelmasse**: 60kg, 60.5kg, 60kg → Durchschnitt: 60.17kg

Das Kuchendiagramm zeigt diese drei Durchschnittswerte als Segmente, wobei jedes Segment proportional zu seinem Wert ist.

## 🎨 Features

### Visuelle Darstellung
- **Farbcodierung**: Jedes Feld erhält eine eindeutige Farbe (gleiche Farben wie in Linien- und Balkendiagrammen)
- **Legende**: Rechts neben dem Diagramm zeigt alle Felder mit ihren Farben
- **Titel**: "Durchschnittliche Zusammensetzung" über dem Diagramm
- **Info-Text**: Zeigt Anzahl der ausgewerteten Einträge

### Interaktivität
- **Hover-Effekt**: Bewegen Sie die Maus über ein Segment, um Details zu sehen
- **Tooltip**: Zeigt:
  - Feldname mit Einheit
  - Absoluter Durchschnittswert (2 Dezimalstellen)
  - Prozentualer Anteil (1 Dezimalstelle)

### Beispiel-Tooltip:
```
Gewicht (kg): 74.83 (48.9%)
```

## 🔧 Verwendung

### Auswahl des Kuchendiagramms

1. Gehe zu **Diagramme** (📈)
2. Wähle die gewünschten **Felder** aus (mindestens 1)
3. Wähle den **Zeitraum** (z.B. "30 Tage" oder Custom)
4. Wähle **"Kuchendiagramm"** als Diagramm-Typ

### Beste Anwendungsfälle

Das Kuchendiagramm eignet sich am besten für:

✅ **Gut geeignet:**
- Vergleich von 2-6 verschiedenen Messfeldern
- Übersicht über Körperzusammensetzung (Gewicht, Fett, Muskelmasse)
- Durchschnittliche Werte über längere Zeiträume (30+ Tage)
- Relative Proportionen verstehen

❌ **Weniger geeignet:**
- Zeitliche Entwicklung anzeigen (nutze Liniendiagramm)
- Genaue Wertevergleiche (nutze Balkendiagramm)
- Mehr als 6-8 Felder (wird unübersichtlich)

## 📱 Responsive Design

Das Kuchendiagramm passt sich automatisch an verschiedene Bildschirmgrößen an:

- **Desktop**: 400px Höhe, Legende rechts
- **Tablet** (≤768px): 350px Höhe
- **Mobile** (≤640px): 300px Höhe, kompakte Darstellung

## 🎨 Technische Details

### Komponenten

**Datei**: `src/components/charts/PieChart.tsx`

**Abhängigkeiten**:
- `react-chartjs-2` - React-Wrapper für Chart.js
- `chart.js` - Charting-Bibliothek
  - `ArcElement` - Kreissegmente
  - `Tooltip` - Hover-Informationen
  - `Legend` - Legende
  - `Title` - Diagramm-Titel

### Datenstruktur

```typescript
interface PieChartProps {
  entries: Entry[];          // Gefilterte Einträge
  selectedFields: Field[];   // Ausgewählte Felder
}
```

### Farbschema

Das Kuchendiagramm verwendet die gleichen Farben wie Linien- und Balkendiagramme aus `CHART_COLORS`:
- Segment-Hintergrund: 80% Deckkraft (CC)
- Segment-Rand: Volle Deckkraft, 2px Breite

## 📝 Konfiguration

### Chart.js Optionen

```javascript
{
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right',
      labels: {
        padding: 15,
        font: { size: 12 }
      }
    },
    title: {
      display: true,
      text: 'Durchschnittliche Zusammensetzung',
      font: { size: 16, weight: 'bold' }
    }
  }
}
```

## 🚀 Erweiterungsmöglichkeiten

Mögliche zukünftige Verbesserungen:

1. **Doughnut Chart**: Ring-Variante mit Loch in der Mitte
2. **Export**: Kuchendiagramm als Bild speichern
3. **Median statt Durchschnitt**: Option für robustere Statistik
4. **Gewichtete Durchschnitte**: Neuere Werte stärker gewichten
5. **Custom Labels**: Benutzerdefinierte Beschriftungen
6. **Animationen**: Smooth Transitions beim Datenwechsel

## 📊 Vergleich der Diagramm-Typen

| Feature | Liniendiagramm | Balkendiagramm | Kuchendiagramm |
|---------|---------------|----------------|----------------|
| **Zeitverlauf** | ✅ Ausgezeichnet | ✅ Gut | ❌ Nicht geeignet |
| **Vergleich mehrerer Werte** | ✅ Gut | ✅ Ausgezeichnet | ⚠️ Begrenzt (2-6 Felder) |
| **Übersicht/Zusammensetzung** | ❌ Nicht geeignet | ⚠️ Begrenzt | ✅ Ausgezeichnet |
| **Durchschnittswerte** | ⚠️ Möglich | ✅ Gut | ✅ Ausgezeichnet |
| **Trends erkennen** | ✅ Ausgezeichnet | ✅ Gut | ❌ Nicht geeignet |
| **Prozentuale Anteile** | ❌ Nicht geeignet | ⚠️ Begrenzt | ✅ Ausgezeichnet |

## 🎯 Beispiel-Szenarien

### Szenario 1: Körperzusammensetzung
**Felder**: Gewicht, Körperfett, Muskelmasse, Wasser
**Zeitraum**: Letzte 30 Tage
**Ergebnis**: Übersicht über durchschnittliche Körperzusammensetzung im letzten Monat

### Szenario 2: Krafttraining-Fokus
**Felder**: Brust-Umfang, Arm-Umfang, Bein-Umfang
**Zeitraum**: Letzte 3 Monate
**Ergebnis**: Welche Muskelgruppen dominant sind

### Szenario 3: Fortschritts-Übersicht
**Felder**: Alle getrackte Werte
**Zeitraum**: Gesamter Zeitraum
**Ergebnis**: Allgemeine Verteilung aller gemessenen Werte

## 🔍 Fehlerbehebung

### "Keine Daten zum Anzeigen"
- Stelle sicher, dass mindestens 1 Feld ausgewählt ist
- Prüfe, ob Einträge im gewählten Zeitraum existieren
- Überprüfe, ob die Felder Werte haben

### "Keine gültigen Daten zum Anzeigen"
- Alle Durchschnittswerte sind 0 oder null
- Wähle einen anderen Zeitraum mit vorhandenen Daten
- Prüfe, ob die Felder korrekt befüllt wurden

### Diagramm ist verzerrt
- Bei sehr unterschiedlichen Werten (z.B. 2kg vs. 70kg) kann das Diagramm unausgewogen wirken
- Dies ist normal und zeigt die tatsächlichen Proportionen
- Nutze Linien- oder Balkendiagramm für besseren Vergleich

## 📚 Weitere Ressourcen

- [Chart.js Dokumentation](https://www.chartjs.org/)
- [Pie Chart Best Practices](https://www.chartjs.org/docs/latest/charts/doughnut.html)
- Design-Prinzipien für Datenvisualisierung

---

**Version**: 1.1.0
**Erstellt**: Oktober 2025
**Status**: ✅ Vollständig implementiert
