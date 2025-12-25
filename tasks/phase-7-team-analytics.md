# Phase 7: Team Analytics & Organization Management

## Overview
Implement comprehensive team analytics, organization management, and performance tracking features with Chart.js visualizations.

---

## Task 7.1: Organization Model & API

### 7.1.1 Create Organization Model
**File: `server/src/models/Organization.js`**

```javascript
import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  role: {
    type: String,
    enum: ['owner', 'admin', 'manager', 'member'],
    default: 'member',
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
});

const invitationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'member'],
    default: 'member',
  },
  token: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      maxlength: 500,
    },
    logo: {
      type: String,
    },
    settings: {
      defaultCallVisibility: {
        type: String,
        enum: ['private', 'team', 'organization'],
        default: 'team',
      },
      allowMemberInvites: {
        type: Boolean,
        default: false,
      },
      requireApproval: {
        type: Boolean,
        default: true,
      },
    },
    subscription: {
      plan: {
        type: String,
        enum: ['starter', 'professional', 'enterprise'],
        default: 'starter',
      },
      status: {
        type: String,
        enum: ['active', 'past_due', 'canceled', 'trialing'],
        default: 'trialing',
      },
      trialEndsAt: Date,
      currentPeriodEnd: Date,
      maxMembers: {
        type: Number,
        default: 5,
      },
      maxCallsPerMonth: {
        type: Number,
        default: 100,
      },
    },
    members: [memberSchema],
    pendingInvitations: [invitationSchema],
  },
  {
    timestamps: true,
  }
);

// Generate slug from name
organizationSchema.pre('save', function (next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Instance methods
organizationSchema.methods.isMember = function (userId) {
  return this.members.some(
    (member) => member.user.toString() === userId.toString()
  );
};

organizationSchema.methods.getMemberRole = function (userId) {
  const member = this.members.find(
    (m) => m.user.toString() === userId.toString()
  );
  return member ? member.role : null;
};

organizationSchema.methods.canManageMembers = function (userId) {
  const role = this.getMemberRole(userId);
  return ['owner', 'admin'].includes(role);
};

// Indexes
organizationSchema.index({ 'members.user': 1 });
organizationSchema.index({ slug: 1 });

const Organization = mongoose.model('Organization', organizationSchema);
export default Organization;
```

### 7.1.2 Create Organization Routes
**File: `server/src/routes/organizations.js`**

```javascript
import express from 'express';
import { body, param, query } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createOrganization,
  getMyOrganizations,
  getOrganization,
  updateOrganization,
  inviteMember,
  acceptInvitation,
  removeMember,
  updateMemberRole,
  getOrganizationStats,
} from '../controllers/organizationController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Create organization
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Organization name is required'),
    body('description').optional().trim().isLength({ max: 500 }),
  ],
  validate,
  createOrganization
);

// Get user's organizations
router.get('/my', getMyOrganizations);

// Get organization by ID
router.get('/:id', getOrganization);

// Update organization
router.patch(
  '/:id',
  [
    body('name').optional().trim().notEmpty(),
    body('description').optional().trim().isLength({ max: 500 }),
    body('settings').optional().isObject(),
  ],
  validate,
  updateOrganization
);

// Invite member
router.post(
  '/:id/invite',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('role')
      .isIn(['admin', 'manager', 'member'])
      .withMessage('Invalid role'),
  ],
  validate,
  inviteMember
);

// Accept invitation
router.post(
  '/accept-invitation',
  [body('token').notEmpty().withMessage('Invitation token is required')],
  validate,
  acceptInvitation
);

// Remove member
router.delete('/:id/members/:userId', removeMember);

// Update member role
router.patch(
  '/:id/members/:userId',
  [
    body('role')
      .isIn(['admin', 'manager', 'member'])
      .withMessage('Invalid role'),
  ],
  validate,
  updateMemberRole
);

// Get organization stats
router.get('/:id/stats', getOrganizationStats);

export default router;
```

### 7.1.3 Create Organization Controller
**File: `server/src/controllers/organizationController.js`**

```javascript
import crypto from 'crypto';
import Organization from '../models/Organization.js';
import User from '../models/User.js';
import Call from '../models/Call.js';

export const createOrganization = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Check if user already owns an organization
    const existingOrg = await Organization.findOne({
      'members.user': req.user._id,
      'members.role': 'owner',
    });

    if (existingOrg) {
      return res.status(400).json({
        success: false,
        message: 'You already own an organization',
      });
    }

    const organization = new Organization({
      name,
      description,
      members: [
        {
          user: req.user._id,
          role: 'owner',
          joinedAt: new Date(),
        },
      ],
    });

    await organization.save();

    // Update user's organization reference
    await User.findByIdAndUpdate(req.user._id, {
      organization: organization._id,
    });

    res.status(201).json({
      success: true,
      data: organization,
    });
  } catch (error) {
    console.error('Create organization error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create organization',
    });
  }
};

export const getMyOrganizations = async (req, res) => {
  try {
    const organizations = await Organization.find({
      'members.user': req.user._id,
    })
      .populate('members.user', 'firstName lastName email avatar')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: organizations,
    });
  } catch (error) {
    console.error('Get organizations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch organizations',
    });
  }
};

export const getOrganization = async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id)
      .populate('members.user', 'firstName lastName email avatar')
      .populate('pendingInvitations.invitedBy', 'firstName lastName');

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found',
      });
    }

    if (!organization.isMember(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    res.json({
      success: true,
      data: organization,
    });
  } catch (error) {
    console.error('Get organization error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch organization',
    });
  }
};

export const updateOrganization = async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found',
      });
    }

    if (!organization.canManageMembers(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Only admins can update organization settings',
      });
    }

    const { name, description, settings } = req.body;

    if (name) organization.name = name;
    if (description !== undefined) organization.description = description;
    if (settings) organization.settings = { ...organization.settings, ...settings };

    await organization.save();

    res.json({
      success: true,
      data: organization,
    });
  } catch (error) {
    console.error('Update organization error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update organization',
    });
  }
};

export const inviteMember = async (req, res) => {
  try {
    const { email, role } = req.body;
    const organization = await Organization.findById(req.params.id);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found',
      });
    }

    if (!organization.canManageMembers(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied',
      });
    }

    // Check member limit
    if (organization.members.length >= organization.subscription.maxMembers) {
      return res.status(400).json({
        success: false,
        message: 'Member limit reached. Please upgrade your plan.',
      });
    }

    // Check if already a member
    const existingUser = await User.findOne({ email });
    if (existingUser && organization.isMember(existingUser._id)) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member',
      });
    }

    // Check for existing invitation
    const existingInvite = organization.pendingInvitations.find(
      (inv) => inv.email === email.toLowerCase()
    );
    if (existingInvite) {
      return res.status(400).json({
        success: false,
        message: 'Invitation already sent to this email',
      });
    }

    // Generate invitation token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    organization.pendingInvitations.push({
      email: email.toLowerCase(),
      role,
      token,
      expiresAt,
      invitedBy: req.user._id,
    });

    await organization.save();

    // TODO: Send invitation email
    // await sendInvitationEmail(email, token, organization.name, req.user);

    res.json({
      success: true,
      message: 'Invitation sent successfully',
      data: { token }, // In production, don't return token, send via email
    });
  } catch (error) {
    console.error('Invite member error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send invitation',
    });
  }
};

export const acceptInvitation = async (req, res) => {
  try {
    const { token } = req.body;

    const organization = await Organization.findOne({
      'pendingInvitations.token': token,
    });

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired invitation',
      });
    }

    const invitation = organization.pendingInvitations.find(
      (inv) => inv.token === token
    );

    if (invitation.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Invitation has expired',
      });
    }

    // Check if user email matches invitation
    if (req.user.email.toLowerCase() !== invitation.email) {
      return res.status(403).json({
        success: false,
        message: 'This invitation was sent to a different email',
      });
    }

    // Add user as member
    organization.members.push({
      user: req.user._id,
      role: invitation.role,
      invitedBy: invitation.invitedBy,
    });

    // Remove invitation
    organization.pendingInvitations = organization.pendingInvitations.filter(
      (inv) => inv.token !== token
    );

    await organization.save();

    // Update user's organization
    await User.findByIdAndUpdate(req.user._id, {
      organization: organization._id,
    });

    res.json({
      success: true,
      message: 'Successfully joined organization',
      data: organization,
    });
  } catch (error) {
    console.error('Accept invitation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to accept invitation',
    });
  }
};

export const removeMember = async (req, res) => {
  try {
    const { id, userId } = req.params;
    const organization = await Organization.findById(id);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found',
      });
    }

    // Check permissions
    const requesterRole = organization.getMemberRole(req.user._id);
    const targetRole = organization.getMemberRole(userId);

    if (!['owner', 'admin'].includes(requesterRole)) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied',
      });
    }

    if (targetRole === 'owner') {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove the organization owner',
      });
    }

    // Remove member
    organization.members = organization.members.filter(
      (m) => m.user.toString() !== userId
    );

    await organization.save();

    // Remove organization from user
    await User.findByIdAndUpdate(userId, { $unset: { organization: 1 } });

    res.json({
      success: true,
      message: 'Member removed successfully',
    });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove member',
    });
  }
};

export const updateMemberRole = async (req, res) => {
  try {
    const { id, userId } = req.params;
    const { role } = req.body;

    const organization = await Organization.findById(id);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found',
      });
    }

    if (organization.getMemberRole(req.user._id) !== 'owner') {
      return res.status(403).json({
        success: false,
        message: 'Only the owner can change member roles',
      });
    }

    const memberIndex = organization.members.findIndex(
      (m) => m.user.toString() === userId
    );

    if (memberIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Member not found',
      });
    }

    if (organization.members[memberIndex].role === 'owner') {
      return res.status(400).json({
        success: false,
        message: 'Cannot change owner role',
      });
    }

    organization.members[memberIndex].role = role;
    await organization.save();

    res.json({
      success: true,
      message: 'Member role updated',
    });
  } catch (error) {
    console.error('Update member role error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update member role',
    });
  }
};

export const getOrganizationStats = async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found',
      });
    }

    if (!organization.isMember(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const memberIds = organization.members.map((m) => m.user);

    // Get aggregate stats
    const [callStats, performanceByMember] = await Promise.all([
      // Overall call stats
      Call.aggregate([
        { $match: { user: { $in: memberIds } } },
        {
          $group: {
            _id: null,
            totalCalls: { $sum: 1 },
            avgScore: { $avg: '$analysis.overallScore' },
            totalDuration: { $sum: '$duration' },
            analyzedCalls: {
              $sum: { $cond: [{ $eq: ['$status', 'analyzed'] }, 1, 0] },
            },
          },
        },
      ]),
      // Performance by team member
      Call.aggregate([
        { $match: { user: { $in: memberIds }, status: 'analyzed' } },
        {
          $group: {
            _id: '$user',
            callCount: { $sum: 1 },
            avgScore: { $avg: '$analysis.overallScore' },
            totalDuration: { $sum: '$duration' },
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'userInfo',
          },
        },
        { $unwind: '$userInfo' },
        {
          $project: {
            userId: '$_id',
            name: {
              $concat: ['$userInfo.firstName', ' ', '$userInfo.lastName'],
            },
            avatar: '$userInfo.avatar',
            callCount: 1,
            avgScore: { $round: ['$avgScore', 1] },
            totalDuration: 1,
          },
        },
        { $sort: { avgScore: -1 } },
      ]),
    ]);

    // Get score trend over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const scoreTrend = await Call.aggregate([
      {
        $match: {
          user: { $in: memberIds },
          status: 'analyzed',
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          avgScore: { $avg: '$analysis.overallScore' },
          callCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      data: {
        overview: callStats[0] || {
          totalCalls: 0,
          avgScore: 0,
          totalDuration: 0,
          analyzedCalls: 0,
        },
        memberPerformance: performanceByMember,
        scoreTrend,
        memberCount: organization.members.length,
      },
    });
  } catch (error) {
    console.error('Get organization stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch organization stats',
    });
  }
};
```

---

## Task 7.2: Team Analytics Store

### 7.2.1 Create Analytics Store
**File: `client/src/stores/analyticsStore.js`**

```javascript
import { create } from 'zustand';
import api from '../services/api';

const useAnalyticsStore = create((set, get) => ({
  // State
  organizationStats: null,
  memberPerformance: [],
  scoreTrend: [],
  isLoading: false,
  error: null,
  dateRange: 'last30days',

  // Actions
  fetchOrganizationStats: async (organizationId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/organizations/${organizationId}/stats`);
      const { overview, memberPerformance, scoreTrend, memberCount } = response.data.data;

      set({
        organizationStats: { ...overview, memberCount },
        memberPerformance,
        scoreTrend,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch analytics',
        isLoading: false,
      });
    }
  },

  setDateRange: (range) => {
    set({ dateRange: range });
  },

  // Computed getters
  getTopPerformers: () => {
    const { memberPerformance } = get();
    return memberPerformance.slice(0, 5);
  },

  getTeamAverage: () => {
    const { memberPerformance } = get();
    if (memberPerformance.length === 0) return 0;
    const total = memberPerformance.reduce((sum, m) => sum + m.avgScore, 0);
    return Math.round((total / memberPerformance.length) * 10) / 10;
  },

  reset: () => {
    set({
      organizationStats: null,
      memberPerformance: [],
      scoreTrend: [],
      isLoading: false,
      error: null,
    });
  },
}));

export default useAnalyticsStore;
```

---

## Task 7.3: Team Analytics Components

### 7.3.1 Create Team Overview Card
**File: `client/src/components/analytics/TeamOverviewCard.jsx`**

```jsx
import { Paper, Group, Text, Stack, ThemeIcon, SimpleGrid } from '@mantine/core';
import {
  IconPhone,
  IconChartBar,
  IconClock,
  IconUsers,
} from '@tabler/icons-react';

function StatItem({ icon: Icon, label, value, color }) {
  return (
    <Group>
      <ThemeIcon size="lg" radius="md" variant="light" color={color}>
        <Icon size={20} />
      </ThemeIcon>
      <Stack gap={0}>
        <Text size="xs" c="dimmed" tt="uppercase" fw={500}>
          {label}
        </Text>
        <Text size="xl" fw={700}>
          {value}
        </Text>
      </Stack>
    </Group>
  );
}

function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export default function TeamOverviewCard({ stats }) {
  return (
    <Paper p="xl" radius="md" withBorder>
      <Text size="lg" fw={600} mb="lg">
        Team Overview
      </Text>
      <SimpleGrid cols={{ base: 2, md: 4 }}>
        <StatItem
          icon={IconUsers}
          label="Team Members"
          value={stats?.memberCount || 0}
          color="violet"
        />
        <StatItem
          icon={IconPhone}
          label="Total Calls"
          value={stats?.totalCalls || 0}
          color="blue"
        />
        <StatItem
          icon={IconChartBar}
          label="Avg Score"
          value={stats?.avgScore ? `${Math.round(stats.avgScore)}%` : '--'}
          color="green"
        />
        <StatItem
          icon={IconClock}
          label="Total Duration"
          value={formatDuration(stats?.totalDuration || 0)}
          color="orange"
        />
      </SimpleGrid>
    </Paper>
  );
}
```

### 7.3.2 Create Team Performance Chart
**File: `client/src/components/analytics/TeamPerformanceChart.jsx`**

```jsx
import { useMemo } from 'react';
import { Paper, Text, Group, Select } from '@mantine/core';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function TeamPerformanceChart({ scoreTrend, dateRange, onDateRangeChange }) {
  const chartData = useMemo(() => {
    const labels = scoreTrend.map((item) => {
      const date = new Date(item._id);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    const scores = scoreTrend.map((item) => item.avgScore);

    return {
      labels,
      datasets: [
        {
          label: 'Average Score',
          data: scores,
          borderColor: '#7c3aed',
          backgroundColor: 'rgba(124, 58, 237, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#7c3aed',
        },
      ],
    };
  }, [scoreTrend]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1a1b1e',
        titleColor: '#fff',
        bodyColor: '#a1a1aa',
        borderColor: '#3f3f46',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (context) => `Score: ${Math.round(context.raw)}%`,
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
          color: 'rgba(113, 113, 122, 0.2)',
        },
        ticks: {
          color: '#71717a',
          callback: (value) => `${value}%`,
        },
      },
    },
  };

  return (
    <Paper p="xl" radius="md" withBorder>
      <Group justify="space-between" mb="lg">
        <Text size="lg" fw={600}>
          Performance Trend
        </Text>
        <Select
          size="xs"
          value={dateRange}
          onChange={onDateRangeChange}
          data={[
            { value: 'last7days', label: 'Last 7 days' },
            { value: 'last30days', label: 'Last 30 days' },
            { value: 'last90days', label: 'Last 90 days' },
          ]}
          w={140}
        />
      </Group>
      <div style={{ height: 300 }}>
        {scoreTrend.length > 0 ? (
          <Line data={chartData} options={options} />
        ) : (
          <Group justify="center" align="center" h="100%">
            <Text c="dimmed">No data available for this period</Text>
          </Group>
        )}
      </div>
    </Paper>
  );
}
```

### 7.3.3 Create Member Leaderboard Component
**File: `client/src/components/analytics/MemberLeaderboard.jsx`**

```jsx
import {
  Paper,
  Text,
  Group,
  Avatar,
  Stack,
  Progress,
  Badge,
  Table,
  ScrollArea,
} from '@mantine/core';
import { IconTrophy, IconMedal } from '@tabler/icons-react';

function getRankBadge(rank) {
  if (rank === 1) {
    return (
      <Badge
        leftSection={<IconTrophy size={12} />}
        color="yellow"
        variant="light"
      >
        1st
      </Badge>
    );
  }
  if (rank === 2) {
    return (
      <Badge
        leftSection={<IconMedal size={12} />}
        color="gray.4"
        variant="light"
      >
        2nd
      </Badge>
    );
  }
  if (rank === 3) {
    return (
      <Badge
        leftSection={<IconMedal size={12} />}
        color="orange.6"
        variant="light"
      >
        3rd
      </Badge>
    );
  }
  return (
    <Badge color="dark" variant="light">
      #{rank}
    </Badge>
  );
}

function getScoreColor(score) {
  if (score >= 80) return 'green';
  if (score >= 60) return 'yellow';
  return 'red';
}

function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export default function MemberLeaderboard({ members }) {
  const rows = members.map((member, index) => (
    <Table.Tr key={member.userId}>
      <Table.Td>{getRankBadge(index + 1)}</Table.Td>
      <Table.Td>
        <Group gap="sm">
          <Avatar
            src={member.avatar}
            radius="xl"
            size="sm"
            color="violet"
          >
            {member.name?.charAt(0)}
          </Avatar>
          <Text size="sm" fw={500}>
            {member.name}
          </Text>
        </Group>
      </Table.Td>
      <Table.Td>
        <Stack gap={4}>
          <Group gap="xs">
            <Text size="sm" fw={600}>
              {member.avgScore}%
            </Text>
          </Group>
          <Progress
            value={member.avgScore}
            size="xs"
            radius="xl"
            color={getScoreColor(member.avgScore)}
          />
        </Stack>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{member.callCount}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm" c="dimmed">
          {formatDuration(member.totalDuration)}
        </Text>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Paper p="xl" radius="md" withBorder>
      <Text size="lg" fw={600} mb="lg">
        Team Leaderboard
      </Text>
      <ScrollArea>
        <Table verticalSpacing="sm" highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th w={80}>Rank</Table.Th>
              <Table.Th>Member</Table.Th>
              <Table.Th w={150}>Avg Score</Table.Th>
              <Table.Th w={80}>Calls</Table.Th>
              <Table.Th w={100}>Duration</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.length > 0 ? (
              rows
            ) : (
              <Table.Tr>
                <Table.Td colSpan={5}>
                  <Text ta="center" c="dimmed" py="xl">
                    No team members with analyzed calls yet
                  </Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </Paper>
  );
}
```

### 7.3.4 Create Score Distribution Chart
**File: `client/src/components/analytics/ScoreDistributionChart.jsx`**

```jsx
import { useMemo } from 'react';
import { Paper, Text } from '@mantine/core';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function ScoreDistributionChart({ members }) {
  const chartData = useMemo(() => {
    // Create score buckets
    const buckets = {
      '0-20': 0,
      '21-40': 0,
      '41-60': 0,
      '61-80': 0,
      '81-100': 0,
    };

    members.forEach((member) => {
      const score = member.avgScore;
      if (score <= 20) buckets['0-20']++;
      else if (score <= 40) buckets['21-40']++;
      else if (score <= 60) buckets['41-60']++;
      else if (score <= 80) buckets['61-80']++;
      else buckets['81-100']++;
    });

    return {
      labels: Object.keys(buckets),
      datasets: [
        {
          label: 'Team Members',
          data: Object.values(buckets),
          backgroundColor: [
            'rgba(239, 68, 68, 0.7)',
            'rgba(249, 115, 22, 0.7)',
            'rgba(234, 179, 8, 0.7)',
            'rgba(34, 197, 94, 0.7)',
            'rgba(124, 58, 237, 0.7)',
          ],
          borderColor: [
            'rgb(239, 68, 68)',
            'rgb(249, 115, 22)',
            'rgb(234, 179, 8)',
            'rgb(34, 197, 94)',
            'rgb(124, 58, 237)',
          ],
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    };
  }, [members]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1a1b1e',
        titleColor: '#fff',
        bodyColor: '#a1a1aa',
        borderColor: '#3f3f46',
        borderWidth: 1,
        callbacks: {
          label: (context) =>
            `${context.raw} member${context.raw !== 1 ? 's' : ''}`,
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
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          color: '#71717a',
        },
        grid: {
          color: 'rgba(113, 113, 122, 0.2)',
        },
      },
    },
  };

  return (
    <Paper p="xl" radius="md" withBorder>
      <Text size="lg" fw={600} mb="lg">
        Score Distribution
      </Text>
      <div style={{ height: 250 }}>
        <Bar data={chartData} options={options} />
      </div>
    </Paper>
  );
}
```

---

## Task 7.4: Team Analytics Page

### 7.4.1 Create Team Analytics Page
**File: `client/src/pages/TeamAnalyticsPage.jsx`**

```jsx
import { useEffect } from 'react';
import {
  Container,
  Title,
  Text,
  Stack,
  Grid,
  Alert,
  Skeleton,
  Group,
  Button,
} from '@mantine/core';
import { IconAlertCircle, IconRefresh } from '@tabler/icons-react';
import useAnalyticsStore from '../stores/analyticsStore';
import useAuthStore from '../stores/authStore';
import TeamOverviewCard from '../components/analytics/TeamOverviewCard';
import TeamPerformanceChart from '../components/analytics/TeamPerformanceChart';
import MemberLeaderboard from '../components/analytics/MemberLeaderboard';
import ScoreDistributionChart from '../components/analytics/ScoreDistributionChart';

export default function TeamAnalyticsPage() {
  const { user } = useAuthStore();
  const {
    organizationStats,
    memberPerformance,
    scoreTrend,
    isLoading,
    error,
    dateRange,
    fetchOrganizationStats,
    setDateRange,
  } = useAnalyticsStore();

  useEffect(() => {
    if (user?.organization) {
      fetchOrganizationStats(user.organization);
    }
  }, [user?.organization, fetchOrganizationStats]);

  const handleRefresh = () => {
    if (user?.organization) {
      fetchOrganizationStats(user.organization);
    }
  };

  if (!user?.organization) {
    return (
      <Container size="xl" py="xl">
        <Alert
          icon={<IconAlertCircle size={20} />}
          title="No Organization"
          color="yellow"
        >
          You need to be part of an organization to view team analytics.
          Create or join an organization to get started.
        </Alert>
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="xl" py="xl">
        <Alert
          icon={<IconAlertCircle size={20} />}
          title="Error"
          color="red"
        >
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <Group justify="space-between" align="flex-start">
          <div>
            <Title order={2}>Team Analytics</Title>
            <Text c="dimmed" mt={4}>
              Track team performance and identify coaching opportunities
            </Text>
          </div>
          <Button
            variant="subtle"
            leftSection={<IconRefresh size={16} />}
            onClick={handleRefresh}
            loading={isLoading}
          >
            Refresh
          </Button>
        </Group>

        {/* Overview Stats */}
        {isLoading ? (
          <Skeleton height={140} radius="md" />
        ) : (
          <TeamOverviewCard stats={organizationStats} />
        )}

        {/* Charts Row */}
        <Grid>
          <Grid.Col span={{ base: 12, lg: 8 }}>
            {isLoading ? (
              <Skeleton height={380} radius="md" />
            ) : (
              <TeamPerformanceChart
                scoreTrend={scoreTrend}
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
              />
            )}
          </Grid.Col>
          <Grid.Col span={{ base: 12, lg: 4 }}>
            {isLoading ? (
              <Skeleton height={380} radius="md" />
            ) : (
              <ScoreDistributionChart members={memberPerformance} />
            )}
          </Grid.Col>
        </Grid>

        {/* Leaderboard */}
        {isLoading ? (
          <Skeleton height={400} radius="md" />
        ) : (
          <MemberLeaderboard members={memberPerformance} />
        )}
      </Stack>
    </Container>
  );
}
```

---

## Task 7.5: Organization Settings Page

### 7.5.1 Create Organization Settings Page
**File: `client/src/pages/OrganizationSettingsPage.jsx`**

```jsx
import { useState, useEffect } from 'react';
import {
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
  Alert,
  Loader,
  Center,
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
  IconEdit,
  IconAlertCircle,
} from '@tabler/icons-react';
import api from '../services/api';
import useAuthStore from '../stores/authStore';

function InviteMemberModal({ opened, onClose, organizationId, onInvited }) {
  const [loading, setLoading] = useState(false);
  const form = useForm({
    initialValues: {
      email: '',
      role: 'member',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
    },
  });

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await api.post(`/organizations/${organizationId}/invite`, values);
      notifications.show({
        title: 'Invitation Sent',
        message: `Invitation sent to ${values.email}`,
        color: 'green',
      });
      form.reset();
      onClose();
      onInvited?.();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.message || 'Failed to send invitation',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Invite Team Member">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <TextInput
            label="Email Address"
            placeholder="colleague@company.com"
            required
            {...form.getInputProps('email')}
          />
          <Select
            label="Role"
            data={[
              { value: 'member', label: 'Member' },
              { value: 'manager', label: 'Manager' },
              { value: 'admin', label: 'Admin' },
            ]}
            {...form.getInputProps('role')}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Send Invitation
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

function getRoleBadgeColor(role) {
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
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [inviteOpened, { open: openInvite, close: closeInvite }] = useDisclosure(false);

  const form = useForm({
    initialValues: {
      name: '',
      description: '',
      allowMemberInvites: false,
      defaultCallVisibility: 'team',
    },
  });

  useEffect(() => {
    fetchOrganization();
  }, [user?.organization]);

  const fetchOrganization = async () => {
    if (!user?.organization) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.get(`/organizations/${user.organization}`);
      const org = response.data.data;
      setOrganization(org);
      form.setValues({
        name: org.name,
        description: org.description || '',
        allowMemberInvites: org.settings?.allowMemberInvites || false,
        defaultCallVisibility: org.settings?.defaultCallVisibility || 'team',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to load organization',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (values) => {
    setSaving(true);
    try {
      await api.patch(`/organizations/${organization._id}`, {
        name: values.name,
        description: values.description,
        settings: {
          allowMemberInvites: values.allowMemberInvites,
          defaultCallVisibility: values.defaultCallVisibility,
        },
      });
      notifications.show({
        title: 'Saved',
        message: 'Organization settings updated',
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

  const handleRemoveMember = async (userId) => {
    try {
      await api.delete(`/organizations/${organization._id}/members/${userId}`);
      notifications.show({
        title: 'Member Removed',
        message: 'Team member has been removed',
        color: 'green',
      });
      fetchOrganization();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.message || 'Failed to remove member',
        color: 'red',
      });
    }
  };

  const handleUpdateRole = async (userId, role) => {
    try {
      await api.patch(`/organizations/${organization._id}/members/${userId}`, {
        role,
      });
      notifications.show({
        title: 'Role Updated',
        message: 'Member role has been updated',
        color: 'green',
      });
      fetchOrganization();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.message || 'Failed to update role',
        color: 'red',
      });
    }
  };

  if (loading) {
    return (
      <Center h={400}>
        <Loader size="lg" />
      </Center>
    );
  }

  if (!organization) {
    return (
      <Container size="md" py="xl">
        <Alert icon={<IconAlertCircle size={20} />} title="No Organization" color="yellow">
          You are not part of any organization. Create one to manage your team.
        </Alert>
      </Container>
    );
  }

  const userRole = organization.getMemberRole?.(user._id) ||
    organization.members.find(m => m.user._id === user._id)?.role;
  const canManage = ['owner', 'admin'].includes(userRole);

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <div>
          <Title order={2}>Organization Settings</Title>
          <Text c="dimmed" mt={4}>
            Manage your team and organization preferences
          </Text>
        </div>

        <Tabs defaultValue="general">
          <Tabs.List>
            <Tabs.Tab value="general" leftSection={<IconSettings size={16} />}>
              General
            </Tabs.Tab>
            <Tabs.Tab value="members" leftSection={<IconUsers size={16} />}>
              Members ({organization.members.length})
            </Tabs.Tab>
            <Tabs.Tab value="invitations" leftSection={<IconMail size={16} />}>
              Invitations ({organization.pendingInvitations?.length || 0})
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="general" pt="xl">
            <Paper p="xl" radius="md" withBorder>
              <form onSubmit={form.onSubmit(handleSaveSettings)}>
                <Stack>
                  <TextInput
                    label="Organization Name"
                    placeholder="Acme Sales Team"
                    disabled={!canManage}
                    {...form.getInputProps('name')}
                  />
                  <Textarea
                    label="Description"
                    placeholder="Brief description of your organization"
                    disabled={!canManage}
                    {...form.getInputProps('description')}
                  />
                  <Select
                    label="Default Call Visibility"
                    description="Who can see newly uploaded calls by default"
                    disabled={!canManage}
                    data={[
                      { value: 'private', label: 'Private - Only uploader' },
                      { value: 'team', label: 'Team - All team members' },
                      { value: 'organization', label: 'Organization - Everyone' },
                    ]}
                    {...form.getInputProps('defaultCallVisibility')}
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
            <Paper p="xl" radius="md" withBorder>
              <Group justify="space-between" mb="lg">
                <Text fw={600}>Team Members</Text>
                {canManage && (
                  <Button size="xs" onClick={openInvite}>
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
                  {organization.members.map((member) => (
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
                          <div>
                            <Text size="sm" fw={500}>
                              {member.user.firstName} {member.user.lastName}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {member.user.email}
                            </Text>
                          </div>
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
            <Paper p="xl" radius="md" withBorder>
              <Group justify="space-between" mb="lg">
                <Text fw={600}>Pending Invitations</Text>
                {canManage && (
                  <Button size="xs" onClick={openInvite}>
                    Send Invitation
                  </Button>
                )}
              </Group>
              {organization.pendingInvitations?.length > 0 ? (
                <Table verticalSpacing="sm">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Email</Table.Th>
                      <Table.Th>Role</Table.Th>
                      <Table.Th>Invited By</Table.Th>
                      <Table.Th>Expires</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {organization.pendingInvitations.map((invite) => (
                      <Table.Tr key={invite.email}>
                        <Table.Td>{invite.email}</Table.Td>
                        <Table.Td>
                          <Badge color={getRoleBadgeColor(invite.role)} variant="light">
                            {invite.role}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">
                            {invite.invitedBy?.firstName} {invite.invitedBy?.lastName}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" c="dimmed">
                            {new Date(invite.expiresAt).toLocaleDateString()}
                          </Text>
                        </Table.Td>
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

      <InviteMemberModal
        opened={inviteOpened}
        onClose={closeInvite}
        organizationId={organization._id}
        onInvited={fetchOrganization}
      />
    </Container>
  );
}
```

---

## Task 7.6: Update Router & Navigation

### 7.6.1 Add Team Routes
**File: `client/src/App.jsx`** (update existing)

Add the following routes inside the protected routes:

```jsx
import TeamAnalyticsPage from './pages/TeamAnalyticsPage';
import OrganizationSettingsPage from './pages/OrganizationSettingsPage';

// Inside the Routes, add:
<Route path="/team" element={<TeamAnalyticsPage />} />
<Route path="/organization/settings" element={<OrganizationSettingsPage />} />
```

### 7.6.2 Update Sidebar Navigation
**File: `client/src/components/layout/Sidebar.jsx`** (update existing)

Add navigation items for team features:

```jsx
// Add to navigation items array:
{
  icon: IconUsers,
  label: 'Team',
  path: '/team',
},
{
  icon: IconSettings,
  label: 'Organization',
  path: '/organization/settings',
},
```

### 7.6.3 Register Organization Routes on Server
**File: `server/src/index.js`** (update existing)

```javascript
import organizationRoutes from './routes/organizations.js';

// Add with other route registrations:
app.use('/api/organizations', organizationRoutes);
```

---

## Verification Checklist

- [ ] Organization model with members, roles, and invitations
- [ ] Organization CRUD API endpoints
- [ ] Member invitation and management system
- [ ] Team analytics store with Zustand
- [ ] TeamOverviewCard component with stats
- [ ] TeamPerformanceChart with Chart.js line chart
- [ ] MemberLeaderboard with rankings
- [ ] ScoreDistributionChart with bar chart
- [ ] TeamAnalyticsPage with all components
- [ ] OrganizationSettingsPage with tabs
- [ ] Member invite modal
- [ ] Role management functionality
- [ ] Routes registered in router
- [ ] Sidebar navigation updated
- [ ] API routes registered on server

---

## Notes

- Chart.js is used for all visualizations (different from original Recharts)
- Mantine components for all UI elements
- Role-based access control for organization management
- Score trend aggregation by date for performance charts
- Member leaderboard sorted by average score
