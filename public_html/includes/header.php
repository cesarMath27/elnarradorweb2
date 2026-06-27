<?php
/**
 * header.php — cabecera pública (chrome del sitio).
 * Antes de incluirlo, define opcionalmente:
 *   $meta_title, $meta_description, $meta_canonical, $meta_image,
 *   $meta_type ('website'|'article'), $head_extra (HTML extra para <head>),
 *   $body_class, $no_top_padding (bool)
 */

declare(strict_types=1);

$meta_title       = $meta_title       ?? 'El Narrador de México - Noticias';
$meta_description = $meta_description ?? 'Portal de noticias de México. Cobertura en política, economía, cultura, deportes, ciencia, tecnología y más.';
$meta_canonical   = $meta_canonical   ?? url();
$meta_image       = $meta_image       ?? url('images/banner-narrador.jpg');
$meta_type        = $meta_type        ?? 'website';
$head_extra       = $head_extra       ?? '';

$nav_categories = CATEGORIES;
?><!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title><?= e($meta_title) ?></title>
    <meta name="description" content="<?= e($meta_description) ?>">
    <link rel="canonical" href="<?= e($meta_canonical) ?>">
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">

    <!-- Open Graph -->
    <meta property="og:site_name" content="El Narrador de México">
    <meta property="og:locale" content="es_MX">
    <meta property="og:type" content="<?= e($meta_type) ?>">
    <meta property="og:title" content="<?= e($meta_title) ?>">
    <meta property="og:description" content="<?= e($meta_description) ?>">
    <meta property="og:url" content="<?= e($meta_canonical) ?>">
    <meta property="og:image" content="<?= e($meta_image) ?>">

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="<?= e($meta_title) ?>">
    <meta name="twitter:description" content="<?= e($meta_description) ?>">
    <meta name="twitter:image" content="<?= e($meta_image) ?>">

    <link rel="icon" href="/favicon.ico" sizes="any">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Newsreader:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/assets/css/site.css">

    <?php if (ADSENSE_CLIENT): ?>
    <meta name="google-adsense-account" content="<?= e(ADSENSE_CLIENT) ?>">
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=<?= e(ADSENSE_CLIENT) ?>" crossorigin="anonymous"></script>
    <?php endif; ?>

    <!-- Datos estructurados de la organización -->
    <script type="application/ld+json"><?= json_encode([
        '@context' => 'https://schema.org',
        '@type' => 'NewsMediaOrganization',
        'name' => 'El Narrador de México',
        'url' => SITE_URL,
        'logo' => url('images/logo.png'),
        'sameAs' => ['https://www.facebook.com/elnarradordemexico'],
        'contactPoint' => [
            '@type' => 'ContactPoint',
            'telephone' => '+52-5610973271',
            'contactType' => 'editorial',
            'areaServed' => 'MX',
            'availableLanguage' => 'Spanish',
        ],
        'potentialAction' => [
            '@type' => 'SearchAction',
            'target' => ['@type' => 'EntryPoint', 'urlTemplate' => url('buscar?q={search_term_string}')],
            'query-input' => 'required name=search_term_string',
        ],
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?></script>

    <?= $head_extra ?>
</head>
<body class="<?= e($body_class ?? '') ?>">
<header class="site-header">
    <div class="topbar">
        <div class="container topbar-inner">
            <a href="/" class="brand">
                <img src="/images/logo.png" alt="El Narrador" width="40" height="40" class="brand-logo">
                <span class="brand-text">
                    <span class="brand-title">El Narrador</span>
                    <span class="brand-sub">de México</span>
                </span>
            </a>
            <form class="searchbar" action="/buscar" method="get" role="search">
                <input type="search" name="q" placeholder="Buscar noticias..." aria-label="Buscar" value="<?= e($_GET['q'] ?? '') ?>">
                <button type="submit" aria-label="Buscar">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
                </button>
            </form>
            <button class="menu-toggle" aria-label="Abrir menú" onclick="document.body.classList.toggle('menu-open')">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"/></svg>
            </button>
        </div>
    </div>
    <nav class="catbar">
        <div class="container catbar-inner">
            <?php foreach ($nav_categories as $slug => $name): ?>
                <a href="/<?= e($slug) ?>"><?= e($name) ?></a>
            <?php endforeach; ?>
            <a href="/revistas">Revistas</a>
        </div>
    </nav>
    <div class="mobile-menu">
        <form class="searchbar" action="/buscar" method="get" role="search">
            <input type="search" name="q" placeholder="Buscar noticias..." aria-label="Buscar">
            <button type="submit" aria-label="Buscar">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
            </button>
        </form>
        <?php foreach ($nav_categories as $slug => $name): ?>
            <a href="/<?= e($slug) ?>"><?= e($name) ?></a>
        <?php endforeach; ?>
        <a href="/revistas">Revistas</a>
    </div>
</header>
<main class="<?= empty($no_top_padding) ? 'has-fixed-header' : '' ?>">
