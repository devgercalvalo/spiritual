-- Datos de ejemplo para desarrollo local. No incluye el usuario admin:
-- créalo con `supabase` Studio (http://localhost:54323 → Authentication) o con el SQL
-- del README, y luego actualiza su role a 'admin' en public.profiles.

insert into public.categories (id, name, slug, description) values
  ('00000000-0000-4000-8000-000000000001', 'Oraciones', 'oraciones', 'Oraciones para distintos propósitos: protección, abundancia, sanación.'),
  ('00000000-0000-4000-8000-000000000002', 'Rituales', 'rituales', 'Rituales espirituales paso a paso.'),
  ('00000000-0000-4000-8000-000000000003', 'Reflexiones', 'reflexiones', 'Reflexiones y mensajes espirituales.');

insert into public.posts (id, title, slug, excerpt, content, category_id, status, seo_title, seo_description, published_at) values
  (
    '00000000-0000-4000-8000-000000000101',
    'Oración de protección para el hogar',
    'oracion-de-proteccion-para-el-hogar',
    'Una oración sencilla para proteger tu hogar de energías negativas.',
    E'# Oración de protección\n\nRepite esta oración al encender una veladora blanca en la entrada de tu casa...\n\n*(contenido de ejemplo — reemplázalo desde el panel admin)*',
    '00000000-0000-4000-8000-000000000001',
    'published',
    'Oración de protección para el hogar',
    'Aprende una oración sencilla para proteger tu hogar de energías negativas.',
    now() - interval '2 days'
  ),
  (
    '00000000-0000-4000-8000-000000000102',
    'Ritual de baño espiritual para la abundancia',
    'ritual-de-bano-espiritual-para-la-abundancia',
    'Paso a paso para preparar un baño espiritual que atraiga abundancia.',
    E'# Ritual de abundancia\n\nNecesitarás: agua de rosas, miel, canela...\n\n*(contenido de ejemplo — reemplázalo desde el panel admin)*',
    '00000000-0000-4000-8000-000000000002',
    'published',
    'Ritual de baño espiritual para la abundancia',
    'Paso a paso para preparar un baño espiritual que atraiga abundancia y buena suerte.',
    now() - interval '1 day'
  );

insert into public.products (id, name, slug, description, mercado_libre_url, price_display, price, is_active) values
  ('00000000-0000-4000-8000-000000000201', 'Veladora blanca de protección', 'veladora-blanca-de-proteccion', 'Veladora artesanal para rituales de protección.', 'https://articulo.mercadolibre.com.mx/', '$89 MXN', 89.00, true),
  ('00000000-0000-4000-8000-000000000202', 'Incienso de canela', 'incienso-de-canela', 'Incienso natural de canela para atraer abundancia.', 'https://articulo.mercadolibre.com.mx/', '$65 MXN', 65.00, true);

insert into public.kits (id, name, slug, description, price, is_active) values
  ('00000000-0000-4000-8000-000000000301', 'Kit de abundancia', 'kit-de-abundancia', 'Todo lo necesario para el ritual de abundancia: veladora, incienso y más.', 139.00, true);

insert into public.kit_products (kit_id, product_id) values
  ('00000000-0000-4000-8000-000000000301', '00000000-0000-4000-8000-000000000201'),
  ('00000000-0000-4000-8000-000000000301', '00000000-0000-4000-8000-000000000202');

insert into public.post_kits (post_id, kit_id) values
  ('00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000301');

insert into public.comments (post_id, author_name, author_email, content, status) values
  ('00000000-0000-4000-8000-000000000101', 'María', 'maria@example.com', 'Muchas gracias, la voy a hacer esta noche.', 'approved'),
  ('00000000-0000-4000-8000-000000000101', 'Anónimo', 'anon@example.com', 'Comentario pendiente de revisión de ejemplo.', 'pending');

-- =========================================================
-- pedido de ejemplo (carrito → pedido manual pendiente de confirmar)
-- =========================================================
insert into public.orders (id, customer_name, customer_email, customer_phone, customer_notes, status, total) values
  ('00000000-0000-4000-8000-000000000401', 'Lucía Fernández', 'lucia@example.com', '+52 55 1234 5678', 'Prefiero recoger en punto de encuentro, no envío.', 'pending', 154.00);

insert into public.order_items (order_id, item_type, product_id, kit_id, name, unit_price, quantity, subtotal) values
  ('00000000-0000-4000-8000-000000000401', 'product', '00000000-0000-4000-8000-000000000201', null, 'Veladora blanca de protección', 89.00, 1, 89.00),
  ('00000000-0000-4000-8000-000000000401', 'product', '00000000-0000-4000-8000-000000000202', null, 'Incienso de canela', 65.00, 1, 65.00);

-- =========================================================
-- hilo de chat de ejemplo (pregunta sobre un kit, sin responder aún)
-- =========================================================
insert into public.chat_threads (id, kit_id, subject, customer_name, customer_email, customer_phone, status) values
  ('00000000-0000-4000-8000-000000000501', '00000000-0000-4000-8000-000000000301', 'Kit de abundancia', 'Roberto Nava', 'roberto@example.com', null, 'open');

insert into public.chat_messages (thread_id, sender_type, sender_name, content) values
  ('00000000-0000-4000-8000-000000000501', 'customer', 'Roberto Nava', '¿El kit de abundancia incluye instrucciones para el ritual o solo los materiales?');
