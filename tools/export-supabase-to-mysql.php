<?php
/**
 * export-supabase-to-mysql.php
 * -----------------------------------------------------------------------------
 * Lee las tablas que usa el sitio web desde la API REST de Supabase y genera
 * database/data.sql con sentencias INSERT compatibles con MySQL / MariaDB,
 * listo para importar en phpMyAdmin de Neubox.
 *
 * Uso (CLI):
 *     SUPABASE_URL="https://xxxx.supabase.co" \
 *     SUPABASE_ANON_KEY="eyJhbGci..." \
 *     php tools/export-supabase-to-mysql.php
 *
 * No requiere extensiones de Postgres; solo cURL (incluido en PHP estándar).
 * El script lee datos PÚBLICOS con la llave anon (respeta las políticas RLS).
 * -----------------------------------------------------------------------------
 */

error_reporting(E_ALL);

$SUPABASE_URL = rtrim(getenv('SUPABASE_URL') ?: '', '/');
$ANON_KEY     = getenv('SUPABASE_ANON_KEY') ?: '';

if ($SUPABASE_URL === '' || $ANON_KEY === '') {
    fwrite(STDERR, "Faltan SUPABASE_URL o SUPABASE_ANON_KEY en el entorno.\n");
    exit(1);
}

$OUT_FILE = __DIR__ . '/../database/data.sql';

// Soporte opcional para proxy/CA del entorno de ejecución (no afecta a Neubox).
$PROXY    = getenv('HTTPS_PROXY') ?: getenv('https_proxy') ?: '';
$CA_BUNDLE = getenv('CURL_CA_BUNDLE') ?: '/root/.ccr/ca-bundle.crt';

/** Trae todas las filas de una tabla vía PostgREST, paginando. */
function fetchAll(string $table, string $orderBy): array {
    global $SUPABASE_URL, $ANON_KEY, $PROXY, $CA_BUNDLE;

    $rows = [];
    $limit = 500;
    $offset = 0;

    while (true) {
        $url = "$SUPABASE_URL/rest/v1/$table?select=*&order=$orderBy&limit=$limit&offset=$offset";
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => [
                "apikey: $ANON_KEY",
                "Authorization: Bearer $ANON_KEY",
                "Accept: application/json",
            ],
            CURLOPT_TIMEOUT => 60,
        ]);
        if ($PROXY !== '')   curl_setopt($ch, CURLOPT_PROXY, $PROXY);
        if (is_file($CA_BUNDLE)) curl_setopt($ch, CURLOPT_CAINFO, $CA_BUNDLE);

        $resp = curl_exec($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $err  = curl_error($ch);
        curl_close($ch);

        if ($resp === false) {
            fwrite(STDERR, "Error de red en $table: $err\n");
            exit(1);
        }
        if ($code === 401 || $code === 403) {
            // RLS bloquea la lectura anónima de esta tabla.
            fwrite(STDERR, "  [aviso] $table no es legible con la llave anon (HTTP $code). Se omite.\n");
            return [];
        }
        if ($code >= 400) {
            fwrite(STDERR, "HTTP $code en $table: $resp\n");
            exit(1);
        }

        $batch = json_decode($resp, true);
        if (!is_array($batch)) {
            fwrite(STDERR, "Respuesta inválida en $table\n");
            exit(1);
        }
        $rows = array_merge($rows, $batch);
        if (count($batch) < $limit) break;
        $offset += $limit;
    }
    return $rows;
}

/** Escapa un valor para MySQL según su tipo de columna destino. */
function val($v, string $type = 'str'): string {
    if ($v === null) return 'NULL';

    switch ($type) {
        case 'int':
            return (string)(int)$v;
        case 'bool':
            return ($v === true || $v === 1 || $v === '1' || $v === 't') ? '1' : '0';
        case 'datetime':
            try {
                $dt = new DateTime((string)$v);
                $dt->setTimezone(new DateTimeZone('UTC'));
                return "'" . $dt->format('Y-m-d H:i:s') . "'";
            } catch (Exception $e) {
                return 'NULL';
            }
        case 'json': // arreglos de Postgres (text[]) -> arreglo JSON
            $arr = is_array($v) ? $v : [];
            return quote(json_encode($arr, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
        case 'str':
        default:
            return quote((string)$v);
    }
}

/** Comillas + escape estándar de MySQL para una cadena. */
function quote(string $s): string {
    // Quita bytes NUL (no válidos en columnas de texto) y escapa especiales.
    $s = str_replace("\0", '', $s);
    $s = str_replace(['\\', "'"], ['\\\\', "\\'"], $s);
    return "'" . $s . "'";
}

/**
 * Definición de columnas a exportar por tabla: [columna => tipo].
 * El orden se respeta tal cual en el INSERT.
 */
$TABLES = [
    'categories' => [
        'order'   => 'sort_order.asc',
        'columns' => [
            'id' => 'str', 'name' => 'str', 'icon' => 'str',
            'color' => 'int', 'sort_order' => 'int', 'created_at' => 'datetime',
        ],
    ],
    'authors' => [
        'order'   => 'created_at.asc',
        'columns' => [
            'id' => 'str', 'name' => 'str', 'bio' => 'str',
            'avatar_url' => 'str', 'email' => 'str', 'created_at' => 'datetime',
        ],
    ],
    'news' => [
        'order'   => 'created_at.asc',
        'columns' => [
            'id' => 'str', 'source' => 'str', 'title' => 'str', 'summary' => 'str',
            'content' => 'str', 'image_url' => 'str', 'category_slug' => 'str',
            'category_name' => 'str', 'author_name' => 'str', 'tags' => 'json',
            'published_at' => 'datetime', 'created_at' => 'datetime',
            'view_count' => 'int', 'is_featured' => 'bool', 'is_breaking' => 'bool',
            'source_url' => 'str', 'status' => 'str',
        ],
    ],
    'news_authors' => [
        'order'   => 'news_id.asc',
        'columns' => [ 'news_id' => 'str', 'author_id' => 'str' ],
    ],
    'magazines' => [
        'order'   => 'published_at.asc',
        'columns' => [
            'id' => 'str', 'title' => 'str', 'description' => 'str',
            'cover_image_url' => 'str', 'pdf_url' => 'str', 'edition' => 'str',
            'published_at' => 'datetime', 'created_at' => 'datetime',
            'is_featured' => 'bool', 'view_count' => 'int', 'download_count' => 'int',
        ],
    ],
    'admin_users' => [
        'order'   => 'created_at.asc',
        'columns' => [
            'id' => 'str', 'email' => 'str', 'display_name' => 'str',
            'role' => 'str', 'created_at' => 'datetime',
        ],
        // password_hash se inserta como NULL: las contraseñas se fijan aparte
        // (Supabase Auth no se migra). Ver tools/hash-password.php.
        'extra' => [ 'password_hash' => 'NULL' ],
    ],
];

$fh = fopen($OUT_FILE, 'w');
fwrite($fh, "-- Datos exportados desde Supabase para MySQL/MariaDB (Neubox)\n");
fwrite($fh, "-- Generado por tools/export-supabase-to-mysql.php el " . date('Y-m-d H:i') . " UTC\n");
fwrite($fh, "SET NAMES utf8mb4;\n");
fwrite($fh, "SET time_zone = '+00:00';\n");
fwrite($fh, "SET FOREIGN_KEY_CHECKS = 0;\n\n");

$summary = [];

foreach ($TABLES as $table => $def) {
    fwrite(STDERR, "Exportando $table...\n");
    $rows = fetchAll($table, $def['order']);
    $summary[$table] = count($rows);

    fwrite($fh, "-- ----- $table (" . count($rows) . " filas) -----\n");
    if (!$rows) { fwrite($fh, "\n"); continue; }

    $cols = $def['columns'];
    $extra = $def['extra'] ?? [];
    $colNames = array_merge(array_keys($cols), array_keys($extra));
    $colList = '`' . implode('`, `', $colNames) . '`';

    fwrite($fh, "INSERT INTO `$table` ($colList) VALUES\n");

    $lines = [];
    foreach ($rows as $row) {
        $vals = [];
        foreach ($cols as $col => $type) {
            $vals[] = val($row[$col] ?? null, $type);
        }
        foreach ($extra as $col => $literal) {
            $vals[] = $literal; // p.ej. NULL
        }
        $lines[] = '(' . implode(', ', $vals) . ')';
    }
    fwrite($fh, implode(",\n", $lines) . ";\n\n");
}

fwrite($fh, "SET FOREIGN_KEY_CHECKS = 1;\n");
fclose($fh);

fwrite(STDERR, "\nListo -> $OUT_FILE\n");
foreach ($summary as $t => $n) {
    fwrite(STDERR, sprintf("  %-14s %d filas\n", $t, $n));
}
