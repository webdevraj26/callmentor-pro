import { create } from 'zustand';
import type { Call, PaginationMeta, UploadCallFormValues } from '@/types';
import { callsService } from '@/services/calls';
import type { CallsQueryParams } from '@/services/calls';

interface CallsState {
  // Data
  calls: Call[];
  currentCall: Call | null;
  meta: PaginationMeta | null;

  // UI State
  isLoading: boolean;
  isCreating: boolean;
  error: string | null;

  // Filters
  filters: CallsQueryParams;
}

interface CallsActions {
  // CRUD operations
  fetchCalls: (params?: CallsQueryParams) => Promise<void>;
  fetchCall: (id: string) => Promise<void>;
  createCall: (data: UploadCallFormValues) => Promise<Call>;
  updateCall: (id: string, data: Partial<Call>) => Promise<void>;
  deleteCall: (id: string) => Promise<void>;
  reanalyzeCall: (id: string) => Promise<void>;

  // Polling
  pollCallStatus: (id: string, onComplete?: (call: Call) => void) => void;
  stopPolling: () => void;

  // State management
  setFilters: (filters: Partial<CallsQueryParams>) => void;
  clearError: () => void;
  clearCurrentCall: () => void;
  reset: () => void;
}

type CallsStore = CallsState & CallsActions;

// Store polling interval reference
let pollingInterval: ReturnType<typeof setInterval> | null = null;

const initialState: CallsState = {
  calls: [],
  currentCall: null,
  meta: null,
  isLoading: false,
  isCreating: false,
  error: null,
  filters: { page: 1, limit: 20, sort: '-date' },
};

export const useCallsStore = create<CallsStore>()((set, get) => ({
  ...initialState,

  fetchCalls: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const mergedParams = { ...get().filters, ...params };
      const response = await callsService.getCalls(mergedParams);
      set({
        calls: response.data,
        meta: response.meta,
        filters: mergedParams,
        isLoading: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch calls';
      set({ error: message, isLoading: false });
    }
  },

  fetchCall: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const call = await callsService.getCall(id);
      set({ currentCall: call, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch call';
      set({ error: message, isLoading: false });
    }
  },

  createCall: async (data) => {
    set({ isCreating: true, error: null });
    try {
      const call = await callsService.createCall(data);
      // Add to beginning of list
      set((state) => ({
        calls: [call, ...state.calls],
        isCreating: false,
      }));
      return call;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create call';
      set({ error: message, isCreating: false });
      throw error;
    }
  },

  updateCall: async (id, data) => {
    set({ error: null });
    try {
      const updatedCall = await callsService.updateCall(id, data);
      set((state) => ({
        calls: state.calls.map((c) => (c._id === id ? updatedCall : c)),
        currentCall: state.currentCall?._id === id ? updatedCall : state.currentCall,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update call';
      set({ error: message });
      throw error;
    }
  },

  deleteCall: async (id) => {
    set({ error: null });
    try {
      await callsService.deleteCall(id);
      set((state) => ({
        calls: state.calls.filter((c) => c._id !== id),
        currentCall: state.currentCall?._id === id ? null : state.currentCall,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete call';
      set({ error: message });
      throw error;
    }
  },

  reanalyzeCall: async (id) => {
    set({ error: null });
    try {
      const call = await callsService.reanalyzeCall(id);
      set((state) => ({
        calls: state.calls.map((c) => (c._id === id ? call : c)),
        currentCall: state.currentCall?._id === id ? call : state.currentCall,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to re-analyze call';
      set({ error: message });
      throw error;
    }
  },

  pollCallStatus: (id, onComplete) => {
    // Clear any existing polling
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }

    pollingInterval = setInterval(async () => {
      try {
        const status = await callsService.getCallStatus(id);

        if (status.status === 'analyzed' || status.status === 'error') {
          // Stop polling
          if (pollingInterval) {
            clearInterval(pollingInterval);
            pollingInterval = null;
          }

          // Fetch the full call data
          const call = await callsService.getCall(id);

          // Update in store
          set((state) => ({
            calls: state.calls.map((c) => (c._id === id ? call : c)),
            currentCall: state.currentCall?._id === id ? call : state.currentCall,
          }));

          // Callback
          if (onComplete) {
            onComplete(call);
          }
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 3000); // Poll every 3 seconds
  },

  stopPolling: () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
  },

  setFilters: (filters) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }));
  },

  clearError: () => set({ error: null }),

  clearCurrentCall: () => set({ currentCall: null }),

  reset: () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
    set(initialState);
  },
}));
