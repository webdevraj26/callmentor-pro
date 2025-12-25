import { Container, Title, Text, Stack, Paper } from '@mantine/core';

export default function TeamPage() {
  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <div>
          <Title order={2}>Team Analytics</Title>
          <Text c="dimmed" mt={4}>
            Track team performance and identify coaching opportunities
          </Text>
        </div>

        <Paper p="xl" radius="md" withBorder>
          <Text ta="center" c="dimmed" py="xl">
            Team analytics will be displayed here.
          </Text>
        </Paper>
      </Stack>
    </Container>
  );
}
