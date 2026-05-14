
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_my_roles() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.get_my_roles() TO authenticated;
