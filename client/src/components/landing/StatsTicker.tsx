import { useEffect, useState } from 'react';
import { Container, Group, Text, Box, Divider, Skeleton } from '@mantine/core';
import { analyticsService } from '@/services/analytics';

// Fallback stats when API is loading or fails
const defaultStats = [
  { value: '0', label: 'Calls Analyzed' },
  { value: '0', label: 'Sales Teams' },
  { value: '0%', label: 'Avg Improvement' },
  { value: '4.9', label: 'G2 Rating' },
];

export function StatsTicker() {
  const [stats, setStats] = useState(defaultStats);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await analyticsService.getPublicStats();
        setStats([
          { value: data.totalCalls || '0', label: 'Calls Analyzed' },
          { value: data.totalTeams || '0', label: 'Sales Teams' },
          { value: data.avgImprovement || '0%', label: 'Avg Improvement' },
          { value: data.rating || '4.9', label: 'G2 Rating' },
        ]);
      } catch (error) {
        // Keep default stats on error
        console.error('Failed to fetch public stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <Box
      py="lg"
      style={{
        background: 'linear-gradient(90deg, #0a0a0c 0%, #1a1523 50%, #0a0a0c 100%)',
        borderTop: '1px solid rgba(139, 92, 246, 0.1)',
        borderBottom: '1px solid rgba(139, 92, 246, 0.1)',
      }}
    >
      <Container size="xl">
        <Group justify="center" gap="xl">
          {stats.map((stat, index) => (
            <Group key={stat.label} gap="xl">
              <Box ta="center">
                {isLoading ? (
                  <Skeleton height={28} width={60} mb={4} />
                ) : (
                  <Text
                    size="xl"
                    fw={700}
                    variant="gradient"
                    gradient={{ from: '#a78bfa', to: '#c4b5fd' }}
                  >
                    {stat.value}
                  </Text>
                )}
                <Text size="xs" c="dimmed" tt="uppercase" style={{ letterSpacing: 0.5 }}>
                  {stat.label}
                </Text>
              </Box>
              {index < stats.length - 1 && (
                <Divider orientation="vertical" color="dark.5" visibleFrom="md" />
              )}
            </Group>
          ))}
        </Group>
      </Container>
    </Box>
  );
}
