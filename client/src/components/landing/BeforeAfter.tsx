import {
  Container,
  Title,
  Text,
  SimpleGrid,
  Stack,
  Box,
  ThemeIcon,
  List,
  Paper,
} from '@mantine/core';
import {
  IconX,
  IconCheck,
  IconArrowRight,
} from '@tabler/icons-react';

const beforeItems = [
  'Listen to calls for hours hoping to catch issues',
  'Rely on rep self-reporting (often inaccurate)',
  'Give feedback days or weeks after the call',
  'Coach based on gut feeling, not data',
  'Miss 90% of coachable moments',
];

const afterItems = [
  'AI reviews every call in minutes',
  'Objective scoring across 6 dimensions',
  'Instant feedback after each conversation',
  'Data-driven coaching with specific examples',
  'Surface every opportunity to improve',
];

export function BeforeAfter() {
  return (
    <Box py={{ base: 60, md: 100 }}>
      <Container size="lg">
        <Stack align="center" gap="xl">
          <Stack align="center" gap="xs" maw={500} ta="center">
            <Text size="sm" tt="uppercase" fw={600} c="violet.4" style={{ letterSpacing: 1 }}>
              The Transformation
            </Text>
            <Title order={2} c="white">
              Stop Guessing. Start Knowing.
            </Title>
          </Stack>

          <SimpleGrid cols={{ base: 1, md: 2 }} spacing={0} mt="xl">
            {/* Before */}
            <Paper
              p="xl"
              radius={0}
              style={{
                background: 'rgba(239, 68, 68, 0.03)',
                borderLeft: '3px solid rgba(239, 68, 68, 0.5)',
                borderTopLeftRadius: 12,
                borderBottomLeftRadius: 12,
              }}
            >
              <Stack gap="lg">
                <Box>
                  <Text size="xs" tt="uppercase" c="red.4" fw={600} style={{ letterSpacing: 1 }}>
                    Without CallMentor
                  </Text>
                  <Text size="lg" fw={600} c="white" mt={4}>
                    The Old Way
                  </Text>
                </Box>

                <List
                  spacing="md"
                  icon={
                    <ThemeIcon size={20} radius="xl" color="red" variant="light">
                      <IconX size={12} />
                    </ThemeIcon>
                  }
                >
                  {beforeItems.map((item) => (
                    <List.Item key={item}>
                      <Text size="sm" c="gray.4">
                        {item}
                      </Text>
                    </List.Item>
                  ))}
                </List>

                <Box
                  p="md"
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    borderRadius: 8,
                  }}
                >
                  <Text size="sm" c="red.3" fw={500}>
                    Result: Inconsistent performance, frustrated reps, missed quota
                  </Text>
                </Box>
              </Stack>
            </Paper>

            {/* Arrow (centered between cards on mobile) */}
            <Box
              hiddenFrom="md"
              py="md"
              style={{ display: 'flex', justifyContent: 'center' }}
            >
              <ThemeIcon size={40} radius="xl" color="violet" variant="light">
                <IconArrowRight size={20} style={{ transform: 'rotate(90deg)' }} />
              </ThemeIcon>
            </Box>

            {/* After */}
            <Paper
              p="xl"
              radius={0}
              style={{
                background: 'rgba(34, 197, 94, 0.03)',
                borderLeft: '3px solid rgba(34, 197, 94, 0.5)',
                borderTopRightRadius: 12,
                borderBottomRightRadius: 12,
              }}
            >
              <Stack gap="lg">
                <Box>
                  <Text size="xs" tt="uppercase" c="green.4" fw={600} style={{ letterSpacing: 1 }}>
                    With CallMentor
                  </Text>
                  <Text size="lg" fw={600} c="white" mt={4}>
                    The New Way
                  </Text>
                </Box>

                <List
                  spacing="md"
                  icon={
                    <ThemeIcon size={20} radius="xl" color="green" variant="light">
                      <IconCheck size={12} />
                    </ThemeIcon>
                  }
                >
                  {afterItems.map((item) => (
                    <List.Item key={item}>
                      <Text size="sm" c="gray.4">
                        {item}
                      </Text>
                    </List.Item>
                  ))}
                </List>

                <Box
                  p="md"
                  style={{
                    background: 'rgba(34, 197, 94, 0.1)',
                    borderRadius: 8,
                  }}
                >
                  <Text size="sm" c="green.3" fw={500}>
                    Result: 27% average score improvement in 8 weeks
                  </Text>
                </Box>
              </Stack>
            </Paper>
          </SimpleGrid>
        </Stack>
      </Container>
    </Box>
  );
}
