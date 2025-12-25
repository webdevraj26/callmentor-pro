import { useMemo } from 'react';
import { Paper, Text, Group, Select, Center } from '@mantine/core';
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
import { Line } from 'react-chartjs-2';

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

interface ScoreTrendItem {
  _id: string;
  avgScore: number;
  callCount: number;
}

interface TeamPerformanceChartProps {
  scoreTrend: ScoreTrendItem[];
  dateRange: string;
  onDateRangeChange: (value: string | null) => void;
}

export default function TeamPerformanceChart({
  scoreTrend,
  dateRange,
  onDateRangeChange,
}: TeamPerformanceChartProps) {
  const chartData = useMemo(() => {
    const labels = scoreTrend.map((item) => {
      const date = new Date(item._id);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    const scores = scoreTrend.map((item) => item.avgScore);

    return {
      labels,
      datasets: [
        {
          label: 'Average Score',
          data: scores,
          borderColor: '#8b5cf6',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#8b5cf6',
        },
      ],
    };
  }, [scoreTrend]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1a1b1e',
        titleColor: '#fff',
        bodyColor: '#a1a1aa',
        borderColor: '#3f3f46',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (context: { raw: unknown }) => `Score: ${Math.round(context.raw as number)}%`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#71717a',
        },
      },
      y: {
        min: 0,
        max: 100,
        grid: {
          color: 'rgba(113, 113, 122, 0.2)',
        },
        ticks: {
          color: '#71717a',
          callback: (value: number | string) => `${value}%`,
        },
      },
    },
  };

  return (
    <Paper
      p="xl"
      radius="lg"
      style={{
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid var(--mantine-color-dark-4)',
      }}
    >
      <Group justify="space-between" mb="lg">
        <Text size="lg" fw={600} c="white">
          Performance Trend
        </Text>
        <Select
          size="xs"
          value={dateRange}
          onChange={onDateRangeChange}
          data={[
            { value: 'last7days', label: 'Last 7 days' },
            { value: 'last30days', label: 'Last 30 days' },
            { value: 'last90days', label: 'Last 90 days' },
          ]}
          w={140}
          styles={{
            input: {
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--mantine-color-dark-4)',
            },
          }}
        />
      </Group>
      <div style={{ height: 300 }}>
        {scoreTrend.length > 0 ? (
          <Line data={chartData} options={options} />
        ) : (
          <Center h="100%">
            <Text c="dimmed">No data available for this period</Text>
          </Center>
        )}
      </div>
    </Paper>
  );
}
