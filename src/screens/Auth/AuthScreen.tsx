import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';
import { sendOTP, verifyOTP, registerConsumer, registerSupplier, updateUserProfile } from '../../lib/auth';
import { getCurrentUser } from '../../lib/supabase';
import { useAppStore } from '../../store/useAppStore';
import { supabase } from '../../lib/supabase';
import { mr } from '../../i18n/marathi';
import type { User } from '../../types';
import { Button, Input } from '../../components';

// ---------- Schemas ----------
const phoneSchema = z.object({
  phone: z.string().length(10, mr.phoneInvalid).regex(/^\d{10}$/, mr.phoneInvalid),
});

const otpSchema = z.object({
  otp: z.string().length(6, mr.otpInvalid).regex(/^\d{6}$/, mr.otpInvalid),
});

const supplierRegSchema = z.object({
  name: z.string().min(2, mr.nameRequired),
  village: z.string().min(2, mr.villageRequired),
  taluka: z.string().min(2, mr.talukaRequired),
  adminCode: z.string().min(4, mr.adminCodeRequired),
  referralCode: z.string().optional(),
});

const consumerRegSchema = z.object({
  name: z.string().min(2, mr.nameRequired),
  village: z.string().min(2, mr.villageRequired),
  taluka: z.string().min(2, mr.talukaRequired),
  supplierPhone: z.string().length(10).regex(/^\d{10}$/, mr.phoneInvalid),
});

type Step =
  | 'phoneEntry'
  | 'otpVerify'
  | 'consentScreen'
  | 'roleSelect'
  | 'supplierRegister'
  | 'consumerRegister';

export default function AuthScreen() {
  const [step, setStep] = useState<Step>('phoneEntry');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [consentGiven, setConsentGiven] = useState(false);
  const [ageGate, setAgeGate] = useState(false);
  const [role, setRole] = useState<'consumer' | 'supplier' | 'superadmin' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setUser } = useAppStore();
  const navigate = useNavigate();

  // Phone form
  const {
    register: regPhone,
    handleSubmit: handlePhoneSubmit,
    formState: { errors: phoneErrors },
  } = useForm({ resolver: zodResolver(phoneSchema) });

  // OTP form
  const {
    register: regOtp,
    handleSubmit: handleOtpSubmit,
    formState: { errors: otpErrors },
  } = useForm({ resolver: zodResolver(otpSchema) });

  // Supplier form
  const {
    register: regSupplier,
    handleSubmit: handleSupplierSubmit,
    formState: { errors: supplierErrors },
  } = useForm({ resolver: zodResolver(supplierRegSchema) });

  // Consumer form
  const {
    register: regConsumer,
    handleSubmit: handleConsumerSubmit,
    formState: { errors: consumerErrors },
  } = useForm({ resolver: zodResolver(consumerRegSchema) });

  const onSendOTP = async (data: { phone: string }) => {
    setLoading(true);
    setError(null);
    try {
      await sendOTP(data.phone);
      setPhoneNumber(data.phone);
      setStep('otpVerify');
    } catch (e) {
      setError(e instanceof Error ? e.message : mr.errorOccurred);
    } finally {
      setLoading(false);
    }
  };

  const onVerifyOTP = async (data: { otp: string }) => {
    setLoading(true);
    setError(null);
    try {
      await verifyOTP(phoneNumber, data.otp);
      const profile = await getCurrentUser() as User | null;
      if (profile && profile.name && profile.role) {
        setUser(profile);
        const dashboard = profile.role === 'superadmin' ? 'admin' : profile.role;
        navigate(`/${dashboard}`);
        return;
      }
      setStep('consentScreen');
    } catch (e) {
      setError(e instanceof Error ? e.message : mr.errorOccurred);
    } finally {
      setLoading(false);
    }
  };

  const onProceedAfterConsent = () => {
    if (!consentGiven) {
      setError(mr.consentRequired);
      return;
    }
    if (!ageGate) {
      setError(mr.ageGateRequired);
      return;
    }
    const session = supabase.auth.getSession();
    session.then(({ data }) => {
      if (data.session?.user) {
        updateUserProfile(data.session.user.id, {
          consent_granted_at: new Date().toISOString(),
        });
      }
    });
    setStep('roleSelect');
  };

  const onRegisterSupplier = async (formData: z.infer<typeof supplierRegSchema>) => {
    setLoading(true);
    setError(null);
    try {
      const { name, village, taluka, adminCode, referralCode } = formData;
      const session = await supabase.auth.getSession();
      const userId = session.data.session?.user?.id || '';
      const user = await registerSupplier(userId, name, village, taluka, 'Kolhapur', adminCode, referralCode);
      setUser(user as unknown as User);
      navigate('/supplier');
    } catch (e) {
      setError(e instanceof Error ? e.message : mr.errorOccurred);
    } finally {
      setLoading(false);
    }
  };

  const onRegisterConsumer = async (formData: z.infer<typeof consumerRegSchema>) => {
    setLoading(true);
    setError(null);
    try {
      const { name, village, taluka, supplierPhone } = formData;
      const session = await supabase.auth.getSession();
      const userId = session.data.session?.user?.id || '';
      const user = await registerConsumer(userId, name, village, taluka, 'Kolhapur', supplierPhone);
      setUser(user as unknown as User);
      navigate('/consumer');
    } catch (e) {
      setError(e instanceof Error ? e.message : mr.errorOccurred);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-surface-100 flex flex-col font-primary">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Logo / Title */}
        <h1 className="text-hero font-primary text-primary-700 mb-8">{mr.appTitle}</h1>

        {/* Error Banner */}
        {error && (
          <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg mb-6 w-full max-w-sm text-center text-label">
            {error}
          </div>
        )}

        {/* Phone Entry */}
        {step === 'phoneEntry' && (
          <form onSubmit={handlePhoneSubmit(onSendOTP)} className="w-full max-w-sm space-y-4">
            <Input
              type="tel"
              label={mr.phoneLabel}
              inputMode="numeric"
              maxLength={10}
              leftAdornment="+91"
              placeholder={mr.phonePlaceholder}
              error={phoneErrors.phone?.message}
              aria-label={mr.phoneLabel}
              {...regPhone('phone')}
            />
            <Button type="submit" variant="primary" fullWidth loading={loading} aria-label={mr.sendOTP}>
              {mr.sendOTP}
            </Button>
          </form>
        )}

        {/* OTP Verify */}
        {step === 'otpVerify' && (
          <form onSubmit={handleOtpSubmit(onVerifyOTP)} className="w-full max-w-sm space-y-4">
            <p className="text-body text-secondary-700 font-primary">
              {mr.otpSent} +91 {phoneNumber}
            </p>
            <Input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder={mr.otpPlaceholder}
              error={otpErrors.otp?.message}
              aria-label="OTP"
              className="text-center tracking-widest"
              {...regOtp('otp')}
            />
            <Button type="submit" variant="primary" fullWidth loading={loading} aria-label={mr.verifyOTP}>
              {mr.verifyOTP}
            </Button>
            <Button type="button" variant="outline" fullWidth onClick={() => setStep('phoneEntry')} aria-label={mr.changeNumber}>
              {mr.changeNumber}
            </Button>
          </form>
        )}

        {/* Consent Screen */}
        {step === 'consentScreen' && (
          <div className="w-full max-w-sm space-y-6">
            <h2 className="text-heading font-primary text-primary-700">{mr.consentTitle}</h2>
            <p className="text-body text-secondary-700 font-primary leading-relaxed whitespace-pre-line">
              {mr.consentText}
            </p>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consentGiven}
                onChange={(e) => setConsentGiven(e.target.checked)}
                className="mt-1 min-w-[20px] min-h-[20px] accent-primary-600"
              />
              <span className="text-label text-secondary-600 font-primary">{mr.consentCheckbox}</span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={ageGate}
                onChange={(e) => setAgeGate(e.target.checked)}
                className="mt-1 min-w-[20px] min-h-[20px] accent-primary-600"
              />
              <span className="text-label text-secondary-600 font-primary">{mr.ageGate}</span>
            </label>
            <Button variant="primary" fullWidth onClick={onProceedAfterConsent} aria-label={mr.continue}>
              {mr.continue}
            </Button>
          </div>
        )}

{/* Role Select */}
        {step === 'roleSelect' && (
          <div className="w-full max-w-sm space-y-4" role="radiogroup" aria-label={mr.selectRole}>
            <h2 className="text-heading font-primary text-primary-700 mb-4">{mr.selectRole}</h2>
            {(['consumer', 'supplier', 'superadmin'] as const).map((r) => (
              <button
                key={r}
                role="radio"
                aria-checked={role === r}
                onClick={() => {
                  setRole(r);
                  if (r === 'consumer') setStep('consumerRegister');
                  else if (r === 'supplier') setStep('supplierRegister');
                  else {
                    setError(mr.adminNotSelfRegister);
                  }
                }}
                className={clsx(
                  'w-full min-h-[56px] rounded-lg border-2 p-4 text-left transition',
                  role === r ? 'border-primary-600 bg-primary-50' : 'border-secondary-200'
                )}
              >
                <span className="text-body font-primary font-semibold text-secondary-800">{mr[`role_${r}`]}</span>
                <p className="text-label text-secondary-500 font-primary mt-1">{mr[`role_${r}_desc`]}</p>
              </button>
            ))}
          </div>
        )}

{/* Supplier Registration */}
        {step === 'supplierRegister' && (
          <form onSubmit={handleSupplierSubmit(onRegisterSupplier)} className="w-full max-w-sm space-y-4">
            <h2 className="text-heading font-primary text-primary-700">{mr.supplierRegister}</h2>
            <Input
              {...regSupplier('name')}
              placeholder={mr.namePlaceholder}
              error={supplierErrors.name?.message}
              label={mr.name}
              aria-label={mr.name}
            />
            <Input
              {...regSupplier('village')}
              placeholder={mr.villagePlaceholder}
              label={mr.village}
              error={supplierErrors.village?.message}
              aria-label={mr.village}
            />
            <Input
              {...regSupplier('taluka')}
              placeholder={mr.talukaPlaceholder}
              label={mr.taluka}
              error={supplierErrors.taluka?.message}
              aria-label={mr.taluka}
            />
            <Input
              {...regSupplier('adminCode')}
              placeholder={mr.adminCodePlaceholder}
              label={mr.adminCode}
              error={supplierErrors.adminCode?.message}
              aria-label={mr.adminCode}
            />
            <Input
              {...regSupplier('referralCode')}
              placeholder={mr.referralPlaceholder}
              label={mr.referralCode}
              aria-label={mr.referralCode}
            />
            <Button type="submit" variant="primary" fullWidth loading={loading} aria-label={mr.completeRegistration}>
              {loading ? mr.loading : mr.completeRegistration}
            </Button>
          </form>
        )}

{/* Consumer Registration */}
        {step === 'consumerRegister' && (
          <form onSubmit={handleConsumerSubmit(onRegisterConsumer)} className="w-full max-w-sm space-y-4">
            <h2 className="text-heading font-primary text-primary-700">{mr.consumerRegister}</h2>
            <Input
              {...regConsumer('name')}
              placeholder={mr.namePlaceholder}
              label={mr.name}
              error={consumerErrors.name?.message}
              aria-label={mr.name}
            />
            <Input
              {...regConsumer('village')}
              placeholder={mr.villagePlaceholder}
              label={mr.village}
              error={consumerErrors.village?.message}
              aria-label={mr.village}
            />
            <Input
              {...regConsumer('taluka')}
              placeholder={mr.talukaPlaceholder}
              label={mr.taluka}
              error={consumerErrors.taluka?.message}
              aria-label={mr.taluka}
            />
            <Input
              {...regConsumer('supplierPhone')}
              placeholder={mr.supplierPhonePlaceholder}
              label={mr.supplierPhone}
              error={consumerErrors.supplierPhone?.message}
              type="tel"
              inputMode="numeric"
              maxLength={10}
              leftAdornment="+91"
              aria-label={mr.supplierPhone}
            />
            <Button type="submit" variant="primary" fullWidth loading={loading} aria-label={mr.completeRegistration}>
              {loading ? mr.loading : mr.completeRegistration}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

// Utility classes used in JSX (would be defined in index.css but represented here as classes)
// .input-field styles are assumed to be: border border-secondary-300 rounded-lg px-4 py-3 text-body outline-none font-primary
// .btn-primary styles: bg-primary-600 hover:bg-primary-700 text-white text-cta font-semibold rounded-lg
