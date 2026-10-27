(function () {
  'use strict';
  function initFinder() {
    var form = document.getElementById('service-finder');
    if (!form) return;
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var device = form.elements.device.value;
      var intent = form.elements.intent.value;
      var devices = ['buzdolabi', 'camasir-makinesi', 'bulasik-makinesi', 'kurutma-makinesi', 'derin-dondurucu', 'firin', 'klima', 'kombi'];
      if (devices.indexOf(device) < 0 || ['service', 'guide', 'appointment'].indexOf(intent) < 0) return;
      var name = form.elements.device.options[form.elements.device.selectedIndex].text;
      var url = intent === 'appointment' ? 'iletisim.html?cihaz=' + encodeURIComponent(name) + '#randevu' :
        intent === 'guide' ? device + '-ariza-rehberi.html' : (device === 'firin' ? 'firin-ocak' : device) + '-servisi.html';
      window.location.assign(url);
    });
  }
  function bindRail(track, previous, next, status) {
    if (!track || !previous || !next || !track.children.length) return;
    previous.parentElement.hidden = false;
    var lastIndex = 0;
    var photoMode = track.classList.contains('gx-frames');
    function positive(value) { return Number.isFinite(value) && value > 0 ? value : 0; }
    function measure() {
      var width = positive(track.clientWidth);
      if (!width) return null;
      // Each photo fills the viewport, independently of offsetParent or image loading.
      var step = width;
      if (!photoMode && track.children.length > 1) {
        var first = track.children[0].getBoundingClientRect();
        var second = track.children[1].getBoundingClientRect();
        var gap = parseFloat(window.getComputedStyle(track).columnGap) || 0;
        step = positive(second.left - first.left) || positive(first.width + gap) || width;
      }
      var max = Math.max(0, (Number.isFinite(track.scrollWidth) ? track.scrollWidth : width) - width);
      // Elastic scrolling can temporarily report negative or over-end positions.
      var left = Math.max(0, Math.min(max, Number.isFinite(track.scrollLeft) ? track.scrollLeft : 0));
      return { step: step, left: left, max: max };
    }
    function sync() {
      var metrics = measure();
      if (metrics) {
        lastIndex = Math.max(0, Math.min(track.children.length - 1, Math.round(metrics.left / metrics.step)));
        previous.disabled = metrics.left < 6;
        next.disabled = metrics.left >= metrics.max - 2;
      } else { previous.disabled = true; next.disabled = true; }
      if (status) status.textContent = (lastIndex + 1) + ' / ' + track.children.length;
    }
    function move(direction) {
      var metrics = measure();
      if (!metrics) { sync(); return; }
      var destination = Math.max(0, Math.min(metrics.max, metrics.left + direction * metrics.step));
      track.scrollTo({ left: destination, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }
    previous.addEventListener('click', function () { move(-1); });
    next.addEventListener('click', function () { move(1); });
    track.addEventListener('scroll', sync, { passive: true });
    track.addEventListener('load', sync, true);
    track.addEventListener('keydown', function (event) {
      if (event.target !== track) return;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault(); event.stopPropagation();
        move(event.key === 'ArrowRight' ? 1 : -1);
      }
    });
    window.addEventListener('resize', sync);
    window.addEventListener('pageshow', sync);
    if (window.ResizeObserver) new window.ResizeObserver(sync).observe(track);
    if (window.IntersectionObserver) new window.IntersectionObserver(function (entries) {
      if (entries.some(function (entry) { return entry.isIntersecting; })) sync();
    }).observe(track);
    sync();
  }
  function init() {
    initFinder();
    var services = document.getElementById('vx-services');
    if (services) {
      var toolbar = services.previousElementSibling;
      bindRail(services, toolbar.querySelector('[data-vx-prev]'), toolbar.querySelector('[data-vx-next]'));
    }
    document.querySelectorAll('.gx-gallery').forEach(function (gallery) {
      bindRail(gallery.querySelector('.gx-frames'), gallery.querySelector('[data-gx-prev]'), gallery.querySelector('[data-gx-next]'), gallery.querySelector('.gx-photo-status'));
    });
    bindRail(document.getElementById('gx-reviews-track'), document.querySelector('[data-gx-review-prev]'), document.querySelector('[data-gx-review-next]'));
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
