/* ============================================================
   LOADING SCREEN
   Force scroll to top so refresh always starts at hero
   ============================================================ */

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

(function () {
  const loader = document.getElementById('loader');
  const loaderBar = document.getElementById('loaderBar');
  const loaderPct = document.getElementById('loaderPct');
  const loaderTxt = document.getElementById('loaderText');

  const DURATION = 1400; // ms for bar to fill — whole loader stays under 3s
  const start = Date.now();

  function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  function tick() {
    const elapsed = Date.now() - start;
    const t = Math.min(elapsed / DURATION, 1);
    const pct = Math.floor(easeInOut(t) * 100);

    loaderBar.style.width = pct + '%';
    loaderPct.textContent = pct + '%';

    if (t < 1) {
      requestAnimationFrame(tick);
    } else {
      // Hit 100%
      loaderBar.style.width = '100%';
      loaderPct.textContent = '100%';

      setTimeout(() => {
        loaderTxt.textContent = 'WELCOME';
        loader.classList.add('welcome');
      }, 200);

      setTimeout(() => {
        loader.classList.add('fade-out');
      }, 700);

      setTimeout(() => {
        loader.style.display = 'none';
        document.body.classList.remove('loading');
        window.scrollTo({
          top: 0,
          behavior: 'instant'
        });
        initPostLoad();
      }, 1250);
    }
  }

  requestAnimationFrame(tick);
})();

/* ============================================================
   POST-LOAD INIT — everything after the loader finishes
   ============================================================ */
function initPostLoad() {
  initCursor();
  initNavbar();
  initMobileMenu();
  initSplitTitles();
  initReveal();
  initCounters();
  initTiltCards();
  initMagnetic();
  initSkillTabs();
  initParallax();
}

/* ============================================================
   MOBILE MENU (hamburger)
   ============================================================ */
function initMobileMenu() {
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('mobileMenu');
  const closeBtn = document.getElementById('mobileMenuClose');
  if (!toggle || !menu) return;

  function close() {
    toggle.classList.remove('open');
    menu.classList.remove('open');
    document.body.classList.remove('menu-open');
  }

  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('open');
    toggle.classList.toggle('open', isOpen);
    document.body.classList.toggle('menu-open', isOpen);
  });

  if (closeBtn) closeBtn.addEventListener('click', close);

  // Close when a link is tapped
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
}

/* ============================================================
   CUSTOM CURSOR
   ============================================================ */
function initCursor() {
  const cursor = document.getElementById('cursor');
  const ring = document.getElementById('cursorRing');

  // On touch devices, hide the custom cursor and bail out
  const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  if (isTouch) {
    if (cursor) cursor.style.display = 'none';
    if (ring) ring.style.display = 'none';
    return;
  }

  // Only transform is animated — never left/top
  document.addEventListener('mousemove', e => {
    const t = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
    cursor.style.transform = t;
    ring.style.transform = t;
  }, {
    passive: true
  });

  // The ember ring is the hover state; it is absent the rest of the time
  document.querySelectorAll('a, button, input, textarea, .skill-tab').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('is-active'));
    el.addEventListener('mouseleave', () => ring.classList.remove('is-active'));
  });
}

/* ============================================================
   NAVBAR SCROLL
   ============================================================ */
function initNavbar() {
  const nav = document.getElementById('navbar');
  if (!nav) return;

  const hero = document.getElementById('hero');

  function sync() {
    const scrolled = window.scrollY > 40;
    nav.classList.toggle('scrolled', scrolled);

    // Over the onyx hero the nav, logo and cursor all invert
    const overHero = hero ? window.scrollY < hero.offsetHeight - 80 : false;
    document.body.classList.toggle('at-hero', overHero);
  }

  sync();
  window.addEventListener('scroll', sync, {
    passive: true
  });
}

/* ============================================================
   SPLIT TEXT TITLES
   Wraps each char in a <span class="char"> for stagger animation
   ============================================================ */
function initSplitTitles() {
  document.querySelectorAll('.split-title').forEach(el => {
    const text = el.textContent;
    let html = '';
    let idx = 0;
    for (let i = 0; i < text.length; i++) {
      if (text[i] === ' ') {
        html += '<span class="char-space"> </span>';
      } else {
        html += `<span class="char" style="--i:${idx}">${text[i]}</span>`;
        idx++;
      }
    }
    el.innerHTML = html;
  });

  // Observe — toggle in-view every time (no unobserve = repeats)
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in-view');
      } else {
        e.target.classList.remove('in-view'); // reset so it replays next time
      }
    });
  }, {
    threshold: 0.2
  });

  document.querySelectorAll('.split-title').forEach(el => obs.observe(el));
}

/* ============================================================
   SCROLL REVEAL
   ============================================================ */
function initReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), e.target.dataset.delay || 0);
        obs.unobserve(e.target);
      }
    });
  }, {
    threshold: 0.1
  });

  document.querySelectorAll('.reveal').forEach((el, i) => {
    el.dataset.delay = (i % 4) * 80;
    obs.observe(el);
  });
}

/* ============================================================
   COUNTER ANIMATION (stats)
   ============================================================ */
function initCounters() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) animateCounter(e.target);
    });
  }, {
    threshold: 0.5
  });

  document.querySelectorAll('.counter').forEach(el => obs.observe(el));
}

function animateCounter(el) {
  const type = el.dataset.type || 'simple';

  if (type === 'simple') animateSimple(el);
  else if (type === 'year') animateYear(el);
  else if (type === 'internship') animateInternship(el);
}

/* ── Simple: single-digit scramble → count up ── */
function animateSimple(el) {
  const target = parseInt(el.dataset.target, 10);
  const suffix = el.dataset.suffix || '';
  const SCRAMBLE_DUR = 1750;
  const COUNT_DUR = 500;
  const startTime = Date.now();

  const scramble = setInterval(() => {
    if (Date.now() - startTime >= SCRAMBLE_DUR) {
      clearInterval(scramble);
      countUp();
      return;
    }
    // Single digit only (1–9)
    el.textContent = (Math.floor(Math.random() * 9) + 1) + suffix;
  }, 60);

  function countUp() {
    const cs = Date.now();

    function tick() {
      const t = Math.min((Date.now() - cs) / COUNT_DUR, 1);
      const val = Math.floor(easeOutQuart(t) * target);
      el.textContent = val + suffix;
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = target + suffix;
    }
    requestAnimationFrame(tick);
  }
}

/* ── Year: "202" fixed, last digit counts 3 → 6 ── */
function animateYear(el) {
  const digitEl = el.querySelector('.year-digit');
  if (!digitEl) return;

  const SCRAMBLE_DUR = 1750;
  const COUNT_DUR = 500;
  const startTime = Date.now();

  // Phase 1 — scramble single digit, in sync with other counters
  const scramble = setInterval(() => {
    if (Date.now() - startTime >= SCRAMBLE_DUR) {
      clearInterval(scramble);
      countUp();
      return;
    }
    digitEl.textContent = Math.floor(Math.random() * 9) + 1;
  }, 60);

  // Phase 2 — step 3 → 4 → 5 → 6 smoothly
  function countUp() {
    const steps = [3, 4, 5, 6];
    const stepMs = COUNT_DUR / (steps.length - 1);
    let step = 0;
    digitEl.textContent = steps[0];
    const iv = setInterval(() => {
      step++;
      if (step >= steps.length) {
        clearInterval(iv);
        digitEl.textContent = 6;
        return;
      }
      digitEl.textContent = steps[step];
    }, stepMs);
  }
}

/* ── Internship: number scrambles (single digit), MO stays red ── */
function animateInternship(el) {
  const numEl = el.querySelector('.internship-num');
  if (!numEl) return;

  const TARGET = 6;
  const SCRAMBLE_DUR = 1750;
  const COUNT_DUR = 500;
  const startTime = Date.now();

  const scramble = setInterval(() => {
    if (Date.now() - startTime >= SCRAMBLE_DUR) {
      clearInterval(scramble);
      countUp();
      return;
    }
    numEl.textContent = Math.floor(Math.random() * 9) + 1;
  }, 60);

  function countUp() {
    const cs = Date.now();

    function tick() {
      const t = Math.min((Date.now() - cs) / COUNT_DUR, 1);
      const val = Math.floor(easeOutQuart(t) * TARGET);
      numEl.textContent = val;
      if (t < 1) requestAnimationFrame(tick);
      else numEl.textContent = TARGET;
    }
    requestAnimationFrame(tick);
  }
}

function easeOutQuart(t) {
  return 1 - Math.pow(1 - t, 4);
}

/* ============================================================
   3D TILT ON PROJECT CARDS
   ============================================================ */
function initTiltCards() {
  document.querySelectorAll('.tilt-card').forEach(card => {
    const link = card.querySelector('.project-link');

    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const rotX = ((y - cy) / cy) * -8;
      const rotY = ((x - cx) / cx) * 8;
      card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.4s ease';
      card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateZ(0)';
      setTimeout(() => {
        card.style.transition = '';
      }, 400);
    });

    // Flatten card when hovering the link so clicks always land
    if (link) {
      link.addEventListener('mouseenter', () => {
        card.style.transition = 'transform 0.25s ease';
        card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateZ(8px)';
      });
      link.addEventListener('mouseleave', () => {
        card.style.transition = '';
      });
    }
  });
}

/* ============================================================
   MAGNETIC BUTTONS
   ============================================================ */
function initMagnetic() {
  document.querySelectorAll('.magnetic').forEach(el => {
    el.addEventListener('mousemove', e => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) * 0.35;
      const dy = (e.clientY - cy) * 0.35;
      el.style.transform = `translate(${dx}px, ${dy}px)`;
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = 'translate(0, 0)';
    });
  });
}

/* ============================================================
   SKILL TABS
   ============================================================ */
function initSkillTabs() {
  // Animate bars when skills section is visible
  const barObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        triggerBars(entry.target);
      }
    });
  }, {
    threshold: 0.2
  });

  document.querySelectorAll('.skill-panels').forEach(el => barObs.observe(el));

  function triggerBars(container) {
    container.querySelectorAll('.skill-panel.active .bar-fill').forEach(bar => {
      bar.style.width = bar.dataset.width + '%';
    });
  }

  document.querySelectorAll('.skill-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.skill-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.skill-panel').forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const panel = document.getElementById('tab-' + tab.dataset.tab);
      panel.classList.add('active');

      // Re-animate bars for new tab
      panel.querySelectorAll('.bar-fill').forEach(bar => {
        bar.style.width = '0%';
        setTimeout(() => {
          bar.style.width = bar.dataset.width + '%';
        }, 60);
      });
    });
  });
}

/* ============================================================
   HERO BG TEXT — TYPEWRITER + MOUSE PARALLAX
   ============================================================ */
function initParallax() {
  const bgText = document.getElementById('heroBgText');
  if (!bgText) return;

  // ── Typewriter ──────────────────────────────────────────
  const PHRASES = ['SOFTWARE ENGINEER', 'FULL-STACK DEVELOPER'];
  const TYPE_SPEED = 80; // ms per character typed
  const DELETE_SPEED = 38; // ms per character deleted
  const PAUSE_END = 2200; // pause after fully typed
  const PAUSE_EMPTY = 480; // pause before typing next phrase

  let phraseIdx = 0;
  let charIdx = 0;
  let deleting = false;

  bgText.textContent = '';

  function typeStep() {
    const phrase = PHRASES[phraseIdx];

    if (!deleting) {
      charIdx++;
      bgText.textContent = phrase.slice(0, charIdx);
      if (charIdx === phrase.length) {
        deleting = true;
        setTimeout(typeStep, PAUSE_END);
        return;
      }
    } else {
      charIdx--;
      bgText.textContent = phrase.slice(0, charIdx);
      if (charIdx === 0) {
        deleting = false;
        phraseIdx = (phraseIdx + 1) % PHRASES.length;
        setTimeout(typeStep, PAUSE_EMPTY);
        return;
      }
    }
    setTimeout(typeStep, deleting ? DELETE_SPEED : TYPE_SPEED);
  }

  typeStep();

  // ── Mouse parallax (skip on touch / small screens) ───────
  const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  if (!isTouch) {
    document.addEventListener('mousemove', e => {
      // Scale movement to viewport so text never overflows
      const intensity = Math.min(window.innerWidth / 1920, 1);
      const x = (e.clientX / window.innerWidth - 0.5) * 50 * intensity;
      const y = (e.clientY / window.innerHeight - 0.5) * 24 * intensity;
      bgText.style.transform = `translateY(calc(-50% + ${y}px)) translateX(${x}px)`;
    }, {
      passive: true
    });
  }
}

/* ============================================================
   CONTACT FORM
   ============================================================ */
function handleSend(btn) {
  btn.textContent = 'Sending...';
  btn.disabled = true;

  setTimeout(() => {
    btn.textContent = '✓ Message Sent!';
    btn.style.background = '#22c55e';

    setTimeout(() => {
      btn.textContent = 'Send Message';
      btn.style.background = '';
      btn.disabled = false;
    }, 3000);
  }, 1200);
}