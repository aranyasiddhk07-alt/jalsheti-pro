import { Link } from 'react-router-dom';
import { Button } from '../../components';

const STATS = [
  { value: '9.5M', label: 'Sugarcane Farmers in Maharashtra', icon: '👨‍🌾' },
  { value: '103', label: 'Tests Passing (87 Unit + 16 Integration)', icon: '✅' },
  { value: '11', label: 'AI Engines (Pure TypeScript)', icon: '🧠' },
  { value: '22', label: 'Database Tables (37 Indexes, 31 RLS)', icon: '🗄' },
  { value: '10', label: 'Edge Functions (Deno)', icon: '⚡' },
  { value: '9.3/10', label: 'Production Readiness Score', icon: '🚀' },
];

const FEATURES = [
  { title: 'Marathi-First UI', desc: '100% Marathi interface with Noto Sans Devanagari. Voice-first for non-literate farmers.', icon: '🔤' },
  { title: 'OTP Authentication', desc: '6-digit phone OTP with 5-min expiry. Age-gated consent with DPDP Act compliance.', icon: '🔐' },
  { title: 'Water Control', desc: 'One-tap START/STOP with live elapsed timer. 5-second undo. Works offline.', icon: '💧' },
  { title: 'AI Advisory', desc: 'Growth-stage detection, irrigation scheduling, pest prediction. 6 pests × 15 rules.', icon: '🤖' },
  { title: 'Tai Voice', desc: 'Neural Marathi TTS (mr-IN-AarohiNeural). Auto-plays post-session advisory.', icon: '🎙' },
  { title: 'PWA + Offline', desc: 'Service Worker with 19 precache entries. IndexedDB offline queue. Background sync.', icon: '📱' },
  { title: 'Commission Engine', desc: '20% supplier commission. ₹1000 milestone cashback ladder. Auto-payout at ₹200.', icon: '💰' },
  { title: 'Security-First', desc: 'CSP/HSTS headers. RLS on all 22 tables. Append-only money tables.', icon: '🛡' },
  { title: 'Real-time Dashboard', desc: 'WebSocket Realtime feed for suppliers. 3 channels. Instant water session alerts.', icon: '📡' },
];

const TECH_STACK = [
  { category: 'Frontend', items: 'React 19 · TypeScript 6 · Vite 8 · Tailwind 4 · Zustand · React Router 7' },
  { category: 'Backend', items: 'Supabase · PostgreSQL 15 · Edge Functions (Deno) · pg_cron' },
  { category: 'AI/ML', items: '11 Pure TypeScript Engines · Growth Stage · Pest Warning · Savings · Commission' },
  { category: 'Voice', items: 'Azure Cognitive Services · Neural TTS · mr-IN-AarohiNeural · 24h Cache' },
  { category: 'Payments', items: 'Razorpay UPI · Subscription Mandate · Webhook Verification (HMAC-SHA256)' },
  { category: 'Notifications', items: 'Supabase Realtime · WATI (WhatsApp) · Web Push (FCM)' },
  { category: 'Security', items: 'CSP · HSTS · RLS (31 policies) · Zod Validation · Audit Logs' },
  { category: 'Deployment', items: 'Vercel Edge · GitHub Actions CI/CD · Supabase ap-south-1 (Mumbai)' },
];

const ROADMAP = [
  { phase: 'v1.0 ✅', items: 'Auth · Dashboards · 11 Engines · 10 EFs · PWA · Offline · CI/CD' },
  { phase: 'v1.1 Q3 2026', items: 'Insurance Claims · Govt Schemes · Factory Rates · Auto-Payout' },
  { phase: 'v2.0 Q1 2027', items: 'ML Pest Detection · Soil OCR · Yield Prediction · Speech Commands' },
  { phase: 'Enterprise', items: 'White-Label · Multi-Region · Carbon Credits · Agri-Fintech' },
];

const ARCHITECTURE = [
  { layer: 'Client (PWA)', desc: 'React 19 SPA with lazy routes, Zustand state, IndexedDB offline queue, Workbox Service Worker' },
  { layer: 'Edge (CDN)', desc: 'Vercel Edge Network — CSP/HSTS headers, SPA rewrites, automatic SSL, instant rollback' },
  { layer: 'Edge Functions', desc: '10 Deno functions: advisory, pest-check, razorpay-webhook, tts-proxy, wati-send, job-processor' },
  { layer: 'Database', desc: 'PostgreSQL 15 (ap-south-1) — 22 tables, 37 indexes, 31 RLS policies, 5 triggers, 3 materialized views' },
  { layer: 'External APIs', desc: 'OpenWeatherMap (weather), Azure TTS (voice), Razorpay (payments), WATI (WhatsApp)' },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-surface-bg font-primary">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary-700 via-primary-600 to-primary-900 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold font-primary mb-4">जलशेती प्रो</h1>
          <p className="text-xl md:text-2xl text-primary-100 mb-2 font-primary">JalSheti Pro</p>
          <p className="text-lg text-primary-200 mb-8 max-w-2xl mx-auto">
            Smart Irrigation Management for Maharashtra's 9.5 Million Sugarcane Farmers
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/auth">
              <Button variant="primary" size="lg" className="bg-white !text-primary-700 hover:!bg-primary-50">
                Open App →
              </Button>
            </Link>
            <Link to="/documentation">
              <Button variant="outline" size="lg" className="!border-white !text-white hover:!bg-white/10">
                View Documentation
              </Button>
            </Link>
          </div>
          <div className="mt-8 flex justify-center gap-6 text-sm text-primary-200">
            <a href="https://github.com/aranyasiddhk07-alt/jalsheti-pro" target="_blank" rel="noopener noreferrer" className="hover:text-white underline">GitHub</a>
            <span>·</span>
            <span>Production Ready</span>
            <span>·</span>
            <span>July 2026</span>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-center text-secondary-800 mb-10">Project Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {STATS.map((s) => (
            <div key={s.label} className="bg-surface-card rounded-xl p-4 text-center shadow-md">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-2xl font-bold text-primary-700">{s.value}</div>
              <div className="text-xs text-secondary-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Problem & Solution */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
          <div className="bg-danger-50 rounded-xl p-6 border border-danger-200">
            <h3 className="text-xl font-bold text-danger-800 mb-4">The Problem</h3>
            <ul className="space-y-3 text-sm text-danger-700">
              <li>• 70% of sugarcane acreage uses flood irrigation — 60-70% water waste</li>
              <li>• Farmers water by calendar, not crop stage — over/under irrigation</li>
              <li>• Fertilizer applied on dealer advice, not soil/crop need</li>
              <li>• Pests detected after visible damage — 15-25% crop loss</li>
              <li>• 80% farmers lack real-time agronomic advisory</li>
              <li>• ₹15,000-25,000/acre/year in unrealized savings</li>
            </ul>
          </div>
          <div className="bg-primary-50 rounded-xl p-6 border border-primary-200">
            <h3 className="text-xl font-bold text-primary-800 mb-4">The Solution</h3>
            <ul className="space-y-3 text-sm text-primary-700">
              <li>• AI-powered growth-stage detection with precision irrigation intervals</li>
              <li>• Weather-gated fertilizer scheduling — skip urea during rain</li>
              <li>• 6-pest prediction engine — 7-10 day early warning with Marathi treatment</li>
              <li>• Tai Marathi voice assistant — audible advisory after every water session</li>
              <li>• 20% supplier commission with ₹1000 milestone cashback</li>
              <li>• Offline-first PWA — works without internet in remote villages</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-center text-secondary-800 mb-10">Key Features</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-surface-card rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h4 className="font-bold text-secondary-800 mb-2">{f.title}</h4>
              <p className="text-sm text-secondary-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Architecture */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-secondary-800 mb-10">System Architecture</h2>
          <div className="space-y-3">
            {ARCHITECTURE.map((a, i) => (
              <div key={a.layer} className="flex items-start gap-4 p-4 rounded-xl bg-surface-bg border border-secondary-200">
                <div className="min-w-[40px] h-10 bg-primary-600 text-white rounded-lg flex items-center justify-center font-bold text-sm">{i + 1}</div>
                <div>
                  <h4 className="font-bold text-secondary-800">{a.layer}</h4>
                  <p className="text-sm text-secondary-500">{a.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-center text-secondary-800 mb-10">Technology Stack</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {TECH_STACK.map((t) => (
            <div key={t.category} className="bg-surface-card rounded-xl p-4 shadow-md border border-secondary-200">
              <h4 className="text-sm font-bold text-primary-700 mb-1">{t.category}</h4>
              <p className="text-xs text-secondary-500">{t.items}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Roadmap */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-secondary-800 mb-10">Product Roadmap</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {ROADMAP.map((r) => (
              <div key={r.phase} className="bg-surface-bg rounded-xl p-5 border border-secondary-200">
                <h4 className="font-bold text-primary-700 mb-3">{r.phase}</h4>
                <p className="text-xs text-secondary-500 leading-relaxed">{r.items}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Deployment Status */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-center text-secondary-800 mb-10">Deployment Status</h2>
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { label: 'Frontend', status: '🟢 Live', url: 'https://jalsheti-pro.vercel.app' },
            { label: 'Database', status: '🟢 Live', url: 'ap-south-1 (Mumbai)' },
            { label: 'Edge Functions', status: '🟢 10/10 Deployed', url: 'All responding' },
            { label: 'GitHub', status: '🟢 Active', url: 'aranyasiddhk07-alt/jalsheti-pro' },
          ].map((d) => (
            <div key={d.label} className="bg-surface-card rounded-xl p-4 text-center shadow-md">
              <div className="text-lg font-bold text-primary-700">{d.status}</div>
              <div className="text-sm font-semibold text-secondary-800 mt-1">{d.label}</div>
              <div className="text-xs text-secondary-500 mt-1">{d.url}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary-900 text-primary-200 py-12 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-xl font-bold text-white mb-2">जलशेती प्रो</h3>
          <p className="text-sm mb-6">Smart Irrigation Management for Maharashtra's Sugarcane Farmers</p>
          <div className="flex justify-center gap-6 text-sm">
            <a href="https://github.com/aranyasiddhk07-alt/jalsheti-pro" className="hover:text-white">GitHub</a>
            <Link to="/documentation" className="hover:text-white">Documentation</Link>
            <Link to="/auth" className="hover:text-white">Open App</Link>
          </div>
          <p className="text-xs mt-8 text-primary-400">© 2026 JalSheti Pro. Built with ♥ for Maharashtra's farmers.</p>
        </div>
      </footer>
    </div>
  );
}
