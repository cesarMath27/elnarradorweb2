<?php
require __DIR__ . '/includes/bootstrap.php';
require __DIR__ . '/includes/partials.php';

$q = trim((string)($_GET['q'] ?? ''));
$results = $q !== '' ? search_news($q) : [];

$meta_title     = $q !== '' ? "Resultados para \"$q\" - El Narrador de México" : 'Buscar - El Narrador de México';
$meta_canonical = url('buscar');

include __DIR__ . '/includes/header.php';
?>
<div class="container" style="max-width:64rem;">
    <div class="page-head">
        <h1 style="font-size:1.875rem;">Buscar Noticias</h1>
        <?php if ($q !== ''): ?>
            <p class="lead"><?= count($results) ?> resultado<?= count($results) !== 1 ? 's' : '' ?> para
                <span style="color:var(--gold-dark);font-weight:600;">&ldquo;<?= e($q) ?>&rdquo;</span></p>
        <?php endif; ?>
        <div class="rule"></div>
    </div>

    <?php if ($q === ''): ?>
        <p class="empty">Escribe en la barra de búsqueda para encontrar noticias.</p>
    <?php elseif (!$results): ?>
        <div class="empty">
            <p class="big">No se encontraron resultados para &ldquo;<?= e($q) ?>&rdquo;</p>
            <p>Intenta con otros términos de búsqueda.</p>
        </div>
    <?php else: ?>
        <div style="display:flex;flex-direction:column;gap:1rem;">
            <?php foreach ($results as $a) article_card($a, 'horizontal'); ?>
        </div>
    <?php endif; ?>
</div>
<?php include __DIR__ . '/includes/footer.php';
