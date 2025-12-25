import { Response } from 'express';
import crypto from 'crypto';
import mongoose from 'mongoose';
import { Organization, IOrganization } from '../models/Organization';
import { User } from '../models/User';
import { Call } from '../models/Call';
import { AuthRequest } from '../types';

/**
 * @desc    Create a new organization
 * @route   POST /api/organizations
 * @access  Private
 */
export const createOrganization = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body;
    const user = req.user!;

    // Check if user already owns an organization
    const existingOrg = await Organization.findOne({
      owner: user._id,
    });

    if (existingOrg) {
      res.status(400).json({
        success: false,
        error: {
          code: 'ALREADY_OWNER',
          message: 'You already own an organization',
        },
      });
      return;
    }

    const organization = await Organization.create({
      name,
      description,
      owner: user._id,
      members: [
        {
          user: user._id,
          role: 'owner',
          joinedAt: new Date(),
        },
      ],
    });

    // Update user's organization reference
    await User.findByIdAndUpdate(user._id, {
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
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to create organization',
      },
    });
  }
};

/**
 * @desc    Get user's organizations
 * @route   GET /api/organizations/my
 * @access  Private
 */
export const getMyOrganizations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;

    const organizations = await Organization.find({
      'members.user': user._id,
    })
      .populate('members.user', 'firstName lastName email avatar')
      .populate('owner', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: organizations,
    });
  } catch (error) {
    console.error('Get organizations error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch organizations',
      },
    });
  }
};

/**
 * @desc    Get organization by ID
 * @route   GET /api/organizations/:id
 * @access  Private
 */
export const getOrganization = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const organization = await Organization.findById(id)
      .populate('members.user', 'firstName lastName email avatar')
      .populate('pendingInvitations.invitedBy', 'firstName lastName')
      .populate('owner', 'firstName lastName email');

    if (!organization) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Organization not found',
        },
      });
      return;
    }

    // Check if user is a member
    const isMember = organization.members.some(
      (m) => m.user._id.toString() === user._id.toString()
    );

    if (!isMember) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Access denied',
        },
      });
      return;
    }

    res.json({
      success: true,
      data: organization,
    });
  } catch (error) {
    console.error('Get organization error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch organization',
      },
    });
  }
};

/**
 * @desc    Update organization
 * @route   PATCH /api/organizations/:id
 * @access  Private (Admin/Owner only)
 */
export const updateOrganization = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user!;
    const { name, description, settings } = req.body;

    const organization = await Organization.findById(id);

    if (!organization) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Organization not found',
        },
      });
      return;
    }

    // Check if user can manage
    const member = organization.members.find(
      (m) => m.user.toString() === user._id.toString()
    );
    const canManage = member && ['owner', 'admin'].includes(member.role);

    if (!canManage) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Only admins can update organization settings',
        },
      });
      return;
    }

    if (name) organization.name = name;
    if (description !== undefined) organization.description = description;
    if (settings) {
      organization.settings = { ...organization.settings, ...settings };
    }

    await organization.save();

    res.json({
      success: true,
      data: organization,
    });
  } catch (error) {
    console.error('Update organization error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to update organization',
      },
    });
  }
};

/**
 * @desc    Invite a member to organization
 * @route   POST /api/organizations/:id/invite
 * @access  Private (Admin/Owner only)
 */
export const inviteMember = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { email, role } = req.body;
    const user = req.user!;

    const organization = await Organization.findById(id);

    if (!organization) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Organization not found',
        },
      });
      return;
    }

    // Check if user can manage
    const member = organization.members.find(
      (m) => m.user.toString() === user._id.toString()
    );
    const canManage = member && ['owner', 'admin'].includes(member.role);

    if (!canManage) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Permission denied',
        },
      });
      return;
    }

    // Check member limit
    if (organization.members.length >= organization.subscription.maxMembers) {
      res.status(400).json({
        success: false,
        error: {
          code: 'LIMIT_REACHED',
          message: 'Member limit reached. Please upgrade your plan.',
        },
      });
      return;
    }

    // Check if already a member
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      const isExistingMember = organization.members.some(
        (m) => m.user.toString() === existingUser._id.toString()
      );
      if (isExistingMember) {
        res.status(400).json({
          success: false,
          error: {
            code: 'ALREADY_MEMBER',
            message: 'User is already a member',
          },
        });
        return;
      }
    }

    // Check for existing invitation
    const existingInvite = organization.pendingInvitations.find(
      (inv) => inv.email === email.toLowerCase()
    );
    if (existingInvite) {
      res.status(400).json({
        success: false,
        error: {
          code: 'ALREADY_INVITED',
          message: 'Invitation already sent to this email',
        },
      });
      return;
    }

    // Generate invitation token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    organization.pendingInvitations.push({
      email: email.toLowerCase(),
      role: role || 'member',
      token,
      expiresAt,
      invitedBy: user._id,
      createdAt: new Date(),
    });

    await organization.save();

    // TODO: Send invitation email in production
    // await sendInvitationEmail(email, token, organization.name, user);

    res.json({
      success: true,
      message: 'Invitation sent successfully',
      data: { token }, // In production, don't return token - send via email
    });
  } catch (error) {
    console.error('Invite member error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to send invitation',
      },
    });
  }
};

/**
 * @desc    Accept an invitation
 * @route   POST /api/organizations/accept-invitation
 * @access  Private
 */
export const acceptInvitation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { token } = req.body;
    const user = req.user!;

    const organization = await Organization.findOne({
      'pendingInvitations.token': token,
    });

    if (!organization) {
      res.status(404).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired invitation',
        },
      });
      return;
    }

    const invitation = organization.pendingInvitations.find(
      (inv) => inv.token === token
    );

    if (!invitation) {
      res.status(404).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid invitation',
        },
      });
      return;
    }

    if (invitation.expiresAt < new Date()) {
      res.status(400).json({
        success: false,
        error: {
          code: 'EXPIRED',
          message: 'Invitation has expired',
        },
      });
      return;
    }

    // Check if user email matches invitation
    if (user.email.toLowerCase() !== invitation.email) {
      res.status(403).json({
        success: false,
        error: {
          code: 'EMAIL_MISMATCH',
          message: 'This invitation was sent to a different email',
        },
      });
      return;
    }

    // Add user as member
    organization.members.push({
      user: user._id,
      role: invitation.role,
      joinedAt: new Date(),
      invitedBy: invitation.invitedBy,
    });

    // Remove invitation
    organization.pendingInvitations = organization.pendingInvitations.filter(
      (inv) => inv.token !== token
    );

    await organization.save();

    // Update user's organization
    await User.findByIdAndUpdate(user._id, {
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
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to accept invitation',
      },
    });
  }
};

/**
 * @desc    Remove a member from organization
 * @route   DELETE /api/organizations/:id/members/:userId
 * @access  Private (Admin/Owner only)
 */
export const removeMember = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id, userId } = req.params;
    const user = req.user!;

    const organization = await Organization.findById(id);

    if (!organization) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Organization not found',
        },
      });
      return;
    }

    // Check permissions
    const requesterMember = organization.members.find(
      (m) => m.user.toString() === user._id.toString()
    );
    const targetMember = organization.members.find(
      (m) => m.user.toString() === userId
    );

    if (!requesterMember || !['owner', 'admin'].includes(requesterMember.role)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Permission denied',
        },
      });
      return;
    }

    if (!targetMember) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Member not found',
        },
      });
      return;
    }

    if (targetMember.role === 'owner') {
      res.status(400).json({
        success: false,
        error: {
          code: 'CANNOT_REMOVE_OWNER',
          message: 'Cannot remove the organization owner',
        },
      });
      return;
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
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to remove member',
      },
    });
  }
};

/**
 * @desc    Update member role
 * @route   PATCH /api/organizations/:id/members/:userId
 * @access  Private (Owner only)
 */
export const updateMemberRole = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id, userId } = req.params;
    const { role } = req.body;
    const user = req.user!;

    const organization = await Organization.findById(id);

    if (!organization) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Organization not found',
        },
      });
      return;
    }

    // Only owner can change roles
    const requesterMember = organization.members.find(
      (m) => m.user.toString() === user._id.toString()
    );

    if (!requesterMember || requesterMember.role !== 'owner') {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Only the owner can change member roles',
        },
      });
      return;
    }

    const memberIndex = organization.members.findIndex(
      (m) => m.user.toString() === userId
    );

    if (memberIndex === -1) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Member not found',
        },
      });
      return;
    }

    if (organization.members[memberIndex].role === 'owner') {
      res.status(400).json({
        success: false,
        error: {
          code: 'CANNOT_CHANGE_OWNER',
          message: 'Cannot change owner role',
        },
      });
      return;
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
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to update member role',
      },
    });
  }
};

/**
 * @desc    Cancel a pending invitation
 * @route   DELETE /api/organizations/:id/invitations/:email
 * @access  Private (Admin/Owner only)
 */
export const cancelInvitation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id, email } = req.params;
    const user = req.user!;

    const organization = await Organization.findById(id);

    if (!organization) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Organization not found',
        },
      });
      return;
    }

    // Check if user can manage
    const member = organization.members.find(
      (m) => m.user.toString() === user._id.toString()
    );
    const canManage = member && ['owner', 'admin'].includes(member.role);

    if (!canManage) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Permission denied',
        },
      });
      return;
    }

    organization.pendingInvitations = organization.pendingInvitations.filter(
      (inv) => inv.email !== email.toLowerCase()
    );

    await organization.save();

    res.json({
      success: true,
      message: 'Invitation cancelled',
    });
  } catch (error) {
    console.error('Cancel invitation error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to cancel invitation',
      },
    });
  }
};

/**
 * @desc    Get organization statistics
 * @route   GET /api/organizations/:id/stats
 * @access  Private
 */
export const getOrganizationStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const organization = await Organization.findById(id);

    if (!organization) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Organization not found',
        },
      });
      return;
    }

    // Check if user is a member
    const isMember = organization.members.some(
      (m) => m.user.toString() === user._id.toString()
    );

    if (!isMember) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Access denied',
        },
      });
      return;
    }

    const memberIds = organization.members.map((m) => m.user);

    // Get aggregate stats
    const [callStats, performanceByMember] = await Promise.all([
      // Overall call stats
      Call.aggregate([
        { $match: { user: { $in: memberIds }, status: 'analyzed' } },
        {
          $group: {
            _id: null,
            totalCalls: { $sum: 1 },
            avgScore: { $avg: '$analysis.overallScore' },
            totalDuration: { $sum: '$duration' },
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

    // Get category breakdown
    const categoryStats = await Call.aggregate([
      { $match: { user: { $in: memberIds }, status: 'analyzed' } },
      {
        $group: {
          _id: null,
          discovery: { $avg: '$analysis.scoreBreakdown.categories.discovery.score' },
          talkBalance: { $avg: '$analysis.scoreBreakdown.categories.talkBalance.score' },
          objectionHandling: { $avg: '$analysis.scoreBreakdown.categories.objectionHandling.score' },
          nextSteps: { $avg: '$analysis.scoreBreakdown.categories.nextSteps.score' },
          rapport: { $avg: '$analysis.scoreBreakdown.categories.rapport.score' },
          accuracy: { $avg: '$analysis.scoreBreakdown.categories.accuracy.score' },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        overview: callStats[0] || {
          totalCalls: 0,
          avgScore: 0,
          totalDuration: 0,
        },
        memberPerformance: performanceByMember,
        scoreTrend,
        categoryStats: categoryStats[0] || {},
        memberCount: organization.members.length,
      },
    });
  } catch (error) {
    console.error('Get organization stats error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch organization stats',
      },
    });
  }
};
