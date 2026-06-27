<?php
if (!defined('SITE_URL')) {
    require __DIR__ . '/includes/bootstrap.php';
}
if (!headers_sent()) {
    http_response_code(404);
}
$meta_title = 'Página no encontrada - El Narrador de México';
$meta_canonical = url();
include __DIR__ . '/includes/header.php';
?>
<div class="container">
    <div class="empty" style="padding:6rem 1rem;">
        <h1 style="font-size:4rem;color:var(--gold);font-family:var(--font-heading);">404</h1>
        <p class="big">La página que buscas no existe o fue movida.</p>
        <p style="margin-top:1rem;"><a href="/" class="btn-gold">Volver al inicio</a></p>
    </div>
</div>
<?php include __DIR__ . '/includes/footer.php';
