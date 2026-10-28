(function () {
  'use strict';
  function normalize(value) {
    return String(value || '').toLocaleLowerCase('tr-TR').replace(/ı/g, 'i')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
  }
  function queryWords(value) {
    return normalize(value).replace(/\bbuz dolabi\b/g, 'buzdolabi')
      .replace(/\bmakina\b/g, 'makine').replace(/\bboch\b/g, 'bosch')
      .split(/\s+/).filter(function (w) { return w.length > 1 && !/^(ve|icin|bir|neden|nasil)$/.test(w); }).slice(0, 12);
  }
  function stem(word) {
    if (/^sogut/.test(word)) return 'sogut';
    if (/^isit/.test(word)) return 'isit';
    if (/^calis/.test(word)) return 'calis';
    if (/^servis/.test(word) || /^tamir/.test(word) || /^onarim/.test(word)) return 'servis';
    if (/^makin/.test(word)) return 'makin';
    return word;
  }
  function rank(records, query, language) {
    var words = queryWords(query).map(stem);
    if (!words.length) return [];
    return records.map(function (record) {
      var title = normalize(record.title);
      var primary = (title + ' ' + normalize(record.url.replace(/\.html$/, ''))).split(' ').map(stem);
      var secondary = normalize(record.description).split(' ').map(stem);
      var score = 0;
      var matches = words.every(function (word) {
        var exact = primary.indexOf(word) >= 0;
        var prefix = word.length >= 3 && primary.some(function (part) { return part.indexOf(word) === 0; });
        var description = word.length >= 3 && secondary.some(function (part) { return part.indexOf(word) === 0; });
        score += exact ? 20 : prefix ? 12 : description ? 2 : 0;
        return exact || prefix || description;
      });
      if (!matches) return null;
      if (title === normalize(query)) score += 80;
      if (title.indexOf(normalize(query)) === 0) score += 30;
      if (record.lang === (language || 'tr')) score += 4;
      // A neighbourhood-only search should open its overview before an appliance subpage.
      var areaName = title.split(' beyaz esya servisi')[0].split(' ');
      if (/-beyaz-esya-servisi\.html$/.test(record.url) && words.every(function (word) {
        return areaName.some(function (part) { return part.indexOf(word) === 0; });
      })) score += 12;
      // Prefer the concise direct service when a broad device query also matches many local pages.
      score += Math.max(0, 12 - title.split(' ').length);
      return { record: record, score: score };
    }).filter(Boolean).sort(function (a, b) {
      return b.score - a.score || a.record.title.localeCompare(b.record.title, 'tr');
    }).map(function (item) { return item.record; });
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { normalize: normalize, rank: rank }; return;
  }
  var scriptURL = new URL(document.currentScript.src);
  var siteRoot = new URL('../', scriptURL);
  var english = document.documentElement.lang === 'en';
  var copy = english ? {
    title: 'Find the right service.', intro: 'Search by appliance, brand, area or problem.', label: 'What are you looking for?',
    placeholder: 'Brand, appliance, area or problem', search: 'Search', clear: 'Clear search', close: 'Close search',
    suggestions: 'Try a search', popular: 'Quick links', loading: 'Finding pages…', empty: 'No matching page found.',
    emptyHelp: 'Try the appliance or brand name. You can also call us for help.', error: 'Search could not load. Please try again.',
    retry: 'Try again', all: 'Open search page', count: 'matching pages', showing: 'Showing the first', call: 'Call the technician',
    hint: 'You can type without Turkish characters.', more: 'Add a brand, area or problem to narrow the results.'
  } : {
    title: 'Doğru hizmeti kolayca bulun.', intro: 'Cihazınızı, markanızı, mahallenizi veya yaşadığınız sorunu yazın.', label: 'Ne arıyorsunuz?',
    placeholder: 'Marka, cihaz, mahalle veya arıza', search: 'Bul', clear: 'Aramayı temizle', close: 'Aramayı kapat',
    suggestions: 'Örnek aramalar', popular: 'Hızlı ulaşın', loading: 'Sayfalar bulunuyor…', empty: 'Bu aramayla eşleşen sayfa bulunamadı.',
    emptyHelp: 'Cihaz veya marka adıyla yeniden deneyin. Sorununuzu telefonda da anlatabilirsiniz.', error: 'Arama şu anda yüklenemedi. Yeniden deneyebilirsiniz.',
    retry: 'Yeniden dene', all: 'Arama sayfasını aç', count: 'sayfa bulundu', showing: 'İlk', call: 'Doğrudan ustaya ulaşın',
    hint: 'Türkçe karakter kullanmadan da arayabilirsiniz.', more: 'Sonuçları daraltmak için marka, mahalle veya arıza ekleyin.'
  };
  var labels = english ? {service:'Service',area:'Service area',brand:'Brand service',guide:'Troubleshooting',info:'Information'} :
    {service:'Cihaz servisi',area:'Hizmet bölgesi',brand:'Markaya göre servis',guide:'Arıza rehberi',info:'Bilgi & iletişim'};
  var pending;
  function load() {
    if (pending) return pending;
    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, 10000);
    pending = fetch(new URL('search-index.json?v=20261028a', scriptURL), { signal: controller.signal })
      .then(function (response) { if (!response.ok) throw new Error('index'); return response.json(); })
      .then(function (records) {
        if (!Array.isArray(records)) throw new Error('index format');
        return records.filter(function (r) { return r.title && /^[a-z0-9/-]+\.html$/.test(r.url) && !r.url.includes('..'); });
      }).catch(function (error) { pending = null; throw error; }).finally(function () { clearTimeout(timer); });
    return pending;
  }
  function element(tag, className, text) {
    var node = document.createElement(tag); if (className) node.className = className;
    if (text) node.textContent = text; return node;
  }
  function mount(container, modal) {
    var id = modal ? 'sx-modal-query' : 'sx-page-query';
    var form = element('form', 'sx-form'); form.setAttribute('role', 'search');
    var label = element('label', 'sx-label', copy.label); label.htmlFor = id;
    var field = element('div', 'sx-field');
    var input = element('input'); input.type = 'search'; input.id = id; input.maxLength = 120;
    input.placeholder = copy.placeholder; input.autocomplete = 'off'; input.spellcheck = false;
    input.setAttribute('enterkeyhint', 'search'); input.setAttribute('aria-describedby', id + '-hint');
    var submit = element('button', 'sx-submit', copy.search); submit.type = 'submit';
    field.append(input, submit); form.append(label, field);
    var hint = element('p', 'sx-hint', copy.hint); hint.id = id + '-hint';
    var examples = element('div', 'sx-examples'); examples.setAttribute('aria-label', copy.suggestions);
    (english ? ['Refrigerator', 'Washing machine', 'Pendik'] : ['Arçelik çamaşır', 'Yeni Mahalle', 'Buzdolabı soğutmuyor']).forEach(function (query) {
      var button = element('button', 'sx-chip', query); button.type = 'button';
      button.addEventListener('click', function () { input.value = query; render(); input.focus(); }); examples.append(button);
    });
    var toolbar = element('div', 'sx-result-heading');
    var status = element('p', 'sx-status', copy.popular); status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite');
    var clear = element('button', 'sx-clear', copy.clear); clear.type = 'button'; clear.hidden = true;
    clear.addEventListener('click', function () { input.value = ''; render(); input.focus(); });
    toolbar.append(status, clear);
    var results = element('ul', 'sx-results'); results.id = id + '-results'; input.setAttribute('aria-controls', results.id);
    var help = element('div', 'sx-help');
    var helpText = element('p'); var call = element('a', 'sx-help-link', copy.call + ' ↗'); call.href = 'tel:+905428912225';
    help.append(helpText, call); help.hidden = true;
    container.append(form, hint, examples, toolbar, results, help);
    var ticket = 0, debounce;
    function addResult(record) {
      var li = element('li'); var a = element('a', 'sx-result'); a.href = new URL(record.url, siteRoot).href;
      var info = element('div', 'sx-result-copy');
      info.append(element('span', 'sx-result-type', labels[record.category] || labels.info), element('strong', 'sx-result-title', record.title));
      if (record.description) info.append(element('span', 'sx-result-description', record.description));
      var arrow = element('span', 'sx-result-arrow', '↗'); arrow.setAttribute('aria-hidden', 'true');
      a.append(info, arrow); li.append(a); results.append(li);
    }
    function render() {
      var current = ++ticket; var query = input.value.trim(); clear.hidden = !query;
      status.textContent = copy.loading; results.setAttribute('aria-busy', 'true'); help.hidden = true;
      return load().then(function (records) {
        if (current !== ticket) return;
        results.replaceChildren(); results.removeAttribute('aria-busy');
        var matches;
        if (!query) {
          var popular = english ? ['en/services.html','en/pendik-hizmetler.html','en/index.html','iletisim.html'] :
            ['buzdolabi-servisi.html','camasir-makinesi-servisi.html','kombi-servisi.html','sik-sorulan-sorular.html','pendik-mahalleleri.html','iletisim.html'];
          matches = popular.map(function (url) { return records.find(function (r) { return r.url === url; }); }).filter(Boolean);
          status.textContent = copy.popular;
        } else {
          matches = rank(records, query, english ? 'en' : 'tr');
          status.textContent = matches.length ? matches.length + ' ' + copy.count : copy.empty;
        }
        var limit = modal ? 8 : 20;
        matches.slice(0, limit).forEach(addResult);
        if (!matches.length) { helpText.textContent = copy.emptyHelp; help.hidden = false; }
        if (matches.length > limit) {
          var item = element('li', 'sx-more', copy.showing + ' ' + limit + (english ? '. ' : ' sonuç gösteriliyor. ') + copy.more); results.append(item);
        }
      }).catch(function () {
        if (current !== ticket) return;
        results.replaceChildren(); results.removeAttribute('aria-busy'); status.textContent = copy.error;
        var li = element('li'); var retry = element('button', 'sx-chip', copy.retry); retry.type = 'button';
        retry.addEventListener('click', render); li.append(retry); results.append(li);
        helpText.textContent = copy.emptyHelp; help.hidden = false;
      });
    }
    form.addEventListener('submit', function (event) {
      event.preventDefault(); clearTimeout(debounce);
      if (!modal) history.replaceState(null, '', location.pathname + (input.value.trim() ? '#q=' + encodeURIComponent(input.value.trim()) : ''));
      render().then(function () { var first = results.querySelector('a'); if (first) first.focus(); });
    });
    input.addEventListener('input', function () { clearTimeout(debounce); debounce = setTimeout(render, 140); });
    input.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowDown') { var first = results.querySelector('a'); if (first) { event.preventDefault(); first.focus(); } }
    });
    return { input: input, render: render };
  }
  function init() {
    var page = document.querySelector('[data-sx-page]');
    if (page) {
      var search = mount(page, false);
      try { search.input.value = new URLSearchParams(location.hash.slice(1)).get('q') || new URLSearchParams(location.search).get('q') || ''; } catch (e) {}
      search.render();
    }
    var dialog, modalSearch, opener;
    document.querySelectorAll('[data-site-search]').forEach(function (trigger) {
      trigger.addEventListener('click', function (event) {
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
        if (typeof HTMLDialogElement === 'undefined' || !HTMLDialogElement.prototype.showModal) return;
        event.preventDefault(); opener = trigger;
        if (!dialog) {
          dialog = element('dialog', 'sx-dialog'); dialog.setAttribute('aria-labelledby', 'sx-dialog-title');
          var header = element('div', 'sx-dialog-top');
          var title = element('h2', '', copy.title); title.id = 'sx-dialog-title';
          var close = element('button', 'sx-close', '×'); close.type = 'button'; close.setAttribute('aria-label', copy.close);
          close.addEventListener('click', function () { dialog.close(); }); header.append(title, close);
          var body = element('div', 'sx-dialog-body'); body.append(element('p', 'sx-intro', copy.intro));
          var content = element('div'); body.append(content); dialog.append(header, body);
          modalSearch = mount(content, true);
          var all = element('a', 'sx-all', copy.all + ' ↗'); all.href = new URL('arama.html', siteRoot).href;
          all.addEventListener('click', function () { all.href = new URL('arama.html', siteRoot).href + '#q=' + encodeURIComponent(modalSearch.input.value.trim()); });
          body.append(all); document.body.append(dialog);
          dialog.addEventListener('close', function () { document.documentElement.classList.remove('sx-open'); if (opener && opener.isConnected) opener.focus(); });
          dialog.addEventListener('click', function (e) {
            var rect = dialog.getBoundingClientRect();
            if (e.target === dialog && (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom)) dialog.close();
          });
        }
        dialog.showModal(); document.documentElement.classList.add('sx-open'); modalSearch.render(); modalSearch.input.focus();
      });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
