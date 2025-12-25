import { Outlet } from 'react-router-dom';
import { Box, Center, Stack, Text, Group } from '@mantine/core';
import { IconHeadphones } from '@tabler/icons-react';

export default function AuthLayout() {
  return (
    <Box
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at top, #1a1523 0%, #0a0a0c 50%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle grid pattern */}
      <Box
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `linear-gradient(rgba(139, 92, 246, 0.03) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(139, 92, 246, 0.03) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <Center mih="100vh" p="md" style={{ position: 'relative', zIndex: 1 }}>
        <Stack align="center" gap="xl" w="100%" maw={420}>
          <Group gap={10}>
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
            <Box>
              <Text
                size="xl"
                fw={700}
                style={{
                  background: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                CallMentor Pro
              </Text>
              <Text c="dimmed" size="xs">
                AI-Powered Sales Call Coaching
              </Text>
            </Box>
          </Group>
          <Outlet />
        </Stack>
      </Center>
    </Box>
  );
}
