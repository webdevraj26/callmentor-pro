import api from './api';
import type { User, LoginFormValues, RegisterFormValues } from '@/types';

interface AuthResponse {
  success: true;
  data: {
    user: User;
    token: string;
  };
}

interface MessageResponse {
  success: true;
  data: {
    message: string;
    resetToken?: string; // Only in development
  };
}

interface UserResponse {
  success: true;
  data: {
    user: User;
  };
}

export const authService = {
  // Register new user
  async register(data: RegisterFormValues & { salesRole?: string }): Promise<AuthResponse['data']> {
    const response = await api.post<AuthResponse>('/auth/register', {
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      companyName: data.companyName,
      salesRole: data.salesRole,
    });
    return response.data.data;
  },

  // Login user
  async login(data: LoginFormValues): Promise<AuthResponse['data']> {
    const response = await api.post<AuthResponse>('/auth/login', {
      email: data.email,
      password: data.password,
    });
    return response.data.data;
  },

  // Get current user
  async getMe(): Promise<User> {
    const response = await api.get<UserResponse>('/auth/me');
    return response.data.data.user;
  },

  // Forgot password
  async forgotPassword(email: string): Promise<string> {
    const response = await api.post<MessageResponse>('/auth/forgot-password', { email });
    return response.data.data.message;
  },

  // Reset password
  async resetPassword(token: string, password: string): Promise<string> {
    const response = await api.post<MessageResponse>(`/auth/reset-password/${token}`, {
      password,
    });
    return response.data.data.message;
  },

  // Update profile
  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.put<UserResponse>('/auth/profile', data);
    return response.data.data.user;
  },

  // Complete onboarding
  async completeOnboarding(data: {
    companyName: string;
    salesRole: string;
    teamSize: string;
  }): Promise<User> {
    const response = await api.post<UserResponse>('/auth/onboarding', data);
    return response.data.data.user;
  },

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<string> {
    const response = await api.put<MessageResponse>('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data.data.message;
  },
};

export default authService;
