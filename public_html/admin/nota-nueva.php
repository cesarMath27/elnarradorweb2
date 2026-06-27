<?php
require __DIR__ . '/../includes/bootstrap.php';
require __DIR__ . '/includes/auth.php';
require __DIR__ . '/includes/uploads.php';
$admin = require_login();

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
    $imageOption  = (string)($_POST['imageOption'] ?? 'upload');

    if ($title === '')                      $error = 'El título es obligatorio.';
    elseif (mb_strlen($title) > 200)        $error = 'El título supera los 200 caracteres.';
    elseif ($summary === '')                $error = 'El resumen es obligatorio.';
    elseif ($categorySlug === '' || $categoryName === '') $error = 'Selecciona una categoría válida.';
    elseif (trim(strip_tags($content)) === '') $error = 'El contenido de la nota está vacío.';

    $imageUrl = '';
    if (!$error) {
        if ($imageOption === 'url') {
            $imageUrl = trim((string)($_POST['imageUrl'] ?? ''));
        } else {
            $res = handle_image_upload('imageFile', 'news', $title);
            if ($res && isset($res['error'])) $error = $res['error'];
            elseif ($res) $imageUrl = $res['url'];
        }
    }

    if (!$error) {
        $id = uuid_v4();
        $st = db()->prepare(
            "INSERT INTO news (id, source, title, summary, content, image_url, category_slug, category_name, author_name, tags, published_at, created_at, view_count, is_featured, is_breaking, source_url, status)
             VALUES (:id, 'supabase', :title, :summary, :content, :image, :cslug, :cname, :author, '[]', :pub, :created, 0, :feat, :brk, '', 'published')"
        );
        $now = gmdate('Y-m-d H:i:s');
        $st->execute([
            ':id' => $id, ':title' => $title, ':summary' => $summary,
            ':content' => strip_dangerous_html($content), ':image' => $imageUrl,
            ':cslug' => $categorySlug, ':cname' => $categoryName, ':author' => $author,
            ':pub' => $now, ':created' => $now, ':feat' => $isFeatured, ':brk' => $isBreaking,
        ]);
        $success = true;
    }
}

$defaultAuthor = $admin['display_name'] ?? 'El Narrador';
$active = 'nota-nueva';
$page_title = 'Nueva Nota';
$admin_js = '/assets/js/admin-editor.js';
include __DIR__ . '/includes/admin_header.php';
?>
<div class="row-between">
    <div><h1 class="page">Publicar Nueva Nota</h1><p class="sub">Redacta, analiza SEO y publica</p></div>
    <a href="/admin/notas.php" class="btn btn-light">← Volver a notas</a>
</div>

<?php if ($success): ?><div class="alert alert-ok">✅ ¡Nota publicada exitosamente! <a href="/admin/nota-nueva.php">Crear otra</a> · <a href="/admin/notas.php">Ver todas</a></div><?php endif; ?>
<?php if ($error): ?><div class="alert alert-err">❌ <?= e($error) ?></div><?php endif; ?>

<form method="post" action="/admin/nota-nueva.php" enctype="multipart/form-data" id="nota-form">
    <?= csrf_field() ?>
    <div style="display:flex;gap:1.5rem;flex-wrap:wrap;">
        <div style="flex:1;min-width:320px;">
            <div class="card-box">
                <label class="field">Título <span style="color:#EF4444;">*</span></label>
                <input type="text" name="title" id="f-title" maxlength="200" placeholder="Título llamativo..." oninput="seoUpdate()">
                <div class="hint" id="title-count">0 caracteres</div>
            </div>

            <div class="card-box grid2">
                <div>
                    <label class="field">Categoría <span style="color:#EF4444;">*</span></label>
                    <select name="category_slug" id="f-cat" onchange="seoUpdate()">
                        <option value="">Seleccionar...</option>
                        <?php foreach (CATEGORIES as $slug => $name): ?>
                            <option value="<?= e($slug) ?>"><?= e($name) ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div>
                    <label class="field">Autor</label>
                    <input type="text" name="author_name" value="<?= e($defaultAuthor) ?>">
                </div>
            </div>

            <div class="card-box">
                <label class="field">Resumen <span style="color:#EF4444;">*</span></label>
                <textarea name="summary" id="f-summary" rows="3" maxlength="300" placeholder="Breve resumen (tarjetas y redes)..." oninput="seoUpdate()"></textarea>
                <div class="hint" id="summary-count">0/300</div>
            </div>

            <div class="card-box">
                <label class="field">Imagen destacada</label>
                <div style="display:flex;gap:0.5rem;margin-bottom:0.75rem;">
                    <button type="button" class="btn btn-light" id="opt-upload" onclick="imgMode('upload')">📁 Subir</button>
                    <button type="button" class="btn btn-light" id="opt-url" onclick="imgMode('url')">🔗 URL</button>
                </div>
                <input type="hidden" name="imageOption" id="imageOption" value="upload">
                <div id="img-upload-box">
                    <label class="upload-box">
                        <input type="file" name="imageFile" accept="image/*" style="display:none;" onchange="seoUpdate(); previewFile(this)">
                        Clic para seleccionar imagen (máx. 8 MB)
                    </label>
                </div>
                <div id="img-url-box" style="display:none;">
                    <input type="url" name="imageUrl" placeholder="https://..." oninput="seoUpdate()">
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
                    <span style="margin-left:auto;font-size:0.75rem;color:#9CA3AF;align-self:center;" id="word-count">0 palabras</span>
                </div>
                <div class="editor-area" id="editor" contenteditable data-placeholder="Escribe el contenido del artículo aquí..." oninput="syncContent()"></div>
            </div>
            <input type="hidden" name="content" id="content-field">

            <div class="card-box" style="display:flex;gap:2rem;flex-wrap:wrap;">
                <label style="display:flex;gap:0.6rem;align-items:center;cursor:pointer;">
                    <input type="checkbox" name="is_featured" style="width:auto;"> <span>⭐ Destacada</span>
                </label>
                <label style="display:flex;gap:0.6rem;align-items:center;cursor:pointer;">
                    <input type="checkbox" name="is_breaking" style="width:auto;"> <span>🔴 Última Hora</span>
                </label>
            </div>

            <button type="submit" class="btn btn-dark" id="submit-btn" style="font-size:1rem;padding:0.85rem 2rem;">📰 Publicar Nota</button>
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
            <div class="card-box" style="background:#EFF6FF;border-color:#BFDBFE;">
                <h4 style="font-size:0.85rem;font-weight:700;color:#1E40AF;margin:0 0 0.5rem;">💡 Tips</h4>
                <ul style="font-size:0.78rem;color:#1D4ED8;margin:0;padding-left:1.1rem;line-height:1.6;">
                    <li>Usa subtítulos (H2, H3)</li>
                    <li>El primer párrafo resume el tema</li>
                    <li>+300 palabras rankean mejor</li>
                </ul>
            </div>
        </div>
    </div>
</form>
<?php include __DIR__ . '/includes/admin_footer.php';
