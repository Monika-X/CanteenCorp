/* ============================================================
   CANTEENCORP — CORE JS
   Theme toggle, RTL, localStorage, navbar, back-to-top
   ============================================================ */

'use strict';

// ─── Theme Manager ─────────────────────────────────────────────
const ThemeManager = (() => {
  const KEY = 'cc_theme';
  let current = localStorage.getItem(KEY) || 'light';

  function apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    current = theme;
    localStorage.setItem(KEY, theme);
    document.querySelectorAll('.theme-toggle').forEach(btn => {
      btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode');
      btn.innerHTML = theme === 'dark' ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
    });
  }

  function toggle() { apply(current === 'dark' ? 'light' : 'dark'); }
  function init()   { apply(current); }

  return { init, toggle, get: () => current };
})();

// ─── RTL Manager ────────────────────────────────────────────────
const RTLManager = (() => {
  const KEY = 'cc_dir';
  let current = localStorage.getItem(KEY) || 'ltr';

  function apply(dir) {
    document.documentElement.setAttribute('dir', dir);
    current = dir;
    localStorage.setItem(KEY, dir);
    document.querySelectorAll('.rtl-toggle').forEach(btn => {
      btn.setAttribute('aria-label', dir === 'rtl' ? 'Switch to LTR' : 'Switch to RTL');
      btn.textContent = dir === 'rtl' ? 'LTR' : 'RTL';
    });
  }

  function toggle() { apply(current === 'rtl' ? 'ltr' : 'rtl'); }
  function init()   { apply(current); }

  return { init, toggle };
})();

// ─── Navbar ─────────────────────────────────────────────────────
const Navbar = (() => {
  function init() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    // Scroll effect
    const onScroll = () => {
      const scrolled = window.scrollY > 60;
      navbar.classList.toggle('navbar--scrolled', scrolled);
      if (navbar.classList.contains('navbar--transparent')) {
        // Keep transparent class but add scrolled
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Hamburger
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');

    if (hamburger && mobileMenu) {
      hamburger.addEventListener('click', () => {
        const open = hamburger.classList.toggle('active');
        mobileMenu.classList.toggle('open', open);
        document.body.style.overflow = open ? 'hidden' : '';
        hamburger.setAttribute('aria-expanded', open);
      });

      // Close on link click
      mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          hamburger.classList.remove('active');
          mobileMenu.classList.remove('open');
          document.body.style.overflow = '';
        });
      });
    }

    // Active link
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link[href]').forEach(link => {
      const href = link.getAttribute('href').split('/').pop();
      if (href === currentPath || (currentPath === '' && href === 'index.html')) {
        link.classList.add('active');
      }
    });
  }

  return { init };
})();

// ─── Profile Menu (Icon + Dropdown) ──────────────────────────────
const ProfileMenu = (() => {
  function init() {
    const menu = document.getElementById('profile-menu');
    if (!menu) return;

    const toggle = (show) => {
      menu.classList.toggle('open', show);
      const dd = document.getElementById('profile-dropdown');
      if (dd) dd.style.display = show ? 'block' : 'none';
    };

    // Click on icon toggles (also keeps hover behaviour via CSS)
    const icon = document.getElementById('profile-toggle');
    icon?.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = menu.classList.contains('open');
      toggle(!isOpen);
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!menu.contains(e.target)) toggle(false);
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') toggle(false);
    });
  }
  return { init };
})();

// ─── Back to Top ─────────────────────────────────────────────────
const BackToTop = (() => {
  function init() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;

    window.addEventListener('scroll', () => {
      btn.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  return { init };
})();

// ─── Page Transition ─────────────────────────────────────────────
const PageTransition = (() => {
  function init() {
    const overlay = document.getElementById('page-transition');
    if (!overlay) return;

    // Animate in on load
    overlay.classList.add('in');
    setTimeout(() => overlay.classList.remove('in'), 600);

    // Animate out on navigation
    document.querySelectorAll('a[href]').forEach(link => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto') || href.startsWith('tel') || link.target === '_blank') return;

      link.addEventListener('click', e => {
        e.preventDefault();
        overlay.classList.add('out');
        setTimeout(() => { window.location.href = href; }, 500);
      });
    });
  }

  return { init };
})();

// ─── Ripple Effect ───────────────────────────────────────────────
function addRipple(e) {
  const btn = e.currentTarget;
  const wave = document.createElement('span');
  wave.className = 'ripple-wave';
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  wave.style.cssText = `
    width: ${size}px; height: ${size}px;
    left: ${e.clientX - rect.left - size/2}px;
    top: ${e.clientY - rect.top - size/2}px;
  `;
  btn.appendChild(wave);
  wave.addEventListener('animationend', () => wave.remove());
}

// ─── Toast Notifications ─────────────────────────────────────────
const Toast = (() => {
  function show(message, type = 'info', duration = 3500) {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const icons = { success: '<i class="fa-solid fa-circle-check"></i>', error: '<i class="fa-solid fa-circle-xmark"></i>', warning: '<i class="fa-solid fa-triangle-exclamation"></i>', info: '<i class="fa-solid fa-circle-info"></i>' };
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.innerHTML = `<span>${icons[type]}</span><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(40px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  return { show };
})();

// ─── Spotlight Mouse Effect ───────────────────────────────────────
function initSpotlight() {
  document.querySelectorAll('.spotlight').forEach(el => {
    el.addEventListener('mousemove', e => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      el.style.setProperty('--spot-x', x + 'px');
      el.style.setProperty('--spot-y', y + 'px');
      el.querySelector(':scope > *:first-child')?.style &&
        (el.style.backgroundImage = `radial-gradient(300px circle at ${x}px ${y}px, rgba(184,121,74,0.1), transparent 60%)`);
    });
  });
}

// ─── Keyboard Accessibility ────────────────────────────────────────
function initKeyboardNav() {
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      // Close mobile menu
      const hamburger = document.querySelector('.hamburger.active');
      const mobileMenu = document.querySelector('.mobile-menu.open');
      if (hamburger && mobileMenu) {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      }
    }
  });
}

// ─── LocalStorage Font Size (Accessibility) ────────────────────────
function initFontSize() {
  const saved = localStorage.getItem('cc_fontsize');
  if (saved) document.documentElement.style.fontSize = saved;
}

// ─── Initialize All ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.init();
  RTLManager.init();
  Navbar.init();
  ProfileMenu.init();
  BackToTop.init();
  PageTransition.init();
  initKeyboardNav();
  initFontSize();

  // Bind toggles
  document.querySelectorAll('.theme-toggle').forEach(btn =>
    btn.addEventListener('click', () => ThemeManager.toggle())
  );
  document.querySelectorAll('.rtl-toggle').forEach(btn =>
    btn.addEventListener('click', () => RTLManager.toggle())
  );

  // Ripple on buttons
  document.querySelectorAll('.btn.ripple').forEach(btn =>
    btn.addEventListener('click', addRipple)
  );
});

// Expose globally
window.CanteenCorp = { ThemeManager, RTLManager, Toast };
