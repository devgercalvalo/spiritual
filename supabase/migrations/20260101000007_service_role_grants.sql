-- Bug encontrado al probar GET /api/chat/[id] (primera vez que este proyecto usa
-- createServiceRoleClient() contra una tabla de Postgres, no solo Storage):
-- "permission denied for table chat_threads" con la service role key.
--
-- RLS bypass (BYPASSRLS del rol service_role) no es lo mismo que privilegios de
-- SQL GRANT — son dos capas distintas. grants.sql (20260101000003) nunca le dio
-- a service_role privilegios sobre las tablas, solo `usage on schema public`;
-- en un proyecto creado desde el dashboard de Supabase esto viene dado por
-- defecto, pero como este schema se creó por migraciones SQL a mano, hay que
-- otorgarlo explícitamente — igual que ya se documentó para anon/authenticated.

grant select, insert, update, delete on all tables in schema public to service_role;

-- default privileges para tablas que se creen en migraciones futuras.
alter default privileges in schema public grant select, insert, update, delete on tables to service_role;
