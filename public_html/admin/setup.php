<?php
/**
 * setup.php — configuración inicial de la PRIMERA contraseña.
 *
 * Como las contraseñas no se migran de Supabase Auth, al importar los datos
 * todos los admin_users tienen password_hash = NULL. Esta página permite, UNA
 * SOLA VEZ (mientras no exista ninguna contraseña), fijar la contraseña de una
 * cuenta existente para poder entrar al panel. En cuanto exista al menos una
 * contraseña, esta página queda bloqueada por seguridad.
 */

require __DIR__ . '/../includes/bootstrap.php';
require __DIR__ . '/includes/auth.php';

$anyPassword = (int) db()->query("SELECT COUNT(*) FROM admin_users WHERE password_hash IS NOT NULL AND password_hash <> ''")->fetchColumn();

if ($anyPassword > 0) {
    http_response_code(403);
    $locked = true;
} else {
    $locked = false;
}

$msg = null; $err = null;
if (!$locked && $_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_check();
    $email = strtolower(trim((string)($_POST['email'] ?? '')));
    $pass  = (string)($_POST['password'] ?? '');
    if ($email === '' || strlen($pass) < 8) {
        $err = 'Indica un correo válido y una contraseña de al menos 8 caracteres.';
    } else {
        $st = db()->prepare("SELECT id FROM admin_users WHERE LOWER(email) = :e LIMIT 1");
        $st->execute([':e' => $email]);
        $u = $st->fetch();
        if (!$u) {
            $err = 'Ese correo no existe en admin_users. Usa uno de los correos importados.';
        } else {
            $hash = password_hash($pass, PASSWORD_DEFAULT);
            $up = db()->prepare("UPDATE admin_users SET password_hash = :h WHERE id = :id");
            $up->execute([':h' => $hash, ':id' => $u['id']]);
            $msg = 'Contraseña configurada. Ya puedes iniciar sesión.';
        }
    }
}
?><!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex, nofollow">
    <title>Configuración inicial — El Narrador Admin</title>
    <link rel="stylesheet" href="/assets/css/admin.css">
</head>
<body>
<div class="login-wrap">
    <div class="login-card">
        <div class="logo">
            <img src="/images/logo.png" alt="El Narrador" width="56" height="56" style="border-radius:8px;">
            <h1>Configuración inicial</h1>
            <p class="muted">Define la contraseña de la primera cuenta</p>
        </div>

        <?php if ($locked): ?>
            <div class="alert alert-err">Esta página ya no está disponible: el panel ya tiene contraseñas configuradas. Usa <a href="/admin/login.php">/admin/login.php</a>. Por seguridad, elimina <code>setup.php</code> del servidor.</div>
        <?php else: ?>
            <?php if ($msg): ?><div class="alert alert-ok"><?= e($msg) ?> <a href="/admin/login.php">Ir al login →</a></div><?php endif; ?>
            <?php if ($err): ?><div class="alert alert-err"><?= e($err) ?></div><?php endif; ?>
            <div class="alert" style="background:#FFFBEB;border:1px solid #FDE68A;color:#92400E;">
                Por seguridad, <strong>elimina este archivo</strong> (setup.php) después de configurar la primera contraseña.
            </div>
            <form method="post" action="/admin/setup.php">
                <?= csrf_field() ?>
                <div class="field-block">
                    <label class="field" for="email">Correo (de un usuario existente)</label>
                    <input id="email" name="email" type="email" required placeholder="cesaradrianrs660@gmail.com">
                </div>
                <div class="field-block">
                    <label class="field" for="password">Nueva contraseña (mín. 8)</label>
                    <input id="password" name="password" type="password" required minlength="8">
                </div>
                <button type="submit" class="btn btn-dark" style="width:100%;">Guardar contraseña</button>
            </form>
        <?php endif; ?>
    </div>
</div>
</body>
</html>
