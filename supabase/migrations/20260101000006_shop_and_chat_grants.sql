-- Igual que en grants.sql: las políticas RLS solo filtran filas, Postgres
-- primero exige privilegios a nivel de tabla. Sin estos GRANTs, anon/authenticated
-- reciben "permission denied for table X" aunque RLS y las policies estén bien.

grant select, insert on public.orders to anon, authenticated;
grant insert on public.order_items to anon, authenticated;
grant select, insert on public.chat_threads to anon, authenticated;
grant insert on public.chat_messages to anon, authenticated;

-- El rol admin necesita poder leer/moderar todo; las policies RLS (is_admin())
-- restringen esto a usuarios con role='admin'.
grant update, delete on public.orders to authenticated;
grant select, update, delete on public.order_items to authenticated;
grant update, delete on public.chat_threads to authenticated;
grant select, update, delete on public.chat_messages to authenticated;
