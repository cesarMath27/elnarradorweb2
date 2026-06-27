<?php
require __DIR__ . '/../includes/bootstrap.php';
require __DIR__ . '/includes/auth.php';

// Solo cerrar sesión por POST con CSRF válido.
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_check();
}
logout();
redirect('/admin/login.php');
