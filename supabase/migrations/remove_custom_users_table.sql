-- Remove the custom users table and use only auth.users with metadata
-- This should resolve any foreign key constraint issues

-- Drop the foreign key constraint first
ALTER TABLE IF EXISTS public.users DROP CONSTRAINT IF EXISTS users_id_fkey;

-- Drop the custom users table
DROP TABLE IF EXISTS public.users;

-- Create a view to access user data from auth.users if needed
CREATE OR REPLACE VIEW public.user_profiles AS
SELECT 
    id,
    email,
    raw_user_meta_data->>'full_name' as name,
    created_at,
    updated_at
FROM auth.users;

-- Grant permissions to the view
GRANT SELECT ON public.user_profiles TO anon, authenticated;

-- Create RLS policy for the view
ALTER VIEW public.user_profiles OWNER TO postgres;