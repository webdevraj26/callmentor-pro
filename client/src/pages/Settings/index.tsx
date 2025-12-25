import { Container, Title, Text, Stack, Paper, Tabs } from '@mantine/core';
import { IconUser, IconBuilding, IconBell } from '@tabler/icons-react';

export default function SettingsPage() {
  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <div>
          <Title order={2}>Settings</Title>
          <Text c="dimmed" mt={4}>
            Manage your account and preferences
          </Text>
        </div>

        <Paper radius="md" withBorder>
          <Tabs defaultValue="profile">
            <Tabs.List>
              <Tabs.Tab value="profile" leftSection={<IconUser size={16} />}>
                Profile
              </Tabs.Tab>
              <Tabs.Tab value="organization" leftSection={<IconBuilding size={16} />}>
                Organization
              </Tabs.Tab>
              <Tabs.Tab value="notifications" leftSection={<IconBell size={16} />}>
                Notifications
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="profile" p="xl">
              <Text c="dimmed">Profile settings coming soon.</Text>
            </Tabs.Panel>

            <Tabs.Panel value="organization" p="xl">
              <Text c="dimmed">Organization settings coming soon.</Text>
            </Tabs.Panel>

            <Tabs.Panel value="notifications" p="xl">
              <Text c="dimmed">Notification settings coming soon.</Text>
            </Tabs.Panel>
          </Tabs>
        </Paper>
      </Stack>
    </Container>
  );
}
