import api from './api';
import type {
  Call,
  ApiResponse,
  PaginatedResponse,
  UploadCallFormValues,
} from '@/types';

export interface CallsQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  sort?: string;
  startDate?: string;
  endDate?: string;
  tags?: string[];
}

export interface CallStatusResponse {
  status: string;
  errorMessage?: string;
  score?: number;
}

export const callsService = {
  /**
   * Create a new call with transcript
   */
  async createCall(data: UploadCallFormValues): Promise<Call> {
    const response = await api.post<ApiResponse<{ call: Call }>>('/calls', {
      title: data.title,
      prospectName: data.prospectName,
      prospectCompany: data.prospectCompany,
      prospectRole: data.prospectRole,
      transcriptText: data.transcriptText,
    });
    return response.data.data.call;
  },

  /**
   * Get paginated list of calls
   */
  async getCalls(params: CallsQueryParams = {}): Promise<PaginatedResponse<Call>> {
    const response = await api.get<PaginatedResponse<Call>>('/calls', { params });
    return response.data;
  },

  /**
   * Get a single call by ID
   */
  async getCall(id: string): Promise<Call> {
    const response = await api.get<ApiResponse<{ call: Call }>>(`/calls/${id}`);
    return response.data.data.call;
  },

  /**
   * Update call metadata
   */
  async updateCall(id: string, data: Partial<Call>): Promise<Call> {
    const response = await api.put<ApiResponse<{ call: Call }>>(`/calls/${id}`, data);
    return response.data.data.call;
  },

  /**
   * Delete a call
   */
  async deleteCall(id: string): Promise<void> {
    await api.delete(`/calls/${id}`);
  },

  /**
   * Re-analyze a call
   */
  async reanalyzeCall(id: string): Promise<Call> {
    const response = await api.post<ApiResponse<{ call: Call }>>(`/calls/${id}/analyze`);
    return response.data.data.call;
  },

  /**
   * Get call analysis status (for polling)
   */
  async getCallStatus(id: string): Promise<CallStatusResponse> {
    const response = await api.get<ApiResponse<CallStatusResponse>>(`/calls/${id}/status`);
    return response.data.data;
  },
};
