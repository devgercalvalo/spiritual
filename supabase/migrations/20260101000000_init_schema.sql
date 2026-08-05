-- Spiritual Blog Platform — schema inicial
-- Tablas: profiles, categories, posts, comments, products, kits, kit_products, post_kits

create extension if not exists "pgcrypto";

-- =========================================================
-- profiles (extiende auth.users)
-- =========================================================
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role text not null default 'editor' check (role in ('admin', 'editor')),
  created_at timestamptz not null default now()
);

-- crea automáticamente un profile cuando se registra un usuario en auth.users
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data ->> 'full_name', 'editor');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =========================================================
-- categories
-- =========================================================
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  created_at timestamptz not null default now()
);

-- =========================================================
-- posts
-- =========================================================
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text not null default '',
  cover_image_url text,
  category_id uuid references public.categories (id) on delete set null,
  status text not null default 'draft' check (status in ('draft', 'published')),
  author_id uuid references public.profiles (id) on delete set null,
  seo_title text,
  seo_description text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index posts_status_published_at_idx on public.posts (status, published_at desc);
create index posts_category_id_idx on public.posts (category_id);

-- =========================================================
-- comments (comentarios de invitados, moderados)
-- =========================================================
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  parent_id uuid references public.comments (id) on delete cascade,
  author_name text not null,
  author_email text not null,
  content text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

create index comments_post_id_status_idx on public.comments (post_id, status);

-- =========================================================
-- products
-- =========================================================
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  mercado_libre_url text,
  price_display text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- =========================================================
-- kits
-- =========================================================
create table public.kits (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- =========================================================
-- kit_products (N:N)
-- =========================================================
create table public.kit_products (
  kit_id uuid not null references public.kits (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  primary key (kit_id, product_id)
);

-- =========================================================
-- post_kits (N:N) — kit(s) recomendado(s) por publicación
-- =========================================================
create table public.post_kits (
  post_id uuid not null references public.posts (id) on delete cascade,
  kit_id uuid not null references public.kits (id) on delete cascade,
  primary key (post_id, kit_id)
);

-- =========================================================
-- updated_at trigger para posts
-- =========================================================
create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger posts_set_updated_at
  before update on public.posts
  for each row execute procedure public.set_updated_at();
