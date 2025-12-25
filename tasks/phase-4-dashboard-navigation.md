# Phase 4: Dashboard & Navigation

## Overview
Build the main dashboard layout with sidebar navigation, metric cards, and the dashboard home page showing key analytics.

**Reference**: SPECIFICATION.md - Section 7.4 (Team Analytics Dashboard)

---

## Task 4.1: Create Dashboard Layout with Sidebar

### Description
Build the main dashboard layout with collapsible sidebar navigation.

### Files to Create
```
client/src/components/layout/DashboardLayout.tsx
client/src/components/layout/Sidebar.tsx
client/src/components/layout/DashboardHeader.tsx
```

### Sidebar Component
```typescript
// client/src/components/layout/Sidebar.tsx
import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Box,
  Stack,
  Text,
  Tooltip,
  UnstyledButton,
  Group,
  ActionIcon,
} from '@mantine/core';
import {
  IconLayoutDashboard,
  IconPhone,
  IconUsers,
  IconSettings,
  IconSparkles,
  IconChevronLeft,
  IconChevronRight,
  IconLogout,
} from '@tabler/icons-react';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';

interface NavItem {
  icon: typeof IconLayoutDashboard;
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { icon: IconLayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: IconPhone, label: 'Calls', path: '/calls' },
  { icon: IconUsers, label: 'Team', path: '/team' },
  { icon: IconSettings, label: 'Settings', path: '/settings' },
];

function NavItem({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const location = useLocation();
  const isActive = location.pathname === item.path ||
    (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

  const button = (
    <UnstyledButton
      component={NavLink}
      to={item.path}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: collapsed ? '12px' : '12px 16px',
        borderRadius: 8,
        width: '100%',
        justifyContent: collapsed ? 'center' : 'flex-start',
        backgroundColor: isActive
          ? 'rgba(139, 92, 246, 0.15)'
          : 'transparent',
        color: isActive
          ? 'var(--mantine-color-violet-4)'
          : 'var(--mantine-color-gray-5)',
        transition: 'all 0.2s',
        textDecoration: 'none',
      }}
      onMouseEnter={(e: any) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = 'var(--mantine-color-dark-5)';
        }
      }}
      onMouseLeave={(e: any) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = 'transparent';
        }
      }}
    >
      <item.icon size={20} stroke={1.5} />
      {!collapsed && (
        <Text size="sm" fw={500}>
          {item.label}
        </Text>
      )}
    </UnstyledButton>
  );

  if (collapsed) {
    return (
      <Tooltip label={item.label} position="right" withArrow>
        {button}
      </Tooltip>
    );
  }

  return button;
}

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const logout = useAuthStore((state) => state.logout);

  return (
    <Box
      component="nav"
      style={{
        width: sidebarCollapsed ? 72 : 240,
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        backgroundColor: 'var(--mantine-color-dark-8)',
        borderRight: '1px solid var(--mantine-color-dark-6)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.2s ease',
        zIndex: 100,
      }}
    >
      {/* Logo */}
      <Box
        p="md"
        style={{
          borderBottom: '1px solid var(--mantine-color-dark-6)',
        }}
      >
        <Group gap="xs" justify={sidebarCollapsed ? 'center' : 'flex-start'}>
          <IconSparkles size={28} color="var(--mantine-color-violet-5)" />
          {!sidebarCollapsed && (
            <Text fw={700} size="lg" c="white">
              CallMentor
            </Text>
          )}
        </Group>
      </Box>

      {/* Navigation */}
      <Box p="sm" style={{ flex: 1 }}>
        <Stack gap="xs">
          {navItems.map((item) => (
            <NavItem key={item.path} item={item} collapsed={sidebarCollapsed} />
          ))}
        </Stack>
      </Box>

      {/* Bottom Actions */}
      <Box
        p="sm"
        style={{
          borderTop: '1px solid var(--mantine-color-dark-6)',
        }}
      >
        <Stack gap="xs">
          {/* Logout */}
          <Tooltip
            label="Logout"
            position="right"
            withArrow
            disabled={!sidebarCollapsed}
          >
            <UnstyledButton
              onClick={logout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: sidebarCollapsed ? '12px' : '12px 16px',
                borderRadius: 8,
                width: '100%',
                justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                color: 'var(--mantine-color-gray-5)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--mantine-color-dark-5)';
                e.currentTarget.style.color = 'var(--mantine-color-red-4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--mantine-color-gray-5)';
              }}
            >
              <IconLogout size={20} stroke={1.5} />
              {!sidebarCollapsed && (
                <Text size="sm" fw={500}>
                  Logout
                </Text>
              )}
            </UnstyledButton>
          </Tooltip>

          {/* Collapse Toggle */}
          <Box ta="center" mt="xs">
            <ActionIcon
              variant="subtle"
              color="gray"
              onClick={toggleSidebar}
              size="lg"
            >
              {sidebarCollapsed ? (
                <IconChevronRight size={18} />
              ) : (
                <IconChevronLeft size={18} />
              )}
            </ActionIcon>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}
```

### Dashboard Header
```typescript
// client/src/components/layout/DashboardHeader.tsx
import {
  Box,
  Group,
  Text,
  Avatar,
  Menu,
  UnstyledButton,
  Badge,
} from '@mantine/core';
import { Link } from 'react-router-dom';
import {
  IconUser,
  IconSettings,
  IconLogout,
  IconChevronDown,
} from '@tabler/icons-react';
import { useAuthStore } from '@/store/authStore';

export function DashboardHeader() {
  const { user, logout } = useAuthStore();

  return (
    <Box
      component="header"
      py="sm"
      px="lg"
      style={{
        backgroundColor: 'var(--mantine-color-dark-8)',
        borderBottom: '1px solid var(--mantine-color-dark-6)',
      }}
    >
      <Group justify="flex-end">
        <Menu shadow="md" width={200} position="bottom-end">
          <Menu.Target>
            <UnstyledButton
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 12px',
                borderRadius: 8,
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--mantine-color-dark-6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <Avatar
                size="sm"
                radius="xl"
                color="violet"
                src={user?.avatar}
              >
                {user?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase()}
              </Avatar>
              <Box style={{ flex: 1 }} visibleFrom="sm">
                <Text size="sm" fw={500} c="white" lh={1.2}>
                  {user?.fullName}
                </Text>
                <Text size="xs" c="dimmed" lh={1.2}>
                  {user?.email}
                </Text>
              </Box>
              <IconChevronDown size={14} color="var(--mantine-color-gray-5)" />
            </UnstyledButton>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Label>Account</Menu.Label>
            <Menu.Item
              leftSection={<IconUser size={14} />}
              component={Link}
              to="/settings"
            >
              Profile
            </Menu.Item>
            <Menu.Item
              leftSection={<IconSettings size={14} />}
              component={Link}
              to="/settings"
            >
              Settings
            </Menu.Item>

            <Menu.Divider />

            <Menu.Item
              color="red"
              leftSection={<IconLogout size={14} />}
              onClick={logout}
            >
              Logout
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </Box>
  );
}
```

### Dashboard Layout
```typescript
// client/src/components/layout/DashboardLayout.tsx
import { Outlet } from 'react-router-dom';
import { Box, LoadingOverlay } from '@mantine/core';
import { Sidebar } from './Sidebar';
import { DashboardHeader } from './DashboardHeader';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';

export default function DashboardLayout() {
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed);
  const isLoading = useAuthStore((state) => state.isLoading);

  const sidebarWidth = sidebarCollapsed ? 72 : 240;

  if (isLoading) {
    return (
      <Box style={{ height: '100vh', position: 'relative' }}>
        <LoadingOverlay visible={true} />
      </Box>
    );
  }

  return (
    <Box
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--mantine-color-dark-9)',
      }}
    >
      <Sidebar />

      <Box
        style={{
          marginLeft: sidebarWidth,
          transition: 'margin-left 0.2s ease',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <DashboardHeader />

        <Box
          component="main"
          p="lg"
          style={{ flex: 1 }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
```

### Acceptance Criteria
- [ ] Sidebar renders with nav items
- [ ] Active state highlights current page
- [ ] Collapse/expand works
- [ ] User menu displays
- [ ] Logout works
- [ ] Layout responsive

---

## Task 4.2: Create Metric Card Component

### Description
Build a reusable metric card component for displaying KPIs.

### Files to Create
```
client/src/components/common/MetricCard.tsx
```

### Implementation
```typescript
// client/src/components/common/MetricCard.tsx
import {
  Paper,
  Group,
  Text,
  ThemeIcon,
  Box,
  Stack,
} from '@mantine/core';
import { IconTrendingUp, IconTrendingDown, IconMinus } from '@tabler/icons-react';
import type { TablerIconsProps } from '@tabler/icons-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ComponentType<TablerIconsProps>;
  trend?: {
    value: number;
    label?: string;
  };
  color?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'violet',
}: MetricCardProps) {
  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.value > 0) return IconTrendingUp;
    if (trend.value < 0) return IconTrendingDown;
    return IconMinus;
  };

  const getTrendColor = () => {
    if (!trend) return 'gray';
    if (trend.value > 0) return 'green';
    if (trend.value < 0) return 'red';
    return 'gray';
  };

  const TrendIcon = getTrendIcon();

  return (
    <Paper
      p="lg"
      radius="md"
      bg="dark.7"
      style={{
        border: '1px solid var(--mantine-color-dark-5)',
      }}
    >
      <Group justify="space-between" align="flex-start">
        <Stack gap="xs">
          <Text size="sm" c="dimmed" fw={500}>
            {title}
          </Text>
          <Text size="2rem" fw={700} c="white" lh={1}>
            {value}
          </Text>
          {subtitle && (
            <Text size="xs" c="dimmed">
              {subtitle}
            </Text>
          )}
          {trend && (
            <Group gap="xs">
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  color: `var(--mantine-color-${getTrendColor()}-5)`,
                }}
              >
                {TrendIcon && <TrendIcon size={16} />}
                <Text size="sm" fw={500}>
                  {trend.value > 0 ? '+' : ''}
                  {trend.value}%
                </Text>
              </Box>
              {trend.label && (
                <Text size="xs" c="dimmed">
                  {trend.label}
                </Text>
              )}
            </Group>
          )}
        </Stack>

        {Icon && (
          <ThemeIcon
            size={48}
            radius="md"
            variant="light"
            color={color}
          >
            <Icon size={24} stroke={1.5} />
          </ThemeIcon>
        )}
      </Group>
    </Paper>
  );
}
```

### Acceptance Criteria
- [ ] Card displays title and value
- [ ] Optional icon renders
- [ ] Trend indicator shows direction
- [ ] Colors match design system

---

## Task 4.3: Create Score Trend Chart

### Description
Build a line chart component to show score trends over time.

### Installation
```bash
cd client
npm install chart.js react-chartjs-2
```

### Files to Create
```
client/src/components/analytics/ScoreTrendChart.tsx
```

### Implementation
```typescript
// client/src/components/analytics/ScoreTrendChart.tsx
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Paper, Text, Stack, Group, Select } from '@mantine/core';
import { useState } from 'react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

interface ScoreTrendChartProps {
  data: Array<{
    date: string;
    score: number;
  }>;
  title?: string;
}

export function ScoreTrendChart({ data, title = 'Score Trend' }: ScoreTrendChartProps) {
  const [period, setPeriod] = useState<string>('7d');

  const chartData = {
    labels: data.map((d) => {
      const date = new Date(d.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: 'Score',
        data: data.map((d) => d.score),
        fill: true,
        borderColor: 'rgb(139, 92, 246)',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.4,
        pointBackgroundColor: 'rgb(139, 92, 246)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(24, 24, 27, 0.95)',
        titleColor: '#fff',
        bodyColor: '#a1a1aa',
        borderColor: 'rgba(139, 92, 246, 0.3)',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context: any) => `Score: ${context.parsed.y}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#71717a',
        },
      },
      y: {
        min: 0,
        max: 100,
        grid: {
          color: 'rgba(113, 113, 122, 0.1)',
        },
        ticks: {
          color: '#71717a',
          stepSize: 20,
        },
      },
    },
  };

  return (
    <Paper
      p="lg"
      radius="md"
      bg="dark.7"
      style={{ border: '1px solid var(--mantine-color-dark-5)' }}
    >
      <Stack gap="md">
        <Group justify="space-between">
          <Text fw={600} c="white">
            {title}
          </Text>
          <Select
            size="xs"
            value={period}
            onChange={(value) => setPeriod(value || '7d')}
            data={[
              { value: '7d', label: 'Last 7 days' },
              { value: '30d', label: 'Last 30 days' },
              { value: '90d', label: 'Last 90 days' },
            ]}
            styles={{
              input: {
                backgroundColor: 'var(--mantine-color-dark-6)',
                borderColor: 'var(--mantine-color-dark-5)',
              },
            }}
          />
        </Group>

        <div style={{ height: 250 }}>
          <Line data={chartData} options={options} />
        </div>
      </Stack>
    </Paper>
  );
}
```

### Acceptance Criteria
- [ ] Chart renders correctly
- [ ] Period selector works
- [ ] Tooltips show values
- [ ] Responsive sizing
- [ ] Matches dark theme

---

## Task 4.4: Create Recent Calls List Component

### Description
Build a component to display recent calls with quick info.

### Files to Create
```
client/src/components/calls/RecentCallsList.tsx
```

### Implementation
```typescript
// client/src/components/calls/RecentCallsList.tsx
import { Link } from 'react-router-dom';
import {
  Paper,
  Stack,
  Group,
  Text,
  Avatar,
  Badge,
  Box,
  Button,
} from '@mantine/core';
import { IconChevronRight, IconPhone } from '@tabler/icons-react';
import type { Call } from '@/types';
import { getScoreColor, getScoreLabel, formatDate, formatDuration } from '@/utils/formatters';

interface RecentCallsListProps {
  calls: Call[];
  showViewAll?: boolean;
}

export function RecentCallsList({ calls, showViewAll = true }: RecentCallsListProps) {
  return (
    <Paper
      p="lg"
      radius="md"
      bg="dark.7"
      style={{ border: '1px solid var(--mantine-color-dark-5)' }}
    >
      <Stack gap="md">
        <Group justify="space-between">
          <Text fw={600} c="white">
            Recent Calls
          </Text>
          {showViewAll && (
            <Button
              component={Link}
              to="/calls"
              variant="subtle"
              size="xs"
              rightSection={<IconChevronRight size={14} />}
            >
              View All
            </Button>
          )}
        </Group>

        <Stack gap="sm">
          {calls.length === 0 ? (
            <Box py="xl" ta="center">
              <IconPhone size={40} color="var(--mantine-color-dark-4)" />
              <Text c="dimmed" size="sm" mt="sm">
                No calls yet
              </Text>
              <Button
                component={Link}
                to="/calls"
                variant="light"
                size="sm"
                mt="md"
              >
                Upload Your First Call
              </Button>
            </Box>
          ) : (
            calls.slice(0, 5).map((call) => (
              <Box
                key={call._id}
                component={Link}
                to={`/calls/${call._id}`}
                style={{
                  display: 'block',
                  padding: 12,
                  borderRadius: 8,
                  backgroundColor: 'var(--mantine-color-dark-6)',
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e: any) => {
                  e.currentTarget.style.backgroundColor = 'var(--mantine-color-dark-5)';
                }}
                onMouseLeave={(e: any) => {
                  e.currentTarget.style.backgroundColor = 'var(--mantine-color-dark-6)';
                }}
              >
                <Group justify="space-between" wrap="nowrap">
                  <Group gap="sm" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                    <Avatar
                      size="md"
                      radius="md"
                      color="violet"
                    >
                      {call.prospect.company.substring(0, 2).toUpperCase()}
                    </Avatar>
                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <Text
                        size="sm"
                        fw={500}
                        c="white"
                        truncate
                      >
                        {call.title}
                      </Text>
                      <Text size="xs" c="dimmed" truncate>
                        {call.repName} • {formatDate(call.date)} • {formatDuration(call.duration)}
                      </Text>
                    </Box>
                  </Group>

                  <Badge
                    size="lg"
                    variant="light"
                    color={getScoreColor(call.score)}
                    style={{ flexShrink: 0 }}
                  >
                    {call.score}
                  </Badge>
                </Group>
              </Box>
            ))
          )}
        </Stack>
      </Stack>
    </Paper>
  );
}
```

### Acceptance Criteria
- [ ] Displays recent calls
- [ ] Links to call detail
- [ ] Shows score with color
- [ ] Empty state works
- [ ] View all button links

---

## Task 4.5: Create Top Performers Component

### Description
Build a component showing top-performing reps.

### Files to Create
```
client/src/components/analytics/TopPerformersList.tsx
```

### Implementation
```typescript
// client/src/components/analytics/TopPerformersList.tsx
import {
  Paper,
  Stack,
  Group,
  Text,
  Avatar,
  Box,
  Progress,
} from '@mantine/core';
import { IconTrophy } from '@tabler/icons-react';
import type { RepPerformance } from '@/types';

interface TopPerformersListProps {
  performers: RepPerformance[];
}

const rankColors = ['yellow', 'gray', 'orange'];

export function TopPerformersList({ performers }: TopPerformersListProps) {
  return (
    <Paper
      p="lg"
      radius="md"
      bg="dark.7"
      style={{ border: '1px solid var(--mantine-color-dark-5)' }}
    >
      <Stack gap="md">
        <Group gap="xs">
          <IconTrophy size={20} color="var(--mantine-color-yellow-5)" />
          <Text fw={600} c="white">
            Top Performers
          </Text>
        </Group>

        <Stack gap="sm">
          {performers.slice(0, 5).map((performer, index) => (
            <Box
              key={performer.user._id}
              p="sm"
              style={{
                borderRadius: 8,
                backgroundColor: index === 0
                  ? 'rgba(234, 179, 8, 0.1)'
                  : 'var(--mantine-color-dark-6)',
              }}
            >
              <Group justify="space-between" mb="xs">
                <Group gap="sm">
                  <Text
                    size="lg"
                    fw={700}
                    c={index < 3 ? `${rankColors[index]}.5` : 'dimmed'}
                    w={24}
                    ta="center"
                  >
                    {index + 1}
                  </Text>
                  <Avatar
                    size="sm"
                    radius="xl"
                    src={performer.user.avatar}
                    color="violet"
                  >
                    {performer.user.fullName.split(' ').map(n => n[0]).join('')}
                  </Avatar>
                  <Box>
                    <Text size="sm" fw={500} c="white" lh={1.2}>
                      {performer.user.fullName}
                    </Text>
                    <Text size="xs" c="dimmed" lh={1.2}>
                      {performer.calls} calls
                    </Text>
                  </Box>
                </Group>

                <Text
                  size="lg"
                  fw={700}
                  c={performer.avgScore >= 80 ? 'green.5' : performer.avgScore >= 60 ? 'yellow.5' : 'red.5'}
                >
                  {performer.avgScore}
                </Text>
              </Group>

              <Progress
                value={performer.avgScore}
                color={performer.avgScore >= 80 ? 'green' : performer.avgScore >= 60 ? 'yellow' : 'red'}
                size="xs"
                radius="xl"
              />
            </Box>
          ))}

          {performers.length === 0 && (
            <Box py="xl" ta="center">
              <Text c="dimmed" size="sm">
                No data yet
              </Text>
            </Box>
          )}
        </Stack>
      </Stack>
    </Paper>
  );
}
```

### Acceptance Criteria
- [ ] Shows ranked performers
- [ ] First place highlighted
- [ ] Score progress bars
- [ ] Empty state works

---

## Task 4.6: Create Dashboard Page

### Description
Build the main dashboard page assembling all components.

### Files to Create
```
client/src/pages/Dashboard/index.tsx
```

### Implementation
```typescript
// client/src/pages/Dashboard/index.tsx
import {
  SimpleGrid,
  Stack,
  Title,
  Text,
  Group,
  Select,
} from '@mantine/core';
import {
  IconTarget,
  IconPhone,
  IconMessageCircle,
  IconUsers,
} from '@tabler/icons-react';
import { useState } from 'react';
import { MetricCard } from '@/components/common/MetricCard';
import { ScoreTrendChart } from '@/components/analytics/ScoreTrendChart';
import { RecentCallsList } from '@/components/calls/RecentCallsList';
import { TopPerformersList } from '@/components/analytics/TopPerformersList';
import { useAuthStore } from '@/store/authStore';
import { mockCalls, mockScoreTrend, mockTopPerformers } from '@/mocks';

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const [period, setPeriod] = useState('30d');

  // Mock metrics - replace with real API data
  const metrics = {
    avgScore: 78,
    avgScoreTrend: 5,
    totalCalls: 48,
    totalCallsTrend: 12,
    avgTalkRatio: 45,
    activeReps: 6,
  };

  return (
    <Stack gap="lg">
      {/* Header */}
      <Group justify="space-between">
        <div>
          <Title order={2} c="white">
            Welcome back, {user?.fullName?.split(' ')[0]}
          </Title>
          <Text c="dimmed" size="sm">
            Here's what's happening with your team
          </Text>
        </div>
        <Select
          size="sm"
          value={period}
          onChange={(value) => setPeriod(value || '30d')}
          data={[
            { value: '7d', label: 'Last 7 days' },
            { value: '30d', label: 'Last 30 days' },
            { value: '90d', label: 'Last 90 days' },
          ]}
          styles={{
            input: {
              backgroundColor: 'var(--mantine-color-dark-7)',
              borderColor: 'var(--mantine-color-dark-5)',
            },
          }}
        />
      </Group>

      {/* Metric Cards */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
        <MetricCard
          title="Avg Score"
          value={metrics.avgScore}
          icon={IconTarget}
          trend={{ value: metrics.avgScoreTrend, label: 'vs last period' }}
        />
        <MetricCard
          title="Total Calls"
          value={metrics.totalCalls}
          subtitle="This period"
          icon={IconPhone}
          trend={{ value: metrics.totalCallsTrend }}
        />
        <MetricCard
          title="Avg Talk Ratio"
          value={`${metrics.avgTalkRatio}%`}
          subtitle="Target: 40-60%"
          icon={IconMessageCircle}
        />
        <MetricCard
          title="Active Reps"
          value={metrics.activeReps}
          subtitle="With calls this period"
          icon={IconUsers}
        />
      </SimpleGrid>

      {/* Charts Row */}
      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
        <ScoreTrendChart data={mockScoreTrend} />
        <TopPerformersList performers={mockTopPerformers} />
      </SimpleGrid>

      {/* Recent Calls */}
      <RecentCallsList calls={mockCalls} />
    </Stack>
  );
}
```

### Acceptance Criteria
- [ ] Greeting shows user name
- [ ] Period selector works
- [ ] Metric cards display
- [ ] Charts render
- [ ] Recent calls show
- [ ] Responsive layout

---

## Task 4.7: Create Mock Data Files

### Description
Create mock data for dashboard development.

### Files to Create
```
client/src/mocks/index.ts
client/src/mocks/calls.ts
client/src/mocks/analytics.ts
```

### Implementation
```typescript
// client/src/mocks/calls.ts
import type { Call } from '@/types';

export const mockCalls: Call[] = [
  {
    _id: '1',
    userId: 'user1',
    title: 'Discovery Call - TechCorp',
    prospect: {
      name: 'Jennifer Martinez',
      company: 'TechCorp Industries',
      role: 'VP of Operations',
    },
    repName: 'Marcus Johnson',
    date: new Date().toISOString(),
    duration: 1680,
    transcript: [],
    summary: 'Strong discovery call focused on operational efficiency...',
    score: 92,
    scoreBreakdown: {
      overall: 92,
      categories: {
        discovery: { score: 95, weight: 0.25, reasoning: 'Excellent questioning' },
        talkBalance: { score: 90, weight: 0.20, reasoning: 'Good balance' },
        objectionHandling: { score: 88, weight: 0.20, reasoning: 'Handled well' },
        nextSteps: { score: 92, weight: 0.15, reasoning: 'Clear commitment' },
        rapport: { score: 94, weight: 0.10, reasoning: 'Great connection' },
        accuracy: { score: 90, weight: 0.10, reasoning: 'Accurate info' },
      },
    },
    metrics: {
      talkRatio: 44,
      questionCount: 14,
      longestMonologue: 95,
      fillerWordCount: 3,
      sentiment: 'positive',
      engagementScore: 88,
    },
    objections: [],
    coachingFeedback: {
      summary: 'Excellent call with strong discovery.',
      strengths: [],
      improvements: [],
      actionItems: [],
    },
    tags: ['Discovery', 'Enterprise'],
    status: 'analyzed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Add more mock calls...
];

// client/src/mocks/analytics.ts
import type { RepPerformance } from '@/types';

export const mockScoreTrend = [
  { date: '2024-12-18', score: 72 },
  { date: '2024-12-19', score: 75 },
  { date: '2024-12-20', score: 78 },
  { date: '2024-12-21', score: 74 },
  { date: '2024-12-22', score: 82 },
  { date: '2024-12-23', score: 79 },
  { date: '2024-12-24', score: 85 },
];

export const mockTopPerformers: RepPerformance[] = [
  {
    user: { _id: '1', fullName: 'Sarah Kim', email: 'sarah@example.com' },
    calls: 24,
    avgScore: 94,
    talkRatio: 42,
    trend: 6,
  },
  {
    user: { _id: '2', fullName: 'Marcus Johnson', email: 'marcus@example.com' },
    calls: 18,
    avgScore: 89,
    talkRatio: 45,
    trend: 3,
  },
  {
    user: { _id: '3', fullName: 'Alex Chen', email: 'alex@example.com' },
    calls: 21,
    avgScore: 85,
    talkRatio: 48,
    trend: 0,
  },
  {
    user: { _id: '4', fullName: 'James Lee', email: 'james@example.com' },
    calls: 15,
    avgScore: 78,
    talkRatio: 55,
    trend: -2,
  },
  {
    user: { _id: '5', fullName: 'Lisa Park', email: 'lisa@example.com' },
    calls: 12,
    avgScore: 72,
    talkRatio: 38,
    trend: 4,
  },
];

// client/src/mocks/index.ts
export * from './calls';
export * from './analytics';
```

### Acceptance Criteria
- [ ] Mock calls data available
- [ ] Mock analytics data available
- [ ] Data matches types
- [ ] Easy to import

---

## Task 4.8: Create Utility Functions

### Description
Build helper functions for formatting and calculations.

### Files to Create
```
client/src/utils/formatters.ts
```

### Implementation
```typescript
// client/src/utils/formatters.ts

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: d.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  });
}

export function formatDateTime(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  if (mins >= 60) {
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hours}h ${remainingMins}m`;
  }

  if (mins === 0) {
    return `${secs}s`;
  }

  return `${mins}m`;
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'green';
  if (score >= 60) return 'yellow';
  if (score >= 40) return 'orange';
  return 'red';
}

export function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Needs Work';
}

export function formatPercentage(value: number, decimals = 0): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}
```

### Acceptance Criteria
- [ ] Date formatting works
- [ ] Duration formatting correct
- [ ] Score colors consistent
- [ ] All helpers exported

---

## Phase 4 Checklist Summary

| Task | Description | Status |
|------|-------------|--------|
| 4.1 | Create dashboard layout with sidebar | [ ] |
| 4.2 | Create metric card component | [ ] |
| 4.3 | Create score trend chart | [ ] |
| 4.4 | Create recent calls list | [ ] |
| 4.5 | Create top performers component | [ ] |
| 4.6 | Create dashboard page | [ ] |
| 4.7 | Create mock data files | [ ] |
| 4.8 | Create utility functions | [ ] |

---

## Dependencies for Next Phase
Before starting Phase 5 (Call Features), ensure:
- Dashboard layout is complete
- Sidebar navigation works
- All dashboard components render
- Mock data is available
- Utility functions work
