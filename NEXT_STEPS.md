# Sendero Espiritual — Desarrollo pausado, cómo retomarlo

Este proyecto quedó **pausado** el 2026-08-05 justo antes de levantar la base de
datos local por un problema de Docker en esta máquina (ver detalle abajo). El
código de la app está **100% completo para el MVP** — lo único que falta es
correr la base de datos y conectar el entorno local. Todo lo demás (frontend,
backend, panel admin, RLS, seed) ya está escrito y commiteado en git.

## Qué falta exactamente

1. Levantar Supabase local (`pnpm supabase:start`) — o alternativamente usar un
   proyecto Supabase cloud (ver opción B abajo, evita Docker por completo).
2. Crear `.env.local` con las claves (copiar de `.env.local.example`).
3. Regenerar `src/types/database.types.ts` con el schema real: `pnpm supabase:types`.
4. Crear el usuario admin (ver README.md → "Crear el usuario admin").
5. `pnpm dev` y verificar login en `/admin/login`.

## Por qué quedó pausado: el problema de Docker

El disco de la Mac se llenó a medio camino de la primera descarga de imágenes
de Supabase (~9GB), lo que corrompió el estado interno de Docker Desktop
(el snapshotter de containerd — vimos literalmente un `input/output error`
al escribir `metadata.db`). Después de liberar espacio:

- Las imágenes se volvían a descargar bien, pero el contenedor de Postgres
  entraba en un loop de reinicio instantáneo (arranca y muere en ~100ms, sin
  ninguna salida en los logs, exit code 0).
- Reinstalar solo la imagen de Postgres no lo arregló.
- Reiniciar Docker Desktop completo (quit + reopen) tampoco lo arregló —
  la corrupción sobrevivió al reinicio, lo que indica que quedó escrita en
  el disco virtual de la VM de Docker, no solo en memoria.
- El siguiente paso hubiera sido un reset completo de datos de Docker Desktop
  (Docker Desktop → Troubleshoot → "Clean / Purge data"), que borra **todo**
  el estado de Docker en la máquina (no solo de este proyecto) y vuelve a
  descargar ~9GB. Fue en ese punto donde decidiste pausar y desinstalar Docker
  para liberar recursos para tus otros proyectos.

**Conclusión:** el problema es 100% de Docker Desktop en esta máquina, no del
código del proyecto. En una instalación limpia de Docker (o en otra máquina)
`pnpm supabase:start` debería funcionar sin dramas siguiendo el README normal.

## Cómo retomar — Opción A: Supabase local (Docker limpio)

Cuando quieras retomar y tengas espacio en disco:

```bash
# 1. Reinstalar Docker Desktop limpio
brew install --cask docker
open -a Docker   # ábrelo una vez, acepta permisos, déjalo corriendo

# 2. Desde la carpeta del proyecto
pnpm supabase:start        # levanta Postgres/Auth/Storage + aplica migraciones/seed
cp .env.local.example .env.local
# pega las claves que imprime `supabase start` en .env.local

pnpm supabase:types          # regenera src/types/database.types.ts
pnpm dev
```

Luego crea el usuario admin siguiendo el README (Supabase Studio local →
Authentication → Add user → cambiar su `role` a `admin` en la tabla `profiles`).

Antes de reinstalar Docker, asegúrate de tener **al menos 15-20GB libres** en
disco — la descarga de imágenes de Supabase pesa ~9GB y Docker necesita
margen extra para no repetir el problema que causó todo esto.

## Cómo retomar — Opción B: Supabase cloud (sin Docker)

Si prefieres evitar Docker por completo, esta es la ruta más simple:

1. Crea un proyecto gratis en [supabase.com](https://supabase.com).
2. En el SQL Editor del proyecto, corre en orden los archivos de
   `supabase/migrations/` (son 3, ya están numerados) y luego `supabase/seed.sql`.
   — O, si instalas el CLI en otra máquina con Docker disponible, `supabase link`
   + `supabase db push` hace esto automáticamente.
3. Copia `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` y
   `SUPABASE_SERVICE_ROLE_KEY` desde Project Settings → API, a tu `.env.local`.
4. `pnpm supabase:types` (necesita el CLI, pero apuntando al proyecto remoto:
   `supabase gen types typescript --project-id <tu-project-id>`) o edita
   `src/types/database.types.ts` a mano si el schema no cambió (ya está escrito
   a mano siguiendo el schema real, así que probablemente ni haga falta tocarlo).
5. Crea el usuario admin desde el dashboard de Supabase (Authentication → Add user)
   y cámbiale el `role` a `admin` en la tabla `profiles` (Table Editor).
6. `pnpm dev`.

Esta opción no requiere Docker en absoluto y es la más simple si solo quieres
seguir desarrollando el frontend/backend sin correr nada localmente.

## Estado del código (para retomar contexto rápido)

- Stack: Next.js 16 (App Router) + TypeScript + TailwindCSS v4, Supabase
  (Postgres/Auth/Storage), Route Handlers, pnpm.
- `pnpm lint` y `pnpm build` pasan limpio (0 errores) — verificado el 2026-08-05.
- Repo git local inicializado, con commit inicial del scaffold completo.
- Ver `README.md` para la estructura completa del proyecto y el modelo de datos.
- Todo lo del MVP del brief original está implementado: sitio público, blog,
  categorías, buscador, panel admin, login, CRUD de publicaciones, comentarios
  moderados, productos, kits, integración (link-out) a Mercado Libre, compartir
  en redes, SEO. No incluye carrito/inventario/pagos/pedidos/envíos (fase 3).

## Al retomar, dile a Claude

> "Retoma el proyecto Sendero Espiritual, lee NEXT_STEPS.md y continúa desde ahí."
