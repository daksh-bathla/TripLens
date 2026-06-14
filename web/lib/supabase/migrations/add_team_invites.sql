-- Run this in Supabase SQL editor: https://supabase.com/dashboard/project/nthqhuoysukdbxjxueiy/sql/new

CREATE TABLE IF NOT EXISTS public.team_invites (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id uuid REFERENCES public.agencies(id) ON DELETE CASCADE NOT NULL,
  email text NOT NULL,
  role text DEFAULT 'agent' NOT NULL,
  token text DEFAULT encode(gen_random_bytes(24), 'hex') UNIQUE NOT NULL,
  created_by uuid REFERENCES public.profiles(id),
  accepted_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.team_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "team_invites_select" ON public.team_invites
  FOR SELECT USING (agency_id = my_agency_id());

CREATE POLICY "team_invites_insert" ON public.team_invites
  FOR INSERT WITH CHECK (agency_id = my_agency_id());

CREATE POLICY "team_invites_delete" ON public.team_invites
  FOR DELETE USING (agency_id = my_agency_id());
