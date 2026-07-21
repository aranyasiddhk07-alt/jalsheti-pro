export interface Database {
  public: {
    Tables: {
      users: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      fields: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      water_sessions: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      water_schedules: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      soil_cards: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      crop_advisories: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      notifications: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      pest_alerts: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      savings_log: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      commission_wallet: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      supplier_referrals: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      subscriptions: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      market_rates: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      insurance_claims: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      weed_identifications: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      organic_resources: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      liquid_organic_log: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      supplier_assignment_history: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      audit_log: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      engine_feedback: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      job_queue: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      feature_flags: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
