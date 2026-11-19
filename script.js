// Portfolio — interactions: theme toggle, typing hero, particles,
// animated counters, skill/cert filters, expandable cards & timeline,
// scroll progress, active nav, back-to-top, copy email, mobile nav, reveal.
(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Theme toggle (persisted, default = current light look) ---------- */
  var root = document.documentElement;
  var themeToggle = document.getElementById('themeToggle');
  try {
    var savedTheme = localStorage.getItem('hassan-theme');
    if (savedTheme === 'dark' || savedTheme === 'light') {
      root.setAttribute('data-theme', savedTheme);
    }
  } catch (e) { /* storage unavailable — stay on default */ }

  function syncThemeLabel() {
    if (!themeToggle) return;
    var dark = root.getAttribute('data-theme') === 'dark';
    themeToggle.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    themeToggle.setAttribute('title', dark ? 'Switch to light mode' : 'Switch to dark mode');
  }
  syncThemeLabel();

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('hassan-theme', next); } catch (e) { /* ignore */ }
      syncThemeLabel();
    });
  }

  /* ---------- Mobile nav ---------- */
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- Typing effect (hero) ---------- */
  var typedEl = document.getElementById('typedText');
  var phrases = ['Data Analyst', 'AI Engineering Student', 'Business Intelligence', 'Erasmus+ BIP Applicant'];
  if (typedEl) {
    if (reducedMotion) {
      typedEl.textContent = phrases[0];
    } else {
      var pi = 0, ci = phrases[0].length, deleting = true;
      (function tick() {
        var phrase = phrases[pi];
        if (deleting) {
          ci -= 1;
          typedEl.textContent = phrase.slice(0, ci);
          if (ci === 0) {
            deleting = false;
            pi = (pi + 1) % phrases.length;
            setTimeout(tick, 350);
            return;
          }
          setTimeout(tick, 35);
        } else {
          ci += 1;
          typedEl.textContent = phrases[pi].slice(0, ci);
          if (ci === phrases[pi].length) {
            deleting = true;
            setTimeout(tick, 1700);
            return;
          }
          setTimeout(tick, 70);
        }
      })();
    }
  }

  /* ---------- Hero particles (CSS/SVG-free canvas dots, no external images) ---------- */
  var canvas = document.getElementById('heroParticles');
  if (canvas && !reducedMotion && canvas.getContext) {
    var ctx = canvas.getContext('2d');
    var hero = canvas.closest('.hero');
    var particles = [];
    var W = 0, H = 0;

    function sizeCanvas() {
      var rect = hero.getBoundingClientRect();
      W = rect.width; H = rect.height;
      canvas.width = W; canvas.height = H;
    }
    function makeParticles() {
      particles = [];
      var count = Math.max(28, Math.min(60, Math.floor(W / 22)));
      for (var i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: 0.8 + Math.random() * 1.8,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          a: 0.15 + Math.random() * 0.35
        });
      }
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(45, 212, 191, ' + p.a + ')';
        ctx.fill();
      }
      requestAnimationFrame(draw);
    }
    sizeCanvas();
    makeParticles();
    draw();
    window.addEventListener('resize', function () { sizeCanvas(); makeParticles(); });
  }

  /* ---------- Animated stat counters ---------- */
  function animateCount(el) {
    var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
    var target;
    var startYear = el.getAttribute('data-start-year');
    if (startYear) {
      target = new Date().getFullYear() - parseInt(startYear, 10);
    } else {
      target = parseFloat(el.getAttribute('data-target') || '0');
    }
    if (reducedMotion) {
      el.textContent = target.toFixed(decimals);
      return;
    }
    var duration = 1400, start = null;
    function step(ts) {
      if (!start) start = ts;
      var t = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = (target * eased).toFixed(decimals);
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counters = document.querySelectorAll('.count');
  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          cio.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(animateCount);
  }

  /* ---------- Filters (skills + certifications) ---------- */
  function bindFilter(barSelector, btnAttr, itemAttr) {
    var bar = document.querySelector(barSelector);
    if (!bar) return;
    var buttons = bar.querySelectorAll('.filter-btn');
    var items = document.querySelectorAll('[' + itemAttr + ']');
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        buttons.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var f = btn.getAttribute(btnAttr);
        items.forEach(function (item) {
          var show = f === 'all' || item.getAttribute(itemAttr) === f;
          item.classList.toggle('is-hidden', !show);
        });
      });
    });
  }
  bindFilter('#skills .filter-bar', 'data-filter', 'data-cat');
  bindFilter('#certifications .filter-bar', 'data-cert-filter', 'data-cert-cat');

  /* ---------- Expandable certification cards ---------- */
  document.querySelectorAll('.cert-card').forEach(function (card) {
    var btn = card.querySelector('.cert-toggle');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var open = card.classList.toggle('expanded');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.textContent = open ? 'Hide details' : 'Show details';
    });
  });

  /* ---------- Expandable timeline (Education + Experience) ---------- */
  document.querySelectorAll('.tl-item').forEach(function (item) {
    var btn = item.querySelector('.tl-toggle');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var open = item.classList.toggle('expanded');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

  /* ---------- Scroll progress + back-to-top ---------- */
  var progress = document.getElementById('scrollProgress');
  var backBtn = document.getElementById('backToTop');
  function onScroll() {
    var st = window.scrollY || document.documentElement.scrollTop;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (progress && max > 0) {
      progress.style.width = (st / max * 100) + '%';
    }
    if (backBtn) {
      backBtn.classList.toggle('show', st > 600);
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (backBtn) {
    backBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
    });
  }

  /* ---------- Active-section nav highlighting ---------- */
  var navAnchors = document.querySelectorAll('.nav-link[href^="#"]');
  var sections = [];
  navAnchors.forEach(function (a) {
    var sec = document.querySelector(a.getAttribute('href'));
    if (sec) sections.push({ link: a, el: sec });
  });
  if ('IntersectionObserver' in window && sections.length) {
    var sio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          sections.forEach(function (s) {
            s.link.classList.toggle('active', s.el === entry.target);
          });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { sio.observe(s.el); });
  }

  /* ---------- Copy email ---------- */
  var copyBtn = document.getElementById('copyEmail');
  if (copyBtn) {
    copyBtn.setAttribute('aria-live', 'polite');
    copyBtn.addEventListener('click', function () {
      var email = copyBtn.getAttribute('data-email');
      var done = function () {
        copyBtn.textContent = 'Copied!';
        copyBtn.classList.add('copied');
        setTimeout(function () {
          copyBtn.textContent = 'Copy email';
          copyBtn.classList.remove('copied');
        }, 2000);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(done, function () { fallbackCopy(email, done); });
      } else {
        fallbackCopy(email, done);
      }
    });
  }
  function fallbackCopy(text, done) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) { /* ignore */ }
    document.body.removeChild(ta);
    done();
  }

  /* ---------- Data Lab ---------- */

  /* ---- Calculator: mean / variance / std dev (population, as in the
     freeCodeCamp Mean-Variance-Standard Deviation Calculator project) ---- */
  function computeStats(values) {
    var n = values.length;
    var sum = 0, min = values[0], max = values[0], i, v;
    for (i = 0; i < n; i++) {
      v = values[i];
      sum += v;
      if (v < min) min = v;
      if (v > max) max = v;
    }
    var mean = sum / n;
    var sq = 0;
    for (i = 0; i < n; i++) { sq += (values[i] - mean) * (values[i] - mean); }
    var variance = sq / n;
    return { count: n, mean: mean, variance: variance, std: Math.sqrt(variance), min: min, max: max };
  }
  function fmtNum(x) {
    var r = Math.round(x * 100) / 100;
    return (r === 0 ? 0 : r).toString();
  }

  var labInput = document.getElementById('labInput');
  var labMsg = document.getElementById('labMsg');
  var labBars = document.getElementById('labBars');
  var labOut = {
    count: document.getElementById('labCount'),
    mean: document.getElementById('labMean'),
    variance: document.getElementById('labVar'),
    std: document.getElementById('labStd'),
    min: document.getElementById('labMin'),
    max: document.getElementById('labMax')
  };

  function renderStats(values, ignored) {
    if (!values.length) {
      Object.keys(labOut).forEach(function (k) { labOut[k].textContent = '—'; });
      labBars.innerHTML = '';
      labMsg.textContent = 'Enter some numbers to see the results — for example: 1, 2, 3, 4, 5.';
      return;
    }
    var s = computeStats(values);
    labOut.count.textContent = String(s.count);
    labOut.mean.textContent = fmtNum(s.mean);
    labOut.variance.textContent = fmtNum(s.variance);
    labOut.std.textContent = fmtNum(s.std);
    labOut.min.textContent = fmtNum(s.min);
    labOut.max.textContent = fmtNum(s.max);
    labMsg.textContent = values.length + (values.length === 1 ? ' number' : ' numbers') + ' analysed.' +
      (ignored > 0 ? ' Ignored ' + ignored + ' non-number ' + (ignored === 1 ? 'entry' : 'entries') + '.' : '');
    /* Bars, scaled to the data range. */
    var range = s.max - s.min;
    var show = values.slice(0, 60);
    var html = '';
    show.forEach(function (v) {
      var h = range === 0 ? 50 : 6 + ((v - s.min) / range) * 94;
      html += '<div class="lab-bar" style="height:' + h.toFixed(1) + '%;" title="' + fmtNum(v) + '"' +
        (values.length <= 15 ? ' data-value="' + fmtNum(v) + '"' : '') + '></div>';
    });
    labBars.innerHTML = html;
    if (values.length > 60) {
      labMsg.textContent += ' Showing the first 60 bars.';
    }
  }

  function parseLabInput() {
    var raw = labInput.value.split(',');
    var values = [], ignored = 0;
    raw.forEach(function (part) {
      var t = part.trim();
      if (t === '') return;
      var n = parseFloat(t);
      if (isFinite(n)) values.push(n); else ignored++;
    });
    renderStats(values, ignored);
  }

  if (labInput) {
    labInput.addEventListener('input', parseLabInput);
    var labCalcBtn = document.getElementById('labCalcBtn');
    if (labCalcBtn) labCalcBtn.addEventListener('click', parseLabInput);
    var labSampleBtn = document.getElementById('labSampleBtn');
    if (labSampleBtn) labSampleBtn.addEventListener('click', function () {
      labInput.value = '1, 2, 3, 4, 5';
      parseLabInput();
      labInput.focus();
    });
    var labClearBtn = document.getElementById('labClearBtn');
    if (labClearBtn) labClearBtn.addEventListener('click', function () {
      labInput.value = '';
      parseLabInput();
      labInput.focus();
    });
  }

  /* ---- Certifications by year: interactive canvas chart ---- */
  var certYears = [
    { year: 2018, certs: ['Certified Mobile and Web App Developer — Saylani Mass I.T. Training Programme'] },
    { year: 2019, certs: ['The Fundamentals of Digital Marketing — Google'] },
    { year: 2022, certs: ['Introduction to Social Media Marketing — Coursera · Meta'] },
    { year: 2023, certs: ['Google Ads Search Certification — Google Digital Academy (Skillshop)', 'PPC Automation — Semrush', 'Digital Skills: Digital Marketing — FutureLearn'] },
    { year: 2025, certs: ['IELTS 6.5 — British Council'] },
    { year: 2026, certs: ['Data Analysis with Python Developer Certification — freeCodeCamp'] }
  ];
  var chartCanvas = document.getElementById('labChart');
  var chartTip = document.getElementById('labTooltip');
  var yearDetail = document.getElementById('labYearDetail');
  var chartSel = 3; /* 2023, the busiest year */
  var chartHover = -1;
  var chartBars = []; /* {x, y, w, h} in CSS pixels */

  function chartColors() {
    var dark = document.documentElement.getAttribute('data-theme') === 'dark';
    return {
      text: dark ? '#9fb4c9' : '#5b6b82',
      grid: dark ? 'rgba(255,255,255,0.08)' : 'rgba(11,31,58,0.08)',
      bar: '#0ea5a5',
      barHi: '#2dd4bf',
      barSel: '#0b7f7f'
    };
  }

  function drawChart() {
    if (!chartCanvas || !chartCanvas.getContext) return;
    var dpr = window.devicePixelRatio || 1;
    var cssW = chartCanvas.clientWidth || 640;
    var cssH = 300;
    chartCanvas.width = Math.round(cssW * dpr);
    chartCanvas.height = Math.round(cssH * dpr);
    var ctx = chartCanvas.getContext('2d');
    ctx.scale(dpr, dpr);
    var c = chartColors();
    var padL = 36, padR = 12, padT = 24, padB = 30;
    var plotW = cssW - padL - padR, plotH = cssH - padT - padB;
    var maxV = 3;
    ctx.clearRect(0, 0, cssW, cssH);
    /* Gridlines + y labels. */
    ctx.font = '12px Inter, system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    var g;
    for (g = 0; g <= maxV; g++) {
      var gy = padT + plotH - (g / maxV) * plotH;
      ctx.strokeStyle = c.grid;
      ctx.beginPath(); ctx.moveTo(padL, gy); ctx.lineTo(cssW - padR, gy); ctx.stroke();
      ctx.fillStyle = c.text;
      ctx.fillText(String(g), padL - 8, gy);
    }
    /* Bars. */
    var slot = plotW / certYears.length;
    var barW = Math.min(56, slot * 0.55);
    chartBars = [];
    certYears.forEach(function (d, i) {
      var x = padL + slot * i + (slot - barW) / 2;
      var h = (d.certs.length / maxV) * plotH;
      var y = padT + plotH - h;
      var fill = i === chartSel ? c.barSel : (i === chartHover ? c.barHi : c.bar);
      ctx.fillStyle = fill;
      var r = Math.min(6, barW / 2);
      ctx.beginPath();
      ctx.moveTo(x, y + h);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.lineTo(x + barW - r, y);
      ctx.quadraticCurveTo(x + barW, y, x + barW, y + r);
      ctx.lineTo(x + barW, y + h);
      ctx.closePath();
      ctx.fill();
      chartBars.push({ x: x, y: y, w: barW, h: h });
      /* Value label + year label. */
      ctx.fillStyle = c.text;
      ctx.textAlign = 'center';
      ctx.fillText(String(d.certs.length), x + barW / 2, y - 10);
      ctx.fillText(String(d.year), x + barW / 2, padT + plotH + 16);
    });
  }

  function showYear(i) {
    chartSel = i;
    var d = certYears[i];
    var html = '<p class="lab-year-title"><strong>' + d.year + '</strong> &middot; ' + d.certs.length +
      (d.certs.length === 1 ? ' certification' : ' certifications') + '</p><ul>';
    d.certs.forEach(function (name) { html += '<li>' + name + '</li>'; });
    html += '</ul>';
    yearDetail.innerHTML = html;
    drawChart();
  }

  function chartIndexAt(clientX) {
    var rect = chartCanvas.getBoundingClientRect();
    var x = clientX - rect.left;
    for (var i = 0; i < chartBars.length; i++) {
      var b = chartBars[i];
      if (x >= b.x - 6 && x <= b.x + b.w + 6) return i;
    }
    return -1;
  }

  if (chartCanvas) {
    chartCanvas.addEventListener('mousemove', function (e) {
      var i = chartIndexAt(e.clientX);
      if (i !== chartHover) { chartHover = i; drawChart(); }
      if (i >= 0) {
        var d = certYears[i];
        chartTip.textContent = d.year + ' — ' + d.certs.length +
          (d.certs.length === 1 ? ' certification' : ' certifications');
        var wrap = chartCanvas.parentElement.getBoundingClientRect();
        chartTip.style.left = (e.clientX - wrap.left + 12) + 'px';
        chartTip.style.top = (e.clientY - wrap.top - 30) + 'px';
        chartTip.classList.add('show');
        chartCanvas.style.cursor = 'pointer';
      } else {
        chartTip.classList.remove('show');
        chartCanvas.style.cursor = 'default';
      }
    });
    chartCanvas.addEventListener('mouseleave', function () {
      chartHover = -1; chartTip.classList.remove('show'); drawChart();
    });
    chartCanvas.addEventListener('click', function (e) {
      var i = chartIndexAt(e.clientX);
      if (i >= 0) showYear(i);
    });
    chartCanvas.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); showYear((chartSel + 1) % certYears.length); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); showYear((chartSel - 1 + certYears.length) % certYears.length); }
    });
    window.addEventListener('resize', drawChart);
    drawChart();
    /* Redraw when the theme changes so canvas text matches. */
    if (themeToggle) themeToggle.addEventListener('click', function () { setTimeout(drawChart, 0); });
  }

  /* ---- Live GitHub pulse (public API, graceful fallback) ---- */
  var pulseEl = document.getElementById('labPulse');
  if (pulseEl) {
    if (window.fetch) {
      pulseEl.innerHTML = '<p class="lab-msg">Loading live GitHub data&hellip;</p>';
      fetch('https://api.github.com/users/hassanbakhtiar')
        .then(function (resp) {
          if (!resp.ok) throw new Error('GitHub API responded ' + resp.status);
          return resp.json();
        })
        .then(function (d) {
          var since = '';
          if (d.created_at) { since = new Date(d.created_at).getFullYear(); }
          var stats = [
            { label: 'Public repos', value: d.public_repos },
            { label: 'Followers', value: d.followers },
            { label: 'Following', value: d.following },
            { label: 'On GitHub since', value: since }
          ];
          var html = '<div class="lab-pulse-grid">';
          stats.forEach(function (s) {
            html += '<div class="lab-stat"><span class="lab-stat-label">' + s.label +
              '</span><span class="lab-stat-value">' + s.value + '</span></div>';
          });
          html += '</div><p class="lab-pulse-note">Live data from GitHub, fetched just now.</p>';
          pulseEl.innerHTML = html;
        })
        .catch(function () {
          pulseEl.innerHTML = '<p class="lab-fallback">Live GitHub data is unavailable right now — GitHub&rsquo;s API could not be reached or the rate limit was hit. The profile is still at <a href="https://github.com/hassanbakhtiar" target="_blank" rel="noopener">github.com/hassanbakhtiar</a>.</p>';
        });
    } else {
      pulseEl.innerHTML = '<p class="lab-fallback">Live GitHub data needs a browser with fetch support. The profile is at <a href="https://github.com/hassanbakhtiar" target="_blank" rel="noopener">github.com/hassanbakhtiar</a>.</p>';
    }
  }

  /* ---------- Reveal on scroll ---------- */
  var items = document.querySelectorAll('.cert-card, .skill-card, .timeline li, .facts li, .lab-panel');
  items.forEach(function (el) { el.classList.add('reveal'); });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('visible'); });
  }
})();
