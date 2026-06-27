<?php
require __DIR__ . '/includes/bootstrap.php';
require __DIR__ . '/includes/partials.php';

$slug = (string)($_GET['cat'] ?? '');
if (!isset(CATEGORIES[$slug])) {
    http_response_code(404);
    require __DIR__ . '/404.php';
    exit;
}
$name = CATEGORIES[$slug];

$articles   = get_news_by_category($slug, 20);
$mostViewed = get_most_viewed(5);

$meta_title       = $name . ' - El Narrador de México';
$meta_description = 'Noticias de ' . $name . ' en El Narrador de México';
$meta_canonical   = url($slug);

include __DIR__ . '/includes/header.php';
?>
<div class="container">
    <div class="page-head">
        <div class="title-row"><div class="bar"></div><h1><?= e($name) ?></h1></div>
        <div class="rule"></div>
    </div>
    <div class="layout" style="padding-top:0;">
        <div class="main-col">
            <?php if ($articles): ?>
                <?php article_grid($articles, 2); ?>
            <?php else: ?>
                <div class="empty"><p class="big">No hay noticias en esta categoría por el momento.</p></div>
            <?php endif; ?>
        </div>
        <div class="side-col">
            <?php sidebar_block('Más Leídas', $mostViewed); ?>
        </div>
    </div>
</div>
<?php include __DIR__ . '/includes/footer.php';
