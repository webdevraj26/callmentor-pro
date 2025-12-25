import { Outlet } from 'react-router-dom';
import { AppShell, Box } from '@mantine/core';
import Sidebar from './Sidebar';
import { useUIStore } from '@/store/uiStore';

export default function DashboardLayout() {
  const { sidebarCollapsed } = useUIStore();

  return (
    <AppShell
      navbar={{
        width: sidebarCollapsed ? 80 : 280,
        breakpoint: 'sm',
      }}
      padding="md"
    >
      <AppShell.Navbar>
        <Sidebar />
      </AppShell.Navbar>

      <AppShell.Main>
        <Box mih="100vh">
          <Outlet />
        </Box>
      </AppShell.Main>
    </AppShell>
  );
}
