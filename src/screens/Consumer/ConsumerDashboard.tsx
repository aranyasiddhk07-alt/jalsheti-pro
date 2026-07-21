import { useEffect, useState, useCallback, useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { waterService } from '../../services/waterService';
import { advisoryService } from '../../services/advisoryService';
import { fieldService } from '../../services/fieldService';
import { taiVoiceService } from '../../services/taiVoiceService';
import { getGrowthStage } from '../../engines/crop/cropIntelligence';
import { mr } from '../../i18n/marathi';
import { Button, Card, Header, BottomNav, SkeletonDashboard, ErrorState, EmptyState, OfflineBanner } from '../../components';

interface SessionData {
  id: string;
  status: string;
  actual_start_time: string;
}

interface AdvisoryData {
  id: string;
  advisory_marathi: string;
}

interface PestAlertData {
  id: string;
  pest_type: string;
  risk_level: string;
}

interface FieldData {
  id: string;
  field_area_acres: number;
  sugarcane_variety: string;
  planting_date: string;
  crop_type: string;
  row_spacing_feet: number;
}

const NAV_ITEMS = [
  { key: 'home', label: 'होम', icon: 'home' },
  { key: 'calendar', label: 'वेळापत्रक', icon: 'calendar' },
  { key: 'history', label: 'इतिहास', icon: 'history' },
  { key: 'schemes', label: 'योजना', icon: 'schemes' },
  { key: 'profile', label: 'प्रोफाइल', icon: 'profile' },
];

export default function ConsumerDashboard() {
  const { currentUser, isOnline } = useAppStore();
  const [session, setSession] = useState<SessionData | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [timerId, setTimerId] = useState<ReturnType<typeof setInterval> | null>(null);
  const [advisory, setAdvisory] = useState<AdvisoryData | null>(null);
  const [field, setField] = useState<FieldData | null>(null);
  const [alerts, setAlerts] = useState<PestAlertData[]>([]);
  const [savingsTotal, setSavingsTotal] = useState(0);
  const [savingsLast, setSavingsLast] = useState({ amount: 0, reason: '' });
  const [showFertilizer, setShowFertilizer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUndo, setShowUndo] = useState(false);
  const [undoTimer, setUndoTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [activeTab, setActiveTab] = useState('home');

  const growthStage = useMemo(() => {
    if (!field?.planting_date) return null;
    return getGrowthStage(new Date(field.planting_date));
  }, [field]);

  const startTimer = useCallback(() => {
    setTimerId((prev) => {
      if (prev) clearInterval(prev);
      return setInterval(() => setElapsed((p) => p + 1), 1000);
    });
  }, []);

  const stopTimer = useCallback(() => {
    setTimerId((prev) => {
      if (prev) clearInterval(prev);
      return null;
    });
  }, []);

  const fetchDashboardData = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    setError(null);
    try {
      const fieldData = await fieldService.getField(currentUser.id);
      if (fieldData) setField(fieldData as unknown as FieldData);

      const activeSession = await waterService.getActiveSession(fieldData?.id || '');
      if (activeSession) {
        setSession(activeSession as unknown as SessionData);
        const diff = Math.floor((Date.now() - new Date(activeSession.actual_start_time!).getTime()) / 1000);
        setElapsed(diff);
        startTimer();
      }

      const latestAdvisory = await advisoryService.getLatestAdvisory(currentUser.id);
      if (latestAdvisory) setAdvisory(latestAdvisory as unknown as AdvisoryData);

      if (fieldData) {
        const pestAlerts = await advisoryService.getActivePestAlerts(fieldData.id);
        setAlerts(pestAlerts as unknown as PestAlertData[]);
      }

      const { data: savingsLog } = await import('../../lib/supabase').then(m =>
        m.supabase.from('savings_log').select('amount_saved, reason').eq('consumer_id', currentUser.id).order('created_at', { ascending: false }).limit(1)
      );
      const total = savingsLog?.reduce((sum, r) => sum + (r.amount_saved as number), 0) ?? 0;
      setSavingsTotal(total);
      if (savingsLog?.[0]) {
        setSavingsLast({ amount: savingsLog[0].amount_saved as number, reason: savingsLog[0].reason as string });
      }

      if (growthStage) {
        const day = growthStage.dayNumber;
        setShowFertilizer(day >= 30 && day <= 45);
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(mr.errorOccurred);
    } finally {
      setLoading(false);
    }
  }, [currentUser, growthStage, startTimer]);

  useEffect(() => {
    if (!currentUser) return;
    fetchDashboardData();
  }, [currentUser, fetchDashboardData]);

  useEffect(() => {
    return () => { if (timerId) clearInterval(timerId); };
  }, [timerId]);

  useEffect(() => {
    return () => { if (undoTimer) clearTimeout(undoTimer); };
  }, [undoTimer]);

  const startWater = async () => {
    if (!currentUser || !field) return;
    try {
      const newSession = await waterService.startWaterSession(field.id, currentUser.id, currentUser.linked_supplier_id || '');
      if (newSession) {
        setSession(newSession as unknown as SessionData);
        setElapsed(0);
        startTimer();
      }
    } catch {
      setError(mr.errorOccurred);
    }
  };

  const stopWater = async () => {
    if (!session) return;
    const sessionId = session.id;
    setShowUndo(true);
    const undoId = setTimeout(() => setShowUndo(false), 5000);
    setUndoTimer(undoId);
    try {
      await waterService.stopWaterSession(sessionId);
      setSession(null);
      stopTimer();
      setElapsed(0);
      await fetchDashboardData();
    } catch {
      setError(mr.errorOccurred);
      setShowUndo(false);
    }
  };

  const playTaiVoice = async () => {
    if (!advisory || !currentUser) return;
    try {
      const url = await taiVoiceService.playTaiVoice(advisory.advisory_marathi);
      if (url) {
        const audio = new Audio(url);
        audio.play().catch(() => setError(mr.errorOccurred));
      }
    } catch {
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

  if (error && !field) {
    return (
      <div className="min-h-screen bg-surface-bg flex items-center justify-center">
        <ErrorState message={error} onRetry={fetchDashboardData} />
      </div>
    );
  }

  const greeting = getGreeting();

  return (
    <div className="min-h-screen bg-surface-bg font-primary pb-24">
      <OfflineBanner />
      <Header
        title={`${greeting}, ${currentUser?.name} काका!`}
        subtitle={field && growthStage ? `${growthStage.stageMarathi} - ${growthStage.dayNumber} दिवस` : mr.noFieldLinked}
        unreadCount={alerts.length}
        isOnline={isOnline}
      />

      <main className="px-4 mt-4 space-y-4" role="main">
        {!field && (
          <Card elevation="shadow">
            <EmptyState
              icon="field"
              message={mr.noFieldLinked}
              ctaLabel="शेत सेटअप करा"
              onCtaClick={() => { window.location.href = '/consumer/field-setup'; }}
            />
          </Card>
        )}

        <Card elevation="shadow" aria-label={mr.waterControl}>
          <h2 className="text-heading font-primary font-bold text-secondary-800 mb-3">{mr.waterControl}</h2>
          {session ? (
            <div className="text-center">
              <div className="text-hero font-primary font-bold text-primary-600 mb-2" role="timer" aria-label={`${elapsed} सेकंद`}>
                {formatTime(elapsed)}
              </div>
              <p className="text-label text-secondary-500 mb-4">{mr.waterRunning}</p>
              <Button variant="danger" fullWidth onClick={stopWater} aria-label={mr.stopWater} className="pulse-water">
                {mr.stopWater}
              </Button>
              {showUndo && (
                <button
                  onClick={() => { setShowUndo(false); if (undoTimer) clearTimeout(undoTimer); }}
                  className="mt-2 text-sm text-secondary-500 underline min-h-[44px]"
                  aria-label="रद्द करा"
                >
                  रद्द करा
                </button>
              )}
            </div>
          ) : (
            <Button variant="primary" fullWidth onClick={startWater} aria-label={mr.startWater}>
              {mr.startWater}
            </Button>
          )}
        </Card>

        {advisory && (
          <Button variant="outline" fullWidth onClick={playTaiVoice} aria-label={mr.taiVoice}>
            <span className="flex items-center justify-center gap-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
              {mr.taiVoice}
            </span>
          </Button>
        )}

        <Card className="bg-gradient-to-br from-primary-500 to-primary-600 text-white" aria-label={mr.savingsTitle}>
          <h3 className="text-heading font-primary font-bold">{mr.savingsTitle}</h3>
          <div className="mt-2">
            <span className="text-hero font-bold">₹{savingsTotal}</span>
            <p className="text-label opacity-80">{mr.totalSavings}</p>
          </div>
          {savingsLast.reason && (
            <div className="mt-2 bg-white/20 rounded-lg p-3">
              <p className="text-sm">{savingsLast.reason}</p>
              <span className="text-xs opacity-70">+₹{savingsLast.amount}</span>
            </div>
          )}
        </Card>

        {showFertilizer && growthStage && (
          <Card className="bg-amber-50 border border-amber-200" aria-label={mr.fertilizerWindow}>
            <h3 className="text-body font-primary font-bold text-amber-800">{mr.fertilizerWindow}</h3>
            <p className="text-label text-amber-600 mt-1">{mr.fertilizerAdvice}</p>
          </Card>
        )}

        {alerts.length > 0 && (
          <Card className="bg-danger-50 border border-danger-200" aria-label={mr.pestAlert}>
            <h3 className="text-body font-primary font-bold text-danger-800">{mr.pestAlert}</h3>
            {alerts.map((alert) => (
              <p key={alert.id} className="text-label text-danger-600 mt-1">
                {alert.pest_type} - {String(mr[`severity_${alert.risk_level}` as keyof typeof mr] || alert.risk_level)}
              </p>
            ))}
          </Card>
        )}

        {field && growthStage && (
          <Card elevation="shadow" aria-label="पीक माहिती">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-label text-secondary-500">{mr.cropDay}</span>
                <p className="text-heading font-bold text-secondary-800">{growthStage.dayNumber}</p>
              </div>
              <div>
                <span className="text-label text-secondary-500">{mr.nextIrrigation}</span>
                <p className="text-body font-semibold text-primary-600">{mr.notScheduled}</p>
              </div>
            </div>
          </Card>
        )}
      </main>

      <BottomNav items={NAV_ITEMS} activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );

  function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return mr.greeting;
    if (hour < 17) return mr.greeting;
    return mr.greeting;
  }
}

function formatTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
