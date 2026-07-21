import { useAppStore } from '../store/useAppStore';

export function OfflineBanner() {
  const isOnline = useAppStore((s) => s.isOnline);
  const queueLength = useAppStore((s) => s.offlineQueue.length);
  const syncStatus = useAppStore((s) => s.syncStatus);

  if (isOnline && queueLength === 0) return null;

  const isSyncing = isOnline && syncStatus === 'syncing';

  return (
    <div
      role="alert"
      className={
        isSyncing
          ? 'bg-amber-500 text-white px-4 py-2 text-center text-label font-primary'
          : 'bg-danger-500 text-white px-4 py-2 text-center text-label font-primary sticky top-0 z-30'
      }
    >
      {isSyncing ? (
        <span className="flex items-center justify-center gap-2">
          <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />
          सिंक होत आहे... ({queueLength} थांबलेले)
        </span>
      ) : (
        <>इंटरनेट नाही — पाणी लॉग जतन केले जातील{queueLength > 0 ? ` (${queueLength})` : ''}</>
      )}
    </div>
  );
}
