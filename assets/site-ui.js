(function () {
  'use strict';
  // A page may include the shared runtime only once, even during migration.
  if (window.drSiteUI) return;
  window.drSiteUI = true;

  var root = document.documentElement;
  var english = root.lang === 'en';
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
        var label = english ? (dark ? 'Switch to light mode' : 'Switch to dark mode') : (dark ? 'Açık moda geç' : 'Koyu moda geç');
        theme.setAttribute('aria-label', label);
        theme.setAttribute('title', label);
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
      menu.setAttribute('aria-label', english ? (open ? 'Close menu' : 'Open menu') : (open ? 'Menüyü kapat' : 'Menüyü aç'));
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
      var desktop = window.matchMedia('(min-width: 1241px)');
      var closeOnDesktop = function (event) { if (event.matches) setOpen(false); };
      if (desktop.addEventListener) desktop.addEventListener('change', closeOnDesktop);
      else if (desktop.addListener) desktop.addListener(closeOnDesktop);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

/*
 * Analytics bootstrap.
 * To activate GA4, set window.DR_GA4_ID to the site's Measurement ID (G-XXXXXXXXXX)
 * before this file loads, or add:
 * <meta name="ga4-measurement-id" content="G-XXXXXXXXXX">
 */
(function () {
  'use strict';

  function getMeasurementId() {
    if (window.DR_GA4_ID && /^G-[A-Z0-9]+$/i.test(window.DR_GA4_ID)) return window.DR_GA4_ID;
    var meta = document.querySelector('meta[name="ga4-measurement-id"]');
    var value = meta ? (meta.getAttribute('content') || '').trim() : '';
    return /^G-[A-Z0-9]+$/i.test(value) ? value : '';
  }

  var measurementId = getMeasurementId();
  window.dataLayer = window.dataLayer || [];

  if (measurementId && typeof window.gtag !== 'function') {
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', measurementId, { send_page_view: true });

    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(measurementId);
    document.head.appendChild(script);
  }
})();

/* Track phone and WhatsApp conversion clicks with page and placement context. */
(function () {
  'use strict';

  function getPlacement(link) {
    if (link.closest('.mobile-actions')) return 'mobile_bar';
    if (link.closest('.cta')) return 'cta';
    if (link.closest('.hero-actions')) return 'hero';
    if (link.closest('.side-contact')) return 'side_contact';
    if (link.closest('.topline')) return 'topline';
    if (link.classList.contains('call')) return 'header_call';
    return 'other';
  }

  function sendEvent(eventName, data) {
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, data);
      return;
    }
    window.dataLayer = window.dataLayer || [];
    var payload = { event: eventName };
    Object.keys(data).forEach(function (key) { payload[key] = data[key]; });
    window.dataLayer.push(payload);
  }

  document.addEventListener('click', function (event) {
    var link = event.target && event.target.closest ? event.target.closest('a[href]') : null;
    if (!link) return;

    var href = link.getAttribute('href') || '';
    var method = href.indexOf('tel:') === 0 ? 'phone' : (href.indexOf('wa.me/') !== -1 ? 'whatsapp' : '');
    if (!method) return;

    var eventData = {
      contact_method: method,
      contact_page: window.location.pathname,
      contact_placement: getPlacement(link),
      contact_label: (link.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80)
    };

    sendEvent('contact_click', eventData);
    sendEvent(method === 'phone' ? 'phone_click' : 'whatsapp_click', eventData);
  }, { passive: true });
})();
