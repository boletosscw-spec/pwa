(() => {
    'use strict';
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    // The same five layers used by Nivel_01_Valle_del_Eco.
    document.querySelectorAll('.world-hero').forEach(hero => {
        if (!hero.querySelector('.world-layers')) {
            const layers = document.createElement('div');
            layers.className = 'world-layers'; layers.setAttribute('aria-hidden', 'true');
            for (let i = 0; i < 5; i++) layers.append(document.createElement('i'));
            hero.prepend(layers);
        }
        const motes = document.createElement('div');
        motes.className = 'world-motes'; motes.setAttribute('aria-hidden', 'true');
        for (let i = 0; i < 14; i++) {
            const mote = document.createElement('i');
            mote.style.cssText = `left:${(i * 37 + 7) % 100}%;top:${(i * 23 + 18) % 80}%;--delay:${i * -.7}s;--duration:${6 + i % 5}s`;
            motes.append(mote);
        }
        hero.append(motes);
    });
    const reveal = document.querySelectorAll('.world-section-head, .world-feature, .world-path article, .world-creature, .world-items article, .kiro-note, .world-journal article, .home-story');
    if (!reduced.matches && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver(entries => entries.forEach(entry => {
            if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
        }), {threshold: .06});
        reveal.forEach(element => { element.classList.add('scroll-reveal'); observer.observe(element); });
    }
    const heroes = [...document.querySelectorAll('.world-hero')];
    const menus = [...document.querySelectorAll('.world-jump')];
    const links = menus.flatMap(menu => [...menu.querySelectorAll('a[href^="#"]')]);
    const sections = links.map(link => document.getElementById(link.hash.slice(1))).filter(Boolean);
    let queued = false;
    function update() {
        queued = false;
        document.body.classList.toggle('nav-scrolled', window.scrollY > 90);
        if (!reduced.matches) heroes.forEach(hero => {
            const position = hero.getBoundingClientRect();
            if (position.bottom > 0 && position.top < innerHeight) hero.style.setProperty('--parallax', `${Math.max(-80, Math.min(80, -position.top * .16))}px`);
        });
        let active = sections[0];
        sections.forEach(section => { if (section.getBoundingClientRect().top <= 205) active = section; });
        links.forEach(link => {
            const selected = active && link.hash === '#' + active.id;
            link.classList.toggle('is-active', !!selected);
            if (selected) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
        });
    }
    window.addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(update); } }, {passive: true});
    window.addEventListener('resize', update);
    update();
})();

// Play source sprite strips only while their cards are on screen.
(() => {
    const cards = document.querySelectorAll('.motion-card');
    if (!cards.length || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
        entry.target.classList.toggle('is-playing', entry.isIntersecting);
    }), {threshold: .15});
    cards.forEach(card => observer.observe(card));
})();
