-- =============================================================================
-- JalSheti Pro: 001_initial_schema.sql
-- Complete schema with all 22 tables, constraints, and RLS enable
-- =============================================================================

BEGIN;

-- ===========================================================================
-- 1. users
-- ===========================================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY,
  phone VARCHAR(15) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL DEFAULT '',
  role VARCHAR(20) NOT NULL CHECK (role IN ('superadmin','supplier','consumer')),
  village VARCHAR(100),
  taluka VARCHAR(100),
  district VARCHAR(100) DEFAULT 'Kolhapur',
  referral_code VARCHAR(20) UNIQUE,
  referred_by UUID REFERENCES public.users(id),
  linked_supplier_id UUID REFERENCES public.users(id),
  is_active BOOLEAN DEFAULT true,
  subscription_status VARCHAR(20) DEFAULT 'trial'
    CHECK (subscription_status IN ('trial','active','expired','free','cancelled')),
  trial_ends_at TIMESTAMPTZ,
  consent_granted_at TIMESTAMPTZ,
  acquisition_source VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ===========================================================================
-- 2. fields
-- ===========================================================================
CREATE TABLE IF NOT EXISTS public.fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consumer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES public.users(id),
  field_name VARCHAR(100) DEFAULT 'माझं शेत',
  field_area_acres DECIMAL(5,2) NOT NULL CHECK (field_area_acres > 0),
  village VARCHAR(100),
  soil_type VARCHAR(50),
  sugarcane_variety VARCHAR(50) DEFAULT 'Co86032',
  planting_date DATE NOT NULL CHECK (planting_date <= CURRENT_DATE),
  crop_type VARCHAR(20) DEFAULT 'Suru'
    CHECK (crop_type IN ('Suru','Adsali','Pre-seasonal')),
  is_active BOOLEAN DEFAULT true,
  row_spacing_feet DECIMAL(3,1) DEFAULT 4.0,
  maintenance_tier VARCHAR(20) DEFAULT 'standard'
    CHECK (maintenance_tier IN ('simplified','standard','advanced')),
  intercrop_plan VARCHAR(50),
  fertilizer_schedule JSONB,
  organic_input_events JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (consumer_id)
);

-- ===========================================================================
-- 3. soil_cards
-- ===========================================================================
CREATE TABLE IF NOT EXISTS public.soil_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_id UUID NOT NULL REFERENCES public.fields(id) ON DELETE CASCADE,
  consumer_id UUID NOT NULL REFERENCES public.users(id),
  answers JSONB NOT NULL,
  result JSONB NOT NULL,
  soil_type_detected VARCHAR(50),
  ph_estimate VARCHAR(20),
  nitrogen_level VARCHAR(20),
  water_retention VARCHAR(20),
  fertilizer_recommendations JSONB,
  question_set_version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ===========================================================================
-- 4. water_schedules
-- ===========================================================================
CREATE TABLE IF NOT EXISTS public.water_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID NOT NULL REFERENCES public.users(id),
  consumer_id UUID NOT NULL REFERENCES public.users(id),
  field_id UUID NOT NULL REFERENCES public.fields(id),
  scheduled_date DATE NOT NULL,
  planned_start_time TIME NOT NULL,
  planned_end_time TIME NOT NULL,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'scheduled'
    CHECK (status IN ('scheduled','completed','missed','rescheduled')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ===========================================================================
-- 5. water_sessions
-- ===========================================================================
CREATE TABLE IF NOT EXISTS public.water_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_id UUID NOT NULL REFERENCES public.fields(id),
  consumer_id UUID NOT NULL REFERENCES public.users(id),
  supplier_id UUID NOT NULL REFERENCES public.users(id),
  schedule_id UUID REFERENCES public.water_schedules(id) ON DELETE SET NULL,
  actual_start_time TIMESTAMPTZ,
  actual_stop_time TIMESTAMPTZ,
  duration_minutes INTEGER CHECK (duration_minutes >= 0),
  status VARCHAR(20) DEFAULT 'started'
    CHECK (status IN ('started','completed','cancelled')),
  crop_day_at_session INTEGER,
  growth_stage VARCHAR(30),
  water_sufficiency VARCHAR(20),
  supplier_acknowledged BOOLEAN DEFAULT false,
  advisory_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ===========================================================================
-- 6. crop_advisories
-- ===========================================================================
CREATE TABLE IF NOT EXISTS public.crop_advisories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.water_sessions(id) ON DELETE SET NULL,
  consumer_id UUID NOT NULL REFERENCES public.users(id),
  field_id UUID NOT NULL REFERENCES public.fields(id),
  growth_stage VARCHAR(30) NOT NULL,
  duration_category VARCHAR(20) NOT NULL,
  time_of_day_category VARCHAR(20) NOT NULL,
  advisory_marathi TEXT NOT NULL,
  next_irrigation_date DATE,
  fertilizer_action TEXT,
  fertilizer_brand_suggestions JSONB,
  pest_watch TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ===========================================================================
-- 7. notifications
-- ===========================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID REFERENCES public.users(id),
  to_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(30) NOT NULL
    CHECK (type IN ('water_start','water_stop','pest_alert','weather_alert',
                    'schedule','advisory','payment','referral','system')),
  is_read BOOLEAN DEFAULT false,
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ===========================================================================
-- 8. pest_alerts
-- ===========================================================================
CREATE TABLE IF NOT EXISTS public.pest_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_id UUID NOT NULL REFERENCES public.fields(id),
  consumer_id UUID NOT NULL REFERENCES public.users(id),
  pest_type VARCHAR(50) NOT NULL,
  risk_level VARCHAR(20) NOT NULL CHECK (risk_level IN ('low','medium','high','critical')),
  trigger_reason TEXT,
  weather_data JSONB,
  advisory_marathi TEXT,
  is_acknowledged BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ===========================================================================
-- 9. savings_log
-- ===========================================================================
CREATE TABLE IF NOT EXISTS public.savings_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consumer_id UUID NOT NULL REFERENCES public.users(id),
  field_id UUID REFERENCES public.fields(id),
  amount_saved INTEGER NOT NULL CHECK (amount_saved >= 0),
  reason VARCHAR(100) NOT NULL,
  reason_marathi VARCHAR(200),
  session_id UUID REFERENCES public.water_sessions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ===========================================================================
-- 10. commission_wallet (APPEND-ONLY — no client writes)
-- ===========================================================================
CREATE TABLE IF NOT EXISTS public.commission_wallet (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID NOT NULL REFERENCES public.users(id),
  amount INTEGER NOT NULL CHECK (amount > 0),
  transaction_type VARCHAR(30) NOT NULL
    CHECK (transaction_type IN ('consumer_commission','referral_cashback',
                                 'payout','adjustment')),
  consumer_id UUID REFERENCES public.users(id),
  status VARCHAR(20) DEFAULT 'pending'
    CHECK (status IN ('pending','approved','paid','rejected')),
  notes TEXT,
  approved_by UUID REFERENCES public.users(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ===========================================================================
-- 11. supplier_referrals
-- ===========================================================================
CREATE TABLE IF NOT EXISTS public.supplier_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_supplier_id UUID NOT NULL REFERENCES public.users(id),
  referred_supplier_id UUID NOT NULL REFERENCES public.users(id),
  referral_code_used VARCHAR(20),
  cashback_amount INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending'
    CHECK (status IN ('pending','approved','paid','rejected')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ===========================================================================
-- 12. subscriptions
-- ===========================================================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consumer_id UUID NOT NULL REFERENCES public.users(id),
  razorpay_subscription_id VARCHAR(100),
  razorpay_customer_id VARCHAR(100),
  plan_type VARCHAR(20) DEFAULT 'basic'
    CHECK (plan_type IN ('trial','basic','smart','premium')),
  amount INTEGER NOT NULL CHECK (amount > 0),
  billing_cycle VARCHAR(10) DEFAULT 'monthly',
  status VARCHAR(20) DEFAULT 'pending_first_debit'
    CHECK (status IN ('pending_first_debit','active','paused','expired','cancelled')),
  started_at TIMESTAMPTZ DEFAULT now(),
  next_billing_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ===========================================================================
-- 13. market_rates
-- ===========================================================================
CREATE TABLE IF NOT EXISTS public.market_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  district VARCHAR(100) NOT NULL,
  factory_name VARCHAR(200),
  frp_rate INTEGER,
  factory_opening_date DATE,
  harvest_slot_booking_open BOOLEAN DEFAULT false,
  sugar_recovery_rate DECIMAL(4,2),
  notes_marathi TEXT,
  updated_by UUID REFERENCES public.users(id),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ===========================================================================
-- 14. insurance_claims
-- ===========================================================================
CREATE TABLE IF NOT EXISTS public.insurance_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consumer_id UUID NOT NULL REFERENCES public.users(id),
  field_id UUID NOT NULL REFERENCES public.fields(id),
  damage_type VARCHAR(50),
  damage_description_marathi TEXT,
  photo_urls TEXT[],
  water_session_ids UUID[],
  weather_data_at_damage JSONB,
  crop_stage_at_damage VARCHAR(30),
  claim_amount_requested INTEGER,
  status VARCHAR(20) DEFAULT 'draft'
    CHECK (status IN ('draft','filed','reviewing','approved','rejected','settled')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ===========================================================================
-- 15. weed_identifications
-- ===========================================================================
CREATE TABLE IF NOT EXISTS public.weed_identifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_id UUID NOT NULL REFERENCES public.fields(id),
  consumer_id UUID NOT NULL REFERENCES public.users(id),
  weed_type VARCHAR(20) CHECK (weed_type IN ('grassy','broadleaf','sedge','mixed')),
  weed_size VARCHAR(20) CHECK (weed_size IN ('new','medium','old')),
  crop_day_at_id INTEGER,
  recommendation JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ===========================================================================
-- 16. organic_resources
-- ===========================================================================
CREATE TABLE IF NOT EXISTS public.organic_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consumer_id UUID NOT NULL REFERENCES public.users(id),
  has_cattle BOOLEAN DEFAULT false,
  has_poultry BOOLEAN DEFAULT false,
  has_goat_sheep BOOLEAN DEFAULT false,
  has_biogas_plant BOOLEAN DEFAULT false,
  near_sugar_factory BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ===========================================================================
-- 17. liquid_organic_log
-- ===========================================================================
CREATE TABLE IF NOT EXISTS public.liquid_organic_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_id UUID NOT NULL REFERENCES public.fields(id),
  consumer_id UUID NOT NULL REFERENCES public.users(id),
  product_type VARCHAR(30) CHECK (product_type IN
    ('biogas_slurry','matka_khad','jeevamrut','beejamrut','vermiwash','panchagavya')),
  applied_at TIMESTAMPTZ DEFAULT now(),
  next_due_at TIMESTAMPTZ
);

-- ===========================================================================
-- 18. supplier_assignment_history
-- ===========================================================================
CREATE TABLE IF NOT EXISTS public.supplier_assignment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consumer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  old_supplier_id UUID REFERENCES public.users(id),
  new_supplier_id UUID NOT NULL REFERENCES public.users(id),
  reason VARCHAR(100),
  changed_at TIMESTAMPTZ DEFAULT now()
);

-- ===========================================================================
-- 19. audit_log
-- ===========================================================================
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID NOT NULL REFERENCES public.users(id),
  action VARCHAR(50) NOT NULL,
  table_name VARCHAR(50) NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ===========================================================================
-- 20. engine_feedback
-- ===========================================================================
CREATE TABLE IF NOT EXISTS public.engine_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consumer_id UUID NOT NULL REFERENCES public.users(id),
  field_id UUID REFERENCES public.fields(id),
  engine_type VARCHAR(30) NOT NULL,
  prediction_id UUID,
  was_accurate BOOLEAN,
  farmer_observation TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ===========================================================================
-- 21. job_queue
-- ===========================================================================
CREATE TABLE IF NOT EXISTS public.job_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type VARCHAR(50) NOT NULL,
  payload JSONB,
  status VARCHAR(20) DEFAULT 'pending'
    CHECK (status IN ('pending','processing','completed','failed','dead')),
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  next_retry_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ===========================================================================
-- 22. feature_flags
-- ===========================================================================
CREATE TABLE IF NOT EXISTS public.feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_name VARCHAR(50) UNIQUE NOT NULL,
  rollout_percentage INTEGER DEFAULT 0 CHECK (rollout_percentage BETWEEN 0 AND 100),
  enabled_user_ids UUID[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ===========================================================================
-- ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ===========================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.soil_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.water_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.water_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_advisories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pest_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commission_wallet ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weed_identifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organic_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.liquid_organic_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_assignment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.engine_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- ===========================================================================
-- REALTIME PUBLICATIONS
-- ===========================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.water_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.pest_alerts;

COMMIT;
