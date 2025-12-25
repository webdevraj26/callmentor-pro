import { useState } from 'react';
import {
  Box,
  Container,
  Title,
  Text,
  Stack,
  Paper,
  Tabs,
  TextInput,
  PasswordInput,
  Button,
  Group,
  Switch,
  Divider,
  Avatar,
  Select,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
  IconUser,
  IconLock,
  IconBell,
  IconCheck,
} from '@tabler/icons-react';
import { useAuthStore } from '@/store/authStore';
import api from '@/services/api';

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore();
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingNotifications, setSavingNotifications] = useState(false);

  const profileForm = useForm({
    initialValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      companyName: user?.companyName || '',
      salesRole: user?.salesRole || '',
    },
    validate: {
      firstName: (value) => (value.length < 1 ? 'First name is required' : null),
      lastName: (value) => (value.length < 1 ? 'Last name is required' : null),
    },
  });

  const passwordForm = useForm({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validate: {
      currentPassword: (value) => (value.length < 1 ? 'Current password is required' : null),
      newPassword: (value) => {
        if (value.length < 8) return 'Password must be at least 8 characters';
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          return 'Password must contain uppercase, lowercase, and number';
        }
        return null;
      },
      confirmPassword: (value, values) =>
        value !== values.newPassword ? 'Passwords do not match' : null,
    },
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailAnalysisComplete: true,
    emailWeeklyDigest: true,
    emailTeamUpdates: false,
    emailNewFeatures: true,
  });

  const handleProfileSubmit = async (values: typeof profileForm.values) => {
    setSavingProfile(true);
    try {
      const response = await api.put('/auth/profile', values);
      updateUser(response.data.data);
      notifications.show({
        title: 'Profile Updated',
        message: 'Your profile has been updated successfully',
        color: 'green',
        icon: <IconCheck size={16} />,
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to update profile',
        color: 'red',
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (values: typeof passwordForm.values) => {
    setSavingPassword(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      passwordForm.reset();
      notifications.show({
        title: 'Password Changed',
        message: 'Your password has been changed successfully',
        color: 'green',
        icon: <IconCheck size={16} />,
      });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: { message?: string } } } };
      notifications.show({
        title: 'Error',
        message: err.response?.data?.error?.message || 'Failed to change password',
        color: 'red',
      });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleNotificationsSave = async () => {
    setSavingNotifications(true);
    try {
      // TODO: Implement notification settings API
      await new Promise((resolve) => setTimeout(resolve, 500));
      notifications.show({
        title: 'Notifications Updated',
        message: 'Your notification preferences have been saved',
        color: 'green',
        icon: <IconCheck size={16} />,
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to update notifications',
        color: 'red',
      });
    } finally {
      setSavingNotifications(false);
    }
  };

  const inputStyles = {
    label: { color: 'var(--mantine-color-gray-4)' },
    input: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid var(--mantine-color-dark-4)',
    },
  };

  return (
    <Box
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, var(--mantine-color-dark-8) 0%, var(--mantine-color-dark-9) 100%)',
      }}
    >
      <Container size="lg" py="xl">
        <Stack gap="xl">
          <Box>
            <Title order={2} c="white">
              Settings
            </Title>
            <Text c="dimmed" mt={4}>
              Manage your account and preferences
            </Text>
          </Box>

          <Tabs defaultValue="profile" color="violet">
            <Tabs.List>
              <Tabs.Tab value="profile" leftSection={<IconUser size={16} />}>
                Profile
              </Tabs.Tab>
              <Tabs.Tab value="security" leftSection={<IconLock size={16} />}>
                Security
              </Tabs.Tab>
              <Tabs.Tab value="notifications" leftSection={<IconBell size={16} />}>
                Notifications
              </Tabs.Tab>
            </Tabs.List>

            {/* Profile Tab */}
            <Tabs.Panel value="profile" pt="xl">
              <Paper
                p="xl"
                radius="lg"
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--mantine-color-dark-4)',
                }}
              >
                <form onSubmit={profileForm.onSubmit(handleProfileSubmit)}>
                  <Stack gap="lg">
                    {/* Avatar Section */}
                    <Group>
                      <Avatar
                        size={80}
                        radius="xl"
                        color="violet"
                        src={user?.avatar}
                      >
                        {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Text fw={600} c="white" size="lg">
                          {user?.firstName} {user?.lastName}
                        </Text>
                        <Text c="dimmed" size="sm">
                          {user?.email}
                        </Text>
                      </Box>
                    </Group>

                    <Divider />

                    <Group grow>
                      <TextInput
                        label="First Name"
                        placeholder="John"
                        {...profileForm.getInputProps('firstName')}
                        styles={inputStyles}
                      />
                      <TextInput
                        label="Last Name"
                        placeholder="Doe"
                        {...profileForm.getInputProps('lastName')}
                        styles={inputStyles}
                      />
                    </Group>

                    <TextInput
                      label="Email"
                      value={user?.email || ''}
                      disabled
                      description="Email cannot be changed"
                      styles={{
                        ...inputStyles,
                        description: { color: 'var(--mantine-color-gray-6)' },
                      }}
                    />

                    <TextInput
                      label="Company"
                      placeholder="Acme Inc."
                      {...profileForm.getInputProps('companyName')}
                      styles={inputStyles}
                    />

                    <Select
                      label="Sales Role"
                      placeholder="Select your role"
                      data={[
                        { value: 'sales_rep', label: 'Sales Representative' },
                        { value: 'sales_manager', label: 'Sales Manager' },
                        { value: 'vp_sales', label: 'VP of Sales' },
                        { value: 'enablement', label: 'Sales Enablement' },
                      ]}
                      {...profileForm.getInputProps('salesRole')}
                      styles={inputStyles}
                    />

                    <Group justify="flex-end">
                      <Button type="submit" loading={savingProfile}>
                        Save Changes
                      </Button>
                    </Group>
                  </Stack>
                </form>
              </Paper>
            </Tabs.Panel>

            {/* Security Tab */}
            <Tabs.Panel value="security" pt="xl">
              <Paper
                p="xl"
                radius="lg"
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--mantine-color-dark-4)',
                }}
              >
                <Stack gap="lg">
                  <Box>
                    <Text fw={600} c="white" size="lg">
                      Change Password
                    </Text>
                    <Text c="dimmed" size="sm" mt={4}>
                      Update your password to keep your account secure
                    </Text>
                  </Box>

                  <Divider />

                  <form onSubmit={passwordForm.onSubmit(handlePasswordSubmit)}>
                    <Stack gap="md">
                      <PasswordInput
                        label="Current Password"
                        placeholder="Enter your current password"
                        {...passwordForm.getInputProps('currentPassword')}
                        styles={inputStyles}
                      />

                      <PasswordInput
                        label="New Password"
                        placeholder="Enter new password"
                        description="At least 8 characters with uppercase, lowercase, and number"
                        {...passwordForm.getInputProps('newPassword')}
                        styles={{
                          ...inputStyles,
                          description: { color: 'var(--mantine-color-gray-6)' },
                        }}
                      />

                      <PasswordInput
                        label="Confirm New Password"
                        placeholder="Confirm new password"
                        {...passwordForm.getInputProps('confirmPassword')}
                        styles={inputStyles}
                      />

                      <Group justify="flex-end" mt="md">
                        <Button type="submit" loading={savingPassword}>
                          Update Password
                        </Button>
                      </Group>
                    </Stack>
                  </form>
                </Stack>
              </Paper>
            </Tabs.Panel>

            {/* Notifications Tab */}
            <Tabs.Panel value="notifications" pt="xl">
              <Paper
                p="xl"
                radius="lg"
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--mantine-color-dark-4)',
                }}
              >
                <Stack gap="lg">
                  <Box>
                    <Text fw={600} c="white" size="lg">
                      Email Notifications
                    </Text>
                    <Text c="dimmed" size="sm" mt={4}>
                      Choose which emails you want to receive
                    </Text>
                  </Box>

                  <Divider />

                  <Stack gap="md">
                    <Switch
                      label="Call Analysis Complete"
                      description="Get notified when your call analysis is ready"
                      checked={notificationSettings.emailAnalysisComplete}
                      onChange={(e) =>
                        setNotificationSettings((s) => ({
                          ...s,
                          emailAnalysisComplete: e.target.checked,
                        }))
                      }
                      styles={{
                        label: { color: 'var(--mantine-color-gray-2)' },
                        description: { color: 'var(--mantine-color-gray-5)' },
                      }}
                    />

                    <Switch
                      label="Weekly Performance Digest"
                      description="Receive a weekly summary of your call performance"
                      checked={notificationSettings.emailWeeklyDigest}
                      onChange={(e) =>
                        setNotificationSettings((s) => ({
                          ...s,
                          emailWeeklyDigest: e.target.checked,
                        }))
                      }
                      styles={{
                        label: { color: 'var(--mantine-color-gray-2)' },
                        description: { color: 'var(--mantine-color-gray-5)' },
                      }}
                    />

                    <Switch
                      label="Team Updates"
                      description="Get updates when team members upload new calls"
                      checked={notificationSettings.emailTeamUpdates}
                      onChange={(e) =>
                        setNotificationSettings((s) => ({
                          ...s,
                          emailTeamUpdates: e.target.checked,
                        }))
                      }
                      styles={{
                        label: { color: 'var(--mantine-color-gray-2)' },
                        description: { color: 'var(--mantine-color-gray-5)' },
                      }}
                    />

                    <Switch
                      label="New Features & Tips"
                      description="Learn about new features and get coaching tips"
                      checked={notificationSettings.emailNewFeatures}
                      onChange={(e) =>
                        setNotificationSettings((s) => ({
                          ...s,
                          emailNewFeatures: e.target.checked,
                        }))
                      }
                      styles={{
                        label: { color: 'var(--mantine-color-gray-2)' },
                        description: { color: 'var(--mantine-color-gray-5)' },
                      }}
                    />
                  </Stack>

                  <Group justify="flex-end" mt="md">
                    <Button onClick={handleNotificationsSave} loading={savingNotifications}>
                      Save Preferences
                    </Button>
                  </Group>
                </Stack>
              </Paper>
            </Tabs.Panel>
          </Tabs>
        </Stack>
      </Container>
    </Box>
  );
}
