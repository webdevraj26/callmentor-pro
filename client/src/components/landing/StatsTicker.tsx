import { Container, Group, Text, Box, Divider } from '@mantine/core';

const stats = [
  { value: '50,000+', label: 'Calls Analyzed' },
  { value: '340+', label: 'Sales Teams' },
  { value: '27%', label: 'Avg Improvement' },
  { value: '4.9', label: 'G2 Rating' },
];

export function StatsTicker() {
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
                <Text
                  size="xl"
                  fw={700}
                  variant="gradient"
                  gradient={{ from: '#a78bfa', to: '#c4b5fd' }}
                >
                  {stat.value}
                </Text>
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
