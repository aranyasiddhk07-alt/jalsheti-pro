-- =============================================================================
-- JalSheti Pro: 004_rls_policies.sql
-- Complete Row Level Security policies for all 22 tables
-- Design principle: money tables are Edge Function write only, never client
-- =============================================================================

-- ===========================================================================
-- USERS
-- ===========================================================================
CREATE POLICY "Users see own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Supplier sees linked consumers" ON public.users
  FOR SELECT USING (
    linked_supplier_id = auth.uid()
    AND role = 'consumer'
  );

-- ===========================================================================
-- FIELDS
-- ===========================================================================
CREATE POLICY "Consumer manages own fields" ON public.fields
  FOR ALL USING (consumer_id = auth.uid());

CREATE POLICY "Supplier sees linked consumer fields" ON public.fields
  FOR SELECT USING (supplier_id = auth.uid());

-- ===========================================================================
-- SOIL CARDS
-- ===========================================================================
CREATE POLICY "Consumer manages own soil cards" ON public.soil_cards
  FOR ALL USING (consumer_id = auth.uid());

-- ===========================================================================
-- WATER SCHEDULES
-- ===========================================================================
CREATE POLICY "Supplier manages own schedules" ON public.water_schedules
  FOR ALL USING (supplier_id = auth.uid());

CREATE POLICY "Consumer sees own schedules" ON public.water_schedules
  FOR SELECT USING (consumer_id = auth.uid());

-- ===========================================================================
-- WATER SESSIONS
-- ===========================================================================
CREATE POLICY "Consumer manages own sessions" ON public.water_sessions
  FOR ALL USING (consumer_id = auth.uid());

CREATE POLICY "Supplier sees and acknowledges consumer sessions" ON public.water_sessions
  FOR SELECT USING (supplier_id = auth.uid());

CREATE POLICY "Supplier acknowledges sessions" ON public.water_sessions
  FOR UPDATE USING (supplier_id = auth.uid())
  WITH CHECK (supplier_id = auth.uid());

-- ===========================================================================
-- CROP ADVISORIES
-- ===========================================================================
CREATE POLICY "Consumer sees own advisories" ON public.crop_advisories
  FOR SELECT USING (consumer_id = auth.uid());

-- ===========================================================================
-- NOTIFICATIONS
-- ===========================================================================
CREATE POLICY "User manages own notifications" ON public.notifications
  FOR ALL USING (to_user_id = auth.uid());

CREATE POLICY "System inserts notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

-- ===========================================================================
-- PEST ALERTS
-- ===========================================================================
CREATE POLICY "Consumer sees own pest alerts" ON public.pest_alerts
  FOR SELECT USING (consumer_id = auth.uid());

CREATE POLICY "Consumer acknowledges alerts" ON public.pest_alerts
  FOR UPDATE USING (consumer_id = auth.uid())
  WITH CHECK (consumer_id = auth.uid());

-- ===========================================================================
-- SAVINGS LOG
-- ===========================================================================
CREATE POLICY "Consumer sees own savings" ON public.savings_log
  FOR SELECT USING (consumer_id = auth.uid());

-- ===========================================================================
-- COMMISSION WALLET (MONEY TABLE — NO CLIENT WRITES)
-- ===========================================================================
CREATE POLICY "Supplier sees own wallet" ON public.commission_wallet
  FOR SELECT USING (supplier_id = auth.uid());

-- NOTE: No INSERT/UPDATE/DELETE policies for clients.
-- All writes happen via Edge Functions with service_role key.
-- If RLS-enabled tables have no INSERT policy, the default is DENY.
-- This is intentional and documented in ARCHITECTURE.md.

-- ===========================================================================
-- SUPPLIER REFERRALS
-- ===========================================================================
CREATE POLICY "Supplier sees own referrals" ON public.supplier_referrals
  FOR SELECT USING (
    referrer_supplier_id = auth.uid()
    OR referred_supplier_id = auth.uid()
  );

-- ===========================================================================
-- SUBSCRIPTIONS (MONEY TABLE — NO CLIENT WRITES)
-- ===========================================================================
CREATE POLICY "Consumer sees own subscription" ON public.subscriptions
  FOR SELECT USING (consumer_id = auth.uid());

-- NOTE: No INSERT/UPDATE/DELETE. Writes via razorpay-webhook Edge Function only.

-- ===========================================================================
-- MARKET RATES
-- ===========================================================================
CREATE POLICY "Authenticated users see market rates" ON public.market_rates
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin manages market rates" ON public.market_rates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

-- ===========================================================================
-- INSURANCE CLAIMS
-- ===========================================================================
CREATE POLICY "Consumer manages own claims" ON public.insurance_claims
  FOR ALL USING (consumer_id = auth.uid());

-- ===========================================================================
-- WEED IDENTIFICATIONS
-- ===========================================================================
CREATE POLICY "Consumer manages own weed records" ON public.weed_identifications
  FOR ALL USING (consumer_id = auth.uid());

-- ===========================================================================
-- ORGANIC RESOURCES
-- ===========================================================================
CREATE POLICY "Consumer manages own organic resources" ON public.organic_resources
  FOR ALL USING (consumer_id = auth.uid());

-- ===========================================================================
-- LIQUID ORGANIC LOG
-- ===========================================================================
CREATE POLICY "Consumer manages own liquid organic log" ON public.liquid_organic_log
  FOR ALL USING (consumer_id = auth.uid());

-- ===========================================================================
-- SUPPLIER ASSIGNMENT HISTORY
-- ===========================================================================
CREATE POLICY "Consumer sees own assignment history" ON public.supplier_assignment_history
  FOR SELECT USING (consumer_id = auth.uid());

CREATE POLICY "Supplier sees assignments they are involved in" ON public.supplier_assignment_history
  FOR SELECT USING (
    old_supplier_id = auth.uid()
    OR new_supplier_id = auth.uid()
  );

-- ===========================================================================
-- AUDIT LOG (READ ONLY — ADMIN ONLY)
-- ===========================================================================
CREATE POLICY "Admin sees audit log" ON public.audit_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

-- ===========================================================================
-- ENGINE FEEDBACK
-- ===========================================================================
CREATE POLICY "Consumer manages own feedback" ON public.engine_feedback
  FOR ALL USING (consumer_id = auth.uid());

-- ===========================================================================
-- JOB QUEUE (NO CLIENT ACCESS)
-- ===========================================================================
-- No policies = DENY all client access. Only Edge Functions with service_role.

-- ===========================================================================
-- FEATURE FLAGS
-- ===========================================================================
CREATE POLICY "Authenticated users see feature flags" ON public.feature_flags
  FOR SELECT USING (auth.role() = 'authenticated');

-- ===========================================================================
-- STORAGE BUCKET POLICIES
-- ===========================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('insurance-photos', 'insurance-photos', false, 10485760, ARRAY['image/jpeg','image/png','image/webp']),
  ('crop-diagnosis', 'crop-diagnosis', false, 10485760, ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Insurance photos: only the owner can upload and view
CREATE POLICY "Consumer uploads insurance photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'insurance-photos'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

CREATE POLICY "Consumer views own insurance photos" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'insurance-photos'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );

-- Crop diagnosis photos: owner-only upload/view
CREATE POLICY "Consumer uploads crop diagnosis photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'crop-diagnosis'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

CREATE POLICY "Consumer views own crop diagnosis photos" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'crop-diagnosis'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );
