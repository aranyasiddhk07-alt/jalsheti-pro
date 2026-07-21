-- =============================================================================
-- JalSheti Pro: 002_auth_trigger.sql
-- Critical: auth.users → public.users linkage via database trigger
-- Fixes the auth/RLS mismatch identified in pre-implementation review
-- =============================================================================

-- 1. Auto-create public.users row when auth.users is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, phone, name, role)
  VALUES (NEW.id, NEW.phone, '', 'consumer');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. Generate unique referral code for suppliers
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TRIGGER AS $$
DECLARE
  code TEXT;
BEGIN
  IF NEW.role = 'supplier' AND NEW.referral_code IS NULL THEN
    LOOP
      code := UPPER(SUBSTRING(MD5(NEW.id::TEXT || clock_timestamp()::TEXT) FROM 1 FOR 8));
      EXIT WHEN NOT EXISTS (SELECT 1 FROM public.users WHERE referral_code = code);
    END LOOP;
    NEW.referral_code := code;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_supplier_referral_code ON public.users;
CREATE TRIGGER tr_supplier_referral_code
  BEFORE INSERT ON public.users
  FOR EACH ROW EXECUTE PROCEDURE public.generate_referral_code();

-- 3. Supplier reassignment with history tracking
CREATE OR REPLACE FUNCTION public.reassign_supplier(
  p_consumer_id UUID,
  p_new_supplier_id UUID,
  p_reason VARCHAR DEFAULT 'consumer_request'
)
RETURNS void AS $$
DECLARE
  v_old_supplier_id UUID;
BEGIN
  SELECT linked_supplier_id INTO v_old_supplier_id
  FROM public.users WHERE id = p_consumer_id;

  IF v_old_supplier_id = p_new_supplier_id THEN
    RAISE EXCEPTION 'Consumer already linked to this supplier';
  END IF;

  -- Update current supplier pointer
  UPDATE public.users
  SET linked_supplier_id = p_new_supplier_id, updated_at = now()
  WHERE id = p_consumer_id;

  -- Record history
  INSERT INTO public.supplier_assignment_history
    (consumer_id, old_supplier_id, new_supplier_id, reason)
  VALUES
    (p_consumer_id, v_old_supplier_id, p_new_supplier_id, p_reason);

  -- Update field references
  UPDATE public.fields
  SET supplier_id = p_new_supplier_id, updated_at = now()
  WHERE consumer_id = p_consumer_id AND is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Update updated_at on user changes
CREATE OR REPLACE FUNCTION public.update_user_modified()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_user_updated ON public.users;
CREATE TRIGGER tr_user_updated
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE PROCEDURE public.update_user_modified();

-- 5. Auto-update updated_at on fields
CREATE OR REPLACE FUNCTION public.update_field_modified()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_field_updated ON public.fields;
CREATE TRIGGER tr_field_updated
  BEFORE UPDATE ON public.fields
  FOR EACH ROW EXECUTE PROCEDURE public.update_field_modified();
