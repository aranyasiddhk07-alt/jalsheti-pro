import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, Field, WaterSession, Notification } from "../types";

interface OfflineQueueItem {
  action: string;
  payload: Record<string, unknown>;
  timestamp: number;
}

interface AppState {
  currentUser: User | null;
  currentField: Field | null;
  activeWaterSession: WaterSession | null;
  waterStartTime: Date | null;
  notifications: Notification[];
  unreadCount: number;
  supplierRealtimeFeed: Notification[];
  isOnline: boolean;
  offlineQueue: OfflineQueueItem[];
  syncStatus: "idle" | "syncing" | "error";
  demoRole: string | null;

  setUser: (user: User | null) => void;
  setDemoRole: (role: string | null) => void;
  setField: (field: Field | null) => void;
  setActiveWaterSession: (session: WaterSession | null) => void;
  startWaterTimer: () => void;
  clearWaterTimer: () => void;
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  setUnreadCount: (count: number) => void;
  addRealtimeFeed: (notification: Notification) => void;
  setOnline: (online: boolean) => void;
  addToOfflineQueue: (action: string, payload: Record<string, unknown>) => void;
  removeFromOfflineQueue: (index: number) => void;
  setSyncStatus: (status: "idle" | "syncing" | "error") => void;
  reset: () => void;
}

const initialState = {
  currentUser: null as User | null,
  currentField: null as Field | null,
  activeWaterSession: null as WaterSession | null,
  waterStartTime: null as Date | null,
  notifications: [] as Notification[],
  unreadCount: 0,
  supplierRealtimeFeed: [] as Notification[],
  isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
  offlineQueue: [] as OfflineQueueItem[],
  syncStatus: "idle" as const,
  demoRole: null as string | null,
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...initialState,

      setUser: (user) => set({ currentUser: user }),
      setDemoRole: (demoRole) => set({ demoRole }),
      setField: (field) => set({ currentField: field }),

      setActiveWaterSession: (session) =>
        set({
          activeWaterSession: session,
          waterStartTime: session?.status === "started" ? new Date(session.actual_start_time!) : null,
        }),

      startWaterTimer: () => set({ waterStartTime: new Date() }),
      clearWaterTimer: () => set({ waterStartTime: null }),

      setNotifications: (notifications) => set({ notifications }),

      addNotification: (notification) =>
        set((state) => ({
          notifications: [notification, ...state.notifications].slice(0, 100),
          unreadCount: state.unreadCount + 1,
        })),

      markNotificationRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
        })),

      markAllNotificationsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
          unreadCount: 0,
        })),

      setUnreadCount: (count) => set({ unreadCount: count }),

      addRealtimeFeed: (notification) =>
        set((state) => ({
          supplierRealtimeFeed: [notification, ...state.supplierRealtimeFeed].slice(0, 50),
        })),

      setOnline: (online) => set({ isOnline: online }),

      addToOfflineQueue: (action, payload) =>
        set((state) => ({
          offlineQueue: [...state.offlineQueue, { action, payload, timestamp: Date.now() }],
        })),

      removeFromOfflineQueue: (index) =>
        set((state) => ({
          offlineQueue: state.offlineQueue.filter((_, i) => i !== index),
        })),

      setSyncStatus: (syncStatus) => set({ syncStatus }),

      reset: () => set(initialState),
    }),
    {
      name: "jalsheti-offline-queue",
      partialize: (state) => ({ offlineQueue: state.offlineQueue }),
    },
  ),
);
