/*
  MANUAL ADMIN SETUP SCRIPT

  Use this script ONLY if the automatic admin role assignment doesn't work.

  Instructions:
  1. First, sign up the admin user through the website (/auth page)
     - Email: ravishangaraarya24@gmail.com
     - Password: ravi$aarya2324

  2. Then, run this script in Supabase SQL Editor to manually assign admin role

  3. Refresh the website and log in again
*/

-- ============================================================================
-- STEP 1: Find the user ID for the admin email
-- ============================================================================

-- Run this first to get the user_id
-- Copy the 'id' value from the result
SELECT
  id as user_id,
  email,
  created_at,
  confirmed_at
FROM auth.users
WHERE email = 'ravishangaraarya24@gmail.com';

-- ============================================================================
-- STEP 2: Assign admin role
-- ============================================================================

-- Replace 'USER_ID_FROM_STEP_1' with the actual UUID from Step 1
-- Example: INSERT INTO public.user_roles (user_id, role)
--          VALUES ('12345678-1234-1234-1234-123456789abc', 'admin'::app_role);

-- Uncomment and modify the line below:
-- INSERT INTO public.user_roles (user_id, role)
-- VALUES ('USER_ID_FROM_STEP_1', 'admin'::app_role)
-- ON CONFLICT (user_id, role) DO NOTHING;

-- ============================================================================
-- STEP 3: Verify admin role was assigned
-- ============================================================================

-- Run this to confirm the admin role is assigned
SELECT
  ur.user_id,
  au.email,
  ur.role,
  ur.created_at as role_assigned_at
FROM public.user_roles ur
JOIN auth.users au ON ur.user_id = au.id
WHERE au.email = 'ravishangaraarya24@gmail.com';

-- You should see one row with role = 'admin'

-- ============================================================================
-- ALTERNATIVE: Use the helper function
-- ============================================================================

-- If the helper function is available, you can use:
-- SELECT assign_admin_role('USER_ID_FROM_STEP_1');

-- ============================================================================
-- TROUBLESHOOTING
-- ============================================================================

-- If you need to remove admin role (careful!):
-- DELETE FROM public.user_roles
-- WHERE user_id = 'USER_ID_HERE' AND role = 'admin';

-- To list all admin users:
-- SELECT * FROM list_admin_users();

-- To check if email has admin role:
-- SELECT is_admin_email('ravishangaraarya24@gmail.com');

-- ============================================================================
-- NOTES
-- ============================================================================

/*
  - The admin email is: ravishangaraarya24@gmail.com
  - The user must sign up through the website first
  - This script is a backup method if automatic assignment fails
  - The trigger should handle this automatically for new signups
  - After running this script, refresh the website and log in again
  - The Admin Panel option should appear in the user dropdown menu
*/
