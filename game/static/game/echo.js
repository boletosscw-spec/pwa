/* Primal Echo: progressive enhancement, native dialogs, no dependencies. */
(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const header = document.querySelector('.site-header');
  const menu = document.getElementById('mobile-menu');
  const toggle = document.querySelector('.menu-toggle');
  let returnFocus;
  function syncDialogs() {
    const open = !!document.querySelector('dialog[open]');
    document.body.classList.toggle('modal-open', open);
    toggle?.setAttribute('aria-expanded', String(!!menu?.open));
  }
  function openDialog(dialog, trigger) {
    if (!dialog) return;
    returnFocus = trigger || document.activeElement;
    document.querySelectorAll('dialog[open]').forEach(item => item.close());
    dialog.showModal(); syncDialogs();
  }
  function closeDialog(dialog) { if (dialog?.open) dialog.close(); }
  toggle?.addEventListener('click', () => openDialog(menu, toggle));
  document.querySelector('.menu-close')?.addEventListener('click', () => closeDialog(menu));
  document.querySelectorAll('[data-dialog]').forEach(button => button.addEventListener('click', () => openDialog(document.getElementById(button.dataset.dialog), button)));
  document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => closeDialog(button.closest('dialog'))));
  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.addEventListener('close', () => { syncDialogs(); if (!document.querySelector('dialog[open]')) returnFocus?.focus(); });
    dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeDialog(dialog); } });
  });
  menu?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeDialog(menu)));
  document.querySelectorAll('[data-dismiss-message]').forEach(button => button.addEventListener('click', event => event.currentTarget.closest('.site-messages').remove()));
  // If login or registration failed, reopen that same dialog so the error is visible in context.
  const formError = document.querySelector('dialog .form-error');
  if (formError) openDialog(formError.closest('dialog'));
  // Local reveal effects, applied only when IntersectionObserver is supported.
  if ('IntersectionObserver' in window) {
    if (!reduced.matches) document.body.classList.add('motion-ready');
    const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); revealObserver.unobserve(entry.target); }
    }), {threshold: .08});
    document.querySelectorAll('.reveal').forEach((element) => {
      const siblings = [...element.parentElement.children].filter(child => child.classList.contains('reveal'));
      element.style.setProperty('--reveal-delay', `${Math.min(siblings.indexOf(element), 3) * 75}ms`);
      revealObserver.observe(element);
    });
    const animationObserver = new IntersectionObserver(entries => entries.forEach(entry => entry.target.classList.toggle('is-playing', entry.isIntersecting)), {threshold: .15});
    document.querySelectorAll('.skill-card').forEach(card => animationObserver.observe(card));
  }
  document.querySelectorAll('.spores').forEach(container => {
    for (let i = 0; i < 18; i++) {
      const mote = document.createElement('i');
      mote.style.cssText = `left:${(i * 37 + 7) % 100}%;top:${(i * 23 + 18) % 90}%;--delay:${i * -.7}s;--duration:${7 + i % 5}s`;
      container.append(mote);
    }
  });
  const hero = document.querySelector('.key-hero');
  const guideLinks = [...document.querySelectorAll('.guide-nav a')];
  const guideSections = guideLinks.map(link => document.querySelector(link.hash)).filter(Boolean);
  let queued = false;
  function update() {
    queued = false;
    header?.classList.toggle('is-solid', scrollY > 35);
    if (hero && !reduced.matches) {
      const rect = hero.getBoundingClientRect();
      if (rect.bottom > 0) {
        const y = Math.min(130, Math.max(0, -rect.top * .18));
        hero.style.setProperty('--scene-y', `${y}px`);
        hero.style.setProperty('--front-y', `${-y * 1.6}px`);
      }
    }
    let active = guideSections[0];
    guideSections.forEach(section => { if (section.getBoundingClientRect().top <= 195) active = section; });
    guideLinks.forEach(link => {
      const selected = active?.id === link.hash.slice(1);
      link.classList.toggle('is-active', selected);
      if (selected) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
    });
  }
  // Foreground foliage follows the pointer a little, for depth (mouse/trackpad only).
  if (hero && !reduced.matches && matchMedia('(pointer: fine)').matches) {
    let pointerQueued = false, px = 0, py = 0;
    hero.addEventListener('pointermove', event => {
      const rect = hero.getBoundingClientRect();
      px = (event.clientX - rect.left) / rect.width - .5;
      py = (event.clientY - rect.top) / rect.height - .5;
      if (!pointerQueued) { pointerQueued = true; requestAnimationFrame(() => {
        pointerQueued = false;
        hero.style.setProperty('--pointer-x', px.toFixed(3));
        hero.style.setProperty('--pointer-y', py.toFixed(3));
      }); }
    });
    hero.addEventListener('pointerleave', () => { hero.style.setProperty('--pointer-x', 0); hero.style.setProperty('--pointer-y', 0); });
  }
  addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(update); } }, {passive: true});
  addEventListener('resize', () => { if (innerWidth >= 1000) closeDialog(menu); update(); });
  update();
  // Keyboard/gamepad switch: one set of bindings at a time, also available without JS.
  const controlGroups = [...document.querySelectorAll('[data-controls]')];
  function setInput(type) {
    document.querySelectorAll('[data-input-choice]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.inputChoice === type)));
    controlGroups.forEach(group => group.querySelectorAll('[data-binding]').forEach(keys => { keys.hidden = keys.dataset.binding !== type; }));
  }
  document.querySelectorAll('[data-input-choice]').forEach(button => button.addEventListener('click', () => setInput(button.dataset.inputChoice)));
  setInput('keyboard');
  // Only show the native install action after the browser provides a real prompt.
  let installPrompt;
  const installButtons = [...document.querySelectorAll('[data-install]')];
  addEventListener('beforeinstallprompt', event => {
    event.preventDefault(); installPrompt = event;
    installButtons.forEach(button => { button.hidden = false; });
  });
  installButtons.forEach(button => button.addEventListener('click', async () => {
    if (!installPrompt) return;
    await installPrompt.prompt(); await installPrompt.userChoice; installPrompt = null;
    installButtons.forEach(item => { item.hidden = true; });
  }));
  addEventListener('appinstalled', () => installButtons.forEach(button => { button.hidden = true; }));
  if ('serviceWorker' in navigator) addEventListener('load', () => navigator.serviceWorker.register('/service-worker.js').catch(() => {}));
})();
