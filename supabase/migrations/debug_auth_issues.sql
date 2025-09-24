-- Debug auth issues
-- Check if there are any triggers or constraints causing problems

-- First, let's see what triggers exist on auth.users
SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE event_object_schema = 'auth' 
AND event_object_table = 'users';

-- Check constraints on auth.users
SELECT 
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints 
WHERE table_schema = 'auth' 
AND table_name = 'users';

-- Check if there are any foreign key constraints from public.users to auth.users
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public'
AND tc.table_name = 'users';

-- Check if we can insert directly into auth.users (this should fail with proper error)
-- This is just for debugging - don't actually run this in production
-- INSERT INTO auth.users (id, email) VALUES (gen_random_uuid(), 'test@example.com');

-- Check current auth settings
SELECT name, setting FROM pg_settings WHERE name LIKE '%auth%' OR name LIKE '%security%';