-- Remove the self-service "first user becomes admin" path.
drop function if exists public.claim_first_admin();

-- Vehicle photo storage: only admins may write, anyone signed in may read.
create policy "Admins manage vehicle photos"
on storage.objects for all to authenticated
using (bucket_id = 'vehicle-photos' and public.has_role(auth.uid(), 'admin'))
with check (bucket_id = 'vehicle-photos' and public.has_role(auth.uid(), 'admin'));
