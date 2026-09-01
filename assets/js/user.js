/* ============================================================
   CANTEENCORP — USER JS
   Cart, menu tabs, filters, top-up, rating
   ============================================================ */
'use strict';

// ─── Cart Drawer ───────────────────────────────────────────────
const UserCart = (() => {
  let cart = [];
  function updateCount(){
    const el = document.getElementById('cart-count');
    if(el) el.textContent = cart.reduce((s,i)=>s+i.qty,0);
    const totalEl = document.getElementById('cart-total');
    if(totalEl){
      const total = cart.reduce((s,i)=>s+i.price*i.qty,0);
      totalEl.textContent = '₹'+total;
    }
    const empty = document.getElementById('empty-cart');
    if(empty) empty.style.display = cart.length? 'none':'block';
  }
  function render(){
    const container = document.getElementById('cart-items');
    if(!container) return;
    // keep empty placeholder, remove other items
    container.querySelectorAll('.cart-item').forEach(e=>e.remove());
    cart.forEach((item, idx)=>{
      const div=document.createElement('div');
      div.className='cart-item';
      div.innerHTML=`<div style="flex:1"><div style="font-weight:600">${item.name}</div><div style="font-size:var(--text-xs);color:var(--text-muted)">₹${item.price} × ${item.qty}</div></div><div style="display:flex;align-items:center;gap:6px"><button class="btn btn--outline btn--sm" data-dec="${idx}" style="padding:4px 8px">-</button><span style="font-weight:700">${item.qty}</span><button class="btn btn--outline btn--sm" data-inc="${idx}" style="padding:4px 8px">+</button><button class="btn btn--ghost" data-remove="${idx}" style="color:#991B1B"><i class="fa-solid fa-trash"></i></button></div>`;
      container.appendChild(div);
    });
    container.querySelectorAll('[data-inc]').forEach(b=> b.addEventListener('click',()=>{ cart[+b.dataset.inc].qty++; updateCount(); render(); }));
    container.querySelectorAll('[data-dec]').forEach(b=> b.addEventListener('click',()=>{ const i=+b.dataset.dec; if(cart[i].qty>1) cart[i].qty--; else cart.splice(i,1); updateCount(); render(); }));
    container.querySelectorAll('[data-remove]').forEach(b=> b.addEventListener('click',()=>{ cart.splice(+b.dataset.remove,1); updateCount(); render(); }));
    updateCount();
  }
  function add(name, price){
    const exist=cart.find(i=>i.name===name);
    if(exist) exist.qty++; else cart.push({name, price:parseInt(price), qty:1});
    render();
    window.CanteenCorp?.Toast.show(name+' added to cart','success');
    // auto open drawer
    document.getElementById('cart-drawer')?.classList.add('open');
    document.getElementById('cart-overlay').style.display='block';
  }
  function init(){
    document.querySelectorAll('.add-to-cart').forEach(btn=>{
      btn.addEventListener('click',()=> add(btn.dataset.name, btn.dataset.price));
    });
    document.getElementById('cart-btn')?.addEventListener('click',()=>{
      document.getElementById('cart-drawer').classList.add('open');
      document.getElementById('cart-overlay').style.display='block';
    });
    document.getElementById('close-cart')?.addEventListener('click', close);
    document.getElementById('cart-overlay')?.addEventListener('click', close);
    document.getElementById('checkout-btn')?.addEventListener('click',()=>{
      if(!cart.length) return window.CanteenCorp?.Toast.show('Cart is empty','warning');
      window.CanteenCorp?.Toast.show('Order placed! Token #'+Math.floor(Math.random()*900+100)+' — ₹'+cart.reduce((s,i)=>s+i.price*i.qty,0),'success');
      cart=[]; render(); close();
    });
    function close(){
      document.getElementById('cart-drawer')?.classList.remove('open');
      const ov=document.getElementById('cart-overlay'); if(ov) ov.style.display='none';
    }
  }
  return { init, add };
})();

// ─── Menu Tabs ─────────────────────────────────────────────────
function initMenuTabs(){
  const tabs=document.querySelectorAll('#meal-tabs .tab-btn');
  const panels=document.querySelectorAll('.tab-panel');
  if(!tabs.length) return;
  tabs.forEach(tab=>{
    tab.addEventListener('click',()=>{
      tabs.forEach(t=>t.classList.remove('active'));
      tab.classList.add('active');
      const id='panel-'+tab.dataset.tab;
      panels.forEach(p=> p.classList.toggle('active', p.id===id));
      // also toggle display via css relies on .active
      panels.forEach(p=> p.style.display = p.classList.contains('active') ? 'block' : 'none');
    });
  });
  // init display
  panels.forEach(p=>{
    if(!p.classList.contains('active')) p.style.display='none';
  });
}

// ─── Menu Search & Filter ─────────────────────────────────────
function initMenuSearch(){
  const input=document.getElementById('menu-search');
  if(!input) return;
  input.addEventListener('input',()=>{
    const q=input.value.toLowerCase();
    document.querySelectorAll('.menu-card').forEach(card=>{
      const text=card.textContent.toLowerCase();
      card.style.display=text.includes(q)?'':'none';
    });
  });
  // veg/healthy filter
  document.querySelectorAll('[data-filter]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      document.querySelectorAll('[data-filter]').forEach(b=> b.classList.remove('active'));
      btn.classList.add('active');
      const f=btn.dataset.filter;
      document.querySelectorAll('.menu-card').forEach(card=>{
        if(f==='all') card.style.display='';
        else {
          const tags=card.dataset.tags||'';
          card.style.display= tags.includes(f) ? '' : 'none';
        }
      });
    });
  });
}

// ─── Orders Filter ─────────────────────────────────────────────
function initOrdersFilter(){
  const btns=document.querySelectorAll('.filter-btn');
  const rows=document.querySelectorAll('#orders-table tbody tr');
  if(!btns.length||!rows.length) return;
  btns.forEach(btn=>{
    btn.addEventListener('click',()=>{
      btns.forEach(b=>{ b.classList.remove('active'); b.classList.remove('btn--primary'); b.classList.add('btn--outline'); });
      btn.classList.add('active'); btn.classList.add('btn--primary'); btn.classList.remove('btn--outline');
      const f=btn.dataset.filter;
      rows.forEach(r=>{
        if(f==='all') r.style.display='';
        else r.style.display = (r.dataset.status===f) ? '' : 'none';
      });
    });
  });
}

// ─── Rating Stars ──────────────────────────────────────────────
function initRating(){
  const stars=document.querySelectorAll('#rating-stars i');
  if(!stars.length) return;
  stars.forEach(s=>{
    s.addEventListener('click',()=>{
      const r=+s.dataset.rate;
      stars.forEach((el,i)=>{
        el.className = i<r ? 'fa-solid fa-star' : 'fa-regular fa-star';
        el.style.color = i<r ? '#facc15' : '#d1d5db';
      });
    });
    s.addEventListener('mouseenter',()=>{
      const r=+s.dataset.rate;
      stars.forEach((el,i)=>{
        el.style.color = i<r ? '#facc15' : '#d1d5db';
      });
    });
  });
  document.getElementById('rating-stars')?.addEventListener('mouseleave',()=>{
    // keep selected? rely on solid vs regular
  });
}

// ─── Wallet Top-up Modal ───────────────────────────────────────
function initWallet(){
  const modal=document.getElementById('topup-modal');
  if(!modal) return;
  document.getElementById('close-topup')?.addEventListener('click',()=> modal.style.display='none');
  modal.addEventListener('click', e=>{ if(e.target===modal) modal.style.display='none'; });
  document.querySelectorAll('.topup-preset').forEach(btn=>{
    btn.addEventListener('click',()=>{
      document.querySelectorAll('.topup-preset').forEach(b=> b.classList.remove('btn--primary'));
      btn.classList.add('btn--primary');
      const amt=btn.dataset.amount;
      const input=document.getElementById('topup-amount');
      if(input) input.value=amt;
    });
  });
}

document.addEventListener('DOMContentLoaded',()=>{
  UserCart.init();
  initMenuTabs();
  initMenuSearch();
  initOrdersFilter();
  initRating();
  initWallet();
});
