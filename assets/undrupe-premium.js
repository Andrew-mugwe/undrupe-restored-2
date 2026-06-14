/**
 * UNDRUPE PREMIUM — Animation & Interaction Engine
 * 3D tilt, parallax, scroll reveals, particles, cursor glow, smooth counters
 */
(function () {
  'use strict';

  /* ========================================================================
     1. SCROLL-REVEAL OBSERVER
     ======================================================================== */
  const revealClasses = [
    'u-reveal',
    'u-reveal-left',
    'u-reveal-right',
    'u-reveal-scale',
  ];

  function initReveal() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
    );

    revealClasses.forEach((cls) => {
      document.querySelectorAll('.' + cls).forEach((el) => observer.observe(el));
    });
  }

  /* ========================================================================
     2. PARALLAX — hero background + floating cards
     ======================================================================== */
  let heroVisual = null;
  let floatingCards = [];
  let ticking = false;

  function initParallax() {
    heroVisual = document.querySelector('.undrupe-hero__visual');
    floatingCards = Array.from(
      document.querySelectorAll('.undrupe-floating')
    );

    if (!heroVisual && floatingCards.length === 0) return;

    window.addEventListener('scroll', onScroll, { passive: true });
    requestAnimationFrame(updateParallax);
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateParallax);
    }
  }

  function updateParallax() {
    const scrollY = window.pageYOffset;

    if (heroVisual) {
      const speed = 0.3;
      heroVisual.style.transform = `translate3d(0, ${scrollY * speed}px, 0)`;
    }

    floatingCards.forEach((card, i) => {
      const speed = 0.08 + i * 0.04;
      card.style.transform = `translate3d(0, ${scrollY * speed}px, 0)`;
    });

    ticking = false;
  }

  /* ========================================================================
     3. 3D TILT EFFECT — product cards & solution cards
     ======================================================================== */
  function initTilt() {
    const cards = document.querySelectorAll(
      '.undrupe-product-grid .card, .undrupe-solution, .undrupe-placeholder-grid article'
    );

    cards.forEach((card) => {
      card.addEventListener('mousemove', handleTilt);
      card.addEventListener('mouseleave', resetTilt);
    });
  }

  function handleTilt(e) {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -4; // subtle tilt
    const rotateY = ((x - centerX) / centerX) * 4;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-0.6rem)`;
    card.style.transition = 'transform 0.1s ease';
  }

  function resetTilt(e) {
    const card = e.currentTarget;
    card.style.transform = '';
    card.style.transition = 'all 0.45s cubic-bezier(0.4,0,0.2,1)';
  }

  /* ========================================================================
     4. CURSOR GLOW EFFECT — solution & trust cards
     ======================================================================== */
  function initCursorGlow() {
    const glowTargets = document.querySelectorAll(
      '.undrupe-solution, .undrupe-trust > div'
    );

    glowTargets.forEach((el) => {
      // Inject glow layer if not present
      if (!el.querySelector('.undrupe-glow')) {
        const glow = document.createElement('div');
        glow.className = 'undrupe-glow';
        el.prepend(glow);
      }

      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        el.style.setProperty('--mouse-x', x + '%');
        el.style.setProperty('--mouse-y', y + '%');
      });
    });
  }

  /* ========================================================================
     5. PARTICLE EFFECT — canvas behind hero
     ======================================================================== */
  function initParticles() {
    const hero = document.querySelector('.undrupe-hero');
    if (!hero) return;

    // Only run on wider screens
    if (window.innerWidth < 768) return;

    const canvas = document.createElement('canvas');
    canvas.className = 'undrupe-particles';
    canvas.width = hero.offsetWidth;
    canvas.height = hero.offsetHeight;
    hero.prepend(canvas);

    const ctx = canvas.getContext('2d');
    const particles = [];
    const count = 35;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2.5 + 0.5,
        dx: (Math.random() - 0.5) * 0.4,
        dy: (Math.random() - 0.5) * 0.4,
        alpha: Math.random() * 0.35 + 0.05,
      });
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.dx;
        p.y += p.dy;

        // Wrap
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(58, 90, 64, ${p.alpha})`;
        ctx.fill();
      });

      // Draw connections
      for (let a = 0; a < particles.length; a++) {
        for (let b = a + 1; b < particles.length; b++) {
          const dist = Math.hypot(
            particles[a].x - particles[b].x,
            particles[a].y - particles[b].y
          );
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.strokeStyle = `rgba(58, 90, 64, ${0.06 * (1 - dist / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(draw);
    }

    draw();

    // Resize handler
    const resizeObserver = new ResizeObserver(() => {
      canvas.width = hero.offsetWidth;
      canvas.height = hero.offsetHeight;
    });
    resizeObserver.observe(hero);
  }

  /* ========================================================================
     6. SMOOTH NUMBER COUNTER
     ======================================================================== */
  function initCounters() {
    const counters = document.querySelectorAll('[data-count-to]');
    if (!counters.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const target = parseInt(el.getAttribute('data-count-to'), 10);
            const suffix = el.getAttribute('data-count-suffix') || '';
            const prefix = el.getAttribute('data-count-prefix') || '';
            const duration = 2000;
            const start = performance.now();

            function tick(now) {
              const progress = Math.min((now - start) / duration, 1);
              const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
              const current = Math.round(eased * target);
              el.textContent = prefix + current.toLocaleString() + suffix;
              if (progress < 1) requestAnimationFrame(tick);
            }

            requestAnimationFrame(tick);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.3 }
    );

    counters.forEach((c) => observer.observe(c));
  }

  /* ========================================================================
     7. MAGNETIC BUTTONS
     ======================================================================== */
  function initMagneticButtons() {
    const buttons = document.querySelectorAll('.undrupe-button');

    buttons.forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }

  /* ========================================================================
     8. SMOOTH SCROLL PROGRESS BAR (top of page)
     ======================================================================== */
  function initScrollProgress() {
    const bar = document.createElement('div');
    bar.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      height: 3px;
      background: linear-gradient(90deg, #3a5a40 0%, #588157 50%, #c2a462 100%);
      z-index: 99999;
      transition: width 0.1s linear;
      pointer-events: none;
      border-radius: 0 2px 2px 0;
    `;
    document.body.appendChild(bar);

    window.addEventListener('scroll', () => {
      const scrollTop = document.documentElement.scrollTop;
      const scrollHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      const progress = (scrollTop / scrollHeight) * 100;
      bar.style.width = progress + '%';
    }, { passive: true });
  }

  /* ========================================================================
     9. IMAGE LOAD HANDLER — prevents broken cards
     ======================================================================== */
  function initImageHandler() {
    const images = document.querySelectorAll(
      '.undrupe-product-grid img, .undrupe-editorial__image img, .undrupe-hero__image'
    );

    images.forEach((img) => {
      // Already loaded
      if (img.complete && img.naturalWidth > 0) {
        img.classList.add('is-loaded');
        return;
      }

      img.addEventListener('load', () => {
        img.classList.add('is-loaded');
      });

      img.addEventListener('error', () => {
        // Fallback: set a neutral background
        const parent = img.closest('.card__media, .undrupe-editorial__image, .undrupe-hero__image-card');
        if (parent) {
          parent.style.background = 'linear-gradient(135deg, #f0efe8, #e4e2da)';
        }
        img.style.display = 'none';
      });
    });
  }

  /* ========================================================================
     10. LENIS-STYLE SMOOTH SCROLL (lightweight)
     ======================================================================== */
  function initSmoothScroll() {
    // Enable smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';
  }

  /* ========================================================================
     11. TEXT SPLIT / CHARACTER ANIMATION for heading
     ======================================================================== */
  function initHeadingAnimation() {
    const heading = document.querySelector('.undrupe-hero__heading');
    if (!heading) return;

    // We use CSS animation instead of splitting to avoid layout shifts
    heading.style.opacity = '0';
    heading.style.transform = 'translateY(3rem)';

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            heading.style.transition =
              'opacity 0.8s cubic-bezier(0.4,0,0.2,1), transform 0.8s cubic-bezier(0.4,0,0.2,1)';
            heading.style.opacity = '1';
            heading.style.transform = 'translateY(0)';
            observer.unobserve(heading);
          }
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(heading);
  }

  /* ========================================================================
     12. STAGGER ASSIGN — auto-assign delay classes to grid children
     ======================================================================== */
  function initStaggerAssign() {
    const grids = document.querySelectorAll(
      '.undrupe-product-grid, .undrupe-solution-grid, .undrupe-placeholder-grid, .undrupe-trust, .undrupe-testimonials__grid, .undrupe-stats__grid'
    );

    grids.forEach((grid) => {
      const children = grid.children;
      Array.from(children).forEach((child, i) => {
        child.classList.add('u-reveal');
        child.classList.add('u-delay-' + Math.min(i + 1, 8));
      });
    });
  }

  /* ========================================================================
     INITIALIZE
     ======================================================================== */
  function init() {
    initStaggerAssign();
    initReveal();
    initParallax();
    initTilt();
    initCursorGlow();
    initParticles();
    initCounters();
    initMagneticButtons();
    initScrollProgress();
    initImageHandler();
    initSmoothScroll();
    initHeadingAnimation();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Also re-init when Shopify section renders in theme editor
  if (window.Shopify && window.Shopify.designMode) {
    document.addEventListener('shopify:section:load', init);
  }
})();
