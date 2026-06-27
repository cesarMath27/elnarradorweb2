<?php
require __DIR__ . '/includes/bootstrap.php';
require __DIR__ . '/includes/partials.php';

$id = (string)($_GET['id'] ?? '');
$mag = $id !== '' ? get_magazine_by_id($id) : null;

if (!$mag) {
    http_response_code(404);
    require __DIR__ . '/404.php';
    exit;
}

$canonical = url('revistas/' . rawurlencode($mag['id']));
$meta_title       = $mag['title'] . ' - Revistas | El Narrador de México';
$meta_description = $mag['description'] ?: ('Lee la revista "' . $mag['title'] . '" de El Narrador de México');
$meta_canonical   = $canonical;
$meta_image       = $mag['cover_image_url'] ?: url('images/banner-narrador.jpg');
$meta_type        = 'article';

include __DIR__ . '/includes/header.php';
?>
<div class="container">
    <nav class="breadcrumb" style="margin-top:1.5rem;">
        <a href="/">Inicio</a><span>/</span>
        <a href="/revistas">Revistas</a><span>/</span>
        <span style="color:var(--muted-light)"><?= e($mag['title']) ?></span>
    </nav>

    <div class="page-head">
        <h1 style="font-size:1.875rem;"><?= e($mag['title']) ?></h1>
        <?php if (!empty($mag['edition'])): ?><p style="color:var(--gold-dark);font-weight:600;margin-top:0.5rem;"><?= e($mag['edition']) ?></p><?php endif; ?>
        <?php if (!empty($mag['description'])): ?><p class="lead"><?= e($mag['description']) ?></p><?php endif; ?>
        <div style="display:flex;align-items:center;flex-wrap:wrap;gap:1rem;margin-top:1rem;">
            <time style="font-size:0.875rem;color:var(--muted-light);"><?= e(fecha_es($mag['published_at'])) ?></time>
            <a href="<?= e($mag['pdf_url']) ?>" download class="btn-gold">⬇ Descargar PDF</a>
            <?php share_buttons($mag['title'], $canonical); ?>
        </div>
        <div class="rule"></div>
    </div>

    <div class="pdf-viewer">
        <iframe src="<?= e($mag['pdf_url']) ?>#toolbar=1&navpanes=0" title="<?= e($mag['title']) ?>"></iframe>
    </div>
</div>
<?php include __DIR__ . '/includes/footer.php';
