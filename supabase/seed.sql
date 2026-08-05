-- Datos de ejemplo para desarrollo local. No incluye el usuario admin:
-- créalo con `supabase` Studio (http://localhost:54323 → Authentication) o con el SQL
-- del README, y luego actualiza su role a 'admin' en public.profiles.

insert into public.categories (id, name, slug, description) values
  ('00000000-0000-0000-0000-000000000001', 'Oraciones', 'oraciones', 'Oraciones para distintos propósitos: protección, abundancia, sanación.'),
  ('00000000-0000-0000-0000-000000000002', 'Rituales', 'rituales', 'Rituales espirituales paso a paso.'),
  ('00000000-0000-0000-0000-000000000003', 'Reflexiones', 'reflexiones', 'Reflexiones y mensajes espirituales.');

insert into public.posts (id, title, slug, excerpt, content, category_id, status, seo_title, seo_description, published_at) values
  (
    '00000000-0000-0000-0000-000000000101',
    'Oración de protección para el hogar',
    'oracion-de-proteccion-para-el-hogar',
    'Una oración sencilla para proteger tu hogar de energías negativas.',
    E'# Oración de protección\n\nRepite esta oración al encender una veladora blanca en la entrada de tu casa...\n\n*(contenido de ejemplo — reemplázalo desde el panel admin)*',
    '00000000-0000-0000-0000-000000000001',
    'published',
    'Oración de protección para el hogar',
    'Aprende una oración sencilla para proteger tu hogar de energías negativas.',
    now() - interval '2 days'
  ),
  (
    '00000000-0000-0000-0000-000000000102',
    'Ritual de baño espiritual para la abundancia',
    'ritual-de-bano-espiritual-para-la-abundancia',
    'Paso a paso para preparar un baño espiritual que atraiga abundancia.',
    E'# Ritual de abundancia\n\nNecesitarás: agua de rosas, miel, canela...\n\n*(contenido de ejemplo — reemplázalo desde el panel admin)*',
    '00000000-0000-0000-0000-000000000002',
    'published',
    'Ritual de baño espiritual para la abundancia',
    'Paso a paso para preparar un baño espiritual que atraiga abundancia y buena suerte.',
    now() - interval '1 day'
  );

insert into public.products (id, name, slug, description, mercado_libre_url, price_display, is_active) values
  ('00000000-0000-0000-0000-000000000201', 'Veladora blanca de protección', 'veladora-blanca-de-proteccion', 'Veladora artesanal para rituales de protección.', 'https://articulo.mercadolibre.com.mx/', '$89 MXN', true),
  ('00000000-0000-0000-0000-000000000202', 'Incienso de canela', 'incienso-de-canela', 'Incienso natural de canela para atraer abundancia.', 'https://articulo.mercadolibre.com.mx/', '$65 MXN', true);

insert into public.kits (id, name, slug, description, is_active) values
  ('00000000-0000-0000-0000-000000000301', 'Kit de abundancia', 'kit-de-abundancia', 'Todo lo necesario para el ritual de abundancia: veladora, incienso y más.', true);

insert into public.kit_products (kit_id, product_id) values
  ('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000201'),
  ('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000202');

insert into public.post_kits (post_id, kit_id) values
  ('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000301');

insert into public.comments (post_id, author_name, author_email, content, status) values
  ('00000000-0000-0000-0000-000000000101', 'María', 'maria@example.com', 'Muchas gracias, la voy a hacer esta noche.', 'approved'),
  ('00000000-0000-0000-0000-000000000101', 'Anónimo', 'anon@example.com', 'Comentario pendiente de revisión de ejemplo.', 'pending');
