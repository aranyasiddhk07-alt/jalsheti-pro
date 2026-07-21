import { useEffect, useState, useCallback } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { supplierService } from '../../services/supplierService';
import { mr } from '../../i18n/marathi';
import { Button, Card, Header, BottomNav, SkeletonDashboard, ErrorState, EmptyState, OfflineBanner } from '../../components';
import type { CommissionWallet } from '../../types';

interface Activity {
  id: string;
  consumer_name: string;
  action: string;
  time: string;
}

interface Stats {
  farmerCount: number;
  monthlyEarnings: number;
  totalEarnings: number;
  pendingPayout: number;
}

interface InactiveFarmer {
  id: string;
  name: string;
  daysInactive: number;
}

const NAV_ITEMS = [
  { key: 'dashboard', label: 'डॅशबोर्ड', icon: 'dashboard' },
  { key: 'farmers', label: 'शेतकरी', icon: 'farmers' },
  { key: 'wallet', label: 'वॉलेट', icon: 'wallet' },
  { key: 'referrals', label: 'रेफरल', icon: 'referrals' },
  { key: 'notifications', label: 'सूचना', icon: 'notifications' },
];

export default function SupplierDashboard() {
  const { currentUser, isOnline } = useAppStore();
  const [stats, setStats] = useState<Stats>({
    farmerCount: 0,
    monthlyEarnings: 0,
    totalEarnings: 0,
    pendingPayout: 0,
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [inactiveFarmers, setInactiveFarmers] = useState<InactiveFarmer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  const fetchDashboardData = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    setError(null);
    try {
      const consumers = await supplierService.getLinkedConsumers(currentUser.id);
      setStats((prev) => ({ ...prev, farmerCount: consumers.length }));

      const wallet = await supplierService.getCommissionWallet(currentUser.id);
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const total = wallet
        .filter((w: CommissionWallet) => w.status === 'paid')
        .reduce((sum: number, w: CommissionWallet) => sum + w.amount, 0);
      const monthly = wallet
        .filter((w: CommissionWallet) => w.status === 'paid' && w.created_at >= monthStart)
        .reduce((sum: number, w: CommissionWallet) => sum + w.amount, 0);
      const pending = await supplierService.getPendingPayoutAmount(currentUser.id);

      setStats((prev) => ({
        ...prev,
        monthlyEarnings: monthly,
        totalEarnings: total,
        pendingPayout: pending,
      }));

      setInactiveFarmers(
        consumers
          .filter((c) => c.subscription_status === 'trial' || !c.is_active)
          .slice(0, 5)
          .map((c) => ({ id: c.id, name: c.name || 'शेतकरी', daysInactive: 3 })),
      );
    } catch (err) {
      console.error('Supplier dashboard error:', err);
      setError(mr.errorOccurred);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    fetchDashboardData();

    const unsubscribe = supplierService.subscribeToWaterSessions(
      currentUser.id,
      (payload: Record<string, unknown>) => {
        const newRecord = payload.new as { id: string; consumer_name?: string } | undefined;
        if (!newRecord) return;
        setActivities((prev) => [
          {
            id: newRecord.id,
            consumer_name: newRecord.consumer_name || 'शेतकरी',
            action: 'पाणी सुरू केले',
            time: new Date().toLocaleTimeString('mr-IN'),
          },
          ...prev.slice(0, 9),
        ]);
      },
    );

    return () => {
      unsubscribe();
    };
  }, [currentUser, fetchDashboardData]);

  const handleShareReferral = async () => {
    if (!currentUser?.referral_code) return;
    const shareUrl = `${window.location.origin}/auth?ref=${currentUser.referral_code}`;
    try {
      await navigator.share({ title: mr.referralProgram, text: mr.referralReward, url: shareUrl });
    } catch {
      try {
        await navigator.clipboard.writeText(shareUrl);
      } catch {
        // ignore
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-bg">
        <SkeletonDashboard cardCount={5} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface-bg flex items-center justify-center">
        <ErrorState message={error} onRetry={fetchDashboardData} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-bg font-primary pb-24">
      <OfflineBanner />
      <Header
        title={mr.supplierDashboard}
        subtitle={currentUser?.name}
        isOnline={isOnline}
      />

      <main className="px-4 mt-4 space-y-4" role="main">
        <Card elevation="shadow">
          <h2 className="text-heading font-primary font-bold text-secondary-800">{mr.earnings}</h2>
          <div className="grid grid-cols-3 gap-3 mt-3">
            <div className="text-center">
              <p className="text-hero font-bold text-primary-600">₹{stats.monthlyEarnings}</p>
              <span className="text-label text-secondary-500">{mr.thisMonth}</span>
            </div>
            <div className="text-center border-x border-secondary-200">
              <p className="text-hero font-bold text-secondary-800">₹{stats.totalEarnings}</p>
              <span className="text-label text-secondary-500">{mr.total}</span>
            </div>
            <div className="text-center">
              <p className="text-hero font-bold text-amber-600">₹{stats.pendingPayout}</p>
              <span className="text-label text-secondary-500">{mr.pending}</span>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Card elevation="shadow" padding="sm">
            <p className="text-label text-secondary-500">{mr.farmerCount}</p>
            <p className="text-heading font-bold text-secondary-800">{stats.farmerCount}</p>
          </Card>
          <Card elevation="shadow" padding="sm">
            <p className="text-label text-secondary-500">{mr.activeToday}</p>
            <p className="text-heading font-bold text-primary-600">0</p>
          </Card>
        </div>

        <Button variant="primary" fullWidth aria-label={mr.giveWaterSchedule}>
          {mr.giveWaterSchedule}
        </Button>

        {inactiveFarmers.length > 0 && (
          <Card className="bg-amber-50 border border-amber-200">
            <h3 className="text-body font-primary font-bold text-amber-800">{mr.inactiveFarmersTitle}</h3>
            <ul className="mt-2 space-y-1">
              {inactiveFarmers.map((f) => (
                <li key={f.id} className="text-label text-amber-700">
                  {f.name} - {mr.daysInactive.replace('{days}', String(f.daysInactive))}
                </li>
              ))}
            </ul>
          </Card>
        )}

        <Card elevation="shadow">
          <h3 className="text-body font-primary font-bold text-secondary-800 mb-3">{mr.recentActivity}</h3>
          {activities.length === 0 ? (
            <EmptyState icon="history" message={mr.noActivity} />
          ) : (
            <ul className="space-y-2">
              {activities.map((a) => (
                <li key={a.id} className="flex justify-between items-center border-b border-secondary-100 pb-2 last:border-0 last:pb-0">
                  <div>
                    <p className="text-body font-primary font-medium text-secondary-800">{a.consumer_name}</p>
                    <p className="text-label text-secondary-500">{a.action}</p>
                  </div>
                  <span className="text-xs text-secondary-400">{a.time}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-heading font-bold">{mr.referralProgram}</p>
              <p className="text-label opacity-80">{mr.referralReward}</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleShareReferral} className="bg-white">
              {mr.shareReferral}
            </Button>
          </div>
        </Card>
      </main>

      <BottomNav items={NAV_ITEMS} activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
