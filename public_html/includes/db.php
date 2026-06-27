<?php
/**
 * db.php — conexión PDO única a MySQL/MariaDB.
 * Uso:  $pdo = db();
 */

declare(strict_types=1);

function db(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    global $CONFIG;
    $c = $CONFIG['db'];
    $driver = $c['driver'] ?? 'mysql';

    try {
        if ($driver === 'sqlite') {
            // Solo para pruebas locales; en Neubox se usa MySQL.
            $pdo = new PDO('sqlite:' . $c['path'], null, null, [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]);
            return $pdo;
        }

        $dsn = "mysql:host={$c['host']};dbname={$c['name']};charset={$c['charset']}";
        $pdo = new PDO($dsn, $c['user'], $c['pass'], [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]);
        // Asegurar UTC para que las fechas coincidan con lo importado.
        $pdo->exec("SET time_zone = '+00:00'");
    } catch (PDOException $e) {
        http_response_code(500);
        // No exponer credenciales ni detalles en producción.
        error_log('DB connection failed: ' . $e->getMessage());
        die('No se pudo conectar a la base de datos. Revisa config.php.');
    }

    return $pdo;
}
