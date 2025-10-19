/**
 * BarChart Component
 * Bar chart visualization using Chart.js
 */

import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Entry, Field } from '../../types';
import { formatDate } from '../../utils';
import { CHART_COLORS } from '../../utils';
import './BarChart.css';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface BarChartProps {
  entries: Entry[];
  selectedFields: Field[];
}

export function BarChart({ entries, selectedFields }: BarChartProps) {
  if (selectedFields.length === 0 || entries.length === 0) {
    return (
      <div className="bar-chart-empty">
        <p>Keine Daten zum Anzeigen.</p>
        <p className="bar-chart-empty__hint">
          Wähle Felder und einen Zeitraum mit Einträgen aus.
        </p>
      </div>
    );
  }

  // Sort entries by date
  const sortedEntries = [...entries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Prepare chart data
  const labels = sortedEntries.map((entry) => formatDate(entry.date));

  const datasets = selectedFields.map((field, index) => {
    const data = sortedEntries.map((entry) => {
      const value = entry.values[field.id];
      return value !== undefined ? Number(value) : null;
    });

    const color = CHART_COLORS[index % CHART_COLORS.length];

    return {
      label: `${field.name} (${field.unit})`,
      data,
      backgroundColor: `${color}CC`, // 80% opacity
      borderColor: color,
      borderWidth: 1,
    };
  });

  const chartData = {
    labels,
    datasets,
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
      datalabels: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
      },
    },
  };

  return (
    <div className="bar-chart">
      <div className="bar-chart__container">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}
