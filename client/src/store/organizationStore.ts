import { create } from 'zustand';
import api from '@/services/api';

interface OrganizationMember {
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  role: 'owner' | 'admin' | 'manager' | 'member';
  joinedAt: string;
}

interface PendingInvitation {
  email: string;
  role: 'admin' | 'manager' | 'member';
  token: string;
  expiresAt: string;
  invitedBy: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

interface OrganizationSettings {
  defaultCallVisibility: 'private' | 'team' | 'organization';
  allowMemberInvites: boolean;
  requireApproval: boolean;
}

interface OrganizationSubscription {
  plan: 'starter' | 'professional' | 'enterprise';
  status: 'active' | 'past_due' | 'canceled' | 'trialing';
  trialEndsAt?: string;
  currentPeriodEnd?: string;
  maxMembers: number;
  maxCallsPerMonth: number;
}

export interface Organization {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  owner: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  settings: OrganizationSettings;
  subscription: OrganizationSubscription;
  members: OrganizationMember[];
  pendingInvitations: PendingInvitation[];
  createdAt: string;
  updatedAt: string;
}

interface MemberPerformance {
  userId: string;
  name: string;
  avatar?: string;
  callCount: number;
  avgScore: number;
  totalDuration: number;
}

interface ScoreTrendItem {
  _id: string;
  avgScore: number;
  callCount: number;
}

interface OrganizationStats {
  overview: {
    totalCalls: number;
    avgScore: number;
    totalDuration: number;
  };
  memberPerformance: MemberPerformance[];
  scoreTrend: ScoreTrendItem[];
  categoryStats: Record<string, number>;
  memberCount: number;
}

interface OrganizationState {
  organizations: Organization[];
  currentOrganization: Organization | null;
  stats: OrganizationStats | null;
  isLoading: boolean;
  isLoadingStats: boolean;
  error: string | null;
  dateRange: string;

  // Actions
  fetchMyOrganizations: () => Promise<void>;
  fetchOrganization: (id: string) => Promise<void>;
  createOrganization: (data: { name: string; description?: string }) => Promise<Organization>;
  updateOrganization: (id: string, data: Partial<Organization>) => Promise<void>;
  inviteMember: (orgId: string, email: string, role: string) => Promise<void>;
  removeMember: (orgId: string, userId: string) => Promise<void>;
  updateMemberRole: (orgId: string, userId: string, role: string) => Promise<void>;
  cancelInvitation: (orgId: string, email: string) => Promise<void>;
  acceptInvitation: (token: string) => Promise<void>;
  fetchOrganizationStats: (orgId: string) => Promise<void>;
  setDateRange: (range: string) => void;
  reset: () => void;
}

export const useOrganizationStore = create<OrganizationState>((set, get) => ({
  organizations: [],
  currentOrganization: null,
  stats: null,
  isLoading: false,
  isLoadingStats: false,
  error: null,
  dateRange: 'last30days',

  fetchMyOrganizations: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/organizations/my');
      set({
        organizations: response.data.data,
        isLoading: false,
      });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: { message?: string } } } };
      set({
        error: err.response?.data?.error?.message || 'Failed to fetch organizations',
        isLoading: false,
      });
    }
  },

  fetchOrganization: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/organizations/${id}`);
      set({
        currentOrganization: response.data.data,
        isLoading: false,
      });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: { message?: string } } } };
      set({
        error: err.response?.data?.error?.message || 'Failed to fetch organization',
        isLoading: false,
      });
    }
  },

  createOrganization: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/organizations', data);
      const org = response.data.data;
      set((state) => ({
        organizations: [org, ...state.organizations],
        currentOrganization: org,
        isLoading: false,
      }));
      return org;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: { message?: string } } } };
      set({
        error: err.response?.data?.error?.message || 'Failed to create organization',
        isLoading: false,
      });
      throw error;
    }
  },

  updateOrganization: async (id, data) => {
    try {
      const response = await api.patch(`/organizations/${id}`, data);
      set((state) => ({
        currentOrganization: response.data.data,
        organizations: state.organizations.map((org) =>
          org._id === id ? response.data.data : org
        ),
      }));
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: { message?: string } } } };
      throw new Error(err.response?.data?.error?.message || 'Failed to update organization');
    }
  },

  inviteMember: async (orgId, email, role) => {
    try {
      await api.post(`/organizations/${orgId}/invite`, { email, role });
      // Refresh organization to get updated invitations
      await get().fetchOrganization(orgId);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: { message?: string } } } };
      throw new Error(err.response?.data?.error?.message || 'Failed to send invitation');
    }
  },

  removeMember: async (orgId, userId) => {
    try {
      await api.delete(`/organizations/${orgId}/members/${userId}`);
      // Refresh organization to get updated members
      await get().fetchOrganization(orgId);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: { message?: string } } } };
      throw new Error(err.response?.data?.error?.message || 'Failed to remove member');
    }
  },

  updateMemberRole: async (orgId, userId, role) => {
    try {
      await api.patch(`/organizations/${orgId}/members/${userId}`, { role });
      // Refresh organization to get updated members
      await get().fetchOrganization(orgId);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: { message?: string } } } };
      throw new Error(err.response?.data?.error?.message || 'Failed to update role');
    }
  },

  cancelInvitation: async (orgId, email) => {
    try {
      await api.delete(`/organizations/${orgId}/invitations/${encodeURIComponent(email)}`);
      // Refresh organization to get updated invitations
      await get().fetchOrganization(orgId);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: { message?: string } } } };
      throw new Error(err.response?.data?.error?.message || 'Failed to cancel invitation');
    }
  },

  acceptInvitation: async (token) => {
    try {
      const response = await api.post('/organizations/accept-invitation', { token });
      set((state) => ({
        organizations: [response.data.data, ...state.organizations],
        currentOrganization: response.data.data,
      }));
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: { message?: string } } } };
      throw new Error(err.response?.data?.error?.message || 'Failed to accept invitation');
    }
  },

  fetchOrganizationStats: async (orgId: string) => {
    set({ isLoadingStats: true, error: null });
    try {
      const response = await api.get(`/organizations/${orgId}/stats`);
      set({
        stats: response.data.data,
        isLoadingStats: false,
      });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: { message?: string } } } };
      set({
        error: err.response?.data?.error?.message || 'Failed to fetch stats',
        isLoadingStats: false,
      });
    }
  },

  setDateRange: (range) => {
    set({ dateRange: range });
  },

  reset: () => {
    set({
      organizations: [],
      currentOrganization: null,
      stats: null,
      isLoading: false,
      isLoadingStats: false,
      error: null,
      dateRange: 'last30days',
    });
  },
}));
