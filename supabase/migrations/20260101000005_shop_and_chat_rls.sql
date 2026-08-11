-- RLS para orders/order_items/chat_threads/chat_messages — mismo criterio que
-- comments: cualquiera puede insertar (crear su pedido / su hilo de chat), pero
-- solo admin puede leer, moderar/responder o borrar.
--
-- El chat es la excepción notable: NO agregamos una policy de select pública
-- "el que tenga el id puede leerlo", porque RLS filtra filas de una tabla
-- completa — una policy `using (true)` expondría TODOS los hilos (con nombre,
-- email, teléfono de cada visitante) vía la REST API de Supabase, no solo el
-- que el cliente pide con `.eq('id', ...)`. Filtrar por id es responsabilidad
-- de la query, no algo que RLS pueda garantizar por sí sola. En vez de eso, el
-- visitante lee su hilo a través de GET /api/chat/[id], una Route Handler que
-- usa la service role key y siempre filtra por el id exacto de la URL — el
-- modelo de seguridad es "quien tiene el UUID del hilo puede verlo", igual que
-- un link para compartir.

-- =========================================================
-- orders
-- =========================================================
alter table public.orders enable row level security;

create policy "orders: cualquiera puede crear un pedido (queda pending)"
  on public.orders for insert
  with check (status = 'pending');

create policy "orders: solo admin lee"
  on public.orders for select
  using (public.is_admin());

create policy "orders: admin actualiza"
  on public.orders for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "orders: admin elimina"
  on public.orders for delete
  using (public.is_admin());

-- =========================================================
-- order_items
-- =========================================================
alter table public.order_items enable row level security;

create policy "order_items: cualquiera puede agregar items a un pedido"
  on public.order_items for insert
  with check (true);

create policy "order_items: solo admin lee"
  on public.order_items for select
  using (public.is_admin());

create policy "order_items: admin actualiza"
  on public.order_items for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "order_items: admin elimina"
  on public.order_items for delete
  using (public.is_admin());

-- =========================================================
-- chat_threads
-- =========================================================
alter table public.chat_threads enable row level security;

create policy "chat_threads: cualquiera puede abrir un hilo (queda open)"
  on public.chat_threads for insert
  with check (status = 'open');

create policy "chat_threads: solo admin lee"
  on public.chat_threads for select
  using (public.is_admin());

create policy "chat_threads: admin actualiza"
  on public.chat_threads for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "chat_threads: admin elimina"
  on public.chat_threads for delete
  using (public.is_admin());

-- =========================================================
-- chat_messages
-- =========================================================
alter table public.chat_messages enable row level security;

create policy "chat_messages: cliente o admin pueden insertar mensajes"
  on public.chat_messages for insert
  with check (sender_type = 'customer' or (sender_type = 'admin' and public.is_admin()));

create policy "chat_messages: solo admin lee"
  on public.chat_messages for select
  using (public.is_admin());

create policy "chat_messages: admin actualiza"
  on public.chat_messages for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "chat_messages: admin elimina"
  on public.chat_messages for delete
  using (public.is_admin());
