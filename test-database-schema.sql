
SELECT 'Testing table existence...' as test_phase;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

SELECT 'Testing Row-Level Security...' as test_phase;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true
ORDER BY tablename;

SELECT 'Testing RLS policies...' as test_phase;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

SELECT 'Testing functions...' as test_phase;
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('current_user_id', 'set_current_session', 'log_activity', 'update_updated_at_column')
ORDER BY routine_name;

SELECT 'Testing triggers...' as test_phase;
SELECT trigger_name, event_object_table, action_timing, event_manipulation 
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

SELECT 'Testing indexes...' as test_phase;
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

SELECT 'Testing session functions...' as test_phase;
SELECT set_current_session('test_token_123');
SELECT current_user_id(); -- Should return NULL since no valid session

SELECT 'Testing admin user...' as test_phase;
SELECT email, role, is_active, email_verified 
FROM users 
WHERE email = 'admin@covrenfirm.com';

SELECT 'Schema validation complete!' as test_phase;
