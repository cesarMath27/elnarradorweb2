-- =====================================================================
--  El Narrador de México — Datos para MySQL / MariaDB (Neubox)
--
--  ⚠️  ESTE ARCHIVO ESTÁ INCOMPLETO A PROPÓSITO.
--  Contiene las tablas pequeñas (categorías, autores, revistas, usuarios y
--  relaciones), pero NO las 556 notas: su contenido pesa ~6.3 MB y la
--  política de red de la sesión de Claude bloqueó la descarga directa
--  desde Supabase.
--
--  👉  Para generar el archivo COMPLETO (incluyendo las 556 notas), ejecuta
--      desde tu equipo (donde Supabase sí es alcanzable):
--
--        SUPABASE_URL="https://fewwvcrfhdgnpfjyadev.supabase.co" \
--        SUPABASE_ANON_KEY="<tu_anon_key>" \
--        php tools/export-supabase-to-mysql.php
--
--      Eso REGENERA este mismo archivo con TODAS las tablas y datos.
--
--  Orden de importación en phpMyAdmin:
--    1) database/schema.sql   (crea las tablas)
--    2) database/data.sql     (este archivo, o el regenerado completo)
-- =====================================================================

SET NAMES utf8mb4;
SET time_zone = '+00:00';
SET FOREIGN_KEY_CHECKS = 0;

-- ----- categories (10 filas) -----
INSERT INTO `categories` (`id`, `name`, `icon`, `color`, `sort_order`, `created_at`) VALUES
('politica', 'Política', '🏛️', 22479296, 1, '2026-02-22 23:58:03'),
('economia', 'Economía', '📊', 3047218, 2, '2026-02-22 23:58:03'),
('seguridad', 'Seguridad', '🛡️', 12986408, 3, '2026-02-22 23:58:03'),
('tecnologia', 'Tecnología', '💻', 6953114, 4, '2026-02-22 23:58:03'),
('deportes', 'Deportes', '⚽', 15691520, 5, '2026-02-22 23:58:03'),
('cultura', 'Cultura', '🎭', 34447, 6, '2026-02-22 23:58:03'),
('estados', 'Estados', '🗺️', 5124910, 7, '2026-02-22 23:58:03'),
('mundo', 'Mundo', '🌎', 3622735, 8, '2026-02-22 23:58:03'),
('ciencia', 'Ciencia', '🔬', 1793312, 9, '2026-02-22 23:58:03'),
('entretenimiento', 'Entretenimiento', '🎬', 11342935, 10, '2026-02-22 23:58:03');

-- ----- authors (6 filas) -----
INSERT INTO `authors` (`id`, `name`, `bio`, `avatar_url`, `email`, `created_at`) VALUES
('9e658e06-263b-45c7-8ebd-8b90be18e166', 'Carlos Herrera', 'Editor de economía y finanzas', NULL, NULL, '2026-02-22 23:58:03'),
('bbaf826d-e52f-43e7-ae50-16ff539e8ad4', 'María González', 'Periodista especializada en política nacional', NULL, NULL, '2026-02-22 23:58:03'),
('f01b1244-e34d-483e-ac96-5dc4cb43be6a', 'Ana Rodríguez', 'Corresponsal de tecnología', NULL, NULL, '2026-02-22 23:58:03'),
('26d07f31-9abb-4cb4-a80c-8006949bf88e', 'Redacción', NULL, NULL, NULL, '2026-03-08 15:55:29'),
('8f9cef42-32b4-4630-b164-ac764fe59c26', 'Ana García', NULL, NULL, NULL, '2026-03-08 15:55:29'),
('afd5a6d1-920b-4eab-8a95-4f6a2402adba', 'Redaccion', NULL, NULL, NULL, '2026-03-08 15:55:29');

-- ----- magazines (3 filas) — OJO: las URL apuntan a Supabase Storage (ver DEPLOY-NEUBOX.md, paso de medios) -----
INSERT INTO `magazines` (`id`, `title`, `description`, `cover_image_url`, `pdf_url`, `edition`, `published_at`, `created_at`, `is_featured`, `view_count`, `download_count`) VALUES
('a9d1ecac-629a-43b3-931f-74f873eb330c', 'Cuba - EL NARRADOR DE MEXICO', 'Cuba', 'https://fewwvcrfhdgnpfjyadev.supabase.co/storage/v1/object/public/media/magazines/1776285788457-cover-cuba-el-narrador-de-mexico.jpeg', 'https://fewwvcrfhdgnpfjyadev.supabase.co/storage/v1/object/public/media/magazines/1776285788457-pdf-cuba-el-narrador-de-mexico.pdf', 'Febrero 2026', '2026-04-15 20:43:13', '2026-04-15 20:43:13', 1, 0, 0),
('f1358085-1205-44d5-8133-d36f11505ac9', 'Barbacid - EL NARRADOR DE MEXICO', 'Barbacid ', 'https://fewwvcrfhdgnpfjyadev.supabase.co/storage/v1/object/public/media/magazines/1779401414763-cover-barbacid-el-narrador-de-mexico.jpeg', 'https://fewwvcrfhdgnpfjyadev.supabase.co/storage/v1/object/public/media/magazines/1779401415068-pdf-barbacid-el-narrador-de-mexico.pdf', 'Mayo 2026', '2026-05-21 22:10:16', '2026-05-21 22:10:16', 1, 0, 0),
('a1cba245-89e2-419d-89c5-9d4a3155f02f', 'El mundial - EL NARRADOR DE MEXICO', 'El mundial 2026 - EL NARRADOR DE MEXICO', 'https://fewwvcrfhdgnpfjyadev.supabase.co/storage/v1/object/public/media/magazines/1780602213781-cover-el-mundial-el-narrador-de-mexico.jpeg', 'https://fewwvcrfhdgnpfjyadev.supabase.co/storage/v1/object/public/media/magazines/1780602214261-pdf-el-mundial-el-narrador-de-mexico.pdf', 'junio 2026', '2026-06-04 19:43:34', '2026-06-04 19:43:35', 1, 0, 0);

-- ----- admin_users (10 filas) — password_hash en NULL: fija las contraseñas con tools/hash-password.php -----
INSERT INTO `admin_users` (`id`, `email`, `display_name`, `role`, `password_hash`, `created_at`) VALUES
('b1773070-3824-4055-a79b-7d9c0df17f35', 'cesaradrianrs660@gmail.com', 'Cesar Adrian', 'owner', NULL, '2026-03-11 23:47:29'),
('11c8dc32-2842-4d76-995d-7f65afc711f2', 'vencomercio.programacion3@gmail.com', 'Ana', 'writer', NULL, '2026-03-11 23:51:08'),
('5157884e-84f0-4362-aa30-f51b0b12b027', 'coord.reporteros@gmail.com', 'Hector-Alm', 'writer', NULL, '2026-03-12 16:48:14'),
('dcc10c16-9ef6-42c2-8317-754718deadf9', 'program.info.web.social1@elnarradordemexico.com', 'Melissa', 'writer', NULL, '2026-03-12 16:57:49'),
('c2669814-175b-4f02-8045-dcb5b64aa441', 'paratrabajo719@gmail.com', 'Ana', 'writer', NULL, '2026-03-13 00:44:13'),
('8dc207d2-1082-465e-9e84-54b67aeb65c2', 'program.desarrollo.web02@socialite-mexicaine.com', 'Samantha', 'editor', NULL, '2026-04-09 17:20:41'),
('4370d5a4-ed84-4004-96ba-371a4a301435', 'program.desarrollo.web@socialite-mexicaine.com', 'Ramon', 'editor', NULL, '2026-04-09 17:21:56'),
('3707f7c2-91e6-4a5b-a8e5-87d6503e5a63', 'program.desarrollo.web01@socialite-mexicaine.com', 'Valeria', 'editor', NULL, '2026-04-09 17:24:44'),
('86e622d0-ca4a-43ef-8c1b-f60982d70c3a', 'contenido.editorial01@socialite-mexicaine.com', 'Hector-Allan', 'editor', NULL, '2026-04-21 18:50:32'),
('4efde568-5d1f-4453-ad64-5bbb9a70f187', 'cesaradrianmath27c@gmail.com', 'cesar', 'writer', NULL, '2026-05-21 22:08:52');

-- ----- news (556 filas) — NO incluidas aquí. Ejecuta tools/export-supabase-to-mysql.php para añadirlas. -----

-- ----- news_authors (53 filas) -----
INSERT INTO `news_authors` (`news_id`, `author_id`) VALUES
('wp-72153', '8f9cef42-32b4-4630-b164-ac764fe59c26'),
('wp-72157', '8f9cef42-32b4-4630-b164-ac764fe59c26'),
('wp-72166', '8f9cef42-32b4-4630-b164-ac764fe59c26'),
('wp-72169', '8f9cef42-32b4-4630-b164-ac764fe59c26'),
('wp-72173', '8f9cef42-32b4-4630-b164-ac764fe59c26'),
('wp-72176', '8f9cef42-32b4-4630-b164-ac764fe59c26'),
('wp-72179', '8f9cef42-32b4-4630-b164-ac764fe59c26'),
('wp-72182', '8f9cef42-32b4-4630-b164-ac764fe59c26'),
('wp-72216', '26d07f31-9abb-4cb4-a80c-8006949bf88e'),
('wp-72224', '26d07f31-9abb-4cb4-a80c-8006949bf88e'),
('wp-72236', '26d07f31-9abb-4cb4-a80c-8006949bf88e'),
('wp-72244', '26d07f31-9abb-4cb4-a80c-8006949bf88e'),
('wp-72268', '26d07f31-9abb-4cb4-a80c-8006949bf88e'),
('wp-72272', 'afd5a6d1-920b-4eab-8a95-4f6a2402adba'),
('wp-72285', 'afd5a6d1-920b-4eab-8a95-4f6a2402adba'),
('wp-72288', 'afd5a6d1-920b-4eab-8a95-4f6a2402adba'),
('wp-72292', 'afd5a6d1-920b-4eab-8a95-4f6a2402adba'),
('wp-72295', 'afd5a6d1-920b-4eab-8a95-4f6a2402adba'),
('wp-72298', 'afd5a6d1-920b-4eab-8a95-4f6a2402adba'),
('wp-72302', 'afd5a6d1-920b-4eab-8a95-4f6a2402adba'),
('wp-72305', 'afd5a6d1-920b-4eab-8a95-4f6a2402adba'),
('wp-72308', 'afd5a6d1-920b-4eab-8a95-4f6a2402adba'),
('wp-72312', 'afd5a6d1-920b-4eab-8a95-4f6a2402adba'),
('wp-72321', 'afd5a6d1-920b-4eab-8a95-4f6a2402adba'),
('wp-72324', 'afd5a6d1-920b-4eab-8a95-4f6a2402adba'),
('wp-72327', 'afd5a6d1-920b-4eab-8a95-4f6a2402adba'),
('wp-72330', 'afd5a6d1-920b-4eab-8a95-4f6a2402adba'),
('wp-72333', 'afd5a6d1-920b-4eab-8a95-4f6a2402adba'),
('wp-72337', 'afd5a6d1-920b-4eab-8a95-4f6a2402adba'),
('wp-72340', 'afd5a6d1-920b-4eab-8a95-4f6a2402adba'),
('wp-72343', 'afd5a6d1-920b-4eab-8a95-4f6a2402adba'),
('wp-72348', 'afd5a6d1-920b-4eab-8a95-4f6a2402adba'),
('wp-72354', 'afd5a6d1-920b-4eab-8a95-4f6a2402adba'),
('wp-72467', 'afd5a6d1-920b-4eab-8a95-4f6a2402adba'),
('wp-72470', 'afd5a6d1-920b-4eab-8a95-4f6a2402adba'),
('wp-72474', 'afd5a6d1-920b-4eab-8a95-4f6a2402adba'),
('wp-72480', 'afd5a6d1-920b-4eab-8a95-4f6a2402adba'),
('wp-72483', 'afd5a6d1-920b-4eab-8a95-4f6a2402adba'),
('wp-72486', 'afd5a6d1-920b-4eab-8a95-4f6a2402adba'),
('wp-72489', 'afd5a6d1-920b-4eab-8a95-4f6a2402adba'),
('wp-72492', 'afd5a6d1-920b-4eab-8a95-4f6a2402adba'),
('wp-72502', 'afd5a6d1-920b-4eab-8a95-4f6a2402adba'),
('wp-72507', 'afd5a6d1-920b-4eab-8a95-4f6a2402adba'),
('wp-72512', 'afd5a6d1-920b-4eab-8a95-4f6a2402adba'),
('wp-72515', 'afd5a6d1-920b-4eab-8a95-4f6a2402adba'),
('wp-72519', 'afd5a6d1-920b-4eab-8a95-4f6a2402adba'),
('wp-72522', 'afd5a6d1-920b-4eab-8a95-4f6a2402adba'),
('wp-72525', 'afd5a6d1-920b-4eab-8a95-4f6a2402adba'),
('wp-72528', 'afd5a6d1-920b-4eab-8a95-4f6a2402adba'),
('wp-72531', 'afd5a6d1-920b-4eab-8a95-4f6a2402adba'),
('wp-72534', 'afd5a6d1-920b-4eab-8a95-4f6a2402adba'),
('wp-72537', 'afd5a6d1-920b-4eab-8a95-4f6a2402adba'),
('wp-72541', 'afd5a6d1-920b-4eab-8a95-4f6a2402adba');

SET FOREIGN_KEY_CHECKS = 1;
