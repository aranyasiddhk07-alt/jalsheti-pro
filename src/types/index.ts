export type UserRole = "superadmin" | "supplier" | "consumer";
export type SubscriptionStatus = "trial" | "active" | "expired" | "free" | "cancelled";
export type CropType = "Suru" | "Adsali" | "Pre-seasonal";
export type SessionStatus = "started" | "completed" | "cancelled";
export type ScheduleStatus = "scheduled" | "completed" | "missed" | "rescheduled";
export type RiskLevel = "low" | "medium" | "high" | "critical";
export type TransactionType = "consumer_commission" | "referral_cashback" | "payout" | "adjustment";
export type PayoutStatus = "pending" | "approved" | "paid" | "rejected";
export type NotificationType = "water_start" | "water_stop" | "pest_alert" | "weather_alert" | "schedule" | "advisory" | "payment" | "referral" | "system";
export type PlanType = "trial" | "basic" | "smart" | "premium";
export type WeedType = "grassy" | "broadleaf" | "sedge" | "mixed";
export type WeedSize = "new" | "medium" | "old";
export type MaintenanceTier = "simplified" | "standard" | "advanced";
export type OrganicProductType = "biogas_slurry" | "matka_khad" | "jeevamrut" | "beejamrut" | "vermiwash" | "panchagavya";
export type DiseaseKey = "earlyShootBorer" | "redRot" | "smut" | "internodeBorer" | "wilt" | "topBorer";
export type JobStatus = "pending" | "processing" | "completed" | "failed" | "dead";
export type ClaimStatus = "draft" | "filed" | "reviewing" | "approved" | "rejected" | "settled";
export type SubscriptionPlanStatus = "pending_first_debit" | "active" | "paused" | "expired" | "cancelled";

export interface User {
  id: string;
  phone: string;
  name: string;
  role: UserRole;
  village?: string;
  taluka?: string;
  district: string;
  referral_code?: string;
  referred_by?: string;
  linked_supplier_id?: string;
  is_active: boolean;
  subscription_status: SubscriptionStatus;
  trial_ends_at: string;
  acquisition_source?: string;
  consent_granted_at?: string;
  created_at: string;
  updated_at?: string;
}

export interface Field {
  id: string;
  consumer_id: string;
  supplier_id: string;
  field_name: string;
  field_area_acres: number;
  village?: string;
  soil_type?: string;
  sugarcane_variety: string;
  planting_date: string;
  crop_type: CropType;
  is_active: boolean;
  row_spacing_feet: number;
  maintenance_tier: MaintenanceTier;
  intercrop_plan?: string;
  fertilizer_schedule?: Record<string, unknown>;
  organic_input_log?: Record<string, unknown>[];
  created_at: string;
  updated_at?: string;
}

export interface SoilCard {
  id: string;
  field_id: string;
  consumer_id: string;
  answers: number[];
  result: Record<string, string>;
  soil_type_detected: string;
  ph_estimate: string;
  nitrogen_level: string;
  water_retention: string;
  fertilizer_recommendations: Record<string, string>;
  question_set_version: number;
  created_at: string;
}

export interface WaterSchedule {
  id: string;
  supplier_id: string;
  consumer_id: string;
  field_id: string;
  scheduled_date: string;
  planned_start_time: string;
  planned_end_time: string;
  notes?: string;
  status: ScheduleStatus;
  created_at: string;
}

export interface WaterSession {
  id: string;
  field_id: string;
  consumer_id: string;
  supplier_id: string;
  schedule_id?: string;
  actual_start_time?: string;
  actual_stop_time?: string;
  duration_minutes?: number;
  status: SessionStatus;
  crop_day_at_session?: number;
  growth_stage?: string;
  water_sufficiency?: string;
  supplier_acknowledged: boolean;
  advisory_generated: boolean;
  created_at: string;
}

export interface CropAdvisory {
  id: string;
  session_id?: string;
  consumer_id: string;
  field_id: string;
  growth_stage: string;
  duration_category: string;
  time_of_day_category: string;
  advisory_marathi: string;
  next_irrigation_date?: string;
  fertilizer_action?: string;
  fertilizer_brand_suggestions?: Record<string, unknown>;
  pest_watch?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  from_user_id?: string;
  to_user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  data?: Record<string, unknown>;
  created_at: string;
}

export interface PestAlert {
  id: string;
  field_id: string;
  consumer_id: string;
  pest_type: string;
  risk_level: RiskLevel;
  trigger_reason: string;
  weather_data?: Record<string, unknown>;
  advisory_marathi: string;
  is_acknowledged: boolean;
  created_at: string;
}

export interface SavingsLog {
  id: string;
  consumer_id: string;
  field_id?: string;
  amount_saved: number;
  reason: string;
  reason_marathi: string;
  session_id?: string;
  created_at: string;
}

export interface CommissionWallet {
  id: string;
  supplier_id: string;
  amount: number;
  transaction_type: TransactionType;
  consumer_id?: string;
  status: PayoutStatus;
  notes?: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at?: string;
}

export interface SupplierReferral {
  id: string;
  referrer_supplier_id: string;
  referred_supplier_id: string;
  referral_code_used?: string;
  cashback_amount: number;
  status: PayoutStatus;
  created_at: string;
}

export interface Subscription {
  id: string;
  consumer_id: string;
  razorpay_subscription_id?: string;
  razorpay_customer_id?: string;
  plan_type: PlanType;
  amount: number;
  billing_cycle: string;
  status: SubscriptionPlanStatus;
  started_at: string;
  next_billing_at?: string;
  created_at: string;
  updated_at?: string;
}

export interface MarketRate {
  id: string;
  district: string;
  factory_name?: string;
  frp_rate?: number;
  factory_opening_date?: string;
  harvest_slot_booking_open: boolean;
  sugar_recovery_rate?: number;
  notes_marathi?: string;
  updated_by?: string;
  updated_at: string;
}

export interface InsuranceClaim {
  id: string;
  consumer_id: string;
  field_id: string;
  damage_type?: string;
  damage_description_marathi?: string;
  photo_urls?: string[];
  water_session_ids?: string[];
  weather_data_at_damage?: Record<string, unknown>;
  crop_stage_at_damage?: string;
  claim_amount_requested?: number;
  status: ClaimStatus;
  created_at: string;
}

export interface JobQueue {
  id: string;
  job_type: string;
  payload?: Record<string, unknown>;
  status: JobStatus;
  attempts: number;
  max_attempts: number;
  next_retry_at?: string;
  error_message?: string;
  created_at: string;
}

export interface FeatureFlag {
  id: string;
  flag_name: string;
  rollout_percentage: number;
  enabled_user_ids?: string[];
  is_active: boolean;
  created_at: string;
}

export interface WeedIdentification {
  id: string;
  field_id: string;
  consumer_id: string;
  weed_type: WeedType;
  weed_size: WeedSize;
  crop_day_at_id?: number;
  recommendation?: Record<string, unknown>;
  created_at: string;
}

export interface OrganicResources {
  id: string;
  consumer_id: string;
  has_cattle: boolean;
  has_poultry: boolean;
  has_goat_sheep: boolean;
  has_biogas_plant: boolean;
  near_sugar_factory: boolean;
  updated_at: string;
}

export interface LiquidOrganicLog {
  id: string;
  field_id: string;
  consumer_id: string;
  product_type: OrganicProductType;
  applied_at: string;
  next_due_at?: string;
}

export interface SupplierAssignmentHistory {
  id: string;
  consumer_id: string;
  old_supplier_id?: string;
  new_supplier_id: string;
  reason: string;
  changed_at: string;
}

export interface AuditLog {
  id: string;
  actor_id: string;
  action: string;
  table_name: string;
  record_id?: string;
  old_values?: Record<string, unknown>;
  new_values?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface GrowthStage {
  stage: string;
  stageMarathi: string;
  dayNumber: number;
  irrigationIntervalDays: number;
  criticalityLevel: number;
}

export interface FertilizerStage {
  label: string;
  dueAtDay: number;
  windowDays: [number, number];
  ureaKgPerAcre: number;
  dapKgPerAcre: number;
  mopKgPerAcre: number;
  extras: string[];
}

export interface PestRisk {
  pestName: string;
  pestNameMarathi: string;
  riskLevel: RiskLevel;
  advisory: string;
  treatment: string;
  urgency: string;
  confidence: number;
  explanation: string;
}

export interface WeatherData {
  temp: number;
  humidity: number;
  rainfall: number;
  windSpeed: number;
  rainMm48h?: number;
  rainMm24h?: number;
  rainMm?: number;
  rainForecast24h?: number;
  avgTemp?: number;
  daysWithoutIrrigation?: number;
}

export interface EngineFeedback {
  id: string;
  consumer_id: string;
  field_id?: string;
  engine_type: string;
  prediction_id?: string;
  was_accurate?: boolean;
  farmer_observation?: string;
  created_at: string;
}

export const SUBSCRIPTION_PLANS: Record<PlanType, { name: string; amount: number; features: string[] }> = {
  trial: { name: "7-दिवस ट्रायल", amount: 0, features: [] },
  basic: { name: "Basic — ₹99/महिना", amount: 9900, features: ["water_tracking", "marathi_advisory", "tai_voice", "pani_dakhla", "pest_alerts"] },
  smart: { name: "Smart — ₹199/महिना", amount: 19900, features: ["all_basic", "advanced_ai_advisory", "crop_calendar", "yield_tips", "weather_integration"] },
  premium: { name: "Premium — ₹299/महिना", amount: 29900, features: ["all_smart", "photo_diagnosis", "insurance_docs", "priority_support"] },
};

export const COMMISSION_RULES = {
  basic: 20,
  smart: 40,
  premium: 60,
  referralCashbackStages: [
    { count: 5, amount: 150 },
    { count: 10, amount: 200 },
    { count: 15, amount: 250 },
    { count: 20, amount: 400 },
  ],
  minPayoutAmount: 200,
  requiredPaidMonths: 2,
};
