<?php
require __DIR__ . '/../includes/bootstrap.php';
require __DIR__ . '/includes/auth.php';

if (current_admin()) {
    redirect('/admin/');
}

$error = null;
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_check();
    $error = attempt_login((string)($_POST['email'] ?? ''), (string)($_POST['password'] ?? ''));
    if ($error === null) {
        redirect('/admin/');
    }
}
?><!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex, nofollow">
    <title>Acceso — El Narrador Admin</title>
    <link rel="stylesheet" href="/assets/css/admin.css">
</head>
<body>
<div class="login-wrap">
    <div class="login-card">
        <div class="logo">
            <img src="/images/logo.png" alt="El Narrador" width="64" height="64" style="border-radius:8px;">
            <h1>El Narrador — Admin</h1>
            <p class="muted">Ingresa tus credenciales para continuar</p>
        </div>
        <?php if ($error): ?><div class="alert alert-err"><?= e($error) ?></div><?php endif; ?>
        <form method="post" action="/admin/login.php">
            <?= csrf_field() ?>
            <div class="field-block">
                <label class="field" for="email">Correo electrónico</label>
                <input id="email" name="email" type="email" autocomplete="email" required value="<?= e($_POST['email'] ?? '') ?>">
            </div>
            <div class="field-block">
                <label class="field" for="password">Contraseña</label>
                <input id="password" name="password" type="password" autocomplete="current-password" required>
            </div>
            <button type="submit" class="btn btn-dark" style="width:100%;">Entrar al Panel</button>
        </form>
    </div>
</div>
</body>
</html>
