<?php
/**
 * partials.php — componentes de presentación reutilizables.
 */

declare(strict_types=1);

/** Tarjeta de artículo. $variant = 'default' | 'horizontal'. */
function article_card(array $a, string $variant = 'default'): void
{
    $href = '/articulo/' . rawurlencode($a['id']);
    $cat = e($a['category_name'] ?? '');
    ?>
    <a href="<?= e($href) ?>" class="card <?= $variant === 'horizontal' ? 'horizontal' : '' ?>">
        <div class="thumb">
            <?php if (!empty($a['image_url'])): ?>
                <img src="<?= e($a['image_url']) ?>" alt="<?= e($a['title']) ?>" loading="lazy">
            <?php endif; ?>
        </div>
        <div class="body">
            <?php if ($cat): ?><span class="badge small"><?= $cat ?></span><?php endif; ?>
            <h3><?= e($a['title']) ?></h3>
            <?php if (!empty($a['summary'])): ?><p class="summary"><?= e($a['summary']) ?></p><?php endif; ?>
            <div class="meta">
                <span><?= e($a['author_name'] ?? '') ?></span>
                <span><?= e(fecha_corta($a['published_at'])) ?></span>
            </div>
        </div>
    </a>
    <?php
}

/** Rejilla de artículos. $cols = 2 | 3. */
function article_grid(array $articles, int $cols = 3): void
{
    echo '<div class="grid cols-' . ($cols === 2 ? '2' : '3') . '">';
    foreach ($articles as $a) {
        article_card($a);
    }
    echo '</div>';
}

/** Bloque de barra lateral (Más leídas, Destacadas, Recientes). */
function sidebar_block(string $title, array $articles): void
{
    if (!$articles) return;
    ?>
    <aside class="sidebar">
        <h3><?= e($title) ?></h3>
        <?php foreach ($articles as $i => $a): $href = '/articulo/' . rawurlencode($a['id']); ?>
            <a href="<?= e($href) ?>" class="sidebar-item">
                <div class="thumb">
                    <?php if (!empty($a['image_url'])): ?>
                        <img src="<?= e($a['image_url']) ?>" alt="<?= e($a['title']) ?>" loading="lazy">
                    <?php endif; ?>
                </div>
                <div>
                    <span class="cat"><?= e($a['category_name'] ?? '') ?></span>
                    <h4><?= e($a['title']) ?></h4>
                </div>
            </a>
        <?php endforeach; ?>
    </aside>
    <?php
}

/** Tarjeta de revista. */
function magazine_card(array $m): void
{
    $href = '/revistas/' . rawurlencode($m['id']);
    ?>
    <a href="<?= e($href) ?>" class="mag-card">
        <div class="cover">
            <?php if (!empty($m['cover_image_url'])): ?>
                <img src="<?= e($m['cover_image_url']) ?>" alt="<?= e($m['title']) ?>" loading="lazy">
            <?php endif; ?>
            <?php if (!empty($m['is_featured'])): ?><span class="featured-tag">Destacada</span><?php endif; ?>
        </div>
        <div class="body">
            <h3><?= e($m['title']) ?></h3>
            <?php if (!empty($m['edition'])): ?><p class="edition"><?= e($m['edition']) ?></p><?php endif; ?>
            <?php if (!empty($m['description'])): ?><p class="desc"><?= e($m['description']) ?></p><?php endif; ?>
            <p class="date"><?= e(fecha_es($m['published_at'])) ?></p>
        </div>
    </a>
    <?php
}

/** Botones de compartir. */
function share_buttons(string $title, string $url): void
{
    $u = rawurlencode($url);
    $t = rawurlencode($title);
    ?>
    <div class="share">
        <a class="fb" target="_blank" rel="noopener" href="https://www.facebook.com/sharer/sharer.php?u=<?= $u ?>" aria-label="Compartir en Facebook">f</a>
        <a class="x" target="_blank" rel="noopener" href="https://twitter.com/intent/tweet?url=<?= $u ?>&text=<?= $t ?>" aria-label="Compartir en X">𝕏</a>
        <a class="wa" target="_blank" rel="noopener" href="https://wa.me/?text=<?= $t ?>%20<?= $u ?>" aria-label="Compartir en WhatsApp">w</a>
    </div>
    <?php
}

/** Bloque de anuncio (solo se imprime si hay client de AdSense). */
function ad_unit(string $slot = ''): void
{
    if (!ADSENSE_CLIENT || $slot === '') return;
    ?>
    <div class="ad-unit">
        <ins class="adsbygoogle" style="display:block" data-ad-client="<?= e(ADSENSE_CLIENT) ?>" data-ad-slot="<?= e($slot) ?>" data-ad-format="auto" data-full-width-responsive="true"></ins>
        <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
    </div>
    <?php
}
