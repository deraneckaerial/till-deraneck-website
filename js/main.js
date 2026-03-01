/* ============================================================
   TILL DERANECK – Website JavaScript
   Navbar · Animations · Counter · Canvas · Form
   ============================================================ */

'use strict';

/* ── DOM helpers ─────────────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];


/* ══════════════════════════════════════════════════════════════
   1. NAVBAR – scroll state & mobile toggle
══════════════════════════════════════════════════════════════ */
(function initNavbar() {
  const navbar    = $('#navbar');
  const toggle    = $('#navToggle');
  const menu      = $('#navMenu');
  const navLinks  = $$('.nav-link, .nav-cta-btn', menu);
  let overlay     = null;

  /* Create overlay for mobile */
  function createOverlay() {
    overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    document.body.appendChild(overlay);
    overlay.addEventListener('click', closeMenu);
  }
  createOverlay();

  /* Scroll state */
  function onScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Toggle mobile menu */
  function openMenu() {
    menu.classList.add('open');
    toggle.classList.add('open');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    toggle.setAttribute('aria-label', 'Menü schließen');
  }
  function closeMenu() {
    menu.classList.remove('open');
    toggle.classList.remove('open');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    toggle.setAttribute('aria-label', 'Menü öffnen');
  }

  toggle.addEventListener('click', () => {
    menu.classList.contains('open') ? closeMenu() : openMenu();
  });

  /* Close on nav-link click */
  navLinks.forEach(link => link.addEventListener('click', closeMenu));

  /* Close on Escape */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMenu();
  });
})();


/* ══════════════════════════════════════════════════════════════
   2. SCROLL REVEAL – IntersectionObserver
══════════════════════════════════════════════════════════════ */
(function initScrollReveal() {
  const elements = $$('.fade-in, .reveal-up, .reveal-right');

  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => observer.observe(el));
})();


/* ══════════════════════════════════════════════════════════════
   3. HERO ANIMATIONS – staggered entrance on load
══════════════════════════════════════════════════════════════ */
(function initHeroEntrance() {
  /* Mark hero elements visible after a short delay on page load */
  const heroEls = $$('.hero .reveal-up, .hero .reveal-right');
  if (!heroEls.length) return;

  /* Small timeout so CSS transition fires */
  setTimeout(() => {
    heroEls.forEach(el => el.classList.add('visible'));
  }, 120);
})();


/* ══════════════════════════════════════════════════════════════
   4. COUNTER ANIMATION
══════════════════════════════════════════════════════════════ */
(function initCounters() {
  const counters = $$('.counter[data-target]');
  if (!counters.length) return;

  function animateCounter(el) {
    const target  = parseInt(el.dataset.target, 10);
    const suffix  = el.dataset.suffix || '';
    const dur     = 1800;
    const start   = performance.now();

    function step(now) {
      const progress = Math.min((now - start) / dur, 1);
      /* Ease-out cubic */
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.floor(eased * target);
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
})();


/* ══════════════════════════════════════════════════════════════
   5. PARTICLE CANVAS (Hero background)
══════════════════════════════════════════════════════════════ */
(function initParticles() {
  const canvas = $('#heroCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  const PARTICLE_COUNT = 55;
  const GOLD = 'rgba(200,164,74,';

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function createParticle() {
    return {
      x:     Math.random() * W,
      y:     Math.random() * H,
      r:     Math.random() * 1.8 + 0.4,
      dx:    (Math.random() - 0.5) * 0.35,
      dy:    (Math.random() - 0.5) * 0.35,
      alpha: Math.random() * 0.5 + 0.1,
    };
  }

  function init() {
    resize();
    particles = Array.from({ length: PARTICLE_COUNT }, createParticle);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    particles.forEach(p => {
      /* Draw dot */
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = GOLD + p.alpha + ')';
      ctx.fill();

      /* Move */
      p.x += p.dx;
      p.y += p.dy;

      /* Wrap */
      if (p.x < -10) p.x = W + 10;
      if (p.x > W + 10) p.x = -10;
      if (p.y < -10) p.y = H + 10;
      if (p.y > H + 10) p.y = -10;
    });

    /* Draw connecting lines */
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist < 110) {
          const alpha = (1 - dist / 110) * 0.15;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = GOLD + alpha + ')';
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }

  init();
  draw();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(init, 150);
  });
})();


/* ══════════════════════════════════════════════════════════════
   6. CHART BAR ANIMATION (Invest4Kids section)
══════════════════════════════════════════════════════════════ */
(function initChartBars() {
  const bars = $$('.chart-bar-col');
  if (!bars.length) return;

  /* Set initial height to 0 for animation */
  bars.forEach(bar => {
    bar.style.height = '0';
  });

  const wrapper = $('.chart-bars-wrap');
  if (!wrapper) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        bars.forEach((bar, i) => {
          const targetH = bar.style.getPropertyValue('--h') ||
                          getComputedStyle(bar).getPropertyValue('--h');
          setTimeout(() => {
            bar.style.height = bar.parentElement.style.getPropertyValue('--h') ||
                               bar.parentElement.querySelector('.chart-bar-col').parentElement.style.getPropertyValue('--h');
          }, i * 80);

          /* Use CSS custom property directly */
          bar.style.transition = `height 1s cubic-bezier(.4,0,.2,1) ${i * 80}ms`;
          setTimeout(() => {
            bar.style.height = `var(--h)`;
          }, 50 + i * 80);
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  observer.observe(wrapper);
})();


/* ══════════════════════════════════════════════════════════════
   7. SMOOTH SCROLL for anchor links
══════════════════════════════════════════════════════════════ */
(function initSmoothScroll() {
  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function(e) {
      const id = this.getAttribute('href').slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();

      const navH = $('#navbar')?.offsetHeight || 80;
      const top  = target.getBoundingClientRect().top + window.scrollY - navH - 16;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();


/* ══════════════════════════════════════════════════════════════
   8. CONTACT FORM
══════════════════════════════════════════════════════════════ */
(function initContactForm() {
  const form    = $('#contactForm');
  const success = $('#formSuccess');
  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    /* Basic validation */
    const required = $$('[required]', form);
    let valid = true;

    required.forEach(field => {
      field.style.borderColor = '';
      if (!field.value.trim() || (field.type === 'checkbox' && !field.checked)) {
        field.style.borderColor = '#ef4444';
        valid = false;
      }
    });

    if (!valid) {
      /* Shake animation */
      form.style.animation = 'none';
      form.offsetHeight; // reflow
      form.style.animation = 'shake .4s ease';
      return;
    }

    /* Show loading state */
    const btn = $('button[type="submit"]', form);
    btn.classList.add('loading');
    btn.disabled = true;

    /* Simulate send (replace with real endpoint if needed) */
    setTimeout(() => {
      btn.style.display = 'none';
      success.classList.add('show');
      form.reset();

      /* Reset after 8 seconds */
      setTimeout(() => {
        success.classList.remove('show');
        btn.style.display = '';
        btn.classList.remove('loading');
        btn.disabled = false;
      }, 8000);
    }, 1200);
  });

  /* Clear red border on input */
  $$('[required]', form).forEach(field => {
    field.addEventListener('input', () => { field.style.borderColor = ''; });
  });
})();


/* ══════════════════════════════════════════════════════════════
   9. ACTIVE NAV LINK on scroll
══════════════════════════════════════════════════════════════ */
(function initActiveNav() {
  const sections = $$('section[id]');
  const navLinks = $$('.nav-link');
  if (!sections.length || !navLinks.length) return;

  function onScroll() {
    const scrollPos = window.scrollY + 120;
    let current = '';

    sections.forEach(sec => {
      if (sec.offsetTop <= scrollPos) current = sec.id;
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();


/* ══════════════════════════════════════════════════════════════
   10. MODALS – Impressum & Datenschutz
══════════════════════════════════════════════════════════════ */
function openModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.remove('active');
  document.body.style.overflow = '';
}
function closeModalOnBg(e, id) {
  if (e.target === e.currentTarget) closeModal(id);
}

/* Close modals with Escape key */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    $$('.modal-overlay.active').forEach(m => {
      m.classList.remove('active');
    });
    document.body.style.overflow = '';
  }
});


/* ══════════════════════════════════════════════════════════════
   11. SHAKE KEYFRAME (form validation)
══════════════════════════════════════════════════════════════ */
(function injectShakeKeyframe() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shake {
      0%,100% { transform: translateX(0); }
      20% { transform: translateX(-8px); }
      40% { transform: translateX(8px); }
      60% { transform: translateX(-5px); }
      80% { transform: translateX(5px); }
    }
    .nav-link.active {
      color: #fff !important;
    }
    .nav-link.active::after {
      width: 100% !important;
    }
  `;
  document.head.appendChild(style);
})();
