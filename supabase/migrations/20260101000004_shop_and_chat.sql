-- Carrito de compras (pedidos manuales, sin cobro en línea) + chat de contacto
-- asíncrono para pedir informes sobre un producto/kit.

-- =========================================================
-- precio numérico en products/kits (price_display sigue existiendo como
-- override de texto libre, ej. "Desde $199 MXN"; si es null la UI formatea price)
-- =========================================================
alter table public.products add column price numeric(10, 2) not null default 0;
alter table public.kits add column price numeric(10, 2) not null default 0;

-- =========================================================
-- orders — pedido armado desde el carrito; el equipo lo cierra manualmente
-- (transferencia, efectivo, Mercado Libre aparte). Sin pasarela de pago todavía.
-- =========================================================
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  customer_notes text,
  admin_notes text,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'fulfilled', 'cancelled')),
  total numeric(10, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_status_created_at_idx on public.orders (status, created_at desc);

create trigger orders_set_updated_at
  before update on public.orders
  for each row execute procedure public.set_updated_at();

-- =========================================================
-- order_items — snapshot de nombre/precio al momento del pedido (no depende
-- de que el producto/kit siga existiendo o de que su precio no haya cambiado)
-- =========================================================
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  item_type text not null check (item_type in ('product', 'kit')),
  product_id uuid references public.products (id) on delete set null,
  kit_id uuid references public.kits (id) on delete set null,
  name text not null,
  unit_price numeric(10, 2) not null,
  quantity integer not null check (quantity > 0),
  subtotal numeric(10, 2) not null
);

create index order_items_order_id_idx on public.order_items (order_id);

-- =========================================================
-- chat_threads — hilo de preguntas de un visitante, opcionalmente ligado a un
-- producto/kit. El visitante guarda el id en su navegador para volver a leerlo
-- (ver GET /api/chat/[id], que usa la service role key filtrando por id exacto —
-- no hay lectura pública vía RLS, ver comentario en la migración de RLS).
-- =========================================================
create table public.chat_threads (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products (id) on delete set null,
  kit_id uuid references public.kits (id) on delete set null,
  subject text,
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  status text not null default 'open' check (status in ('open', 'answered', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index chat_threads_status_updated_at_idx on public.chat_threads (status, updated_at desc);

create trigger chat_threads_set_updated_at
  before update on public.chat_threads
  for each row execute procedure public.set_updated_at();

-- =========================================================
-- chat_messages
-- =========================================================
create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.chat_threads (id) on delete cascade,
  sender_type text not null check (sender_type in ('customer', 'admin')),
  sender_name text,
  content text not null,
  created_at timestamptz not null default now()
);

create index chat_messages_thread_id_created_at_idx on public.chat_messages (thread_id, created_at);
