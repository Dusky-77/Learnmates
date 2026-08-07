-- Create a secure RPC function to delete the authenticated user's account
CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete the user from auth.users
  -- This requires the function to be SECURITY DEFINER to bypass RLS on auth schema.
  -- Deleting from auth.users will automatically cascade to public.profiles and other related tables
  -- if they were created with ON DELETE CASCADE foreign keys.
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;
