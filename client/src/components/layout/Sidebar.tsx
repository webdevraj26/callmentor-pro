import { NavLink, useLocation } from 'react-router-dom';
import {
  Stack,
  Group,
  Text,
  UnstyledButton,
  Box,
  Avatar,
  Menu,
  ActionIcon,
  Divider,
  Tooltip,
  Badge,
} from '@mantine/core';
import {
  IconLayoutDashboard,
  IconPhone,
  IconUsers,
  IconSettings,
  IconLogout,
  IconChevronLeft,
  IconChevronRight,
  IconHeadphones,
  IconChartBar,
  IconUpload,
} from '@tabler/icons-react';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';

const navItems = [
  { icon: IconLayoutDashboard, label: 'Command Center', path: '/dashboard' },
  { icon: IconPhone, label: 'Calls', path: '/calls', badge: '4' },
  { icon: IconChartBar, label: 'Analytics', path: '/analytics' },
  { icon: IconUsers, label: 'Team', path: '/team' },
  { icon: IconSettings, label: 'Settings', path: '/settings' },
];

export default function Sidebar() {
  const location = useLocation();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { user, logout } = useAuthStore();

  return (
    <Box
      p="md"
      h="100%"
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--mantine-color-dark-7)',
      }}
    >
      {/* Logo */}
      <Group justify="space-between" mb="xl">
        <Group gap={10}>
          <Box
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <IconHeadphones size={18} color="white" />
          </Box>
          {!sidebarCollapsed && (
            <Text
              size="lg"
              fw={700}
              style={{
                background: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              CallMentor
            </Text>
          )}
        </Group>
        {!sidebarCollapsed && (
          <ActionIcon variant="subtle" onClick={toggleSidebar} color="gray" size="sm">
            <IconChevronLeft size={16} />
          </ActionIcon>
        )}
      </Group>

      {/* Collapse button when collapsed */}
      {sidebarCollapsed && (
        <ActionIcon
          variant="subtle"
          onClick={toggleSidebar}
          color="gray"
          size="sm"
          mb="md"
          style={{ alignSelf: 'center' }}
        >
          <IconChevronRight size={16} />
        </ActionIcon>
      )}

      {/* Navigation */}
      <Stack gap="xs" style={{ flex: 1 }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

          const navItem = 'badge' in item ? item as typeof item & { badge?: string } : item;

          const button = (
            <UnstyledButton
              component={NavLink}
              to={item.path}
              key={item.path}
              p="sm"
              style={{
                borderRadius: 'var(--mantine-radius-md)',
                backgroundColor: isActive ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--mantine-color-violet-5)' : '3px solid transparent',
                color: isActive ? 'white' : 'var(--mantine-color-gray-4)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--mantine-spacing-sm)',
                transition: 'all 0.2s ease',
              }}
            >
              <item.icon size={20} style={{ opacity: isActive ? 1 : 0.7 }} />
              {!sidebarCollapsed && (
                <Group justify="space-between" style={{ flex: 1 }}>
                  <Text size="sm" fw={isActive ? 600 : 500}>{item.label}</Text>
                  {navItem.badge && (
                    <Badge size="xs" color="violet" variant="filled">
                      {navItem.badge}
                    </Badge>
                  )}
                </Group>
              )}
            </UnstyledButton>
          );

          return sidebarCollapsed ? (
            <Tooltip label={item.label} position="right" key={item.path}>
              {button}
            </Tooltip>
          ) : (
            button
          );
        })}
      </Stack>

      {/* Quick Upload Button */}
      {!sidebarCollapsed && (
        <UnstyledButton
          p="sm"
          mb="md"
          style={{
            borderRadius: 'var(--mantine-radius-md)',
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(109, 40, 217, 0.1) 100%)',
            border: '1px dashed var(--mantine-color-violet-7)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--mantine-spacing-sm)',
            color: 'var(--mantine-color-violet-4)',
            transition: 'all 0.2s ease',
          }}
        >
          <IconUpload size={18} />
          <Text size="sm" fw={500}>Upload Call</Text>
        </UnstyledButton>
      )}

      {/* User Menu */}
      <Divider my="md" />
      <Menu position="top-start" withArrow>
        <Menu.Target>
          <UnstyledButton
            p="sm"
            style={{
              borderRadius: 'var(--mantine-radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--mantine-spacing-sm)',
            }}
          >
            <Avatar color="violet" radius="xl" size={sidebarCollapsed ? 'sm' : 'md'}>
              {user?.firstName?.charAt(0) || 'U'}
            </Avatar>
            {!sidebarCollapsed && (
              <Box style={{ flex: 1, overflow: 'hidden' }}>
                <Text size="sm" fw={500} truncate>
                  {user?.firstName} {user?.lastName}
                </Text>
                <Text size="xs" c="dimmed" truncate>
                  {user?.email}
                </Text>
              </Box>
            )}
          </UnstyledButton>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Label>Account</Menu.Label>
          <Menu.Item
            leftSection={<IconSettings size={16} />}
            component={NavLink}
            to="/settings"
          >
            Settings
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item
            color="red"
            leftSection={<IconLogout size={16} />}
            onClick={logout}
          >
            Logout
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Box>
  );
}
