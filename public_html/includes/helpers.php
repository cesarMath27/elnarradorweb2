<?php
/**
 * helpers.php — utilidades de presentación y texto.
 */

declare(strict_types=1);

/**
 * Categorías del sitio (mismo orden y slugs que el sitio Next original).
 * Determina el menú, las páginas /[categoria] y el sitemap.
 */
const CATEGORIES = [
    'mexico'        => 'México',
    'economia'      => 'Economía',
    'cultura'       => 'Cultura',
    'internacional' => 'Internacional',
    'deportes'      => 'Deportes',
    'estilo'        => 'Estilo',
    'ciencia'       => 'Ciencia',
    'opinion'       => 'Opinión',
    'sociedad'      => 'Sociedad',
    'tecnologia'    => 'Tecnología',
];

/** Escape HTML para imprimir texto en atributos/contenido. */
function e(?string $s): string
{
    return htmlspecialchars($s ?? '', ENT_QUOTES, 'UTF-8');
}

/** Nombre legible de una categoría a partir de su slug. */
function category_name(string $slug): string
{
    return CATEGORIES[$slug] ?? ucfirst($slug);
}

/** URL absoluta del sitio. */
function url(string $path = ''): string
{
    return SITE_URL . '/' . ltrim($path, '/');
}

const MESES_ES = [
    1 => 'enero', 2 => 'febrero', 3 => 'marzo', 4 => 'abril',
    5 => 'mayo', 6 => 'junio', 7 => 'julio', 8 => 'agosto',
    9 => 'septiembre', 10 => 'octubre', 11 => 'noviembre', 12 => 'diciembre',
];

/**
 * Fecha en español: "27 de junio de 2026" (+ hora opcional).
 * No depende de la extensión intl (que puede no estar en hosting compartido).
 */
function fecha_es(?string $datetime, bool $conHora = false): string
{
    if (!$datetime) return '';
    try {
        $dt = new DateTime($datetime, new DateTimeZone('UTC'));
        $dt->setTimezone(new DateTimeZone('America/Mexico_City'));
    } catch (Exception $e) {
        return '';
    }
    $txt = $dt->format('j') . ' de ' . MESES_ES[(int)$dt->format('n')] . ' de ' . $dt->format('Y');
    if ($conHora) {
        $txt .= ', ' . $dt->format('H:i');
    }
    return $txt;
}

/** Fecha corta: "27 jun". */
function fecha_corta(?string $datetime): string
{
    if (!$datetime) return '';
    try {
        $dt = new DateTime($datetime, new DateTimeZone('UTC'));
        $dt->setTimezone(new DateTimeZone('America/Mexico_City'));
    } catch (Exception $e) {
        return '';
    }
    $mes = substr(MESES_ES[(int)$dt->format('n')], 0, 3);
    return $dt->format('j') . ' ' . $mes;
}

/** Tiempo estimado de lectura en minutos (~200 palabras/min). */
function tiempo_lectura(?string $html): int
{
    $texto = trim(preg_replace('/\s+/', ' ', strip_tags($html ?? '')));
    $palabras = $texto === '' ? 0 : count(explode(' ', $texto));
    return max(1, (int)round($palabras / 200));
}

/** Decodifica el arreglo de tags (guardado como JSON). */
function tags_decode($raw): array
{
    if (is_array($raw)) return $raw;
    if (!$raw) return [];
    $arr = json_decode((string)$raw, true);
    return is_array($arr) ? $arr : [];
}

/**
 * Limpieza de seguridad del HTML del contenido (backstop del lado servidor).
 * Equivale a stripDangerousHtml() del proyecto Next.
 */
function strip_dangerous_html(string $html): string
{
    $html = preg_replace('/<\s*(script|style|iframe|object|embed|form)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/i', '', $html);
    $html = preg_replace('/<\s*(script|style|iframe|object|embed|form)[^>]*\/?>/i', '', $html);
    $html = preg_replace('/\son\w+\s*=\s*("[^"]*"|\'[^\']*\'|[^\s>]+)/i', '', $html);
    $html = preg_replace('/(href|src)\s*=\s*(["\']?)\s*javascript:[^"\'\s>]*\2/i', '', $html);
    return $html;
}

/** Slug a partir de un título (para nombres de archivo). */
function slugify(string $title): string
{
    $s = mb_strtolower(trim($title), 'UTF-8');
    $s = strtr($s, [
        'á'=>'a','é'=>'e','í'=>'i','ó'=>'o','ú'=>'u','ü'=>'u','ñ'=>'n',
        'Á'=>'a','É'=>'e','Í'=>'i','Ó'=>'o','Ú'=>'u','Ñ'=>'n',
    ]);
    $s = preg_replace('/[^a-z0-9]+/', '-', $s);
    return trim($s, '-') ?: 'nota';
}

/** Redirección segura interna. */
function redirect(string $path): void
{
    header('Location: ' . $path);
    exit;
}
