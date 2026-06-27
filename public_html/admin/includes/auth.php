<?php
/**
 * auth.php — sesión y control de acceso del panel (reemplaza Supabase Auth).
 * Requiere que bootstrap.php ya esté cargado.
 */

declare(strict_types=1);

if (session_status() !== PHP_SESSION_ACTIVE) {
    global $CONFIG;
    session_name($CONFIG['session_name'] ?? 'narrador_admin');
    session_set_cookie_params([
        'httponly' => true,
        'samesite' => 'Lax',
        'secure'   => (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off'),
    ]);
    session_start();
}

/** Devuelve el admin autenticado o null. */
function current_admin(): ?array
{
    return $_SESSION['admin'] ?? null;
}

/** Exige sesión; si no, manda al login. */
function require_login(): array
{
    $admin = current_admin();
    if (!$admin) {
        redirect('/admin/login.php');
    }
    return $admin;
}

/** Exige rol 'owner'. */
function require_owner(): array
{
    $admin = require_login();
    if (($admin['role'] ?? '') !== 'owner') {
        http_response_code(403);
        die('Solo los propietarios pueden acceder a esta sección.');
    }
    return $admin;
}

/** Intenta iniciar sesión. Devuelve null si OK, o un mensaje de error. */
function attempt_login(string $email, string $password): ?string
{
    $email = strtolower(trim($email));
    if ($email === '' || $password === '') {
        return 'Ingresa tu correo y contraseña.';
    }

    $st = db()->prepare("SELECT * FROM admin_users WHERE LOWER(email) = :email LIMIT 1");
    $st->execute([':email' => $email]);
    $user = $st->fetch();

    if (!$user) {
        return 'Correo o contraseña incorrectos.';
    }
    if (empty($user['password_hash'])) {
        return 'Esta cuenta aún no tiene contraseña configurada. Pide al propietario que te asigne una (ver DEPLOY-NEUBOX.md).';
    }
    if (!password_verify($password, $user['password_hash'])) {
        return 'Correo o contraseña incorrectos.';
    }

    session_regenerate_id(true);
    $_SESSION['admin'] = [
        'id'           => $user['id'],
        'email'        => $user['email'],
        'display_name' => $user['display_name'],
        'role'         => $user['role'],
    ];
    return null;
}

function logout(): void
{
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $p = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $p['path'], $p['domain'], $p['secure'], $p['httponly']);
    }
    session_destroy();
}

/* ───── CSRF ───── */
function csrf_token(): string
{
    if (empty($_SESSION['csrf'])) {
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf'];
}

function csrf_field(): string
{
    return '<input type="hidden" name="csrf" value="' . e(csrf_token()) . '">';
}

function csrf_check(): void
{
    $ok = isset($_POST['csrf']) && hash_equals($_SESSION['csrf'] ?? '', (string)$_POST['csrf']);
    if (!$ok) {
        http_response_code(419);
        die('Token de seguridad inválido. Recarga la página e inténtalo de nuevo.');
    }
}
