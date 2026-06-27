<?php
require __DIR__ . '/../includes/bootstrap.php';
require __DIR__ . '/includes/auth.php';
require_login();

$newsCount     = count_news();
$magazineCount = count_magazines();
$featuredCount = count_featured();
$breakingCount = count_breaking();

$recent = db()->query(
    "SELECT id, title, category_name, published_at, source FROM news ORDER BY published_at DESC LIMIT 5"
)->fetchAll();

$active = 'dashboard';
$page_title = 'Dashboard';
include __DIR__ . '/includes/admin_header.php';
?>
<div class="row-between">
    <div>
        <h1 class="page">Dashboard</h1>
        <p class="sub">Bienvenido al panel de administración de El Narrador de México</p>
    </div>
</div>

<div class="stats">
    <div class="stat blue"><div class="v"><?= $newsCount ?></div><div class="l">📰 Total Notas</div></div>
    <div class="stat green"><div class="v"><?= $magazineCount ?></div><div class="l">📖 Revistas</div></div>
    <div class="stat amber"><div class="v"><?= $featuredCount ?></div><div class="l">⭐ Destacadas</div></div>
    <div class="stat red"><div class="v"><?= $breakingCount ?></div><div class="l">🔴 Última Hora</div></div>
</div>

<h2 style="font-size:1.1rem;font-weight:600;margin-bottom:1rem;">Acciones rápidas</h2>
<div class="stats" style="margin-bottom:2rem;">
    <a class="btn btn-dark" style="padding:1rem;text-align:left;" href="/admin/nota-nueva.php">✏️ Nueva Nota<br><span style="font-weight:400;opacity:0.7;font-size:0.8rem;">Publicar un artículo</span></a>
    <a class="btn btn-green" style="padding:1rem;text-align:left;" href="/admin/revista-nueva.php">📖 Nueva Revista<br><span style="font-weight:400;opacity:0.7;font-size:0.8rem;">Subir PDF de revista</span></a>
    <a class="btn btn-light" style="padding:1rem;text-align:left;" href="/admin/notas.php">📋 Ver Notas<br><span style="font-weight:400;opacity:0.7;font-size:0.8rem;">Administrar artículos</span></a>
    <a class="btn btn-light" style="padding:1rem;text-align:left;" href="/admin/usuarios.php">👥 Usuarios<br><span style="font-weight:400;opacity:0.7;font-size:0.8rem;">Gestión de accesos</span></a>
</div>

<div class="table-wrap">
    <div class="row-between" style="padding:1rem 1.25rem;margin:0;border-bottom:1px solid #F3F4F6;">
        <h2 style="font-size:1rem;font-weight:600;margin:0;">Notas recientes</h2>
        <a href="/admin/notas.php" style="color:#2563EB;font-size:0.875rem;">Ver todas →</a>
    </div>
    <?php if ($recent): foreach ($recent as $n): ?>
        <div style="padding:0.75rem 1.25rem;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #F9FAFB;gap:1rem;">
            <div style="min-width:0;">
                <p style="margin:0;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;"><?= e($n['title']) ?></p>
                <p style="margin:0.15rem 0 0;font-size:0.75rem;color:#9CA3AF;"><?= e($n['category_name']) ?> · <?= e(fecha_corta($n['published_at'])) ?></p>
            </div>
            <span class="pill <?= ($n['source'] ?? '')==='wordpress'?'pill-blue':'pill-green' ?>"><?= ($n['source'] ?? '')==='wordpress'?'WP':'SB' ?></span>
        </div>
    <?php endforeach; else: ?>
        <div style="padding:2rem;text-align:center;color:#9CA3AF;">No hay notas aún. ¡Crea la primera!</div>
    <?php endif; ?>
</div>
<?php include __DIR__ . '/includes/admin_footer.php';
