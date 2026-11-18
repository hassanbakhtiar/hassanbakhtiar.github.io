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

  /* ---------- Reveal on scroll ---------- */
  var items = document.querySelectorAll('.cert-card, .skill-card, .timeline li, .facts li');
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
