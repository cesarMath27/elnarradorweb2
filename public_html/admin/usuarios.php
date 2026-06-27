<?php
require __DIR__ . '/../includes/bootstrap.php';
require __DIR__ . '/includes/auth.php';
require __DIR__ . '/includes/uploads.php'; // uuid_v4()
$admin = require_login();

$error = null; $success = null;
$isOwner = ($admin['role'] ?? '') === 'owner';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_check();
    if (!$isOwner) {
        $error = 'Solo los propietarios pueden gestionar usuarios.';
    } else {
        $action = (string)($_POST['action'] ?? '');
        if ($action === 'add') {
            $email = strtolower(trim((string)($_POST['email'] ?? '')));
            $name  = trim((string)($_POST['display_name'] ?? ''));
            $role  = (string)($_POST['role'] ?? 'writer');
            $pass  = (string)($_POST['password'] ?? '');
            if ($email === '' || $name === '' || !in_array($role, ['owner','editor','writer'], true)) {
                $error = 'Completa correo, nombre y rol válidos.';
            } elseif (strlen($pass) < 8) {
                $error = 'La contraseña debe tener al menos 8 caracteres.';
            } else {
                $chk = db()->prepare("SELECT id FROM admin_users WHERE LOWER(email) = :e");
                $chk->execute([':e' => $email]);
                if ($chk->fetch()) {
                    $error = 'Ya existe un usuario con ese correo.';
                } else {
                    $st = db()->prepare("INSERT INTO admin_users (id, email, display_name, role, password_hash, created_at) VALUES (:id,:e,:n,:r,:h,:c)");
                    $st->execute([':id'=>uuid_v4(), ':e'=>$email, ':n'=>$name, ':r'=>$role, ':h'=>password_hash($pass, PASSWORD_DEFAULT), ':c'=>gmdate('Y-m-d H:i:s')]);
                    $success = 'Usuario agregado correctamente.';
                }
            }
        } elseif ($action === 'remove') {
            $rid = (string)($_POST['id'] ?? '');
            if ($rid === $admin['id']) $error = 'No puedes eliminarte a ti mismo.';
            else { db()->prepare("DELETE FROM admin_users WHERE id = :id")->execute([':id'=>$rid]); $success = 'Usuario eliminado.'; }
        } elseif ($action === 'setpass') {
            $rid = (string)($_POST['id'] ?? '');
            $pass = (string)($_POST['password'] ?? '');
            if (strlen($pass) < 8) $error = 'La contraseña debe tener al menos 8 caracteres.';
            else { db()->prepare("UPDATE admin_users SET password_hash = :h WHERE id = :id")->execute([':h'=>password_hash($pass, PASSWORD_DEFAULT), ':id'=>$rid]); $success = 'Contraseña actualizada.'; }
        }
    }
}

$users = db()->query("SELECT * FROM admin_users ORDER BY created_at ASC")->fetchAll();
$roleLabels = ['owner'=>['Propietario','pill-amber'], 'editor'=>['Editor','pill-blue'], 'writer'=>['Redactor','pill-green']];

$active = 'usuarios';
$page_title = 'Usuarios';
include __DIR__ . '/includes/admin_header.php';
?>
<div class="row-between">
    <div><h1 class="page">Usuarios del Panel</h1><p class="sub">Administra quién tiene acceso</p></div>
</div>
<?php if ($success): ?><div class="alert alert-ok"><?= e($success) ?></div><?php endif; ?>
<?php if ($error): ?><div class="alert alert-err"><?= e($error) ?></div><?php endif; ?>

<?php if ($isOwner): ?>
<div class="card-box">
    <h2 style="font-size:1rem;font-weight:600;margin:0 0 1rem;">Agregar usuario</h2>
    <form method="post" action="/admin/usuarios.php" style="display:grid;grid-template-columns:repeat(4,1fr);gap:0.75rem;align-items:end;">
        <?= csrf_field() ?>
        <input type="hidden" name="action" value="add">
        <div><label class="field">Correo</label><input type="email" name="email" required placeholder="usuario@email.com"></div>
        <div><label class="field">Nombre</label><input type="text" name="display_name" required placeholder="Nombre"></div>
        <div><label class="field">Rol</label>
            <select name="role"><option value="writer">Redactor</option><option value="editor">Editor</option><option value="owner">Propietario</option></select>
        </div>
        <div><label class="field">Contraseña</label><input type="password" name="password" required minlength="8" placeholder="mín. 8"></div>
        <div style="grid-column:1/-1;"><button type="submit" class="btn btn-dark">Agregar</button></div>
    </form>
</div>
<?php endif; ?>

<div class="table-wrap">
    <table>
        <thead><tr><th>Usuario</th><th>Correo</th><th style="width:120px;">Rol</th><th style="width:110px;">Alta</th><?php if($isOwner):?><th style="width:220px;text-align:right;">Acciones</th><?php endif;?></tr></thead>
        <tbody>
        <?php foreach ($users as $u): $rl = $roleLabels[$u['role']] ?? [$u['role'],'pill-green']; $hasPass = !empty($u['password_hash']); ?>
            <tr>
                <td style="font-weight:500;"><?= e($u['display_name']) ?> <?php if(!$hasPass):?><span class="pill pill-amber" title="Sin contraseña">sin contraseña</span><?php endif;?></td>
                <td style="color:#6B7280;"><?= e($u['email']) ?></td>
                <td><span class="pill <?= e($rl[1]) ?>"><?= e($rl[0]) ?></span></td>
                <td style="color:#9CA3AF;font-size:0.8rem;"><?= e(fecha_corta($u['created_at'])) ?></td>
                <?php if ($isOwner): ?>
                <td style="text-align:right;">
                    <details style="display:inline-block;text-align:left;">
                        <summary style="cursor:pointer;color:#2563EB;font-size:0.8rem;list-style:none;">Contraseña</summary>
                        <form method="post" action="/admin/usuarios.php" style="display:flex;gap:0.25rem;margin-top:0.35rem;">
                            <?= csrf_field() ?>
                            <input type="hidden" name="action" value="setpass"><input type="hidden" name="id" value="<?= e($u['id']) ?>">
                            <input type="password" name="password" placeholder="nueva (mín. 8)" minlength="8" style="padding:0.35rem 0.5rem;font-size:0.8rem;">
                            <button class="btn btn-light" style="padding:0.35rem 0.6rem;font-size:0.78rem;">OK</button>
                        </form>
                    </details>
                    <?php if ($u['id'] !== $admin['id']): ?>
                    <form method="post" action="/admin/usuarios.php" style="display:inline;" onsubmit="return confirm('¿Eliminar a <?= e($u['display_name']) ?>?')">
                        <?= csrf_field() ?>
                        <input type="hidden" name="action" value="remove"><input type="hidden" name="id" value="<?= e($u['id']) ?>">
                        <button class="link-danger" style="margin-left:0.5rem;">Eliminar</button>
                    </form>
                    <?php endif; ?>
                </td>
                <?php endif; ?>
            </tr>
        <?php endforeach; ?>
        </tbody>
    </table>
</div>
<?php include __DIR__ . '/includes/admin_footer.php';
