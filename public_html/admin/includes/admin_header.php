<?php
/**
 * admin_header.php — layout del panel. Define $active (slug) y $page_title antes.
 */
$admin = current_admin();
$active = $active ?? '';
$page_title = $page_title ?? 'Panel';
?><!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex, nofollow">
    <title><?= e($page_title) ?> — Admin · El Narrador</title>
    <link rel="stylesheet" href="/assets/css/admin.css">
</head>
<body class="admin">
<div class="admin-shell">
    <aside class="admin-sidebar">
        <div class="admin-brand">
            <img src="/images/logo.png" alt="El Narrador" width="36" height="36">
            <div><div class="b1">El Narrador</div><div class="b2">Panel de Admin</div></div>
        </div>
        <nav class="admin-nav">
            <a href="/admin/" class="<?= $active==='dashboard'?'on':'' ?>">📊 Dashboard</a>
            <div class="navgroup">Noticias</div>
            <a href="/admin/notas.php" class="<?= $active==='notas'?'on':'' ?>">📰 Todas las Notas</a>
            <a href="/admin/nota-nueva.php" class="<?= $active==='nota-nueva'?'on':'' ?>">✏️ Nueva Nota</a>
            <div class="navgroup">Revistas</div>
            <a href="/admin/revista-nueva.php" class="<?= $active==='revista-nueva'?'on':'' ?>">📖 Nueva Revista</a>
            <div class="navgroup">Usuarios</div>
            <a href="/admin/usuarios.php" class="<?= $active==='usuarios'?'on':'' ?>">👥 Gestión de Usuarios</a>
        </nav>
        <div class="admin-foot">
            <?php if ($admin): ?><div class="who"><?= e($admin['display_name']) ?></div><?php endif; ?>
            <form action="/admin/logout.php" method="post">
                <?= csrf_field() ?>
                <button type="submit" class="logout">🚪 Cerrar sesión</button>
            </form>
        </div>
    </aside>
    <main class="admin-main">
