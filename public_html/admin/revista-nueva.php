<?php
require __DIR__ . '/../includes/bootstrap.php';
require __DIR__ . '/includes/auth.php';
require __DIR__ . '/includes/uploads.php';
require_login();

$error = null; $success = false;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_check();
    $title       = trim((string)($_POST['title'] ?? ''));
    $description = trim((string)($_POST['description'] ?? ''));
    $edition     = trim((string)($_POST['edition'] ?? ''));
    $isFeatured  = isset($_POST['is_featured']) ? 1 : 0;

    if ($title === '') $error = 'El título es obligatorio.';
    elseif (mb_strlen($title) > 200) $error = 'El título supera los 200 caracteres.';

    $coverUrl = ''; $pdfUrl = '';
    if (!$error) {
        $cover = handle_image_upload('coverImage', 'magazines', $title);
        if ($cover && isset($cover['error'])) $error = $cover['error'];
        elseif ($cover) $coverUrl = $cover['url'];
    }
    if (!$error) {
        $pdf = handle_pdf_upload('pdfFile', 'magazines', $title);
        if ($pdf === null) $error = 'El PDF de la revista es obligatorio.';
        elseif (isset($pdf['error'])) $error = $pdf['error'];
        else $pdfUrl = $pdf['url'];
    }

    if (!$error) {
        $id = uuid_v4();
        $now = gmdate('Y-m-d H:i:s');
        $st = db()->prepare(
            "INSERT INTO magazines (id, title, description, cover_image_url, pdf_url, edition, published_at, created_at, is_featured, view_count, download_count)
             VALUES (:id, :title, :desc, :cover, :pdf, :ed, :pub, :created, :feat, 0, 0)"
        );
        $st->execute([
            ':id' => $id, ':title' => $title, ':desc' => $description, ':cover' => $coverUrl,
            ':pdf' => $pdfUrl, ':ed' => $edition, ':pub' => $now, ':created' => $now, ':feat' => $isFeatured,
        ]);
        $success = true;
    }
}

$active = 'revista-nueva';
$page_title = 'Nueva Revista';
include __DIR__ . '/includes/admin_header.php';
?>
<div class="row-between">
    <div><h1 class="page">Publicar Nueva Revista</h1><p class="sub">Sube la portada y el PDF</p></div>
    <a href="/revistas" target="_blank" class="btn btn-light">Ver revistas →</a>
</div>
<?php if ($success): ?><div class="alert alert-ok">✅ ¡Revista publicada! <a href="/revistas" target="_blank">Ver en el sitio</a></div><?php endif; ?>
<?php if ($error): ?><div class="alert alert-err">❌ <?= e($error) ?></div><?php endif; ?>

<form method="post" action="/admin/revista-nueva.php" enctype="multipart/form-data" style="max-width:640px;">
    <?= csrf_field() ?>
    <div class="card-box">
        <label class="field">Título *</label>
        <input type="text" name="title" maxlength="200" required placeholder="Nombre de la revista">
    </div>
    <div class="card-box">
        <label class="field">Edición</label>
        <input type="text" name="edition" placeholder="Ej. Junio 2026">
    </div>
    <div class="card-box">
        <label class="field">Descripción</label>
        <textarea name="description" rows="3" placeholder="Breve descripción..."></textarea>
    </div>
    <div class="card-box">
        <label class="field">Portada (imagen)</label>
        <label class="upload-box"><input type="file" name="coverImage" accept="image/*" style="display:none;" onchange="this.parentNode.lastChild.textContent=this.files[0]?('✔ '+this.files[0].name):'Clic para seleccionar portada'">Clic para seleccionar portada (opcional, máx. 8 MB)</label>
    </div>
    <div class="card-box">
        <label class="field">Archivo PDF *</label>
        <label class="upload-box"><input type="file" name="pdfFile" accept="application/pdf" required style="display:none;" onchange="this.parentNode.lastChild.textContent=this.files[0]?('✔ '+this.files[0].name):'Clic para seleccionar PDF'">Clic para seleccionar PDF (máx. 50 MB)</label>
    </div>
    <div class="card-box">
        <label style="display:flex;gap:0.6rem;align-items:center;cursor:pointer;"><input type="checkbox" name="is_featured" style="width:auto;"> <span>⭐ Destacada</span></label>
    </div>
    <button type="submit" class="btn btn-green" style="font-size:1rem;padding:0.85rem 2rem;">📖 Publicar Revista</button>
</form>
<?php include __DIR__ . '/includes/admin_footer.php';
