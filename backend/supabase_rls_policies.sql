-- ============================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE trading_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_legs ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_screenshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE playbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE broker_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE backtest_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE backtest_trades ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- BACKEND uses a direct DB connection (service role / postgres)
-- which BYPASSES RLS automatically.
-- These policies protect against direct Supabase API access.
-- ============================================================

-- DROP old policies if re-running
DO $$ DECLARE r RECORD;
BEGIN
  FOR r IN SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

-- ============================================================
-- users: only the user themselves can read/update
-- ============================================================
CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (id::text = auth.uid()::text);

CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (id::text = auth.uid()::text);

-- ============================================================
-- trading_accounts: only owner
-- ============================================================
CREATE POLICY "trading_accounts_select_own" ON trading_accounts
  FOR SELECT USING (user_id::text = auth.uid()::text);

CREATE POLICY "trading_accounts_insert_own" ON trading_accounts
  FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY "trading_accounts_update_own" ON trading_accounts
  FOR UPDATE USING (user_id::text = auth.uid()::text);

CREATE POLICY "trading_accounts_delete_own" ON trading_accounts
  FOR DELETE USING (user_id::text = auth.uid()::text);

-- ============================================================
-- trades: only owner
-- ============================================================
CREATE POLICY "trades_select_own" ON trades
  FOR SELECT USING (user_id::text = auth.uid()::text);

CREATE POLICY "trades_insert_own" ON trades
  FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY "trades_update_own" ON trades
  FOR UPDATE USING (user_id::text = auth.uid()::text);

CREATE POLICY "trades_delete_own" ON trades
  FOR DELETE USING (user_id::text = auth.uid()::text);

-- ============================================================
-- trade_legs: via trade ownership
-- ============================================================
CREATE POLICY "trade_legs_select_own" ON trade_legs
  FOR SELECT USING (
    trade_id IN (SELECT id FROM trades WHERE user_id::text = auth.uid()::text)
  );

CREATE POLICY "trade_legs_insert_own" ON trade_legs
  FOR INSERT WITH CHECK (
    trade_id IN (SELECT id FROM trades WHERE user_id::text = auth.uid()::text)
  );

CREATE POLICY "trade_legs_update_own" ON trade_legs
  FOR UPDATE USING (
    trade_id IN (SELECT id FROM trades WHERE user_id::text = auth.uid()::text)
  );

CREATE POLICY "trade_legs_delete_own" ON trade_legs
  FOR DELETE USING (
    trade_id IN (SELECT id FROM trades WHERE user_id::text = auth.uid()::text)
  );

-- ============================================================
-- trade_tags: via trade ownership
-- ============================================================
CREATE POLICY "trade_tags_select_own" ON trade_tags
  FOR SELECT USING (
    trade_id IN (SELECT id FROM trades WHERE user_id::text = auth.uid()::text)
  );

CREATE POLICY "trade_tags_insert_own" ON trade_tags
  FOR INSERT WITH CHECK (
    trade_id IN (SELECT id FROM trades WHERE user_id::text = auth.uid()::text)
  );

CREATE POLICY "trade_tags_delete_own" ON trade_tags
  FOR DELETE USING (
    trade_id IN (SELECT id FROM trades WHERE user_id::text = auth.uid()::text)
  );

-- ============================================================
-- trade_screenshots: via trade ownership
-- ============================================================
CREATE POLICY "trade_screenshots_select_own" ON trade_screenshots
  FOR SELECT USING (
    trade_id IN (SELECT id FROM trades WHERE user_id::text = auth.uid()::text)
  );

CREATE POLICY "trade_screenshots_insert_own" ON trade_screenshots
  FOR INSERT WITH CHECK (
    trade_id IN (SELECT id FROM trades WHERE user_id::text = auth.uid()::text)
  );

CREATE POLICY "trade_screenshots_delete_own" ON trade_screenshots
  FOR DELETE USING (
    trade_id IN (SELECT id FROM trades WHERE user_id::text = auth.uid()::text)
  );

-- ============================================================
-- tags: only owner
-- ============================================================
CREATE POLICY "tags_select_own" ON tags
  FOR SELECT USING (user_id::text = auth.uid()::text);

CREATE POLICY "tags_insert_own" ON tags
  FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY "tags_update_own" ON tags
  FOR UPDATE USING (user_id::text = auth.uid()::text);

CREATE POLICY "tags_delete_own" ON tags
  FOR DELETE USING (user_id::text = auth.uid()::text);

-- ============================================================
-- journal_notes: only owner
-- ============================================================
CREATE POLICY "journal_notes_select_own" ON journal_notes
  FOR SELECT USING (user_id::text = auth.uid()::text);

CREATE POLICY "journal_notes_insert_own" ON journal_notes
  FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY "journal_notes_update_own" ON journal_notes
  FOR UPDATE USING (user_id::text = auth.uid()::text);

CREATE POLICY "journal_notes_delete_own" ON journal_notes
  FOR DELETE USING (user_id::text = auth.uid()::text);

-- ============================================================
-- playbooks: owner only (public ones readable by all)
-- ============================================================
CREATE POLICY "playbooks_select_own" ON playbooks
  FOR SELECT USING (user_id::text = auth.uid()::text OR is_public = true);

CREATE POLICY "playbooks_insert_own" ON playbooks
  FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY "playbooks_update_own" ON playbooks
  FOR UPDATE USING (user_id::text = auth.uid()::text);

CREATE POLICY "playbooks_delete_own" ON playbooks
  FOR DELETE USING (user_id::text = auth.uid()::text);

-- ============================================================
-- ai_insights: only owner
-- ============================================================
CREATE POLICY "ai_insights_select_own" ON ai_insights
  FOR SELECT USING (user_id::text = auth.uid()::text);

-- ============================================================
-- ai_reports: only owner
-- ============================================================
CREATE POLICY "ai_reports_select_own" ON ai_reports
  FOR SELECT USING (user_id::text = auth.uid()::text);

-- ============================================================
-- subscriptions: only owner
-- ============================================================
CREATE POLICY "subscriptions_select_own" ON subscriptions
  FOR SELECT USING (user_id::text = auth.uid()::text);

-- ============================================================
-- broker_connections: only owner
-- ============================================================
CREATE POLICY "broker_connections_select_own" ON broker_connections
  FOR SELECT USING (user_id::text = auth.uid()::text);

CREATE POLICY "broker_connections_insert_own" ON broker_connections
  FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY "broker_connections_update_own" ON broker_connections
  FOR UPDATE USING (user_id::text = auth.uid()::text);

CREATE POLICY "broker_connections_delete_own" ON broker_connections
  FOR DELETE USING (user_id::text = auth.uid()::text);

-- ============================================================
-- import_logs: only owner
-- ============================================================
CREATE POLICY "import_logs_select_own" ON import_logs
  FOR SELECT USING (user_id::text = auth.uid()::text);

-- ============================================================
-- user_settings: only owner
-- ============================================================
CREATE POLICY "user_settings_select_own" ON user_settings
  FOR SELECT USING (user_id::text = auth.uid()::text);

CREATE POLICY "user_settings_update_own" ON user_settings
  FOR UPDATE USING (user_id::text = auth.uid()::text);

-- ============================================================
-- progress_goals: only owner
-- ============================================================
CREATE POLICY "progress_goals_select_own" ON progress_goals
  FOR SELECT USING (user_id::text = auth.uid()::text);

CREATE POLICY "progress_goals_insert_own" ON progress_goals
  FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY "progress_goals_update_own" ON progress_goals
  FOR UPDATE USING (user_id::text = auth.uid()::text);

CREATE POLICY "progress_goals_delete_own" ON progress_goals
  FOR DELETE USING (user_id::text = auth.uid()::text);

-- ============================================================
-- backtest_sessions: only owner
-- ============================================================
CREATE POLICY "backtest_sessions_select_own" ON backtest_sessions
  FOR SELECT USING (user_id::text = auth.uid()::text);

CREATE POLICY "backtest_sessions_insert_own" ON backtest_sessions
  FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY "backtest_sessions_delete_own" ON backtest_sessions
  FOR DELETE USING (user_id::text = auth.uid()::text);

-- ============================================================
-- backtest_trades: via session ownership
-- ============================================================
CREATE POLICY "backtest_trades_select_own" ON backtest_trades
  FOR SELECT USING (
    session_id IN (SELECT id FROM backtest_sessions WHERE user_id::text = auth.uid()::text)
  );

-- ============================================================
-- accounts / sessions / verification_tokens: no direct access
-- (managed by backend only, block all from API)
-- ============================================================
CREATE POLICY "accounts_no_access" ON accounts
  FOR ALL USING (false);

CREATE POLICY "sessions_no_access" ON sessions
  FOR ALL USING (false);

CREATE POLICY "verification_tokens_no_access" ON verification_tokens
  FOR ALL USING (false);

-- ============================================================
-- DONE! Backend (direct DB connection) bypasses all RLS.
-- Supabase dashboard/API access is now restricted per-user.
-- ============================================================
