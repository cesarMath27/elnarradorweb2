<?php
/**
 * bootstrap.php — punto de arranque común a TODAS las páginas.
 * Carga config, abre la conexión PDO y expone helpers/queries.
 */

declare(strict_types=1);

// ─── Cargar configuración ───────────────────────────────────────────────
$configPath = __DIR__ . '/../config.php';
if (!is_file($configPath)) {
    http_response_code(500);
    die('Falta config.php. Copia config.example.php a config.php y configura la base de datos. Ver DEPLOY-NEUBOX.md.');
}
$CONFIG = require $configPath;

// ─── Constantes globales ────────────────────────────────────────────────
define('SITE_URL', rtrim($CONFIG['site_url'] ?? '', '/'));
define('SITE_NAME', 'El Narrador de México');
define('UPLOADS_DIR', $CONFIG['uploads_dir'] ?? (__DIR__ . '/../uploads'));
define('UPLOADS_URL', $CONFIG['uploads_url'] ?? '/uploads');
define('ADSENSE_CLIENT', $CONFIG['adsense_client'] ?? '');

date_default_timezone_set('America/Mexico_City');

require __DIR__ . '/db.php';
require __DIR__ . '/helpers.php';
require __DIR__ . '/queries.php';
