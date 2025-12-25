import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Title,
  Text,
  Button,
  Group,
  Stack,
  Box,
  SegmentedControl,
  Paper,
} from '@mantine/core';
import { IconArrowRight } from '@tabler/icons-react';

const roles = [
  {
    value: 'manager',
    label: 'Sales Manager',
    headline: 'Coach Your Team Without Listening to Every Call',
    subheadline: 'AI analyzes 100% of calls and surfaces exactly what each rep needs to improve. Save 8+ hours weekly on manual reviews.',
    metric: '8hrs',
    metricLabel: 'saved per week',
  },
  {
    value: 'vp',
    label: 'VP of Sales',
    headline: 'Finally See What\'s Really Happening on Calls',
    subheadline: 'Get visibility into every conversation across your org. Identify patterns, predict outcomes, and scale what works.',
    metric: '27%',
    metricLabel: 'avg score improvement',
  },
  {
    value: 'rep',
    label: 'Sales Rep',
    headline: 'Get Coaching That Actually Helps You Close',
    subheadline: 'Receive specific, actionable feedback on every call. Know exactly what to say next time to win the deal.',
    metric: '3.2x',
    metricLabel: 'faster skill growth',
  },
  {
    value: 'enablement',
    label: 'Enablement',
    headline: 'Build Training From Real Winning Conversations',
    subheadline: 'Discover what top performers actually do differently. Create data-backed playbooks that drive results.',
    metric: '156%',
    metricLabel: 'training ROI',
  },
];

export function HeroWithSelector() {
  const [selectedRole, setSelectedRole] = useState('manager');
  const currentRole = roles.find((r) => r.value === selectedRole) || roles[0];

  return (
    <Box
      py={{ base: 100, md: 140 }}
      style={{
        background: 'radial-gradient(ellipse at top, #1a1523 0%, #0a0a0c 50%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle grid pattern */}
      <Box
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `linear-gradient(rgba(139, 92, 246, 0.03) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(139, 92, 246, 0.03) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <Container size="lg" style={{ position: 'relative', zIndex: 1 }}>
        <Stack align="center" gap="xl">
          {/* Role Selector */}
          <Text size="sm" c="dimmed" tt="uppercase" fw={500} style={{ letterSpacing: 1 }}>
            I am a...
          </Text>

          <SegmentedControl
            value={selectedRole}
            onChange={setSelectedRole}
            data={roles.map((r) => ({ value: r.value, label: r.label }))}
            size="md"
            styles={{
              root: {
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
              },
              indicator: {
                background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
              },
              label: {
                color: 'var(--mantine-color-gray-4)',
                fontWeight: 500,
                '&[dataActive]': {
                  color: 'white',
                },
              },
            }}
          />

          {/* Dynamic Content */}
          <Stack align="center" gap="lg" maw={700} ta="center" mt="xl">
            <Title
              order={1}
              size={52}
              fw={700}
              lh={1.1}
              c="white"
              style={{ transition: 'all 0.3s ease' }}
            >
              {currentRole.headline}
            </Title>

            <Text
              size="xl"
              c="dimmed"
              maw={550}
              style={{ transition: 'all 0.3s ease' }}
            >
              {currentRole.subheadline}
            </Text>

            {/* Metric Highlight */}
            <Paper
              p="md"
              radius="lg"
              style={{
                background: 'rgba(139, 92, 246, 0.1)',
                border: '1px solid rgba(139, 92, 246, 0.2)',
              }}
            >
              <Group gap="xs">
                <Text
                  size="2rem"
                  fw={700}
                  variant="gradient"
                  gradient={{ from: '#a78bfa', to: '#8b5cf6' }}
                >
                  {currentRole.metric}
                </Text>
                <Text size="sm" c="dimmed">
                  {currentRole.metricLabel}
                </Text>
              </Group>
            </Paper>
          </Stack>

          {/* CTA */}
          <Group mt="xl">
            <Button
              component={Link}
              to="/register"
              size="lg"
              variant="gradient"
              gradient={{ from: '#8b5cf6', to: '#6d28d9' }}
              rightSection={<IconArrowRight size={18} />}
            >
              Start Free Trial
            </Button>
            <Button
              size="lg"
              variant="outline"
              color="gray"
            >
              See How It Works
            </Button>
          </Group>

          <Text size="xs" c="dimmed">
            No credit card required • Setup in 2 minutes
          </Text>
        </Stack>
      </Container>
    </Box>
  );
}
