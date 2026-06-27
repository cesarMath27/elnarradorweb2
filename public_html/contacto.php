<?php
require __DIR__ . '/includes/bootstrap.php';
$meta_title = 'Contacto - El Narrador de México';
$meta_canonical = url('contacto');
include __DIR__ . '/includes/header.php';
?>
<div class="container" style="padding:2.5rem 1rem;">
  <div class="prose">
    <h1>Contacto</h1>
    <p>¿Tienes una noticia, comentario o propuesta? Escríbenos.</p>
    <h2>Datos</h2>
    <p>📍 Álvaro Obregón 452, Zona Centro, Aguascalientes, Ags.</p>
    <p>📞 5610973271</p>
    <p>📧 <a href="mailto:contacto@elnarradordemexico.com" style="color:var(--gold-dark);text-decoration:underline;">contacto@elnarradordemexico.com</a></p>
    <p>📘 <a href="https://www.facebook.com/elnarradordemexico" target="_blank" rel="noopener" style="color:var(--gold-dark);text-decoration:underline;">Facebook</a></p>
  </div>
</div>
<?php include __DIR__ . '/includes/footer.php';
