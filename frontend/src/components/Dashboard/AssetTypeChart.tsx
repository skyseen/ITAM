import React from 'react';
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

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Mock data - Replace with actual API data
const mockData = {
  labels: ['LAPTOP', 'DESKTOP', 'TABLET'],
  datasets: [
    {
      label: 'Number of User Assets',
      data: [45, 30, 12],
      backgroundColor: 'rgba(54, 162, 235, 0.6)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1,
    },
  ],
};

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: false,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        precision: 0,
      },
    },
  },
};

export const AssetTypeChart: React.FC = () => {
  return (
    <div style={{ height: '100%', minHeight: '200px' }}>
      <Bar data={mockData} options={options} />
    </div>
  );
}; 