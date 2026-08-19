# Centro de Sanación San Charbel — Plataforma de blog espiritual

MVP de una plataforma donde un sanador espiritual publica oraciones, rituales, reflexiones,
mensajes y consejos, con comunidad de comentarios, carrito de compras (pedido manual, sin
cobro en línea todavía) y un chat para pedir informes sobre productos y kits. Los productos
también pueden mostrar un link directo a Mercado Libre como alternativa de compra. Ver el
brief completo del proyecto para el detalle de alcance y fases futuras.

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
      orders/              # POST público — crea un pedido desde el carrito (queda "pending")
      chat/                # POST público — abre un hilo/manda mensajes; GET por id (service role)
      admin/**/            # CRUD protegido (requiere sesión + role=admin), incluye pedidos y mensajes
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
`post_kits` (N:N), `orders`, `order_items`, `chat_threads`, `chat_messages`. Detalle completo
y políticas RLS en `supabase/migrations/`.

- Lectura pública: solo `posts` publicados, `comments` aprobados, `products`/`kits` activos.
- Escritura: solo usuarios autenticados con `role = 'admin'` en `profiles`.
- Comentarios: cualquiera puede insertar, siempre quedan en `status = 'pending'` hasta moderación.
- Pedidos (`orders`/`order_items`): cualquiera puede insertar (arma su pedido desde el carrito),
  solo admin puede leer/actualizar/borrar. El total se recalcula en el servidor a partir del
  `price` real en base de datos, nunca se confía en lo que manda el navegador.
- Chat (`chat_threads`/`chat_messages`): cualquiera puede insertar (abrir un hilo / mandar un
  mensaje), pero **no hay policy de lectura pública** — la RLS solo deja leer a admin. El
  visitante lee su propio hilo a través de `GET /api/chat/[id]`, una Route Handler que usa la
  service role key y filtra siempre por el id exacto de la URL (modelo "quien tiene el UUID
  del hilo puede verlo", igual que un link para compartir). Ver el comentario en
  `supabase/migrations/20260101000005_shop_and_chat_rls.sql` para el detalle de por qué no se
  resolvió con una policy `using (true)`.

## Alcance del MVP

Incluye sitio público, blog, categorías, buscador, panel admin, login, gestión de
publicaciones, comentarios moderados, productos, kits, carrito de compras con pedido manual,
chat asíncrono para pedir informes sobre un producto/kit, redirección opcional a Mercado
Libre, compartir en redes y SEO básico.

**No incluye todavía**: cobro en línea (pasarela de pago), inventario, envíos automatizados,
chat en tiempo real. El carrito termina en un pedido que el equipo confirma manualmente
(transferencia, efectivo, o Mercado Libre aparte vía `mercado_libre_url`).

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
- **Fase 3**: cobro en línea con Mercado Pago sobre el carrito ya existente, chat en tiempo
  real (Supabase Realtime) en vez de polling, notificaciones por correo de pedidos/mensajes.
- **Fase 4**: membresías, app móvil, contenido exclusivo.