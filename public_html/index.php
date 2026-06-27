<?php
require __DIR__ . '/includes/bootstrap.php';
require __DIR__ . '/includes/partials.php';

$latest     = get_latest_news(12);
$featured   = get_featured_news();
$mostViewed = get_most_viewed(5);
$magazines  = get_magazines(3);

$hero = $featured[0] ?? ($latest[0] ?? null);
$heroId = $hero['id'] ?? null;
$grid = array_values(array_filter($latest, fn($a) => $a['id'] !== $heroId));
$firstHalf = array_slice($grid, 0, 6);
$secondHalf = array_slice($grid, 6);

include __DIR__ . '/includes/header.php';
?>
<!-- Banner de marca -->
<section class="hero-banner">
    <img class="bg" src="/images/banner-narrador.jpg" alt="El Narrador de México - Paisajes de México">
    <div class="overlay"></div>
    <div class="logo-center">
        <img src="/images/logo-horizontal-blanco.png" alt="El Narrador de México">
    </div>
</section>

<!-- Ticker de últimas noticias -->
<?php if ($latest): ?>
<div class="ticker">
    <div class="container ticker-inner">
        <span class="ticker-badge">En vivo</span>
        <div class="ticker-track">
            <?php foreach (array_slice($latest, 0, 8) as $i => $a): ?>
                <a class="ticker-item" href="/articulo/<?= e(rawurlencode($a['id'])) ?>" data-ticker style="display:<?= $i === 0 ? 'inline' : 'none' ?>">
                    <span class="cat"><?= e($a['category_name']) ?></span><?= e($a['title']) ?>
                </a>
            <?php endforeach; ?>
        </div>
    </div>
</div>
<?php endif; ?>

<div class="container">
    <div class="layout">
        <div class="main-col">
            <?php if ($hero): ?>
            <section class="section">
                <a href="/articulo/<?= e(rawurlencode($hero['id'])) ?>" class="featured">
                    <?php if (!empty($hero['image_url'])): ?>
                        <img src="<?= e($hero['image_url']) ?>" alt="<?= e($hero['title']) ?>">
                    <?php endif; ?>
                    <div class="grad"></div>
                    <div class="content">
                        <?php if (!empty($hero['category_name'])): ?><span class="badge"><?= e($hero['category_name']) ?></span><?php endif; ?>
                        <h2><?= e($hero['title']) ?></h2>
                        <?php if (!empty($hero['summary'])): ?><p class="summary"><?= e($hero['summary']) ?></p><?php endif; ?>
                        <div class="meta">
                            <span><?= e($hero['author_name']) ?></span>
                            <span><?= e(fecha_es($hero['published_at'])) ?></span>
                        </div>
                    </div>
                </a>
            </section>
            <?php endif; ?>

            <section class="section">
                <div class="section-head"><h2>Últimas Noticias</h2><div class="rule"></div></div>
                <?php article_grid($firstHalf, 3); ?>
            </section>

            <?php ad_unit(''); ?>

            <!-- Sección editorial -->
            <section class="editorial">
                <img src="/images/editorial-section.jpg" alt="Voces del Mundo - Sección Editorial">
                <div class="center">
                    <div>
                        <p class="kicker">Personajes</p>
                        <h2>Voces del Mundo</h2>
                        <div class="underline"></div>
                    </div>
                </div>
            </section>

            <?php if ($secondHalf): ?>
            <section class="section">
                <div class="section-head"><h2>Más Noticias</h2><div class="rule"></div></div>
                <?php article_grid($secondHalf, 3); ?>
            </section>
            <?php endif; ?>
        </div>

        <aside class="side-col">
            <?php sidebar_block('Más Leídas', $mostViewed); ?>

            <?php if ($magazines): ?>
            <div class="sidebar">
                <h3>Revistas</h3>
                <div style="display:flex;flex-direction:column;gap:1rem;">
                    <?php foreach ($magazines as $m): ?>
                        <a href="/revistas/<?= e(rawurlencode($m['id'])) ?>" class="sidebar-item">
                            <div class="thumb" style="width:3.5rem;height:4.5rem;">
                                <?php if (!empty($m['cover_image_url'])): ?><img src="<?= e($m['cover_image_url']) ?>" alt="<?= e($m['title']) ?>"><?php endif; ?>
                            </div>
                            <div><h4><?= e($m['title']) ?></h4>
                            <?php if (!empty($m['edition'])): ?><span class="cat"><?= e($m['edition']) ?></span><?php endif; ?></div>
                        </a>
                    <?php endforeach; ?>
                </div>
                <a href="/revistas" style="display:inline-block;margin-top:0.75rem;color:var(--gold-dark);font-size:0.875rem;font-weight:600;">Ver todas las revistas →</a>
            </div>
            <?php endif; ?>

            <?php if (count($featured) > 1) sidebar_block('Destacadas', array_slice($featured, 1)); ?>
        </aside>
    </div>
</div>
<?php include __DIR__ . '/includes/footer.php';
