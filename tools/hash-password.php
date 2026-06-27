<?php
/**
 * hash-password.php — genera un hash bcrypt para una contraseña de admin.
 *
 * Uso:
 *   php tools/hash-password.php "MiContraseñaSegura"
 *
 * Luego pégalo en phpMyAdmin:
 *   UPDATE admin_users SET password_hash = '<hash>' WHERE email = 'tu@correo.com';
 *
 * (Alternativa más fácil: usa la página /admin/setup.php la primera vez.)
 */

$pass = $argv[1] ?? '';
if ($pass === '') {
    fwrite(STDERR, "Uso: php tools/hash-password.php \"tu_contraseña\"\n");
    exit(1);
}
echo password_hash($pass, PASSWORD_DEFAULT) . "\n";
