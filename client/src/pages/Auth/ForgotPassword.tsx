import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Paper,
  TextInput,
  Button,
  Text,
  Stack,
  Anchor,
  Box,
  Alert,
  ThemeIcon,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlertCircle, IconCheck, IconArrowLeft } from '@tabler/icons-react';
import authService from '@/services/auth';

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useForm({
    initialValues: {
      email: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
    },
  });

  const handleSubmit = async (values: { email: string }) => {
    setLoading(true);
    setError(null);

    try {
      await authService.forgotPassword(values.email);
      setSuccess(true);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      setError(error.response?.data?.error?.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
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
        <Stack align="center" gap="lg">
          <ThemeIcon size={60} radius="xl" color="green" variant="light">
            <IconCheck size={30} />
          </ThemeIcon>

          <Box ta="center">
            <Text size="xl" fw={600} c="white">
              Check your email
            </Text>
            <Text size="sm" c="dimmed" mt={8} maw={300}>
              We've sent a password reset link to <strong>{form.values.email}</strong>.
              The link will expire in 30 minutes.
            </Text>
          </Box>

          <Stack gap="xs" w="100%">
            <Button
              component={Link}
              to="/login"
              fullWidth
              size="md"
              variant="gradient"
              gradient={{ from: '#8b5cf6', to: '#6d28d9' }}
            >
              Back to Sign In
            </Button>

            <Button
              variant="subtle"
              color="gray"
              onClick={() => {
                setSuccess(false);
                form.reset();
              }}
            >
              Didn't receive the email? Try again
            </Button>
          </Stack>
        </Stack>
      </Paper>
    );
  }

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
            Forgot your password?
          </Text>
          <Text size="sm" c="dimmed" mt={4}>
            No worries, we'll send you reset instructions
          </Text>
        </Box>

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

            <Button
              type="submit"
              fullWidth
              size="md"
              loading={loading}
              variant="gradient"
              gradient={{ from: '#8b5cf6', to: '#6d28d9' }}
            >
              Send Reset Link
            </Button>
          </Stack>
        </form>

        <Anchor
          component={Link}
          to="/login"
          size="sm"
          c="gray.5"
          ta="center"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
        >
          <IconArrowLeft size={14} />
          Back to sign in
        </Anchor>
      </Stack>
    </Paper>
  );
}
