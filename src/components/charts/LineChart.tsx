/**
 * LineChart Component
 * Line chart visualization using Chart.js
 */

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Entry, Field } from '../../types';
import { formatDate, CHART_COLORS } from '../../utils';
import './LineChart.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface LineChartProps {
  entries: Entry[];
  selectedFields: Field[];
}

export function LineChart({ entries, selectedFields }: LineChartProps) {
  if (selectedFields.length === 0 || entries.length === 0) {
    return (
      <div className="line-chart-empty">
        <p>Keine Daten zum Anzeigen.</p>
        <p className="line-chart-empty__hint">
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
      borderColor: color,
      backgroundColor: `${color}33`, // 20% opacity
      borderWidth: 2,
      tension: 0.3,
      pointRadius: 4,
      pointHoverRadius: 6,
      fill: false,
      spanGaps: true, // Connect points even if there are nulls
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
        ticks: {
          callback: function (value: number | string) {
            return value;
          },
        },
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
  };

  return (
    <div className="line-chart">
      <div className="line-chart__container">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
