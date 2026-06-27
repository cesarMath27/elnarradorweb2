<?php
require __DIR__ . '/../includes/bootstrap.php';
require __DIR__ . '/includes/auth.php';
require __DIR__ . '/includes/uploads.php';
require_login();

$id = (string)($_GET['id'] ?? $_POST['id'] ?? '');
$note = $id !== '' ? get_news_by_id($id) : null;
if (!$note) { http_response_code(404); die('Nota no encontrada.'); }

$error = null; $success = false;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_check();
    $title        = trim((string)($_POST['title'] ?? ''));
    $summary      = trim((string)($_POST['summary'] ?? ''));
    $content      = (string)($_POST['content'] ?? '');
    $categorySlug = strtolower(trim((string)($_POST['category_slug'] ?? '')));
    $categoryName = CATEGORIES[$categorySlug] ?? '';
    $author       = trim((string)($_POST['author_name'] ?? '')) ?: 'El Narrador';
    $isFeatured   = isset($_POST['is_featured']) ? 1 : 0;
    $isBreaking   = isset($_POST['is_breaking']) ? 1 : 0;
    $imageOption  = (string)($_POST['imageOption'] ?? 'keep');
    $imageUrl     = $note['image_url'];

    if ($title === '')                      $error = 'El título es obligatorio.';
    elseif ($summary === '')                $error = 'El resumen es obligatorio.';
    elseif ($categorySlug === '' || $categoryName === '') $error = 'Selecciona una categoría válida.';
    elseif (trim(strip_tags($content)) === '') $error = 'El contenido está vacío.';

    if (!$error) {
        if ($imageOption === 'url') {
            $imageUrl = trim((string)($_POST['imageUrl'] ?? ''));
        } elseif ($imageOption === 'upload') {
            $res = handle_image_upload('imageFile', 'news', $title);
            if ($res && isset($res['error'])) $error = $res['error'];
            elseif ($res) $imageUrl = $res['url'];
        }
        // 'keep' deja la imagen actual
    }

    if (!$error) {
        $st = db()->prepare(
            "UPDATE news SET title=:title, summary=:summary, content=:content, image_url=:image,
             category_slug=:cslug, category_name=:cname, author_name=:author, is_featured=:feat, is_breaking=:brk
             WHERE id=:id"
        );
        $st->execute([
            ':title' => $title, ':summary' => $summary, ':content' => strip_dangerous_html($content),
            ':image' => $imageUrl, ':cslug' => $categorySlug, ':cname' => $categoryName,
            ':author' => $author, ':feat' => $isFeatured, ':brk' => $isBreaking, ':id' => $id,
        ]);
        $success = true;
        $note = get_news_by_id($id);
    }
}

$active = 'notas';
$page_title = 'Editar Nota';
$admin_js = '/assets/js/admin-editor.js';
include __DIR__ . '/includes/admin_header.php';
?>
<div class="row-between">
    <div><h1 class="page">Editar Nota</h1><p class="sub">Modifica y guarda los cambios</p></div>
    <a href="/admin/notas.php" class="btn btn-light">← Volver</a>
</div>
<?php if ($success): ?><div class="alert alert-ok">✅ Cambios guardados. <a href="/articulo/<?= e(rawurlencode($id)) ?>" target="_blank">Ver nota →</a></div><?php endif; ?>
<?php if ($error): ?><div class="alert alert-err">❌ <?= e($error) ?></div><?php endif; ?>

<form method="post" action="/admin/nota-editar.php?id=<?= e(rawurlencode($id)) ?>" enctype="multipart/form-data" id="nota-form">
    <?= csrf_field() ?>
    <input type="hidden" name="id" value="<?= e($id) ?>">
    <div style="display:flex;gap:1.5rem;flex-wrap:wrap;">
        <div style="flex:1;min-width:320px;">
            <div class="card-box">
                <label class="field">Título *</label>
                <input type="text" name="title" id="f-title" maxlength="200" value="<?= e($note['title']) ?>" oninput="seoUpdate()">
                <div class="hint" id="title-count"></div>
            </div>
            <div class="card-box grid2">
                <div>
                    <label class="field">Categoría *</label>
                    <select name="category_slug" id="f-cat" onchange="seoUpdate()">
                        <option value="">Seleccionar...</option>
                        <?php foreach (CATEGORIES as $slug => $name): ?>
                            <option value="<?= e($slug) ?>" <?= $slug===$note['category_slug']?'selected':'' ?>><?= e($name) ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div>
                    <label class="field">Autor</label>
                    <input type="text" name="author_name" value="<?= e($note['author_name']) ?>">
                </div>
            </div>
            <div class="card-box">
                <label class="field">Resumen *</label>
                <textarea name="summary" id="f-summary" rows="3" maxlength="300" oninput="seoUpdate()"><?= e($note['summary']) ?></textarea>
                <div class="hint" id="summary-count"></div>
            </div>
            <div class="card-box">
                <label class="field">Imagen destacada</label>
                <?php if (!empty($note['image_url'])): ?>
                    <div style="margin-bottom:0.75rem;"><img src="<?= e($note['image_url']) ?>" alt="" style="max-height:120px;border-radius:8px;"></div>
                <?php endif; ?>
                <div style="display:flex;gap:0.5rem;margin-bottom:0.75rem;flex-wrap:wrap;">
                    <button type="button" class="btn btn-dark" id="opt-keep" onclick="imgMode('keep')">Mantener actual</button>
                    <button type="button" class="btn btn-light" id="opt-upload" onclick="imgMode('upload')">📁 Subir nueva</button>
                    <button type="button" class="btn btn-light" id="opt-url" onclick="imgMode('url')">🔗 URL</button>
                </div>
                <input type="hidden" name="imageOption" id="imageOption" value="keep">
                <div id="img-upload-box" style="display:none;">
                    <label class="upload-box"><input type="file" name="imageFile" accept="image/*" style="display:none;" onchange="seoUpdate()">Clic para seleccionar imagen (máx. 8 MB)</label>
                </div>
                <div id="img-url-box" style="display:none;">
                    <input type="url" name="imageUrl" placeholder="https://..." value="<?= e($note['image_url']) ?>" oninput="seoUpdate()">
                </div>
            </div>
            <div class="card-box" style="padding:0;overflow:hidden;">
                <div class="editor-toolbar">
                    <button type="button" onmousedown="cmd(event,'bold')" style="font-weight:700;">B</button>
                    <button type="button" onmousedown="cmd(event,'italic')" style="font-style:italic;">I</button>
                    <button type="button" onmousedown="cmd(event,'underline')" style="text-decoration:underline;">U</button>
                    <button type="button" onmousedown="block(event,'h2')">H2</button>
                    <button type="button" onmousedown="block(event,'h3')">H3</button>
                    <button type="button" onmousedown="block(event,'blockquote')">❝</button>
                    <button type="button" onmousedown="cmd(event,'insertUnorderedList')">•</button>
                    <button type="button" onmousedown="cmd(event,'insertOrderedList')">1.</button>
                    <button type="button" onmousedown="makeLink(event)">🔗</button>
                    <button type="button" onmousedown="block(event,'p')">¶</button>
                    <span style="margin-left:auto;font-size:0.75rem;color:#9CA3AF;align-self:center;" id="word-count"></span>
                </div>
                <div class="editor-area" id="editor" contenteditable data-placeholder="Contenido..." oninput="syncContent()"></div>
            </div>
            <input type="hidden" name="content" id="content-field" value="<?= e($note['content']) ?>">
            <div class="card-box" style="display:flex;gap:2rem;flex-wrap:wrap;">
                <label style="display:flex;gap:0.6rem;align-items:center;cursor:pointer;"><input type="checkbox" name="is_featured" style="width:auto;" <?= $note['is_featured']?'checked':'' ?>> <span>⭐ Destacada</span></label>
                <label style="display:flex;gap:0.6rem;align-items:center;cursor:pointer;"><input type="checkbox" name="is_breaking" style="width:auto;" <?= $note['is_breaking']?'checked':'' ?>> <span>🔴 Última Hora</span></label>
            </div>
            <button type="submit" class="btn btn-dark" style="font-size:1rem;padding:0.85rem 2rem;">💾 Guardar cambios</button>
        </div>
        <div style="width:280px;flex-shrink:0;">
            <div class="card-box" style="position:sticky;top:1rem;">
                <h3 style="font-size:0.9rem;font-weight:700;margin:0 0 1rem;">📊 Puntuación SEO</h3>
                <div style="text-align:center;margin-bottom:1rem;">
                    <div style="font-size:2.5rem;font-weight:700;" id="seo-score-num">0</div>
                    <div style="font-size:0.8rem;color:#9CA3AF;">/100 · <span id="seo-label">—</span></div>
                </div>
                <div id="seo-checks" style="display:flex;flex-direction:column;gap:0.75rem;font-size:0.85rem;"></div>
            </div>
        </div>
    </div>
</form>
<?php include __DIR__ . '/includes/admin_footer.php';
