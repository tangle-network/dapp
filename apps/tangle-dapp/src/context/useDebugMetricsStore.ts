'use client';

import { create } from 'zustand';

const useDebugMetricsStore = create<{
  requestCount: number;
  subscriptionCount: number;
  incrementRequestCount: () => void;
  incrementSubscriptionCount: () => void;
  decrementSubscriptionCount: () => void;
}>((set) => ({
  requestCount: 0,
  subscriptionCount: 0,
  incrementRequestCount: () =>
    set((state) => ({ requestCount: state.requestCount + 1 })),
  incrementSubscriptionCount: () =>
    set((state) => ({ subscriptionCount: state.subscriptionCount + 1 })),
  decrementSubscriptionCount: () =>
    set((state) => ({ subscriptionCount: state.subscriptionCount - 1 })),
}));

export default useDebugMetricsStore;
