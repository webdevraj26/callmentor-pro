import {
  Container,
  Title,
  Text,
  Stack,
  Box,
  SimpleGrid,
  Paper,
  Badge,
} from '@mantine/core';
import {
  IconBrandZoom,
  IconPhone,
  IconCloud,
  IconDatabase,
  IconBrandSlack,
  IconMail,
} from '@tabler/icons-react';

const integrations = [
  {
    name: 'Salesforce',
    category: 'CRM',
    icon: IconCloud,
    color: '#00A1E0',
    status: 'Available',
  },
  {
    name: 'HubSpot',
    category: 'CRM',
    icon: IconDatabase,
    color: '#FF7A59',
    status: 'Available',
  },
  {
    name: 'Zoom',
    category: 'Meetings',
    icon: IconBrandZoom,
    color: '#2D8CFF',
    status: 'Available',
  },
  {
    name: 'Dialpad',
    category: 'Phone',
    icon: IconPhone,
    color: '#7C3AED',
    status: 'Available',
  },
  {
    name: 'Slack',
    category: 'Notifications',
    icon: IconBrandSlack,
    color: '#4A154B',
    status: 'Available',
  },
  {
    name: 'Outreach',
    category: 'Sequences',
    icon: IconMail,
    color: '#5951FF',
    status: 'Coming Soon',
  },
];

export function Integrations() {
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
              Integrations
            </Text>
            <Title order={2} c="white">
              Works With Your Stack
            </Title>
            <Text c="dimmed">
              Connect CallMentor to your existing tools in minutes
            </Text>
          </Stack>

          <SimpleGrid cols={{ base: 2, sm: 3, md: 6 }} spacing="lg" mt="lg">
            {integrations.map((integration) => (
              <Paper
                key={integration.name}
                p="lg"
                radius="lg"
                ta="center"
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--mantine-color-dark-5)',
                  transition: 'all 0.2s',
                  cursor: 'default',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = 'var(--mantine-color-violet-7)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = 'var(--mantine-color-dark-5)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <Stack align="center" gap="sm">
                  <Box
                    w={48}
                    h={48}
                    style={{
                      borderRadius: 12,
                      background: `${integration.color}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <integration.icon size={24} color={integration.color} />
                  </Box>
                  <Text size="sm" fw={600} c="white">
                    {integration.name}
                  </Text>
                  <Badge
                    size="xs"
                    variant="light"
                    color={integration.status === 'Available' ? 'green' : 'gray'}
                  >
                    {integration.status}
                  </Badge>
                </Stack>
              </Paper>
            ))}
          </SimpleGrid>

          <Text size="sm" c="dimmed" ta="center" mt="md">
            Don't see your tool? We also offer an open API and custom integrations for Enterprise plans.
          </Text>
        </Stack>
      </Container>
    </Box>
  );
}
