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
  Box,
  Alert,
  Checkbox,
  SegmentedControl,
  Progress,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import {
  IconAlertCircle,
  IconUser,
  IconBriefcase,
  IconUsers,
  IconSchool,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useAuthStore } from '@/store/authStore';
import authService from '@/services/auth';

interface RegisterFormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  companyName: string;
  salesRole: string;
  acceptTerms: boolean;
}

const salesRoles = [
  { value: 'sales_manager', label: 'Sales Manager', icon: IconBriefcase },
  { value: 'vp_sales', label: 'VP of Sales', icon: IconUser },
  { value: 'sales_rep', label: 'Sales Rep', icon: IconUsers },
  { value: 'enablement', label: 'Enablement', icon: IconSchool },
];

function getPasswordStrength(password: string): number {
  let strength = 0;
  if (password.length >= 8) strength += 25;
  if (/[A-Z]/.test(password)) strength += 25;
  if (/[0-9]/.test(password)) strength += 25;
  if (/[^A-Za-z0-9]/.test(password)) strength += 25;
  return strength;
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('invite');
  const { login } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<RegisterFormValues>({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      companyName: '',
      salesRole: 'sales_manager',
      acceptTerms: false,
    },
    validate: {
      firstName: (value) => (value.length >= 2 ? null : 'First name is required'),
      lastName: (value) => (value.length >= 2 ? null : 'Last name is required'),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (value) =>
        value.length >= 8 ? null : 'Password must be at least 8 characters',
      confirmPassword: (value, values) =>
        value === values.password ? null : 'Passwords do not match',
      acceptTerms: (value) => (value ? null : 'You must accept the terms'),
    },
  });

  const passwordStrength = getPasswordStrength(form.values.password);

  const handleSubmit = async (values: RegisterFormValues) => {
    setLoading(true);
    setError(null);

    try {
      const { user, token } = await authService.register({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        confirmPassword: values.confirmPassword,
        companyName: values.companyName,
        salesRole: values.salesRole,
        acceptTerms: values.acceptTerms,
      });

      login(user, token);

      // If there's an invite token, redirect to accept invite page
      if (inviteToken) {
        navigate(`/invite/${inviteToken}`);
      } else {
        navigate('/onboarding');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      setError(error.response?.data?.error?.message || 'Failed to create account. Please try again.');
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
            Create your account
          </Text>
          <Text size="sm" c="dimmed" mt={4}>
            Start your free 7-day trial today
          </Text>
        </Box>

        {inviteToken && (
          <Alert
            icon={<IconUsers size={16} />}
            color="violet"
            variant="light"
          >
            Create an account to accept your team invitation
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
            <Group grow>
              <TextInput
                label="First Name"
                placeholder="John"
                size="md"
                {...form.getInputProps('firstName')}
                styles={{
                  label: { color: 'var(--mantine-color-gray-4)', marginBottom: 6 },
                  input: {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--mantine-color-dark-4)',
                  },
                }}
              />
              <TextInput
                label="Last Name"
                placeholder="Doe"
                size="md"
                {...form.getInputProps('lastName')}
                styles={{
                  label: { color: 'var(--mantine-color-gray-4)', marginBottom: 6 },
                  input: {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--mantine-color-dark-4)',
                  },
                }}
              />
            </Group>

            <TextInput
              label="Work Email"
              placeholder="you@company.com"
              size="md"
              {...form.getInputProps('email')}
              styles={{
                label: { color: 'var(--mantine-color-gray-4)', marginBottom: 6 },
                input: {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--mantine-color-dark-4)',
                },
              }}
            />

            <TextInput
              label="Company Name"
              placeholder="Acme Inc."
              size="md"
              {...form.getInputProps('companyName')}
              styles={{
                label: { color: 'var(--mantine-color-gray-4)', marginBottom: 6 },
                input: {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--mantine-color-dark-4)',
                },
              }}
            />

            <Box>
              <Text size="sm" c="gray.4" mb={6}>
                What's your role?
              </Text>
              <SegmentedControl
                fullWidth
                value={form.values.salesRole}
                onChange={(value) => form.setFieldValue('salesRole', value)}
                data={salesRoles.map((role) => ({
                  value: role.value,
                  label: role.label,
                }))}
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
                    fontSize: '0.8rem',
                    '&[data-active]': {
                      color: 'white',
                    },
                  },
                }}
              />
            </Box>

            <Box>
              <PasswordInput
                label="Password"
                placeholder="Create a strong password"
                size="md"
                {...form.getInputProps('password')}
                styles={{
                  label: { color: 'var(--mantine-color-gray-4)', marginBottom: 6 },
                  input: {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--mantine-color-dark-4)',
                  },
                }}
              />
              {form.values.password && (
                <Box mt="xs">
                  <Progress
                    value={passwordStrength}
                    color={
                      passwordStrength < 50
                        ? 'red'
                        : passwordStrength < 75
                        ? 'yellow'
                        : 'green'
                    }
                    size="xs"
                  />
                  <Text size="xs" c="dimmed" mt={4}>
                    {passwordStrength < 50
                      ? 'Weak password'
                      : passwordStrength < 75
                      ? 'Moderate password'
                      : 'Strong password'}
                  </Text>
                </Box>
              )}
            </Box>

            <PasswordInput
              label="Confirm Password"
              placeholder="Confirm your password"
              size="md"
              {...form.getInputProps('confirmPassword')}
              styles={{
                label: { color: 'var(--mantine-color-gray-4)', marginBottom: 6 },
                input: {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--mantine-color-dark-4)',
                },
              }}
            />

            <Checkbox
              label={
                <Text size="sm" c="gray.5">
                  I agree to the{' '}
                  <Anchor href="#" c="violet.4" size="sm">
                    Terms of Service
                  </Anchor>{' '}
                  and{' '}
                  <Anchor href="#" c="violet.4" size="sm">
                    Privacy Policy
                  </Anchor>
                </Text>
              }
              color="violet"
              {...form.getInputProps('acceptTerms', { type: 'checkbox' })}
              error={form.errors.acceptTerms}
            />

            <Button
              type="submit"
              fullWidth
              size="md"
              mt="sm"
              loading={loading}
              variant="gradient"
              gradient={{ from: '#8b5cf6', to: '#6d28d9' }}
            >
              Start Free Trial
            </Button>
          </Stack>
        </form>

        <Text size="sm" ta="center" c="dimmed">
          Already have an account?{' '}
          <Anchor component={Link} to="/login" fw={500} c="violet.4">
            Sign in
          </Anchor>
        </Text>
      </Stack>
    </Paper>
  );
}
