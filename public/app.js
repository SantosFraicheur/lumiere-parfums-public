// ============================================================
//  LUMIÈRE — Frontend JavaScript
//  Stockage fichiers : Cloudinary via /api/upload
// ============================================================

// ── État global ───────────────────────────────────────────────
let state = {
  currentUser    : null,
  isAdmin        : false,
  adminToken     : null,
  userToken      : null,
  adminUsername  : null,
  cart           : [],
  videos         : [],
  proofUrl       : null,
  products       : [],
  orders         : [],
  customers      : [],
  settings       : { bankName:'', bankAccount:'', bankHolder:'', bankMobile:'' },
  currentEditProductId : null,
  currentUpdateOrderId : null,
};

let newProdFiles  = [];
let editProdFiles = [];

// ── Helpers ───────────────────────────────────────────────────
function genId()       { return 'CMD-' + Date.now().toString().slice(-6); }
function genTracking() { return 'LUM-' + Date.now().toString().slice(-6); }

function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function saveState() {
  localStorage.setItem('lumiere_state', JSON.stringify({
    currentUser  : state.currentUser,
    cart         : state.cart,
    isAdmin      : state.isAdmin,
    adminToken   : state.adminToken,
    userToken    : state.userToken,
    adminUsername: state.adminUsername,
  }));
}

function loadState() {
  try {
    const s = JSON.parse(localStorage.getItem('lumiere_state') || '{}');
    state.currentUser   = s.currentUser   || null;
    state.cart          = s.cart          || [];
    state.isAdmin       = s.isAdmin       || false;
    state.adminToken    = s.adminToken    || null;
    state.userToken     = s.userToken     || null;
    state.adminUsername = s.adminUsername || null;
  } catch (_) {}
}

// ── Headers ───────────────────────────────────────────────────
function userHeaders()  {
  const h = { 'Content-Type': 'application/json' };
  if (state.userToken)  h['Authorization'] = 'Bearer ' + state.userToken;
  return h;
}
function adminHeaders() {
  const h = { 'Content-Type': 'application/json' };
  if (state.adminToken) h['Authorization'] = 'Bearer ' + state.adminToken;
  return h;
}

// ── Init ──────────────────────────────────────────────────────
window.onload = () => {
  loadState();
  listenProducts();
  listenOrders();
  listenSettings();
  listenVideos();
  updateCartCount();
  updateNavUser();
  setInterval(() => { listenProducts(); listenOrders(); listenVideos(); }, 8000);
};

// ════════════════════════════════════════════════════════════
//  UPLOAD CLOUDINARY
// ════════════════════════════════════════════════════════════

// Lit un fichier en base64 (data URI)
function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload  = e => resolve(e.target.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

// Envoie un fichier (data URI) au serveur → Cloudinary → URL permanente
async function uploadToCloud(dataUri, resourceType = 'auto', token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = 'Bearer ' + token;
  const res  = await fetch('/api/upload', {
    method : 'POST',
    headers,
    body   : JSON.stringify({ data: dataUri, resourceType }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erreur upload');
  return data.url;
}

async function uploadProofToCloud(dataUri) {
  const res  = await fetch('/api/upload/proof', {
    method : 'POST',
    headers: userHeaders(),
    body   : JSON.stringify({ data: dataUri }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erreur upload preuve');
  return data.url;
}

// ════════════════════════════════════════════════════════════
//  NAVIGATION
// ════════════════════════════════════════════════════════════
function showPage(name) {
  if (name === 'payment' && !state.currentUser) {
    showToast('Connexion requise pour payer', 'error');
    return showPage('auth');
  }
  if (name === 'tracking' && !state.currentUser) {
    showToast('Connexion requise', 'error');
    return showPage('auth');
  }
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById('page-' + name);
  if (page) page.classList.add('active');
  if (name === 'boutique') renderProducts();
  if (name === 'cart')     renderCart();
  if (name === 'tracking') renderTracking();
}

function requireAuth(callback) {
  if (state.currentUser) callback();
  else { showToast('Veuillez vous connecter', 'warning'); showPage('auth'); }
}

// ════════════════════════════════════════════════════════════
//  TOAST
// ════════════════════════════════════════════════════════════
function showToast(msg, type = 'info') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className   = 'toast show ' + type;
  setTimeout(() => t.className = 'toast', 3500);
}

// ════════════════════════════════════════════════════════════
//  AUTH CLIENTS
// ════════════════════════════════════════════════════════════
function switchAuthTab(tab) {
  document.getElementById('form-login').style.display    = tab === 'login'    ? 'block' : 'none';
  document.getElementById('form-register').style.display = tab === 'register' ? 'block' : 'none';
  document.getElementById('tab-login').classList.toggle('active',    tab === 'login');
  document.getElementById('tab-register').classList.toggle('active', tab === 'register');
}

async function doLogin() {
  const email = document.getElementById('login-email').value.trim();
  const pass  = document.getElementById('login-password').value;
  if (!email || !pass) { showToast('Remplissez tous les champs', 'error'); return; }
  try {
    const res  = await fetch('/api/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass })
    });
    const data = await res.json();
    if (!res.ok) { showToast(data.error || 'Erreur connexion', 'error'); return; }
    state.currentUser = data.user;
    state.userToken   = data.token;
    saveState(); updateNavUser();
    showToast('Bienvenue ' + data.user.name + ' !', 'success');
    state.cart.length > 0 ? showPage('payment') : showPage('boutique');
  } catch { showToast('Erreur réseau', 'error'); }
}

async function doRegister() {
  const name    = document.getElementById('reg-name').value.trim();
  const email   = document.getElementById('reg-email').value.trim();
  const phone   = document.getElementById('reg-phone').value.trim();
  const address = document.getElementById('reg-address').value.trim();
  const pass    = document.getElementById('reg-password').value;
  if (!name || !email || !phone || !address || !pass) {
    showToast('Tous les champs sont requis', 'error'); return;
  }
  try {
    const res  = await fetch('/api/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, address, password: pass })
    });
    const data = await res.json();
    if (!res.ok) { showToast(data.error || 'Erreur inscription', 'error'); return; }
    state.currentUser = data.user;
    state.userToken   = data.token;
    saveState(); updateNavUser();
    showToast('Compte créé ! Bienvenue ' + name, 'success');
    state.cart.length > 0 ? showPage('payment') : showPage('boutique');
  } catch { showToast('Erreur réseau', 'error'); }
}

function updateNavUser() {
  const sec = document.getElementById('nav-user-section');
  if (state.currentUser) {
    sec.innerHTML = `
      <span style="color:var(--gold);font-size:12px;letter-spacing:1px">
        👤 ${escHtml(state.currentUser.name.split(' ')[0])}
      </span>
      &nbsp;<button class="btn-nav" onclick="logout()">Déconnexion</button>`;
  } else {
    sec.innerHTML = `<button class="btn-nav" onclick="showPage('auth')">Connexion</button>`;
  }
}

function logout() {
  state.currentUser = null; state.userToken = null;
  saveState(); updateNavUser();
  showToast('Déconnecté', 'info'); showPage('home');
}

// ════════════════════════════════════════════════════════════
//  PRODUITS
// ════════════════════════════════════════════════════════════
async function listenProducts() {
  try {
    const data = await fetch('/api/products').then(r => r.json());
    state.products = data;
    renderProducts();
    if (state.isAdmin) renderAdminProducts();
  } catch (_) {}
}

function renderProducts() {
  const grid = document.getElementById('products-grid');
  if (!grid) return;
  grid.innerHTML = state.products.map(p => `
    <div class="product-card">
      <div class="product-img-wrap">
        ${p.images && p.images.length > 0
          ? `<img src="${p.images[0]}" alt="${escHtml(p.name)}">`
          : `<div class="product-img-placeholder"><span class="icon">${p.emoji || '🌸'}</span><span>${escHtml(p.category)}</span></div>`}
      </div>
      <div class="product-info">
        <div class="product-tag">${escHtml(p.category)} — ${escHtml(p.quantite)}</div>
        <div class="product-name">${escHtml(p.name)}</div>
        <div class="product-desc">${escHtml(p.desc || p.description || '')}</div>
        <div class="product-price">${p.price.toLocaleString('fr-FR')} $</div>
        <button class="btn-add-cart" onclick="addToCart(${p.id})">Ajouter au Panier</button>
      </div>
    </div>
  `).join('');
}

// ════════════════════════════════════════════════════════════
//  PANIER
// ════════════════════════════════════════════════════════════
function addToCart(productId) {
  const prod = state.products.find(p => p.id === productId);
  if (!prod) return;
  const existing = state.cart.find(i => i.id === productId);
  if (existing) existing.qty++;
  else state.cart.push({ ...prod, qty: 1 });
  saveState(); updateCartCount();
  showToast(escHtml(prod.name) + ' ajouté au panier ✓', 'success');
}

function updateCartCount() {
  const count = state.cart.reduce((s, i) => s + i.qty, 0);
  document.getElementById('cart-count').textContent = count;
}

function renderCart() {
  const content = document.getElementById('cart-content');
  if (state.cart.length === 0) {
    content.innerHTML = `
      <div class="cart-empty">
        <p>Votre panier est vide</p>
        <button class="btn-primary" onclick="showPage('boutique')">Découvrir la Collection</button>
      </div>`; return;
  }
  const total = state.cart.reduce((s, i) => s + i.price * i.qty, 0);
  content.innerHTML = state.cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-img">
        ${item.images && item.images.length > 0
          ? `<img src="${item.images[0]}" alt="${escHtml(item.name)}">`
          : item.emoji || '🌸'}
      </div>
      <div class="cart-item-info">
        <div class="cart-item-name">${escHtml(item.name)}</div>
        <div class="cart-item-price">${item.price.toLocaleString('fr-FR')} $</div>
      </div>
      <div class="cart-item-qty">
        <button class="qty-btn" onclick="changeQty(${item.id}, -1)">−</button>
        <span>${item.qty}</span>
        <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
      </div>
      <span style="color:var(--gold);font-family:'Cormorant Garamond',serif;font-size:20px;min-width:120px;text-align:right">
        ${(item.price * item.qty).toLocaleString('fr-FR')} $
      </span>
      <button class="remove-btn" onclick="removeFromCart(${item.id})">🗑</button>
    </div>
  `).join('') + `
    <div class="cart-total">
      <span class="cart-total-label">Total</span>
      <span class="cart-total-amount">${total.toLocaleString('fr-FR')} $</span>
    </div>
    <div style="margin-top:20px;text-align:center">
      <button class="btn-primary" style="width:100%" onclick="goToPayment()">Passer au paiement</button>
    </div>`;
}

function changeQty(id, delta) {
  const item = state.cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) state.cart = state.cart.filter(i => i.id !== id);
  updateCartCount(); renderCart(); saveState();
}

function removeFromCart(id) {
  state.cart = state.cart.filter(i => i.id !== id);
  updateCartCount(); renderCart(); saveState();
}

function goToPayment() {
  if (state.cart.length === 0) { showToast('Panier vide', 'error'); return; }
  if (!state.currentUser) { showToast('Connexion requise', 'warning'); showPage('auth'); return; }
  renderPayment(); showPage('payment');
}

// ════════════════════════════════════════════════════════════
//  PAIEMENT
// ════════════════════════════════════════════════════════════
function renderPayment() {
  const total   = state.cart.reduce((s, i) => s + i.price * i.qty, 0);
  const s       = state.settings || {};
  document.getElementById('payment-summary').innerHTML = `
    <h3 style="font-family:'Cormorant Garamond',serif;font-size:20px;color:var(--cream);margin-bottom:16px">Récapitulatif</h3>
    ${state.cart.map(i => `
      <div class="summary-line">
        <span>${escHtml(i.name)} × ${i.qty}</span>
        <span>${(i.price * i.qty).toLocaleString('fr-FR')} $</span>
      </div>`).join('')}
    <div class="summary-total">
      <span>Total à Virer</span>
      <span>${total.toLocaleString('fr-FR')} $</span>
    </div>`;
  if (state.currentUser) {
    document.getElementById('delivery-address').value = state.currentUser.address || '';
  }
  document.querySelector('.payment-info-box').innerHTML = `
    <h3>Coordonnées Bancaires</h3>
    <div class="bank-detail"><span class="bank-label">Banque</span><span class="bank-value">${escHtml(s.bankName    || 'Non défini')}</span></div>
    <div class="bank-detail"><span class="bank-label">Numéro de Compte</span><span class="bank-value">${escHtml(s.bankAccount || 'Non défini')}</span></div>
    <div class="bank-detail"><span class="bank-label">Titulaire</span><span class="bank-value">${escHtml(s.bankHolder  || 'Non défini')}</span></div>
    <div class="bank-detail"><span class="bank-label">Mobile Money</span><span class="bank-value">${escHtml(s.bankMobile  || 'Non défini')}</span></div>`;
}

// Preuve de paiement : upload immédiat vers Cloudinary
async function handleProofUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  const nameEl = document.getElementById('proof-name');
  const zone   = document.getElementById('proof-zone');
  nameEl.textContent = '⏳ Envoi en cours…';
  nameEl.style.display = 'block';
  zone.style.borderColor = 'var(--gold)';
  try {
    const dataUri      = await readFileAsDataUrl(file);
    const url          = await uploadProofToCloud(dataUri);
    state.proofUrl     = url;
    nameEl.textContent       = '✓ Preuve envoyée';
    zone.style.borderColor   = 'var(--green)';
  } catch (err) {
    state.proofUrl     = null;
    nameEl.textContent       = '✗ Erreur : ' + err.message;
    zone.style.borderColor   = 'var(--red)';
  }
}

async function submitOrder() {
  if (!state.proofUrl) { showToast('Ajoutez une preuve de paiement', 'error'); return; }
  const address = document.getElementById('delivery-address').value.trim();
  if (!address) { showToast('Adresse requise', 'error'); return; }
  const total = state.cart.reduce((s, i) => s + i.price * i.qty, 0);
  const order = {
    id          : genId(),
    customer    : state.currentUser.name,
    items       : state.cart,
    total,
    proofUrl    : state.proofUrl,
    trackingCode: genTracking(),
    address,
  };
  try {
    const res = await fetch('/api/orders', {
      method: 'POST', headers: userHeaders(), body: JSON.stringify(order)
    });
    if (!res.ok) {
      const d = await res.json();
      if (res.status === 401) { showToast('Session expirée', 'error'); logout(); return; }
      showToast(d.error || 'Erreur commande', 'error'); return;
    }
    state.cart     = [];
    state.proofUrl = null;
    updateCartCount(); saveState();
    showPage('tracking');
    showToast('Commande envoyée ✔', 'success');
    listenOrders();
  } catch { showToast('Erreur commande', 'error'); }
}

// ════════════════════════════════════════════════════════════
//  SUIVI
// ════════════════════════════════════════════════════════════
async function listenOrders() {
  if (!state.currentUser && !state.isAdmin) return;
  try {
    const url     = state.isAdmin ? '/api/orders' : '/api/orders/me';
    const headers = state.isAdmin ? adminHeaders() : userHeaders();
    const res     = await fetch(url, { headers });
    if (!res.ok) return;
    state.orders  = await res.json();
    renderTracking();
    if (state.isAdmin) { renderAdminOrders(); renderAdminDashboard(); }
  } catch (_) {}
}

function renderTracking() {
  if (!state.currentUser) return;
  const box    = document.getElementById('tracking-content');
  const orders = state.isAdmin
    ? state.orders
    : state.orders.filter(o => (o.userId || o.userid) === state.currentUser.email);
  if (orders.length === 0) { box.innerHTML = `<p style="text-align:center">Aucune commande</p>`; return; }
  const statusMap = { pending:'⏳ Paiement en attente', confirmed:'✅ Confirmé', shipping:'🚚 En livraison', delivered:'📬 Livré' };
  box.innerHTML = orders.map(o => `
    <div style="margin-bottom:20px;text-align:center;padding:20px;background:var(--dark-2);border-radius:10px">
      <h3 style="color:var(--gold)">${escHtml(o.trackingCode || o.trackingcode)}</h3>
      <p style="margin:8px 0">${(o.items||[]).map(i => escHtml(i.product_name) + ' x' + i.quantity).join(', ')}</p>
      <p style="color:gold">${o.total.toLocaleString()} $</p>
      <p style="margin-top:8px;font-size:16px">${statusMap[o.status] || escHtml(o.status)}</p>
    </div>
  `).join('');
}

async function searchTracking() {
  const code      = document.getElementById('tracking-input').value.trim();
  const resultBox = document.getElementById('tracking-result');
  if (!code) { showToast('Entrez un code', 'error'); return; }
  try {
    const res   = await fetch('/api/orders/track?code=' + encodeURIComponent(code));
    const order = await res.json();
    if (!res.ok) { resultBox.innerHTML = `<p style="text-align:center;color:red">Commande introuvable</p>`; return; }
    const statusMap = { pending:'⏳ Paiement en attente', confirmed:'✅ Confirmé', shipping:'🚚 En livraison', delivered:'📬 Livré' };
    resultBox.innerHTML = `
      <div style="text-align:center;padding:20px;background:var(--dark-2);border-radius:10px">
        <h3 style="color:var(--gold)">${escHtml(order.trackingCode || order.trackingcode)}</h3>
        <p style="font-size:18px;margin-top:10px">${statusMap[order.status] || escHtml(order.status)}</p>
        <p style="margin-top:10px">${(order.items||[]).map(i => escHtml(i.product_name) + ' x' + i.quantity).join(', ')}</p>
        <p style="color:var(--gold);margin-top:10px">${order.total.toLocaleString('fr-FR')} $</p>
      </div>`;
  } catch { showToast('Erreur recherche', 'error'); }
}

// ════════════════════════════════════════════════════════════
//  PARAMÈTRES
// ════════════════════════════════════════════════════════════
async function listenSettings() {
  try {
    state.settings = await fetch('/api/settings').then(r => r.json());
  } catch (_) {}
}

function loadSettings() {
  const s = state.settings || {};
  document.getElementById('s-bank-name').value    = s.bankName    || '';
  document.getElementById('s-bank-account').value = s.bankAccount || '';
  document.getElementById('s-bank-holder').value  = s.bankHolder  || '';
  document.getElementById('s-bank-mobile').value  = s.bankMobile  || '';
}

async function saveSettings() {
  const settings = {
    bankName   : document.getElementById('s-bank-name').value,
    bankAccount: document.getElementById('s-bank-account').value,
    bankHolder : document.getElementById('s-bank-holder').value,
    bankMobile : document.getElementById('s-bank-mobile').value,
  };
  try {
    const res = await fetch('/api/settings', {
      method: 'POST', headers: adminHeaders(), body: JSON.stringify(settings)
    });
    if (!res.ok) { showToast('Erreur sauvegarde', 'error'); return; }
    state.settings = settings;
    showToast('Paramètres sauvegardés ✔', 'success');
  } catch { showToast('Erreur sauvegarde', 'error'); }
}

// ════════════════════════════════════════════════════════════
//  ADMIN — Login
// ════════════════════════════════════════════════════════════
async function doAdminLogin() {
  const u = document.getElementById('admin-user').value;
  const p = document.getElementById('admin-pass').value;
  try {
    const res  = await fetch('/api/admin/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: u, password: p })
    });
    const data = await res.json();
    if (!res.ok) { showToast(data.error || 'Identifiants incorrects', 'error'); return; }
    state.isAdmin = true; state.adminToken = data.token; state.adminUsername = u;
    saveState();
    listenOrders(); listenProducts(); fetchCustomers();
    showPage('admin'); renderAdminDashboard();
    showToast('Bienvenue Administrateur', 'success');
  } catch { showToast('Erreur réseau', 'error'); }
}

function adminLogout() {
  state.isAdmin = false; state.adminToken = null; state.adminUsername = null; state.orders = [];
  saveState(); showPage('home'); showToast('Déconnecté', 'info');
}

function adminSection(name) {
  document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
  document.getElementById('admin-' + name).classList.add('active');
  document.querySelectorAll('.admin-nav-item').forEach(i => i.classList.remove('active'));
  const nav = document.querySelector(`.admin-nav-item[onclick="adminSection('${name}')"]`);
  if (nav) nav.classList.add('active');
  if (name === 'settings') loadSettings();
}

// ── Dashboard ─────────────────────────────────────────────────
function renderAdminDashboard() {
  const pending   = state.orders.filter(o => o.status === 'pending').length;
  const confirmed = state.orders.filter(o => o.status === 'confirmed').length;
  const revenue   = state.orders
    .filter(o => ['confirmed','shipping','delivered'].includes(o.status))
    .reduce((s, o) => s + o.total, 0);
  document.getElementById('admin-stats').innerHTML = `
    <div class="stat-card"><div class="stat-label">Commandes Totales</div><div class="stat-value">${state.orders.length}</div></div>
    <div class="stat-card"><div class="stat-label">En Attente</div><div class="stat-value" style="color:var(--orange)">${pending}</div></div>
    <div class="stat-card"><div class="stat-label">Confirmées</div><div class="stat-value" style="color:var(--green)">${confirmed}</div></div>
    <div class="stat-card"><div class="stat-label">Produits</div><div class="stat-value">${state.products.length}</div></div>
    <div class="stat-card"><div class="stat-label">Clients</div><div class="stat-value">${state.customers.length}</div></div>
    <div class="stat-card"><div class="stat-label">Chiffre d'Affaires</div><div class="stat-value" style="font-size:28px">${(revenue/1000).toFixed(0)}K</div><div class="stat-sub">$ confirmé</div></div>`;
}

// ── Commandes admin ───────────────────────────────────────────
function renderAdminOrders() {
  const tbody = document.getElementById('orders-tbody');
  if (!tbody) return;
  tbody.innerHTML = state.orders.map(o => {
    const tid = escHtml(o.id);
    const tc  = escHtml(o.trackingCode || o.trackingcode || '');
    return `
    <tr>
      <td style="color:var(--gold);font-family:'Cormorant Garamond',serif">${tid}</td>
      <td><div>${escHtml(o.customer)}</div><div style="font-size:11px;color:var(--text-dim)">${escHtml(o.userId || o.userid || '')}</div></td>
      <td style="font-size:12px">${(o.items||[]).map(i => escHtml(i.product_name) + ' ×' + i.quantity).join('<br>')}</td>
      <td style="color:var(--gold);font-family:'Cormorant Garamond',serif">${o.total.toLocaleString('fr-FR')} $</td>
      <td>${o.proof_url
          ? `<img class="proof-thumb" src="${o.proof_url}" onclick="viewProof('${tid}')">`
          : '<span style="color:var(--text-dim);font-size:11px">Aucune</span>'}</td>
      <td><span class="status-badge badge-${o.status}">${
          o.status==='pending'?'⏳ Attente':o.status==='confirmed'?'✅ Confirmé':o.status==='shipping'?'🚚 Livraison':'📬 Livré'}</span></td>
      <td style="display:flex;gap:6px;flex-wrap:wrap">
        ${o.status==='pending' && o.proof_url?`<button class="action-btn btn-validate" onclick="validateOrder('${tid}')">Valider</button>`:''}
        <button class="action-btn btn-update" onclick="openStatusModal('${tid}')">Statut</button>
        <button class="action-btn btn-danger"  onclick="deleteOrder('${tid}')">Supprimer</button>
      </td>
    </tr>`;
  }).join('');
}

function viewProof(orderId) {
  const order = state.orders.find(o => o.id === orderId);
  if (!order || !order.proof_url) return;
  document.getElementById('modal-proof-img').src = order.proof_url;
  document.getElementById('modal-proof').classList.add('open');
}

async function validateOrder(orderId) {
  try {
    const res = await fetch('/api/orders/' + encodeURIComponent(orderId), {
      method: 'PUT', headers: adminHeaders(), body: JSON.stringify({ status: 'confirmed' })
    });
    if (!res.ok) { showToast('Erreur validation', 'error'); return; }
    showToast('Commande ' + orderId + ' validée !', 'success'); listenOrders();
  } catch { showToast('Erreur validation', 'error'); }
}

function openStatusModal(orderId) {
  state.currentUpdateOrderId = orderId;
  const order = state.orders.find(o => o.id === orderId);
  if (order) document.getElementById('modal-status-select').value = order.status;
  document.getElementById('modal-status').classList.add('open');
}

async function confirmStatusUpdate() {
  const orderId   = state.currentUpdateOrderId;
  const newStatus = document.getElementById('modal-status-select').value;
  try {
    const res = await fetch('/api/orders/' + encodeURIComponent(orderId), {
      method: 'PUT', headers: adminHeaders(), body: JSON.stringify({ status: newStatus })
    });
    if (!res.ok) { showToast('Erreur statut', 'error'); return; }
    closeModal('modal-status'); showToast('Statut mis à jour ✔', 'success'); listenOrders();
  } catch { showToast('Erreur statut', 'error'); }
}

async function deleteOrder(orderId) {
  if (!confirm('Supprimer cette commande ?')) return;
  try {
    const res = await fetch('/api/orders/' + encodeURIComponent(orderId), {
      method: 'DELETE', headers: adminHeaders()
    });
    if (!res.ok) { showToast('Erreur suppression', 'error'); return; }
    showToast('Commande supprimée', 'info'); listenOrders();
  } catch { showToast('Erreur suppression', 'error'); }
}

// ── Produits admin ────────────────────────────────────────────
function renderAdminProducts() {
  const grid = document.getElementById('admin-products-grid');
  if (!grid) return;
  grid.innerHTML = state.products.map(p => `
    <div class="product-admin-card">
      <div class="product-admin-img">
        ${p.images && p.images.length > 0 ? `<img src="${p.images[0]}" alt="${escHtml(p.name)}">` : p.emoji || '🌸'}
      </div>
      <div class="product-admin-info">
        <h4>${escHtml(p.name)}</h4>
        <div class="price">${p.price.toLocaleString('fr-FR')} $</div>
        <div style="font-size:11px;color:var(--text-dim);margin-bottom:14px">
          ${escHtml(p.category)} — ${escHtml(p.quantite)} — ${(p.images||[]).length} photo(s)
        </div>
        <div class="admin-btn-row">
          <button class="action-btn btn-update" onclick="openEditProduct(${p.id})">Modifier</button>
          <button class="action-btn btn-danger"  onclick="deleteProduct(${p.id})">Supprimer</button>
        </div>
      </div>
    </div>
  `).join('');
}

// Sélection fichiers produit → aperçu local seulement (upload au moment de "Publier")
function handleProductImages(e) {
  newProdFiles = Array.from(e.target.files);
  const grid = document.getElementById('img-preview-grid');
  grid.innerHTML = '';
  newProdFiles.forEach((file, idx) => {
    const reader  = new FileReader();
    reader.onload = ev => {
      const item = document.createElement('div'); item.className = 'img-preview-item';
      const img  = document.createElement('img'); img.src = ev.target.result;
      const btn  = document.createElement('button'); btn.className = 'remove-img'; btn.textContent = '✕';
      btn.onclick = () => { newProdFiles.splice(idx, 1); handleProductImages({ target: { files: newProdFiles } }); };
      item.appendChild(img); item.appendChild(btn); grid.appendChild(item);
    };
    reader.readAsDataURL(file);
  });
}

async function saveProduct() {
  const name     = document.getElementById('prod-name').value.trim();
  const price    = parseInt(document.getElementById('prod-price').value);
  const category = document.getElementById('prod-category').value;
  const quantite = document.getElementById('prod-quantite').value.trim();
  const desc     = document.getElementById('prod-desc').value.trim();
  if (!name || !price || !desc) { showToast('Remplissez tous les champs', 'error'); return; }

  showToast('Envoi des photos en cours…', 'info');
  let images = [];
  try {
    for (const file of newProdFiles) {
      const dataUri = await readFileAsDataUrl(file);
      const url     = await uploadToCloud(dataUri, 'image', state.adminToken);
      images.push(url);
    }
  } catch (err) {
    showToast('Erreur upload image : ' + err.message, 'error'); return;
  }

  try {
    const res = await fetch('/api/products', {
      method: 'POST', headers: adminHeaders(),
      body: JSON.stringify({ id: Date.now(), name, price, category, quantite, desc, images })
    });
    if (!res.ok) { showToast('Erreur création produit', 'error'); return; }
    newProdFiles = [];
    document.getElementById('img-preview-grid').innerHTML = '';
    showToast('Produit ajouté ✔', 'success'); listenProducts();
  } catch { showToast('Erreur création produit', 'error'); }
}

function openEditProduct(id) {
  const p = state.products.find(pr => pr.id === id);
  if (!p) return;
  state.currentEditProductId = id;
  editProdFiles = [];
  document.getElementById('edit-prod-id').value    = id;
  document.getElementById('edit-prod-name').value  = p.name;
  document.getElementById('edit-prod-price').value = p.price;
  document.getElementById('edit-prod-desc').value  = p.desc || p.description;
  const grid = document.getElementById('edit-preview-grid');
  grid.innerHTML = '';
  (p.images || []).forEach((url, i) => {
    const item = document.createElement('div'); item.className = 'img-preview-item';
    const img  = document.createElement('img'); img.src = url;
    const btn  = document.createElement('button'); btn.className = 'remove-img'; btn.textContent = '✕';
    btn.onclick = () => {
      const prod = state.products.find(pr => pr.id === id);
      if (prod) { prod.images.splice(i, 1); openEditProduct(id); }
    };
    item.appendChild(img); item.appendChild(btn); grid.appendChild(item);
  });
  document.getElementById('modal-edit-product').classList.add('open');
}

function handleEditImages(e) {
  editProdFiles = Array.from(e.target.files);
  const grid = document.getElementById('edit-preview-grid');
  editProdFiles.forEach(file => {
    const reader  = new FileReader();
    reader.onload = ev => {
      const item = document.createElement('div'); item.className = 'img-preview-item img-preview-pending';
      const img  = document.createElement('img'); img.src = ev.target.result;
      const lbl  = document.createElement('span');
      lbl.textContent = '⏳'; lbl.style.cssText = 'position:absolute;top:4px;left:4px;background:var(--gold);color:var(--dark);font-size:10px;padding:2px 4px';
      item.appendChild(img); item.appendChild(lbl); grid.appendChild(item);
    };
    reader.readAsDataURL(file);
  });
}

async function saveEditProduct() {
  const id = state.currentEditProductId;
  const p  = state.products.find(pr => pr.id === id);
  let existingImages = p ? [...(p.images || [])] : [];

  if (editProdFiles.length > 0) {
    showToast('Envoi des nouvelles photos…', 'info');
    try {
      for (const file of editProdFiles) {
        const dataUri = await readFileAsDataUrl(file);
        const url     = await uploadToCloud(dataUri, 'image', state.adminToken);
        existingImages.push(url);
      }
    } catch (err) {
      showToast('Erreur upload : ' + err.message, 'error'); return;
    }
  }

  const updated = {
    name    : document.getElementById('edit-prod-name').value,
    price   : parseInt(document.getElementById('edit-prod-price').value),
    desc    : document.getElementById('edit-prod-desc').value,
    images  : existingImages,
    category: p?.category || '',
    quantite: p?.quantite  || '',
  };
  try {
    const res = await fetch('/api/products/' + id, {
      method: 'PUT', headers: adminHeaders(), body: JSON.stringify(updated)
    });
    if (!res.ok) { showToast('Erreur modification', 'error'); return; }
    editProdFiles = [];
    closeModal('modal-edit-product');
    showToast('Produit mis à jour ✔', 'success'); listenProducts();
  } catch { showToast('Erreur modification', 'error'); }
}

async function deleteProduct(id) {
  if (!confirm('Supprimer ce produit ?')) return;
  try {
    const res = await fetch('/api/products/' + id, { method: 'DELETE', headers: adminHeaders() });
    if (!res.ok) { showToast('Erreur suppression', 'error'); return; }
    showToast('Produit supprimé', 'info'); listenProducts();
  } catch { showToast('Erreur suppression', 'error'); }
}

// ── Clients ───────────────────────────────────────────────────
async function fetchCustomers() {
  try {
    const res = await fetch('/api/customers', { headers: adminHeaders() });
    if (!res.ok) return;
    state.customers = await res.json();
    renderCustomers(); renderAdminDashboard();
  } catch (_) {}
}

function renderCustomers() {
  const tbody = document.getElementById('customers-tbody');
  if (!tbody) return;
  tbody.innerHTML = state.customers.map(c => `
    <tr>
      <td style="color:var(--cream)">${escHtml(c.name)}</td>
      <td>${escHtml(c.email)}</td>
      <td>${escHtml(c.phone || '—')}</td>
      <td>${escHtml(c.address || '—')}</td>
      <td style="color:var(--text-dim)">${new Date(c.created_at).toLocaleDateString('fr-FR')}</td>
    </tr>
  `).join('');
}

// ════════════════════════════════════════════════════════════
//  VIDÉOS
// ════════════════════════════════════════════════════════════
async function listenVideos() {
  try {
    state.videos = await fetch('/api/videos').then(r => r.json());
    renderVideos();
    if (state.isAdmin) renderAdminVideos();
  } catch (_) {}
}

function renderVideos() {
  const grid = document.getElementById('videos-grid');
  if (!grid) return;
  if (state.videos.length === 0) { grid.innerHTML = "<p style='text-align:center'>Aucune vidéo</p>"; return; }
  grid.innerHTML = state.videos.map(v => `
    <div style="background:#111;padding:15px;border-radius:10px">
      <h3 style="margin-bottom:10px">${escHtml(v.title)}</h3>
      <video src="${v.url}" controls style="width:100%;border-radius:8px"></video>
    </div>
  `).join('');
}

function renderAdminVideos() {
  const box = document.getElementById('admin-videos-list');
  if (!box) return;
  box.innerHTML = state.videos.map(v => `
    <div style="margin-bottom:15px;padding:12px;background:var(--dark-2);border-radius:8px">
      <strong style="color:var(--cream)">${escHtml(v.title)}</strong><br>
      <video src="${v.url}" width="200" controls style="margin-top:8px;border-radius:6px"></video><br>
      <button class="action-btn btn-danger" style="margin-top:8px" onclick="deleteVideo(${v.id})">Supprimer</button>
    </div>
  `).join('');
}

// Upload vidéo → Cloudinary → DB
async function uploadVideo() {
  const title     = document.getElementById('video-title').value.trim();
  const fileInput = document.getElementById('video-file');
  const file      = fileInput && fileInput.files[0];
  if (!title) { showToast('Titre requis', 'error'); return; }
  if (!file)  { showToast('Fichier vidéo requis', 'error'); return; }

  showToast('Envoi de la vidéo en cours… (peut prendre une minute)', 'info');
  try {
    const dataUri = await readFileAsDataUrl(file);
    const url     = await uploadToCloud(dataUri, 'video', state.adminToken);

    const res = await fetch('/api/videos', {
      method: 'POST', headers: adminHeaders(),
      body: JSON.stringify({ title, url })
    });
    if (!res.ok) { showToast('Erreur enregistrement vidéo', 'error'); return; }
    document.getElementById('video-title').value = '';
    fileInput.value = '';
    showToast('Vidéo publiée ✔', 'success'); listenVideos();
  } catch (err) {
    showToast('Erreur upload : ' + err.message, 'error');
  }
}

async function deleteVideo(id) {
  if (!confirm('Supprimer cette vidéo ?')) return;
  try {
    const res = await fetch('/api/videos/' + id, { method: 'DELETE', headers: adminHeaders() });
    if (!res.ok) { showToast('Erreur suppression', 'error'); return; }
    showToast('Vidéo supprimée', 'info'); listenVideos();
  } catch { showToast('Erreur suppression', 'error'); }
}

// ════════════════════════════════════════════════════════════
//  MODALS
// ════════════════════════════════════════════════════════════
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.modal-overlay').forEach(m =>
    m.addEventListener('click', e => { if (e.target === m) m.classList.remove('open'); })
  );
});

// ════════════════════════════════════════════════════════════
//  ADMIN ACCESS via URL hash
// ════════════════════════════════════════════════════════════
window.addEventListener('hashchange', () => { if (location.hash === '#admin') showPage('admin-login'); });
if (location.hash === '#admin') showPage('admin-login');

const adminLink = document.createElement('a');
adminLink.href = '#admin';
adminLink.style.cssText = 'position:fixed;bottom:16px;right:16px;color:rgba(201,169,110,0.3);font-size:9px;letter-spacing:2px;text-decoration:none;text-transform:uppercase;transition:color 0.3s;z-index:999';
adminLink.textContent = 'Admin';
adminLink.addEventListener('mouseenter', () => adminLink.style.color = 'rgba(201,169,110,0.8)');
adminLink.addEventListener('mouseleave', () => adminLink.style.color = 'rgba(201,169,110,0.3)');
adminLink.addEventListener('click', () => showPage('admin-login'));
document.body.appendChild(adminLink);
