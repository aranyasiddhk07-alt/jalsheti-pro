-- =============================================================================
-- JalSheti Pro: 005_materialized_views.sql
-- Pre-computed dashboard aggregations for performance at scale
-- =============================================================================

-- Supplier dashboard view: consumer count, active today, wallet balance
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_supplier_dashboard AS
SELECT
  s.id AS supplier_id,
  s.name AS supplier_name,
  COUNT(DISTINCT c.id) AS consumer_count,
  COUNT(DISTINCT CASE WHEN ws.created_at::date = CURRENT_DATE THEN ws.consumer_id END) AS active_today,
  COALESCE(SUM(cw.amount) FILTER (WHERE cw.status = 'pending'), 0) AS pending_payout,
  COALESCE(SUM(cw.amount) FILTER (WHERE cw.status = 'approved'), 0) AS approved_payout,
  COALESCE(SUM(cw.amount), 0) AS total_earnings
FROM public.users s
LEFT JOIN public.users c ON c.linked_supplier_id = s.id AND c.role = 'consumer' AND c.is_active = true
LEFT JOIN public.water_sessions ws ON ws.supplier_id = s.id AND ws.created_at::date = CURRENT_DATE
LEFT JOIN public.commission_wallet cw ON cw.supplier_id = s.id
WHERE s.role = 'supplier' AND s.is_active = true
GROUP BY s.id, s.name;

-- Consumer savings summary view
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_consumer_savings AS
SELECT
  sl.consumer_id,
  COUNT(*) AS savings_count,
  SUM(sl.amount_saved) AS total_savings
FROM public.savings_log sl
GROUP BY sl.consumer_id;

-- Platform metrics view for admin dashboard
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_platform_metrics AS
SELECT
  COUNT(*) FILTER (WHERE role = 'consumer' AND subscription_status = 'active') AS active_consumers,
  COUNT(*) FILTER (WHERE role = 'consumer' AND subscription_status = 'trial') AS active_trials,
  COUNT(*) FILTER (WHERE role = 'supplier' AND is_active = true) AS active_suppliers,
  COALESCE(SUM(sub.amount) FILTER (WHERE sub.status = 'active'), 0) / 100.0 AS mrr_rupees,
  COUNT(*) FILTER (WHERE role = 'consumer' AND created_at::date = CURRENT_DATE) AS new_consumers_today,
  COUNT(*) FILTER (WHERE role = 'supplier' AND created_at::date = CURRENT_DATE) AS new_suppliers_today
FROM public.users u
LEFT JOIN public.subscriptions sub ON sub.consumer_id = u.id AND sub.status = 'active';

-- Refresh function (called by cron every 5 minutes)
CREATE OR REPLACE FUNCTION public.refresh_materialized_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_supplier_dashboard;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_consumer_savings;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_platform_metrics;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule refresh every 5 minutes via pg_cron (if available)
-- SELECT cron.schedule('refresh-views', '*/5 * * * *', 'SELECT public.refresh_materialized_views()');

-- Unique indexes for CONCURRENTLY refresh support
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_supplier_dashboard_supplier ON mv_supplier_dashboard(supplier_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_consumer_savings_consumer ON mv_consumer_savings(consumer_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_platform_metrics_row ON mv_platform_metrics(active_consumers);
