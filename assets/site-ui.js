(function () {
  'use strict';
  // A page may include the shared runtime only once, even during migration.
  if (window.drSiteUI) return;
  window.drSiteUI = true;

  var root = document.documentElement;
  var saved;
  try { saved = localStorage.getItem('dr-theme'); } catch (e) {}
  var preferred = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  root.setAttribute('data-theme', saved === 'dark' || saved === 'light' ? saved : preferred);

  function init() {
    var menu = document.querySelector('.header .menu');
    var nav = document.querySelector('.header .nav nav');
    var theme = document.querySelector('.header .theme-toggle');

    function updateTheme(value, persist) {
      root.setAttribute('data-theme', value);
      if (persist) {
        try { localStorage.setItem('dr-theme', value); } catch (e) {}
      }
      if (theme) {
        var dark = value === 'dark';
        theme.setAttribute('aria-pressed', String(dark));
        theme.setAttribute('aria-label', dark ? 'Açık moda geç' : 'Koyu moda geç');
        theme.setAttribute('title', dark ? 'Açık moda geç' : 'Koyu moda geç');
      }
    }
    updateTheme(root.getAttribute('data-theme'), false);
    if (theme) theme.addEventListener('click', function () {
      updateTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark', true);
    });

    if (!menu || !nav) return;
    nav.id = nav.id || 'site-nav';
    menu.setAttribute('aria-controls', nav.id);
    function setOpen(open, returnFocus) {
      nav.classList.toggle('open', open);
      menu.setAttribute('aria-expanded', String(open));
      menu.setAttribute('aria-label', open ? 'Menüyü kapat' : 'Menüyü aç');
      if (returnFocus) menu.focus();
    }
    setOpen(false);
    menu.addEventListener('click', function () { setOpen(!nav.classList.contains('open')); });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && nav.classList.contains('open')) setOpen(false, true);
    });
    document.addEventListener('click', function (event) {
      if (!nav.classList.contains('open')) return;
      if (nav.contains(event.target)) {
        if (event.target.closest('a')) setOpen(false);
      } else if (!menu.contains(event.target)) setOpen(false);
    });
    if (window.matchMedia) {
      var desktop = window.matchMedia('(min-width: 781px)');
      var closeOnDesktop = function (event) { if (event.matches) setOpen(false); };
      if (desktop.addEventListener) desktop.addEventListener('change', closeOnDesktop);
      else if (desktop.addListener) desktop.addListener(closeOnDesktop);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
