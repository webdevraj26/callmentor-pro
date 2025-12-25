import mongoose, { Document, Schema } from 'mongoose';

// ============ SUBDOCUMENT INTERFACES ============

export interface IOrganizationSettings {
  defaultCallVisibility: 'private' | 'team' | 'organization';
  allowMemberInvites: boolean;
  requireApproval: boolean;
}

export interface ISubscription {
  plan: 'starter' | 'professional' | 'enterprise';
  status: 'active' | 'past_due' | 'canceled' | 'trialing';
  trialEndsAt?: Date;
  currentPeriodEnd?: Date;
  maxMembers: number;
  maxCallsPerMonth: number;
}

export interface IOrganizationMember {
  user: mongoose.Types.ObjectId;
  role: 'owner' | 'admin' | 'manager' | 'member';
  joinedAt: Date;
  invitedBy?: mongoose.Types.ObjectId;
}

export interface IInvitation {
  email: string;
  role: 'admin' | 'manager' | 'member';
  token: string;
  expiresAt: Date;
  invitedBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

// ============ MAIN ORGANIZATION INTERFACE ============

export interface IOrganization extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  owner: mongoose.Types.ObjectId;
  settings: IOrganizationSettings;
  subscription: ISubscription;
  members: IOrganizationMember[];
  pendingInvitations: IInvitation[];
  createdAt: Date;
  updatedAt: Date;
}

// ============ SCHEMAS ============

const OrganizationSettingsSchema = new Schema<IOrganizationSettings>(
  {
    defaultCallVisibility: {
      type: String,
      enum: ['private', 'team', 'organization'],
      default: 'private',
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
  { _id: false }
);

const SubscriptionSchema = new Schema<ISubscription>(
  {
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
    trialEndsAt: {
      type: Date,
    },
    currentPeriodEnd: {
      type: Date,
    },
    maxMembers: {
      type: Number,
      default: 5,
    },
    maxCallsPerMonth: {
      type: Number,
      default: 50,
    },
  },
  { _id: false }
);

const OrganizationMemberSchema = new Schema<IOrganizationMember>(
  {
    user: {
      type: Schema.Types.ObjectId,
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
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { _id: false }
);

const InvitationSchema = new Schema<IInvitation>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
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
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

// ============ MAIN ORGANIZATION SCHEMA ============

const OrganizationSchema = new Schema<IOrganization>(
  {
    name: {
      type: String,
      required: [true, 'Organization name is required'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    logo: {
      type: String,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    settings: {
      type: OrganizationSettingsSchema,
      default: () => ({}),
    },
    subscription: {
      type: SubscriptionSchema,
      default: () => ({
        plan: 'starter',
        status: 'trialing',
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
        maxMembers: 5,
        maxCallsPerMonth: 50,
      }),
    },
    members: [OrganizationMemberSchema],
    pendingInvitations: [InvitationSchema],
  },
  {
    timestamps: true,
  }
);

// ============ PRE-SAVE HOOKS ============

OrganizationSchema.pre('save', function () {
  // Generate slug from name if not provided
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
});

// ============ METHODS ============

OrganizationSchema.methods.toJSON = function () {
  const org = this.toObject();
  delete org.__v;
  return org;
};

// Check if user is a member with specific role
OrganizationSchema.methods.hasRole = function (
  userId: mongoose.Types.ObjectId,
  roles: string[]
): boolean {
  const member = this.members.find(
    (m: IOrganizationMember) => m.user.toString() === userId.toString()
  );
  return member ? roles.includes(member.role) : false;
};

// Check if user can manage (owner or admin)
OrganizationSchema.methods.canManage = function (
  userId: mongoose.Types.ObjectId
): boolean {
  return this.hasRole(userId, ['owner', 'admin']);
};

export const Organization = mongoose.model<IOrganization>('Organization', OrganizationSchema);
