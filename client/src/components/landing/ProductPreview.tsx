import {
  Container,
  Title,
  Text,
  Stack,
  Box,
  Paper,
  Group,
  Badge,
  Progress,
  Avatar,
  SimpleGrid,
} from '@mantine/core';
import { IconPlayerPlay } from '@tabler/icons-react';

export function ProductPreview() {
  return (
    <Box
      py={{ base: 60, md: 100 }}
      style={{
        background: 'linear-gradient(180deg, #1a1523 0%, #0a0a0c 100%)',
      }}
    >
      <Container size="lg">
        <Stack align="center" gap="xl">
          <Stack align="center" gap="xs" maw={500} ta="center">
            <Text size="sm" tt="uppercase" fw={600} c="violet.4" style={{ letterSpacing: 1 }}>
              Product Preview
            </Text>
            <Title order={2} c="white">
              See It In Action
            </Title>
            <Text c="dimmed">
              This is what call analysis looks like in CallMentor
            </Text>
          </Stack>

          {/* Mock Dashboard */}
          <Paper
            p={0}
            radius="lg"
            maw={1000}
            w="100%"
            style={{
              background: 'var(--mantine-color-dark-7)',
              border: '1px solid var(--mantine-color-dark-5)',
              overflow: 'hidden',
            }}
          >
            {/* Top Bar */}
            <Box
              px="md"
              py="sm"
              style={{
                borderBottom: '1px solid var(--mantine-color-dark-5)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Box w={12} h={12} bg="red.6" style={{ borderRadius: '50%' }} />
              <Box w={12} h={12} bg="yellow.6" style={{ borderRadius: '50%' }} />
              <Box w={12} h={12} bg="green.6" style={{ borderRadius: '50%' }} />
              <Text size="xs" c="dimmed" ml="md">
                Call Analysis — Discovery Call with Acme Corp
              </Text>
            </Box>

            <SimpleGrid cols={{ base: 1, md: 3 }} spacing={0}>
              {/* Left Panel - Call Info */}
              <Box
                p="lg"
                style={{
                  borderRight: '1px solid var(--mantine-color-dark-5)',
                }}
              >
                <Stack gap="md">
                  <Group>
                    <Avatar color="violet" radius="xl">JD</Avatar>
                    <Box>
                      <Text size="sm" fw={600} c="white">John Davis</Text>
                      <Text size="xs" c="dimmed">vs Acme Corp</Text>
                    </Box>
                  </Group>

                  <Box>
                    <Group justify="space-between" mb="xs">
                      <Text size="sm" c="dimmed">Overall Score</Text>
                      <Text size="lg" fw={700} c="green.4">78</Text>
                    </Group>
                    <Progress value={78} color="green" size="sm" radius="xl" />
                  </Box>

                  <Box>
                    <Text size="xs" c="dimmed" mb="xs">Talk Ratio</Text>
                    <Group gap={4}>
                      <Box style={{ flex: 42, height: 8, background: 'var(--mantine-color-violet-6)', borderRadius: 4 }} />
                      <Box style={{ flex: 58, height: 8, background: 'var(--mantine-color-gray-6)', borderRadius: 4 }} />
                    </Group>
                    <Group justify="space-between" mt={4}>
                      <Text size="xs" c="violet.4">Rep 42%</Text>
                      <Text size="xs" c="dimmed">Prospect 58%</Text>
                    </Group>
                  </Box>

                  <Box>
                    <Text size="xs" c="dimmed" mb="sm">Key Moments</Text>
                    <Stack gap="xs">
                      {[
                        { time: '2:34', label: 'Great discovery question', color: 'green' },
                        { time: '5:12', label: 'Pricing objection raised', color: 'yellow' },
                        { time: '8:45', label: 'Competitor mentioned', color: 'red' },
                      ].map((m) => (
                        <Group key={m.time} gap="xs">
                          <Badge size="xs" color={m.color} variant="light">{m.time}</Badge>
                          <Text size="xs" c="gray.4">{m.label}</Text>
                        </Group>
                      ))}
                    </Stack>
                  </Box>
                </Stack>
              </Box>

              {/* Center Panel - Transcript */}
              <Box
                p="lg"
                style={{
                  borderRight: '1px solid var(--mantine-color-dark-5)',
                }}
              >
                <Text size="sm" fw={600} c="white" mb="md">Transcript</Text>
                <Stack gap="md">
                  {[
                    { speaker: 'John', text: "Thanks for taking the time today. I'd love to understand your current challenges with..." },
                    { speaker: 'Prospect', text: "Sure, so we've been struggling with visibility into our sales calls. We have about 20 reps..." },
                    { speaker: 'John', text: "That's really helpful context. What would success look like 6 months from now?" },
                    { speaker: 'Prospect', text: "Honestly, if we could just know what's working and what's not, that would be huge." },
                  ].map((line, i) => (
                    <Box key={i}>
                      <Text size="xs" fw={600} c={line.speaker === 'John' ? 'violet.4' : 'gray.5'} mb={2}>
                        {line.speaker}
                      </Text>
                      <Text size="xs" c="gray.4" lh={1.5}>
                        {line.text}
                      </Text>
                    </Box>
                  ))}
                </Stack>
              </Box>

              {/* Right Panel - AI Insights */}
              <Box p="lg">
                <Text size="sm" fw={600} c="white" mb="md">AI Coaching</Text>
                <Stack gap="md">
                  <Paper p="sm" bg="green.9" radius="md" style={{ opacity: 0.7 }}>
                    <Text size="xs" fw={600} c="green.3" mb={4}>Strength</Text>
                    <Text size="xs" c="white">
                      Excellent open-ended discovery at 2:34. This question led to valuable insight about their team size.
                    </Text>
                  </Paper>

                  <Paper p="sm" bg="yellow.9" radius="md" style={{ opacity: 0.7 }}>
                    <Text size="xs" fw={600} c="yellow.3" mb={4}>Opportunity</Text>
                    <Text size="xs" c="white">
                      The pricing objection at 5:12 was acknowledged but not fully addressed. Consider using the value anchor technique.
                    </Text>
                  </Paper>

                  <Paper p="sm" bg="violet.9" radius="md" style={{ opacity: 0.7 }}>
                    <Text size="xs" fw={600} c="violet.3" mb={4}>Next Steps</Text>
                    <Text size="xs" c="white">
                      Strong commitment secured for follow-up demo. Send ROI calculator before next call.
                    </Text>
                  </Paper>
                </Stack>
              </Box>
            </SimpleGrid>

            {/* Audio Waveform */}
            <Box
              px="lg"
              py="md"
              style={{
                borderTop: '1px solid var(--mantine-color-dark-5)',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <Box
                w={32}
                h={32}
                style={{
                  borderRadius: '50%',
                  background: 'var(--mantine-color-violet-6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <IconPlayerPlay size={16} color="white" />
              </Box>
              <Box style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                {Array.from({ length: 60 }).map((_, i) => (
                  <Box
                    key={i}
                    style={{
                      width: 3,
                      height: Math.random() * 20 + 5,
                      background: i < 25 ? 'var(--mantine-color-violet-5)' : 'var(--mantine-color-dark-4)',
                      borderRadius: 2,
                    }}
                  />
                ))}
              </Box>
              <Text size="xs" c="dimmed">12:34 / 28:15</Text>
            </Box>
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
}
