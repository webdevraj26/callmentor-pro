import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Title,
  Text,
  Stack,
  Button,
  Group,
  Loader,
  Center,
  Alert,
  Avatar,
  Badge,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconUsers,
  IconAlertCircle,
  IconCheck,
  IconLogin,
  IconUserPlus,
} from '@tabler/icons-react';
import { useAuthStore } from '@/store/authStore';
import { useOrganizationStore } from '@/store/organizationStore';
import api from '@/services/api';

interface InvitationDetails {
  organizationName: string;
  invitedEmail: string;
  role: string;
  invitedBy: {
    firstName: string;
    lastName: string;
  };
  expiresAt: string;
}

export default function AcceptInvitePage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user, refreshUser } = useAuthStore();
  const { acceptInvitation } = useOrganizationStore();

  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvitation = async () => {
      if (!token) {
        setError('Invalid invitation link');
        setIsLoading(false);
        return;
      }

      try {
        const response = await api.get(`/organizations/invite/${token}`);
        setInvitation(response.data.data);
      } catch (err: unknown) {
        const error = err as { response?: { data?: { error?: { message?: string; code?: string } } } };
        const errorCode = error.response?.data?.error?.code;
        if (errorCode === 'EXPIRED') {
          setError('This invitation has expired. Please ask for a new invite link.');
        } else if (errorCode === 'INVALID_TOKEN') {
          setError('This invitation link is invalid or has already been used.');
        } else {
          setError(error.response?.data?.error?.message || 'Failed to load invitation');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvitation();
  }, [token]);

  const handleAccept = async () => {
    if (!token) return;

    setIsAccepting(true);
    try {
      await acceptInvitation(token);
      await refreshUser();
      notifications.show({
        title: 'Welcome to the team!',
        message: `You have joined ${invitation?.organizationName}`,
        color: 'green',
        icon: <IconCheck size={16} />,
      });
      navigate('/dashboard');
    } catch (err: unknown) {
      const error = err as Error;
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to accept invitation',
        color: 'red',
      });
    } finally {
      setIsAccepting(false);
    }
  };

  if (isLoading) {
    return (
      <Box
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(180deg, var(--mantine-color-dark-8) 0%, var(--mantine-color-dark-9) 100%)',
        }}
      >
        <Center h="100vh">
          <Loader size="lg" color="violet" />
        </Center>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(180deg, var(--mantine-color-dark-8) 0%, var(--mantine-color-dark-9) 100%)',
        }}
      >
        <Container size="sm" py="xl">
          <Center h="80vh">
            <Paper
              p="xl"
              radius="lg"
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--mantine-color-dark-4)',
                textAlign: 'center',
                maxWidth: 400,
              }}
            >
              <Stack align="center" gap="lg">
                <IconAlertCircle size={48} color="var(--mantine-color-red-5)" />
                <Title order={3} c="white">Invitation Error</Title>
                <Text c="dimmed">{error}</Text>
                <Button component={Link} to="/" variant="light" color="violet">
                  Go to Home
                </Button>
              </Stack>
            </Paper>
          </Center>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, var(--mantine-color-dark-8) 0%, var(--mantine-color-dark-9) 100%)',
      }}
    >
      <Container size="sm" py="xl">
        <Center h="80vh">
          <Paper
            p="xl"
            radius="lg"
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--mantine-color-dark-4)',
              textAlign: 'center',
              maxWidth: 450,
              width: '100%',
            }}
          >
            <Stack align="center" gap="lg">
              <Avatar size={60} radius="xl" color="violet">
                <IconUsers size={30} />
              </Avatar>

              <Box>
                <Title order={2} c="white">
                  You're invited!
                </Title>
                <Text c="dimmed" mt="xs">
                  {invitation?.invitedBy.firstName} {invitation?.invitedBy.lastName} has invited you to join
                </Text>
              </Box>

              <Paper
                p="md"
                radius="md"
                w="100%"
                style={{
                  background: 'rgba(139, 92, 246, 0.1)',
                  border: '1px solid var(--mantine-color-violet-9)',
                }}
              >
                <Text size="xl" fw={700} c="white">
                  {invitation?.organizationName}
                </Text>
                <Group justify="center" mt="xs">
                  <Badge size="lg" color="violet" variant="light">
                    {invitation?.role}
                  </Badge>
                </Group>
              </Paper>

              {isAuthenticated ? (
                <Stack w="100%" gap="md">
                  <Text size="sm" c="dimmed">
                    Logged in as <Text span c="white" fw={500}>{user?.email}</Text>
                  </Text>
                  <Button
                    fullWidth
                    size="lg"
                    onClick={handleAccept}
                    loading={isAccepting}
                    leftSection={<IconCheck size={18} />}
                  >
                    Accept Invitation
                  </Button>
                </Stack>
              ) : (
                <Stack w="100%" gap="md">
                  <Alert color="blue" variant="light">
                    <Text size="sm">
                      Please login or create an account to join this team.
                    </Text>
                  </Alert>
                  <Group grow>
                    <Button
                      component={Link}
                      to={`/login?invite=${token}`}
                      variant="light"
                      size="lg"
                      leftSection={<IconLogin size={18} />}
                    >
                      Login
                    </Button>
                    <Button
                      component={Link}
                      to={`/register?invite=${token}`}
                      size="lg"
                      leftSection={<IconUserPlus size={18} />}
                    >
                      Register
                    </Button>
                  </Group>
                </Stack>
              )}

              <Text size="xs" c="dimmed">
                This invitation expires on {new Date(invitation?.expiresAt || '').toLocaleDateString()}
              </Text>
            </Stack>
          </Paper>
        </Center>
      </Container>
    </Box>
  );
}
