import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import type { User } from '../../types';

interface DemoRoleSelectorProps {
  phone: string;
  profile: User;
}

const ROLES = [
  {
    key: 'consumer',
    label: 'शेतकरी',
    emoji: '👨‍🌾',
    desc: 'Water control, AI advisory, savings tracker, pest alerts',
    color: 'border-green-500 bg-green-50',
  },
  {
    key: 'supplier',
    label: 'पुरवठादार',
    emoji: '🏪',
    desc: 'Commission wallet, farmer management, realtime feed, referrals',
    color: 'border-blue-500 bg-blue-50',
  },
  {
    key: 'superadmin',
    label: 'प्रशासक',
    emoji: '🛠',
    desc: 'Platform metrics, payout approvals, market rates, broadcast',
    color: 'border-amber-500 bg-amber-50',
  },
];

export default function DemoRoleSelector({ phone, profile }: DemoRoleSelectorProps) {
  const { setUser, setDemoRole } = useAppStore();
  const navigate = useNavigate();

  const handleRoleSelect = (role: string) => {
    const demoProfile = {
      ...profile,
      role: role as 'consumer' | 'supplier' | 'superadmin',
      name: profile.name || 'Demo User',
    };
    setUser(demoProfile);
    setDemoRole(role);
    
    const dashboard = role === 'superadmin' ? 'admin' : role;
    navigate(`/${dashboard}`);
  };

  return (
    <div className="w-full max-w-sm mx-auto space-y-4">
      <div className="text-center mb-2">
        <h2 className="text-heading font-primary text-primary-700">नमस्कार, {profile.name}!</h2>
        <p className="text-label text-secondary-500 mt-1">डॅशबोर्ड निवडा</p>
      </div>

      {ROLES.map((role) => (
        <button
          key={role.key}
          onClick={() => handleRoleSelect(role.key)}
          className={`w-full text-left p-4 rounded-xl border-2 ${role.color} hover:shadow-md transition-all min-h-[80px]`}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{role.emoji}</span>
            <div>
              <span className="text-body font-primary font-semibold text-secondary-800">{role.label}</span>
              <p className="text-xs text-secondary-500 mt-0.5">{role.desc}</p>
            </div>
          </div>
        </button>
      ))}

      <p className="text-xs text-secondary-400 text-center mt-4">
        Demo Mode — Phone {phone}
      </p>
    </div>
  );
}
