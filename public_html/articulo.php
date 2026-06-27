<?php
require __DIR__ . '/includes/bootstrap.php';
require __DIR__ . '/includes/partials.php';

$id = (string)($_GET['id'] ?? '');
$article = $id !== '' ? get_news_by_id($id) : null;

if (!$article) {
    http_response_code(404);
    require __DIR__ . '/404.php';
    exit;
}

// Contador de vistas (best-effort).
increment_view_count($id);

$related = array_values(array_filter(get_latest_news(6), fn($a) => $a['id'] !== $article['id']));
$related = array_slice($related, 0, 5);

$tags = tags_decode($article['tags'] ?? null);
$minutos = tiempo_lectura($article['content'] ?? '');
$canonical = url('articulo/' . rawurlencode($article['id']));

// ── Metadata ──
$meta_title       = $article['title'] . ' - El Narrador de México';
$meta_description = $article['summary'] ?: $article['title'];
$meta_canonical   = $canonical;
$meta_image       = $article['image_url'] ?: url('images/banner-narrador.jpg');
$meta_type        = 'article';

// JSON-LD del artículo + barra de progreso
$jsonld = [
    '@context' => 'https://schema.org',
    '@type' => 'NewsArticle',
    'headline' => $article['title'],
    'description' => $meta_description,
    'image' => $article['image_url'] ?: null,
    'datePublished' => $article['published_at'],
    'dateModified' => $article['published_at'],
    'author' => ['@type' => 'Person', 'name' => $article['author_name']],
    'publisher' => [
        '@type' => 'Organization',
        'name' => 'El Narrador de México',
        'logo' => ['@type' => 'ImageObject', 'url' => url('images/logo.png')],
    ],
    'mainEntityOfPage' => ['@type' => 'WebPage', '@id' => $canonical],
];
$head_extra = '<script type="application/ld+json">'
    . json_encode($jsonld, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
    . '</script>';

include __DIR__ . '/includes/header.php';
?>
<div class="reading-progress" id="reading-progress"></div>
<div class="container">
    <div class="layout">
        <article class="main-col">
            <div class="article-wrap">
                <nav class="breadcrumb">
                    <a href="/">Inicio</a><span>/</span>
                    <?php if (!empty($article['category_slug'])): ?>
                        <a href="/<?= e($article['category_slug']) ?>"><?= e($article['category_name']) ?></a><span>/</span>
                    <?php endif; ?>
                    <span style="color:var(--muted-light)"><?= e($article['title']) ?></span>
                </nav>

                <header class="article-header">
                    <?php if (!empty($article['category_name'])): ?><span class="badge"><?= e($article['category_name']) ?></span><?php endif; ?>
                    <h1><?= e($article['title']) ?></h1>
                    <?php if (!empty($article['summary'])): ?><p class="summary"><?= e($article['summary']) ?></p><?php endif; ?>
                    <div class="meta">
                        <div class="who">
                            <span class="author"><?= e($article['author_name']) ?></span>
                            <time><?= e(fecha_es($article['published_at'], true)) ?></time>
                            <span>⏱ <?= $minutos ?> min de lectura</span>
                        </div>
                        <?php share_buttons($article['title'], $canonical); ?>
                    </div>
                </header>

                <?php if (!empty($article['image_url'])): ?>
                <div class="article-hero">
                    <img src="<?= e($article['image_url']) ?>" alt="<?= e($article['title']) ?>">
                </div>
                <?php endif; ?>

                <div class="article-content">
                    <?= strip_dangerous_html($article['content'] ?? '') ?>
                </div>

                <?php ad_unit(''); ?>

                <?php if ($tags): ?>
                <div class="tags">
                    <span style="font-size:0.875rem;color:var(--muted);font-weight:500;">Etiquetas:</span>
                    <?php foreach ($tags as $t): ?><span class="tag"><?= e((string)$t) ?></span><?php endforeach; ?>
                </div>
                <?php endif; ?>

                <?php if (!empty($article['source_url'])): ?>
                <div style="margin-top:1rem;">
                    <a href="<?= e($article['source_url']) ?>" target="_blank" rel="noopener noreferrer" style="color:var(--gold-dark);font-size:0.875rem;">Ver fuente original</a>
                </div>
                <?php endif; ?>
            </div>
        </article>

        <div class="side-col">
            <?php sidebar_block('Noticias Recientes', $related); ?>
        </div>
    </div>
</div>
<?php include __DIR__ . '/includes/footer.php';
