/* =========================================================
   Sebastián Contreras — Portfolio JS
   - Bilingual EN/ES toggle (with localStorage + browser auto-detect)
   - Typing effect (no external library)
   - Scroll-reveal animations
   - Active section highlighting in nav
   - Mobile menu
   - Modals (open / close / ESC / backdrop)
   - Animated stat counters
   - Animated language proficiency bars
   - Back-to-top button
   - Year stamp
   ========================================================= */

(function () {
  'use strict';

  /* -------------------------------------------------- *
   * 1. Bilingual content (EN / ES)
   * -------------------------------------------------- */
  const LANG_KEY = 'sca_lang';
  const supported = ['en', 'es'];

  // Typed phrases per language
  const typedPhrases = {
    en: [
      'Hydraulic Civil Engineer',
      'HEC-RAS 1D & 2D Flood Modeler',
      'Hydrology & Water-Permits Specialist',
      'Python Automation for Engineering',
    ],
    es: [
      'Ingeniero Civil Hidráulico',
      'Modelador de Inundaciones HEC-RAS 1D & 2D',
      'Especialista en Hidrología y Permisos DGA',
      'Automatización con Python para Ingeniería',
    ],
  };

  function getInitialLang() {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved && supported.includes(saved)) return saved;
    const browser = (navigator.language || 'en').slice(0, 2).toLowerCase();
    return supported.includes(browser) ? browser : 'en';
  }

  function applyLang(lang) {
    if (!supported.includes(lang)) lang = 'en';
    document.documentElement.lang = lang;
    localStorage.setItem(LANG_KEY, lang);

    // Swap any element with data-en / data-es
    document.querySelectorAll('[data-en], [data-es]').forEach(el => {
      const text = el.getAttribute('data-' + lang);
      if (text == null) return;

      // Title tag and meta description (use textContent / content)
      if (el.tagName === 'META') {
        el.setAttribute('content', text);
        return;
      }
      if (el.tagName === 'TITLE') {
        el.textContent = text;
        return;
      }
      // For elements that originally contained inline HTML strong tags etc.
      el.innerHTML = text;
    });

    // Update toggle visual state
    document.querySelectorAll('.lang-toggle__option').forEach(opt => {
      opt.classList.toggle('is-active', opt.dataset.lang === lang);
    });

    // Restart typed effect with new phrases
    startTyped(typedPhrases[lang]);
  }

  /* -------------------------------------------------- *
   * 2. Typed effect (no library)
   * -------------------------------------------------- */
  let typedTimer = null;
  function startTyped(phrases) {
    const el = document.getElementById('typed');
    if (!el) return;
    if (typedTimer) clearTimeout(typedTimer);
    el.textContent = '';

    let i = 0;     // phrase index
    let j = 0;     // char index
    let deleting = false;

    function tick() {
      const phrase = phrases[i % phrases.length];
      if (!deleting) {
        j++;
        el.textContent = phrase.slice(0, j);
        if (j === phrase.length) {
          deleting = true;
          typedTimer = setTimeout(tick, 1800);
          return;
        }
        typedTimer = setTimeout(tick, 70);
      } else {
        j--;
        el.textContent = phrase.slice(0, j);
        if (j === 0) {
          deleting = false;
          i++;
          typedTimer = setTimeout(tick, 250);
          return;
        }
        typedTimer = setTimeout(tick, 35);
      }
    }
    tick();
  }

  /* -------------------------------------------------- *
   * 3. Scroll-aware navbar + back-to-top
   * -------------------------------------------------- */
  const nav = document.getElementById('nav');
  const toTop = document.getElementById('toTop');

  function onScroll() {
    const y = window.scrollY;
    if (nav) nav.classList.toggle('is-scrolled', y > 24);
    if (toTop) toTop.classList.toggle('is-visible', y > 600);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* -------------------------------------------------- *
   * 4. Mobile menu
   * -------------------------------------------------- */
  const burger = document.getElementById('navBurger');
  const menu = document.getElementById('navMenu');
  if (burger && menu) {
    burger.addEventListener('click', () => {
      const open = menu.classList.toggle('is-open');
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
    });
    menu.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => {
        menu.classList.remove('is-open');
        burger.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      })
    );
  }

  /* -------------------------------------------------- *
   * 5. Active nav link based on section in view
   * -------------------------------------------------- */
  const navLinks = document.querySelectorAll('.nav__link');
  const sections = Array.from(navLinks)
    .map(a => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    const navObs = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const id = '#' + entry.target.id;
          navLinks.forEach(link =>
            link.classList.toggle('is-active', link.getAttribute('href') === id)
          );
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );
    sections.forEach(s => navObs.observe(s));
  }

  /* -------------------------------------------------- *
   * 6. Reveal-on-scroll
   * -------------------------------------------------- */
  const revealTargets = document.querySelectorAll(
    '.section__header, .about, .skills__group, .timeline__item, .edu-card, .congress-card, .project-card, .contact'
  );
  revealTargets.forEach(el => el.classList.add('reveal'));

  if ('IntersectionObserver' in window) {
    const revealObs = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            revealObs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -10% 0px' }
    );
    revealTargets.forEach(el => revealObs.observe(el));
  } else {
    revealTargets.forEach(el => el.classList.add('is-in'));
  }

  /* -------------------------------------------------- *
   * 7. Stat counters
   * -------------------------------------------------- */
  const counters = document.querySelectorAll('.stat__num[data-count]');
  if ('IntersectionObserver' in window && counters.length) {
    const counterObs = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const target = parseInt(el.dataset.count, 10) || 0;
          const dur = 1500;
          const start = performance.now();
          function step(now) {
            const p = Math.min(1, (now - start) / dur);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(eased * target).toString();
            if (p < 1) requestAnimationFrame(step);
          }
          requestAnimationFrame(step);
          counterObs.unobserve(el);
        });
      },
      { threshold: 0.4 }
    );
    counters.forEach(c => counterObs.observe(c));
  }

  /* -------------------------------------------------- *
   * 8. Language proficiency bars
   * -------------------------------------------------- */
  const fills = document.querySelectorAll('.lang-bar__fill[data-fill]');
  if ('IntersectionObserver' in window && fills.length) {
    const fillObs = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.style.width = entry.target.dataset.fill + '%';
          fillObs.unobserve(entry.target);
        });
      },
      { threshold: 0.5 }
    );
    fills.forEach(f => fillObs.observe(f));
  } else {
    fills.forEach(f => (f.style.width = f.dataset.fill + '%'));
  }

  /* -------------------------------------------------- *
   * 9. Modals
   * -------------------------------------------------- */
  function openModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.hidden = false;
    requestAnimationFrame(() => modal.classList.add('is-open'));
    document.body.style.overflow = 'hidden';
    const closeBtn = modal.querySelector('.modal__close');
    if (closeBtn) closeBtn.focus();
  }
  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('is-open');
    setTimeout(() => {
      modal.hidden = true;
      // Pause any playing videos
      modal.querySelectorAll('video').forEach(v => { try { v.pause(); } catch {} });
    }, 300);
    document.body.style.overflow = '';
  }
  document.querySelectorAll('[data-modal]').forEach(card => {
    card.addEventListener('click', () => openModal(card.dataset.modal));
    card.tabIndex = 0;
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal(card.dataset.modal);
      }
    });
  });
  document.querySelectorAll('.modal').forEach(modal => {
    modal.querySelectorAll('[data-close]').forEach(el => {
      el.addEventListener('click', () => closeModal(modal));
    });
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      const open = document.querySelector('.modal.is-open');
      if (open) closeModal(open);
    }
  });

  /* -------------------------------------------------- *
   * 10. Language toggle
   * -------------------------------------------------- */
  const langToggle = document.getElementById('langToggle');
  if (langToggle) {
    langToggle.addEventListener('click', e => {
      // Find which option was clicked, or just flip
      const opt = e.target.closest('.lang-toggle__option');
      const current = localStorage.getItem(LANG_KEY) || getInitialLang();
      let next;
      if (opt && opt.dataset.lang) {
        next = opt.dataset.lang;
      } else {
        next = current === 'en' ? 'es' : 'en';
      }
      if (next !== current) applyLang(next);
    });
  }

  /* -------------------------------------------------- *
   * 11. Year stamp
   * -------------------------------------------------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* -------------------------------------------------- *
   * 12. Boot
   * -------------------------------------------------- */
  applyLang(getInitialLang());

  /* -------------------------------------------------- *
   * 13. Smooth scroll for in-page anchors (older browsers)
   * -------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const navH = nav ? nav.offsetHeight : 0;
        const top = target.getBoundingClientRect().top + window.scrollY - navH + 1;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
})();
