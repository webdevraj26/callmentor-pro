import { Link } from 'react-router-dom';
import {
  Container,
  Title,
  Text,
  Stack,
  Box,
  Button,
  Group,
  Paper,
} from '@mantine/core';
import { IconArrowRight, IconCheck } from '@tabler/icons-react';

const benefits = [
  'Free 7-day trial',
  'No credit card required',
  'Cancel anytime',
  'Onboarding included',
];

export function FinalCTA() {
  return (
    <Box py={{ base: 80, md: 120 }}>
      <Container size="md">
        <Paper
          p={{ base: 'xl', md: 50 }}
          radius="xl"
          style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(109, 40, 217, 0.1) 100%)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Background blur */}
          <Box
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 400,
              height: 400,
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%)',
              filter: 'blur(60px)',
            }}
          />

          <Stack align="center" gap="lg" style={{ position: 'relative', zIndex: 1 }} ta="center">
            <Title order={2} c="white" size="2rem">
              Ready to Transform Your Sales Coaching?
            </Title>

            <Text c="gray.4" size="lg" maw={450}>
              Join 340+ sales teams already using CallMentor to drive measurable performance improvement.
            </Text>

            <Button
              component={Link}
              to="/register"
              size="xl"
              variant="gradient"
              gradient={{ from: '#8b5cf6', to: '#6d28d9' }}
              rightSection={<IconArrowRight size={20} />}
            >
              Start Your Free Trial
            </Button>

            <Group gap="lg" mt="sm" wrap="wrap" justify="center">
              {benefits.map((benefit) => (
                <Group key={benefit} gap={6}>
                  <IconCheck size={14} color="var(--mantine-color-green-5)" />
                  <Text size="sm" c="gray.5">
                    {benefit}
                  </Text>
                </Group>
              ))}
            </Group>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
