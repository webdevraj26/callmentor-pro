import { useState } from 'react';
import {
  Container,
  Title,
  Text,
  Stack,
  Box,
  Paper,
  Slider,
  Group,
  SimpleGrid,
  ThemeIcon,
  Button,
} from '@mantine/core';
import { Link } from 'react-router-dom';
import {
  IconClock,
  IconTrendingUp,
  IconCurrencyDollar,
  IconArrowRight,
} from '@tabler/icons-react';

export function ROICalculator() {
  const [teamSize, setTeamSize] = useState(10);
  const [callsPerWeek, setCallsPerWeek] = useState(50);

  // Calculations
  const hoursReviewingPerWeek = Math.round(callsPerWeek * 0.25); // 15 min per call manual review
  const hoursSavedPerWeek = Math.round(hoursReviewingPerWeek * 0.85); // 85% time savings
  const hoursSavedPerYear = hoursSavedPerWeek * 52;
  const moneySavedPerYear = hoursSavedPerYear * 75; // $75/hr manager cost
  const projectedScoreImprovement = Math.min(35, 20 + teamSize * 0.5);
  const additionalRevenue = teamSize * 12000 * (projectedScoreImprovement / 100);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `$${Math.round(num / 1000)}K`;
    return `$${num}`;
  };

  return (
    <Box
      py={{ base: 60, md: 100 }}
      style={{
        background: 'linear-gradient(180deg, #0a0a0c 0%, #1a1523 100%)',
      }}
    >
      <Container size="lg">
        <Stack align="center" gap="xl">
          <Stack align="center" gap="xs" maw={500} ta="center">
            <Text size="sm" tt="uppercase" fw={600} c="violet.4" style={{ letterSpacing: 1 }}>
              ROI Calculator
            </Text>
            <Title order={2} c="white">
              See Your Potential Savings
            </Title>
            <Text c="dimmed">
              Adjust the sliders to match your team
            </Text>
          </Stack>

          <Paper
            p="xl"
            radius="lg"
            maw={800}
            w="100%"
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(139, 92, 246, 0.2)',
            }}
          >
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
              {/* Inputs */}
              <Stack gap="xl">
                <Box>
                  <Group justify="space-between" mb="xs">
                    <Text size="sm" c="white" fw={500}>
                      Sales Team Size
                    </Text>
                    <Text size="sm" c="violet.4" fw={600}>
                      {teamSize} reps
                    </Text>
                  </Group>
                  <Slider
                    value={teamSize}
                    onChange={setTeamSize}
                    min={1}
                    max={100}
                    step={1}
                    color="violet"
                    marks={[
                      { value: 1, label: '1' },
                      { value: 50, label: '50' },
                      { value: 100, label: '100' },
                    ]}
                  />
                </Box>

                <Box>
                  <Group justify="space-between" mb="xs">
                    <Text size="sm" c="white" fw={500}>
                      Calls Per Week (total)
                    </Text>
                    <Text size="sm" c="violet.4" fw={600}>
                      {callsPerWeek} calls
                    </Text>
                  </Group>
                  <Slider
                    value={callsPerWeek}
                    onChange={setCallsPerWeek}
                    min={10}
                    max={500}
                    step={10}
                    color="violet"
                    marks={[
                      { value: 10, label: '10' },
                      { value: 250, label: '250' },
                      { value: 500, label: '500' },
                    ]}
                  />
                </Box>

                <Text size="xs" c="dimmed" mt="md">
                  * Calculations based on industry averages: 15min manual review per call,
                  $75/hr manager cost, $12K quota impact per rep annually.
                </Text>
              </Stack>

              {/* Results */}
              <Stack gap="md">
                <Paper
                  p="md"
                  radius="md"
                  style={{
                    background: 'rgba(139, 92, 246, 0.1)',
                    border: '1px solid rgba(139, 92, 246, 0.2)',
                  }}
                >
                  <Group>
                    <ThemeIcon size={40} radius="md" color="violet" variant="light">
                      <IconClock size={20} />
                    </ThemeIcon>
                    <Box>
                      <Text size="xs" c="dimmed" tt="uppercase">
                        Time Saved Annually
                      </Text>
                      <Text size="xl" fw={700} c="white">
                        {hoursSavedPerYear.toLocaleString()} hours
                      </Text>
                    </Box>
                  </Group>
                </Paper>

                <Paper
                  p="md"
                  radius="md"
                  style={{
                    background: 'rgba(34, 197, 94, 0.1)',
                    border: '1px solid rgba(34, 197, 94, 0.2)',
                  }}
                >
                  <Group>
                    <ThemeIcon size={40} radius="md" color="green" variant="light">
                      <IconCurrencyDollar size={20} />
                    </ThemeIcon>
                    <Box>
                      <Text size="xs" c="dimmed" tt="uppercase">
                        Manager Time Value
                      </Text>
                      <Text size="xl" fw={700} c="white">
                        {formatNumber(moneySavedPerYear)}/year
                      </Text>
                    </Box>
                  </Group>
                </Paper>

                <Paper
                  p="md"
                  radius="md"
                  style={{
                    background: 'rgba(251, 191, 36, 0.1)',
                    border: '1px solid rgba(251, 191, 36, 0.2)',
                  }}
                >
                  <Group>
                    <ThemeIcon size={40} radius="md" color="yellow" variant="light">
                      <IconTrendingUp size={20} />
                    </ThemeIcon>
                    <Box>
                      <Text size="xs" c="dimmed" tt="uppercase">
                        Projected Revenue Impact
                      </Text>
                      <Text size="xl" fw={700} c="white">
                        +{formatNumber(additionalRevenue)}/year
                      </Text>
                    </Box>
                  </Group>
                </Paper>
              </Stack>
            </SimpleGrid>

            <Button
              component={Link}
              to="/register"
              fullWidth
              size="lg"
              mt="xl"
              variant="gradient"
              gradient={{ from: '#8b5cf6', to: '#6d28d9' }}
              rightSection={<IconArrowRight size={18} />}
            >
              Get These Results for Your Team
            </Button>
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
}
