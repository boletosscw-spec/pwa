/* Inline hero vignette. It never blocks navigation, scrolling, or focus. */
(() => {
    'use strict';
    const script = document.currentScript;
    const overlay = document.getElementById('kael-entrance');
    if (!overlay || !script) return;
    const hero = overlay.closest('.world-home-hero');
    const actions = hero?.querySelector('.hero-actions');
    const replay = hero?.querySelector('.kael-replay');
    const arrived = performance.now();
    let failSafe;
    function showActions() {
        clearTimeout(failSafe);
        if (hero) hero.dataset.introStage = 'ready';
        if (actions) { actions.inert = false; actions.removeAttribute('aria-hidden'); }
    }
    function beginIntro() {
        if (!hero || reducedMotion.matches) return;
        hero.classList.add('intro-running'); hero.dataset.introStage = 'logo';
        if (actions) { actions.inert = true; actions.setAttribute('aria-hidden', 'true'); }
        failSafe = window.setTimeout(showActions, 18000);
    }
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const canvas = overlay.querySelector('canvas');
    const context = canvas.getContext('2d');
    if (!context) return;
    const root = script.dataset.spriteRoot;
    const duration = 7000;
    let assetsPromise, scene, started, frameId;
    let running = false, opening = false, lastTime = 0, width = 0, height = 0;
    let sceneVisible = false;
    const visibleWaiters = [];
    function canPlay() { return sceneVisible && document.visibilityState === 'visible'; }
    function notifyVisible() {
        if (canPlay()) visibleWaiters.splice(0).forEach(resolve => resolve());
        else started = undefined;
    }
    const visibilityObserver = new IntersectionObserver(entries => {
        sceneVisible = entries[0].isIntersecting && entries[0].intersectionRatio >= .35;
        notifyVisible();
    }, {threshold: [0, .35]});
    visibilityObserver.observe(overlay);
    document.addEventListener('visibilitychange', notifyVisible);
    function waitUntilVisible() {
        return canPlay() ? Promise.resolve() : new Promise(resolve => visibleWaiters.push(resolve));
    }
    function load(name) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            const timeout = window.setTimeout(() => reject(new Error('Entrance sprite timeout')), 45000);
            image.onload = () => { clearTimeout(timeout); resolve(image); };
            image.onerror = () => { clearTimeout(timeout); reject(new Error('Unable to load entrance sprite')); };
            image.src = root + name;
        });
    }

    // Measure occupied pixels within each cell to keep feet and body size stable.
    // This only controls canvas framing; source files are not modified.
    function frames(image, columns, rows, count) {
        const cellWidth = Math.floor(image.width / columns);
        const cellHeight = Math.floor(image.height / rows);
        const buffer = document.createElement('canvas');
        buffer.width = image.width;
        buffer.height = image.height;
        const ctx = buffer.getContext('2d', {willReadFrequently: true});
        ctx.drawImage(image, 0, 0);
        const pixels = ctx.getImageData(0, 0, image.width, image.height).data;
        let left = cellWidth, right = 0, top = cellHeight, bottom = 0;
        for (let index = 0; index < count; index++) {
            const ox = (index % columns) * cellWidth;
            const oy = Math.floor(index / columns) * cellHeight;
            for (let y = 0; y < cellHeight; y++) {
                for (let x = 0; x < cellWidth; x++) {
                    if (pixels[((oy + y) * image.width + ox + x) * 4 + 3] < 90) continue;
                    left = Math.min(left, x); right = Math.max(right, x);
                    top = Math.min(top, y); bottom = Math.max(bottom, y);
                }
            }
        }
        if (right <= left || bottom <= top) throw new Error('Empty entrance sprite');
        return Array.from({length: count}, (_, index) => ({
            image,
            x: (index % columns) * cellWidth + left,
            y: Math.floor(index / columns) * cellHeight + top,
            width: right - left + 1,
            height: bottom - top + 1
        }));
    }

    function prepare() {
        if (!assetsPromise) {
            assetsPromise = Promise.all([
                load('kael-caminar.webp'), load('kael-gestos.webp'), load('kael-correr-asustado.webp'),
                ...Array.from({length: 8}, (_, i) => load(`explorador-correr-${String(i + 1).padStart(2, '0')}.webp`))
            ]).then(([walk, poses, run, ...enemy]) => ({
                walk: frames(walk, 8, 1, 8), poses: frames(poses, 2, 1, 2),
                run: frames(run, 3, 2, 6), enemy: enemy.map(image => frames(image, 1, 1, 1)[0])
            }));
        }
        return assetsPromise;
    }


    function resize() {
        const bounds = overlay.getBoundingClientRect();
        width = bounds.width; height = bounds.height;
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(width * ratio);
        canvas.height = Math.round(height * ratio);
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        context.imageSmoothingEnabled = false;
        context.imageSmoothingQuality = 'high';
    }
    const lerp = (a, b, t) => a + (b - a) * Math.min(1, Math.max(0, t));
    function draw(frame, x, ground, size, angle = 0) {
        const w = size * frame.width / frame.height;
        context.save();
        context.translate(x, ground);
        context.rotate(angle);
        context.drawImage(frame.image, frame.x, frame.y, frame.width, frame.height,
            -w / 2, -size, w, size);
        context.restore();
    }

    // Articulate only the raised hand. Head, torso, arm and feet stay fixed.
    // The gesture sheet has two square cells; the first is the frontal greeting.
    function drawWave(frame, x, ground, size, seconds) {
        const unit = frame.image.width / 2 / 887;
        const pivot = {x: 335 * unit, y: 416 * unit};
        const hand = [[245, 298], [323, 298], [349, 324], [357, 365], [360, 415],
            [326, 433], [284, 397], [245, 358]].map(([px, py]) => [px * unit, py * unit]);
        const scale = size / frame.height;
        const drawHandPath = () => {
            context.moveTo(hand[0][0], hand[0][1]);
            hand.slice(1).forEach(([px, py]) => context.lineTo(px, py));
            context.closePath();
        };
        context.save();
        context.translate(x - frame.width * scale / 2, ground - size);
        context.scale(scale, scale);
        context.translate(-frame.x, -frame.y);

        // Keep every pixel outside the glove in the same place.
        context.save();
        context.beginPath();
        context.rect(frame.x, frame.y, frame.width, frame.height);
        drawHandPath();
        context.clip('evenodd');
        context.drawImage(frame.image, 0, 0);
        context.restore();

        // A small left-right wrist wave, with the elbow completely still.
        context.translate(pivot.x, pivot.y);
        context.rotate(Math.sin(seconds * Math.PI * 6) * .22);
        context.translate(-pivot.x, -pivot.y);
        context.beginPath();
        drawHandPath();
        context.clip();
        context.drawImage(frame.image, 0, 0);
        context.restore();
    }

    function render(ms) {
        const t = ms / 1000;
        const bodyHeight = Math.min(width < 600 ? 135 : 165, height * .57, width * .31);
        const ground = height - 64;
        const center = width * .52;
        const gap = Math.max(bodyHeight * 1.45, width * .25);
        context.clearRect(0, 0, width, height);
        // Hard-edged pixel ground; no painted foliage or blurred gradient.
        context.fillStyle = '#081b28';
        context.fillRect(0, ground, width, height - ground);
        for (let x = 0; x < width; x += 16) {
            context.fillStyle = (x / 16) % 3 ? '#21404a' : '#2d5158';
            context.fillRect(x, ground, 15, 4);
            context.fillStyle = '#112b39';
            context.fillRect(x + 2, ground + 6, 12, 10);
            context.fillStyle = '#163542';
            context.fillRect(x + 7, ground + 21, 7, 4);
        }
        overlay.dataset.phase = t < 2 ? 'walk' : t < 3.5 ? 'wave' : t < 4.3 ? 'scared' : 'chase';

        // Small drifting motes echo the valley without obscuring the silhouettes.
        context.fillStyle = '#73e3df4d';
        for (let i = 0; i < 12; i++) {
            const x = ((i * 173 + t * (i % 2 ? 5 : -5)) % width + width) % width;
            const y = height * .35 + (i * 41 % Math.max(1, height * .33)) + Math.sin(t + i) * 4;
            context.fillRect(x, y, 2, 2);
        }

        // Once both characters have left, keep only the ground, not a frozen enemy edge.
        if (ms >= duration) { overlay.dataset.phase = 'idle'; return; }

        let kaelX = center;
        let pose;
        let bob = 0;
        let angle = 0;
        let text;
        if (t < 2) {
            kaelX = lerp(-bodyHeight, center, t / 2);
            pose = scene.walk[Math.floor(t * 8) % scene.walk.length];
            text = 'Un paseo tranquilo…';
        } else if (t < 3.5) {
            pose = scene.poses[0];
            text = '¡Hola!';
        } else if (t < 4.3) {
            pose = scene.poses[1];
            kaelX += Math.sin(t * 45) * 1.2;
            text = 'Eso no estaba ahí…';
        } else {
            kaelX = lerp(center, width + bodyHeight * 3, (t - 4.3) / 2.25);
            pose = scene.run[Math.floor((t - 4.3) * 12) % scene.run.length];
            bob = Math.abs(Math.sin(t * 16)) * 3;
            text = '';
        }

        if (t >= 3.5) {
            const enemyX = t < 4.3
                ? lerp(-bodyHeight * 2, center - gap, (t - 3.5) / .8)
                : kaelX - gap;
            const enemy = scene.enemy[Math.floor(t * (t < 4.3 ? 7 : 12)) % scene.enemy.length];
            draw(enemy, enemyX, ground, bodyHeight * .9);
            if (t < 4.4) {
                context.fillStyle = '#efc08c';
                context.font = `bold ${Math.round(bodyHeight * .26)}px Georgia`;
                context.textAlign = 'center';
                context.fillText('!', kaelX + bodyHeight * .35, ground - bodyHeight * 1.08);
            }
        }
        if (t >= 2 && t < 3.5) drawWave(pose, kaelX, ground, bodyHeight, t - 2);
        else draw(pose, kaelX, ground - bob, bodyHeight, angle);


    }


    function tick(now) {
        if (!running) return;
        if (!canPlay()) {
            // Do not consume the welcome scene while another tab is open or below the fold.
            started = undefined;
            frameId = requestAnimationFrame(tick);
            return;
        }
        started ??= now - lastTime;
        lastTime = Math.max(0, now - started);
        render(lastTime);
        if (lastTime >= duration) { running = false; overlay.dataset.phase = 'idle'; showActions(); }
        else frameId = requestAnimationFrame(tick);
    }
    async function play() {
        if (running || opening) return;
        opening = true;
        try {
            scene = await prepare(); resize();
            render(duration + 10); overlay.dataset.phase = 'waiting';
            if (!reducedMotion.matches) await new Promise(resolve => window.setTimeout(resolve, Math.max(0, 1400 - (performance.now() - arrived))));
            if (replay) replay.hidden = false;
            if (!reducedMotion.matches) await waitUntilVisible();
            if (reducedMotion.matches) { render(2500); overlay.dataset.phase = 'still'; showActions(); return; }
            clearTimeout(failSafe);
            if (hero?.dataset.introStage === 'logo') hero.dataset.introStage = 'kael';
            lastTime = 0;
            running = true; started = undefined; render(0);
            frameId = requestAnimationFrame(tick);
        } catch (error) {
            showActions();
            console.warn('La escena de Kael no está disponible.', error);
        } finally {
            opening = false;
        }
    }
    new ResizeObserver(() => { resize(); if (scene) render(overlay.dataset.phase === 'still' ? 2500 : running ? lastTime : duration + 10); }).observe(overlay);
    reducedMotion.addEventListener('change', () => {
        cancelAnimationFrame(frameId); running = false;
        if (scene) { render(2500); overlay.dataset.phase = 'still'; }
        showActions();
    });
    replay?.addEventListener('click', () => {
        overlay.scrollIntoView({block: 'center', behavior: reducedMotion.matches ? 'instant' : 'smooth'});
        play();
    });
    beginIntro();
    play();
})();
