<?php
/**
 * uploads.php — subida de imágenes y PDFs al disco de cPanel (/uploads).
 * Reemplaza el Supabase Storage. Requiere bootstrap (UPLOADS_DIR/UPLOADS_URL).
 */

declare(strict_types=1);

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;   // 8 MB
const MAX_PDF_BYTES   = 50 * 1024 * 1024;  // 50 MB

const ALLOWED_IMAGE_TYPES = [
    'image/jpeg' => 'jpg',
    'image/png'  => 'png',
    'image/webp' => 'webp',
    'image/gif'  => 'gif',
    'image/avif' => 'avif',
];

/** Detecta el MIME real del archivo subido. */
function detect_mime(string $tmp): string
{
    if (function_exists('finfo_open')) {
        $f = finfo_open(FILEINFO_MIME_TYPE);
        $mime = finfo_file($f, $tmp);
        finfo_close($f);
        return (string)$mime;
    }
    return mime_content_type($tmp) ?: '';
}

function ensure_dir(string $dir): bool
{
    if (is_dir($dir)) return is_writable($dir);
    return @mkdir($dir, 0775, true);
}

/**
 * Procesa una imagen del $_FILES[$field].
 * Devuelve ['url' => ...] o ['error' => ...] o null si no se envió archivo.
 */
function handle_image_upload(string $field, string $subdir, string $titleForName): ?array
{
    if (empty($_FILES[$field]) || $_FILES[$field]['error'] === UPLOAD_ERR_NO_FILE) {
        return null;
    }
    $file = $_FILES[$field];
    if ($file['error'] !== UPLOAD_ERR_OK) {
        return ['error' => 'Error al subir la imagen (código ' . $file['error'] . ').'];
    }
    if ($file['size'] > MAX_IMAGE_BYTES) {
        return ['error' => 'La imagen supera el máximo de 8 MB.'];
    }
    $mime = detect_mime($file['tmp_name']);
    if (!isset(ALLOWED_IMAGE_TYPES[$mime])) {
        return ['error' => "Formato de imagen no permitido ($mime). Usa JPG, PNG, WebP, GIF o AVIF."];
    }
    $ext = ALLOWED_IMAGE_TYPES[$mime];
    $dir = rtrim(UPLOADS_DIR, '/') . '/' . $subdir;
    if (!ensure_dir($dir)) {
        return ['error' => "La carpeta de subidas ($subdir) no existe o no tiene permisos de escritura."];
    }
    $name = time() . '-' . slugify($titleForName) . '.' . $ext;
    if (!move_uploaded_file($file['tmp_name'], $dir . '/' . $name)) {
        return ['error' => 'No se pudo guardar la imagen en el servidor.'];
    }
    return ['url' => rtrim(UPLOADS_URL, '/') . '/' . $subdir . '/' . $name];
}

/** Procesa un PDF del $_FILES[$field]. */
function handle_pdf_upload(string $field, string $subdir, string $titleForName): ?array
{
    if (empty($_FILES[$field]) || $_FILES[$field]['error'] === UPLOAD_ERR_NO_FILE) {
        return null;
    }
    $file = $_FILES[$field];
    if ($file['error'] !== UPLOAD_ERR_OK) {
        return ['error' => 'Error al subir el PDF (código ' . $file['error'] . ').'];
    }
    if ($file['size'] > MAX_PDF_BYTES) {
        return ['error' => 'El PDF supera el máximo de 50 MB.'];
    }
    $mime = detect_mime($file['tmp_name']);
    if ($mime !== 'application/pdf') {
        return ['error' => 'El archivo de la revista debe ser un PDF.'];
    }
    $dir = rtrim(UPLOADS_DIR, '/') . '/' . $subdir;
    if (!ensure_dir($dir)) {
        return ['error' => "La carpeta de subidas ($subdir) no existe o no tiene permisos de escritura."];
    }
    $name = time() . '-pdf-' . slugify($titleForName) . '.pdf';
    if (!move_uploaded_file($file['tmp_name'], $dir . '/' . $name)) {
        return ['error' => 'No se pudo guardar el PDF en el servidor.'];
    }
    return ['url' => rtrim(UPLOADS_URL, '/') . '/' . $subdir . '/' . $name];
}

/** Genera un UUID v4 (para ids nuevos de news/magazines). */
function uuid_v4(): string
{
    $d = random_bytes(16);
    $d[6] = chr((ord($d[6]) & 0x0f) | 0x40);
    $d[8] = chr((ord($d[8]) & 0x3f) | 0x80);
    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($d), 4));
}
