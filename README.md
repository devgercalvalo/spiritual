# Sendero Espiritual — Plataforma de blog espiritual

MVP de una plataforma donde un sanador espiritual publica oraciones, rituales, reflexiones,
mensajes y consejos, con comunidad de comentarios y kits que redirigen a Mercado Libre para
la compra. Ver el brief completo del proyecto para el detalle de alcance y fases futuras.

## Stack

- **Frontend**: Next.js (App Router) + React + TypeScript + TailwindCSS
- **Backend**: Next.js Route Handlers (`src/app/api/**`)
- **Base de datos / Auth / Storage**: Supabase (Postgres + Auth + Storage)
- **Hosting**: Vercel (no configurado en este repo todavía)

## Requisitos

- Node.js 20+
- [pnpm](https://pnpm.io) — si no lo tienes global: `corepack enable && corepack prepare pnpm@9 --activate`,
  o instálalo con `brew install pnpm`.
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) corriendo (lo necesita `supabase start`)
- [Supabase CLI](https://supabase.com/docs/guides/cli) — `brew install supabase/tap/supabase`

## Primeros pasos

```bash
pnpm install

# Levanta Postgres/Auth/Storage local en Docker y aplica migraciones + seed
pnpm supabase:start

# Copia las claves que imprime el comando anterior a .env.local
cp .env.local.example .env.local
# edita .env.local con anon key / service role key impresas por `supabase start`

pnpm dev
```

Abre http://localhost:3000 para el sitio público.

### Crear el usuario admin

El seed no crea usuarios de Auth (Supabase no lo permite por SQL directo). Después de
`supabase start`:

1. Abre Supabase Studio local: http://localhost:54323
2. Authentication → Add user → crea tu usuario admin (correo + contraseña)
3. Table editor → `profiles` → busca la fila creada automáticamente para ese usuario
   (el trigger `on_auth_user_created` la crea con `role = 'editor'`) y cámbiala a `role = 'admin'`
4. Entra a http://localhost:3000/admin/login con ese correo/contraseña

### Regenerar tipos de TypeScript desde el schema real

```bash
pnpm supabase:types
```

Sobrescribe `src/types/database.types.ts` (que hoy está escrito a mano siguiendo las
migraciones) con la salida real de `supabase gen types`.

## Estructura

```
supabase/
  migrations/        # schema + RLS + bucket de Storage, versionados
  seed.sql            # datos de ejemplo (categorías, posts, productos, kits)
src/
  app/
    (public)/          # sitio público: home, blog, categorías, buscador, producto, kit
    admin/
      login/            # login (fuera del layout protegido)
      (dashboard)/       # dashboard, posts, comentarios, productos, kits, categorías (protegido)
    api/
      comments/           # POST público — crea comentarios en estado "pending"
      admin/**/            # CRUD protegido (requiere sesión + role=admin)
    sitemap.ts, robots.ts # SEO técnico
  components/
    public/    ui del sitio público (PostCard, ShareButtons, CommentForm, …)
    admin/     ui del panel (ImageUploader, PostForm, …)
    ui/        primitivos estilo shadcn (Button, Input, Dialog, Select, Table, …)
  lib/
    supabase/  clientes browser/server + middleware de sesión
    data/      queries de lectura pública (Server Components)
    validations/ esquemas zod compartidos por formularios y API routes
  middleware.ts protege /admin/* (excepto /admin/login) verificando sesión
```

## Modelo de datos

`profiles`, `categories`, `posts`, `comments`, `products`, `kits`, `kit_products` (N:N),
`post_kits` (N:N). Detalle completo y políticas RLS en `supabase/migrations/`.

- Lectura pública: solo `posts` publicados, `comments` aprobados, `products`/`kits` activos.
- Escritura: solo usuarios autenticados con `role = 'admin'` en `profiles`.
- Comentarios: cualquiera puede insertar, siempre quedan en `status = 'pending'` hasta moderación.

## Alcance del MVP

Incluye sitio público, blog, categorías, buscador, panel admin, login, gestión de
publicaciones, comentarios moderados, productos, kits, redirección a Mercado Libre,
compartir en redes y SEO básico.

**No incluye** (fase 3): carrito, inventario, pagos, pedidos, envíos. Las compras redirigen
a Mercado Libre (`mercado_libre_url` en cada producto).

## Scripts

```bash
pnpm dev              # servidor de desarrollo
pnpm build             # build de producción
pnpm lint               # ESLint
pnpm supabase:start      # levanta Supabase local (requiere Docker)
pnpm supabase:stop        # detiene Supabase local
pnpm supabase:types        # regenera src/types/database.types.ts
```

## Próximas fases (fuera de este MVP)

- **Fase 2**: newsletter, usuarios registrados, favoritos, analíticas.
- **Fase 3**: tienda propia con Mercado Pago, carrito, pedidos.
- **Fase 4**: membresías, app móvil, contenido exclusivo.
