-- ============================================
-- CLEAR ALL DATA — Run in Supabase SQL Editor
-- ============================================

-- Delete in correct order to respect foreign key constraints
DELETE FROM public.task_comments;
DELETE FROM public.notifications;
DELETE FROM public.tasks;
DELETE FROM public.projects;
DELETE FROM public.profiles;

-- Also clear auth users (optional — removes login accounts too)
-- WARNING: Uncomment below ONLY if you want to delete all user accounts
-- DELETE FROM auth.users;
