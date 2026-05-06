import { Client } from 'pg'

const client = new Client({
  connectionString: 'postgresql://postgres.ftcfwvqbvcgccoytexrl:waKxp6jHCxx2PUQ@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
})

// All RLS statements as individual queries (no PL/pgSQL blocks needed)
const statements = [
  // ── Enable RLS ──────────────────────────────────────────────
  'ALTER TABLE users ENABLE ROW LEVEL SECURITY',
  'ALTER TABLE accounts ENABLE ROW LEVEL SECURITY',
  'ALTER TABLE sessions ENABLE ROW LEVEL SECURITY',
  'ALTER TABLE verification_tokens ENABLE ROW LEVEL SECURITY',
  'ALTER TABLE trading_accounts ENABLE ROW LEVEL SECURITY',
  'ALTER TABLE trades ENABLE ROW LEVEL SECURITY',
  'ALTER TABLE trade_legs ENABLE ROW LEVEL SECURITY',
  'ALTER TABLE trade_tags ENABLE ROW LEVEL SECURITY',
  'ALTER TABLE trade_screenshots ENABLE ROW LEVEL SECURITY',
  'ALTER TABLE tags ENABLE ROW LEVEL SECURITY',
  'ALTER TABLE journal_notes ENABLE ROW LEVEL SECURITY',
  'ALTER TABLE playbooks ENABLE ROW LEVEL SECURITY',
  'ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY',
  'ALTER TABLE ai_reports ENABLE ROW LEVEL SECURITY',
  'ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY',
  'ALTER TABLE broker_connections ENABLE ROW LEVEL SECURITY',
  'ALTER TABLE import_logs ENABLE ROW LEVEL SECURITY',
  'ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY',
  'ALTER TABLE progress_goals ENABLE ROW LEVEL SECURITY',
  'ALTER TABLE backtest_sessions ENABLE ROW LEVEL SECURITY',
  'ALTER TABLE backtest_trades ENABLE ROW LEVEL SECURITY',

  // ── Drop existing policies (idempotent) ─────────────────────
  'DROP POLICY IF EXISTS users_select_own ON users',
  'DROP POLICY IF EXISTS users_update_own ON users',
  'DROP POLICY IF EXISTS trading_accounts_select_own ON trading_accounts',
  'DROP POLICY IF EXISTS trading_accounts_insert_own ON trading_accounts',
  'DROP POLICY IF EXISTS trading_accounts_update_own ON trading_accounts',
  'DROP POLICY IF EXISTS trading_accounts_delete_own ON trading_accounts',
  'DROP POLICY IF EXISTS trades_select_own ON trades',
  'DROP POLICY IF EXISTS trades_insert_own ON trades',
  'DROP POLICY IF EXISTS trades_update_own ON trades',
  'DROP POLICY IF EXISTS trades_delete_own ON trades',
  'DROP POLICY IF EXISTS trade_legs_select_own ON trade_legs',
  'DROP POLICY IF EXISTS trade_legs_insert_own ON trade_legs',
  'DROP POLICY IF EXISTS trade_legs_update_own ON trade_legs',
  'DROP POLICY IF EXISTS trade_legs_delete_own ON trade_legs',
  'DROP POLICY IF EXISTS trade_tags_select_own ON trade_tags',
  'DROP POLICY IF EXISTS trade_tags_insert_own ON trade_tags',
  'DROP POLICY IF EXISTS trade_tags_delete_own ON trade_tags',
  'DROP POLICY IF EXISTS trade_screenshots_select_own ON trade_screenshots',
  'DROP POLICY IF EXISTS trade_screenshots_insert_own ON trade_screenshots',
  'DROP POLICY IF EXISTS trade_screenshots_delete_own ON trade_screenshots',
  'DROP POLICY IF EXISTS tags_select_own ON tags',
  'DROP POLICY IF EXISTS tags_insert_own ON tags',
  'DROP POLICY IF EXISTS tags_update_own ON tags',
  'DROP POLICY IF EXISTS tags_delete_own ON tags',
  'DROP POLICY IF EXISTS journal_notes_select_own ON journal_notes',
  'DROP POLICY IF EXISTS journal_notes_insert_own ON journal_notes',
  'DROP POLICY IF EXISTS journal_notes_update_own ON journal_notes',
  'DROP POLICY IF EXISTS journal_notes_delete_own ON journal_notes',
  'DROP POLICY IF EXISTS playbooks_select_own ON playbooks',
  'DROP POLICY IF EXISTS playbooks_insert_own ON playbooks',
  'DROP POLICY IF EXISTS playbooks_update_own ON playbooks',
  'DROP POLICY IF EXISTS playbooks_delete_own ON playbooks',
  'DROP POLICY IF EXISTS ai_insights_select_own ON ai_insights',
  'DROP POLICY IF EXISTS ai_reports_select_own ON ai_reports',
  'DROP POLICY IF EXISTS subscriptions_select_own ON subscriptions',
  'DROP POLICY IF EXISTS broker_connections_select_own ON broker_connections',
  'DROP POLICY IF EXISTS broker_connections_insert_own ON broker_connections',
  'DROP POLICY IF EXISTS broker_connections_update_own ON broker_connections',
  'DROP POLICY IF EXISTS broker_connections_delete_own ON broker_connections',
  'DROP POLICY IF EXISTS import_logs_select_own ON import_logs',
  'DROP POLICY IF EXISTS user_settings_select_own ON user_settings',
  'DROP POLICY IF EXISTS user_settings_update_own ON user_settings',
  'DROP POLICY IF EXISTS progress_goals_select_own ON progress_goals',
  'DROP POLICY IF EXISTS progress_goals_insert_own ON progress_goals',
  'DROP POLICY IF EXISTS progress_goals_update_own ON progress_goals',
  'DROP POLICY IF EXISTS progress_goals_delete_own ON progress_goals',
  'DROP POLICY IF EXISTS backtest_sessions_select_own ON backtest_sessions',
  'DROP POLICY IF EXISTS backtest_sessions_insert_own ON backtest_sessions',
  'DROP POLICY IF EXISTS backtest_sessions_delete_own ON backtest_sessions',
  'DROP POLICY IF EXISTS backtest_trades_select_own ON backtest_trades',
  'DROP POLICY IF EXISTS accounts_no_access ON accounts',
  'DROP POLICY IF EXISTS sessions_no_access ON sessions',
  'DROP POLICY IF EXISTS verification_tokens_no_access ON verification_tokens',

  // ── Create policies ─────────────────────────────────────────
  // users
  `CREATE POLICY users_select_own ON users FOR SELECT USING (id::text = auth.uid()::text)`,
  `CREATE POLICY users_update_own ON users FOR UPDATE USING (id::text = auth.uid()::text)`,

  // trading_accounts
  `CREATE POLICY trading_accounts_select_own ON trading_accounts FOR SELECT USING (user_id::text = auth.uid()::text)`,
  `CREATE POLICY trading_accounts_insert_own ON trading_accounts FOR INSERT WITH CHECK (user_id::text = auth.uid()::text)`,
  `CREATE POLICY trading_accounts_update_own ON trading_accounts FOR UPDATE USING (user_id::text = auth.uid()::text)`,
  `CREATE POLICY trading_accounts_delete_own ON trading_accounts FOR DELETE USING (user_id::text = auth.uid()::text)`,

  // trades
  `CREATE POLICY trades_select_own ON trades FOR SELECT USING (user_id::text = auth.uid()::text)`,
  `CREATE POLICY trades_insert_own ON trades FOR INSERT WITH CHECK (user_id::text = auth.uid()::text)`,
  `CREATE POLICY trades_update_own ON trades FOR UPDATE USING (user_id::text = auth.uid()::text)`,
  `CREATE POLICY trades_delete_own ON trades FOR DELETE USING (user_id::text = auth.uid()::text)`,

  // trade_legs
  `CREATE POLICY trade_legs_select_own ON trade_legs FOR SELECT USING (trade_id IN (SELECT id FROM trades WHERE user_id::text = auth.uid()::text))`,
  `CREATE POLICY trade_legs_insert_own ON trade_legs FOR INSERT WITH CHECK (trade_id IN (SELECT id FROM trades WHERE user_id::text = auth.uid()::text))`,
  `CREATE POLICY trade_legs_update_own ON trade_legs FOR UPDATE USING (trade_id IN (SELECT id FROM trades WHERE user_id::text = auth.uid()::text))`,
  `CREATE POLICY trade_legs_delete_own ON trade_legs FOR DELETE USING (trade_id IN (SELECT id FROM trades WHERE user_id::text = auth.uid()::text))`,

  // trade_tags
  `CREATE POLICY trade_tags_select_own ON trade_tags FOR SELECT USING (trade_id IN (SELECT id FROM trades WHERE user_id::text = auth.uid()::text))`,
  `CREATE POLICY trade_tags_insert_own ON trade_tags FOR INSERT WITH CHECK (trade_id IN (SELECT id FROM trades WHERE user_id::text = auth.uid()::text))`,
  `CREATE POLICY trade_tags_delete_own ON trade_tags FOR DELETE USING (trade_id IN (SELECT id FROM trades WHERE user_id::text = auth.uid()::text))`,

  // trade_screenshots
  `CREATE POLICY trade_screenshots_select_own ON trade_screenshots FOR SELECT USING (trade_id IN (SELECT id FROM trades WHERE user_id::text = auth.uid()::text))`,
  `CREATE POLICY trade_screenshots_insert_own ON trade_screenshots FOR INSERT WITH CHECK (trade_id IN (SELECT id FROM trades WHERE user_id::text = auth.uid()::text))`,
  `CREATE POLICY trade_screenshots_delete_own ON trade_screenshots FOR DELETE USING (trade_id IN (SELECT id FROM trades WHERE user_id::text = auth.uid()::text))`,

  // tags
  `CREATE POLICY tags_select_own ON tags FOR SELECT USING (user_id::text = auth.uid()::text)`,
  `CREATE POLICY tags_insert_own ON tags FOR INSERT WITH CHECK (user_id::text = auth.uid()::text)`,
  `CREATE POLICY tags_update_own ON tags FOR UPDATE USING (user_id::text = auth.uid()::text)`,
  `CREATE POLICY tags_delete_own ON tags FOR DELETE USING (user_id::text = auth.uid()::text)`,

  // journal_notes
  `CREATE POLICY journal_notes_select_own ON journal_notes FOR SELECT USING (user_id::text = auth.uid()::text)`,
  `CREATE POLICY journal_notes_insert_own ON journal_notes FOR INSERT WITH CHECK (user_id::text = auth.uid()::text)`,
  `CREATE POLICY journal_notes_update_own ON journal_notes FOR UPDATE USING (user_id::text = auth.uid()::text)`,
  `CREATE POLICY journal_notes_delete_own ON journal_notes FOR DELETE USING (user_id::text = auth.uid()::text)`,

  // playbooks
  `CREATE POLICY playbooks_select_own ON playbooks FOR SELECT USING (user_id::text = auth.uid()::text OR is_public = true)`,
  `CREATE POLICY playbooks_insert_own ON playbooks FOR INSERT WITH CHECK (user_id::text = auth.uid()::text)`,
  `CREATE POLICY playbooks_update_own ON playbooks FOR UPDATE USING (user_id::text = auth.uid()::text)`,
  `CREATE POLICY playbooks_delete_own ON playbooks FOR DELETE USING (user_id::text = auth.uid()::text)`,

  // ai_insights
  `CREATE POLICY ai_insights_select_own ON ai_insights FOR SELECT USING (user_id::text = auth.uid()::text)`,

  // ai_reports
  `CREATE POLICY ai_reports_select_own ON ai_reports FOR SELECT USING (user_id::text = auth.uid()::text)`,

  // subscriptions
  `CREATE POLICY subscriptions_select_own ON subscriptions FOR SELECT USING (user_id::text = auth.uid()::text)`,

  // broker_connections
  `CREATE POLICY broker_connections_select_own ON broker_connections FOR SELECT USING (user_id::text = auth.uid()::text)`,
  `CREATE POLICY broker_connections_insert_own ON broker_connections FOR INSERT WITH CHECK (user_id::text = auth.uid()::text)`,
  `CREATE POLICY broker_connections_update_own ON broker_connections FOR UPDATE USING (user_id::text = auth.uid()::text)`,
  `CREATE POLICY broker_connections_delete_own ON broker_connections FOR DELETE USING (user_id::text = auth.uid()::text)`,

  // import_logs
  `CREATE POLICY import_logs_select_own ON import_logs FOR SELECT USING (user_id::text = auth.uid()::text)`,

  // user_settings
  `CREATE POLICY user_settings_select_own ON user_settings FOR SELECT USING (user_id::text = auth.uid()::text)`,
  `CREATE POLICY user_settings_update_own ON user_settings FOR UPDATE USING (user_id::text = auth.uid()::text)`,

  // progress_goals
  `CREATE POLICY progress_goals_select_own ON progress_goals FOR SELECT USING (user_id::text = auth.uid()::text)`,
  `CREATE POLICY progress_goals_insert_own ON progress_goals FOR INSERT WITH CHECK (user_id::text = auth.uid()::text)`,
  `CREATE POLICY progress_goals_update_own ON progress_goals FOR UPDATE USING (user_id::text = auth.uid()::text)`,
  `CREATE POLICY progress_goals_delete_own ON progress_goals FOR DELETE USING (user_id::text = auth.uid()::text)`,

  // backtest_sessions
  `CREATE POLICY backtest_sessions_select_own ON backtest_sessions FOR SELECT USING (user_id::text = auth.uid()::text)`,
  `CREATE POLICY backtest_sessions_insert_own ON backtest_sessions FOR INSERT WITH CHECK (user_id::text = auth.uid()::text)`,
  `CREATE POLICY backtest_sessions_delete_own ON backtest_sessions FOR DELETE USING (user_id::text = auth.uid()::text)`,

  // backtest_trades
  `CREATE POLICY backtest_trades_select_own ON backtest_trades FOR SELECT USING (session_id IN (SELECT id FROM backtest_sessions WHERE user_id::text = auth.uid()::text))`,

  // block auth tables from API access
  `CREATE POLICY accounts_no_access ON accounts FOR ALL USING (false)`,
  `CREATE POLICY sessions_no_access ON sessions FOR ALL USING (false)`,
  `CREATE POLICY verification_tokens_no_access ON verification_tokens FOR ALL USING (false)`,
]

async function run() {
  await client.connect()
  console.log('✅ Connected to Supabase DB...')

  let ok = 0
  let skipped = 0
  let errors = 0

  for (const stmt of statements) {
    const label = stmt.slice(0, 60).replace(/\n/g, ' ')
    try {
      await client.query(stmt)
      ok++
    } catch (err: any) {
      const msg: string = err.message
      if (msg.includes('already exists')) {
        console.warn(`  SKIP: ${label}...`)
        skipped++
      } else {
        console.error(`  ❌ ERROR on: ${label}...`)
        console.error(`     ${msg.slice(0, 150)}`)
        errors++
      }
    }
  }

  await client.end()
  console.log(`\n✅ Done! ${ok} OK | ${skipped} skipped | ${errors} errors`)
  if (errors === 0) console.log('🔒 All tables are now RLS protected!')
}

run().catch(err => {
  console.error('Fatal:', err.message)
  process.exit(1)
})
