/*
  # Admin Role Helper Functions
  
  ## Summary
  This migration provides helper functions and utilities for admin role management.
  
  ## What This Does
  
  1. **Manual Admin Assignment Function**
     - Provides a function to manually assign admin role to a user
     - Can be called from Supabase SQL editor if automatic assignment fails
     
  2. **Verification Functions**
     - Check if a user has admin role
     - List all admin users
     
  3. **Cleanup Functions**
     - Remove admin role from a user
     - Reassign roles if needed
  
  ## Usage Examples
  
  To manually assign admin role:
  ```sql
  SELECT assign_admin_role('user-uuid-here');
  ```
  
  To verify admin users:
  ```sql
  SELECT * FROM list_admin_users();
  ```
*/

-- ============================================================================
-- MANUAL ADMIN ASSIGNMENT FUNCTION
-- ============================================================================

-- Function to manually assign admin role to a user
CREATE OR REPLACE FUNCTION public.assign_admin_role(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert admin role if not exists
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, 'admin'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN true;
END;
$$;

-- ============================================================================
-- VERIFICATION FUNCTIONS
-- ============================================================================

-- Function to list all admin users with their details
CREATE OR REPLACE FUNCTION public.list_admin_users()
RETURNS TABLE (
  user_id uuid,
  email text,
  created_at timestamptz,
  role_assigned_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    ur.user_id,
    au.email,
    au.created_at,
    ur.created_at as role_assigned_at
  FROM public.user_roles ur
  JOIN auth.users au ON ur.user_id = au.id
  WHERE ur.role = 'admin'::app_role
  ORDER BY ur.created_at DESC;
$$;

-- Function to check if a specific email has admin role
CREATE OR REPLACE FUNCTION public.is_admin_email(check_email text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN auth.users au ON ur.user_id = au.id
    WHERE au.email = check_email
    AND ur.role = 'admin'::app_role
  );
$$;

-- ============================================================================
-- CLEANUP FUNCTIONS
-- ============================================================================

-- Function to remove admin role from a user
CREATE OR REPLACE FUNCTION public.revoke_admin_role(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.user_roles
  WHERE user_id = target_user_id
  AND role = 'admin'::app_role;
  
  RETURN true;
END;
$$;

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant execute permissions on helper functions to authenticated users
-- (These are SECURITY DEFINER so they run with elevated privileges)
GRANT EXECUTE ON FUNCTION public.list_admin_users() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_email(text) TO authenticated;

-- Note: assign_admin_role and revoke_admin_role should only be called
-- by database administrators from SQL editor

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================

-- To verify the admin user exists, uncomment and run:
-- SELECT * FROM list_admin_users();

-- To manually assign admin role to the configured email:
-- First, get the user_id:
-- SELECT id FROM auth.users WHERE email = 'ravishangaraarya24@gmail.com';
-- Then assign admin role:
-- SELECT assign_admin_role('user-id-from-above');

-- ============================================================================
-- HELPER COMPLETE
-- ============================================================================
