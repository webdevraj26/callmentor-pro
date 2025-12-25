import {
  Container,
  Title,
  Text,
  Stack,
  Box,
  Paper,
  Group,
  Avatar,
  SimpleGrid,
  Badge,
} from '@mantine/core';
import { IconTrendingUp, IconQuote } from '@tabler/icons-react';

const caseStudy = {
  company: 'TechScale Inc.',
  industry: 'B2B SaaS',
  teamSize: '25 reps',
  quote: "Within 8 weeks, our average call score went from 62 to 79. More importantly, our win rate increased by 18%. The ROI was clear within the first month.",
  author: 'Marcus Johnson',
  role: 'VP of Sales',
  avatar: null,
  metrics: [
    { label: 'Score Improvement', before: '62', after: '79', change: '+27%' },
    { label: 'Win Rate', before: '23%', after: '27%', change: '+18%' },
    { label: 'Ramp Time', before: '90 days', after: '52 days', change: '-42%' },
    { label: 'Coaching Hours', before: '12/week', after: '3/week', change: '-75%' },
  ],
};

export function SuccessMetrics() {
  return (
    <Box py={{ base: 60, md: 100 }}>
      <Container size="lg">
        <Stack align="center" gap="xl">
          <Stack align="center" gap="xs" maw={500} ta="center">
            <Text size="sm" tt="uppercase" fw={600} c="violet.4" style={{ letterSpacing: 1 }}>
              Real Results
            </Text>
            <Title order={2} c="white">
              Numbers Don't Lie
            </Title>
            <Text c="dimmed">
              See how teams like yours are driving measurable improvement
            </Text>
          </Stack>

          <Paper
            p="xl"
            radius="lg"
            maw={900}
            w="100%"
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(139, 92, 246, 0.2)',
            }}
          >
            {/* Header */}
            <Group justify="space-between" mb="xl" wrap="wrap">
              <Group>
                <Box
                  w={48}
                  h={48}
                  style={{
                    borderRadius: 8,
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text size="lg" fw={700} c="white">TS</Text>
                </Box>
                <Box>
                  <Text size="lg" fw={600} c="white">{caseStudy.company}</Text>
                  <Group gap="xs">
                    <Badge size="sm" variant="light" color="gray">{caseStudy.industry}</Badge>
                    <Badge size="sm" variant="light" color="gray">{caseStudy.teamSize}</Badge>
                  </Group>
                </Box>
              </Group>
              <Badge
                size="lg"
                color="green"
                leftSection={<IconTrendingUp size={14} />}
              >
                8-Week Results
              </Badge>
            </Group>

            {/* Metrics Grid */}
            <SimpleGrid cols={{ base: 2, md: 4 }} spacing="lg" mb="xl">
              {caseStudy.metrics.map((metric) => (
                <Paper
                  key={metric.label}
                  p="md"
                  radius="md"
                  bg="dark.6"
                  ta="center"
                >
                  <Text size="xs" c="dimmed" tt="uppercase" mb="sm">
                    {metric.label}
                  </Text>
                  <Group justify="center" gap="xs" mb="xs">
                    <Text size="sm" c="gray.5" td="line-through">
                      {metric.before}
                    </Text>
                    <Text size="xl" fw={700} c="white">
                      {metric.after}
                    </Text>
                  </Group>
                  <Badge
                    size="sm"
                    color={metric.change.startsWith('+') ? 'green' : metric.change.startsWith('-') && metric.label.includes('Time') || metric.label.includes('Hours') ? 'green' : 'red'}
                    variant="light"
                  >
                    {metric.change}
                  </Badge>
                </Paper>
              ))}
            </SimpleGrid>

            {/* Quote */}
            <Box
              p="lg"
              style={{
                background: 'rgba(139, 92, 246, 0.05)',
                borderLeft: '3px solid var(--mantine-color-violet-5)',
                borderRadius: 8,
              }}
            >
              <IconQuote
                size={24}
                color="var(--mantine-color-violet-5)"
                style={{ opacity: 0.5, marginBottom: 8 }}
              />
              <Text size="md" c="gray.3" lh={1.7} mb="md">
                "{caseStudy.quote}"
              </Text>
              <Group>
                <Avatar color="violet" radius="xl">
                  {caseStudy.author.split(' ').map(n => n[0]).join('')}
                </Avatar>
                <Box>
                  <Text size="sm" fw={600} c="white">
                    {caseStudy.author}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {caseStudy.role}, {caseStudy.company}
                  </Text>
                </Box>
              </Group>
            </Box>
          </Paper>

          <Text size="xs" c="dimmed">
            Results based on actual customer data. Individual results may vary.
          </Text>
        </Stack>
      </Container>
    </Box>
  );
}
