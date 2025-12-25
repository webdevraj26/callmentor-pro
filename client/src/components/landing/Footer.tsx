import {
  Container,
  Text,
  Stack,
  Box,
  Group,
  Anchor,
  SimpleGrid,
} from '@mantine/core';
import { IconHeadphones } from '@tabler/icons-react';

const links = [
  {
    title: 'Product',
    items: ['Features', 'Pricing', 'Integrations', 'Changelog'],
  },
  {
    title: 'Company',
    items: ['About', 'Blog', 'Careers', 'Contact'],
  },
  {
    title: 'Legal',
    items: ['Privacy', 'Terms', 'Security'],
  },
];

export function Footer() {
  return (
    <Box
      py={{ base: 40, md: 60 }}
      style={{
        borderTop: '1px solid var(--mantine-color-dark-6)',
      }}
    >
      <Container size="lg">
        <SimpleGrid cols={{ base: 2, md: 4 }} spacing="xl">
          {/* Brand */}
          <Stack gap="sm">
            <Group gap={8}>
              <Box
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IconHeadphones size={14} color="white" />
              </Box>
              <Text fw={600} c="white">
                CallMentor
              </Text>
            </Group>
            <Text size="xs" c="dimmed" maw={200}>
              AI-powered call coaching for sales teams that want to win.
            </Text>
          </Stack>

          {/* Link Columns */}
          {links.map((section) => (
            <Stack key={section.title} gap="sm">
              <Text size="sm" fw={600} c="white">
                {section.title}
              </Text>
              {section.items.map((item) => (
                <Anchor
                  key={item}
                  href="#"
                  size="sm"
                  c="dimmed"
                  underline="never"
                  style={{ transition: 'color 0.2s' }}
                  onMouseOver={(e) => e.currentTarget.style.color = 'white'}
                  onMouseOut={(e) => e.currentTarget.style.color = 'var(--mantine-color-gray-6)'}
                >
                  {item}
                </Anchor>
              ))}
            </Stack>
          ))}
        </SimpleGrid>

        <Box
          mt="xl"
          pt="xl"
          style={{ borderTop: '1px solid var(--mantine-color-dark-6)' }}
        >
          <Text size="xs" c="dimmed" ta="center">
            © {new Date().getFullYear()} CallMentor Pro. All rights reserved.
          </Text>
        </Box>
      </Container>
    </Box>
  );
}
