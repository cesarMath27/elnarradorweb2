<?php
/**
 * download-supabase-media.php — migra los medios de Supabase Storage al disco.
 *
 * Muchas notas y revistas tienen image_url / cover_image_url / pdf_url que
 * apuntan a  ...supabase.co/storage/...  Esas URLs DEJAN DE FUNCIONAR cuando
 * apagas el proyecto de Supabase. Este script:
 *   1) busca en la BD MySQL todos esos enlaces,
 *   2) descarga cada archivo a  public_html/uploads/migrated/,
 *   3) actualiza la BD para que apunten a  /uploads/migrated/<archivo>.
 *
 * Ejecútalo EN NEUBOX (donde está la BD y hay salida a internet), por la
 * Terminal de cPanel o como tarea cron de una sola vez:
 *
 *     php /home/USUARIO/public_html/../tools/download-supabase-media.php
 *
 * (o copia tools/ junto a public_html). Requiere que config.php ya exista y
 * que los datos estén importados. Es seguro re-ejecutarlo (omite lo ya hecho).
 */

if (php_sapi_name() !== 'cli') {
    http_response_code(403);
    die("Este script solo se ejecuta por línea de comandos (CLI).\n");
}

$CONFIG = require __DIR__ . '/../public_html/config.php';
$c = $CONFIG['db'];
$pdo = new PDO("mysql:host={$c['host']};dbname={$c['name']};charset=utf8mb4", $c['user'], $c['pass'], [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
]);

$destDir = __DIR__ . '/../public_html/uploads/migrated';
if (!is_dir($destDir)) mkdir($destDir, 0775, true);

$needle = 'supabase.co/storage/';
$downloaded = 0; $skipped = 0; $failed = 0;

/** Descarga una URL a un archivo local; devuelve la ruta pública o null. */
function migrate_url(string $url, string $destDir): ?string {
    global $downloaded, $skipped, $failed, $needle;
    if (strpos($url, $needle) === false) return null;  // no es de Supabase

    $name = basename(parse_url($url, PHP_URL_PATH));
    $name = preg_replace('/[^A-Za-z0-9._-]/', '_', $name) ?: ('file-' . md5($url));
    $localPath = $destDir . '/' . $name;
    $publicUrl = '/uploads/migrated/' . $name;

    if (is_file($localPath) && filesize($localPath) > 0) { $skipped++; return $publicUrl; }

    $ch = curl_init($url);
    curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_FOLLOWLOCATION => true, CURLOPT_TIMEOUT => 120]);
    $data = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($data === false || $code >= 400 || $data === '') { $failed++; fwrite(STDERR, "  FALLO ($code): $url\n"); return null; }
    file_put_contents($localPath, $data);
    $downloaded++;
    echo "  OK: $name\n";
    return $publicUrl;
}

// ── news.image_url ──
echo "Procesando news.image_url...\n";
$rows = $pdo->query("SELECT id, image_url FROM news WHERE image_url LIKE '%$needle%'")->fetchAll();
$upd = $pdo->prepare("UPDATE news SET image_url = :u WHERE id = :id");
foreach ($rows as $r) {
    $new = migrate_url($r['image_url'], $destDir);
    if ($new) $upd->execute([':u' => $new, ':id' => $r['id']]);
}

// ── magazines.cover_image_url y pdf_url ──
echo "Procesando magazines...\n";
$rows = $pdo->query("SELECT id, cover_image_url, pdf_url FROM magazines WHERE cover_image_url LIKE '%$needle%' OR pdf_url LIKE '%$needle%'")->fetchAll();
$updCover = $pdo->prepare("UPDATE magazines SET cover_image_url = :u WHERE id = :id");
$updPdf   = $pdo->prepare("UPDATE magazines SET pdf_url = :u WHERE id = :id");
foreach ($rows as $r) {
    if ($r['cover_image_url']) { $n = migrate_url($r['cover_image_url'], $destDir); if ($n) $updCover->execute([':u'=>$n, ':id'=>$r['id']]); }
    if ($r['pdf_url'])         { $n = migrate_url($r['pdf_url'], $destDir);         if ($n) $updPdf->execute([':u'=>$n, ':id'=>$r['id']]); }
}

echo "\nListo. Descargados: $downloaded · Ya existían: $skipped · Fallidos: $failed\n";
echo "Los medios quedaron en public_html/uploads/migrated/ y la BD ya apunta ahí.\n";
