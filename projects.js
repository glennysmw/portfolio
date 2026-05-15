// Cursor
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursorRing');
document.addEventListener('mousemove', e => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
    ring.style.left = e.clientX + 'px';
    ring.style.top = e.clientY + 'px';
});
document.querySelectorAll('a, button, .project-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
        cursor.style.width = '20px';
        cursor.style.height = '20px';
        ring.style.width = '52px';
        ring.style.height = '52px';
    });
    el.addEventListener('mouseleave', () => {
        cursor.style.width = '12px';
        cursor.style.height = '12px';
        ring.style.width = '36px';
        ring.style.height = '36px';
    });
});

// Navbar
window.addEventListener('scroll', () => {
    document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 40);
}, {
    passive: true
});

// Reveal
const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.classList.add('visible');
            obs.unobserve(e.target);
        }
    });
}, {
    threshold: 0.08
});
document.querySelectorAll('.reveal').forEach((el, i) => {
    el.dataset.delay = (i % 3) * 80;
    obs.observe(el);
});

// Tilt cards
document.querySelectorAll('.tilt-card').forEach(card => {
    const link = card.querySelector('.project-link');
    card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const rotX = ((e.clientY - r.top - r.height / 2) / (r.height / 2)) * -8;
        const rotY = ((e.clientX - r.left - r.width / 2) / (r.width / 2)) * 8;
        card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(4px)`;
    });
    card.addEventListener('mouseleave', () => {
        card.style.transition = 'transform 0.4s ease';
        card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateZ(0)';
        setTimeout(() => card.style.transition = '', 400);
    });
    if (link) {
        link.addEventListener('mouseenter', () => {
            card.style.transition = 'transform 0.25s ease';
            card.style.transform = 'perspective(800px) translateZ(8px)';
        });
        link.addEventListener('mouseleave', () => {
            card.style.transition = '';
        });
    }
});

// Filter
const filterBtns = document.querySelectorAll('.filter-btn');
const cards = document.querySelectorAll('#projectsGrid .project-card');
const countEl = document.getElementById('visibleCount');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const f = btn.dataset.filter;
        let count = 0;
        cards.forEach(card => {
            const show = f === 'all' || (card.dataset.category || '').includes(f);
            card.style.opacity = show ? '1' : '0';
            card.style.transform = show ? '' : 'scale(0.96)';
            card.style.pointerEvents = show ? '' : 'none';
            card.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
            if (show) count++;
        });
        countEl.textContent = count;
    });
});