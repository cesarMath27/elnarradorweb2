<?php
require __DIR__ . '/../includes/bootstrap.php';
require __DIR__ . '/includes/auth.php';
require_login();

// ── Acciones (PRG: Post/Redirect/Get) ──
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_check();
    $action = (string)($_POST['action'] ?? '');
    $id = (string)($_POST['id'] ?? '');
    if ($id !== '') {
        if ($action === 'toggle_featured') {
            db()->prepare("UPDATE news SET is_featured = 1 - is_featured WHERE id = :id")->execute([':id' => $id]);
        } elseif ($action === 'toggle_breaking') {
            db()->prepare("UPDATE news SET is_breaking = 1 - is_breaking WHERE id = :id")->execute([':id' => $id]);
        } elseif ($action === 'delete') {
            db()->prepare("DELETE FROM news WHERE id = :id")->execute([':id' => $id]);
        }
    }
    redirect('/admin/notas.php?filter=' . urlencode((string)($_POST['filter'] ?? 'all')));
}

$filter = (string)($_GET['filter'] ?? 'all');
$where = '';
if ($filter === 'featured') $where = 'WHERE is_featured = 1';
elseif ($filter === 'breaking') $where = 'WHERE is_breaking = 1';

$posts = db()->query(
    "SELECT id, title, category_name, published_at, is_featured, is_breaking, view_count, source
     FROM news $where ORDER BY published_at DESC LIMIT 100"
)->fetchAll();

$total = count_news();
$nFeatured = count_featured();
$nBreaking = count_breaking();

$active = 'notas';
$page_title = 'Todas las Notas';
include __DIR__ . '/includes/admin_header.php';

function action_form(string $action, string $id, string $filter, string $class, string $label, string $title = '', bool $confirm = false): void {
    $onsubmit = $confirm ? ' onsubmit="return confirm(\'¿Eliminar esta noticia? Esta acción no se puede deshacer.\')"' : '';
    echo '<form method="post" action="/admin/notas.php" style="display:inline"' . $onsubmit . '>';
    echo csrf_field();
    echo '<input type="hidden" name="action" value="' . e($action) . '">';
    echo '<input type="hidden" name="id" value="' . e($id) . '">';
    echo '<input type="hidden" name="filter" value="' . e($filter) . '">';
    echo '<button type="submit" class="' . e($class) . '" title="' . e($title) . '">' . $label . '</button>';
    echo '</form>';
}
?>
<div class="row-between">
    <div>
        <h1 class="page">Todas las Notas</h1>
        <p class="sub"><?= $total ?> artículos en total</p>
    </div>
    <a href="/admin/nota-nueva.php" class="btn btn-dark">+ Nueva Nota</a>
</div>

<div class="filters">
    <a href="?filter=all" class="<?= $filter==='all'?'on':'' ?>">Todas (<?= $total ?>)</a>
    <a href="?filter=featured" class="<?= $filter==='featured'?'on':'' ?>">⭐ Destacadas (<?= $nFeatured ?>)</a>
    <a href="?filter=breaking" class="<?= $filter==='breaking'?'on':'' ?>">🔴 Última Hora (<?= $nBreaking ?>)</a>
</div>

<?php if (!$posts): ?>
    <div class="card-box" style="text-align:center;color:#9CA3AF;padding:3rem;">No hay notas con este filtro. <a href="/admin/nota-nueva.php" style="color:#2563EB;">Crear una nueva</a></div>
<?php else: ?>
<div class="table-wrap">
    <table>
        <thead><tr>
            <th>Título</th><th style="width:120px;">Categoría</th>
            <th style="width:70px;text-align:center;">Dest.</th><th style="width:70px;text-align:center;">Últ. H</th>
            <th style="width:70px;text-align:center;">Fuente</th><th style="width:70px;text-align:center;">Vistas</th>
            <th style="width:160px;text-align:right;">Acciones</th>
        </tr></thead>
        <tbody>
        <?php foreach ($posts as $p): ?>
            <tr>
                <td>
                    <div style="font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:360px;"><?= e($p['title']) ?></div>
                    <div style="font-size:0.75rem;color:#9CA3AF;"><?= e(fecha_corta($p['published_at'])) ?></div>
                </td>
                <td><span class="pill pill-amber"><?= e($p['category_name']) ?></span></td>
                <td style="text-align:center;">
                    <?php action_form('toggle_featured', $p['id'], $filter, 'toggle-btn ' . ($p['is_featured']?'toggle-on-amber':'toggle-off'), '⭐', $p['is_featured']?'Quitar destacada':'Marcar destacada'); ?>
                </td>
                <td style="text-align:center;">
                    <?php action_form('toggle_breaking', $p['id'], $filter, 'toggle-btn ' . ($p['is_breaking']?'toggle-on-red':'toggle-off'), '🔴', $p['is_breaking']?'Quitar última hora':'Marcar última hora'); ?>
                </td>
                <td style="text-align:center;"><span class="pill <?= ($p['source']??'')==='wordpress'?'pill-blue':'pill-green' ?>"><?= ($p['source']??'')==='wordpress'?'WP':'SB' ?></span></td>
                <td style="text-align:center;color:#6B7280;"><?= (int)$p['view_count'] ?></td>
                <td style="text-align:right;">
                    <a href="/articulo/<?= e(rawurlencode($p['id'])) ?>" target="_blank" style="font-size:0.8rem;color:#2563EB;margin-right:0.5rem;">Ver</a>
                    <a href="/admin/nota-editar.php?id=<?= e(rawurlencode($p['id'])) ?>" style="font-size:0.8rem;color:#2563EB;margin-right:0.5rem;">Editar</a>
                    <?php action_form('delete', $p['id'], $filter, 'link-danger', 'Eliminar', 'Eliminar', true); ?>
                </td>
            </tr>
        <?php endforeach; ?>
        </tbody>
    </table>
</div>
<?php endif; ?>
<?php include __DIR__ . '/includes/admin_footer.php';
