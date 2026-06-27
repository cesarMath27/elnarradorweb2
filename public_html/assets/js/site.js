/* El Narrador de México — JS del sitio público */
(function () {
  'use strict';

  // ───── Ticker rotativo de últimas noticias ─────
  var items = document.querySelectorAll('[data-ticker]');
  if (items.length > 1) {
    var idx = 0;
    setInterval(function () {
      items[idx].style.display = 'none';
      idx = (idx + 1) % items.length;
      items[idx].style.display = 'inline';
    }, 4000);
  }

  // ───── Barra de progreso de lectura (páginas de artículo) ─────
  var bar = document.getElementById('reading-progress');
  if (bar) {
    var onScroll = function () {
      var h = document.documentElement;
      var scrolled = h.scrollTop;
      var height = h.scrollHeight - h.clientHeight;
      var pct = height > 0 ? (scrolled / height) * 100 : 0;
      bar.style.width = pct + '%';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
})();
