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
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasGSAP = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';

function initPostLoad() {
  initSmoothScroll();
  initCursor();
  initNavbar();
  initMobileMenu();
  initSplitTitles();
  initReveal();
  initHero();
  initScrollMarquee();
  initCharReveal();
  initCounters();
  initStickyProjects();
  initTiltCards();
  initMagnetic();
  initSkillTabs();
}

/* ============================================================
   SMOOTH SCROLL (Lenis) + ScrollTrigger wiring
   ============================================================ */
function initSmoothScroll() {
  if (hasGSAP) gsap.registerPlugin(ScrollTrigger);

  // Reduced motion keeps native scrolling
  if (prefersReducedMotion || typeof Lenis === 'undefined') return;

  const lenis = new Lenis({
    lerp: 0.1,
    smoothWheel: true
  });
  window.lenis = lenis;

  function raf(t) {
    lenis.raf(t);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  if (hasGSAP) lenis.on('scroll', ScrollTrigger.update);
}

/* ============================================================
   HERO ENTRANCE — cinematic staggered build-up
   ============================================================ */
function initHero() {
  const hero = document.getElementById('hero');
  if (!hero || !hasGSAP || prefersReducedMotion) return;

  const meta = hero.querySelector('.hero-meta');
  const name = hero.querySelector('.hero-name');
  const sub = hero.querySelector('.hero-sub');
  const ctas = hero.querySelectorAll('.hero-cta > *');
  const scroll = hero.querySelector('.hero-scroll');

  // clearProps hands the element back to CSS once it lands, so the
  // magnetic transition is not left fighting a leftover inline transform
  const base = { ease: 'expo.out', clearProps: 'all' };

  if (meta) gsap.from(meta, { ...base, y: -20, opacity: 0, duration: 0.6 });
  if (name) gsap.from(name, { ...base, y: 60, opacity: 0, duration: 0.9, delay: 0.15 });
  if (sub) gsap.from(sub, { ...base, y: 20, opacity: 0, duration: 0.6, delay: 0.5 });
  if (ctas.length) {
    gsap.from(ctas, { ...base, y: 20, opacity: 0, duration: 0.5, delay: 0.7, stagger: 0.1 });
  }
  if (scroll) gsap.from(scroll, { ...base, opacity: 0, duration: 0.6, delay: 1 });
}

/* ============================================================
   SCROLL-LINKED MARQUEE
   Two typography rows drifting in opposite directions, driven by
   scroll position rather than a timed loop.
   ============================================================ */
function initScrollMarquee() {
  const rows = Array.from(document.querySelectorAll('.marquee-row'));
  if (!rows.length) return;

  const tracks = rows.map(row => {
    const track = row.querySelector('.marquee-track');
    if (!track) return null;

    // Triple the content so the row can wrap seamlessly in either direction
    const original = track.innerHTML;
    track.innerHTML = original + original + original;

    return {
      el: track,
      dir: row.classList.contains('marquee-row--left') ? -1 : 1,
      speed: parseFloat(row.dataset.speed) || 0.3,
      seg: 0
    };
  }).filter(Boolean);

  function measure() {
    tracks.forEach(t => {
      t.seg = t.el.scrollWidth / 3;
    });
    render();
  }

  function render() {
    const y = window.scrollY;
    tracks.forEach(t => {
      if (!t.seg) return;
      // Keep the middle repetition on screen at every scroll position
      let x = (t.dir * y * t.speed) % t.seg;
      if (x > 0) x -= t.seg;
      t.el.style.transform = `translate3d(${x}px, 0, 0)`;
    });
  }

  measure();
  window.addEventListener('resize', measure);

  if (prefersReducedMotion) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      render();
      ticking = false;
    });
  }, {
    passive: true
  });
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
    const words = el.textContent.trim().split(/\s+/);
    let html = '';
    let idx = 0;

    words.forEach((word, w) => {
      // Words are kept whole so a heading never breaks mid-word
      html += '<span class="word">';
      for (const ch of word) {
        html += `<span class="char" style="--i:${idx}">${ch}</span>`;
        idx++;
      }
      html += '</span>';
      if (w < words.length - 1) html += '<span class="char-space"> </span>';
    });

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
   CHARACTER REVEAL
   Lifts a paragraph from 20% to full opacity, one character at a
   time, scrubbed against its own scroll range.
   ============================================================ */
function initCharReveal() {
  const targets = document.querySelectorAll('.char-reveal');
  if (!targets.length) return;

  targets.forEach(el => {
    splitTextNodes(el);

    if (!hasGSAP || prefersReducedMotion) {
      // No scrub available — show the paragraph outright
      el.querySelectorAll('.char').forEach(c => (c.style.opacity = '1'));
      return;
    }

    gsap.to(el.querySelectorAll('.char'), {
      opacity: 1,
      stagger: 0.02,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top 80%',
        end: 'bottom 40%',
        scrub: true
      }
    });
  });
}

/* Wraps every character in a span while leaving the element tree
   (and therefore the <strong> emphasis) intact. */
function splitTextNodes(node) {
  Array.from(node.childNodes).forEach(child => {
    if (child.nodeType === Node.TEXT_NODE) {
      const text = child.textContent;
      if (!text.trim()) return;

      const frag = document.createDocumentFragment();
      for (const ch of text) {
        const span = document.createElement('span');
        span.className = ch === ' ' ? 'char char-space' : 'char';
        span.textContent = ch;
        frag.appendChild(span);
      }
      child.replaceWith(frag);
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      splitTextNodes(child);
    }
  });
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
   STICKY PROJECT STACK
   Each card pins under the nav and scales down as the next one
   slides over it, so the set reads as a physical stack.
   ============================================================ */
function initStickyProjects() {
  const cards = document.querySelectorAll('.sticky-stack .project-card');
  if (!cards.length || !hasGSAP || prefersReducedMotion) return;

  // Below 900px the cards flow normally, so there is nothing to scale
  if (window.matchMedia('(max-width: 900px)').matches) return;

  gsap.utils.toArray('.sticky-stack .project-card').forEach((card, i, all) => {
    const targetScale = 1 - (all.length - 1 - i) * 0.03;

    gsap.to(card, {
      scale: targetScale,
      ease: 'none',
      scrollTrigger: {
        trigger: card,
        start: 'top 96px',
        end: '+=100%',
        scrub: true
      }
    });
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
   CONTACT FORM
   ============================================================ */
function handleSend(btn) {
  btn.textContent = 'Sending...';
  btn.disabled = true;

  setTimeout(() => {
    // Confirmation reads through copy, not colour — the palette stays monochrome
    btn.textContent = '✓ Message Sent!';

    setTimeout(() => {
      btn.textContent = 'Send Message →';
      btn.disabled = false;
    }, 3000);
  }, 1200);
}