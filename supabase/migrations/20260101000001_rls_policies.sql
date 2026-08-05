-- Row Level Security — lectura pública restringida a contenido publicado/aprobado/activo,
-- escritura restringida a usuarios autenticados con role = 'admin' en public.profiles.

create function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- =========================================================
-- profiles
-- =========================================================
alter table public.profiles enable row level security;

create policy "profiles: el propio usuario puede ver su perfil"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

create policy "profiles: admin puede administrar perfiles"
  on public.profiles for all
  using (public.is_admin())
  with check (public.is_admin());

-- =========================================================
-- categories
-- =========================================================
alter table public.categories enable row level security;

create policy "categories: lectura pública"
  on public.categories for select
  using (true);

create policy "categories: admin escribe"
  on public.categories for insert
  with check (public.is_admin());

create policy "categories: admin actualiza"
  on public.categories for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "categories: admin elimina"
  on public.categories for delete
  using (public.is_admin());

-- =========================================================
-- posts
-- =========================================================
alter table public.posts enable row level security;

create policy "posts: lectura pública de publicados"
  on public.posts for select
  using (status = 'published' or public.is_admin());

create policy "posts: admin inserta"
  on public.posts for insert
  with check (public.is_admin());

create policy "posts: admin actualiza"
  on public.posts for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "posts: admin elimina"
  on public.posts for delete
  using (public.is_admin());

-- =========================================================
-- comments
-- =========================================================
alter table public.comments enable row level security;

create policy "comments: lectura pública de aprobados"
  on public.comments for select
  using (status = 'approved' or public.is_admin());

create policy "comments: cualquiera puede comentar (queda pending)"
  on public.comments for insert
  with check (status = 'pending');

create policy "comments: admin modera"
  on public.comments for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "comments: admin elimina"
  on public.comments for delete
  using (public.is_admin());

-- =========================================================
-- products
-- =========================================================
alter table public.products enable row level security;

create policy "products: lectura pública de activos"
  on public.products for select
  using (is_active = true or public.is_admin());

create policy "products: admin inserta"
  on public.products for insert
  with check (public.is_admin());

create policy "products: admin actualiza"
  on public.products for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "products: admin elimina"
  on public.products for delete
  using (public.is_admin());

-- =========================================================
-- kits
-- =========================================================
alter table public.kits enable row level security;

create policy "kits: lectura pública de activos"
  on public.kits for select
  using (is_active = true or public.is_admin());

create policy "kits: admin inserta"
  on public.kits for insert
  with check (public.is_admin());

create policy "kits: admin actualiza"
  on public.kits for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "kits: admin elimina"
  on public.kits for delete
  using (public.is_admin());

-- =========================================================
-- kit_products
-- =========================================================
alter table public.kit_products enable row level security;

create policy "kit_products: lectura pública"
  on public.kit_products for select
  using (true);

create policy "kit_products: admin administra"
  on public.kit_products for all
  using (public.is_admin())
  with check (public.is_admin());

-- =========================================================
-- post_kits
-- =========================================================
alter table public.post_kits enable row level security;

create policy "post_kits: lectura pública"
  on public.post_kits for select
  using (true);

create policy "post_kits: admin administra"
  on public.post_kits for all
  using (public.is_admin())
  with check (public.is_admin());
