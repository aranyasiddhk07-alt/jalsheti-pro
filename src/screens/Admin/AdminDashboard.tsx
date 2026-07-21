import { useEffect, useState, useCallback } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { adminService } from '../../services/adminService';
import { mr } from '../../i18n/marathi';
import { Button, Card, Header, BottomNav, SkeletonDashboard, ErrorState, EmptyState, OfflineBanner } from '../../components';

interface PlatformStats {
  mrr: number;
  arr: number;
  activeConsumers: number;
  activeSuppliers: number;
  trialsCount: number;
}

interface PayoutApproval {
  id: string;
  supplier_name: string;
  amount: number;
  created_at: string;
}

interface AuditEntry {
  id: string;
  actor_id: string;
  action: string;
  table_name: string;
  created_at: string;
}

type AdminTab = 'payouts' | 'rates' | 'broadcast' | 'audit';

const NAV_ITEMS = [
  { key: 'overview', label: 'ओव्हरव्ह्यू', icon: 'dashboard' },
  { key: 'suppliers', label: 'पुरवठादार', icon: 'farmers' },
  { key: 'consumers', label: 'शेतकरी', icon: 'profile' },
  { key: 'audit', label: 'ऑडिट', icon: 'history' },
  { key: 'settings', label: 'सेटिंग्ज', icon: 'profile' },
];

const DISTRICTS = ['कोल्हापूर', 'सांगली', 'सातारा', 'पुणे', 'अहमदनगर'];

export default function AdminDashboard() {
  const { currentUser, isOnline } = useAppStore();
  const [stats, setStats] = useState<PlatformStats>({
    mrr: 0,
    arr: 0,
    activeConsumers: 0,
    activeSuppliers: 0,
    trialsCount: 0,
  });
  const [pendingPayouts, setPendingPayouts] = useState<PayoutApproval[]>([]);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [activeTab, setActiveTab] = useState<AdminTab>('payouts');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [frpRate, setFrpRate] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastTarget, setBroadcastTarget] = useState<'all' | 'suppliers' | 'consumers' | 'district'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const fetchAdminData = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    setError(null);
    try {
      const metrics = await adminService.getPlatformMetrics();
      setStats({
        mrr: metrics.mrr,
        arr: metrics.mrr * 12,
        activeConsumers: metrics.activeConsumers,
        activeSuppliers: metrics.activeSuppliers,
        trialsCount: metrics.activeTrials,
      });

      const payouts = await adminService.getPendingPayouts();
      setPendingPayouts(payouts);

      const log = await adminService.getAuditLog();
      setAuditLog(log as unknown as AuditEntry[]);
    } catch (err) {
      console.error('Admin dashboard error:', err);
      setError(mr.errorOccurred);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  const handleApprovePayout = async (payoutId: string) => {
    if (!currentUser) return;
    try {
      await adminService.approvePayout(payoutId, currentUser.id);
      setPendingPayouts((prev) => prev.filter((p) => p.id !== payoutId));
      setToast('पेमेंट मंजूर झाले');
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      console.error('Payout approval error:', err);
      setError(mr.errorOccurred);
    }
  };

  const handleUpdateRate = async () => {
    if (!currentUser || !selectedDistrict || !frpRate) return;
    try {
      await adminService.updateMarketRate(currentUser.id, selectedDistrict, {
        frp_rate: parseInt(frpRate, 10),
      });
      setFrpRate('');
      setToast('फ्रेट अपडेट झाले');
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      console.error('Market rate update error:', err);
      setError(mr.errorOccurred);
    }
  };

  const handleSendBroadcast = async () => {
    if (!currentUser || !broadcastMessage.trim()) return;
    try {
      await adminService.sendBroadcast(
        currentUser.id,
        broadcastMessage,
        broadcastTarget,
        broadcastTarget === 'district' ? selectedDistrict : undefined,
      );
      setBroadcastMessage('');
      setToast(mr.broadcastSent);
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      console.error('Broadcast error:', err);
      setError(mr.errorOccurred);
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
        <ErrorState message={error} onRetry={fetchAdminData} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-bg font-primary pb-24">
      <OfflineBanner />
      <Header
        title={mr.adminDashboard}
        subtitle={currentUser?.name}
        isOnline={isOnline}
      />

      {toast && (
        <div role="status" className="fixed top-20 left-1/2 -translate-x-1/2 bg-primary-700 text-white px-6 py-3 rounded-lg shadow-lg z-50 text-body">
          {toast}
        </div>
      )}

      <main className="px-4 mt-4 space-y-4" role="main">
        <div className="grid grid-cols-2 gap-3">
          <Card elevation="shadow" padding="sm">
            <p className="text-label text-secondary-500">{mr.mrr}</p>
            <p className="text-hero font-bold text-primary-600">₹{stats.mrr}</p>
            <span className="text-xs text-secondary-400">{mr.monthly}</span>
          </Card>
          <Card elevation="shadow" padding="sm">
            <p className="text-label text-secondary-500">{mr.arr}</p>
            <p className="text-hero font-bold text-secondary-800">₹{stats.arr}</p>
            <span className="text-xs text-secondary-400">{mr.annual}</span>
          </Card>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: mr.activeConsumers, value: stats.activeConsumers, color: 'text-primary-600' },
            { label: mr.activeSuppliers, value: stats.activeSuppliers, color: 'text-secondary-800' },
            { label: mr.trials, value: stats.trialsCount, color: 'text-amber-600' },
          ].map((item) => (
            <Card key={item.label} elevation="shadow" padding="sm" className="text-center">
              <p className="text-label text-secondary-500">{item.label}</p>
              <p className={`text-heading font-bold ${item.color}`}>{item.value}</p>
            </Card>
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2" role="tablist">
          {(['payouts', 'rates', 'broadcast', 'audit'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              role="tab"
              aria-selected={activeTab === tab}
              className={`px-4 py-2 rounded-lg text-label font-primary font-medium whitespace-nowrap min-h-[44px] transition-colors ${
                activeTab === tab ? 'bg-primary-600 text-white' : 'bg-secondary-100 text-secondary-600'
              }`}
            >
              {mr[`tab_${tab}`] || tab}
            </button>
          ))}
        </div>

        {activeTab === 'payouts' && (
          <Card elevation="shadow">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-body font-primary font-bold text-secondary-800">{mr.payoutApproval}</h2>
              <span className="bg-danger-50 text-danger-700 text-xs font-semibold px-3 py-1 rounded-full">
                {pendingPayouts.length} {mr.pending}
              </span>
            </div>
            {pendingPayouts.length === 0 ? (
              <EmptyState icon="wallet" message={mr.noPendingPayouts} />
            ) : (
              <ul className="space-y-2">
                {pendingPayouts.map((p) => (
                  <li key={p.id} className="flex justify-between items-center border-b border-secondary-100 pb-2">
                    <div>
                      <p className="text-body font-medium text-secondary-800">{p.supplier_name}</p>
                      <p className="text-label text-secondary-500">₹{p.amount} - {new Date(p.created_at).toLocaleDateString('mr-IN')}</p>
                    </div>
                    <Button variant="primary" size="sm" onClick={() => handleApprovePayout(p.id)} aria-label={mr.approve}>
                      {mr.approve}
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )}

        {activeTab === 'rates' && (
          <Card elevation="shadow">
            <h2 className="text-body font-primary font-bold text-secondary-800 mb-3">{mr.marketRateManagement}</h2>
            <div className="space-y-3">
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="input-field"
                aria-label={mr.selectDistrict}
              >
                <option value="">{mr.selectDistrict}</option>
                {DISTRICTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={frpRate}
                  onChange={(e) => setFrpRate(e.target.value)}
                  placeholder={mr.frpRatePlaceholder}
                  className="input-field"
                  aria-label="FRP दर"
                />
                <Button variant="primary" onClick={handleUpdateRate} aria-label={mr.update}>
                  {mr.update}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'broadcast' && (
          <Card elevation="shadow">
            <h2 className="text-body font-primary font-bold text-secondary-800 mb-3">{mr.broadcastMessage}</h2>
            <div className="flex flex-wrap gap-2 mb-3">
              {(['all', 'suppliers', 'consumers', 'district'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setBroadcastTarget(t)}
                  className={`px-3 py-2 rounded-full text-label font-primary font-medium min-h-[44px] transition-colors ${
                    broadcastTarget === t ? 'bg-primary-600 text-white' : 'bg-secondary-100 text-secondary-600'
                  }`}
                >
                  {mr[`target_${t}`] || t}
                </button>
              ))}
            </div>
            {broadcastTarget === 'district' && (
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="input-field mb-3"
                aria-label={mr.selectDistrict}
              >
                <option value="">{mr.selectDistrict}</option>
                {DISTRICTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            )}
            <textarea
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              placeholder={mr.broadcastPlaceholder}
              rows={4}
              className="input-field resize-none"
              aria-label={mr.broadcastMessage}
            />
            <Button
              variant="primary"
              fullWidth
              onClick={handleSendBroadcast}
              disabled={!broadcastMessage.trim()}
              className="mt-3"
              aria-label={mr.sendBroadcast}
            >
              {mr.sendBroadcast}
            </Button>
          </Card>
        )}

        {activeTab === 'audit' && (
          <Card elevation="shadow">
            <h2 className="text-body font-primary font-bold text-secondary-800 mb-3">ऑडिट लॉग</h2>
            {auditLog.length === 0 ? (
              <EmptyState icon="history" message="कोणताही ऑडिट लॉग नाही" />
            ) : (
              <ul className="space-y-2">
                {auditLog.map((entry) => (
                  <li key={entry.id} className="flex justify-between items-center border-b border-secondary-100 pb-2 last:border-0">
                    <div>
                      <p className="text-body font-medium text-secondary-800">{entry.action}</p>
                      <p className="text-label text-secondary-500">{entry.table_name}</p>
                    </div>
                    <span className="text-xs text-secondary-400">{new Date(entry.created_at).toLocaleDateString('mr-IN')}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )}
      </main>

      <BottomNav items={NAV_ITEMS} activeTab="overview" onTabChange={() => {}} />
    </div>
  );
}
