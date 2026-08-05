-- Las políticas RLS solo filtran filas; Postgres primero exige privilegios a
-- nivel de tabla. Sin estos GRANTs, anon/authenticated reciben
-- "permission denied for table X" incluso con RLS habilitado y políticas
-- correctas. Supabase Studio los aplica automáticamente al crear tablas desde
-- el dashboard; como este schema se creó por migraciones SQL, hay que
-- otorgarlos explícitamente aquí.

grant usage on schema public to anon, authenticated, service_role;

grant select on public.categories to anon, authenticated;
grant select on public.posts to anon, authenticated;
grant select, insert on public.comments to anon, authenticated;
grant select on public.products to anon, authenticated;
grant select on public.kits to anon, authenticated;
grant select on public.kit_products to anon, authenticated;
grant select on public.post_kits to anon, authenticated;
grant select on public.profiles to authenticated;

-- El rol admin necesita poder escribir en todas las tablas de gestión;
-- las políticas RLS (is_admin()) restringen esto a usuarios con role='admin'.
grant insert, update, delete on public.categories to authenticated;
grant insert, update, delete on public.posts to authenticated;
grant update, delete on public.comments to authenticated;
grant insert, update, delete on public.products to authenticated;
grant insert, update, delete on public.kits to authenticated;
grant insert, update, delete on public.kit_products to authenticated;
grant insert, update, delete on public.post_kits to authenticated;
grant insert, update, delete on public.profiles to authenticated;

-- default privileges para futuras tablas creadas por el rol postgres/owner
alter default privileges in schema public grant select on tables to anon;
alter default privileges in schema public grant select, insert, update, delete on tables to authenticated;
