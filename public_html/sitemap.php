<?php
require __DIR__ . '/includes/bootstrap.php';

header('Content-Type: application/xml; charset=utf-8');

$pdo = db();
$articles  = $pdo->query("SELECT id, published_at FROM news ORDER BY published_at DESC")->fetchAll();
$magazines = $pdo->query("SELECT id, published_at FROM magazines ORDER BY published_at DESC")->fetchAll();

function iso(?string $dt): string
{
    try { return (new DateTime($dt ?: 'now', new DateTimeZone('UTC')))->format('Y-m-d'); }
    catch (Exception $e) { return date('Y-m-d'); }
}

echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";

$today = date('Y-m-d');

// Estáticas
$static = [
    [url(), $today, 'hourly', '1.0'],
    [url('revistas'), $today, 'weekly', '0.8'],
    [url('buscar'), $today, 'monthly', '0.3'],
];
foreach ($static as [$loc, $lm, $cf, $pr]) {
    echo "  <url><loc>" . e($loc) . "</loc><lastmod>$lm</lastmod><changefreq>$cf</changefreq><priority>$pr</priority></url>\n";
}

// Categorías
foreach (array_keys(CATEGORIES) as $slug) {
    echo "  <url><loc>" . e(url($slug)) . "</loc><lastmod>$today</lastmod><changefreq>hourly</changefreq><priority>0.9</priority></url>\n";
}

// Artículos
foreach ($articles as $a) {
    echo "  <url><loc>" . e(url('articulo/' . rawurlencode($a['id']))) . "</loc><lastmod>" . iso($a['published_at']) . "</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>\n";
}

// Revistas
foreach ($magazines as $m) {
    echo "  <url><loc>" . e(url('revistas/' . rawurlencode($m['id']))) . "</loc><lastmod>" . iso($m['published_at']) . "</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>\n";
}

echo '</urlset>';
