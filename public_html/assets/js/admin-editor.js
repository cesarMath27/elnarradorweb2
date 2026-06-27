/* Editor enriquecido + medidor SEO para alta/edición de notas. */
(function () {
  'use strict';
  var editor = document.getElementById('editor');
  var hidden = document.getElementById('content-field');

  // Cargar contenido inicial (modo edición)
  if (editor && hidden && hidden.value) {
    editor.innerHTML = hidden.value;
  }

  window.cmd = function (ev, command) {
    ev.preventDefault();
    document.execCommand(command, false, null);
    editor.focus();
    syncContent();
  };
  window.block = function (ev, tag) {
    ev.preventDefault();
    document.execCommand('formatBlock', false, '<' + tag + '>');
    editor.focus();
    syncContent();
  };
  window.makeLink = function (ev) {
    ev.preventDefault();
    var url = prompt('URL del enlace:', 'https://');
    if (url) document.execCommand('createLink', false, url);
    editor.focus();
    syncContent();
  };
  window.syncContent = function () {
    if (!editor) return;
    hidden.value = editor.innerHTML;
    seoUpdate();
  };

  window.imgMode = function (mode) {
    document.getElementById('imageOption').value = mode;
    document.getElementById('img-upload-box').style.display = mode === 'upload' ? 'block' : 'none';
    document.getElementById('img-url-box').style.display = mode === 'url' ? 'block' : 'none';
    document.getElementById('opt-upload').classList.toggle('btn-dark', mode === 'upload');
    document.getElementById('opt-url').classList.toggle('btn-dark', mode === 'url');
  };

  window.previewFile = function (input) {
    // marcador para SEO (hay imagen)
  };

  function hasImage() {
    var opt = document.getElementById('imageOption').value;
    if (opt === 'url') {
      var u = document.querySelector('[name=imageUrl]');
      return u && u.value.trim() !== '';
    }
    var f = document.querySelector('[name=imageFile]');
    return f && f.files && f.files.length > 0;
  }

  window.seoUpdate = function () {
    var title = (document.getElementById('f-title') || {}).value || '';
    var summary = (document.getElementById('f-summary') || {}).value || '';
    var cat = (document.getElementById('f-cat') || {}).value || '';
    var html = hidden ? hidden.value : '';
    var words = html.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length;

    // contadores
    var tc = document.getElementById('title-count'); if (tc) tc.textContent = title.length + ' caracteres';
    var sc = document.getElementById('summary-count'); if (sc) sc.textContent = summary.length + '/300';
    var wc = document.getElementById('word-count'); if (wc) wc.textContent = words + ' palabras';

    var checks = [
      { label: 'Título entre 40-70 caracteres', pass: title.length >= 40 && title.length <= 70, w: 20 },
      { label: 'Resumen entre 120-160', pass: summary.length >= 120 && summary.length <= 160, w: 20 },
      { label: 'Contenido +300 palabras', pass: words >= 300, w: 25 },
      { label: 'Imagen destacada', pass: hasImage(), w: 20 },
      { label: 'Categoría seleccionada', pass: cat !== '', w: 15 }
    ];
    var score = checks.reduce(function (s, c) { return s + (c.pass ? c.w : 0); }, 0);
    var color = score >= 80 ? '#16A34A' : score >= 50 ? '#D97706' : '#DC2626';
    var label = score >= 80 ? 'Excelente' : score >= 50 ? 'Aceptable' : 'Necesita mejoras';

    var num = document.getElementById('seo-score-num');
    if (num) { num.textContent = score; num.style.color = color; }
    var lab = document.getElementById('seo-label'); if (lab) { lab.textContent = label; lab.style.color = color; }
    var box = document.getElementById('seo-checks');
    if (box) {
      box.innerHTML = checks.map(function (c) {
        return '<div style="display:flex;gap:0.5rem;"><span>' + (c.pass ? '✅' : '⚠️') + '</span><span style="color:' + (c.pass ? '#374151' : '#B45309') + '">' + c.label + '</span></div>';
      }).join('');
    }
  };

  // Sincronizar antes de enviar
  var form = document.getElementById('nota-form');
  if (form) form.addEventListener('submit', function () { if (editor) hidden.value = editor.innerHTML; });

  seoUpdate();
})();
