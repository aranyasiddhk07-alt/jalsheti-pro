-- =============================================================================
-- JalSheti Pro: 003_indexes.sql
-- Performance-critical indexes for hot query paths
-- =============================================================================

-- Users
CREATE INDEX IF NOT EXISTS idx_users_linked_supplier ON public.users(linked_supplier_id) WHERE linked_supplier_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON public.users(referral_code) WHERE referral_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_phone ON public.users(phone);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- Fields
CREATE INDEX IF NOT EXISTS idx_fields_consumer ON public.fields(consumer_id);
CREATE INDEX IF NOT EXISTS idx_fields_supplier ON public.fields(supplier_id);

-- Water sessions (highest-traffic table)
CREATE INDEX IF NOT EXISTS idx_water_sessions_field_date ON public.water_sessions(field_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_water_sessions_supplier_date ON public.water_sessions(supplier_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_water_sessions_consumer_date ON public.water_sessions(consumer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_water_sessions_status ON public.water_sessions(status) WHERE status = 'started';

-- Water schedules
CREATE INDEX IF NOT EXISTS idx_water_schedules_consumer_date ON public.water_schedules(consumer_id, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_water_schedules_supplier ON public.water_schedules(supplier_id);

-- Notifications (high-traffic)
CREATE INDEX IF NOT EXISTS idx_notifications_to_user_unread ON public.notifications(to_user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_to_user_created ON public.notifications(to_user_id, created_at DESC);

-- Pest alerts
CREATE INDEX IF NOT EXISTS idx_pest_alerts_field_created ON public.pest_alerts(field_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pest_alerts_consumer_created ON public.pest_alerts(consumer_id, created_at DESC);

-- Savings log
CREATE INDEX IF NOT EXISTS idx_savings_log_consumer ON public.savings_log(consumer_id);

-- Commission wallet
CREATE INDEX IF NOT EXISTS idx_commission_wallet_supplier ON public.commission_wallet(supplier_id);
CREATE INDEX IF NOT EXISTS idx_commission_wallet_status ON public.commission_wallet(supplier_id, status);
CREATE INDEX IF NOT EXISTS idx_commission_wallet_created ON public.commission_wallet(supplier_id, created_at DESC);

-- Subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_consumer ON public.subscriptions(consumer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_razorpay ON public.subscriptions(razorpay_subscription_id) WHERE razorpay_subscription_id IS NOT NULL;

-- Market rates
CREATE INDEX IF NOT EXISTS idx_market_rates_district ON public.market_rates(district);

-- Insurance claims
CREATE INDEX IF NOT EXISTS idx_insurance_claims_consumer ON public.insurance_claims(consumer_id);

-- Weed identifications
CREATE INDEX IF NOT EXISTS idx_weed_identifications_field ON public.weed_identifications(field_id);

-- Organic resources
CREATE INDEX IF NOT EXISTS idx_organic_resources_consumer ON public.organic_resources(consumer_id);

-- Liquid organic log
CREATE INDEX IF NOT EXISTS idx_liquid_organic_log_field ON public.liquid_organic_log(field_id);
CREATE INDEX IF NOT EXISTS idx_liquid_organic_log_consumer ON public.liquid_organic_log(consumer_id);

-- Audit log
CREATE INDEX IF NOT EXISTS idx_audit_log_actor ON public.audit_log(actor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_table_record ON public.audit_log(table_name, record_id);

-- Engine feedback
CREATE INDEX IF NOT EXISTS idx_engine_feedback_consumer ON public.engine_feedback(consumer_id);
CREATE INDEX IF NOT EXISTS idx_engine_feedback_engine ON public.engine_feedback(engine_type, created_at DESC);

-- Job queue
CREATE INDEX IF NOT EXISTS idx_job_queue_status_next ON public.job_queue(status, next_retry_at) WHERE status = 'pending';

-- Crop advisories
CREATE INDEX IF NOT EXISTS idx_crop_advisories_consumer ON public.crop_advisories(consumer_id, created_at DESC);

-- Supplier referrals
CREATE INDEX IF NOT EXISTS idx_supplier_referrals_referrer ON public.supplier_referrals(referrer_supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_referrals_referred ON public.supplier_referrals(referred_supplier_id);

-- Supplier assignment history
CREATE INDEX IF NOT EXISTS idx_supplier_assignment_history_consumer ON public.supplier_assignment_history(consumer_id, changed_at DESC);
