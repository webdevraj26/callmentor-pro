import { Link } from 'react-router-dom';
import { Group, Button, Container, Text, Box } from '@mantine/core';
import { IconHeadphones } from '@tabler/icons-react';

export function Navbar() {
  return (
    <Box
      component="nav"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        backgroundColor: 'rgba(10, 10, 12, 0.9)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <Container size="xl" py="sm">
        <Group justify="space-between">
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Group gap={8}>
              <Box
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IconHeadphones size={18} color="white" />
              </Box>
              <Text fw={700} size="lg" c="white">
                CallMentor
              </Text>
            </Group>
          </Link>

          <Group gap="xs">
            <Button
              component={Link}
              to="/login"
              variant="subtle"
              color="gray"
              size="sm"
            >
              Log in
            </Button>
            <Button
              component={Link}
              to="/register"
              size="sm"
              variant="gradient"
              gradient={{ from: '#8b5cf6', to: '#6d28d9' }}
            >
              Try Free
            </Button>
          </Group>
        </Group>
      </Container>
    </Box>
  );
}
