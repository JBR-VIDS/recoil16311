/* 16311 Recoil site: builds the page from content.js.
   You normally never need to edit this file. Edit content.js instead. */
(function () {
  'use strict';

  var app = document.getElementById('app');

  /* ---------- Friendly error box ---------- */
  function showProblem(message) {
    var box = document.createElement('div');
    box.className = 'problem';
    box.setAttribute('role', 'alert');
    box.innerHTML =
      '<strong>content.js has a problem.</strong> ' +
      'Most often a comma, quote mark, or bracket went missing in the last edit. ' +
      'Undo that edit and the site will come back.' +
      (message ? '<br><small>' + String(message).replace(/[<>&]/g, '') + '</small>' : '');
    document.body.prepend(box);
  }

  var S = window.SITE;
  if (!S) { showProblem('The content file did not load.'); return; }

  /* ---------- Small helpers ---------- */
  var EXTS = 'jpg,png,jpeg,webp';

  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function slug(s) {
    return String(s).toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }
  function nice(s) { return esc(String(s).replace(/(\d)-(\d)/g, '$1–$2')); }
  function list(a) { return Array.isArray(a) ? a : []; }
  var REDUCE = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  function gameOn() { return !!(S.game && S.game.enabled !== false); }

  var ICON_CAMERA =
    '<svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M3 8.5A1.5 1.5 0 0 1 4.5 7h2.2l1.2-2h8.2l1.2 2h2.2A1.5 1.5 0 0 1 21 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5z"/>' +
    '<circle cx="12" cy="13" r="3.6"/></svg>';
  var ICON_MEDAL =
    '<svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true" focusable="false">' +
    '<path d="M6 1.5h3l1 4.2-2.2 1zM14 1.5h-3l-1 4.2 2.2 1z" fill="currentColor" opacity=".55"/>' +
    '<circle cx="10" cy="12.2" r="5.6" fill="currentColor"/>' +
    '<path d="M10 9.2l.95 1.95 2.15.3-1.55 1.5.37 2.12L10 14.05 8.08 15.07l.37-2.12-1.55-1.5 2.15-.3z" fill="#fff" opacity=".85"/></svg>';
  var ICON_COIL =
    '<svg class="logo-svg" viewBox="0 0 32 32" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round">' +
    '<path d="M16 16.5c1.8 0 2.7 1.5 2.4 3.1-.5 2.6-3.4 3.9-6 3-3.4-1.2-4.6-5.2-3.2-8.5 1.8-4.2 6.8-5.8 10.9-4 4.8 2.1 6.9 7.6 5 12.4"/></svg>';

  /* ---------- Photo slots ----------
     slot("team/emily") looks for photos/team/emily.jpg (then .png, .jpeg, .webp).
     If nothing is found, a dashed "add photo" box shows instead. */
  function slot(name, o) {
    o = o || {};
    var base = 'photos/' + name;
    return '<figure class="slot ' + esc(o.cls || '') + '" data-photo style="--ratio:' + esc(o.ratio || '4 / 3') + '">' +
      '<div class="slot-empty" aria-hidden="true">' + ICON_CAMERA +
        '<span class="slot-title">' + esc(o.label || 'Photo') + '</span>' +
        '<span class="slot-file">' + esc(base) + '.jpg</span>' +
      '</div>' +
      '<img data-base="' + esc(base) + '"' + (o.exts ? ' data-exts="' + esc(o.exts) + '"' : '') +
        ' data-i="0" src="' + esc(base) + '.' + esc((o.exts || EXTS).split(',')[0]) + '" alt="' + esc(o.alt || o.label || '') + '" decoding="async">' +
      (o.caption ? '<figcaption class="slot-cap">' + esc(o.caption) + '</figcaption>' : '') +
    '</figure>';
  }

  /* ---------- Sections ---------- */
  function sectionHead(title, intro, extraClass) {
    return '<div class="section-head ' + (extraClass || '') + '"><h2 class="section-title">' + esc(title) + '</h2>' +
      (intro ? '<p class="section-intro">' + esc(intro) + '</p>' : '') + '</div>';
  }

  function renderHeader() {
    var t = S.team;
    var nav = [
      ['home', 'Home'], ['team', 'Our team'], ['robot', 'Our robot'],
      ['legacy', 'Our legacy'], ['stem', 'Expanding STEM']
    ];
    if (gameOn()) nav.push(['play', 'Play']);
    nav.push(['contact', 'Contact us']);
    return '<header class="site-header on-dark"><div class="container header-row">' +
      '<a class="brand" href="#home" aria-label="' + esc(t.number + ' ' + t.name + ', home') + '">' +
        '<span class="logo" data-photo>' + ICON_COIL +
          '<img data-base="photos/logo" data-exts="png,svg,jpg,webp" data-i="0" src="photos/logo.png" alt="" decoding="async"></span>' +
        '<span class="brand-text">' + esc(t.number) + ' ' + esc(t.name) + '</span>' +
      '</a>' +
      '<button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav"><span class="nav-toggle-bars" aria-hidden="true"></span><span class="sr-only">Menu</span></button>' +
      '<nav id="site-nav" class="site-nav" aria-label="Main"><ul class="nav-list">' +
        nav.map(function (n) { return '<li><a class="nav-link" href="#' + n[0] + '">' + esc(n[1]) + '</a></li>'; }).join('') +
      '</ul></nav>' +
    '</div></header>';
  }

  function renderHero() {
    var t = S.team;
    var letters = String(t.name).toUpperCase().split('').map(function (ch) {
      return '<span class="wm-letter" aria-hidden="true">' + esc(ch) + '</span>';
    }).join('');
    return '<section class="hero on-dark" id="top">' +
      '<div class="hero-top"><h1 class="wordmark" aria-label="' + esc(t.name) + '">' + letters + '</h1></div>' +
      '<div class="container hero-body">' +
        '<div class="hero-copy">' +
          '<p class="hero-team">FTC Team ' + esc(t.number) + '</p>' +
          '<p class="hero-tag">' + esc(S.hero.tagline) + '</p>' +
          '<div class="btn-row"><a class="btn btn-solid" href="#team">Meet the team</a><a class="btn btn-ghost" href="#contact">Contact us</a></div>' +
          (S.hero.hint ? '<p class="hero-hint">' + esc(S.hero.hint) + '</p>' : '') +
        '</div>' +
        slot('hero-team', { label: 'Team photo', alt: 'The ' + t.name + ' team', ratio: '4 / 3', cls: 'hero-photo' }) +
      '</div></section>';
  }

  function renderAbout() {
    var a = S.about, t = S.team;
    var roster = list(S.roster);
    var teams = {};
    roster.forEach(function (m) { teams[m.team] = true; });
    var stats = [
      { value: roster.length, label: 'team members' },
      { value: Object.keys(teams).length, label: 'subteams' },
      { value: list(S.seasons).length, label: 'seasons of competition results' }
    ].concat(list(a.extraStats));
    return '<section class="section about" id="about"><div class="container">' +
      '<div class="about-grid">' +
        '<div class="about-main"><h2 class="section-title">' + esc(a.title) + '</h2><p class="lead">' + esc(a.lead) + '</p></div>' +
        '<aside class="ftc-panel"><h3 class="panel-title">' + esc(a.ftcTitle) + '</h3><p>' + esc(a.ftcText) + '</p>' +
          '<div class="value"><p class="value-title">' + esc(a.valueTitle) + '</p><p>' + esc(a.valueText) + '</p></div>' +
          '<div class="btn-row">' +
            '<a class="btn btn-solid" href="' + esc(t.programUrl) + '" target="_blank" rel="noopener">Visit ViperBots</a>' +
            '<a class="btn btn-outline" href="' + esc(t.firstUrl) + '" target="_blank" rel="noopener">Visit FIRST</a>' +
          '</div></aside>' +
      '</div>' +
      '<ul class="facts">' + stats.map(function (s) {
        return '<li class="fact"><span class="fact-num">' + esc(s.value) + '</span><span class="fact-label">' + esc(s.label) + '</span></li>';
      }).join('') + '</ul>' +
    '</div></section>';
  }

  var TEAM_LABEL = { hardware: 'Hardware', software: 'Software', marketing: 'Marketing' };

  function renderTeam() {
    var s = S.teamSection, roster = list(S.roster);
    var counts = { all: roster.length };
    roster.forEach(function (m) { counts[m.team] = (counts[m.team] || 0) + 1; });
    var chips = ['all'].concat(Object.keys(TEAM_LABEL).filter(function (k) { return counts[k]; }));
    return '<section class="section team" id="team"><div class="container">' +
      sectionHead(s.title, s.intro) +
      slot('team-group', { label: 'Whole-team photo', alt: 'All of Team ' + S.team.number + ' together', ratio: '16 / 7', cls: 'team-group' }) +
      '<div class="mission on-dark"><h3 class="mission-title">' + esc(s.missionTitle) + '</h3><p class="mission-text">' + esc(s.mission) + '</p></div>' +
      '<div class="chips" role="group" aria-label="Filter team members">' + chips.map(function (k) {
        return '<button class="chip" type="button" data-filter="' + k + '" aria-pressed="' + (k === 'all') + '">' +
          (k === 'all' ? 'Everyone' : TEAM_LABEL[k]) + ' <span class="chip-count">' + counts[k] + '</span></button>';
      }).join('') + '</div>' +
      '<ul class="roster">' + roster.map(function (m) {
        var titles = list(m.titles);
        return '<li class="member" data-team="' + esc(m.team) + '">' +
          slot(m.photo || ('team/' + slug(m.name)), { label: m.name, alt: 'Photo of ' + m.name, ratio: '4 / 5', cls: 'member-photo' }) +
          '<div class="member-info"><h3 class="member-name">' + esc(m.name) + '</h3>' +
            titles.map(function (t, i) { return '<p class="member-role' + (i ? ' is-second' : '') + '">' + esc(t) + '</p>'; }).join('') +
          '</div></li>';
      }).join('') + '</ul>' +
    '</div></section>';
  }

  function renderRobot() {
    var r = S.robotSection, c = S.currentSeason || {}, seasons = list(S.seasons);
    return '<section class="section robot on-dark" id="robot"><div class="container">' +
      sectionHead(r.title, r.intro) +
      '<div class="robot-now">' +
        '<div class="robot-now-copy"><h3 class="now-name">' + esc(c.name) + '</h3><p class="now-years">' + esc(c.years) + ' season</p>' +
          (c.text ? '<p class="now-text">' + esc(c.text) + '</p>' : '') + '</div>' +
        '<div class="collage">' +
          slot('robot/current-1', { label: 'Robot photo', alt: 'Our ' + c.years + ' robot', ratio: '3 / 2', cls: 'collage-a' }) +
          slot('robot/current-2', { label: 'Robot detail', alt: 'Close-up of our ' + c.years + ' robot', ratio: '4 / 3', cls: 'collage-b' }) +
          slot('robot/current-3', { label: 'Build photo', alt: 'The team building the ' + c.years + ' robot', ratio: '4 / 3', cls: 'collage-c' }) +
        '</div>' +
      '</div>' +
      '<h3 class="rail-title">Earlier robots</h3>' +
      '<ul class="rail" tabindex="0" aria-label="Earlier robots. Scroll sideways to see more.">' + seasons.map(function (s) {
        return '<li class="rail-card">' +
          slot('robot/' + slug(s.game) + '-' + s.years, { label: s.game, alt: 'Our ' + s.years + ' robot for ' + s.game, ratio: '4 / 3' }) +
          '<h4 class="rail-game">' + esc(s.game) + '</h4><p class="rail-years">' + esc(s.years) + '</p></li>';
      }).join('') + '</ul>' +
    '</div></section>';
  }

  function renderGallery() {
    var g = S.gallery || {}, n = Math.max(0, g.count | 0);
    if (!n) return '';
    var caps = list(g.captions), items = '';
    for (var i = 1; i <= n; i++) {
      items += slot('gallery/' + i, { label: 'Photo ' + i, alt: caps[i - 1] || ('Team photo ' + i), ratio: '4 / 3', caption: caps[i - 1] || '', cls: 'gallery-item' });
    }
    return '<section class="section gallery" id="gallery" data-needs-photos><div class="container">' +
      sectionHead(g.title, g.intro) + '<div class="mosaic">' + items + '</div></div></section>';
  }

  function medal(str, k) {
    var i = str.lastIndexOf(', ');
    var name = i > -1 ? str.slice(0, i) : str;
    var place = i > -1 ? str.slice(i + 2) : '';
    var tone = /1st|winner/i.test(place) ? 'gold' : /2nd/i.test(place) ? 'silver' : /3rd/i.test(place) ? 'bronze' : 'plain';
    return '<li class="medal medal-' + tone + '" style="--k:' + (k | 0) + '">' + ICON_MEDAL + '<span class="medal-name">' + esc(name) + '</span>' +
      (place ? '<span class="medal-place">' + esc(place) + '</span>' : '') + '</li>';
  }

  function renderLegacy() {
    var l = S.legacySection, seasons = list(S.seasons);
    return '<section class="section legacy" id="legacy"><div class="container legacy-grid">' +
      '<div class="legacy-side">' + sectionHead(l.title, l.intro) +
        slot('legacy-awards', { label: 'Trophies photo', alt: 'Team 16311 with its awards', ratio: '4 / 5', cls: 'legacy-photo' }) + '</div>' +
      '<ol class="timeline">' + seasons.map(function (s, idx) {
        var events = list(s.events);
        return '<li class="tl-item"><details class="season"' + (idx < 3 ? ' open' : '') + '>' +
          '<summary class="season-sum"><span class="season-years">' + esc(s.years) + '</span><span class="season-game">' + esc(s.game) + '</span></summary>' +
          '<div class="events">' + events.map(function (ev, ei) {
            var awards = list(ev.awards), notes = list(ev.notes);
            return '<article class="event" style="--e:' + ei + '"><h3 class="event-name">' + esc(ev.name) + '</h3>' +
              (awards.length ? '<ul class="medals">' + awards.map(function (a, k) { return medal(a, k); }).join('') + '</ul>' : '') +
              (notes.length ? '<ul class="notes">' + notes.map(function (n) { return '<li>' + nice(n) + '</li>'; }).join('') + '</ul>' : '') +
            '</article>';
          }).join('') + '</div></details></li>';
      }).join('') + '</ol>' +
    '</div></section>';
  }

  function renderStem() {
    var s = S.stemSection;
    return '<section class="section stem" id="stem"><div class="container">' +
      sectionHead(s.title, s.intro) +
      '<ul class="stem-grid">' + list(S.outreach).map(function (o) {
        return '<li class="stem-card' + (o.featured ? ' is-featured' : '') + '">' +
          slot('outreach/' + (o.id || slug(o.title)), { label: o.title, alt: o.title, ratio: o.featured ? '5 / 4' : '3 / 2' }) +
          '<div class="stem-body"><h3 class="stem-title">' + esc(o.title) + '</h3>' +
            (o.stat ? '<p class="stem-stat"><span class="stem-num">' + esc(o.stat.value) + '</span><span class="stem-label">' + esc(o.stat.label) + '</span></p>' : '') +
            '<p>' + esc(o.text) + '</p></div></li>';
      }).join('') + '</ul>' +
    '</div></section>';
  }

  function renderEvents() {
    var ev = list(S.events), s = S.eventsSection || {};
    if (!ev.length) return '';
    return '<section class="section events-sec" id="events"><div class="container">' +
      sectionHead(s.title, s.intro) +
      '<ul class="event-list">' + ev.map(function (e) {
        return '<li class="event-row"><p class="event-date">' + esc(e.date) + '</p><div><h3 class="event-title">' + esc(e.name) + '</h3>' +
          (e.place ? '<p class="event-place">' + esc(e.place) + '</p>' : '') + (e.note ? '<p>' + esc(e.note) + '</p>' : '') + '</div></li>';
      }).join('') + '</ul></div></section>';
  }

  function renderSponsors() {
    var sp = list(S.sponsors), s = S.sponsorsSection || {};
    var show = S.settings && S.settings.showEmptyPhotoSlots;
    var body = '';
    if (sp.length) {
      body = sp.map(function (x) {
        var inner = slot('sponsors/' + (x.id || slug(x.name)), { label: x.name, alt: x.name + ' logo', ratio: '3 / 2', cls: 'slot-logo', exts: 'png,svg,jpg,jpeg,webp' }) +
          '<span class="sponsor-name">' + esc(x.name) + '</span>';
        return '<li class="sponsor">' + (x.url ? '<a href="' + esc(x.url) + '" target="_blank" rel="noopener">' + inner + '</a>' : inner) + '</li>';
      }).join('');
    } else if (show && s.emptyPreviewCount) {
      for (var i = 1; i <= s.emptyPreviewCount; i++) {
        body += '<li class="sponsor">' + slot('sponsors/sponsor-' + i, { label: 'Sponsor logo', alt: '', ratio: '3 / 2', cls: 'slot-logo', exts: 'png,svg,jpg,jpeg,webp' }) + '</li>';
      }
    } else { return ''; }
    return '<section class="section sponsors" id="sponsors"><div class="container">' +
      sectionHead(s.title, s.intro) + '<ul class="sponsor-grid">' + body + '</ul></div></section>';
  }

  function renderGame() {
    if (!gameOn()) return '';
    var g = S.game;
    var help = g.help || 'Drag back from the robot and let go. On a keyboard, use the up and down arrows to aim, left and right to set power, and space to launch.';
    function hud(label, key, v) {
      return '<p class="hud-item"><span class="hud-label">' + label + '</span><b class="hud-num" data-g="' + key + '">' + v + '</b></p>';
    }
    return '<section class="section game" id="play"><div class="container">' +
      sectionHead(g.title, g.intro) +
      '<div class="game-wrap">' +
        '<div class="game-hud">' + hud('Score', 'score', 0) + hud('Launches left', 'left', Math.max(1, parseInt(g.launches, 10) || 10)) + hud('Best', 'best', 0) + '</div>' +
        '<div class="game-stage on-dark">' +
          '<canvas id="game-canvas" class="game-canvas" tabindex="0" aria-label="Viper Recoil game. Drag back from the robot and release to fire a coiled viper into the basket. Keyboard: up and down arrows aim, left and right arrows set power, space launches."></canvas>' +
          '<div class="game-overlay"><h3 class="ov-title" data-g="title">Viper Recoil</h3>' +
            '<p class="ov-text" data-g="text">Pull the spring back, let go, and drop the viper in the basket. Snake springs on the floor bounce it back up. Clean strikes and streaks score extra.</p>' +
            '<button class="btn btn-solid" type="button" data-g="start">Start game</button></div>' +
        '</div>' +
        '<p class="game-help">' + esc(help) + '</p>' +
        '<p class="sr-only" role="status" aria-live="polite" data-g="live"></p>' +
      '</div></div></section>';
  }

  function renderContact() {
    var c = S.contactSection, t = S.team;
    var map = 'https://www.google.com/maps?q=' + encodeURIComponent(t.mapQuery) + '&output=embed';
    return '<section class="section contact on-dark" id="contact"><div class="container contact-grid">' +
      '<div class="contact-main"><h2 class="section-title">' + esc(c.title) + '</h2><p class="section-intro">' + esc(c.intro) + '</p>' +
        '<a class="contact-email" href="mailto:' + esc(t.email) + '">' + esc(t.email) + '</a>' +
        '<div class="btn-row">' +
          (t.instagram ? '<a class="btn btn-solid" href="' + esc(t.instagram) + '" target="_blank" rel="noopener">Instagram</a>' : '') +
          (t.linkedin ? '<a class="btn btn-ghost" href="' + esc(t.linkedin) + '" target="_blank" rel="noopener">LinkedIn</a>' : '') +
        '</div></div>' +
      '<div class="map-card"><iframe title="' + esc(c.mapTitle) + '" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="' + esc(map) + '"></iframe>' +
        '<p class="map-cap">' + esc(c.mapTitle) + '</p></div>' +
    '</div></section>';
  }

  function renderFooter() {
    var t = S.team;
    return '<footer class="site-footer on-dark"><div class="container footer-row">' +
      '<p>' + esc(t.number) + ' ' + esc(t.name) + ' is part of the <a href="' + esc(t.programUrl) + '" target="_blank" rel="noopener">' + esc(t.program) + '</a> at ' + esc(t.school) + ', ' + esc(t.place) + '.</p>' +
      '<p><a href="#home" data-top>Back to top</a></p></div></footer>';
  }

  /* ---------- Page assembly: the site is a set of tabs; only one page shows at a time ---------- */
  var PAGE_TITLES = { home: '', team: 'Our team', robot: 'Our robot', legacy: 'Our legacy', stem: 'Expanding STEM', play: 'Play', contact: 'Contact us' };
  function page(name, html) { return '<div class="page" id="page-' + name + '" data-page="' + name + '" hidden>' + html + '</div>'; }

  function render() {
    if (S.settings && S.settings.showEmptyPhotoSlots === false) document.body.classList.add('hide-empty');
    app.innerHTML =
      '<a class="skip" href="#main">Skip to content</a>' +
      '<div class="progress" aria-hidden="true"></div>' +
      renderHeader() +
      '<main id="main" tabindex="-1">' +
        page('home', renderHero() + renderAbout() + renderSponsors()) +
        page('team', renderTeam() + renderGallery()) +
        page('robot', renderRobot()) +
        page('legacy', renderLegacy()) +
        page('stem', renderStem() + renderEvents()) +
        page('play', renderGame()) +
        page('contact', renderContact()) +
      '</main>' + renderFooter();
  }

  /* ---------- Photo loading: try several file types, then give up ---------- */
  var pending = 0;
  function settle() {
    pending--;
    if (pending > 0) return;
    // When empty slots are hidden, also hide sections that are all photos and have none.
    if (document.body.classList.contains('hide-empty')) {
      document.querySelectorAll('[data-needs-photos]').forEach(function (sec) {
        if (!sec.querySelector('.has-photo')) sec.hidden = true;
      });
    }
  }
  document.addEventListener('error', function (e) {
    var img = e.target;
    if (!(img instanceof HTMLImageElement) || !img.dataset.base) return;
    var exts = (img.dataset.exts || EXTS).split(',');
    var i = parseInt(img.dataset.i, 10) + 1;
    if (i < exts.length) { img.dataset.i = i; img.src = img.dataset.base + '.' + exts[i]; }
    else { img.remove(); settle(); }
  }, true);
  document.addEventListener('load', function (e) {
    var img = e.target;
    if (!(img instanceof HTMLImageElement) || !img.dataset.base) return;
    var box = img.closest('[data-photo]');
    if (box) box.classList.add('has-photo');
    settle();
  }, true);

  /* ---------- Team filter ---------- */
  function initFilter() {
    var group = document.querySelector('.chips');
    if (!group) return;
    group.addEventListener('click', function (e) {
      var btn = e.target.closest('.chip');
      if (!btn) return;
      var key = btn.dataset.filter;
      group.querySelectorAll('.chip').forEach(function (c) { c.setAttribute('aria-pressed', String(c === btn)); });
      document.querySelectorAll('.member').forEach(function (m) { m.hidden = !(key === 'all' || m.dataset.team === key); });
    });
  }

  /* ---------- Mobile menu + current-section highlight ---------- */
  function initNav() {
    var toggle = document.querySelector('.nav-toggle'), nav = document.getElementById('site-nav');
    if (toggle && nav) {
      toggle.addEventListener('click', function () {
        var open = toggle.getAttribute('aria-expanded') !== 'true';
        toggle.setAttribute('aria-expanded', String(open));
        nav.classList.toggle('is-open', open);
      });
      nav.addEventListener('click', function (e) {
        if (e.target.closest('a')) { toggle.setAttribute('aria-expanded', 'false'); nav.classList.remove('is-open'); }
      });
    }
  }

  /* ---------- Tabs: show one page at a time, driven by the address (#team, #robot, ...) ---------- */
  function initPages() {
    var pages = {};
    document.querySelectorAll('.page').forEach(function (p) { if (p.textContent.trim()) pages[p.dataset.page] = p; });
    var siteName = S.team.number + ' ' + S.team.name;
    var baseTitle = document.title;
    // Each page gets one main heading: the first section title becomes the h1.
    Object.keys(pages).forEach(function (k) {
      if (k === 'home') return;
      var h = pages[k].querySelector('h2.section-title');
      if (!h) return;
      var h1 = document.createElement('h1');
      h1.className = h.className; h1.innerHTML = h.innerHTML;
      h.replaceWith(h1);
      // Keep headings in order under the new h1 (h3 reads as a level-2 heading, h4 as level 3).
      var sec = h1.closest('section');
      if (sec) {
        sec.querySelectorAll('h3').forEach(function (x) { x.setAttribute('aria-level', '2'); });
        sec.querySelectorAll('h4').forEach(function (x) { x.setAttribute('aria-level', '3'); });
      }
    });
    var current = '';
    function show(name, anchorEl) {
      if (!pages[name]) name = 'home';
      if (name !== current) {
        Object.keys(pages).forEach(function (k) { pages[k].hidden = k !== name; });
        document.querySelectorAll('.nav-link').forEach(function (a) {
          if (a.getAttribute('href') === '#' + name) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
        });
        document.title = name === 'home' ? baseTitle : (PAGE_TITLES[name] || name) + ' | ' + siteName;
        current = name;
        window.dispatchEvent(new Event('resize'));   // lets the wordmark and game measure themselves now they are visible
      }
      if (anchorEl) anchorEl.scrollIntoView(); else window.scrollTo(0, 0);
    }
    function route() {
      var h = decodeURIComponent(location.hash.replace(/^#\/?/, ''));
      if (!h || pages[h]) { show(h || 'home'); return; }
      var el = document.getElementById(h), pg = el && el.closest('.page');   // old section links still work
      if (pg) show(pg.dataset.page, el); else show('home');
    }
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[data-top]');
      if (a) { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
    });
    window.addEventListener('hashchange', function () {
      route();
      var m = document.getElementById('main'); if (m) m.focus({ preventScroll: true });
    });
    route();
  }

  /* ---------- Fit the big RECOIL wordmark to its box, whatever font the browser ends up using ---------- */
  function initWordmarkFit() {
    var wrap = document.querySelector('.wordmark');
    if (!wrap) return;
    var pending = 0;
    function fit() {
      pending = 0;
      wrap.style.removeProperty('--wm');
      var avail = wrap.clientWidth, total = 0;
      Array.prototype.forEach.call(wrap.children, function (c) { total += c.offsetWidth; });
      var max = avail * 0.9;                       // leave room so the letters never touch
      if (total > max && total > 0) {
        var size = parseFloat(getComputedStyle(wrap).fontSize) * (max / total);
        wrap.style.setProperty('--wm', size.toFixed(1) + 'px');
      }
    }
    function queue() { if (!pending) pending = requestAnimationFrame(fit); }
    fit();
    window.addEventListener('resize', queue);
    if (document.fonts) {
      if (document.fonts.ready) document.fonts.ready.then(queue);
      if (document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', queue);
    }
    window.addEventListener('load', queue);
  }

  /* ---------- The spring: pull a letter of the wordmark ---------- */
  function initWordmark() {
    var wrap = document.querySelector('.wordmark');
    if (!wrap) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      var hint = document.querySelector('.hero-hint');
      if (hint) hint.remove();
      return;
    }
    var els = Array.prototype.slice.call(wrap.querySelectorAll('.wm-letter'));
    var K = 170, C = 9;                 // spring stiffness and damping (low damping = bouncy)
    var st = els.map(function (el, i) {
      return { x: -Math.min(Math.max(window.innerWidth, 500), 900) * 0.75, y: 0, vx: 0, vy: 0, delay: 200 + i * 110, started: false, entry: true };
    });
    els.forEach(function (el) { el.style.opacity = '0'; el.classList.add('is-live'); });
    var drag = null, raf = 0, last = 0, t0 = 0;

    function maxD() { return Math.min(240, wrap.getBoundingClientRect().width * 0.28); }
    function rubber(d, m) { return (d < 0 ? -1 : 1) * m * (1 - Math.exp(-Math.abs(d) / m)); }

    function step(now) {
      if (!t0) t0 = now;
      if (!last) last = now;
      var dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      var active = false, m = maxD();
      for (var i = 0; i < els.length; i++) {
        var s = st[i];
        if (!s.started) {
          if (now - t0 >= s.delay) { s.started = true; els[i].style.opacity = ''; }
          else { active = true; continue; }
        }
        var tx = 0, ty = 0, k = K, c = C;
        if (s.entry) { k = 150; c = 17; if (Math.abs(s.x) < 2 && !drag) s.entry = false; }
        if (drag) {
          var f = Math.pow(0.5, Math.abs(i - drag.i));
          tx = rubber(drag.dx, m) * f;
          ty = rubber(drag.dy, m * 0.5) * f;
          if (i === drag.i) { k = 900; c = 55; }
        }
        s.vx += (-k * (s.x - tx) - c * s.vx) * dt;
        s.vy += (-k * (s.y - ty) - c * s.vy) * dt;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        if (!drag && Math.abs(s.x) < 0.2 && Math.abs(s.y) < 0.2 && Math.abs(s.vx) < 0.3 && Math.abs(s.vy) < 0.3) {
          s.x = s.y = s.vx = s.vy = 0;
          els[i].style.transform = '';
        } else {
          active = true;
          var rot = Math.max(-26, Math.min(26, s.x * 0.07));
          els[i].style.transform = 'translate3d(' + s.x.toFixed(1) + 'px,' + s.y.toFixed(1) + 'px,0) rotate(' + rot.toFixed(2) + 'deg)';
        }
      }
      if (active || drag) raf = requestAnimationFrame(step); else { raf = 0; last = 0; }
    }
    function kick() { if (!raf) { last = 0; raf = requestAnimationFrame(step); } }

    els.forEach(function (el, i) {
      el.addEventListener('pointerdown', function (e) {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        drag = { i: i, px: e.clientX, py: e.clientY, dx: 0, dy: 0, id: e.pointerId };
        st[i].entry = false;
        el.setPointerCapture(e.pointerId);
        el.classList.add('is-held');
        kick();
        e.preventDefault();
      });
      el.addEventListener('pointermove', function (e) {
        if (!drag || drag.id !== e.pointerId) return;
        drag.dx = e.clientX - drag.px;
        drag.dy = e.clientY - drag.py;
      });
      function release(e) {
        if (!drag || drag.id !== e.pointerId) return;
        drag = null;
        el.classList.remove('is-held');
        kick();
      }
      el.addEventListener('pointerup', release);
      el.addEventListener('pointercancel', release);
      el.addEventListener('lostpointercapture', release);
    });
    kick();
  }


  /* ---------- Motion: scroll reveals, count-up numbers, header shadow ---------- */
  var REVEAL = [
    '.section-head', '.lead', '.ftc-panel', '.fact', '.team-group', '.mission', '.chips', '.member',
    '.robot-now-copy', '.collage .slot', '.rail-title', '.rail-card', '.mosaic .slot', '.legacy-photo',
    '.tl-item', '.stem-card', '.event-row', '.sponsor', '.game-hud', '.game-stage', '.game-help',
    '.contact-main', '.map-card'
  ].join(',');

  function initReveal() {
    if (REDUCE || !('IntersectionObserver' in window)) return;
    document.documentElement.classList.add('js-anim');
    var els = document.querySelectorAll(REVEAL);
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        io.unobserve(en.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    Array.prototype.forEach.call(els, function (el) {
      var idx = Array.prototype.indexOf.call(el.parentElement.children, el);
      el.style.setProperty('--d', Math.min(idx, 8) * 70 + 'ms');
      el.classList.add('reveal');
      io.observe(el);
    });
    // Printing or "save as PDF" should never show hidden content.
    window.addEventListener('beforeprint', function () {
      Array.prototype.forEach.call(document.querySelectorAll('.reveal'), function (el) { el.classList.add('is-in'); });
    });
  }

  function initCountUp() {
    if (REDUCE || !('IntersectionObserver' in window)) return;
    var nodes = document.querySelectorAll('.fact-num, .stem-num');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        run(en.target);
      });
    }, { threshold: 0.6 });
    function run(n) {
      var target = parseInt(n.dataset.n, 10), suffix = n.dataset.suffix || '', t0 = 0;
      function tick(now) {
        if (!t0) t0 = now;
        var p = Math.min(1, (now - t0) / 1100), c1 = 1.3, c3 = c1 + 1;
        var e = 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2);   // overshoots, then settles
        n.textContent = Math.round(target * e) + suffix;
        if (p < 1) requestAnimationFrame(tick); else n.textContent = target + suffix;
      }
      requestAnimationFrame(tick);
    }
    Array.prototype.forEach.call(nodes, function (n) {
      var m = /^(\d+)(.*)$/.exec(n.textContent.trim());
      if (!m) return;
      n.setAttribute('aria-label', n.textContent.trim());
      n.dataset.n = m[1]; n.dataset.suffix = m[2];
      n.textContent = '0' + m[2];
      io.observe(n);
    });
  }

  function initScrollState() {
    var header = document.querySelector('.site-header');
    if (!header) return;
    function onScroll() { header.classList.toggle('is-scrolled', window.scrollY > 8); }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Search engines and link previews ---------- */
  function addStructuredData() {
    var t = S.team;
    var data = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: t.number + ' ' + t.name,
      alternateName: 'FTC Team ' + t.number,
      description: S.hero && S.hero.tagline,
      email: t.email,
      parentOrganization: { '@type': 'Organization', name: t.program, url: t.programUrl },
      location: { '@type': 'Place', name: t.school, address: t.place },
      sameAs: [t.instagram, t.linkedin].filter(Boolean)
    };
    var tag = document.createElement('script');
    tag.type = 'application/ld+json';
    tag.textContent = JSON.stringify(data);
    document.head.appendChild(tag);
  }

  /* ---------- Go ---------- */
  try {
    render();
    pending = document.querySelectorAll('img[data-base]').length;
    initNav();
    initPages();
    initFilter();
    initWordmarkFit();
    initWordmark();
    initReveal();
    initCountUp();
    initScrollState();
    addStructuredData();
  } catch (err) {
    showProblem(err && err.message);
    if (window.console) console.error(err);
  }
})();
