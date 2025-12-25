import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Title,
  Text,
  Stack,
  Paper,
  TextInput,
  Textarea,
  Button,
  Group,
  Switch,
  Tabs,
  Table,
  Avatar,
  Badge,
  ActionIcon,
  Menu,
  Modal,
  Select,
  Loader,
  Center,
  CopyButton,
  Tooltip,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconSettings,
  IconUsers,
  IconMail,
  IconDotsVertical,
  IconTrash,
  IconPlus,
  IconBuilding,
  IconCopy,
  IconCheck,
} from '@tabler/icons-react';
import { useAuthStore } from '@/store/authStore';
import { useOrganizationStore } from '@/store/organizationStore';

interface InviteMemberModalProps {
  opened: boolean;
  onClose: () => void;
  organizationId: string;
}

function InviteMemberModal({ opened, onClose, organizationId }: InviteMemberModalProps) {
  const [loading, setLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const { inviteMember } = useOrganizationStore();

  const form = useForm({
    initialValues: {
      email: '',
      role: 'member',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    try {
      const result = await inviteMember(organizationId, values.email, values.role);
      setInviteLink(result.inviteLink);
      notifications.show({
        title: 'Invitation Created',
        message: 'Share the link with your team member',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to create invitation',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setInviteLink(null);
    form.reset();
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={<Text fw={600}>{inviteLink ? 'Share Invite Link' : 'Invite Team Member'}</Text>}
      styles={{
        header: { backgroundColor: 'var(--mantine-color-dark-7)' },
        body: { backgroundColor: 'var(--mantine-color-dark-7)' },
      }}
    >
      {inviteLink ? (
        <Stack>
          <Text size="sm" c="dimmed">
            Share this link with your team member. They can use it to join your team.
          </Text>
          <Paper
            p="sm"
            radius="md"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--mantine-color-dark-4)',
            }}
          >
            <Group justify="space-between" wrap="nowrap">
              <Text size="sm" c="white" style={{ wordBreak: 'break-all' }}>
                {inviteLink}
              </Text>
              <CopyButton value={inviteLink}>
                {({ copied, copy }) => (
                  <Tooltip label={copied ? 'Copied!' : 'Copy link'}>
                    <ActionIcon color={copied ? 'green' : 'violet'} onClick={copy}>
                      {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                    </ActionIcon>
                  </Tooltip>
                )}
              </CopyButton>
            </Group>
          </Paper>
          <Text size="xs" c="dimmed">
            This link expires in 7 days.
          </Text>
          <Group justify="flex-end" mt="md">
            <Button onClick={handleClose}>
              Done
            </Button>
          </Group>
        </Stack>
      ) : (
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              label="Email Address"
              placeholder="colleague@company.com"
              required
              {...form.getInputProps('email')}
              styles={{
                label: { color: 'var(--mantine-color-gray-4)' },
                input: {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--mantine-color-dark-4)',
                },
              }}
            />
            <Select
              label="Role"
              data={[
                { value: 'member', label: 'Member' },
                { value: 'manager', label: 'Manager' },
                { value: 'admin', label: 'Admin' },
              ]}
              {...form.getInputProps('role')}
              styles={{
                label: { color: 'var(--mantine-color-gray-4)' },
                input: {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--mantine-color-dark-4)',
                },
              }}
            />
            <Group justify="flex-end" mt="md">
              <Button variant="subtle" color="gray" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" loading={loading}>
                Create Invitation
              </Button>
            </Group>
          </Stack>
        </form>
      )}
    </Modal>
  );
}

interface CreateOrgModalProps {
  opened: boolean;
  onClose: () => void;
}

function CreateOrganizationModal({ opened, onClose }: CreateOrgModalProps) {
  const [loading, setLoading] = useState(false);
  const { createOrganization } = useOrganizationStore();
  const { refreshUser } = useAuthStore();

  const form = useForm({
    initialValues: {
      name: '',
      description: '',
    },
    validate: {
      name: (value) => (value.length < 2 ? 'Name must be at least 2 characters' : null),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    try {
      await createOrganization(values);
      notifications.show({
        title: 'Team Created',
        message: 'Your team has been created successfully',
        color: 'green',
      });
      form.reset();
      onClose();
      // Refresh user data to get the new organization
      await refreshUser();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to create team',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Text fw={600}>Create Team</Text>}
      styles={{
        header: { backgroundColor: 'var(--mantine-color-dark-7)' },
        body: { backgroundColor: 'var(--mantine-color-dark-7)' },
      }}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <TextInput
            label="Team Name"
            placeholder="Acme Sales Team"
            required
            {...form.getInputProps('name')}
            styles={{
              label: { color: 'var(--mantine-color-gray-4)' },
              input: {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--mantine-color-dark-4)',
              },
            }}
          />
          <Textarea
            label="Description (Optional)"
            placeholder="Brief description of your team"
            {...form.getInputProps('description')}
            styles={{
              label: { color: 'var(--mantine-color-gray-4)' },
              input: {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--mantine-color-dark-4)',
              },
            }}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" color="gray" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Create Team
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

function getRoleBadgeColor(role: string): string {
  switch (role) {
    case 'owner':
      return 'violet';
    case 'admin':
      return 'blue';
    case 'manager':
      return 'green';
    default:
      return 'gray';
  }
}

export default function OrganizationSettingsPage() {
  const { user } = useAuthStore();
  const {
    currentOrganization,
    isLoading,
    fetchOrganization,
    updateOrganization,
    removeMember,
    updateMemberRole,
    cancelInvitation,
  } = useOrganizationStore();
  const [inviteOpened, { open: openInvite, close: closeInvite }] = useDisclosure(false);
  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);
  const [saving, setSaving] = useState(false);

  const form = useForm({
    initialValues: {
      name: '',
      description: '',
      allowMemberInvites: false,
      defaultCallVisibility: 'team',
    },
  });

  useEffect(() => {
    if (user?.organization) {
      fetchOrganization(user.organization as string);
    }
  }, [user?.organization, fetchOrganization]);

  useEffect(() => {
    if (currentOrganization) {
      form.setValues({
        name: currentOrganization.name,
        description: currentOrganization.description || '',
        allowMemberInvites: currentOrganization.settings?.allowMemberInvites || false,
        defaultCallVisibility: currentOrganization.settings?.defaultCallVisibility || 'team',
      });
    }
  }, [currentOrganization]);

  const handleSaveSettings = async (values: typeof form.values) => {
    if (!currentOrganization) return;

    setSaving(true);
    try {
      await updateOrganization(currentOrganization._id, {
        name: values.name,
        description: values.description,
        settings: {
          allowMemberInvites: values.allowMemberInvites,
          defaultCallVisibility: values.defaultCallVisibility as 'private' | 'team' | 'organization',
          requireApproval: currentOrganization.settings.requireApproval,
        },
      });
      notifications.show({
        title: 'Saved',
        message: 'Team settings updated',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to save settings',
        color: 'red',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!currentOrganization) return;

    try {
      await removeMember(currentOrganization._id, userId);
      notifications.show({
        title: 'Member Removed',
        message: 'Team member has been removed',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to remove member',
        color: 'red',
      });
    }
  };

  const handleUpdateRole = async (userId: string, role: string) => {
    if (!currentOrganization) return;

    try {
      await updateMemberRole(currentOrganization._id, userId, role);
      notifications.show({
        title: 'Role Updated',
        message: 'Member role has been updated',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to update role',
        color: 'red',
      });
    }
  };

  const handleCancelInvitation = async (email: string) => {
    if (!currentOrganization) return;

    try {
      await cancelInvitation(currentOrganization._id, email);
      notifications.show({
        title: 'Invitation Cancelled',
        message: 'The invitation has been cancelled',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to cancel invitation',
        color: 'red',
      });
    }
  };

  if (isLoading) {
    return (
      <Box
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(180deg, var(--mantine-color-dark-8) 0%, var(--mantine-color-dark-9) 100%)',
        }}
      >
        <Center h={400}>
          <Loader size="lg" color="violet" />
        </Center>
      </Box>
    );
  }

  if (!user?.organization) {
    return (
      <Box
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(180deg, var(--mantine-color-dark-8) 0%, var(--mantine-color-dark-9) 100%)',
        }}
      >
        <Container size="md" py="xl">
          <Paper
            p="xl"
            radius="lg"
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--mantine-color-dark-4)',
              textAlign: 'center',
            }}
          >
            <Stack align="center" gap="md">
              <IconBuilding size={48} color="var(--mantine-color-gray-6)" />
              <Box>
                <Text size="lg" fw={600} c="white">No Team</Text>
                <Text size="sm" c="dimmed" mt={4}>
                  Create a team to collaborate with colleagues and view team analytics.
                </Text>
              </Box>
              <Button
                leftSection={<IconPlus size={18} />}
                variant="gradient"
                gradient={{ from: '#8b5cf6', to: '#6d28d9' }}
                onClick={openCreate}
              >
                Create Team
              </Button>
            </Stack>
          </Paper>

          <CreateOrganizationModal opened={createOpened} onClose={closeCreate} />
        </Container>
      </Box>
    );
  }

  const organization = currentOrganization;
  const userMember = organization?.members.find(
    (m) => m.user._id === user._id
  );
  const userRole = userMember?.role;
  const canManage = userRole && ['owner', 'admin'].includes(userRole);

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
              Team Settings
            </Title>
            <Text c="dimmed" mt={4}>
              Manage your team members and preferences
            </Text>
          </Box>

          <Tabs defaultValue="general" color="violet">
            <Tabs.List>
              <Tabs.Tab value="general" leftSection={<IconSettings size={16} />}>
                General
              </Tabs.Tab>
              <Tabs.Tab value="members" leftSection={<IconUsers size={16} />}>
                Members ({organization?.members.length || 0})
              </Tabs.Tab>
              <Tabs.Tab value="invitations" leftSection={<IconMail size={16} />}>
                Invitations ({organization?.pendingInvitations?.length || 0})
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="general" pt="xl">
              <Paper
                p="xl"
                radius="lg"
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--mantine-color-dark-4)',
                }}
              >
                <form onSubmit={form.onSubmit(handleSaveSettings)}>
                  <Stack>
                    <TextInput
                      label="Team Name"
                      placeholder="Acme Sales Team"
                      disabled={!canManage}
                      {...form.getInputProps('name')}
                      styles={{
                        label: { color: 'var(--mantine-color-gray-4)' },
                        input: {
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid var(--mantine-color-dark-4)',
                        },
                      }}
                    />
                    <Textarea
                      label="Description"
                      placeholder="Brief description of your team"
                      disabled={!canManage}
                      {...form.getInputProps('description')}
                      styles={{
                        label: { color: 'var(--mantine-color-gray-4)' },
                        input: {
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid var(--mantine-color-dark-4)',
                        },
                      }}
                    />
                    <Select
                      label="Default Call Visibility"
                      description="Who can see newly uploaded calls by default"
                      disabled={!canManage}
                      data={[
                        { value: 'private', label: 'Private - Only uploader' },
                        { value: 'team', label: 'Team - All team members' },
                        { value: 'organization', label: 'Everyone - All members' },
                      ]}
                      {...form.getInputProps('defaultCallVisibility')}
                      styles={{
                        label: { color: 'var(--mantine-color-gray-4)' },
                        description: { color: 'var(--mantine-color-gray-6)' },
                        input: {
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid var(--mantine-color-dark-4)',
                        },
                      }}
                    />
                    <Switch
                      label="Allow members to invite others"
                      description="Let any team member send invitations"
                      disabled={!canManage}
                      {...form.getInputProps('allowMemberInvites', { type: 'checkbox' })}
                    />
                    {canManage && (
                      <Group justify="flex-end" mt="md">
                        <Button type="submit" loading={saving}>
                          Save Changes
                        </Button>
                      </Group>
                    )}
                  </Stack>
                </form>
              </Paper>
            </Tabs.Panel>

            <Tabs.Panel value="members" pt="xl">
              <Paper
                p="xl"
                radius="lg"
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--mantine-color-dark-4)',
                }}
              >
                <Group justify="space-between" mb="lg">
                  <Text fw={600} c="white">Team Members</Text>
                  {canManage && (
                    <Button size="xs" onClick={openInvite} leftSection={<IconPlus size={14} />}>
                      Invite Member
                    </Button>
                  )}
                </Group>
                <Table verticalSpacing="sm">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Member</Table.Th>
                      <Table.Th>Role</Table.Th>
                      <Table.Th>Joined</Table.Th>
                      {canManage && <Table.Th w={50}></Table.Th>}
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {organization?.members.map((member) => (
                      <Table.Tr key={member.user._id}>
                        <Table.Td>
                          <Group gap="sm">
                            <Avatar
                              src={member.user.avatar}
                              radius="xl"
                              size="sm"
                              color="violet"
                            >
                              {member.user.firstName?.charAt(0)}
                            </Avatar>
                            <Box>
                              <Text size="sm" fw={500} c="white">
                                {member.user.firstName} {member.user.lastName}
                              </Text>
                              <Text size="xs" c="dimmed">
                                {member.user.email}
                              </Text>
                            </Box>
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <Badge color={getRoleBadgeColor(member.role)} variant="light">
                            {member.role}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" c="dimmed">
                            {new Date(member.joinedAt).toLocaleDateString()}
                          </Text>
                        </Table.Td>
                        {canManage && (
                          <Table.Td>
                            {member.role !== 'owner' && member.user._id !== user._id && (
                              <Menu position="bottom-end" withinPortal>
                                <Menu.Target>
                                  <ActionIcon variant="subtle" color="gray">
                                    <IconDotsVertical size={16} />
                                  </ActionIcon>
                                </Menu.Target>
                                <Menu.Dropdown>
                                  <Menu.Label>Change Role</Menu.Label>
                                  <Menu.Item
                                    onClick={() => handleUpdateRole(member.user._id, 'admin')}
                                    disabled={member.role === 'admin'}
                                  >
                                    Make Admin
                                  </Menu.Item>
                                  <Menu.Item
                                    onClick={() => handleUpdateRole(member.user._id, 'manager')}
                                    disabled={member.role === 'manager'}
                                  >
                                    Make Manager
                                  </Menu.Item>
                                  <Menu.Item
                                    onClick={() => handleUpdateRole(member.user._id, 'member')}
                                    disabled={member.role === 'member'}
                                  >
                                    Make Member
                                  </Menu.Item>
                                  <Menu.Divider />
                                  <Menu.Item
                                    color="red"
                                    leftSection={<IconTrash size={14} />}
                                    onClick={() => handleRemoveMember(member.user._id)}
                                  >
                                    Remove from Team
                                  </Menu.Item>
                                </Menu.Dropdown>
                              </Menu>
                            )}
                          </Table.Td>
                        )}
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Paper>
            </Tabs.Panel>

            <Tabs.Panel value="invitations" pt="xl">
              <Paper
                p="xl"
                radius="lg"
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--mantine-color-dark-4)',
                }}
              >
                <Group justify="space-between" mb="lg">
                  <Text fw={600} c="white">Pending Invitations</Text>
                  {canManage && (
                    <Button size="xs" onClick={openInvite} leftSection={<IconPlus size={14} />}>
                      Send Invitation
                    </Button>
                  )}
                </Group>
                {organization?.pendingInvitations && organization.pendingInvitations.length > 0 ? (
                  <Table verticalSpacing="sm">
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Email</Table.Th>
                        <Table.Th>Role</Table.Th>
                        <Table.Th>Invited By</Table.Th>
                        <Table.Th>Expires</Table.Th>
                        <Table.Th>Link</Table.Th>
                        {canManage && <Table.Th w={50}></Table.Th>}
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {organization.pendingInvitations.map((invite) => (
                        <Table.Tr key={invite.email}>
                          <Table.Td>
                            <Text size="sm" c="white">{invite.email}</Text>
                          </Table.Td>
                          <Table.Td>
                            <Badge color={getRoleBadgeColor(invite.role)} variant="light">
                              {invite.role}
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm" c="dimmed">
                              {invite.invitedBy?.firstName} {invite.invitedBy?.lastName}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm" c="dimmed">
                              {new Date(invite.expiresAt).toLocaleDateString()}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <CopyButton value={`${window.location.origin}/invite/${invite.token}`}>
                              {({ copied, copy }) => (
                                <Tooltip label={copied ? 'Copied!' : 'Copy invite link'}>
                                  <ActionIcon
                                    variant="subtle"
                                    color={copied ? 'green' : 'violet'}
                                    onClick={copy}
                                  >
                                    {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                                  </ActionIcon>
                                </Tooltip>
                              )}
                            </CopyButton>
                          </Table.Td>
                          {canManage && (
                            <Table.Td>
                              <ActionIcon
                                variant="subtle"
                                color="red"
                                onClick={() => handleCancelInvitation(invite.email)}
                              >
                                <IconTrash size={16} />
                              </ActionIcon>
                            </Table.Td>
                          )}
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                ) : (
                  <Text c="dimmed" ta="center" py="xl">
                    No pending invitations
                  </Text>
                )}
              </Paper>
            </Tabs.Panel>
          </Tabs>
        </Stack>

        {organization && (
          <InviteMemberModal
            opened={inviteOpened}
            onClose={closeInvite}
            organizationId={organization._id}
          />
        )}
      </Container>
    </Box>
  );
}
