/**
 * PieChart Component
 * Pie chart visualization showing average composition using Chart.js
 */

import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
  TooltipItem,
} from 'chart.js';
import ChartDataLabels, { Context } from 'chartjs-plugin-datalabels';
import { Entry, Field } from '../../types';
import { CHART_COLORS, parseLocalizedNumber } from '../../utils';
import './PieChart.css';

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  Title,
  ChartDataLabels
);

interface PieChartProps {
  entries: Entry[];
  selectedFields: Field[];
}

export function PieChart({ entries, selectedFields }: PieChartProps) {
  if (selectedFields.length === 0 || entries.length === 0) {
    return (
      <div className="pie-chart-empty">
        <p>Keine Daten zum Anzeigen.</p>
        <p className="pie-chart-empty__hint">
          Wähle Felder und einen Zeitraum mit Einträgen aus.
        </p>
      </div>
    );
  }

  // Calculate average values for each field
  const averages = selectedFields.map((field) => {
    const values: number[] = [];

    entries.forEach((entry) => {
      const value = entry.values[field.id];
      if (value !== undefined && value !== null) {
        const numValue = parseLocalizedNumber(String(value));
        if (numValue !== null) {
          values.push(numValue);
        }
      }
    });

    if (values.length === 0) return 0;

    const sum = values.reduce((acc, val) => acc + val, 0);
    return sum / values.length;
  });

  // Check if all averages are zero or no valid data
  const hasData = averages.some(avg => avg > 0);

  if (!hasData) {
    return (
      <div className="pie-chart-empty">
        <p>Keine gültigen Daten zum Anzeigen.</p>
        <p className="pie-chart-empty__hint">
          Die ausgewählten Felder haben keine Werte im gewählten Zeitraum.
        </p>
      </div>
    );
  }

  // Prepare chart data
  const labels = selectedFields.map((field) => `${field.name} (${field.unit})`);

  const colors = selectedFields.map((_, index) =>
    CHART_COLORS[index % CHART_COLORS.length]
  );

  const backgroundColors = colors.map(color => `${color}CC`); // 80% opacity

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Durchschnittswerte',
        data: averages,
        backgroundColor: backgroundColors,
        borderColor: colors,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          padding: 15,
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: true,
        text: 'Durchschnittliche Zusammensetzung',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
        padding: {
          top: 10,
          bottom: 20,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: TooltipItem<'pie'>) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((acc: number, val: number) => acc + val, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
            return `${label}: ${value.toFixed(2)} (${percentage}%)`;
          },
        },
      },
      datalabels: {
        color: '#fff',
        font: {
          weight: 'bold' as const,
          size: 14,
        },
        formatter: (value: number, context: Context) => {
          const fieldIndex = context.dataIndex;
          const field = selectedFields[fieldIndex];

          // If it's a percentage field, show only the value
          if (field && field.unit === '%') {
            return `${value.toFixed(1)}`;
          }

          // For absolute values, show value with unit
          return `${value.toFixed(1)} ${field?.unit || ''}`;
        },
        textAlign: 'center' as const,
      },
    },
  };

  return (
    <div className="pie-chart">
      <div className="pie-chart__info">
        <p className="pie-chart__description">
          Durchschnittswerte der ausgewählten Felder über {entries.length} {entries.length === 1 ? 'Eintrag' : 'Einträge'}
        </p>
      </div>
      <div className="pie-chart__container">
        <Pie data={chartData} options={options} />
      </div>
    </div>
  );
}
