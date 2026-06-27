<?php
require __DIR__ . '/includes/bootstrap.php';
require __DIR__ . '/includes/partials.php';

$magazines = get_magazines();

$meta_title       = 'Revistas - El Narrador de México';
$meta_description = 'Lee nuestras revistas digitales. Descarga o consulta en línea las publicaciones de El Narrador de México.';
$meta_canonical   = url('revistas');

include __DIR__ . '/includes/header.php';
?>
<div class="container">
    <div class="page-head">
        <div class="title-row"><div class="bar"></div><h1>Revistas</h1></div>
        <p class="lead">Consulta y descarga nuestras publicaciones digitales. Cada edición trae análisis, reportajes y contenido exclusivo.</p>
        <div class="rule"></div>
    </div>

    <?php if ($magazines): ?>
        <div class="mag-grid">
            <?php foreach ($magazines as $m) magazine_card($m); ?>
        </div>
    <?php else: ?>
        <div class="empty">
            <p class="big">Próximamente nuevas ediciones de nuestra revista.</p>
            <p>Vuelve pronto para consultar nuestras publicaciones.</p>
        </div>
    <?php endif; ?>
</div>
<?php include __DIR__ . '/includes/footer.php';
