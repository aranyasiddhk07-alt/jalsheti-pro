# JalSheti Pro — State Management Specification

**Version:** 1.0.0

---

## 1. GLOBAL STORE (Zustand)

Located at `src/store/useAppStore.ts`. One Zustand store for all global state.

### State Shape

```typescript
interface AppState {
  currentUser: User | null;
  currentField: Field | null;
  activeWaterSession: WaterSession | null;
  waterStartTime: Date | null;
  notifications: Notification[];
  unreadCount: number;
  supplierRealtimeFeed: Notification[];
  isOnline: boolean;
  offlineQueue: { action: string; payload: Record<string, unknown>; timestamp: number }[];
  syncStatus: 'idle' | 'syncing' | 'error';
}
```

### Actions (15 total)

| Action | Purpose |
|---|---|
| `setUser(user)` | Set current authenticated user |
| `setField(field)` | Set consumer's active field |
| `setActiveWaterSession(session)` | Set running water session + start time |
| `startWaterTimer()` | Set waterStartTime = new Date() |
| `clearWaterTimer()` | Set waterStartTime = null |
| `setNotifications(list)` | Replace notifications array |
| `addNotification(n)` | Prepend to notifications, increment unreadCount |
| `markNotificationRead(id)` | Toggle is_read on one notification |
| `markAllNotificationsRead()` | Set all is_read = true, unreadCount = 0 |
| `setUnreadCount(n)` | Set unread badge count |
| `addRealtimeFeed(n)` | Prepend to supplier realtime feed (max 50) |
| `setOnline(bool)` | Toggle connectivity state |
| `addToOfflineQueue(action, payload)` | Push to offline action queue |
| `removeFromOfflineQueue(index)` | Remove synced action |
| `setSyncStatus(status)` | Update sync state |
| `reset()` | Clear all state to initial values |

---

## 2. LOCAL STATE (React useState)

Used for component-specific temporary state only:
- Form input values (react-hook-form manages these)
- Loading/error flags
- UI toggle states (modal open/close, tab selection)
- Timer elapsed seconds (ConsumerDashboard water timer)

---

## 3. SERVER STATE (React Query / SWR)

Used for caching Supabase query results:
- Water session history (staleTime: 5 minutes)
- Market rates / FRP data (staleTime: 24 hours)
- Government schemes content (staleTime: 24 hours)
- Notification list (staleTime: 30 seconds)

---

## 4. OFFLINE SYNC

### Queue Flow
1. User performs action while offline (e.g., water START)
2. Action added to `offlineQueue[]` with timestamp
3. UI shows "syncing" indicator on queued items
4. When `isOnline` becomes true:
   a. Set `syncStatus = 'syncing'`
   b. Process queue FIFO
   c. On success: remove from queue
   d. On failure: keep in queue, set `syncStatus = 'error'`

### Persistence
- `offlineQueue` persisted to localStorage via Zustand `persist` middleware
- Survives browser refresh / app restart
- Cleared on successful full sync

---

## 5. REALTIME SUBSCRIPTIONS

### Consumer Real-time
- Subscribe to `water_sessions` for own field (INSERT/UPDATE)
- Subscribe to `pest_alerts` for own field (INSERT)
- Subscribe to `notifications` for own user (INSERT)

### Supplier Real-time
- Subscribe to `water_sessions` for all linked consumers (INSERT/UPDATE)
- Subscribe to `notifications` for own user (INSERT)

### Connection Management
- Open channel on component mount
- Close channel on component unmount (cleanup in useEffect)
- On tab blur: close channel (save connections)
- On tab focus: reopen channel
