(function () {
  'use strict';

  var state = { data: null };
  var els = {};

  var GOLD_TONES = ['#d4af37', '#b8952e', '#8a7530', '#6b5a24', '#4f421a', '#3a331a', '#2a2415'];

  function $(id) { return document.getElementById(id); }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function inlineFormat(text) {
    var escaped = escapeHtml(text);
    escaped = escaped.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    return escaped;
  }

  function slugFor(number) { return 'wp-section-' + number; }

  // ---------------- Block renderers ----------------

  function renderBlock(block) {
    switch (block.type) {
      case 'subheading': return '<h3 class="subheading">' + inlineFormat(block.text) + '</h3>';
      case 'paragraph': return '<p class="body-text">' + inlineFormat(block.text) + '</p>';
      case 'caption': return '<p class="wp-caption">' + inlineFormat(block.text) + '</p>';
      case 'list':
        return '<ul class="bullet-list">' + block.items.map(function (it) {
          return '<li>' + inlineFormat(it) + '</li>';
        }).join('') + '</ul>';
      case 'table': return renderTable(block);
      case 'note_panel':
        return '<div class="wp-note">' + inlineFormat(block.text) + '</div>';
      case 'token_compare': return renderTokenCompare();
      case 'layer_stack': return renderLayerStack(block);
      case 'utility_matrix': return renderUtilityMatrix(block);
      case 'pie_chart': return renderPieChart(block);
      case 'emission_timeline': return renderEmissionTimeline(block);
      case 'roadmap_timeline': return renderRoadmapTimeline(block);
      case 'flow_chain': return renderFlowChain(block);
      case 'ecosystem_flow': return renderEcosystemFlow();
      case 'loop_cycle': return renderLoopCycle(block);
      case 'asset_strip': return renderAssetStrip(block);
      case 'ladder': return renderLadder(block);
      case 'user_sees': return renderUserSees(block);
      case 'dashboard_mock': return renderDashboardMock(block);
      default: return '';
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

  function renderTokenCompare() {
    return '' +
      '<div class="token-compare">' +
      '<div class="token-card dyn">' +
        '<div class="token-card-title">DYN</div>' +
        '<div class="token-card-sub">Utility · Governance · Native Coin</div>' +
        '<ul><li>Community rewards &amp; staking</li><li>Referral incentives</li><li>Governance voting (later)</li>' +
        '<li>Validator staking (later)</li><li>Gas fee token (Dynastree Chain)</li></ul>' +
      '</div>' +
      '<div class="token-card dynusd">' +
        '<div class="token-card-title">DYNUSD</div>' +
        '<div class="token-card-sub">Payments · Settlement · Stable</div>' +
        '<ul><li>1 DYNUSD = 1 USD peg</li><li>Fully collateralized</li><li>Merchant &amp; cross-border payments</li>' +
        '<li>Mint against reserves / burn on redeem</li><li>Everyday spending currency</li></ul>' +
      '</div>' +
      '<div class="token-compare-vs">never competes with</div>' +
      '</div>';
  }

  function renderLayerStack(block) {
    return '<div class="layer-stack">' + block.layers.map(function (l) {
      return '<div class="layer-row"><div class="layer-name">' + inlineFormat(l.name.toUpperCase()) +
        '</div><div class="layer-items">' + inlineFormat(l.items) + '</div></div>';
    }).join('') + '</div>';
  }

  function renderUtilityMatrix(block) {
    var rows = Math.max(block.initial.length, block.later.length);
    var cells = '';
    for (var i = 0; i < rows; i++) {
      cells += '<div class="um-cell' + (i < block.initial.length ? '' : ' empty') + '">' +
        (i < block.initial.length ? inlineFormat(block.initial[i]) : '') + '</div>';
      cells += '<div class="um-cell' + (i < block.later.length ? '' : ' empty') + '">' +
        (i < block.later.length ? inlineFormat(block.later[i]) : '') + '</div>';
    }
    return '<div class="utility-matrix">' +
      '<div class="um-head">INITIAL UTILITIES</div><div class="um-head later">LATER UTILITIES</div>' +
      cells + '</div>';
  }

  function renderPieChart(block) {
    var total = block.data.reduce(function (s, d) { return s + d.pct; }, 0) || 100;
    var stops = [];
    var acc = 0;
    block.data.forEach(function (d, i) {
      var start = (acc / total) * 360;
      acc += d.pct;
      var end = (acc / total) * 360;
      var color = GOLD_TONES[i % GOLD_TONES.length];
      stops.push(color + ' ' + start.toFixed(2) + 'deg ' + end.toFixed(2) + 'deg');
    });
    var gradient = 'conic-gradient(' + stops.join(', ') + ')';
    var legend = block.data.map(function (d, i) {
      var color = GOLD_TONES[i % GOLD_TONES.length];
      return '<li><span class="pie-swatch" style="background:' + color + '"></span>' +
        inlineFormat(d.label) + ' — ' + d.pct + '%</li>';
    }).join('');
    return '' +
      '<div class="pie-wrap">' +
      '<div class="pie-chart" style="background:' + gradient + '">' +
        '<div class="pie-center"><div class="pie-center-value">' + inlineFormat(block.center_label) + '</div>' +
        '<div class="pie-center-label">' + inlineFormat(block.center_sub) + '</div></div>' +
      '</div>' +
      '<ul class="pie-legend">' + legend + '</ul>' +
      '</div>';
  }

  function renderEmissionTimeline(block) {
    return '<div class="emission-timeline">' + block.phases.map(function (p) {
      return '<div class="et-node"><div class="et-dot"></div><div class="et-label">' + inlineFormat(p.label) +
        '</div><div class="et-pct">' + inlineFormat(p.pct) + '</div></div>';
    }).join('') + '</div>';
  }

  function renderRoadmapTimeline(block) {
    return '<div class="roadmap-timeline">' + block.phases.map(function (p) {
      return '<div class="rt-phase">' +
        '<div class="rt-phase-num">' + inlineFormat(p.phase) + '</div>' +
        '<div class="rt-phase-dur">' + inlineFormat(p.duration) + '</div>' +
        '<div class="rt-phase-title">' + inlineFormat(p.title) + '</div>' +
        '<ul class="rt-phase-items">' + p.items.map(function (it) {
          return '<li>' + inlineFormat(it) + '</li>';
        }).join('') + '</ul>' +
        '</div>';
    }).join('') + '</div>';
  }

  function renderFlowChain(block) {
    var stepsHtml = block.steps.map(function (s, i) {
      var html = '<div class="fc-step">' + inlineFormat(s) + '</div>';
      if (i < block.steps.length - 1) html += '<div class="fc-arrow">&rarr;</div>';
      return html;
    }).join('');
    var reverse = block.reverse_label ? '<div class="fc-reverse">' + inlineFormat(block.reverse_label) + '</div>' : '';
    return '<div class="flow-chain">' + stepsHtml + '</div>' + reverse;
  }

  function renderEcosystemFlow() {
    return '' +
      '<div class="eco-flow">' +
      '<div class="eco-row"><div class="eco-node primary"><div class="eco-node-title">Dynastree 万承</div></div></div>' +
      '<div class="eco-connector">&darr;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&darr;</div>' +
      '<div class="eco-row">' +
        '<div class="eco-node"><div class="eco-node-title">Users</div><div class="eco-node-sub">Earn DYN</div></div>' +
        '<div class="eco-node"><div class="eco-node-title">Merchants</div><div class="eco-node-sub">Accept DYNUSD</div></div>' +
      '</div>' +
      '<div class="eco-connector">&darr;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&darr;</div>' +
      '<div class="eco-row">' +
        '<div class="eco-node"><div class="eco-node-title">Validators</div><div class="eco-node-sub">Stake DYN (Ph.4)</div></div>' +
        '<div class="eco-node"><div class="eco-node-title">Treasury</div><div class="eco-node-sub">Fees &amp; Growth</div></div>' +
      '</div>' +
      '<div class="eco-note">Two distinct economic loops: participation (Users → DYN → Validators) and commerce (Merchants → DYNUSD → Treasury)</div>' +
      '</div>';
  }

  function renderLoopCycle(block) {
    return '<div class="loop-cycle">' +
      block.steps.map(function (s) { return '<div class="loop-node">' + inlineFormat(s) + '</div>'; }).join('') +
      '<div class="loop-arrow-row">&rarr; &nbsp; &rarr; &nbsp; &rarr; &nbsp; &rarr; (cycles back to start)</div>' +
      '</div>';
  }

  function renderAssetStrip(block) {
    return '<div class="asset-strip">' + block.items.map(function (a, i) {
      var color = GOLD_TONES[i % GOLD_TONES.length];
      return '<div class="asset-seg" style="background:' + color + '22;border:1px solid ' + color + '">' + inlineFormat(a) + '</div>';
    }).join('') + '</div>';
  }

  function renderLadder(block) {
    return '<div class="ladder">' + block.levels.map(function (l) {
      return '<div class="ladder-step"><div class="ladder-step-name">' + inlineFormat(l.name) +
        '</div><div class="ladder-step-req">' + inlineFormat(l.requirement) + '</div></div>';
    }).join('') + '</div>';
  }

  function renderUserSees(block) {
    var rows = '<div class="us-row"><div class="us-head">USER SEES</div><div class="us-head behind">BEHIND THE SCENES</div></div>';
    rows += block.pairs.map(function (pair) {
      return '<div class="us-row"><div class="us-cell front">' + inlineFormat(pair[0]) +
        '</div><div class="us-cell behind">' + inlineFormat(pair[1]) + '</div></div>';
    }).join('');
    return '<div class="user-sees-table">' + rows + '</div>';
  }

  function renderDashboardMock(block) {
    var tiles = block.tiles.map(function (t) {
      return '<div class="dm-tile"><div class="dm-value">' + inlineFormat(t.value) +
        '</div><div class="dm-label">' + inlineFormat(t.label) + '</div></div>';
    }).join('');
    return '<div class="dashboard-mock">' + tiles + '</div>' +
      '<div class="dm-flag">MOCK-UP — illustrative concept only, not live data</div>';
  }

  function renderSection(section) {
    return '<section class="section" id="' + slugFor(section.number) + '" data-number="' + section.number + '">' +
      '<h2 class="section-heading">' + escapeHtml(section.title) + '</h2>' +
      section.blocks.map(renderBlock).join('') +
      '</section>';
  }

  function renderHero() {
    var m = state.data.meta;
    return '<div class="wp-hero">' +
      '<h1 class="wp-hero-title">' + escapeHtml(m.title) + '</h1>' +
      '<p class="wp-hero-subtitle">' + escapeHtml(m.subtitle) + '</p>' +
      '<p class="wp-hero-vision">' + inlineFormat(m.vision) + '</p>' +
      '</div>';
  }

  function renderContent() {
    var sections = state.data.sections;
    els.content.innerHTML = renderHero() + sections.map(renderSection).join('');
  }

  function renderSidebar() {
    var sections = state.data.sections;
    els.sidebarNav.innerHTML = sections.map(function (s) {
      return '<button class="nav-item" data-target="' + slugFor(s.number) + '">' + escapeHtml(s.title) + '</button>';
    }).join('');
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
        if (entry.isIntersecting) updateActiveNav(entry.target.id);
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

  function init() {
    els.content = $('content');
    els.sidebar = $('sidebar');
    els.sidebarNav = $('sidebarNav');
    els.sidebarBackdrop = $('sidebarBackdrop');
    els.navToggle = $('navToggle');

    fetch('data/whitepaper-content.json')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        state.data = data;
        renderSidebar();
        renderContent();
        setupScrollSpy();
        if (window.location.hash) {
          var id = window.location.hash.slice(1);
          setTimeout(function () { jumpTo(id); }, 60);
        }
      })
      .catch(function (err) {
        els.content.innerHTML = '<p class="body-text">Failed to load whitepaper content. ' + escapeHtml(String(err)) + '</p>';
      });

    els.navToggle.addEventListener('click', function () {
      if (els.sidebar.classList.contains('open')) closeSidebar(); else openSidebar();
    });
    els.sidebarBackdrop.addEventListener('click', closeSidebar);

    els.sidebarNav.addEventListener('click', function (e) {
      var btn = e.target.closest('.nav-item');
      if (btn) jumpTo(btn.getAttribute('data-target'));
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
