import { useMemo } from 'react';
import { Paper, Text } from '@mantine/core';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface MemberPerformance {
  userId: string;
  name: string;
  avgScore: number;
}

interface ScoreDistributionChartProps {
  members: MemberPerformance[];
}

export default function ScoreDistributionChart({ members }: ScoreDistributionChartProps) {
  const chartData = useMemo(() => {
    // Create score buckets
    const buckets: Record<string, number> = {
      '0-20': 0,
      '21-40': 0,
      '41-60': 0,
      '61-80': 0,
      '81-100': 0,
    };

    members.forEach((member) => {
      const score = member.avgScore;
      if (score <= 20) buckets['0-20']++;
      else if (score <= 40) buckets['21-40']++;
      else if (score <= 60) buckets['41-60']++;
      else if (score <= 80) buckets['61-80']++;
      else buckets['81-100']++;
    });

    return {
      labels: Object.keys(buckets),
      datasets: [
        {
          label: 'Team Members',
          data: Object.values(buckets),
          backgroundColor: [
            'rgba(239, 68, 68, 0.7)',
            'rgba(249, 115, 22, 0.7)',
            'rgba(234, 179, 8, 0.7)',
            'rgba(34, 197, 94, 0.7)',
            'rgba(139, 92, 246, 0.7)',
          ],
          borderColor: [
            'rgb(239, 68, 68)',
            'rgb(249, 115, 22)',
            'rgb(234, 179, 8)',
            'rgb(34, 197, 94)',
            'rgb(139, 92, 246)',
          ],
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    };
  }, [members]);

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
        callbacks: {
          label: (context: { raw: unknown }) =>
            `${context.raw} member${(context.raw as number) !== 1 ? 's' : ''}`,
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
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          color: '#71717a',
        },
        grid: {
          color: 'rgba(113, 113, 122, 0.2)',
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
      <Text size="lg" fw={600} mb="lg" c="white">
        Score Distribution
      </Text>
      <div style={{ height: 250 }}>
        <Bar data={chartData} options={options} />
      </div>
    </Paper>
  );
}
