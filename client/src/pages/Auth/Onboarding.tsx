import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Text,
  Title,
  Stack,
  Button,
  Group,
  TextInput,
  SegmentedControl,
  ThemeIcon,
  SimpleGrid,
  Slider,
  Progress,
} from '@mantine/core';
import {
  IconRocket,
  IconCheck,
  IconArrowRight,
  IconArrowLeft,
  IconBrandZoom,
  IconPhone,
  IconCloud,
  IconHeadphones,
} from '@tabler/icons-react';
import { useAuthStore } from '@/store/authStore';
import authService from '@/services/auth';

const teamSizes = [
  { value: '1-5', label: '1-5' },
  { value: '6-15', label: '6-15' },
  { value: '16-50', label: '16-50' },
  { value: '51-200', label: '51-200' },
  { value: '200+', label: '200+' },
];

type SalesRole = 'sales_manager' | 'vp_sales' | 'sales_rep' | 'enablement';

const salesRoles: Array<{ value: SalesRole; label: string; description: string }> = [
  { value: 'sales_manager', label: 'Sales Manager', description: 'I manage a team of sales reps' },
  { value: 'vp_sales', label: 'VP of Sales', description: 'I lead the sales organization' },
  { value: 'sales_rep', label: 'Sales Rep', description: 'I focus on closing deals' },
  { value: 'enablement', label: 'Sales Enablement', description: 'I train and support the team' },
];

const integrations = [
  { id: 'zoom', name: 'Zoom', icon: IconBrandZoom, color: '#2D8CFF' },
  { id: 'dialpad', name: 'Dialpad', icon: IconPhone, color: '#7C3AED' },
  { id: 'salesforce', name: 'Salesforce', icon: IconCloud, color: '#00A1E0' },
  { id: 'gong', name: 'Gong', icon: IconHeadphones, color: '#6366F1' },
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<{
    companyName: string;
    salesRole: SalesRole;
    teamSize: string;
    selectedIntegrations: string[];
    callsPerWeek: number;
  }>({
    companyName: user?.companyName || '',
    salesRole: user?.salesRole || 'sales_manager',
    teamSize: '6-15',
    selectedIntegrations: [],
    callsPerWeek: 50,
  });

  const handleNext = () => {
    if (active < 2) {
      setActive((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (active > 0) {
      setActive((prev) => prev - 1);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const updatedUser = await authService.completeOnboarding({
        companyName: formData.companyName,
        salesRole: formData.salesRole,
        teamSize: formData.teamSize,
      });
      setUser(updatedUser);
      navigate('/dashboard');
    } catch (error) {
      console.error('Onboarding error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleIntegration = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedIntegrations: prev.selectedIntegrations.includes(id)
        ? prev.selectedIntegrations.filter((i) => i !== id)
        : [...prev.selectedIntegrations, id],
    }));
  };

  return (
    <Box
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at top, #1a1523 0%, #0a0a0c 50%)',
      }}
    >
      <Container size="md" py={60}>
        <Stack align="center" gap="xl">
          {/* Logo */}
          <Group gap={8}>
            <Box
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconHeadphones size={20} color="white" />
            </Box>
            <Text size="xl" fw={700} c="white">
              CallMentor Pro
            </Text>
          </Group>

          {/* Progress */}
          <Box w="100%" maw={500}>
            <Group justify="space-between" mb="xs">
              <Text size="sm" c="dimmed">
                Setting up your workspace
              </Text>
              <Text size="sm" c="violet.4" fw={500}>
                Step {active + 1} of 3
              </Text>
            </Group>
            <Progress value={(active + 1) * 33.33} color="violet" size="sm" radius="xl" />
          </Box>

          {/* Main Content */}
          <Paper
            p="xl"
            radius="lg"
            w="100%"
            maw={600}
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(139, 92, 246, 0.2)',
            }}
          >
            {/* Step 1: About You */}
            {active === 0 && (
              <Stack gap="xl">
                <Box ta="center">
                  <Title order={2} c="white" size="1.5rem">
                    Tell us about yourself
                  </Title>
                  <Text c="dimmed" size="sm" mt={4}>
                    This helps us personalize your experience
                  </Text>
                </Box>

                <TextInput
                  label="Company Name"
                  placeholder="Acme Inc."
                  size="md"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  styles={{
                    label: { color: 'var(--mantine-color-gray-4)', marginBottom: 6 },
                    input: {
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--mantine-color-dark-4)',
                    },
                  }}
                />

                <Box>
                  <Text size="sm" c="gray.4" mb="sm">
                    What's your role?
                  </Text>
                  <Stack gap="sm">
                    {salesRoles.map((role) => (
                      <Paper
                        key={role.value}
                        p="md"
                        radius="md"
                        onClick={() => setFormData({ ...formData, salesRole: role.value })}
                        style={{
                          cursor: 'pointer',
                          background:
                            formData.salesRole === role.value
                              ? 'rgba(139, 92, 246, 0.15)'
                              : 'rgba(255, 255, 255, 0.02)',
                          border: `1px solid ${
                            formData.salesRole === role.value
                              ? 'var(--mantine-color-violet-5)'
                              : 'var(--mantine-color-dark-4)'
                          }`,
                          transition: 'all 0.2s',
                        }}
                      >
                        <Group justify="space-between">
                          <Box>
                            <Text size="sm" fw={500} c="white">
                              {role.label}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {role.description}
                            </Text>
                          </Box>
                          {formData.salesRole === role.value && (
                            <ThemeIcon color="violet" variant="light" radius="xl">
                              <IconCheck size={14} />
                            </ThemeIcon>
                          )}
                        </Group>
                      </Paper>
                    ))}
                  </Stack>
                </Box>
              </Stack>
            )}

            {/* Step 2: Team Size */}
            {active === 1 && (
              <Stack gap="xl">
                <Box ta="center">
                  <Title order={2} c="white" size="1.5rem">
                    About your team
                  </Title>
                  <Text c="dimmed" size="sm" mt={4}>
                    Help us understand your team size
                  </Text>
                </Box>

                <Box>
                  <Text size="sm" c="gray.4" mb="sm">
                    How many sales reps are on your team?
                  </Text>
                  <SegmentedControl
                    fullWidth
                    value={formData.teamSize}
                    onChange={(value) => setFormData({ ...formData, teamSize: value })}
                    data={teamSizes}
                    styles={{
                      root: {
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--mantine-color-dark-4)',
                      },
                      indicator: {
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                      },
                      label: {
                        color: 'var(--mantine-color-gray-4)',
                        '&[data-active]': {
                          color: 'white',
                        },
                      },
                    }}
                  />
                </Box>

                <Box>
                  <Group justify="space-between" mb="xs">
                    <Text size="sm" c="gray.4">
                      Average calls per week (team total)
                    </Text>
                    <Text size="sm" c="violet.4" fw={600}>
                      {formData.callsPerWeek} calls
                    </Text>
                  </Group>
                  <Slider
                    value={formData.callsPerWeek}
                    onChange={(value) => setFormData({ ...formData, callsPerWeek: value })}
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
                      <IconRocket size={20} />
                    </ThemeIcon>
                    <Box>
                      <Text size="sm" fw={500} c="white">
                        Estimated time savings
                      </Text>
                      <Text size="lg" fw={700} c="violet.4">
                        {Math.round(formData.callsPerWeek * 0.15)} hours/week
                      </Text>
                    </Box>
                  </Group>
                </Paper>
              </Stack>
            )}

            {/* Step 3: Integrations */}
            {active === 2 && (
              <Stack gap="xl">
                <Box ta="center">
                  <Title order={2} c="white" size="1.5rem">
                    Connect your tools
                  </Title>
                  <Text c="dimmed" size="sm" mt={4}>
                    Select the tools you use (you can add more later)
                  </Text>
                </Box>

                <SimpleGrid cols={2} spacing="md">
                  {integrations.map((integration) => (
                    <Paper
                      key={integration.id}
                      p="lg"
                      radius="md"
                      onClick={() => toggleIntegration(integration.id)}
                      style={{
                        cursor: 'pointer',
                        background: formData.selectedIntegrations.includes(integration.id)
                          ? 'rgba(139, 92, 246, 0.15)'
                          : 'rgba(255, 255, 255, 0.02)',
                        border: `1px solid ${
                          formData.selectedIntegrations.includes(integration.id)
                            ? 'var(--mantine-color-violet-5)'
                            : 'var(--mantine-color-dark-4)'
                        }`,
                        transition: 'all 0.2s',
                      }}
                    >
                      <Stack align="center" gap="sm">
                        <Box
                          w={48}
                          h={48}
                          style={{
                            borderRadius: 12,
                            background: `${integration.color}20`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <integration.icon size={24} color={integration.color} />
                        </Box>
                        <Text size="sm" fw={500} c="white">
                          {integration.name}
                        </Text>
                        {formData.selectedIntegrations.includes(integration.id) && (
                          <ThemeIcon color="violet" variant="light" radius="xl" size="sm">
                            <IconCheck size={12} />
                          </ThemeIcon>
                        )}
                      </Stack>
                    </Paper>
                  ))}
                </SimpleGrid>

                <Text size="xs" c="dimmed" ta="center">
                  You can skip this step and connect integrations later from settings
                </Text>
              </Stack>
            )}

            {/* Navigation Buttons */}
            <Group justify="space-between" mt="xl">
              <Button
                variant="subtle"
                color="gray"
                leftSection={<IconArrowLeft size={16} />}
                onClick={handleBack}
                disabled={active === 0}
              >
                Back
              </Button>

              {active < 2 ? (
                <Button
                  rightSection={<IconArrowRight size={16} />}
                  variant="gradient"
                  gradient={{ from: '#8b5cf6', to: '#6d28d9' }}
                  onClick={handleNext}
                >
                  Continue
                </Button>
              ) : (
                <Button
                  rightSection={<IconRocket size={16} />}
                  variant="gradient"
                  gradient={{ from: '#8b5cf6', to: '#6d28d9' }}
                  loading={loading}
                  onClick={handleComplete}
                >
                  Launch Dashboard
                </Button>
              )}
            </Group>
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
}
