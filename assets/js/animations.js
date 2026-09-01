/* ============================================================
   CANTEENCORP — ANIMATIONS JS
   Scroll reveal, counter animation, progress bars
   ============================================================ */

'use strict';

// ─── Scroll Reveal (IntersectionObserver) ─────────────────────
const ScrollReveal = (() => {
  let observer;

  function init() {
    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    document.querySelectorAll('.reveal, .stagger').forEach(el => {
      observer.observe(el);
    });
  }

  function refresh() {
    document.querySelectorAll('.reveal:not(.revealed), .stagger:not(.revealed)').forEach(el => {
      observer.observe(el);
    });
  }

  return { init, refresh };
})();

// ─── Animated Counter ──────────────────────────────────────────
const CounterAnimation = (() => {
  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function animateCounter(el) {
    const target = parseFloat(el.dataset.target || el.textContent);
    const duration = parseInt(el.dataset.duration || 2000);
    const decimals = (target.toString().split('.')[1] || '').length;
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      const value = target * eased;
      el.textContent = prefix + value.toFixed(decimals) + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }

  function init() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });

    document.querySelectorAll('[data-counter]').forEach(el => {
      observer.observe(el);
    });
  }

  return { init, animate: animateCounter };
})();

// ─── Progress Bar Animation ────────────────────────────────────
const ProgressBars = (() => {
  function init() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const fill = entry.target.querySelector('.progress-bar-fill');
          if (fill) fill.classList.add('animated');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    document.querySelectorAll('.progress-bar-wrap').forEach(el => {
      observer.observe(el);
    });
  }

  return { init };
})();

// ─── Hero Slider ───────────────────────────────────────────────
const HeroSlider = (() => {
  let current = 0;
  let slides, dots, interval;
  let startX = 0;

  function goTo(index) {
    slides.forEach(s => s.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('active');
    if (dots[current]) dots[current].classList.add('active');
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  function startAuto() {
    interval = setInterval(next, 5500);
  }

  function stopAuto() {
    clearInterval(interval);
  }

  function init(sliderEl) {
    if (!sliderEl) return;
    slides = sliderEl.querySelectorAll('.hero-slide');
    dots   = sliderEl.querySelectorAll('.slider-dot');
    if (!slides.length) return;

    slides[0].classList.add('active');
    if (dots[0]) dots[0].classList.add('active');

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        stopAuto();
        goTo(i);
        startAuto();
      });
    });

    const prevBtn = sliderEl.querySelector('.slider-arrow--prev');
    const nextBtn = sliderEl.querySelector('.slider-arrow--next');
    if (prevBtn) prevBtn.addEventListener('click', () => { stopAuto(); prev(); startAuto(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { stopAuto(); next(); startAuto(); });

    // Touch/swipe support
    sliderEl.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    sliderEl.addEventListener('touchend', e => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        stopAuto();
        diff > 0 ? next() : prev();
        startAuto();
      }
    });

    // Pause on hover
    sliderEl.addEventListener('mouseenter', stopAuto);
    sliderEl.addEventListener('mouseleave', startAuto);

    startAuto();
  }

  return { init };
})();

// ─── Parallax Effect ───────────────────────────────────────────
const Parallax = (() => {
  function init() {
    const els = document.querySelectorAll('[data-parallax]');
    if (!els.length) return;

    function update() {
      const scrollY = window.scrollY;
      els.forEach(el => {
        const speed = parseFloat(el.dataset.parallax || 0.3);
        el.style.transform = `translateY(${scrollY * speed}px)`;
      });
    }

    window.addEventListener('scroll', update, { passive: true });
  }

  return { init };
})();

// ─── Tab Switcher ──────────────────────────────────────────────
const Tabs = (() => {
  function init(containerSelector = '.tabs-wrapper') {
    document.querySelectorAll(containerSelector).forEach(wrapper => {
      const buttons = wrapper.querySelectorAll('.tab-btn');
      const panels  = wrapper.querySelectorAll('.tab-panel');

      buttons.forEach((btn, i) => {
        btn.addEventListener('click', () => {
          buttons.forEach(b => b.classList.remove('active'));
          panels.forEach(p => p.classList.remove('active'));
          btn.classList.add('active');
          if (panels[i]) panels[i].classList.add('active');
        });
      });

      // Activate first
      if (buttons[0]) buttons[0].classList.add('active');
      if (panels[0]) panels[0].classList.add('active');
    });
  }

  return { init };
})();

// ─── FAQ Accordion ─────────────────────────────────────────────
const FAQ = (() => {
  function init() {
    document.querySelectorAll('.faq-item').forEach(item => {
      const question = item.querySelector('.faq-question');
      const answer   = item.querySelector('.faq-answer');

      question?.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');

        // Close all others in same container
        const parent = item.closest('.faq-list');
        if (parent) {
          parent.querySelectorAll('.faq-item.open').forEach(openItem => {
            if (openItem !== item) {
              openItem.classList.remove('open');
              openItem.querySelector('.faq-answer')?.classList.remove('open');
            }
          });
        }

        item.classList.toggle('open', !isOpen);
        answer?.classList.toggle('open', !isOpen);
        question.setAttribute('aria-expanded', !isOpen);
      });
    });
  }

  return { init };
})();

// ─── Sticky Section Headers ────────────────────────────────────
const StickyHeaders = (() => {
  function init() {
    // Used for ToC in policy pages
    const toc = document.querySelector('.toc-sidebar');
    if (!toc) return;

    const headings = document.querySelectorAll('.policy-section[id]');
    const tocLinks = toc.querySelectorAll('a[href^="#"]');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          tocLinks.forEach(a => a.classList.remove('active'));
          const target = toc.querySelector(`a[href="#${entry.target.id}"]`);
          if (target) target.classList.add('active');
        }
      });
    }, { rootMargin: '-40% 0px -40% 0px' });

    headings.forEach(h => observer.observe(h));
  }

  return { init };
})();

// ─── Smooth Scroll for anchor links ──────────────────────────
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const offset = 80; // navbar height
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

// ─── Countdown Timer ─────────────────────────────────────────
const Countdown = (() => {
  function init(el, targetDate) {
    if (!el) return;

    function update() {
      const now  = new Date();
      const diff = targetDate - now;
      if (diff <= 0) { el.textContent = 'Live!'; return; }

      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000)  / 60000);
      const s = Math.floor((diff % 60000)    / 1000);

      const pad = n => String(n).padStart(2, '0');

      el.querySelector('[data-days]')?.setAttribute('data-value', pad(d));
      el.querySelector('[data-hours]')?.setAttribute('data-value', pad(h));
      el.querySelector('[data-mins]')?.setAttribute('data-value', pad(m));
      el.querySelector('[data-secs]')?.setAttribute('data-value', pad(s));
    }

    setInterval(update, 1000);
    update();
  }

  return { init };
})();

// ─── Initialize All ───────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  ScrollReveal.init();
  CounterAnimation.init();
  ProgressBars.init();
  Parallax.init();
  Tabs.init();
  FAQ.init();
  StickyHeaders.init();
  initSmoothScroll();

  // Hero Slider
  const sliderEl = document.querySelector('.hero-slider');
  if (sliderEl) HeroSlider.init(sliderEl);

  // Countdown
  const countdownEl = document.querySelector('.countdown-display');
  if (countdownEl) {
    const target = new Date();
    target.setDate(target.getDate() + 7); // 7 days ahead for maintenance
    Countdown.init(countdownEl, target);
  }
});

window.CanteenAnimations = { ScrollReveal, CounterAnimation, HeroSlider, Tabs, FAQ };
