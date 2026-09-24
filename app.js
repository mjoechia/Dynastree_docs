(function () {
  'use strict';

  var STRINGS = {
    zh: {
      brandTitle: 'Dynastree（万承）',
      brandSub: 'LPA-Custodian · 数字资产与 RWA 生态系统',
      downloadPdf: '下载 PDF',
      searchPlaceholder: '搜索章节…',
      footerText: '© Dynastree（万承）· LPA-Custodian',
      searchEmpty: '未找到结果',
      copy: '复制',
      copied: '已复制',
    },
    en: {
      brandTitle: 'Dynastree (万承)',
      brandSub: 'LPA-Custodian · Digital Asset & RWA Ecosystem',
      downloadPdf: 'Download PDF',
      searchPlaceholder: 'Search sections…',
      footerText: '© Dynastree (万承) · LPA-Custodian',
      searchEmpty: 'No results found',
      copy: 'Copy',
      copied: 'Copied',
    },
  };

  var state = {
    lang: 'zh',
    data: null, // { zh: [...], en: [...] }
    searchIndex: { zh: null, en: null },
  };

  var els = {};

  function $(id) { return document.getElementById(id); }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  // Convert **bold** markdown-lite (only bold syntax used in source) to <strong>
  function inlineFormat(text) {
    var escaped = escapeHtml(text);
    escaped = escaped.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    return escaped;
  }

  function slugFor(sectionNumber) {
    return 'section-' + sectionNumber.replace(/\./g, '-');
  }

  // ---------------- Rendering ----------------

  function renderBlock(block) {
    switch (block.type) {
      case 'subheading':
        return '<h3 class="subheading">' + inlineFormat(block.text) + '</h3>';
      case 'paragraph':
        return '<p class="body-text">' + inlineFormat(block.text) + '</p>';
      case 'list':
        return '<ul class="bullet-list">' + block.items.map(function (it) {
          return '<li>' + inlineFormat(it) + '</li>';
        }).join('') + '</ul>';
      case 'diagram':
        return '<div class="diagram-wrap"><pre class="diagram">' + escapeHtml(block.text) + '</pre></div>';
      case 'table':
        return renderTable(block);
      case 'callout_hero':
        return renderHeroCallout(block);
      case 'callout_payment':
        return renderPaymentCallout(block);
      default:
        return '';
    }
  }

  function renderTable(block) {
    var thead = '<thead><tr>' + block.header.map(function (h) {
      return '<th>' + inlineFormat(h) + '</th>';
    }).join('') + '</tr></thead>';
    var tbody = '<tbody>' + block.rows.map(function (row) {
      return '<tr>' + row.map(function (c) { return '<td>' + inlineFormat(c) + '</td>'; }).join('') + '</tr>';
    }).join('') + '</tbody>';
    return '<div class="table-wrap"><table class="data-table">' + thead + tbody + '</table></div>';
  }

  function renderHeroCallout(block) {
    return '' +
      '<div class="callout">' +
      '<p class="callout-label">' + inlineFormat(block.project_label) + '</p>' +
      '<p class="callout-project">' + inlineFormat(block.project_text) + '</p>' +
      '<p class="callout-label">' + inlineFormat(block.invest_label) + '</p>' +
      '<div class="callout-invest">' + inlineFormat(block.invest_text) + '</div>' +
      '</div>';
  }

  function renderPaymentCallout(block) {
    var stages = block.stages.map(function (s) {
      return '<div class="callout-stage"><div class="callout-stage-pct">' + inlineFormat(s.pct) + '</div>' +
        '<div class="callout-stage-name">' + inlineFormat(s.name) + '</div></div>';
    }).join('');
    var t = STRINGS[state.lang];
    return '' +
      '<div class="callout">' +
      '<p class="callout-label">' + inlineFormat(block.heading) + '</p>' +
      '<div class="callout-stages">' + stages + '</div>' +
      '<p class="callout-wallet-label">' + inlineFormat(block.wallet_label) + '</p>' +
      '<div class="callout-wallet"><span>' + escapeHtml(block.wallet_address) + '</span>' +
      '<button class="copy-btn" data-wallet="' + escapeHtml(block.wallet_address) + '">' + t.copy + '</button></div>' +
      '</div>';
  }

  function renderSection(section) {
    var blocksHtml = section.blocks.map(renderBlock).join('');
    return (
      '<section class="section" id="' + slugFor(section.number) + '" data-number="' + section.number + '">' +
      '<h2 class="section-heading">' + escapeHtml(section.title) + '</h2>' +
      blocksHtml +
      '</section>'
    );
  }

  function renderContent() {
    var sections = state.data[state.lang];
    els.content.innerHTML = sections.map(renderSection).join('');
    bindCopyButtons();
  }

  function renderSidebar() {
    var sections = state.data[state.lang];
    els.sidebarNav.innerHTML = sections.map(function (s) {
      return '<button class="nav-item" data-target="' + slugFor(s.number) + '">' + escapeHtml(s.title) + '</button>';
    }).join('');
  }

  function bindCopyButtons() {
    var btns = els.content.querySelectorAll('.copy-btn');
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var addr = btn.getAttribute('data-wallet');
        var t = STRINGS[state.lang];
        var restore = btn.textContent;
        function done() {
          btn.textContent = t.copied;
          setTimeout(function () { btn.textContent = restore; }, 1500);
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(addr).then(done).catch(done);
        } else {
          done();
        }
      });
    });
  }

  function applyStaticStrings() {
    var t = STRINGS[state.lang];
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (t[key]) el.textContent = t[key];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-placeholder');
      if (t[key]) el.setAttribute('placeholder', t[key]);
    });
    document.documentElement.lang = state.lang === 'zh' ? 'zh' : 'en';
  }

  // ---------------- Search ----------------

  function buildSearchIndex(lang) {
    var sections = state.data[lang];
    return sections.map(function (s) {
      var parts = [s.title];
      s.blocks.forEach(function (b) {
        if (b.type === 'paragraph' || b.type === 'subheading') parts.push(b.text);
        else if (b.type === 'list') parts.push(b.items.join(' '));
        else if (b.type === 'diagram') parts.push(b.text);
        else if (b.type === 'table') {
          parts.push(b.header.join(' '));
          b.rows.forEach(function (r) { parts.push(r.join(' ')); });
        } else if (b.type === 'callout_hero') {
          parts.push(b.project_text, b.invest_text);
        } else if (b.type === 'callout_payment') {
          parts.push(b.wallet_address);
          b.stages.forEach(function (st) { parts.push(st.name, st.pct); });
        }
      });
      var full = parts.join(' \n ');
      return { number: s.number, title: s.title, text: full, textLower: full.toLowerCase() };
    });
  }

  function getSearchIndex() {
    if (!state.searchIndex[state.lang]) {
      state.searchIndex[state.lang] = buildSearchIndex(state.lang);
    }
    return state.searchIndex[state.lang];
  }

  function runSearch(query) {
    query = query.trim();
    if (!query) return [];
    var q = query.toLowerCase();
    var index = getSearchIndex();
    var results = [];
    index.forEach(function (entry) {
      var idx = entry.textLower.indexOf(q);
      if (idx !== -1) {
        var titleMatch = entry.title.toLowerCase().indexOf(q) !== -1;
        var start = Math.max(0, idx - 40);
        var snippet = entry.text.substring(start, idx + q.length + 60).replace(/\n/g, ' ');
        results.push({
          number: entry.number,
          title: entry.title,
          snippet: snippet,
          score: titleMatch ? 0 : idx,
        });
      }
    });
    results.sort(function (a, b) { return a.score - b.score; });
    return results.slice(0, 20);
  }

  function highlightMatch(text, query) {
    if (!query) return escapeHtml(text);
    var idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return escapeHtml(text);
    return escapeHtml(text.substring(0, idx)) +
      '<mark>' + escapeHtml(text.substring(idx, idx + query.length)) + '</mark>' +
      escapeHtml(text.substring(idx + query.length));
  }

  function renderSearchResults(query, results) {
    if (!results.length) {
      var t = STRINGS[state.lang];
      els.searchResults.innerHTML = '<div class="search-result-empty">' + t.searchEmpty + '</div>';
      els.searchResults.hidden = false;
      return;
    }
    els.searchResults.innerHTML = results.map(function (r) {
      return '' +
        '<button class="search-result-item" data-target="' + slugFor(r.number) + '">' +
        '<div class="search-result-title">' + highlightMatch(r.title, query) + '</div>' +
        '<div class="search-result-snippet">' + highlightMatch(r.snippet, query) + '</div>' +
        '</button>';
    }).join('');
    els.searchResults.hidden = false;
  }

  function closeSearch() {
    els.searchResults.hidden = true;
  }

  // ---------------- Navigation ----------------

  function jumpTo(id) {
    var target = document.getElementById(id);
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    target.classList.remove('flash');
    void target.offsetWidth;
    target.classList.add('flash');
    updateActiveNav(id);
    closeSidebar();
    try { history.replaceState(null, '', '#' + id); } catch (e) {}
  }

  function updateActiveNav(id) {
    els.sidebarNav.querySelectorAll('.nav-item').forEach(function (item) {
      item.classList.toggle('active', item.getAttribute('data-target') === id);
    });
  }

  function setupScrollSpy() {
    var sections = document.querySelectorAll('.section');
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          updateActiveNav(entry.target.id);
        }
      });
    }, { rootMargin: '-20% 0px -70% 0px', threshold: 0 });
    sections.forEach(function (s) { observer.observe(s); });
  }

  function openSidebar() {
    els.sidebar.classList.add('open');
    els.sidebarBackdrop.classList.add('show');
  }
  function closeSidebar() {
    els.sidebar.classList.remove('open');
    els.sidebarBackdrop.classList.remove('show');
  }

  // ---------------- Language switching ----------------

  function setLanguage(lang) {
    state.lang = lang;
    els.langZh.classList.toggle('active', lang === 'zh');
    els.langEn.classList.toggle('active', lang === 'en');
    applyStaticStrings();
    renderSidebar();
    renderContent();
    setupScrollSpy();
    closeSearch();
    els.searchInput.value = '';
    try { localStorage.setItem('dynastree_lang', lang); } catch (e) {}
  }

  // ---------------- Init ----------------

  function init() {
    els.content = $('content');
    els.sidebar = $('sidebar');
    els.sidebarNav = $('sidebarNav');
    els.sidebarBackdrop = $('sidebarBackdrop');
    els.navToggle = $('navToggle');
    els.langZh = $('langZh');
    els.langEn = $('langEn');
    els.searchInput = $('searchInput');
    els.searchResults = $('searchResults');

    fetch('data/content.json')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        state.data = data;
        var savedLang = 'zh';
        try {
          var saved = localStorage.getItem('dynastree_lang');
          if (saved === 'en' || saved === 'zh') savedLang = saved;
        } catch (e) {}
        setLanguage(savedLang);

        if (window.location.hash) {
          var id = window.location.hash.slice(1);
          setTimeout(function () { jumpTo(id); }, 60);
        }
      })
      .catch(function (err) {
        els.content.innerHTML = '<p class="body-text">Failed to load content data. ' + escapeHtml(String(err)) + '</p>';
      });

    els.langZh.addEventListener('click', function () { setLanguage('zh'); });
    els.langEn.addEventListener('click', function () { setLanguage('en'); });

    els.navToggle.addEventListener('click', function () {
      if (els.sidebar.classList.contains('open')) closeSidebar(); else openSidebar();
    });
    els.sidebarBackdrop.addEventListener('click', closeSidebar);

    els.sidebarNav.addEventListener('click', function (e) {
      var btn = e.target.closest('.nav-item');
      if (btn) jumpTo(btn.getAttribute('data-target'));
    });

    els.searchInput.addEventListener('input', function () {
      var q = els.searchInput.value;
      if (!q.trim()) { closeSearch(); return; }
      var results = runSearch(q);
      renderSearchResults(q, results);
    });

    els.searchInput.addEventListener('focus', function () {
      if (els.searchInput.value.trim()) {
        renderSearchResults(els.searchInput.value, runSearch(els.searchInput.value));
      }
    });

    els.searchResults.addEventListener('click', function (e) {
      var btn = e.target.closest('.search-result-item');
      if (btn) {
        jumpTo(btn.getAttribute('data-target'));
        closeSearch();
        els.searchInput.blur();
      }
    });

    document.addEventListener('click', function (e) {
      if (!e.target.closest('.search-wrap')) closeSearch();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeSearch();
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
