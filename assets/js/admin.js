/* ============================================================
   CANTEENCORP — ADMIN JS
   Dashboard interactivity, sidebar, tables, filters
   ============================================================ */

'use strict';

// ─── Admin Sidebar ─────────────────────────────────────────────
const AdminSidebar = (() => {
  function init() {
    const sidebar = document.querySelector('.admin-sidebar');
    const toggleBtn = document.querySelector('#sidebar-toggle');
    const overlay = document.querySelector('#sidebar-overlay');

    if (!sidebar) return;
    // Init ARIA
    if (toggleBtn) { toggleBtn.setAttribute('aria-expanded', 'false'); toggleBtn.setAttribute('aria-label', 'Open sidebar'); }

    function open()  {
      sidebar.classList.add('open');
      if (overlay) { overlay.classList.add('visible'); overlay.style.display = 'block'; }
      toggleBtn?.classList.add('active');
      if (toggleBtn) { toggleBtn.setAttribute('aria-expanded', 'true'); toggleBtn.setAttribute('aria-label', 'Close sidebar'); }
      document.body.style.overflow = 'hidden';
    }
    function close() {
      sidebar.classList.remove('open');
      if (overlay) { overlay.classList.remove('visible'); overlay.style.display = 'none'; }
      toggleBtn?.classList.remove('active');
      if (toggleBtn) { toggleBtn.setAttribute('aria-expanded', 'false'); toggleBtn.setAttribute('aria-label', 'Open sidebar'); }
      document.body.style.overflow = '';
    }

    toggleBtn?.addEventListener('click', () => sidebar.classList.contains('open') ? close() : open());
    overlay?.addEventListener('click', close);
    // Close when a sidebar nav link is clicked (mobile) — also resets ham
    sidebar.querySelectorAll('.admin-nav-item').forEach(a => a.addEventListener('click', () => {
      if (window.innerWidth <= 1024) close();
    }));
    // Escape closes sidebar and resets ham to 3 bars
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && sidebar.classList.contains('open')) close();
    });

    // Active nav item
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    sidebar.querySelectorAll('.admin-nav-item[href]').forEach(link => {
      const href = link.getAttribute('href').split('/').pop();
      if (href === currentPage) link.classList.add('active');
    });
  }

  return { init };
})();

// ─── Sortable Table ────────────────────────────────────────────
const SortableTable = (() => {
  function init(tableId) {
    const table = document.getElementById(tableId);
    if (!table) return;

    const headers = table.querySelectorAll('th[data-sort]');
    let sortCol = null, sortDir = 1;

    headers.forEach(th => {
      th.style.cursor = 'pointer';
      th.addEventListener('click', () => {
        const col = th.dataset.sort;
        if (sortCol === col) { sortDir = -sortDir; }
        else { sortCol = col; sortDir = 1; }

        headers.forEach(h => h.classList.remove('sort-asc', 'sort-desc'));
        th.classList.add(sortDir === 1 ? 'sort-asc' : 'sort-desc');

        const tbody = table.querySelector('tbody');
        const rows = [...tbody.querySelectorAll('tr')];
        const colIndex = [...th.parentElement.children].indexOf(th);

        rows.sort((a, b) => {
          const aVal = a.children[colIndex]?.textContent.trim() || '';
          const bVal = b.children[colIndex]?.textContent.trim() || '';
          const aNum = parseFloat(aVal.replace(/[^0-9.-]/g, ''));
          const bNum = parseFloat(bVal.replace(/[^0-9.-]/g, ''));
          if (!isNaN(aNum) && !isNaN(bNum)) return (aNum - bNum) * sortDir;
          return aVal.localeCompare(bVal) * sortDir;
        });

        tbody.append(...rows);
      });
    });
  }

  return { init };
})();

// ─── Search / Filter Table ─────────────────────────────────────
function initTableSearch(inputId, tableId) {
  const input = document.getElementById(inputId);
  const table = document.getElementById(tableId);
  if (!input || !table) return;

  input.addEventListener('input', () => {
    const query = input.value.toLowerCase();
    table.querySelectorAll('tbody tr').forEach(row => {
      row.style.display = row.textContent.toLowerCase().includes(query) ? '' : 'none';
    });
  });
}

// ─── Export Table to CSV ───────────────────────────────────────
function exportCSV(tableId, filename = 'export.csv') {
  const table = document.getElementById(tableId);
  if (!table) return;

  const rows = [...table.querySelectorAll('tr')];
  const csv = rows.map(row =>
    [...row.querySelectorAll('th, td')]
      .map(cell => `"${cell.textContent.replace(/"/g, '""').trim()}"`)
      .join(',')
  ).join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  window.CanteenCorp?.Toast.show('CSV exported successfully!', 'success');
}

// ─── Menu Planner (Drag & Drop) ─────────────────────────────────
const MenuPlanner = (() => {
  let dragItem = null;

  function init() {
    const planner = document.querySelector('.menu-planner-board');
    if (!planner) return;

    planner.querySelectorAll('.planner-meal').forEach(meal => {
      meal.setAttribute('draggable', 'true');
      meal.addEventListener('dragstart', e => {
        dragItem = meal;
        e.dataTransfer.effectAllowed = 'move';
        meal.style.opacity = '0.5';
      });
      meal.addEventListener('dragend', () => {
        if (dragItem) dragItem.style.opacity = '';
        dragItem = null;
        planner.querySelectorAll('.planner-cell').forEach(c => c.classList.remove('drag-over'));
      });
    });

    planner.querySelectorAll('.planner-cell').forEach(cell => {
      cell.addEventListener('dragover', e => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        cell.classList.add('drag-over');
      });
      cell.addEventListener('dragleave', () => cell.classList.remove('drag-over'));
      cell.addEventListener('drop', e => {
        e.preventDefault();
        cell.classList.remove('drag-over');
        if (dragItem) {
          cell.appendChild(dragItem);
          dragItem.style.opacity = '';
          dragItem = null;
          window.CanteenCorp?.Toast.show('Meal moved successfully!', 'success');
        }
      });
    });
  }

  return { init };
})();

// ─── Wallet Top-up Modal ───────────────────────────────────────
function initWalletActions() {
  const topupBtns = document.querySelectorAll('[data-topup]');
  topupBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const empName = btn.dataset.topup;
      const modal = document.getElementById('topup-modal');
      if (modal) {
        modal.querySelector('[data-emp-name]').textContent = empName;
        modal.style.display = 'flex';
      }
    });
  });

  document.getElementById('close-topup-modal')?.addEventListener('click', () => {
    document.getElementById('topup-modal').style.display = 'none';
  });
}

// ─── Date Range Filter ─────────────────────────────────────────
function initDateFilters() {
  const presets = document.querySelectorAll('[data-date-preset]');
  presets.forEach(btn => {
    btn.addEventListener('click', () => {
      presets.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      window.CanteenCorp?.Toast.show(`Data filtered: ${btn.textContent}`, 'info');
    });
  });
}

// ─── Print Report ─────────────────────────────────────────────
document.querySelectorAll('.print-report-btn')?.forEach(btn => {
  btn.addEventListener('click', () => window.print());
});

// ─── Real-time Clock ──────────────────────────────────────────
function initClock() {
  const el = document.getElementById('admin-clock');
  if (!el) return;
  const update = () => {
    const now = new Date();
    el.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  setInterval(update, 1000);
  update();
}

// ─── Notification Bell ────────────────────────────────────────
function initNotifications() {
  const bell = document.getElementById('notif-bell');
  const dropdown = document.getElementById('notif-dropdown');
  if (!bell || !dropdown) return;

  function show() {
    dropdown.style.display = 'block';
    dropdown.classList.add('visible');
  }
  function hide() {
    dropdown.style.display = 'none';
    dropdown.classList.remove('visible');
  }
  function toggle(e) {
    e.stopPropagation();
    if (dropdown.style.display === 'block' && dropdown.classList.contains('visible')) hide();
    else show();
  }

  bell.addEventListener('click', toggle);
  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target) && e.target !== bell) hide();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hide(); });
  // Keep dropdown hidden on load
  hide();
}

// ─── Initialize ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  AdminSidebar.init();
  MenuPlanner.init();
  initDateFilters();
  initClock();
  initNotifications();

  // Auto-init sortable tables
  document.querySelectorAll('table[data-sortable]').forEach(t => SortableTable.init(t.id));

  // Auto-init search boxes
  document.querySelectorAll('[data-search-table]').forEach(input => {
    initTableSearch(input.id, input.dataset.searchTable);
  });

  // Export buttons
  document.querySelectorAll('[data-export]').forEach(btn => {
    btn.addEventListener('click', () => exportCSV(btn.dataset.export, btn.dataset.filename));
  });

  initWalletActions();
});

window.CanteenAdmin = { SortableTable, MenuPlanner, exportCSV };
