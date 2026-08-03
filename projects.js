/* ============================================================
   PROJECTS PAGE
   Standalone from main.js — this page only needs smooth scroll,
   the cursor, the mobile menu, reveals and the category filter.
   ============================================================ */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── Smooth scroll ─────────────────────────────────────────── */
(function initSmoothScroll() {
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
})();

/* ── Custom cursor ─────────────────────────────────────────── */
(function initCursor() {
    const cursor = document.getElementById('cursor');
    const ring = document.getElementById('cursorRing');
    if (!cursor || !ring) return;

    if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) {
        cursor.style.display = 'none';
        ring.style.display = 'none';
        return;
    }

    document.addEventListener('mousemove', e => {
        const t = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
        cursor.style.transform = t;
        ring.style.transform = t;
    }, {
        passive: true
    });

    document.querySelectorAll('a, button').forEach(el => {
        el.addEventListener('mouseenter', () => ring.classList.add('is-active'));
        el.addEventListener('mouseleave', () => ring.classList.remove('is-active'));
    });
})();

/* ── Mobile menu ───────────────────────────────────────────── */
(function initMobileMenu() {
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
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
})();

/* ── Split titles ──────────────────────────────────────────── */
(function initSplitTitles() {
    const titles = document.querySelectorAll('.split-title');
    if (!titles.length) return;

    titles.forEach(el => {
        const words = el.textContent.trim().split(/\s+/);
        let html = '';
        let idx = 0;

        words.forEach((word, w) => {
            html += '<span class="word">';
            for (const ch of word) {
                html += `<span class="char" style="--i:${idx}">${ch}</span>`;
                idx++;
            }
            html += '</span>';
            // A plain space, not an inline-block, so a wrapped line has no indent
            if (w < words.length - 1) html += ' ';
        });

        el.innerHTML = html;
    });

    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => e.target.classList.toggle('in-view', e.isIntersecting));
    }, {
        threshold: 0.2
    });

    titles.forEach(el => obs.observe(el));
})();

/* ── Scroll reveal ─────────────────────────────────────────── */
(function initReveal() {
    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (!e.isIntersecting) return;
            setTimeout(() => e.target.classList.add('visible'), e.target.dataset.delay || 0);
            obs.unobserve(e.target);
        });
    }, {
        threshold: 0.08
    });

    document.querySelectorAll('.reveal').forEach((el, i) => {
        el.dataset.delay = (i % 3) * 80;
        obs.observe(el);
    });
})();

/* ── Category filter ───────────────────────────────────────── */
(function initFilter() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('#projectsGrid .project-card');
    const countEl = document.getElementById('visibleCount');
    if (!filterBtns.length || !cards.length) return;

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter;
            let count = 0;

            cards.forEach(card => {
                const show = filter === 'all' || (card.dataset.category || '').includes(filter);
                // Hidden cards leave the grid so the remaining ones reflow tightly
                card.hidden = !show;
                if (show) count++;
            });

            if (countEl) countEl.textContent = count;
        });
    });
})();
