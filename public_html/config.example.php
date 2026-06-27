<?php
/**
 * config.example.php  ->  copia este archivo a  config.php  y rellena tus datos.
 *
 * config.php NO se sube al repositorio (está en .gitignore). En Neubox lo creas
 * directamente por el Administrador de archivos de cPanel o por FTP.
 */

return [
    // ─── Base de datos MySQL de Neubox (cPanel -> Bases de datos MySQL) ───
    'db' => [
        'host'    => 'localhost',          // en Neubox casi siempre 'localhost'
        'name'    => 'usuario_narrador',   // nombre completo de la BD (con prefijo de cPanel)
        'user'    => 'usuario_narrador',   // usuario MySQL
        'pass'    => 'TU_CONTRASEÑA_AQUI',  // contraseña del usuario MySQL
        'charset' => 'utf8mb4',
    ],

    // ─── URL pública del sitio (sin barra final) ───
    'site_url' => 'https://elnarradordemexico.com',

    // ─── Carpeta física donde se guardan las imágenes/PDF subidos ───
    // Relativa a public_html. Debe tener permisos de escritura (755/775).
    'uploads_dir' => __DIR__ . '/uploads',
    'uploads_url' => '/uploads',

    // ─── Google AdSense (mismo ID que el sitio actual) ───
    'adsense_client' => 'ca-pub-7008735814072307',

    // ─── Seguridad de sesión del panel ───
    'session_name' => 'narrador_admin',
];
