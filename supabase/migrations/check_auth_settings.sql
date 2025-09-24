-- Check auth settings and configuration
-- This will help us understand what might be causing the registration issues

-- Check auth schema tables and their structure
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'auth' 
AND table_name = 'users'
ORDER BY ordinal_position;

-- Check if there are any custom triggers on auth.users
SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE event_object_schema = 'auth' 
AND event_object_table = 'users';

-- Check auth configuration (if accessible)
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats 
WHERE schemaname = 'auth' 
AND tablename = 'users'
LIMIT 10;

-- Try to see if we can access auth settings
SELECT current_setting('app.settings.auth.enable_signup', true) as enable_signup;
SELECT current_setting('app.settings.auth.enable_confirmations', true) as enable_confirmations;