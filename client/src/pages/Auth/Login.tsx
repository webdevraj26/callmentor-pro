import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Paper,
  TextInput,
  PasswordInput,
  Button,
  Text,
  Stack,
  Anchor,
  Group,
  Checkbox,
  Divider,
  Box,
  Alert,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconBrandGoogle, IconBrandWindows, IconAlertCircle, IconUsers } from '@tabler/icons-react';
import { useAuthStore } from '@/store/authStore';
import authService from '@/services/auth';
import type { LoginFormValues } from '@/types';

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('invite');
  const { login } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginFormValues & { rememberMe: boolean }>({
    initialValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (value) => (value.length >= 1 ? null : 'Password is required'),
    },
  });

  const handleSubmit = async (values: LoginFormValues) => {
    setLoading(true);
    setError(null);

    try {
      const { user, token } = await authService.login(values);
      login(user, token);

      // If there's an invite token, redirect to accept invite page
      if (inviteToken) {
        navigate(`/invite/${inviteToken}`);
      } else if (!user.isOnboarded) {
        navigate('/onboarding');
      } else {
        navigate('/dashboard');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      setError(error.response?.data?.error?.message || 'Failed to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper
      p="xl"
      radius="lg"
      w="100%"
      style={{
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(139, 92, 246, 0.2)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <Stack gap="lg">
        <Box ta="center">
          <Text size="xl" fw={600} c="white">
            Welcome back
          </Text>
          <Text size="sm" c="dimmed" mt={4}>
            Sign in to continue to CallMentor Pro
          </Text>
        </Box>

        {inviteToken && (
          <Alert
            icon={<IconUsers size={16} />}
            color="violet"
            variant="light"
          >
            Sign in to accept your team invitation
          </Alert>
        )}

        {error && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            color="red"
            variant="light"
            onClose={() => setError(null)}
            withCloseButton
          >
            {error}
          </Alert>
        )}

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              label="Email"
              placeholder="you@example.com"
              size="md"
              {...form.getInputProps('email')}
              styles={{
                label: { color: 'var(--mantine-color-gray-4)', marginBottom: 6 },
                input: {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--mantine-color-dark-4)',
                  '&:focus': {
                    borderColor: 'var(--mantine-color-violet-5)',
                  },
                },
              }}
            />

            <PasswordInput
              label="Password"
              placeholder="Your password"
              size="md"
              {...form.getInputProps('password')}
              styles={{
                label: { color: 'var(--mantine-color-gray-4)', marginBottom: 6 },
                input: {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--mantine-color-dark-4)',
                  '&:focus': {
                    borderColor: 'var(--mantine-color-violet-5)',
                  },
                },
              }}
            />

            <Group justify="space-between">
              <Checkbox
                label="Remember me"
                size="sm"
                color="violet"
                {...form.getInputProps('rememberMe', { type: 'checkbox' })}
                styles={{
                  label: { color: 'var(--mantine-color-gray-5)' },
                }}
              />
              <Anchor component={Link} to="/forgot-password" size="sm" c="violet.4">
                Forgot password?
              </Anchor>
            </Group>

            <Button
              type="submit"
              fullWidth
              size="md"
              mt="sm"
              loading={loading}
              variant="gradient"
              gradient={{ from: '#8b5cf6', to: '#6d28d9' }}
            >
              Sign In
            </Button>
          </Stack>
        </form>

        <Divider
          label="or continue with"
          labelPosition="center"
          color="dark.4"
          styles={{ label: { color: 'var(--mantine-color-gray-6)' } }}
        />

        <Group grow>
          <Button
            variant="outline"
            color="gray"
            leftSection={<IconBrandGoogle size={18} />}
            styles={{
              root: {
                borderColor: 'var(--mantine-color-dark-4)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                },
              },
            }}
          >
            Google
          </Button>
          <Button
            variant="outline"
            color="gray"
            leftSection={<IconBrandWindows size={18} />}
            styles={{
              root: {
                borderColor: 'var(--mantine-color-dark-4)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                },
              },
            }}
          >
            Microsoft
          </Button>
        </Group>

        <Text size="sm" ta="center" c="dimmed">
          Don't have an account?{' '}
          <Anchor component={Link} to="/register" fw={500} c="violet.4">
            Create one
          </Anchor>
        </Text>
      </Stack>
    </Paper>
  );
}
