// ============================================================
//  LUMIÈRE — Frontend JavaScript
//  Stockage fichiers : Cloudinary via /api/upload
// ============================================================

// ── Icônes SVG inline (remplace tous les emojis) ─────────────
const SVG = {
  user:     `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  trash:    `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>`,
  perfume:  `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3h6v2H9z"/><path d="M10 5v2"/><path d="M14 5v2"/><rect x="7" y="7" width="10" height="14" rx="2"/><path d="M10 11h4"/></svg>`,
  check:    `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  clock:    `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  truck:    `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`,
  package:  `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
  loader:   `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation:spin 1s linear infinite"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>`,
  circleX:  `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
  circleOk: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
};

// ── Style spin ─────────────────────────────────────────────────
const _spinStyle = document.createElement('style');
_spinStyle.textContent = '@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}';
document.head.appendChild(_spinStyle);

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
  productsLoaded : false,
  orders         : [],
  customers      : [],
  promoCodes     : [],
  activePromo    : null,   // { code, discount, finalTotal }
  settings       : { bankName:'', bankAccount:'', bankHolder:'', bankMobile:'',
                     siteName:'', siteMotto:'', sitePhone:'', siteEmail:'',
                     siteWhatsapp:'', siteInstagram:'', siteFacebook:'', siteAddress:'', siteTiktok:'' },
  currentEditProductId : null,
  currentUpdateOrderId : null,
};

let newProdFiles  = [];
let editProdFiles = [];

// ── Helpers ───────────────────────────────────────────────────
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
// Get currency symbol from settings (default €)
function getCurrency() {
  const c = (state.settings && state.settings.currency) || '';
  const validCurrencies = ['€', '$', '£', '¥', 'Fr', 'CHF', 'CFA', 'FCFA', 'XOF', 'XAF', 'DH', 'MAD', 'DT', 'TND', 'DA', 'DZD'];
  return validCurrencies.includes(c.trim()) ? c.trim() : '€';
}

// Update brand name based on browser language (without touching I18N)
function updateSiteIdentity() {
  const s = state.settings || {};
  // Always translate brand name based on browser language
  const lang = _currentLang || 'fr';
  const names = {fr:'LUMIÈRE',en:'LIGHT',es:'LUZ',pt:'LUZ',ar:'نور',de:'LICHT'};
  const motos = {fr:'Parfums Premium',en:'Premium Fragrances',es:'Perfumes Premium',pt:'Perfumes Premium',ar:'عطور فاخرة',de:'Premium-Düfte'};
  const brand = names[lang] || 'LUMIÈRE';
  const motto = (s.siteMotto && s.siteMotto.trim()) ? s.siteMotto.trim() : (motos[lang] || 'Parfums Premium');
  const logo = document.querySelector('.nav-logo');
  const mlogo = document.querySelector('.mobile-menu-logo');
  const title = document.querySelector('title');
  if (logo) logo.textContent = brand;
  if (mlogo) mlogo.textContent = brand;
  if (title) title.textContent = brand + ' — ' + motto;
}


// Simple review content translation for known phrases
const _reviewTranslations = {
  'Amber enveloping, very pleasant': {
    'fr': 'Ambre enveloppant, très agréable',
    'en': 'Amber enveloping, very pleasant',
    'es': 'Ámbar envolvente, muy agradable',
    'pt': 'Âmbar envolvente, muito agradável',
    'ar': 'عنبر يغلف، لطيف جداً',
    'de': 'Umhüllender Amber, sehr angenehm'
  },
  'Perfect for winter, intense woody scent': {
    'fr': 'Parfait pour l\'hiver, senteur boisée intense',
    'en': 'Perfect for winter, intense woody scent',
    'es': 'Perfecto para invierno, aroma amaderado intenso',
    'pt': 'Perfeito para o inverno, aroma amadeirado intenso',
    'ar': 'مثالي للشتاء، رائحة خشبية كثيفة',
    'de': 'Perfekt für den Winter, intensiver holziger Duft'
  },
  'Authentic vetiver, I like it a lot': {
    'fr': 'Vétiver authentique, j\'aime beaucoup',
    'en': 'Authentic vetiver, I like it a lot',
    'es': 'Vetiver auténtico, me gusta mucho',
    'pt': 'Vetiver autêntico, gosto muito',
    'ar': 'فيتيفير أصيل، يعجبني كثيراً',
    'de': 'Authentischer Vetiver, mag ich sehr'
  },
  'Fast delivery, careful packaging. Perfume true to the description': {
    'fr': 'Livraison rapide, emballage soigné. Parfum conforme à la description',
    'en': 'Fast delivery, careful packaging. Perfume true to the description',
    'es': 'Entrega rápida, embalaje cuidadoso. Perfume fiel a la descripción',
    'pt': 'Entrega rápida, embalagem cuidadosa. Perfume fiel à descrição',
    'ar': 'توصيل سريع، تغليف دقيق. العطر مطابق للوصف',
    'de': 'Schnelle Lieferung, sorgfältige Verpackung. Parfüm wie beschrieben'
  },
  'Superb gift set, my wife loved it': {
    'fr': 'Superbe coffret cadeau, ma femme a adoré',
    'en': 'Superb gift set, my wife loved it',
    'es': 'Estupendo set de regalo, a mi esposa le encantó',
    'pt': 'Excelente conjunto de presente, minha esposa adorou',
    'ar': 'طقم هدايا رائع، زوجتي أحبته',
    'de': 'Hervorragendes Geschenkset, meine Frau liebte es'
  },
  'Exquisite fragrance, long lasting': {
    'fr': 'Fragrance exquise, longue tenue',
    'en': 'Exquisite fragrance, long lasting',
    'es': 'Fragancia exquisita, de larga duración',
    'pt': 'Fragrância requintada, longa duração',
    'ar': 'عطر رائع، يدوم طويلاً',
    'de': 'Erlesener Duft, lange haltbar'
  },
  'Beautiful packaging, smells amazing': {
    'fr': 'Bel emballage, sent super bon',
    'en': 'Beautiful packaging, smells amazing',
    'es': 'Embalaje hermoso, huele increíble',
    'pt': 'Embalagem bonita, cheiro incrível',
    'ar': 'تغليف جميل، رائحة رائعة',
    'de': 'Wunderschöne Verpackung, riecht toll'
  },
  'Perfect gift for my wife': {
    'fr': 'Cadeau parfait pour ma femme',
    'en': 'Perfect gift for my wife',
    'es': 'Regalo perfecto para mi esposa',
    'pt': 'Presente perfeito para minha esposa',
    'ar': 'هدية مثالية لزوجتي',
    'de': 'Perfektes Geschenk für meine Frau'
  },
  'I love this perfume, will buy again': {
    'fr': 'J\'adore ce parfum, je rachèterai',
    'en': 'I love this perfume, will buy again',
    'es': 'Me encanta este perfume, volveré a comprar',
    'pt': 'Adoro este perfume, comprarei novamente',
    'ar': 'أحب هذا العطر، سأشتريه مرة أخرى',
    'de': 'Ich liebe dieses Parfüm, werde es wieder kaufen'
  },
  'Fast delivery and great quality': {
    'fr': 'Livraison rapide et excellente qualité',
    'en': 'Fast delivery and great quality',
    'es': 'Entrega rápida y excelente calidad',
    'pt': 'Entrega rápida e ótima qualidade',
    'ar': 'توصيل سريع وجودة ممتازة',
    'de': 'Schnelle Lieferung und tolle Qualität'
  },
};

function translateContent(text) {
  const lang = _currentLang || 'fr';
  if (_reviewTranslations[text] && _reviewTranslations[text][lang]) {
    return _reviewTranslations[text][lang];
  }
  return text;
}


// Update contact email from admin settings
function updateContactEmail() {
  const s = state.settings || {};
  const link = document.getElementById('contact-email-link');
  if (link && s.siteEmail && s.siteEmail.trim()) {
    const email = s.siteEmail.trim();
    link.href = 'mailto:' + email;
    link.textContent = email;
  }
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
  updateContactEmail();
  loadReviews();
  updateCartCount();
  updateNavUser();
  renderSocialMedia();
  setInterval(() => { listenProducts(); listenOrders(); listenVideos(); }, 8000);
};

// ════════════════════════════════════════════════════════════
//  UPLOAD CLOUDINARY
// ════════════════════════════════════════════════════════════

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload  = e => resolve(e.target.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

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
  if ((name === 'payment' || name === 'tracking' || name === 'profile') && !state.currentUser) {
    showToast(__('Veuillez vous connecter'), 'warning');
    return showPage('auth');
  }
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById('page-' + name);
  if (page) page.classList.add('active');
  if (name === 'home') { renderSocialMedia(); updateContactEmail(); loadReviews(); }
  if (name === 'boutique') renderProducts();
  if (name === 'cart')     renderCart();
  if (name === 'tracking') { applyI18n(_currentLang); listenOrders(); renderTracking(); }
  if (name === 'payment')  renderPayment();
  if (name === 'profile')  renderProfile();
  window.scrollTo(0, 0);
  updateBottomNav(name);
}

function requireAuth(callback) {
  if (state.currentUser) callback();
  else { showToast(__('Veuillez vous connecter'), 'warning'); showPage('auth'); }
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
  if (!email || !pass) { showToast(__('Remplissez tous les champs'), 'error'); return; }
  try {
    const res  = await fetch('/api/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass })
    });
    const data = await res.json();
    if (!res.ok) { showToast(data.error || __('Erreur connexion'), 'error'); return; }
    state.currentUser = data.user;
    state.userToken   = data.token;
    saveState(); updateNavUser();
    showToast(__('Bienvenue') + ' ' + data.user.name + ' !', 'success');
    state.cart.length > 0 ? showPage('payment') : showPage('boutique');
  } catch { showToast(__('Erreur réseau'), 'error'); }
}

async function doRegister() {
  const name    = document.getElementById('reg-name').value.trim();
  const email   = document.getElementById('reg-email').value.trim();
  const phone   = document.getElementById('reg-phone').value.trim();
  const address = document.getElementById('reg-address').value.trim();
  const pass    = document.getElementById('reg-password').value;
  if (!name || !email || !phone || !address || !pass) {
    showToast(__('Tous les champs sont requis'), 'error'); return;
  }
  try {
    const res  = await fetch('/api/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, address, password: pass })
    });
    const data = await res.json();
    if (!res.ok) { showToast(data.error || __('Erreur inscription'), 'error'); return; }
    state.currentUser = data.user;
    state.userToken   = data.token;
    saveState(); updateNavUser();
    showToast(__('Compte créé') + ' ! ' + name, 'success');
    state.cart.length > 0 ? showPage('payment') : showPage('boutique');
  } catch { showToast(__('Erreur réseau'), 'error'); }
}

function updateNavUser() {
  const sec = document.getElementById('nav-user-section');
  const trackLink   = document.getElementById('nav-tracking-link');
  const mobileAuth  = document.getElementById('mobile-menu-auth-section');
  const mobileProf  = document.getElementById('mobile-profile-link');

  if (state.currentUser) {
    sec.innerHTML = `
      <button class="nav-profile-btn" onclick="showPage('profile')" title="${escHtml(state.currentUser.name)}">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      </button>`;
    if (trackLink)  trackLink.style.display  = '';
    if (mobileAuth) mobileAuth.style.display = 'none';
    if (mobileProf) mobileProf.style.display = '';
  } else {
    sec.innerHTML = `<button class="btn-nav" onclick="showPage('auth')" data-i18n="btn-login">Connexion</button>`;
    if (trackLink)  trackLink.style.display  = 'none';
    if (mobileAuth) mobileAuth.style.display = '';
    if (mobileProf) mobileProf.style.display = 'none';
  }
  // Bouton hero accueil : adapter selon connexion
  const heroBtn = document.getElementById('hero-account-btn');
  if (heroBtn) {
    if (state.currentUser) {
      heroBtn.textContent = __('Voir votre Profil');
      heroBtn.onclick = () => showPage('profile');
    } else {
      heroBtn.textContent = __('Créer un Compte');
      heroBtn.onclick = () => showPage('auth');
    }
  }
  // Mobile menu : afficher/cacher lien Profil
  const profileLink = document.getElementById('mobile-profile-link');
  if (profileLink) profileLink.style.display = state.currentUser ? 'flex' : 'none';
  updateMobileMenuAuth();
  updateCartCount();
  // Bottom nav : label du bouton compte
  const lbl = document.getElementById('bnav-account-label');
  if (lbl) lbl.textContent = state.currentUser ? __('Profil') : __('Compte');
}

// Bouton compte de la bottom nav
function bnav_account() {
  if (state.currentUser) showPage('profile');
  else showPage('auth');
}

function logout() {
  state.currentUser = null; state.userToken = null;
  saveState(); updateNavUser();
  showToast(__('Déconnecté'), 'info'); showPage('home');
}

// ════════════════════════════════════════════════════════════
//  PRODUITS
// ════════════════════════════════════════════════════════════
let activeCategory = 'all';

async function listenProducts() {
  try {
    const data = await fetch('/api/products').then(r => r.json());
    state.products = data;
    state.productsLoaded = true;
    renderCategoryFilter();
    renderProducts();
    if (state.isAdmin) renderAdminProducts();
  } catch (_) {}
}

function renderCategoryFilter() {
  const bar = document.getElementById('category-filter');
  if (!bar) return;
  const cats = ['all', ...new Set(state.products.map(p => p.category).filter(Boolean))];
  bar.innerHTML = cats.map(cat => `
    <button class="filter-btn ${activeCategory === cat ? 'active' : ''}"
      onclick="setCategory('${escHtml(cat)}')">
      ${cat === 'all' ? __('Tous') : __(escHtml(cat))}
    </button>
  `).join('');
}

function setCategory(cat) {
  activeCategory = cat;
  renderCategoryFilter();
  renderProducts();
}

function renderProducts() {
  const grid = document.getElementById('products-grid');
  if (!grid) return;
  
  // Show shimmer loading placeholders while products are loading
  if (!state.productsLoaded) {
    grid.innerHTML = Array(6).fill(`
      <div class="product-card shimmer-card">
        <div class="product-img-wrap">
          <div class="shimmer shimmer-img"></div>
        </div>
        <div class="product-info">
          <div class="shimmer shimmer-line" style="width:60%;height:14px;margin-bottom:10px"></div>
          <div class="shimmer shimmer-line" style="width:80%;height:20px;margin-bottom:8px"></div>
          <div class="shimmer shimmer-line" style="width:100%;height:14px;margin-bottom:8px"></div>
          <div class="shimmer shimmer-line" style="width:40%;height:22px;margin-top:8px"></div>
        </div>
      </div>
    `).join('');
    return;
  }
  
  const filtered = activeCategory === 'all'
    ? state.products
    : state.products.filter(p => p.category === activeCategory);
  if (!filtered.length) {
    grid.innerHTML = `<div style="text-align:center;padding:80px;color:var(--text-dim);font-family:'Cormorant Garamond',serif;font-size:24px">
      ${state.products.length ? __('Aucun produit dans cette catégorie') : __('La collection arrive bientôt…')}
    </div>`;
    return;
  }
  grid.innerHTML = filtered.map(p => `
    <div class="product-card">
      <div class="product-img-wrap">
        ${p.images && p.images.length > 0
          ? `<img src="${escHtml(p.images[0])}" alt="${escHtml(p.name)}">`
          : `<div class="product-img-placeholder">${SVG.perfume}<span>${escHtml(p.category)}</span></div>`}
      </div>
      <div class="product-info">
        <div class="product-tag">${escHtml(p.category)} — ${escHtml(p.quantite)}</div>
        <div class="product-name">${escHtml(p.name)}</div>
        <div class="product-desc">${escHtml(p.desc || p.description || '')}</div>
        <div class="product-price">${p.price.toLocaleString('fr-FR')} ${getCurrency()}</div>
        <button class="btn-add-cart" onclick="addToCart(${p.id})">${__('Ajouter au Panier')}</button>
      </div>
    </div>
  `).join('');
}

// ════════════════════════════════════════════════════════════
//  PANIER
// ════════════════════════════════════════════════════════════
function addToCart(productId) {
  const prod = state.products.find(p => p.id == productId);
  if (!prod) return;
  const existing = state.cart.find(i => i.id == productId);
  if (existing) existing.qty++;
  else state.cart.push({ ...prod, qty: 1 });
  saveState(); updateCartCount();
  showToast(escHtml(prod.name) + ' ' + __('ajouté au panier'), 'success');
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
        <p>${__('Votre panier est vide')}</p>
        <button class="btn-primary" onclick="showPage('boutique')">${__('Découvrir la Collection')}</button>
      </div>`; return;
  }
  const total = state.cart.reduce((s, i) => s + i.price * i.qty, 0);
  content.innerHTML = state.cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-img">
        ${item.images && item.images.length > 0
          ? `<img src="${escHtml(item.images[0])}" alt="${escHtml(item.name)}">`
          : SVG.perfume}
      </div>
      <div class="cart-item-info">
        <div class="cart-item-name">${escHtml(item.name)}</div>
        <div class="cart-item-price">${item.price.toLocaleString('fr-FR')} ${getCurrency()}</div>
      </div>
      <div class="cart-item-qty">
        <button class="qty-btn" onclick="changeQty(${item.id}, -1)">−</button>
        <span>${item.qty}</span>
        <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
      </div>
      <span style="color:var(--gold);font-family:'Cormorant Garamond',serif;font-size:20px;min-width:120px;text-align:right">
        ${(item.price * item.qty).toLocaleString('fr-FR')} ${getCurrency()}
      </span>
      <button class="remove-btn" onclick="removeFromCart(${item.id})">${SVG.trash}</button>
    </div>
  `).join('') + `
    <div class="cart-total">
      <span class="cart-total-label">${__('Total')}</span>
      <span class="cart-total-amount">${total.toLocaleString('fr-FR')} ${getCurrency()}</span>
    </div>
    <div style="margin-top:20px;text-align:center">
      <button class="btn-primary" style="width:100%" onclick="goToPayment()">${__('Passer au paiement')}</button>
    </div>`;
}

function changeQty(id, delta) {
  const item = state.cart.find(i => i.id == id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) state.cart = state.cart.filter(i => i.id != id);
  updateCartCount(); renderCart(); saveState();
}

function removeFromCart(id) {
  state.cart = state.cart.filter(i => i.id != id);
  updateCartCount(); renderCart(); saveState();
}

function goToPayment() {
  if (state.cart.length === 0) { showToast(__('Panier vide'), 'error'); return; }
  if (!state.currentUser) { showToast(__('Connexion requise'), 'warning'); showPage('auth'); return; }
  showPage('payment');
}

// ════════════════════════════════════════════════════════════
//  PAIEMENT
// ════════════════════════════════════════════════════════════
async function renderPayment() {
  // Reset promo state à chaque ouverture
  state.activePromo = null;
  const promoInput = document.getElementById('promo-apply-input');
  if (promoInput) promoInput.value = '';
  const promoResult = document.getElementById('promo-result');
  if (promoResult) promoResult.innerHTML = '';

  // Re-fetch les paramètres en direct
  try {
    const fresh = await fetch('/api/settings').then(r => r.json());
    state.settings = fresh;
    updateSiteIdentity();
    renderSocialMedia();
    updateContactEmail();
  } catch (_) {}

  const s = state.settings || {};

  renderPaymentSummary();

  if (state.currentUser) {
    document.getElementById('delivery-address').value = state.currentUser.address || '';
  }

  const hasBank = s.bankName || s.bankAccount || s.bankHolder || s.bankMobile;
  const bankBox = document.getElementById('payment-bank-box');
  if (hasBank) {
    bankBox.innerHTML = `
      <h3>${__('Coordonnées Bancaires')}</h3>
      ${s.bankName    ? `<div class="bank-detail"><span class="bank-label">${__('Banque')}</span><span class="bank-value">${escHtml(s.bankName)}</span></div>` : ''}
      ${s.bankAccount ? `<div class="bank-detail"><span class="bank-label">${__('Numéro de Compte')}</span><span class="bank-value">${escHtml(s.bankAccount)}</span></div>` : ''}
      ${s.bankHolder  ? `<div class="bank-detail"><span class="bank-label">${__('Titulaire')}</span><span class="bank-value">${escHtml(s.bankHolder)}</span></div>` : ''}
      ${s.bankMobile  ? `<div class="bank-detail"><span class="bank-label">${__('Mobile Money')}</span><span class="bank-value">${escHtml(s.bankMobile)}</span></div>` : ''}`;
  } else {
    bankBox.innerHTML = `
      <h3>${__('Coordonnées Bancaires')}</h3>
      <div class="bank-unconfigured">
        ${__('Les coordonnées bancaires ne sont pas encore configurées.')}<br>
        ${__('Veuillez contacter le vendeur directement pour effectuer votre paiement.')}
      </div>`;
  }

  // Réinitialise la zone de preuve
  state.proofUrl = null;
  const nameEl = document.getElementById('proof-name');
  if (nameEl) { nameEl.style.display = 'none'; nameEl.textContent = ''; }
  const zone = document.getElementById('proof-zone');
  if (zone) zone.style.borderColor = 'rgba(201,169,110,0.3)';
  const input = document.getElementById('proof-input');
  if (input) input.value = '';
}

// Preuve de paiement : upload immédiat vers Cloudinary
async function handleProofUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  const nameEl = document.getElementById('proof-name');
  const zone   = document.getElementById('proof-zone');
  nameEl.innerHTML  = SVG.loader + ' &nbsp;' + __('Envoi en cours…');
  nameEl.style.display = 'block';
  nameEl.style.color   = 'var(--gold)';
  zone.style.borderColor = 'var(--gold)';
  try {
    const dataUri      = await readFileAsDataUrl(file);
    const url          = await uploadProofToCloud(dataUri);
    state.proofUrl     = url;
    nameEl.innerHTML   = SVG.circleOk + ' &nbsp;' + __('Preuve de Paiement') + ' ' + __('Envoyée');
    nameEl.style.color = 'var(--green)';
    zone.style.borderColor = 'var(--green)';
  } catch (err) {
    state.proofUrl     = null;
    nameEl.innerHTML   = SVG.circleX + ' &nbsp;Erreur : ' + escHtml(err.message);
    nameEl.style.color = 'var(--red)';
    zone.style.borderColor = 'var(--red)';
  }
}

async function submitOrder() {
  if (!state.proofUrl) { showToast(__('Ajoutez une preuve de paiement'), 'error'); return; }
  const address = document.getElementById('delivery-address').value.trim();
  if (!address) { showToast(__('Adresse de livraison requise'), 'error'); return; }
  if (state.cart.length === 0) { showToast(__('Panier vide'), 'error'); return; }

  const baseTotal = state.cart.reduce((s, i) => s + i.price * i.qty, 0);
  const total     = state.activePromo ? state.activePromo.finalTotal : baseTotal;
  const order = {
    customer  : state.currentUser.name,
    items     : state.cart,
    total,
    proofUrl  : state.proofUrl,
    address,
    promoCode : state.activePromo ? state.activePromo.code : undefined,
  };

  const btn = document.querySelector('#page-payment .btn-primary.btn-full');
  if (btn) { btn.disabled = true; btn.textContent = __('Envoi en cours…'); }

  try {
    const res = await fetch('/api/orders', {
      method: 'POST', headers: userHeaders(), body: JSON.stringify(order)
    });
    const data = await res.json();
    if (!res.ok) {
      if (res.status === 401) { showToast(__('Session expirée, reconnectez-vous'), 'error'); logout(); return; }
      showToast(data.error || __('Erreur commande'), 'error');
      if (btn) { btn.disabled = false; btn.textContent = __('Soumettre la Commande'); }
      return;
    }
    // Succès : vider le panier et afficher l'écran de confirmation
    state.cart     = [];
    state.proofUrl = null;
    updateCartCount(); saveState();
    showOrderConfirmation(data.trackingCode);
    listenOrders();
  } catch {
    showToast(__('Erreur réseau'), 'error');
    if (btn) { btn.disabled = false; btn.textContent = __('Soumettre la Commande'); }
  }
}

// ── Écran de confirmation post-commande ───────────────────────
function showOrderConfirmation(trackingCode) {
  document.getElementById('confirm-code').textContent = trackingCode || '—';
  showPage('confirm');
  applyI18n(_currentLang);
  if (typeof lucide !== 'undefined') lucide.createIcons();
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
  // Réinitialise le champ de recherche à chaque ouverture
  const inp = document.getElementById('tracking-input');
  if (inp) { inp.value = ''; }
  // Vide les résultats — chaque commande reste confidentielle,
  // visible uniquement après saisie du code de suivi personnel.
  const resultBox = document.getElementById('tracking-result');
  if (resultBox) resultBox.innerHTML = '';
  const box = document.getElementById('tracking-content');
  if (box) box.innerHTML = '';
}

function statusInfo(status) {
  const map = {
    pending  : { icon: SVG.clock,   label: __('Paiement en attente') },
    confirmed: { icon: SVG.circleOk,label: __('Confirmé') },
    shipping : { icon: SVG.truck,   label: __('En livraison') },
    delivered: { icon: SVG.package, label: __('Livré') },
  };
  return map[status] || { icon: '', label: status };
}

async function searchTracking() {
  const code      = document.getElementById('tracking-input').value.trim().toUpperCase();
  const resultBox = document.getElementById('tracking-result');
  if (!code) { showToast(__('Entrez un code de suivi'), 'error'); return; }
  resultBox.innerHTML = `<p style="text-align:center;color:var(--text-dim)">${SVG.loader} &nbsp;${__('Recherche')}…</p>`;
  try {
    const res   = await fetch('/api/orders/track?code=' + encodeURIComponent(code));
    const order = await res.json();
    if (!res.ok) {
      resultBox.innerHTML = `<div style="text-align:center;padding:20px;color:var(--red)">${__('Commande introuvable')} — ${__('vérifiez le code')}</div>`;
      return;
    }
    const { icon, label } = statusInfo(order.status);
    const items = (order.items || []).map(i => escHtml(i.product_name) + ' ×' + i.quantity).join(', ');
    resultBox.innerHTML = `
      <div style="text-align:center;padding:28px;background:var(--dark-2);border:1px solid rgba(201,169,110,0.15)">
        <div style="font-family:'Cormorant Garamond',serif;font-size:28px;color:var(--gold);letter-spacing:3px;margin-bottom:12px">
          ${escHtml(order.trackingCode || order.trackingcode || code)}
        </div>
        <div style="margin-bottom:10px;font-size:13px;color:var(--text-dim)">${items}</div>
        <div style="font-family:'Cormorant Garamond',serif;font-size:20px;color:var(--gold);margin-bottom:14px">${order.total.toLocaleString('fr-FR')} ${getCurrency()}</div>
        <span class="t-status ${order.status}" style="display:inline-flex;align-items:center;gap:6px;padding:6px 16px;font-size:11px;letter-spacing:2px;text-transform:uppercase">
          ${icon} ${label}
        </span>
      </div>`;
  } catch { showToast(__('Erreur réseau'), 'error'); resultBox.innerHTML = ''; }
}

// ════════════════════════════════════════════════════════════
//  PARAMÈTRES
// ════════════════════════════════════════════════════════════
async function listenSettings() {
  try {
    state.settings = await fetch('/api/settings').then(r => r.json());
    renderSocialMedia();
    updateContactEmail();
  } catch (_) {}
}

function loadSettings() {
  const s = state.settings || {};
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
  set('s-bank-name',      s.bankName);
  set('s-bank-account',   s.bankAccount);
  set('s-bank-holder',    s.bankHolder);
  set('s-bank-mobile',    s.bankMobile);
  set('s-site-name',      s.siteName);
  set('s-site-motto',     s.siteMotto);
  set('s-site-address',   s.siteAddress);
  set('s-site-phone',     s.sitePhone);
  set('s-site-email',     s.siteEmail);
  set('s-site-whatsapp',  s.siteWhatsapp);
  set('s-site-instagram', s.siteInstagram);
  set('s-site-facebook',  s.siteFacebook);
  set('s-site-tiktok',    s.siteTiktok);
  set('s-currency',       s.currency || '€');
  set('s-smtp-host',      s.smtpHost);
  set('s-smtp-port',      s.smtpPort || '587');
  set('s-smtp-user',      s.smtpUser);
  set('s-smtp-pass',      s.smtpPass);
  set('s-smtp-from',      s.smtpFrom);
  renderAdminPromoCodes();
}

async function saveSettings() {
  const get = id => { const el = document.getElementById(id); return el ? el.value.trim() : ''; };
  const settings = {
    bankName   : get('s-bank-name'),
    bankAccount: get('s-bank-account'),
    bankHolder : get('s-bank-holder'),
    bankMobile : get('s-bank-mobile'),
    siteName   : get('s-site-name'),
    siteMotto  : get('s-site-motto'),
    siteAddress: get('s-site-address'),
    sitePhone  : get('s-site-phone'),
    siteEmail  : get('s-site-email'),
    siteWhatsapp : get('s-site-whatsapp'),
    siteInstagram: get('s-site-instagram'),
    siteFacebook : get('s-site-facebook'),
    siteTiktok   : get('s-site-tiktok'),
    currency     : get('s-currency') || '€',
    smtpHost     : get('s-smtp-host'),
    smtpPort     : get('s-smtp-port'),
    smtpUser     : get('s-smtp-user'),
    smtpPass     : get('s-smtp-pass'),
    smtpFrom     : get('s-smtp-from'),
  };
  try {
    const res = await fetch('/api/settings', {
      method: 'POST', headers: adminHeaders(), body: JSON.stringify(settings)
    });
    if (!res.ok) { showToast(__('Erreur sauvegarde'), 'error'); return; }
    state.settings = { ...state.settings, ...settings };
    updateSiteIdentity();
    renderSocialMedia();
    updateContactEmail();
    showToast(__('Paramètres sauvegardés'), 'success');
  } catch { showToast(__('Erreur sauvegarde'), 'error'); }
}

// ════════════════════════════════════════════════════════════
//  CODES PROMO — Admin
// ════════════════════════════════════════════════════════════
async function renderAdminPromoCodes() {
  const box = document.getElementById('admin-promo-list');
  if (!box) return;
  try {
    const res = await fetch('/api/promo-codes', { headers: adminHeaders() });
    if (!res.ok) return;
    state.promoCodes = await res.json();
  } catch { return; }
  if (!state.promoCodes.length) {
    box.innerHTML = `<p style="color:var(--text-dim);font-size:13px;padding:16px 0">${__('Aucun code promo créé')}</p>`;
    return;
  }
  box.innerHTML = `
    <table class="admin-table" style="margin-top:8px">
      <thead><tr>
        <th>Code</th><th>Type</th><th>Valeur</th><th>Utilisations</th><th>${__('Statut')}</th><th>Actions</th>
      </tr></thead>
      <tbody>${state.promoCodes.map(p => `
        <tr>
          <td><strong style="color:var(--gold);letter-spacing:2px">${escHtml(p.code)}</strong></td>
          <td style="color:var(--text-dim)">${p.discount_type === 'percent' ? 'Pourcentage' : 'Fixe'}</td>
          <td style="color:var(--cream)">${p.discount_value}${p.discount_type === 'percent' ? '%' : ' $'}</td>
          <td style="color:var(--text-dim)">${p.used_count}${p.max_uses ? ' / ' + p.max_uses : ' / ∞'}</td>
          <td><span style="padding:3px 12px;font-size:10px;letter-spacing:2px;${p.active
            ? 'background:rgba(39,174,96,0.12);color:var(--green);border:1px solid rgba(39,174,96,0.3)'
            : 'background:rgba(192,57,43,0.12);color:var(--red);border:1px solid rgba(192,57,43,0.3)'}">
            ${p.active ? 'ACTIF' : 'INACTIF'}</span></td>
          <td style="display:flex;gap:8px">
            <button class="action-btn btn-update" onclick="togglePromoCode(${p.id})">${p.active ? 'Désactiver' : 'Activer'}</button>
            <button class="action-btn btn-danger" onclick="deletePromoCode(${p.id})">${__('Supprimer')}</button>
          </td>
        </tr>`).join('')}
      </tbody>
    </table>`;
}

async function createPromoCode() {
  const code     = (document.getElementById('promo-code-input')?.value || '').trim().toUpperCase();
  const type     = document.getElementById('promo-type')?.value || 'percent';
  const value    = parseInt(document.getElementById('promo-value')?.value || '0');
  const maxUses  = parseInt(document.getElementById('promo-max-uses')?.value || '0') || null;
  if (!code)    { showToast(__('Entrez un code'), 'error'); return; }
  if (!value)   { showToast(__('Entrez une valeur de réduction'), 'error'); return; }
  try {
    const res = await fetch('/api/promo-codes', {
      method: 'POST', headers: adminHeaders(),
      body: JSON.stringify({ code, discount_type: type, discount_value: value, max_uses: maxUses })
    });
    const data = await res.json();
    if (!res.ok) { showToast(data.error || __('Erreur'), 'error'); return; }
    showToast(__('Code promo créé : ') + code, 'success');
    document.getElementById('promo-code-input').value = '';
    document.getElementById('promo-value').value = '';
    document.getElementById('promo-max-uses').value = '';
    renderAdminPromoCodes();
  } catch { showToast(__('Erreur réseau'), 'error'); }
}

async function togglePromoCode(id) {
  try {
    await fetch('/api/promo-codes/' + id + '/toggle', { method: 'PATCH', headers: adminHeaders() });
    renderAdminPromoCodes();
  } catch { showToast(__('Erreur'), 'error'); }
}

async function deletePromoCode(id) {
  if (!confirm(__('Supprimer ce code promo ?'))) return;
  try {
    await fetch('/api/promo-codes/' + id, { method: 'DELETE', headers: adminHeaders() });
    showToast(__('Code supprimé'), 'info');
    renderAdminPromoCodes();
  } catch { showToast(__('Erreur'), 'error'); }
}

// ════════════════════════════════════════════════════════════
//  CODES PROMO — Client (checkout)
// ════════════════════════════════════════════════════════════
async function applyPromoCode() {
  const code = (document.getElementById('promo-apply-input')?.value || '').trim().toUpperCase();
  const resultBox = document.getElementById('promo-result');
  if (!code) { showToast(__('Entrez un code promo'), 'error'); return; }
  const total = state.cart.reduce((s, i) => s + i.price * i.qty, 0);
  try {
    const res  = await fetch('/api/promo-codes/apply', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, total })
    });
    const data = await res.json();
    if (!res.ok) {
      state.activePromo = null;
      resultBox.innerHTML = `<span style="color:var(--red)">${escHtml(data.error)}</span>`;
      renderPaymentSummary();
      return;
    }
    state.activePromo = data;
    resultBox.innerHTML = `<span style="color:var(--green)">✓ ${__('Code appliqué')} — ${__('Réduction')} : ${data.discount.toLocaleString('fr-FR')} ${getCurrency()} | ${__('Nouveau total')} : <strong>${data.finalTotal.toLocaleString('fr-FR')} ${getCurrency()}</strong></span>`;
    renderPaymentSummary();
  } catch { resultBox.innerHTML = `<span style="color:var(--red)">${__('Erreur réseau')}</span>`; }
}

function renderPaymentSummary() {
  const promo = state.activePromo;
  const baseTotal = state.cart.reduce((s, i) => s + i.price * i.qty, 0);
  document.getElementById('payment-summary').innerHTML = `
    <h3 style="font-family:'Cormorant Garamond',serif;font-size:20px;color:var(--cream);margin-bottom:16px">${__('Récapitulatif')}</h3>
    ${state.cart.map(i => `
      <div class="summary-line">
        <span>${escHtml(i.name)} × ${i.qty}</span>
        <span>${(i.price * i.qty).toLocaleString('fr-FR')} ${getCurrency()}</span>
      </div>`).join('')}
    ${promo ? `
      <div class="summary-line" style="color:var(--green)">
        <span>Code promo (${escHtml(promo.code)})</span>
        <span>− ${promo.discount.toLocaleString('fr-FR')} ${getCurrency()}</span>
      </div>` : ''}
    <div class="summary-total">
      <span>${__('Total à virer')}</span>
      <span>${(promo ? promo.finalTotal : baseTotal).toLocaleString('fr-FR')} ${getCurrency()}</span>
    </div>`;
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
    if (!res.ok) { showToast(data.error || __('Identifiants incorrects'), 'error'); return; }
    state.isAdmin = true; state.adminToken = data.token; state.adminUsername = u;
    saveState();
    listenOrders(); listenProducts(); fetchCustomers();
    showPage('admin'); renderAdminDashboard();
    showToast(__('Bienvenue Administrateur'), 'success');
  } catch { showToast(__('Erreur réseau'), 'error'); }
}

function adminLogout() {
  state.isAdmin = false; state.adminToken = null; state.adminUsername = null; state.orders = [];
  saveState(); showPage('home'); showToast(__('Déconnecté'), 'info');
}

function adminSection(name) {
  document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
  document.getElementById('admin-' + name).classList.add('active');
  document.querySelectorAll('.admin-nav-item').forEach(i => i.classList.remove('active'));
  const nav = document.querySelector(`.admin-nav-item[onclick="adminSection('${name}')"]`);
  if (nav) nav.classList.add('active');
  if (name === 'settings') { loadSettings(); loadAdminReviews(); }
  if (name === 'videos') renderAdminVideos();
  if (name === 'newsletter') { loadSettings(); loadSubscribers(); }
  adminNavMobileCollapse();
}

// ── Dashboard ─────────────────────────────────────────────────
function renderAdminDashboard() {
  const pending   = state.orders.filter(o => o.status === 'pending').length;
  const confirmed = state.orders.filter(o => o.status === 'confirmed').length;
  const revenue   = state.orders
    .filter(o => ['confirmed','shipping','delivered'].includes(o.status))
    .reduce((s, o) => s + o.total, 0);
  document.getElementById('admin-stats').innerHTML = `
    <div class="stat-card"><div class="stat-label">${__('Commandes Totales')}</div><div class="stat-value">${state.orders.length}</div></div>
    <div class="stat-card"><div class="stat-label">En Attente</div><div class="stat-value" style="color:var(--orange)">${pending}</div></div>
    <div class="stat-card"><div class="stat-label">${__('Confirmées')}</div><div class="stat-value" style="color:var(--green)">${confirmed}</div></div>
    <div class="stat-card"><div class="stat-label">Produits</div><div class="stat-value">${state.products.length}</div></div>
    <div class="stat-card"><div class="stat-label">Clients</div><div class="stat-value">${state.customers.length}</div></div>
    <div class="stat-card"><div class="stat-label">Chiffre d'Affaires</div><div class="stat-value" style="font-size:28px">${revenue >= 1000 ? (revenue/1000).toFixed(1) + 'K' : revenue.toLocaleString('fr-FR')}</div><div class="stat-sub"> ${getCurrency()} confirmé</div></div>`;
}

// ── Commandes admin ───────────────────────────────────────────
function renderAdminOrders() {
  const tbody = document.getElementById('orders-tbody');
  if (!tbody) return;
  tbody.innerHTML = state.orders.map(o => {
    const tid    = escHtml(o.id);
    const { icon, label } = statusInfo(o.status || 'pending');
    return `
    <tr>
      <td style="color:var(--gold);font-family:'Cormorant Garamond',serif">${tid}</td>
      <td>
        <div>${escHtml(o.customer)}</div>
        <div style="font-size:11px;color:var(--text-dim)">${escHtml(o.userId || o.userid || '')}</div>
      </td>
      <td style="font-size:12px">${(o.items||[]).map(i => escHtml(i.product_name) + ' ×' + i.quantity).join('<br>')}</td>
      <td style="color:var(--gold);font-family:'Cormorant Garamond',serif">${o.total.toLocaleString('fr-FR')} ${getCurrency()}</td>
      <td>${o.proof_url
          ? `<img class="proof-thumb" src="${escHtml(o.proof_url)}" onclick="viewProof('${tid}')" title="Voir la preuve">`
          : '<span style="color:var(--text-dim);font-size:11px">Aucune</span>'}</td>
      <td><span class="status-badge badge-${o.status || 'pending'}" style="display:inline-flex;align-items:center;gap:4px">${icon} ${label}</span></td>
      <td style="display:flex;gap:6px;flex-wrap:wrap;align-items:center">
        ${o.status === 'pending' && o.proof_url ? `<button class="action-btn btn-validate" onclick="validateOrder('${tid}')">${__('Valider')}</button>` : ''}
        <button class="action-btn btn-update" onclick="openStatusModal('${tid}')">${__('Statut')}</button>
        <button class="action-btn btn-danger"  onclick="deleteOrder('${tid}')">${__('Supprimer')}</button>
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
    if (!res.ok) { showToast(__('Erreur validation'), 'error'); return; }
    showToast(__('Commande') + ' ' + orderId + ' ' + __('validée'), 'success'); listenOrders();
  } catch { showToast(__('Erreur validation'), 'error'); }
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
    if (!res.ok) { showToast(__('Erreur statut'), 'error'); return; }
    closeModal('modal-status'); showToast(__('Statut mis à jour'), 'success'); listenOrders();
  } catch { showToast(__('Erreur statut'), 'error'); }
}

async function deleteOrder(orderId) {
  if (!confirm(__('Supprimer cette commande ?'))) return;
  try {
    const res = await fetch('/api/orders/' + encodeURIComponent(orderId), {
      method: 'DELETE', headers: adminHeaders()
    });
    if (!res.ok) { showToast(__('Erreur suppression'), 'error'); return; }
    showToast(__('Commande supprimée'), 'info'); listenOrders();
  } catch { showToast(__('Erreur suppression'), 'error'); }
}

// ── Produits admin ────────────────────────────────────────────
function renderAdminProducts() {
  const grid = document.getElementById('admin-products-grid');
  if (!grid) return;
  grid.innerHTML = state.products.map(p => `
    <div class="product-admin-card">
      <div class="product-admin-img">
        ${p.images && p.images.length > 0 ? `<img src="${escHtml(p.images[0])}" alt="${escHtml(p.name)}">` : SVG.perfume}
      </div>
      <div class="product-admin-info">
        <h4>${escHtml(p.name)}</h4>
        <div class="price">${p.price.toLocaleString('fr-FR')} ${getCurrency()}</div>
        <div style="font-size:11px;color:var(--text-dim);margin-bottom:14px">
          ${escHtml(p.category)} — ${escHtml(p.quantite)} — ${(p.images||[]).length} photo(s)
        </div>
        <div class="admin-btn-row">
          <button class="action-btn btn-update" onclick="openEditProduct(${p.id})">${__('Modifier')}</button>
          <button class="action-btn btn-danger"  onclick="deleteProduct(${p.id})">${__('Supprimer')}</button>
        </div>
      </div>
    </div>
  `).join('');
}

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
  if (!name || !price || !desc) { showToast(__('Remplissez tous les champs'), 'error'); return; }

  showToast(__('Envoi des photos en cours…'), 'info');
  let images = [];
  try {
    for (const file of newProdFiles) {
      const dataUri = await readFileAsDataUrl(file);
      const url     = await uploadToCloud(dataUri, 'image', state.adminToken);
      images.push(url);
    }
  } catch (err) {
    showToast(__('Erreur upload image') + ' : ' + err.message, 'error'); return;
  }

  try {
    const res = await fetch('/api/products', {
      method: 'POST', headers: adminHeaders(),
      body: JSON.stringify({ id: Date.now(), name, price, category, quantite, desc, images })
    });
    if (!res.ok) { showToast(__('Erreur création produit'), 'error'); return; }
    newProdFiles = [];
    document.getElementById('img-preview-grid').innerHTML = '';
    document.getElementById('prod-name').value    = '';
    document.getElementById('prod-price').value   = '';
    document.getElementById('prod-quantite').value = '';
    document.getElementById('prod-desc').value    = '';
    showToast(__('Produit ajouté avec succès'), 'success'); listenProducts();
  } catch { showToast(__('Erreur création produit'), 'error'); }
}

function openEditProduct(id) {
  const p = state.products.find(pr => pr.id == id);
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
      const prod = state.products.find(pr => pr.id == id);
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
      lbl.textContent = 'Nouveau';
      lbl.style.cssText = 'position:absolute;top:4px;left:4px;background:var(--gold);color:var(--dark);font-size:9px;padding:2px 5px;letter-spacing:1px';
      item.appendChild(img); item.appendChild(lbl); grid.appendChild(item);
    };
    reader.readAsDataURL(file);
  });
}

async function saveEditProduct() {
  const id = state.currentEditProductId;
  const p  = state.products.find(pr => pr.id == id);
  let existingImages = p ? [...(p.images || [])] : [];

  if (editProdFiles.length > 0) {
    showToast(__('Envoi des nouvelles photos…'), 'info');
    try {
      for (const file of editProdFiles) {
        const dataUri = await readFileAsDataUrl(file);
        const url     = await uploadToCloud(dataUri, 'image', state.adminToken);
        existingImages.push(url);
      }
    } catch (err) {
      showToast(__('Erreur upload') + ' : ' + err.message, 'error'); return;
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
    if (!res.ok) { showToast(__('Erreur modification'), 'error'); return; }
    editProdFiles = [];
    closeModal('modal-edit-product');
    showToast(__('Produit mis à jour'), 'success'); listenProducts();
  } catch { showToast(__('Erreur modification'), 'error'); }
}

async function deleteProduct(id) {
  if (!confirm(__('Supprimer ce produit ?'))) return;
  try {
    const res = await fetch('/api/products/' + id, { method: 'DELETE', headers: adminHeaders() });
    if (!res.ok) { showToast(__('Erreur suppression'), 'error'); return; }
    showToast(__('Produit supprimé'), 'info'); listenProducts();
  } catch { showToast(__('Erreur suppression'), 'error'); }
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
  if (state.videos.length === 0) {
    grid.innerHTML = "<p style='text-align:center;color:var(--text-dim);padding:60px 0'>Aucune vidéo disponible pour le moment</p>";
    return;
  }
  grid.innerHTML = state.videos.map(v => `
    <div style="background:var(--dark-2);border:1px solid rgba(201,169,110,0.1);padding:24px">
      <h3 style="font-family:'Cormorant Garamond',serif;font-size:22px;color:var(--cream);margin-bottom:16px">${escHtml(v.title)}</h3>
      <video src="${escHtml(v.url)}" controls style="width:100%;max-height:480px;background:#000"></video>
    </div>
  `).join('');
}

function renderAdminVideos() {
  const box = document.getElementById('admin-videos-list');
  if (!box) return;
  if (state.videos.length === 0) { box.innerHTML = '<p style="color:var(--text-dim);font-size:13px">Aucune vidéo publiée</p>'; return; }
  box.innerHTML = state.videos.map(v => `
    <div style="margin-bottom:16px;padding:16px;background:var(--dark-2);border:1px solid rgba(201,169,110,0.1);display:flex;gap:20px;align-items:flex-start;flex-wrap:wrap">
      <div style="flex:1;min-width:200px">
        <div style="color:var(--cream);font-family:'Cormorant Garamond',serif;font-size:18px;margin-bottom:8px">${escHtml(v.title)}</div>
        <video src="${escHtml(v.url)}" controls style="width:100%;max-width:300px;border-radius:4px;background:#000"></video>
      </div>
      <button class="action-btn btn-danger" style="flex-shrink:0" onclick="deleteVideo(${v.id})">${__('Supprimer')}</button>
    </div>
  `).join('');
}

// Upload vidéo → Cloudinary → DB
async function uploadVideo() {
  const title     = document.getElementById('video-title').value.trim();
  const fileInput = document.getElementById('video-file');
  const file      = fileInput && fileInput.files[0];
  const statusDiv = document.getElementById('video-upload-status');

  if (!title) { showToast(__('Titre requis'), 'error'); return; }
  if (!file)  { showToast(__('Fichier vidéo requis'), 'error'); return; }

  // Vérification taille fichier
  const maxMB = 400;
  if (file.size > maxMB * 1024 * 1024) {
    showToast(__('Fichier trop lourd') + ' (max ' + maxMB + ' Mo)', 'error'); return;
  }

  statusDiv.style.display = 'flex';
  showToast(__('Envoi de la vidéo en cours…'), 'info');

  try {
    const dataUri = await readFileAsDataUrl(file);
    const url     = await uploadToCloud(dataUri, 'video', state.adminToken);

    const res = await fetch('/api/videos', {
      method: 'POST', headers: adminHeaders(),
      body: JSON.stringify({ title, url })
    });
    const data = await res.json();
    if (!res.ok) { showToast(data.error || __('Erreur enregistrement vidéo'), 'error'); statusDiv.style.display = 'none'; return; }
    document.getElementById('video-title').value = '';
    fileInput.value = '';
    statusDiv.style.display = 'none';
    showToast(__('Vidéo publiée avec succès'), 'success'); listenVideos();
  } catch (err) {
    statusDiv.style.display = 'none';
    showToast(__('Erreur upload') + ' : ' + err.message, 'error');
  }
}

async function deleteVideo(id) {
  if (!confirm(__('Supprimer cette vidéo ?'))) return;
  try {
    const res = await fetch('/api/videos/' + id, { method: 'DELETE', headers: adminHeaders() });
    if (!res.ok) { showToast(__('Erreur suppression'), 'error'); return; }
    showToast(__('Vidéo supprimée'), 'info'); listenVideos();
  } catch { showToast(__('Erreur suppression'), 'error'); }
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
//  PAGE PROFIL
// ════════════════════════════════════════════════════════════
function renderProfile() {
  if (!state.currentUser) return;
  const u = state.currentUser;
  const initials = u.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const el = id => document.getElementById(id);

  // Avatar — photo ou initiales
  const avatarEl = el('profile-avatar');
  if (avatarEl) {
    if (u.photoUrl) {
      avatarEl.innerHTML = `<img src="${escHtml(u.photoUrl)}" alt="Photo de profil">`;
    } else {
      avatarEl.textContent = initials;
    }
  }

  if (el('profile-name-display')) el('profile-name-display').textContent = u.name;
  if (el('profile-email-display'))el('profile-email-display').textContent = u.email;
  if (el('profile-name-input'))   el('profile-name-input').value = u.name;

  // Commandes validées uniquement (confirmed, shipping, delivered)
  const validatedOrders = state.orders.filter(o =>
    ['confirmed','shipping','delivered'].includes(o.status)
  );
  const box = el('profile-orders-summary');
  if (box) {
    if (validatedOrders.length === 0) {
      box.innerHTML = '<span>' + __('Aucune commande validée') + '</span>';
    } else {
      const delivered = validatedOrders.filter(o => o.status === 'delivered').length;
      const shipping  = validatedOrders.filter(o => o.status === 'shipping').length;
      box.innerHTML = `
        <span style="color:var(--gold);font-family:'Cormorant Garamond',serif;font-size:28px">${validatedOrders.length}</span>
        <span style="display:block;font-size:11px;letter-spacing:2px;margin-top:4px">
          commande${validatedOrders.length>1?'s':''} validée${validatedOrders.length>1?'s':''}
          ${shipping  ? ` · ${shipping} ` + __('en livraison')  : ''}
          ${delivered ? ` · ${delivered} ` + (delivered > 1 ? __('Livrées') : __('Livrée')) : ''}
        </span>
        <div style="margin-top:16px;border-top:1px solid rgba(201,169,110,0.1);padding-top:12px">
          ${validatedOrders.slice(0,3).map(o => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid rgba(201,169,110,0.06);font-size:12px">
              <span style="color:var(--text-dim)">${o.trackingCode || o.id}</span>
              <span style="color:var(--cream)">${(o.total||0).toLocaleString('fr-FR')} ${getCurrency()}</span>
              <span style="padding:2px 8px;font-size:9px;letter-spacing:2px;${
                o.status==='delivered' ? 'color:var(--green);border:1px solid rgba(39,174,96,0.4)' :
                o.status==='shipping'  ? 'color:var(--blue);border:1px solid rgba(41,128,185,0.4)' :
                                         'color:var(--gold);border:1px solid rgba(201,169,110,0.3)'
              }">${
                o.status==='delivered' ? 'LIVRÉ' :
                o.status==='shipping'  ? 'EN COURS' : 'CONFIRMÉ'
              }</span>
            </div>`).join('')}
        </div>`;
    }
  }

  // Clear password fields
  ['profile-pwd-current','profile-pwd-new','profile-pwd-confirm'].forEach(id => {
    const f = el(id); if (f) f.value = '';
  });
  // Contacts de la boutique
  const contactsSection = el('profile-contacts-section');
  const contactsContent = el('profile-contacts-content');
  const s = state.settings || {};
  const hasContacts = s.sitePhone || s.siteEmail || s.siteWhatsapp || s.siteInstagram || s.siteFacebook || s.siteAddress;
  if (contactsSection) contactsSection.style.display = hasContacts ? '' : 'none';
  if (contactsContent && hasContacts) {
    const rows = [
      s.sitePhone     && `<div style="display:flex;align-items:center;gap:10px"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" stroke-width="1.8"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.59 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg><a href="tel:${escHtml(s.sitePhone)}" style="color:var(--text-dim);text-decoration:none">${escHtml(s.sitePhone)}</a></div>`,
      s.siteWhatsapp  && `<div style="display:flex;align-items:center;gap:10px"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" stroke-width="1.8"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg><a href="https://wa.me/${s.siteWhatsapp.replace(/\D/g,'')}" target="_blank" style="color:var(--text-dim);text-decoration:none">${escHtml(s.siteWhatsapp)}</a></div>`,
      s.siteEmail     && `<div style="display:flex;align-items:center;gap:10px"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" stroke-width="1.8"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg><a href="mailto:${escHtml(s.siteEmail)}" style="color:var(--text-dim);text-decoration:none">${escHtml(s.siteEmail)}</a></div>`,
      s.siteInstagram && `<div style="display:flex;align-items:center;gap:10px"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" stroke-width="1.8"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg><a href="https://instagram.com/${escHtml(s.siteInstagram).replace(/^@/,'')}" target="_blank" style="color:var(--text-dim);text-decoration:none">${escHtml(s.siteInstagram)}</a></div>`,
      s.siteFacebook  && `<div style="display:flex;align-items:center;gap:10px"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" stroke-width="1.8"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg><a href="https://facebook.com/${escHtml(s.siteFacebook).replace(/^@/,'')}" target="_blank" style="color:var(--text-dim);text-decoration:none">${escHtml(s.siteFacebook)}</a></div>`,
      s.siteTiktok    && `<div style="display:flex;align-items:center;gap:10px"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" stroke-width="1.8"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg><a href="https://tiktok.com/@${escHtml(s.siteTiktok).replace(/^@/,'')}" target="_blank" style="color:var(--text-dim);text-decoration:none">${escHtml(s.siteTiktok)}</a></div>`,
      s.siteAddress   && `<div style="display:flex;align-items:center;gap:10px"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" stroke-width="1.8"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg><span style="color:var(--text-dim)">${escHtml(s.siteAddress)}</span></div>`,
    ].filter(Boolean);
    contactsContent.innerHTML = rows.join('');
  }
}

// ════════════════════════════════════════════════════════════
//  PHOTO DE PROFIL
// ════════════════════════════════════════════════════════════
async function handleAvatarUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) { showToast(__('Image trop lourde') + ' (max 5 Mo)', 'error'); return; }
  showToast(__('Envoi de la photo…'), 'info');
  try {
    const dataUri = await readFileAsDataUrl(file);
    const url     = await uploadProofToCloud(dataUri);
    const res = await fetch('/api/auth/photo', {
      method: 'PATCH', headers: userHeaders(),
      body: JSON.stringify({ photoUrl: url }),
    });
    if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Erreur'); }
    state.currentUser.photoUrl = url;
    saveState();
    renderProfile();
    showToast(__('Photo de profil mise à jour'), 'success');
  } catch (err) {
    showToast(__('Erreur') + ' : ' + err.message, 'error');
  }
}

async function saveProfileName() {
  const input = document.getElementById('profile-name-input');
  const name  = input ? input.value.trim() : '';
  if (!name) { showToast(__('Le nom ne peut pas être vide'), 'error'); return; }
  try {
    const res = await fetch('/api/auth/profile', {
      method: 'PATCH', headers: userHeaders(),
      body: JSON.stringify({ name }),
    });
    if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Erreur'); }
    state.currentUser.name = name;
    saveState(); updateNavUser(); renderProfile();
    showToast(__('Nom mis à jour'), 'success');
  } catch(e) { showToast(e.message, 'error'); }
}

async function saveProfilePassword() {
  const current  = document.getElementById('profile-pwd-current')?.value || '';
  const newPwd   = document.getElementById('profile-pwd-new')?.value || '';
  const confirm  = document.getElementById('profile-pwd-confirm')?.value || '';
  if (!current || !newPwd) { showToast(__('Remplissez tous les champs'), 'error'); return; }
  if (newPwd.length < 6)   { showToast(__('Mot de passe trop court') + ' (6 min)', 'error'); return; }
  if (newPwd !== confirm)  { showToast(__('Les mots de passe ne correspondent pas'), 'error'); return; }
  try {
    const res = await fetch('/api/auth/password', {
      method: 'PATCH', headers: userHeaders(),
      body: JSON.stringify({ currentPassword: current, newPassword: newPwd }),
    });
    if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Erreur'); }
    ['profile-pwd-current','profile-pwd-new','profile-pwd-confirm'].forEach(id => {
      const f = document.getElementById(id); if (f) f.value = '';
    });
    showToast(__('Mot de passe mis à jour'), 'success');
  } catch(e) { showToast(e.message, 'error'); }
}

// ════════════════════════════════════════════════════════════
//  NEWSLETTER
// ════════════════════════════════════════════════════════════



// Render social media icons from settings
function renderSocialMedia() {
  const container = document.getElementById('social-icons');
  if (!container) return;
  const s = state.settings || {};
  
  // Helper to build proper social URLs
  function socialUrl(key, val) {
    if (!val || !val.trim()) return '';
    val = val.trim();
    if (val.startsWith('http://') || val.startsWith('https://')) return val;
    if (val.startsWith('wa.me/')) return 'https://' + val;
    switch (key) {
      case 'siteInstagram': return 'https://instagram.com/' + val.replace(/^@/, '');
      case 'siteFacebook':  return 'https://facebook.com/' + val.replace(/^@/, '');
      case 'siteTiktok':    return 'https://tiktok.com/@' + val.replace(/^@/, '');
      default: return val;
    }
  }
  
  // Always show all 4 icons, linked if configured, grayed out if not
  const allLinks = [
    { key: 'siteInstagram', label: 'Instagram', url: socialUrl('siteInstagram', s.siteInstagram),
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>' },
    { key: 'siteFacebook', label: 'Facebook', url: socialUrl('siteFacebook', s.siteFacebook),
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>' },
    { key: 'siteWhatsapp', label: 'WhatsApp', url: s.siteWhatsapp ? 'https://wa.me/' + s.siteWhatsapp.replace(/\D/g,'') : '',
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>' },
    { key: 'siteTiktok', label: 'TikTok', url: socialUrl('siteTiktok', s.siteTiktok),
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 12a4 4 0 1 0 4 4V4h5"/></svg>' },
  ];
  
  const html = allLinks.map(item => {
    const hasUrl = item.url && item.url.trim();
    if (hasUrl) {
      return `<a href="${escHtml(item.url)}" target="_blank" rel="noopener noreferrer" class="social-icon-link" title="${escHtml(item.label)}">${item.svg}</a>`;
    } else {
      return `<span class="social-icon-link social-icon-disabled" title="${escHtml(item.label)} (${__('Non configuré')})">${item.svg}</span>`;
    }
  }).join('');
  
  container.innerHTML = html;
  
  // Update brand name display
  const brandEl = document.getElementById('social-brand-name');
  if (brandEl) {
    const lang = _currentLang || 'fr';
    const names = {fr:'LUMIÈRE',en:'LIGHT',es:'LUZ',pt:'LUZ',ar:'نور',de:'LICHT'};
    brandEl.textContent = names[lang] || 'LUMIÈRE';
  }
  
  // Update contact email from settings
  updateContactEmail();
}

async function subscribeNewsletter() {
  const email = document.getElementById('newsletter-email').value.trim();
  const msg = document.getElementById('newsletter-msg');
  if (!email) {
    msg.textContent = __('Veuillez entrer votre email');
    msg.style.display = 'block';
    msg.style.color = 'var(--red)';
    return;
  }
  try {
    const res = await fetch('/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    if (!res.ok) {
      let errMsg = 'Erreur ' + res.status + ': ' + res.statusText;
      try {
        const data = await res.json();
        if (data.error) errMsg = data.error;
      } catch (_) {
        try {
          const text = await res.text();
          if (text && text.length < 200) errMsg = text;
        } catch (__) {}
      }
      throw new Error(errMsg);
    }
    const data = await res.json();
    msg.textContent = __('Merci pour votre inscription !');
    msg.style.display = 'block';
    msg.style.color = 'var(--green)';
    document.getElementById('newsletter-email').value = '';
  } catch (err) {
    console.error('Newsletter error:', err);
    msg.textContent = err.message || __('Erreur');
    msg.style.display = 'block';
    msg.style.color = 'var(--red)';
  }
}

// ════════════════════════════════════════════════════════════
//  NEWSLETTER — Admin
// ════════════════════════════════════════════════════════════

async function loadSubscribers() {
  const list = document.getElementById('subscriber-list');
  if (!list) return;
  try {
    const res = await fetch('/api/newsletter/subscribers', { headers: adminHeaders() });
    if (!res.ok) { list.innerHTML = '<p style="color:var(--red);font-size:13px">Erreur chargement abonnés</p>'; return; }
    const subs = await res.json();
    if (!subs.length) {
      list.innerHTML = '<p style="color:var(--text-dim);font-size:13px">Aucun abonné pour le moment.</p>';
      return;
    }
    list.innerHTML = '<div style="overflow-x:auto">' +
      '<table style="width:100%;border-collapse:collapse;font-size:13px">' +
      '<thead>' +
      '<tr style="border-bottom:1px solid rgba(201,169,110,0.3)">' +
      '<th style="padding:10px;text-align:left;color:var(--gold)">Email</th>' +
      '<th style="padding:10px;text-align:left;color:var(--gold)">Date d\'inscription</th>' +
      '<th style="padding:10px;text-align:right;color:var(--gold)">Action</th>' +
      '</tr>' +
      '</thead>' +
      '<tbody>' +
      subs.map(s => '<tr style="border-bottom:1px solid rgba(255,255,255,0.05)">' +
        '<td style="padding:10px">' + escHtml(s.email) + '</td>' +
        '<td style="padding:10px;color:var(--text-dim)">' + new Date(s.created_at).toLocaleDateString() + '</td>' +
        '<td style="padding:10px;text-align:right">' +
        '<button onclick="deleteSubscriber(' + s.id + ')" style="background:none;border:none;color:var(--red);cursor:pointer;font-size:11px">Supprimer</button>' +
        '</td>' +
        '</tr>'
      ).join('') +
      '</tbody>' +
      '</table>' +
      '</div>' +
      '<p style="color:var(--text-dim);font-size:12px;margin-top:12px">Total: ' + subs.length + ' abonné' + (subs.length > 1 ? 's' : '') + '</p>';
  } catch {
    list.innerHTML = '<p style="color:var(--red);font-size:13px">Erreur chargement abonnés</p>';
  }
}

async function deleteSubscriber(id) {
  if (!confirm('Supprimer cet abonné ?')) return;
  try {
    const res = await fetch('/api/newsletter/subscribers/' + id, {
      method: 'DELETE', headers: adminHeaders()
    });
    if (!res.ok) { showToast('Erreur suppression', 'error'); return; }
    showToast('Abonné supprimé', 'info');
    loadSubscribers();
  } catch { showToast('Erreur suppression', 'error'); }
}

async function sendNewsletter() {
  const subject = document.getElementById('nl-subject').value.trim();
  const html = document.getElementById('nl-html').value.trim();
  const msg = document.getElementById('nl-msg');
  if (!subject || !html) {
    msg.textContent = 'Remplissez le sujet et le contenu.';
    msg.style.display = 'block'; msg.style.color = 'var(--red)';
    return;
  }
  msg.textContent = 'Envoi en cours...';
  msg.style.display = 'block'; msg.style.color = 'var(--text-dim)';
  try {
    const res = await fetch('/api/newsletter/send', {
      method: 'POST',
      headers: Object.assign(adminHeaders(), { 'Content-Type': 'application/json' }),
      body: JSON.stringify({ subject, html })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    msg.textContent = 'Newsletter envoyée à ' + data.sent + ' abonné(s) !';
    msg.style.color = 'var(--green)';
    document.getElementById('nl-subject').value = '';
    document.getElementById('nl-html').value = '';
  } catch (err) {
    msg.textContent = err.message || 'Erreur envoi newsletter';
    msg.style.color = 'var(--red)';
  }
}

function renderStars(rating) {
  return '★'.repeat(rating) + '☆'.repeat(5 - rating);
}

async function loadReviews() {
  const grid = document.getElementById('reviews-grid');
  if (!grid) return;
  try {
    const res = await fetch('/api/reviews');
    if (!res.ok) return;
    const reviews = await res.json();
    if (!reviews.length) {
      grid.innerHTML = `<p style="text-align:center;color:var(--text-dim);font-size:13px;padding:40px 0">${__('Soyez le premier à donner votre avis')}</p>`;
      return;
    }
    grid.innerHTML = reviews.map((r, i) => `
      <div class="review-card" style="opacity:0;transform:translateY(30px)">
        <div class="review-stars">${renderStars(r.rating)}</div>
        <div class="review-content">${escHtml(translateContent(r.content))}</div>
        <div class="review-author">${escHtml(r.name)}</div>
        ${r.product ? `<div class="review-product">${escHtml(translateContent(r.product))}</div>` : ''}
      </div>
    `).join('');
    // Animate review cards with motion (inView + CSS transitions)
    const cards = grid.querySelectorAll('.review-card');
    if (typeof Motion !== 'undefined' && Motion.inView) {
      cards.forEach((card, i) => {
        card.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        card.style.transitionDelay = (i * 0.1) + 's';
        Motion.inView(card, () => {
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }, { amount: 0.2 });
      });
    } else {
      // Fallback - stagger with setTimeout
      cards.forEach((card, i) => {
        setTimeout(() => {
          card.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }, i * 100);
      });
    }
  } catch (_) {}
}

async function submitReview() {
  const name = document.getElementById('review-name').value.trim();
  const product = document.getElementById('review-product').value.trim();
  const content = document.getElementById('review-content').value.trim();
  const rating = parseInt(document.getElementById('review-rating').value) || 5;
  const msg = document.getElementById('review-form-msg');
  
  if (!name || !content) {
    msg.textContent = __('Veuillez remplir votre nom et votre avis');
    msg.style.display = 'block';
    msg.style.color = 'var(--red)';
    return;
  }
  
  try {
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, product, content, rating })
    });
    const data = await res.json();
    if (!res.ok) {
      msg.textContent = data.error || __('Erreur');
      msg.style.display = 'block';
      msg.style.color = 'var(--red)';
      return;
    }
    msg.textContent = __('Merci pour votre avis !');
    msg.style.display = 'block';
    msg.style.color = 'var(--green)';
    document.getElementById('review-name').value = '';
    document.getElementById('review-product').value = '';
    document.getElementById('review-content').value = '';
    document.getElementById('review-rating').value = '5';
  } catch (_) {
    msg.textContent = __('Erreur réseau');
    msg.style.display = 'block';
    msg.style.color = 'var(--red)';
  }
}

// Admin: load all reviews
async function loadAdminReviews() {
  const box = document.getElementById('admin-reviews-list');
  if (!box) return;
  try {
    const res = await fetch('/api/reviews/all', { headers: adminHeaders() });
    if (!res.ok) { box.innerHTML = '<p style="color:var(--text-dim);padding:16px">Erreur chargement</p>'; return; }
    const reviews = await res.json();
    if (!reviews.length) {
      box.innerHTML = '<p style="color:var(--text-dim);padding:16px 0">Aucun avis pour le moment</p>';
      return;
    }
    box.innerHTML = reviews.map(r => `
      <div style="background:var(--dark-3);padding:16px;margin-bottom:12px;border-left:3px solid ${r.approved ? 'var(--green)' : 'var(--orange)'}">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
          <div>
            <strong style="color:var(--gold);font-size:13px">${escHtml(r.name)}</strong>
            <span style="color:var(--text-dim);font-size:11px;margin-left:8px">${r.product ? escHtml(r.product) : ''}</span>
            <span style="color:var(--gold);font-size:11px;margin-left:8px">${renderStars(r.rating)}</span>
          </div>
          <div style="display:flex;gap:8px">
            ${!r.approved ? `<button class="btn-admin" onclick="approveReview(${r.id})" style="background:var(--green);color:#fff">Approuver</button>` : ''}
            <button class="btn-admin" onclick="deleteReview(${r.id})" style="background:var(--red);color:#fff">Supprimer</button>
          </div>
        </div>
        <p style="color:var(--text);font-size:13px;margin-top:8px">${escHtml(r.content)}</p>
        <div style="font-size:10px;color:var(--text-dim);margin-top:8px">${new Date(r.created_at).toLocaleDateString()}</div>
      </div>
    `).join('');
  } catch (_) { box.innerHTML = '<p style="color:var(--text-dim);padding:16px">Erreur réseau</p>'; }
}

async function approveReview(id) {
  try {
    const res = await fetch('/api/reviews/' + id, {
      method: 'PUT', headers: adminHeaders(),
      body: JSON.stringify({ approved: true })
    });
    if (!res.ok) return;
    loadAdminReviews();
    loadReviews();
  } catch (_) {}
}

async function deleteReview(id) {
  if (!confirm(__('Supprimer cet avis ?'))) return;
  try {
    const res = await fetch('/api/reviews/' + id, {
      method: 'DELETE', headers: adminHeaders()
    });
    if (!res.ok) return;
    loadAdminReviews();
    loadReviews();
  } catch (_) {}
}

// ════════════════════════════════════════════════════════════
//  I18N — TRADUCTION AUTOMATIQUE PAR LANGUE DU NAVIGATEUR
// ════════════════════════════════════════════════════════════
const I18N = {
  fr: {
    'Adresse de livraison':'Adresse de livraison',    'Adresse de livraison requise':'Adresse de livraison requise',    'Ajouter':'Ajouter',    'Ajouter au Panier':'Ajouter au Panier',    'Ajouter des images':'Ajouter des images',    'Ajoutez une preuve de paiement':'Ajoutez une preuve de paiement',    'Annuler':'Annuler',    'Appliquer':'Appliquer',    'Aucun code promo créé':'Aucun code promo créé',    'Aucun produit dans cette catégorie':'Aucun produit dans cette catégorie',    'Bienvenue':'Bienvenue',    'Bienvenue Administrateur':'Bienvenue Administrateur',    'Bon Retour':'Bon Retour',    'Chargement…':'Chargement…',    'Code Promo':'Code Promo',    'Code promo créé : ':'Code promo créé : ',    'Code supprimé':'Code supprimé',    'Collection Exclusive — Parfums Premium':'Collection Exclusive — Parfums Premium',    'Commande':'Commande',    'Commande Envoyée':'Commande Envoyée',    'Commande introuvable':'Commande introuvable',    'Commande supprimée':'Commande supprimée',    'Commander':'Commander',    'Commandes Totales':'Commandes Totales',    'Compte créé':'Compte créé',    'Confirmer':'Confirmer',    'Confirmé':'Confirmé',    'Confirmées':'Confirmées',    'Connectez-vous à votre compte':'Connectez-vous à votre compte',    'Connexion requise':'Connexion requise',    'Conservez ce code précieusement.':'Conservez ce code précieusement.',    'Contact':'Contact',    'Continuer mes achats':'Continuer mes achats',    'Créer un Compte':'Créer un Compte',    'Créez votre compte':'Créez votre compte',    'Des fragrances rares, soigneusement sélectionnées pour les esprits raffinés':'Des fragrances rares, soigneusement sélectionnées pour les esprits raffinés',    'Déconnecté':'Déconnecté',    'Découvrez nos parfums en vidéo':'Découvrez nos parfums en vidéo',    'Découvrir la Collection':'Découvrir la Collection',    'En Livraison':'En Livraison',    'En livraison':'En livraison',    'Enregistrer':'Enregistrer',    'Entrez un code':'Entrez un code',    'Entrez un code de suivi':'Entrez un code de suivi',    'Entrez un code promo':'Entrez un code promo',    'Entrez une valeur de réduction':'Entrez une valeur de réduction',    'Envoi de la photo…':'Envoi de la photo…',    'Envoi de la vidéo en cours…':'Envoi de la vidéo en cours…',    'Envoi des nouvelles photos…':'Envoi des nouvelles photos…',    'Envoi des photos en cours…':'Envoi des photos en cours…',    'Envoi en cours, veuillez patienter…':'Envoi en cours, veuillez patienter…',    'Envoi en cours…':'Envoi en cours…',    'Erreur':'Erreur',    'Erreur commande':'Erreur commande',    'Erreur création produit':'Erreur création produit',    'Erreur modification':'Erreur modification',    'Erreur réseau':'Erreur réseau',    'Erreur sauvegarde':'Erreur sauvegarde',    'Erreur statut':'Erreur statut',    'Erreur suppression':'Erreur suppression',    'Erreur upload : ':'Erreur upload : ',    'Erreur upload image : ':'Erreur upload image : ',    'Erreur validation':'Erreur validation',    'Femme':'Femme',    'Fichier trop lourd':'Fichier trop lourd',    'Fichier vidéo requis':'Fichier vidéo requis',    'Homme':'Homme',    'Il vous permet de suivre l\'état de votre commande à tout moment.':'Il vous permet de suivre l\'état de votre commande à tout moment.',    'Image trop lourde':'Image trop lourde',    'L\'Art du':'L\'Art du',    'La Boutique':'La Boutique',    'La collection arrive bientôt…':'La collection arrive bientôt…',    'Le nom ne peut pas être vide':'Le nom ne peut pas être vide',    'Les mots de passe ne correspondent pas':'Les mots de passe ne correspondent pas',    'Livraison':'Livraison',    'Livré':'Livré',    'Maison de Parfums Exclusifs':'Maison de Parfums Exclusifs',    'Mes commandes':'Mes commandes',    'Mixte':'Mixte',    'Modifier':'Modifier',    'Mon Panier':'Mon Panier',    'Mon Profil':'Mon Profil',    'Mon Suivi':'Mon Suivi',    'Mot de passe mis à jour':'Mot de passe mis à jour',    'Mot de passe trop court':'Mot de passe trop court',    'Nom mis à jour':'Nom mis à jour',    'Nos Vidéos':'Nos Vidéos',    'Paiement':'Paiement',    'Paiement en Attente':'Paiement en Attente',    'Paiement en attente':'Paiement en attente',    'Paiement par Virement':'Paiement par Virement',    'Panier vide':'Panier vide',    'Paramètres sauvegardés':'Paramètres sauvegardés',    'Parfum':'Parfum',    'Passer au paiement':'Passer au paiement',    'Passer la Commande':'Passer la Commande',    'Photo de profil mise à jour':'Photo de profil mise à jour',    'Premium':'Premium',    'Preuve de Paiement':'Preuve de Paiement',    'Preuve de Paiement (Photo / Capture d\'écran requise)':'Preuve de Paiement (Photo / Capture d\'écran requise)',    'Prix':'Prix',    'Produit ajouté avec succès':'Produit ajouté avec succès',    'Produit mis à jour':'Produit mis à jour',    'Produit supprimé':'Produit supprimé',    'Profil':'Profil',    'Quantité':'Quantité',    'Recherche':'Recherche',    'Rechercher':'Rechercher',    'Remplissez tous les champs':'Remplissez tous les champs',    'Session expirée, reconnectez-vous':'Session expirée, reconnectez-vous',    'Soumettre la Commande':'Soumettre la Commande',    'Statut':'Statut',    'Statut mis à jour':'Statut mis à jour',    'Suivi':'Suivi',    'Suivre ma commande':'Suivre ma commande',    'Supprimer':'Supprimer',    'Supprimer ce code promo ?':'Supprimer ce code promo ?',    'Supprimer ce produit ?':'Supprimer ce produit ?',    'Supprimer cette commande ?':'Supprimer cette commande ?',    'Supprimer cette vidéo ?':'Supprimer cette vidéo ?',    'Titre requis':'Titre requis',    'Total':'Total',    'Total à virer':'Total à virer',    'Touchez pour photographier ou sélectionner':'Touchez pour photographier ou sélectionner',    'Touchez pour prendre une photo ou sélectionner une image':'Touchez pour prendre une photo ou sélectionner une image',    'Tous':'Tous',    'Tous les champs sont requis':'Tous les champs sont requis',    'Valider':'Valider',    'Veuillez vous connecter':'Veuillez vous connecter',    'Vider le Panier':'Vider le Panier',    'Vidéo publiée avec succès':'Vidéo publiée avec succès',    'Vidéo supprimée':'Vidéo supprimée',    'Voir votre Profil':'Voir votre Profil',    'Votre code de suivi':'Votre code de suivi',    'Votre commande a bien été reçue — en attente de validation':'Votre commande a bien été reçue — en attente de validation',    'Votre panier est vide':'Votre panier est vide',    'admin-login-btn':'Accéder au Panneau',    'admin-login-desc':'Accès restreint aux administrateurs autorisés uniquement',    'admin-login-title':'Accès Unique — Espace Administrateur',    'auth-login-btn':'Connexion',    'auth-login-desc':'Connectez-vous à votre compte',    'auth-register-btn':'Créer mon Compte',    'auth-register-desc':'Créez votre compte',    'auth-welcome':'Bienvenue',    'boutique-subtitle':'Collection Exclusive — Parfums Premium',    'boutique-title':'La Boutique',    'btn-login':'Connexion',    'btn-logout':'Déconnexion',    'cart-title':'Mon Panier',    'confirm-msg':'Votre commande a bien été reçue — en attente de validation',    'delivery-title':'Adresse de livraison',    'hero-btn-account':'Créer un Compte',    'hero-btn-shop':'Découvrir la Collection',    'hero-desc':'Des fragrances rares, soigneusement sélectionnées pour les esprits raffinés',    'hero-title-part1':'L\'Art du',    'hero-title-part2':'Parfum',    'hero-title-part3':'Premium',    'nav-boutique':'Boutique',    'nav-cart':'Panier',    'nav-home':'Accueil',    'nav-profile':'Mon Profil',    'nav-tracking':'Mon Suivi',    'nav-videos':'Vidéos',    'payment-title':'Paiement par Virement',    'profile-edit-title':'Modifier le nom',    'profile-name-label':'Nom complet',    'profile-orders-title':'Mes commandes',    'profile-pwd-btn':'Changer le mot de passe',    'profile-pwd-confirm':'Confirmer le mot de passe',    'profile-pwd-current':'Mot de passe actuel',    'profile-pwd-new':'Nouveau mot de passe',    'profile-pwd-title':'Changer le mot de passe',    'profile-save-btn':'Enregistrer',    'profile-see-orders':'Voir toutes mes commandes',    'proof-title':'Preuve de Paiement (Photo / Capture d\'écran requise)',    'submit-order':'Soumettre la Commande',    'track-btn':'Suivre ma commande',    'tracking-title':'Mon Suivi',    'validée':'validée',    'videos-subtitle':'Découvrez nos parfums en vidéo',    'videos-title':'Nos Vidéos',    'vérifiez le code':'vérifiez le code','footer-copy':'© 2026 Lumière Parfums · L\'art du parfum premium','Nous contacter':'Nous contacter','Nom du Site':'Nom du Site','Email':'Email','Enregistrer les contacts':'Enregistrer les contacts'
  ,
    'Newsletter':'Newsletter',
    'Avis Clients':'Avis Clients',
    'Ce que disent nos clients':'Ce que disent nos clients',
    'Donnez votre avis':'Donnez votre avis',
    'Partagez votre expérience avec nos parfums':'Partagez votre expérience avec nos parfums',
    'Votre nom':'Votre nom',
    'Produit':'Produit',
    'Votre avis':'Votre avis',
    'Note':'Note',
    'Envoyer mon avis':'Envoyer mon avis',
    'S\'abonner':'S\'abonner',
    'Recevez nos offres exclusives':'Recevez nos offres exclusives',
    'Une question ? Une commande spéciale ?':'Une question ? Une commande spéciale ?',
    'Votre email':'Votre email',
    'Suivez-nous':'Suivez-nous',
    'Ajoutez vos liens dans les paramètres':'Ajoutez vos liens dans les paramètres',
    'Non configuré':'Non configuré',
    'Erreur connexion':'Erreur connexion',
    'Erreur inscription':'Erreur inscription',
    'Identifiants incorrects':'Identifiants incorrects',
    'Erreur upload':'Erreur upload',
    'Erreur upload image':'Erreur upload image',
    'Erreur enregistrement vidéo':'Erreur enregistrement vidéo',
    'Veuillez entrer votre email':'Veuillez entrer votre email',
    'Merci pour votre inscription !':'Merci pour votre inscription !',
    'Soyez le premier à donner votre avis':'Soyez le premier à donner votre avis',
    'Veuillez remplir votre nom et votre avis':'Veuillez remplir votre nom et votre avis',
    'Merci pour votre avis !':'Merci pour votre avis !',
    'Supprimer cet avis ?':'Supprimer cet avis ?',
    'ajouté au panier':'ajouté au panier',
    'Envoyée':'Envoyée',
    'Aucune commande validée':'Aucune commande validée',
    'Livrées':'Livrées',
    
    'Récapitulatif':'Récapitulatif',
    'Coordonnées Bancaires':'Coordonnées Bancaires',
    'Banque':'Banque',
    'Numéro de Compte':'Numéro de Compte',
    'Titulaire':'Titulaire',
    'Mobile Money':'Mobile Money',
    'Les coordonnées bancaires ne sont pas encore configurées.':'Les coordonnées bancaires ne sont pas encore configurées.',
    'Veuillez contacter le vendeur directement pour effectuer votre paiement.':'Veuillez contacter le vendeur directement pour effectuer votre paiement.',
    'Adresse complète de livraison':'Adresse complète de livraison',
    'Effectuez le virement, prenez une capture d\'écran de la preuve, puis envoyez-la ci-dessous. Votre commande sera validée après vérification.':"Effectuez le virement, prenez une capture d'écran de la preuve, puis envoyez-la ci-dessous. Votre commande sera validée après vérification.",
        'Code appliqué':'Code appliqué',
    'Réduction':'Réduction',
    'Nouveau total':'Nouveau total',
        'Entrez votre code (ex: LUM-XXXX-XXXXXX)':'Entrez votre code (ex: LUM-XXXX-XXXXXX)',
    'en livraison':'en livraison'},  en: {
    'Adresse de livraison':'Delivery address',    'Adresse de livraison requise':'Delivery address required',    'Ajouter':'Add',    'Ajouter au Panier':'Add to Cart',    'Ajouter des images':'Add images',    'Ajoutez une preuve de paiement':'Add a payment proof',    'Annuler':'Cancel',    'Appliquer':'Apply',    'Aucun code promo créé':'No promo code created',    'Aucun produit dans cette catégorie':'No products in this category',    'Bienvenue':'Welcome',    'Bienvenue Administrateur':'Welcome Admin',    'Bon Retour':'Welcome Back',    'Chargement…':'Loading…',    'Code Promo':'Promo Code',    'Code promo créé : ':'Promo code created: ',    'Code supprimé':'Code deleted',    'Collection Exclusive — Parfums Premium':'Exclusive Collection — Premium Perfumes',    'Commande':'Order',    'Commande Envoyée':'Order Sent',    'Commande introuvable':'Order not found',    'Commande supprimée':'Order deleted',    'Commander':'Order',    'Commandes Totales':'Total Orders',    'Compte créé':'Account created',    'Confirmer':'Confirm',    'Confirmé':'Confirmed',    'Confirmées':'Confirmed',    'Connectez-vous à votre compte':'Sign in to your account',    'Connexion requise':'Login required',    'Conservez ce code précieusement.':'Keep this code safe.',    'Contact':'Contact',    'Continuer mes achats':'Continue shopping',    'Créer un Compte':'Create an Account',    'Créez votre compte':'Create your account',    'Des fragrances rares, soigneusement sélectionnées pour les esprits raffinés':'Rare fragrances, carefully selected for refined minds',    'Déconnecté':'Signed Out',    'Découvrez nos parfums en vidéo':'Discover our perfumes in video',    'Découvrir la Collection':'Discover the Collection',    'En Livraison':'Shipping',    'En livraison':'Shipping',    'Enregistrer':'Save',    'Entrez un code':'Enter a code',    'Entrez un code de suivi':'Enter a tracking code',    'Entrez un code promo':'Enter a promo code',    'Entrez une valeur de réduction':'Enter a discount value',    'Envoi de la photo…':'Uploading photo…',    'Envoi de la vidéo en cours…':'Uploading video…',    'Envoi des nouvelles photos…':'Uploading new photos…',    'Envoi des photos en cours…':'Uploading photos…',    'Envoi en cours, veuillez patienter…':'Sending, please wait…',    'Envoi en cours…':'Sending…',    'Erreur':'Error',    'Erreur commande':'Order error',    'Erreur création produit':'Product creation error',    'Erreur modification':'Edit error',    'Erreur réseau':'Network error',    'Erreur sauvegarde':'Save error',    'Erreur statut':'Status error',    'Erreur suppression':'Delete error',    'Erreur upload : ':'Upload error: ',    'Erreur upload image : ':'Image upload error: ',    'Erreur validation':'Validation error',    'Femme':'Women',    'Fichier trop lourd':'File too heavy',    'Fichier vidéo requis':'Video file required',    'Homme':'Men',    'Il vous permet de suivre l\'état de votre commande à tout moment.':'It allows you to track your order status at any time.',    'Image trop lourde':'Image too heavy',    'L\'Art du':'The Art of',    'La Boutique':'The Shop',    'La collection arrive bientôt…':'The collection is coming soon…',    'Le nom ne peut pas être vide':'Name cannot be empty',    'Les mots de passe ne correspondent pas':'Passwords do not match',    'Livraison':'Delivery',    'Livré':'Delivered',    'Maison de Parfums Exclusifs':'Exclusive Perfume House',    'Mes commandes':'My Orders',    'Mixte':'Unisex',    'Modifier':'Edit',    'Mon Panier':'My Cart',    'Mon Profil':'My Profile',    'Mon Suivi':'My Tracking',    'Mot de passe mis à jour':'Password updated',    'Mot de passe trop court':'Password too short',    'Nom mis à jour':'Name updated',    'Nos Vidéos':'Our Videos',    'Paiement':'Payment',    'Paiement en Attente':'Payment Pending',    'Paiement en attente':'Payment Pending',    'Paiement par Virement':'Payment by Transfer',    'Panier vide':'Cart empty',    'Paramètres sauvegardés':'Settings saved',    'Parfum':'Perfume',    'Passer au paiement':'Proceed to Payment',    'Passer la Commande':'Checkout',    'Photo de profil mise à jour':'Profile photo updated',    'Premium':'Premium',    'Preuve de Paiement':'Payment Proof',    'Preuve de Paiement (Photo / Capture d\'écran requise)':'Payment Proof (Photo / Screenshot required)',    'Prix':'Price',    'Produit ajouté avec succès':'Product added successfully',    'Produit mis à jour':'Product updated',    'Produit supprimé':'Product deleted',    'Profil':'Profile',    'Quantité':'Quantity',    'Recherche':'Search',    'Rechercher':'Search',    'Remplissez tous les champs':'Fill all fields',    'Session expirée, reconnectez-vous':'Session expired, please reconnect',    'Soumettre la Commande':'Submit Order',    'Statut':'Status',    'Statut mis à jour':'Status updated',    'Suivi':'Tracking',    'Suivre ma commande':'Track my order',    'Supprimer':'Delete',    'Supprimer ce code promo ?':'Delete this promo code?',    'Supprimer ce produit ?':'Delete this product?',    'Supprimer cette commande ?':'Delete this order?',    'Supprimer cette vidéo ?':'Delete this video?',    'Titre requis':'Title required',    'Total':'Total',    'Total à virer':'Total to Transfer',    'Touchez pour photographier ou sélectionner':'Tap to photograph or select',    'Touchez pour prendre une photo ou sélectionner une image':'Tap to take a photo or select an image',    'Tous':'All',    'Tous les champs sont requis':'All fields are required',    'Valider':'Validate',    'Veuillez vous connecter':'Please sign in',    'Vider le Panier':'Clear Cart',    'Vidéo publiée avec succès':'Video published successfully',    'Vidéo supprimée':'Video deleted',    'Voir votre Profil':'View your Profile',    'Votre code de suivi':'Your tracking code',    'Votre commande a bien été reçue — en attente de validation':'Your order has been received — pending validation',    'Votre panier est vide':'Your cart is empty',    'admin-login-btn':'Access the Panel',    'admin-login-desc':'Restricted access to authorized administrators only',    'admin-login-title':'Admin Access — Control Panel',    'auth-login-btn':'Sign In',    'auth-login-desc':'Sign in to your account',    'auth-register-btn':'Create my Account',    'auth-register-desc':'Create your account',    'auth-welcome':'Welcome',    'boutique-subtitle':'Exclusive Collection — Premium Perfumes',    'boutique-title':'The Shop',    'btn-login':'Sign In',    'btn-logout':'Sign Out',    'cart-title':'My Cart',    'confirm-msg':'Your order has been received — pending validation',    'delivery-title':'Delivery address',    'hero-btn-account':'Create an Account',    'hero-btn-shop':'Discover the Collection',    'hero-desc':'Rare fragrances, carefully selected for refined minds',    'hero-title-part1':'The Art of',    'hero-title-part2':'Perfume',    'hero-title-part3':'Premium',    'nav-boutique':'Shop',    'nav-cart':'Cart',    'nav-home':'Home',    'nav-profile':'My Profile',    'nav-tracking':'My Orders',    'nav-videos':'Videos',    'payment-title':'Payment by Transfer',    'profile-edit-title':'Edit Name',    'profile-name-label':'Full Name',    'profile-orders-title':'My Orders',    'profile-pwd-btn':'Update Password',    'profile-pwd-confirm':'Confirm Password',    'profile-pwd-current':'Current Password',    'profile-pwd-new':'New Password',    'profile-pwd-title':'Change Password',    'profile-save-btn':'Save',    'profile-see-orders':'View All Orders',    'proof-title':'Payment Proof (Photo / Screenshot required)',    'submit-order':'Submit Order',    'track-btn':'Track my order',    'tracking-title':'My Tracking',    'validée':'validated',    'videos-subtitle':'Discover our perfumes in video',    'videos-title':'Our Videos',    'vérifiez le code':'check the code','footer-copy':'© 2026 Lumière Parfums · The art of premium perfume','Nous contacter':'Contact Us','Nom du Site':'Site Name','Email':'Email','Enregistrer les contacts':'Save Contacts'
  ,
    'Newsletter':'Newsletter',
    'Avis Clients':'Customer Reviews',
    'Ce que disent nos clients':'What our customers say',
    'Donnez votre avis':'Share your review',
    'Partagez votre expérience avec nos parfums':'Share your experience with our perfumes',
    'Votre nom':'Your name',
    'Produit':'Product',
    'Votre avis':'Your review',
    'Note':'Rating',
    'Envoyer mon avis':'Submit my review',
    'S\'abonner':'Subscribe',
    'Recevez nos offres exclusives':'Get our exclusive offers',
    'Une question ? Une commande spéciale ?':'A question? A special order?',
    'Votre email':'Your email',
    'Suivez-nous':'Follow us',
    'Ajoutez vos liens dans les paramètres':'Add your links in settings',
    'Non configuré':'Not configured',
    'Erreur connexion':'Login error',
    'Erreur inscription':'Registration error',
    'Identifiants incorrects':'Incorrect credentials',
    'Erreur upload':'Upload error',
    'Erreur upload image':'Image upload error',
    'Erreur enregistrement vidéo':'Video recording error',
    'Veuillez entrer votre email':'Please enter your email',
    'Merci pour votre inscription !':'Thank you for subscribing!',
    'Soyez le premier à donner votre avis':'Be the first to leave a review',
    'Veuillez remplir votre nom et votre avis':'Please fill in your name and review',
    'Merci pour votre avis !':'Thank you for your review!',
    'Supprimer cet avis ?':'Delete this review?',
    'ajouté au panier':'added to cart',
    'Envoyée':'Sent',
    'Aucune commande validée':'No validated orders',
    'Livrées':'Delivered',
    
    'Récapitulatif':'Summary',
    'Coordonnées Bancaires':'Bank Details',
    'Banque':'Bank',
    'Numéro de Compte':'Account Number',
    'Titulaire':'Account Holder',
    'Mobile Money':'Mobile Money',
    'Les coordonnées bancaires ne sont pas encore configurées.':'Bank details have not been configured yet.',
    'Veuillez contacter le vendeur directement pour effectuer votre paiement.':'Please contact the seller directly to make your payment.',
    'Adresse complète de livraison':'Full delivery address',
    'Effectuez le virement, prenez une capture d\'écran de la preuve, puis envoyez-la ci-dessous. Votre commande sera validée après vérification.':'Make the transfer, take a screenshot of the proof, then send it below. Your order will be validated after verification.',
        'Code appliqué':'Code applied',
    'Réduction':'Discount',
    'Nouveau total':'New total',
        'Entrez votre code (ex: LUM-XXXX-XXXXXX)':'Enter your code (e.g. LUM-XXXX-XXXXXX)',
    'en livraison':'in delivery'},  ar: {
    'Adresse de livraison':'عنوان التوصيل',    'Adresse de livraison requise':'عنوان التوصيل مطلوب',    'Ajouter':'إضافة',    'Ajouter au Panier':'أضف إلى السلة',    'Ajouter des images':'إضافة صور',    'Ajoutez une preuve de paiement':'أضف إثبات الدفع',    'Annuler':'إلغاء',    'Appliquer':'تطبيق',    'Aucun code promo créé':'لم يتم إنشاء رمز ترويجي',    'Aucun produit dans cette catégorie':'لا توجد منتجات في هذه الفئة',    'Bienvenue':'مرحباً',    'Bienvenue Administrateur':'مرحباً أيها المشرف',    'Bon Retour':'مرحباً بعودتك',    'Chargement…':'جارٍ التحميل…',    'Code Promo':'رمز ترويجي',    'Code promo créé : ':'تم إنشاء الرمز الترويجي: ',    'Code supprimé':'تم حذف الرمز',    'Collection Exclusive — Parfums Premium':'مجموعة حصرية — عطور ممتازة',    'Commande':'طلب',    'Commande Envoyée':'تم إرسال الطلب',    'Commande introuvable':'الطلب غير موجود',    'Commande supprimée':'تم حذف الطلب',    'Commander':'طلب',    'Commandes Totales':'إجمالي الطلبات',    'Compte créé':'تم إنشاء الحساب',    'Confirmer':'تأكيد',    'Confirmé':'مؤكد',    'Confirmées':'مؤكدة',    'Connectez-vous à votre compte':'تسجيل الدخول إلى حسابك',    'Connexion requise':'تسجيل الدخول مطلوب',    'Conservez ce code précieusement.':'احتفظ بهذا الرمز بعناية.',    'Contact':'اتصال',    'Continuer mes achats':'متابعة التسوق',    'Créer un Compte':'إنشاء حساب',    'Créez votre compte':'أنشئ حسابك',    'Des fragrances rares, soigneusement sélectionnées pour les esprits raffinés':'عطور نادرة، مختارة بعناية للأرواح الراقية',    'Déconnecté':'تم تسجيل الخروج',    'Découvrez nos parfums en vidéo':'اكتشف عطورنا بالفيديو',    'Découvrir la Collection':'اكتشف المجموعة',    'En Livraison':'قيد التوصيل',    'En livraison':'قيد التوصيل',    'Enregistrer':'حفظ',    'Entrez un code':'أدخل رمزًا',    'Entrez un code de suivi':'أدخل رمز التتبع',    'Entrez un code promo':'أدخل رمزًا ترويجيًا',    'Entrez une valeur de réduction':'أدخل قيمة الخصم',    'Envoi de la photo…':'جارٍ رفع الصورة…',    'Envoi de la vidéo en cours…':'جارٍ رفع الفيديو…',    'Envoi des nouvelles photos…':'جارٍ رفع الصور الجديدة…',    'Envoi des photos en cours…':'جارٍ رفع الصور…',    'Envoi en cours, veuillez patienter…':'جارٍ الإرسال، يرجى الانتظار…',    'Envoi en cours…':'جارٍ الإرسال…',    'Erreur':'خطأ',    'Erreur commande':'خطأ في الطلب',    'Erreur création produit':'خطأ في إنشاء المنتج',    'Erreur modification':'خطأ في التعديل',    'Erreur réseau':'خطأ في الشبكة',    'Erreur sauvegarde':'خطأ في الحفظ',    'Erreur statut':'خطأ في الحالة',    'Erreur suppression':'خطأ في الحذف',    'Erreur upload : ':'خطأ في الرفع: ',    'Erreur upload image : ':'خطأ في رفع الصورة: ',    'Erreur validation':'خطأ في التحقق',    'Femme':'نساء',    'Fichier trop lourd':'الملف ثقيل جداً',    'Fichier vidéo requis':'ملف الفيديو مطلوب',    'Homme':'رجال',    'Il vous permet de suivre l\'état de votre commande à tout moment.':'يتيح لك تتبع حالة طلبك في أي وقت.',    'Image trop lourde':'الصورة ثقيلة جداً',    'L\'Art du':'فن',    'La Boutique':'المتجر',    'La collection arrive bientôt…':'المجموعة قادمة قريباً…',    'Le nom ne peut pas être vide':'الاسم لا يمكن أن يكون فارغًا',    'Les mots de passe ne correspondent pas':'كلمات المرور غير متطابقة',    'Livraison':'توصيل',    'Livré':'تم التوصيل',    'Maison de Parfums Exclusifs':'بيت عطور حصري',    'Mes commandes':'طلباتي',    'Mixte':'مختلط',    'Modifier':'تعديل',    'Mon Panier':'سلتي',    'Mon Profil':'ملفي',    'Mon Suivi':'تتبعي',    'Mot de passe mis à jour':'تم تحديث كلمة المرور',    'Mot de passe trop court':'كلمة المرور قصيرة جداً',    'Nom mis à jour':'تم تحديث الاسم',    'Nos Vidéos':'فيديوهاتنا',    'Paiement':'الدفع',    'Paiement en Attente':'الدفع معلق',    'Paiement en attente':'الدفع معلق',    'Paiement par Virement':'الدفع بالتحويل',    'Panier vide':'السلة فارغة',    'Paramètres sauvegardés':'تم حفظ الإعدادات',    'Parfum':'العطر',    'Passer au paiement':'المتابعة إلى الدفع',    'Passer la Commande':'إتمام الطلب',    'Photo de profil mise à jour':'تم تحديث صورة الملف',    'Premium':'ممتاز',    'Preuve de Paiement':'إثبات الدفع',    'Preuve de Paiement (Photo / Capture d\'écran requise)':'إثبات الدفع (صورة / لقطة شاشة مطلوبة)',    'Prix':'السعر',    'Produit ajouté avec succès':'تمت إضافة المنتج بنجاح',    'Produit mis à jour':'تم تحديث المنتج',    'Produit supprimé':'تم حذف المنتج',    'Profil':'ملف',    'Quantité':'الكمية',    'Recherche':'بحث',    'Rechercher':'بحث',    'Remplissez tous les champs':'املأ جميع الحقول',    'Session expirée, reconnectez-vous':'انتهت الجلسة، يرجى إعادة الاتصال',    'Soumettre la Commande':'إرسال الطلب',    'Statut':'الحالة',    'Statut mis à jour':'تم تحديث الحالة',    'Suivi':'تتبع',    'Suivre ma commande':'تتبع طلبي',    'Supprimer':'حذف',    'Supprimer ce code promo ?':'حذف هذا الرمز الترويجي؟',    'Supprimer ce produit ?':'حذف هذا المنتج؟',    'Supprimer cette commande ?':'حذف هذا الطلب؟',    'Supprimer cette vidéo ?':'حذف هذا الفيديو؟',    'Titre requis':'العنوان مطلوب',    'Total':'الإجمالي',    'Total à virer':'الإجمالي للتحويل',    'Touchez pour photographier ou sélectionner':'المس للتصوير أو التحديد',    'Touchez pour prendre une photo ou sélectionner une image':'المس لالتقاط صورة أو تحديد صورة',    'Tous':'الكل',    'Tous les champs sont requis':'جميع الحقول مطلوبة',    'Valider':'تحقق',    'Veuillez vous connecter':'يرجى تسجيل الدخول',    'Vider le Panier':'إفراغ السلة',    'Vidéo publiée avec succès':'تم نشر الفيديو بنجاح',    'Vidéo supprimée':'تم حذف الفيديو',    'Voir votre Profil':'عرض ملفك',    'Votre code de suivi':'رمز التتبع الخاص بك',    'Votre commande a bien été reçue — en attente de validation':'تم استلام طلبك — في انتظار التحقق',    'Votre panier est vide':'سلتك فارغة',    'admin-login-btn':'الوصول إلى اللوحة',    'admin-login-desc':'وصول مقصور على المسؤولين المصرح لهم فقط',    'admin-login-title':'وصول فريد — مساحة المشرف',    'auth-login-btn':'تسجيل الدخول',    'auth-login-desc':'تسجيل الدخول إلى حسابك',    'auth-register-btn':'إنشاء حسابي',    'auth-register-desc':'أنشئ حسابك',    'auth-welcome':'مرحباً',    'boutique-subtitle':'مجموعة حصرية — عطور ممتازة',    'boutique-title':'المتجر',    'btn-login':'تسجيل الدخول',    'btn-logout':'خروج',    'cart-title':'سلتي',    'confirm-msg':'تم استلام طلبك — في انتظار التحقق',    'delivery-title':'عنوان التوصيل',    'hero-btn-account':'إنشاء حساب',    'hero-btn-shop':'اكتشف المجموعة',    'hero-desc':'عطور نادرة، مختارة بعناية للأرواح الراقية',    'hero-title-part1':'فن',    'hero-title-part2':'العطر',    'hero-title-part3':'ممتاز',    'nav-boutique':'المتجر',    'nav-cart':'السلة',    'nav-home':'الرئيسية',    'nav-profile':'ملفي',    'nav-tracking':'طلباتي',    'nav-videos':'مقاطع',    'payment-title':'الدفع بالتحويل',    'profile-edit-title':'تعديل الاسم',    'profile-name-label':'الاسم الكامل',    'profile-orders-title':'طلباتي',    'profile-pwd-btn':'تحديث',    'profile-pwd-confirm':'تأكيد كلمة المرور',    'profile-pwd-current':'كلمة المرور الحالية',    'profile-pwd-new':'كلمة المرور الجديدة',    'profile-pwd-title':'تغيير كلمة المرور',    'profile-save-btn':'حفظ',    'profile-see-orders':'عرض الكل',    'proof-title':'إثبات الدفع (صورة / لقطة شاشة مطلوبة)',    'submit-order':'إرسال الطلب',    'track-btn':'تتبع طلبي',    'tracking-title':'تتبعي',    'validée':'تم التحقق',    'videos-subtitle':'اكتشف عطورنا بالفيديو',    'videos-title':'فيديوهاتنا',    'vérifiez le code':'تحقق من الرمز','footer-copy':'© 2026 لوميير بارفان · فن العطر الفاخر','Nous contacter':'اتصل بنا','Nom du Site':'اسم الموقع','Email':'البريد الإلكتروني','Enregistrer les contacts':'حفظ جهات الاتصال'
  ,
    'Newsletter':'النشرة البريدية',
    'Avis Clients':'آراء العملاء',
    'Ce que disent nos clients':'ماذا يقول عملاؤنا',
    'Donnez votre avis':'شارك برأيك',
    'Partagez votre expérience avec nos parfums':'شارك تجربتك مع عطورنا',
    'Votre nom':'اسمك',
    'Produit':'المنتج',
    'Votre avis':'رأيك',
    'Note':'التقييم',
    'Envoyer mon avis':'إرسال رأيي',
    'S\'abonner':'اشتراك',
    'Recevez nos offres exclusives':'احصل على عروضنا الحصرية',
    'Une question ? Une commande spéciale ?':'سؤال؟ طلب خاص؟',
    'Votre email':'بريدك الإلكتروني',
    'Suivez-nous':'تابعنا',
    'Ajoutez vos liens dans les paramètres':'أضف روابطك في الإعدادات',
    'Non configuré':'غير مكون',
    'Erreur connexion':'خطأ في تسجيل الدخول',
    'Erreur inscription':'خطأ في التسجيل',
    'Identifiants incorrects':'بيانات الدخول غير صحيحة',
    'Erreur upload':'خطأ في الرفع',
    'Erreur upload image':'خطأ في رفع الصورة',
    'Erreur enregistrement vidéo':'خطأ في تسجيل الفيديو',
    'Veuillez entrer votre email':'الرجاء إدخال بريدك الإلكتروني',
    'Merci pour votre inscription !':'شكراً لاشتراكك!',
    'Soyez le premier à donner votre avis':'كن أول من يترك رأيه',
    'Veuillez remplir votre nom et votre avis':'الرجاء ملء اسمك ورأيك',
    'Merci pour votre avis !':'شكراً لرأيك!',
    'Supprimer cet avis ?':'حذف هذا الرأي؟',
    'ajouté au panier':'أضيف إلى السلة',
    'Envoyée':'أرسلت',
    'Aucune commande validée':'لا توجد طلبات مؤكدة',
    'Livrées':'تم التوصيل',
    
    'Récapitulatif':'ملخص',
    'Coordonnées Bancaires':'التفاصيل المصرفية',
    'Banque':'البنك',
    'Numéro de Compte':'رقم الحساب',
    'Titulaire':'صاحب الحساب',
    'Mobile Money':'موبايل موني',
    'Les coordonnées bancaires ne sont pas encore configurées.':'لم يتم تكوين التفاصيل المصرفية بعد.',
    'Veuillez contacter le vendeur directement pour effectuer votre paiement.':'يرجى الاتصال بالبائع مباشرة لإجراء الدفع.',
    'Adresse complète de livraison':'عنوان التسليم الكامل',
    'Effectuez le virement, prenez une capture d\'écran de la preuve, puis envoyez-la ci-dessous. Votre commande sera validée après vérification.':'قم بالتحويل، التقط لقطة شاشة للإثبات، ثم أرسلها أدناه. سيتم تأكيد طلبك بعد التحقق.',
        'Code appliqué':'تم تطبيق الرمز',
    'Réduction':'الخصم',
    'Nouveau total':'المجموع الجديد',
        'Entrez votre code (ex: LUM-XXXX-XXXXXX)':'أدخل رمزك (مثال: LUM-XXXX-XXXXXX)',
    'en livraison':'في التوصيل'},  es: {
    'Adresse de livraison':'Dirección de entrega',    'Adresse de livraison requise':'Dirección de entrega requerida',    'Ajouter':'Añadir',    'Ajouter au Panier':'Añadir al Carrito',    'Ajouter des images':'Añadir imágenes',    'Ajoutez une preuve de paiement':'Añade un comprobante de pago',    'Annuler':'Cancelar',    'Appliquer':'Aplicar',    'Aucun code promo créé':'No se ha creado ningún código promocional',    'Aucun produit dans cette catégorie':'No hay productos en esta categoría',    'Bienvenue':'Bienvenido',    'Bienvenue Administrateur':'Bienvenido Administrador',    'Bon Retour':'Bienvenido de nuevo',    'Chargement…':'Cargando…',    'Code Promo':'Código Promocional',    'Code promo créé : ':'Código promocional creado: ',    'Code supprimé':'Código eliminado',    'Collection Exclusive — Parfums Premium':'Colección Exclusiva — Perfumes Premium',    'Commande':'Pedido',    'Commande Envoyée':'Pedido Enviado',    'Commande introuvable':'Pedido no encontrado',    'Commande supprimée':'Pedido eliminado',    'Commander':'Pedir',    'Commandes Totales':'Pedidos Totales',    'Compte créé':'Cuenta creada',    'Confirmer':'Confirmar',    'Confirmé':'Confirmado',    'Confirmées':'Confirmadas',    'Connectez-vous à votre compte':'Inicia sesión en tu cuenta',    'Connexion requise':'Inicio de sesión requerido',    'Conservez ce code précieusement.':'Conserva este código cuidadosamente.',    'Contact':'Contacto',    'Continuer mes achats':'Seguir comprando',    'Créer un Compte':'Crear una Cuenta',    'Créez votre compte':'Crea tu cuenta',    'Des fragrances rares, soigneusement sélectionnées pour les esprits raffinés':'Fragancias raras, cuidadosamente seleccionadas para mentes refinadas',    'Déconnecté':'Sesión cerrada',    'Découvrez nos parfums en vidéo':'Descubra nuestros perfumes en vídeo',    'Découvrir la Collection':'Descubrir la Colección',    'En Livraison':'Envío',    'En livraison':'Envío',    'Enregistrer':'Guardar',    'Entrez un code':'Introduce un código',    'Entrez un code de suivi':'Introduce un código de seguimiento',    'Entrez un code promo':'Introduce un código promocional',    'Entrez une valeur de réduction':'Introduce un valor de descuento',    'Envoi de la photo…':'Subiendo foto…',    'Envoi de la vidéo en cours…':'Subiendo vídeo…',    'Envoi des nouvelles photos…':'Subiendo nuevas fotos…',    'Envoi des photos en cours…':'Subiendo fotos…',    'Envoi en cours, veuillez patienter…':'Enviando, por favor espere…',    'Envoi en cours…':'Enviando…',    'Erreur':'Error',    'Erreur commande':'Error de pedido',    'Erreur création produit':'Error al crear producto',    'Erreur modification':'Error al editar',    'Erreur réseau':'Error de red',    'Erreur sauvegarde':'Error al guardar',    'Erreur statut':'Error de estado',    'Erreur suppression':'Error al eliminar',    'Erreur upload : ':'Error al subir: ',    'Erreur upload image : ':'Error al subir imagen: ',    'Erreur validation':'Error de validación',    'Femme':'Mujer',    'Fichier trop lourd':'Archivo demasiado pesado',    'Fichier vidéo requis':'Archivo de vídeo requerido',    'Homme':'Hombre',    'Il vous permet de suivre l\'état de votre commande à tout moment.':'Te permite seguir el estado de tu pedido en cualquier momento.',    'Image trop lourde':'Imagen demasiado pesada',    'L\'Art du':'El Arte del',    'La Boutique':'La Tienda',    'La collection arrive bientôt…':'La colección llegará pronto…',    'Le nom ne peut pas être vide':'El nombre no puede estar vacío',    'Les mots de passe ne correspondent pas':'Las contraseñas no coinciden',    'Livraison':'Entrega',    'Livré':'Entregado',    'Maison de Parfums Exclusifs':'Casa de Perfumes Exclusivos',    'Mes commandes':'Mis Pedidos',    'Mixte':'Unisex',    'Modifier':'Editar',    'Mon Panier':'Mi Carrito',    'Mon Profil':'Mi Perfil',    'Mon Suivi':'Mi Seguimiento',    'Mot de passe mis à jour':'Contraseña actualizada',    'Mot de passe trop court':'Contraseña demasiado corta',    'Nom mis à jour':'Nombre actualizado',    'Nos Vidéos':'Nuestros Videos',    'Paiement':'Pago',    'Paiement en Attente':'Pago Pendiente',    'Paiement en attente':'Pago Pendiente',    'Paiement par Virement':'Pago por Transferencia',    'Panier vide':'Carrito vacío',    'Paramètres sauvegardés':'Ajustes guardados',    'Parfum':'Perfume',    'Passer au paiement':'Ir al Pago',    'Passer la Commande':'Finalizar Pedido',    'Photo de profil mise à jour':'Foto de perfil actualizada',    'Premium':'Premium',    'Preuve de Paiement':'Comprobante de Pago',    'Preuve de Paiement (Photo / Capture d\'écran requise)':'Comprobante de Pago (Foto / Captura de pantalla requerida)',    'Prix':'Precio',    'Produit ajouté avec succès':'Producto añadido con éxito',    'Produit mis à jour':'Producto actualizado',    'Produit supprimé':'Producto eliminado',    'Profil':'Perfil',    'Quantité':'Cantidad',    'Recherche':'Búsqueda',    'Rechercher':'Buscar',    'Remplissez tous les champs':'Rellene todos los campos',    'Session expirée, reconnectez-vous':'Sesión caducada, reconéctese',    'Soumettre la Commande':'Enviar Pedido',    'Statut':'Estado',    'Statut mis à jour':'Estado actualizado',    'Suivi':'Seguimiento',    'Suivre ma commande':'Rastrear mi pedido',    'Supprimer':'Eliminar',    'Supprimer ce code promo ?':'¿Eliminar este código promocional?',    'Supprimer ce produit ?':'¿Eliminar este producto?',    'Supprimer cette commande ?':'¿Eliminar este pedido?',    'Supprimer cette vidéo ?':'¿Eliminar este vídeo?',    'Titre requis':'Título requerido',    'Total':'Total',    'Total à virer':'Total a Transferir',    'Touchez pour photographier ou sélectionner':'Toca para fotografiar o seleccionar',    'Touchez pour prendre une photo ou sélectionner une image':'Toca para tomar una foto o seleccionar una imagen',    'Tous':'Todos',    'Tous les champs sont requis':'Todos los campos son obligatorios',    'Valider':'Validar',    'Veuillez vous connecter':'Por favor inicie sesión',    'Vider le Panier':'Vaciar Carrito',    'Vidéo publiée avec succès':'Vídeo publicado con éxito',    'Vidéo supprimée':'Vídeo eliminado',    'Voir votre Profil':'Ver tu Perfil',    'Votre code de suivi':'Tu código de seguimiento',    'Votre commande a bien été reçue — en attente de validation':'Tu pedido ha sido recibido — en espera de validación',    'Votre panier est vide':'Tu carrito está vacío',    'admin-login-btn':'Acceder al Panel',    'admin-login-desc':'Acceso restringido solo a administradores autorizados',    'admin-login-title':'Acceso Único — Panel Admin',    'auth-login-btn':'Iniciar sesión',    'auth-login-desc':'Inicia sesión en tu cuenta',    'auth-register-btn':'Crear mi Cuenta',    'auth-register-desc':'Crea tu cuenta',    'auth-welcome':'Bienvenido',    'boutique-subtitle':'Colección Exclusiva — Perfumes Premium',    'boutique-title':'La Tienda',    'btn-login':'Iniciar sesión',    'btn-logout':'Cerrar sesión',    'cart-title':'Mi Carrito',    'confirm-msg':'Tu pedido ha sido recibido — en espera de validación',    'delivery-title':'Dirección de entrega',    'hero-btn-account':'Crear una Cuenta',    'hero-btn-shop':'Descubrir la Colección',    'hero-desc':'Fragancias raras, cuidadosamente seleccionadas para mentes refinadas',    'hero-title-part1':'El Arte del',    'hero-title-part2':'Perfume',    'hero-title-part3':'Premium',    'nav-boutique':'Tienda',    'nav-cart':'Carrito',    'nav-home':'Inicio',    'nav-profile':'Mi Perfil',    'nav-tracking':'Mis Pedidos',    'nav-videos':'Videos',    'payment-title':'Pago por Transferencia',    'profile-edit-title':'Editar Nombre',    'profile-name-label':'Nombre Completo',    'profile-orders-title':'Mis Pedidos',    'profile-pwd-btn':'Actualizar Contraseña',    'profile-pwd-confirm':'Confirmar Contraseña',    'profile-pwd-current':'Contraseña Actual',    'profile-pwd-new':'Nueva Contraseña',    'profile-pwd-title':'Cambiar Contraseña',    'profile-save-btn':'Guardar',    'profile-see-orders':'Ver Todos los Pedidos',    'proof-title':'Comprobante de Pago (Foto / Captura de pantalla requerida)',    'submit-order':'Enviar Pedido',    'track-btn':'Rastrear mi pedido',    'tracking-title':'Mi Seguimiento',    'validée':'validado',    'videos-subtitle':'Descubra nuestros perfumes en vídeo',    'videos-title':'Nuestros Videos',    'vérifiez le code':'verifica el código','footer-copy':'© 2026 Lumière Parfums · El arte del perfume premium','Nous contacter':'Contáctenos','Nom du Site':'Nombre del Sitio','Email':'Correo','Enregistrer les contacts':'Guardar Contactos'
  ,
    'Newsletter':'Boletín',
    'Avis Clients':'Opiniones de Clientes',
    'Ce que disent nos clients':'Lo que dicen nuestros clientes',
    'Donnez votre avis':'Comparte tu opinión',
    'Partagez votre expérience avec nos parfums':'Comparte tu experiencia con nuestros perfumes',
    'Votre nom':'Su nombre',
    'Produit':'Producto',
    'Votre avis':'Tu opinión',
    'Note':'Puntuación',
    'Envoyer mon avis':'Enviar mi opinión',
    'S\'abonner':'Suscribirse',
    'Recevez nos offres exclusives':'Recibe nuestras ofertas exclusivas',
    'Une question ? Une commande spéciale ?':'¿Una pregunta? ¿Un pedido especial?',
    'Votre email':'Tu correo electrónico',
    'Suivez-nous':'Síguenos',
    'Ajoutez vos liens dans les paramètres':'Añade tus enlaces en los ajustes',
    'Non configuré':'No configurado',
    'Erreur connexion':'Error de inicio de sesión',
    'Erreur inscription':'Error de registro',
    'Identifiants incorrects':'Credenciales incorrectas',
    'Erreur upload':'Error de carga',
    'Erreur upload image':'Error al subir imagen',
    'Erreur enregistrement vidéo':'Error al guardar video',
    'Veuillez entrer votre email':'Por favor ingrese su email',
    'Merci pour votre inscription !':'¡Gracias por suscribirte!',
    'Soyez le premier à donner votre avis':'Sé el primero en dar tu opinión',
    'Veuillez remplir votre nom et votre avis':'Por favor complete su nombre y opinión',
    'Merci pour votre avis !':'¡Gracias por tu opinión!',
    'Supprimer cet avis ?':'¿Eliminar esta opinión?',
    'ajouté au panier':'añadido al carrito',
    'Envoyée':'Enviada',
    'Aucune commande validée':'Ningún pedido validado',
    'Livrées':'Entregadas',
    
    'Récapitulatif':'Resumen',
    'Coordonnées Bancaires':'Datos Bancarios',
    'Banque':'Banco',
    'Numéro de Compte':'Número de Cuenta',
    'Titulaire':'Titular',
    'Mobile Money':'Mobile Money',
    'Les coordonnées bancaires ne sont pas encore configurées.':'Los datos bancarios aún no se han configurado.',
    'Veuillez contacter le vendeur directement pour effectuer votre paiement.':'Por favor, contacte al vendedor directamente para realizar el pago.',
    'Adresse complète de livraison':'Dirección de entrega completa',
    'Effectuez le virement, prenez une capture d\'écran de la preuve, puis envoyez-la ci-dessous. Votre commande sera validée après vérification.':'Realice la transferencia, tome una captura de pantalla del comprobante y luego envíela a continuación. Su pedido se validará después de la verificación.',
        'Code appliqué':'Código aplicado',
    'Réduction':'Descuento',
    'Nouveau total':'Nuevo total',
        'Entrez votre code (ex: LUM-XXXX-XXXXXX)':'Introduce tu código (ej: LUM-XXXX-XXXXXX)',
    'en livraison':'en entrega'},  pt: {
    'Adresse de livraison':'Endereço de entrega',    'Adresse de livraison requise':'Endereço de entrega obrigatório',    'Ajouter':'Adicionar',    'Ajouter au Panier':'Adicionar ao Carrinho',    'Ajouter des images':'Adicionar imagens',    'Ajoutez une preuve de paiement':'Adicione um comprovante de pagamento',    'Annuler':'Cancelar',    'Appliquer':'Aplicar',    'Aucun code promo créé':'Nenhum código promocional criado',    'Aucun produit dans cette catégorie':'Nenhum produto nesta categoria',    'Bienvenue':'Bem-vindo',    'Bienvenue Administrateur':'Bem-vindo Administrador',    'Bon Retour':'Bem-vindo de volta',    'Chargement…':'Carregando…',    'Code Promo':'Código Promocional',    'Code promo créé : ':'Código promocional criado: ',    'Code supprimé':'Código excluído',    'Collection Exclusive — Parfums Premium':'Coleção Exclusiva — Perfumes Premium',    'Commande':'Pedido',    'Commande Envoyée':'Pedido Enviado',    'Commande introuvable':'Pedido não encontrado',    'Commande supprimée':'Pedido excluído',    'Commander':'Pedir',    'Commandes Totales':'Pedidos Totais',    'Compte créé':'Conta criada',    'Confirmer':'Confirmar',    'Confirmé':'Confirmado',    'Confirmées':'Confirmadas',    'Connectez-vous à votre compte':'Entre na sua conta',    'Connexion requise':'Login necessário',    'Conservez ce code précieusement.':'Guarde este código com cuidado.',    'Contact':'Contato',    'Continuer mes achats':'Continuar comprando',    'Créer un Compte':'Criar uma Conta',    'Créez votre compte':'Crie sua conta',    'Des fragrances rares, soigneusement sélectionnées pour les esprits raffinés':'Fragrâncias raras, cuidadosamente selecionadas para mentes refinadas',    'Déconnecté':'Sessão encerrada',    'Découvrez nos parfums en vidéo':'Descubra nossos perfumes em vídeo',    'Découvrir la Collection':'Descobrir a Coleção',    'En Livraison':'Envio',    'En livraison':'Envio',    'Enregistrer':'Salvar',    'Entrez un code':'Insira um código',    'Entrez un code de suivi':'Insira um código de rastreio',    'Entrez un code promo':'Insira um código promocional',    'Entrez une valeur de réduction':'Insira um valor de desconto',    'Envoi de la photo…':'Enviando foto…',    'Envoi de la vidéo en cours…':'Enviando vídeo…',    'Envoi des nouvelles photos…':'Enviando novas fotos…',    'Envoi des photos en cours…':'Enviando fotos…',    'Envoi en cours, veuillez patienter…':'Enviando, aguarde…',    'Envoi en cours…':'Enviando…',    'Erreur':'Erro',    'Erreur commande':'Erro no pedido',    'Erreur création produit':'Erro ao criar produto',    'Erreur modification':'Erro ao editar',    'Erreur réseau':'Erro de rede',    'Erreur sauvegarde':'Erro ao salvar',    'Erreur statut':'Erro de status',    'Erreur suppression':'Erro ao excluir',    'Erreur upload : ':'Erro ao enviar: ',    'Erreur upload image : ':'Erro ao enviar imagem: ',    'Erreur validation':'Erro de validação',    'Femme':'Feminino',    'Fichier trop lourd':'Arquivo muito pesado',    'Fichier vidéo requis':'Arquivo de vídeo obrigatório',    'Homme':'Masculino',    'Il vous permet de suivre l\'état de votre commande à tout moment.':'Permite rastrear o status do seu pedido a qualquer momento.',    'Image trop lourde':'Imagem muito pesada',    'L\'Art du':'A Arte do',    'La Boutique':'A Loja',    'La collection arrive bientôt…':'A coleção chegará em breve…',    'Le nom ne peut pas être vide':'O nome não pode estar vazio',    'Les mots de passe ne correspondent pas':'As senhas não coincidem',    'Livraison':'Entrega',    'Livré':'Entregue',    'Maison de Parfums Exclusifs':'Casa de Perfumes Exclusivos',    'Mes commandes':'Meus Pedidos',    'Mixte':'Unissex',    'Modifier':'Editar',    'Mon Panier':'Meu Carrinho',    'Mon Profil':'Meu Perfil',    'Mon Suivi':'Meu Rastreio',    'Mot de passe mis à jour':'Senha atualizada',    'Mot de passe trop court':'Senha muito curta',    'Nom mis à jour':'Nome atualizado',    'Nos Vidéos':'Nossos Vídeos',    'Paiement':'Pagamento',    'Paiement en Attente':'Pagamento Pendente',    'Paiement en attente':'Pagamento Pendente',    'Paiement par Virement':'Pagamento por Transferência',    'Panier vide':'Carrinho vazio',    'Paramètres sauvegardés':'Configurações salvas',    'Parfum':'Perfume',    'Passer au paiement':'Ir para Pagamento',    'Passer la Commande':'Finalizar Pedido',    'Photo de profil mise à jour':'Foto de perfil atualizada',    'Premium':'Premium',    'Preuve de Paiement':'Comprovante de Pagamento',    'Preuve de Paiement (Photo / Capture d\'écran requise)':'Comprovante de Pagamento (Foto / Captura de tela necessária)',    'Prix':'Preço',    'Produit ajouté avec succès':'Produto adicionado com sucesso',    'Produit mis à jour':'Produto atualizado',    'Produit supprimé':'Produto excluído',    'Profil':'Perfil',    'Quantité':'Quantidade',    'Recherche':'Busca',    'Rechercher':'Buscar',    'Remplissez tous les champs':'Preencha todos os campos',    'Session expirée, reconnectez-vous':'Sessão expirada, reconecte-se',    'Soumettre la Commande':'Enviar Pedido',    'Statut':'Status',    'Statut mis à jour':'Status atualizado',    'Suivi':'Rastreio',    'Suivre ma commande':'Rastrear meu pedido',    'Supprimer':'Excluir',    'Supprimer ce code promo ?':'Excluir este código promocional?',    'Supprimer ce produit ?':'Excluir este produto?',    'Supprimer cette commande ?':'Excluir este pedido?',    'Supprimer cette vidéo ?':'Excluir este vídeo?',    'Titre requis':'Título obrigatório',    'Total':'Total',    'Total à virer':'Total a Transferir',    'Touchez pour photographier ou sélectionner':'Toque para fotografar ou selecionar',    'Touchez pour prendre une photo ou sélectionner une image':'Toque para tirar uma foto ou selecionar uma imagem',    'Tous':'Todos',    'Tous les champs sont requis':'Todos os campos são obrigatórios',    'Valider':'Validar',    'Veuillez vous connecter':'Por favor faça login',    'Vider le Panier':'Esvaziar Carrinho',    'Vidéo publiée avec succès':'Vídeo publicado com sucesso',    'Vidéo supprimée':'Vídeo excluído',    'Voir votre Profil':'Ver seu Perfil',    'Votre code de suivi':'Seu código de rastreio',    'Votre commande a bien été reçue — en attente de validation':'Seu pedido foi recebido — aguardando validação',    'Votre panier est vide':'Seu carrinho está vazio',    'admin-login-btn':'Acessar o Painel',    'admin-login-desc':'Acesso restrito apenas a administradores autorizados',    'admin-login-title':'Acesso Único — Painel Admin',    'auth-login-btn':'Entrar',    'auth-login-desc':'Entre na sua conta',    'auth-register-btn':'Criar minha Conta',    'auth-register-desc':'Crie sua conta',    'auth-welcome':'Bem-vindo',    'boutique-subtitle':'Coleção Exclusiva — Perfumes Premium',    'boutique-title':'A Loja',    'btn-login':'Entrar',    'btn-logout':'Sair',    'cart-title':'Meu Carrinho',    'confirm-msg':'Seu pedido foi recebido — aguardando validação',    'delivery-title':'Endereço de entrega',    'hero-btn-account':'Criar uma Conta',    'hero-btn-shop':'Descobrir a Coleção',    'hero-desc':'Fragrâncias raras, cuidadosamente selecionadas para mentes refinadas',    'hero-title-part1':'A Arte do',    'hero-title-part2':'Perfume',    'hero-title-part3':'Premium',    'nav-boutique':'Loja',    'nav-cart':'Carrinho',    'nav-home':'Início',    'nav-profile':'Meu Perfil',    'nav-tracking':'Meus Pedidos',    'nav-videos':'Vídeos',    'payment-title':'Pagamento por Transferência',    'profile-edit-title':'Editar Nome',    'profile-name-label':'Nome Completo',    'profile-orders-title':'Meus Pedidos',    'profile-pwd-btn':'Atualizar Senha',    'profile-pwd-confirm':'Confirmar Senha',    'profile-pwd-current':'Senha Atual',    'profile-pwd-new':'Nova Senha',    'profile-pwd-title':'Alterar Senha',    'profile-save-btn':'Salvar',    'profile-see-orders':'Ver Todos os Pedidos',    'proof-title':'Comprovante de Pagamento (Foto / Captura de tela necessária)',    'submit-order':'Enviar Pedido',    'track-btn':'Rastrear meu pedido',    'tracking-title':'Meu Rastreio',    'validée':'validado',    'videos-subtitle':'Descubra nossos perfumes em vídeo',    'videos-title':'Nossos Vídeos',    'vérifiez le code':'verifique o código','footer-copy':'© 2026 Lumière Parfums · A arte do perfume premium','Nous contacter':'Fale Conosco','Nom du Site':'Nome do Site','Email':'Email','Enregistrer les contacts':'Salvar Contatos'
  ,
    'Newsletter':'Newsletter',
    'Avis Clients':'Avaliações de Clientes',
    'Ce que disent nos clients':'O que nossos clientes dizem',
    'Donnez votre avis':'Compartilhe sua avaliação',
    'Partagez votre expérience avec nos parfums':'Compartilhe sua experiência com nossos perfumes',
    'Votre nom':'Seu nome',
    'Produit':'Produto',
    'Votre avis':'Sua avaliação',
    'Note':'Avaliação',
    'Envoyer mon avis':'Enviar minha avaliação',
    'S\'abonner':'Inscrever-se',
    'Recevez nos offres exclusives':'Receba nossas ofertas exclusivas',
    'Une question ? Une commande spéciale ?':'Uma pergunta? Um pedido especial?',
    'Votre email':'Seu email',
    'Suivez-nous':'Siga-nos',
    'Ajoutez vos liens dans les paramètres':'Adicione seus links nas configurações',
    'Non configuré':'Não configurado',
    'Erreur connexion':'Erro de login',
    'Erreur inscription':'Erro de registro',
    'Identifiants incorrects':'Credenciais incorretas',
    'Erreur upload':'Erro de upload',
    'Erreur upload image':'Erro ao enviar imagem',
    'Erreur enregistrement vidéo':'Erro ao salvar vídeo',
    'Veuillez entrer votre email':'Por favor insira seu email',
    'Merci pour votre inscription !':'Obrigado por se inscrever!',
    'Soyez le premier à donner votre avis':'Seja o primeiro a dar sua opinião',
    'Veuillez remplir votre nom et votre avis':'Por favor preencha seu nome e avaliação',
    'Merci pour votre avis !':'Obrigado pela sua avaliação!',
    'Supprimer cet avis ?':'Excluir esta avaliação?',
    'ajouté au panier':'adicionado ao carrinho',
    'Envoyée':'Enviada',
    'Aucune commande validée':'Nenhum pedido validado',
    'Livrées':'Entregues',
    
    'Récapitulatif':'Resumo',
    'Coordonnées Bancaires':'Dados Bancários',
    'Banque':'Banco',
    'Numéro de Compte':'Número da Conta',
    'Titulaire':'Titular',
    'Mobile Money':'Mobile Money',
    'Les coordonnées bancaires ne sont pas encore configurées.':'Os dados bancários ainda não foram configurados.',
    'Veuillez contacter le vendeur directement pour effectuer votre paiement.':'Por favor, entre em contato com o vendedor diretamente para efetuar o pagamento.',
    'Adresse complète de livraison':'Endereço de entrega completo',
    'Effectuez le virement, prenez une capture d\'écran de la preuve, puis envoyez-la ci-dessous. Votre commande sera validée après vérification.':'Faça a transferência, tire um print do comprovante e envie abaixo. Seu pedido será validado após a verificação.',
        'Code appliqué':'Código aplicado',
    'Réduction':'Desconto',
    'Nouveau total':'Novo total',
        'Entrez votre code (ex: LUM-XXXX-XXXXXX)':'Insira seu código (ex: LUM-XXXX-XXXXXX)',
    'en livraison':'em entrega'},  de: {
    'Adresse de livraison':'Lieferadresse',    'Adresse de livraison requise':'Lieferadresse erforderlich',    'Ajouter':'Hinzufügen',    'Ajouter au Panier':'In den Warenkorb',    'Ajouter des images':'Bilder hinzufügen',    'Ajoutez une preuve de paiement':'Fügen Sie einen Zahlungsnachweis hinzu',    'Annuler':'Abbrechen',    'Appliquer':'Anwenden',    'Aucun code promo créé':'Kein Promo-Code erstellt',    'Aucun produit dans cette catégorie':'Keine Produkte in dieser Kategorie',    'Bienvenue':'Willkommen',    'Bienvenue Administrateur':'Willkommen Administrator',    'Bon Retour':'Willkommen zurück',    'Chargement…':'Laden…',    'Code Promo':'Promo-Code',    'Code promo créé : ':'Promo-Code erstellt: ',    'Code supprimé':'Code gelöscht',    'Collection Exclusive — Parfums Premium':'Exklusive Kollektion — Premium-Parfüms',    'Commande':'Bestellung',    'Commande Envoyée':'Bestellung gesendet',    'Commande introuvable':'Bestellung nicht gefunden',    'Commande supprimée':'Bestellung gelöscht',    'Commander':'Bestellen',    'Commandes Totales':'Gesamtbestellungen',    'Compte créé':'Konto erstellt',    'Confirmer':'Bestätigen',    'Confirmé':'Bestätigt',    'Confirmées':'Bestätigt',    'Connectez-vous à votre compte':'Melden Sie sich in Ihrem Konto an',    'Connexion requise':'Anmeldung erforderlich',    'Conservez ce code précieusement.':'Bewahren Sie diesen Code sorgfältig auf.',    'Contact':'Kontakt',    'Continuer mes achats':'Weiter einkaufen',    'Créer un Compte':'Ein Konto erstellen',    'Créez votre compte':'Erstellen Sie Ihr Konto',    'Des fragrances rares, soigneusement sélectionnées pour les esprits raffinés':'Seltene Düfte, sorgfältig ausgewählt für anspruchsvolle Geister',    'Déconnecté':'Abgemeldet',    'Découvrez nos parfums en vidéo':'Entdecken Sie unsere Parfüms im Video',    'Découvrir la Collection':'Entdecken Sie die Kollektion',    'En Livraison':'Wird geliefert',    'En livraison':'Wird geliefert',    'Enregistrer':'Speichern',    'Entrez un code':'Geben Sie einen Code ein',    'Entrez un code de suivi':'Geben Sie einen Sendungscode ein',    'Entrez un code promo':'Geben Sie einen Promo-Code ein',    'Entrez une valeur de réduction':'Geben Sie einen Rabattwert ein',    'Envoi de la photo…':'Foto wird hochgeladen…',    'Envoi de la vidéo en cours…':'Video wird hochgeladen…',    'Envoi des nouvelles photos…':'Neue Fotos werden hochgeladen…',    'Envoi des photos en cours…':'Fotos werden hochgeladen…',    'Envoi en cours, veuillez patienter…':'Senden, bitte warten…',    'Envoi en cours…':'Senden…',    'Erreur':'Fehler',    'Erreur commande':'Bestellfehler',    'Erreur création produit':'Fehler bei Produkterstellung',    'Erreur modification':'Bearbeitungsfehler',    'Erreur réseau':'Netzwerkfehler',    'Erreur sauvegarde':'Speicherfehler',    'Erreur statut':'Statusfehler',    'Erreur suppression':'Löschfehler',    'Erreur upload : ':'Upload-Fehler: ',    'Erreur upload image : ':'Fehler beim Bild-Upload: ',    'Erreur validation':'Validierungsfehler',    'Femme':'Damen',    'Fichier trop lourd':'Datei zu groß',    'Fichier vidéo requis':'Videodatei erforderlich',    'Homme':'Herren',    'Il vous permet de suivre l\'état de votre commande à tout moment.':'Ermöglicht Ihnen, den Status Ihrer Bestellung jederzeit zu verfolgen.',    'Image trop lourde':'Bild zu groß',    'L\'Art du':'Die Kunst des',    'La Boutique':'Der Shop',    'La collection arrive bientôt…':'Die Kollektion kommt bald…',    'Le nom ne peut pas être vide':'Name darf nicht leer sein',    'Les mots de passe ne correspondent pas':'Passwörter stimmen nicht überein',    'Livraison':'Lieferung',    'Livré':'Geliefert',    'Maison de Parfums Exclusifs':'Exklusives Parfümhaus',    'Mes commandes':'Meine Bestellungen',    'Mixte':'Unisex',    'Modifier':'Bearbeiten',    'Mon Panier':'Mein Warenkorb',    'Mon Profil':'Mein Profil',    'Mon Suivi':'Meine Sendungsverfolgung',    'Mot de passe mis à jour':'Passwort aktualisiert',    'Mot de passe trop court':'Passwort zu kurz',    'Nom mis à jour':'Name aktualisiert',    'Nos Vidéos':'Unsere Videos',    'Paiement':'Zahlung',    'Paiement en Attente':'Zahlung ausstehend',    'Paiement en attente':'Zahlung ausstehend',    'Paiement par Virement':'Zahlung per Überweisung',    'Panier vide':'Warenkorb leer',    'Paramètres sauvegardés':'Einstellungen gespeichert',    'Parfum':'Parfüm',    'Passer au paiement':'Zur Zahlung',    'Passer la Commande':'Zur Kasse',    'Photo de profil mise à jour':'Profilbild aktualisiert',    'Premium':'Premium',    'Preuve de Paiement':'Zahlungsnachweis',    'Preuve de Paiement (Photo / Capture d\'écran requise)':'Zahlungsnachweis (Foto / Screenshot erforderlich)',    'Prix':'Preis',    'Produit ajouté avec succès':'Produkt erfolgreich hinzugefügt',    'Produit mis à jour':'Produkt aktualisiert',    'Produit supprimé':'Produkt gelöscht',    'Profil':'Profil',    'Quantité':'Menge',    'Recherche':'Suche',    'Rechercher':'Suchen',    'Remplissez tous les champs':'Alle Felder ausfüllen',    'Session expirée, reconnectez-vous':'Sitzung abgelaufen, bitte neu anmelden',    'Soumettre la Commande':'Bestellung absenden',    'Statut':'Status',    'Statut mis à jour':'Status aktualisiert',    'Suivi':'Sendungsverfolgung',    'Suivre ma commande':'Meine Bestellung verfolgen',    'Supprimer':'Löschen',    'Supprimer ce code promo ?':'Diesen Promo-Code löschen?',    'Supprimer ce produit ?':'Dieses Produkt löschen?',    'Supprimer cette commande ?':'Diese Bestellung löschen?',    'Supprimer cette vidéo ?':'Dieses Video löschen?',    'Titre requis':'Titel erforderlich',    'Total':'Gesamtsumme',    'Total à virer':'Zu überweisender Betrag',    'Touchez pour photographier ou sélectionner':'Zum Fotografieren oder Auswählen tippen',    'Touchez pour prendre une photo ou sélectionner une image':'Tippen Sie, um ein Foto zu machen oder ein Bild auszuwählen',    'Tous':'Alle',    'Tous les champs sont requis':'Alle Felder sind erforderlich',    'Valider':'Bestätigen',    'Veuillez vous connecter':'Bitte anmelden',    'Vider le Panier':'Warenkorb leeren',    'Vidéo publiée avec succès':'Video erfolgreich veröffentlicht',    'Vidéo supprimée':'Video gelöscht',    'Voir votre Profil':'Profil anzeigen',    'Votre code de suivi':'Ihr Sendungsverfolgungscode',    'Votre commande a bien été reçue — en attente de validation':'Ihre Bestellung ist eingegangen — wird auf Validierung gewartet',    'Votre panier est vide':'Ihr Warenkorb ist leer',    'admin-login-btn':'Zum Panel',    'admin-login-desc':'Nur für autorisierte Administratoren',    'admin-login-title':'Admin-Zugang — Kontrollzentrum',    'auth-login-btn':'Anmelden',    'auth-login-desc':'Melden Sie sich in Ihrem Konto an',    'auth-register-btn':'Mein Konto erstellen',    'auth-register-desc':'Erstellen Sie Ihr Konto',    'auth-welcome':'Willkommen',    'boutique-subtitle':'Exklusive Kollektion — Premium-Parfüms',    'boutique-title':'Der Shop',    'btn-login':'Anmelden',    'btn-logout':'Abmelden',    'cart-title':'Mein Warenkorb',    'confirm-msg':'Ihre Bestellung ist eingegangen — wird auf Validierung gewartet',    'delivery-title':'Lieferadresse',    'hero-btn-account':'Ein Konto erstellen',    'hero-btn-shop':'Entdecken Sie die Kollektion',    'hero-desc':'Seltene Düfte, sorgfältig ausgewählt für anspruchsvolle Geister',    'hero-title-part1':'Die Kunst des',    'hero-title-part2':'Parfüm',    'hero-title-part3':'Premium',    'nav-boutique':'Shop',    'nav-cart':'Warenkorb',    'nav-home':'Startseite',    'nav-profile':'Mein Profil',    'nav-tracking':'Meine Bestellungen',    'nav-videos':'Videos',    'payment-title':'Zahlung per Überweisung',    'profile-edit-title':'Namen ändern',    'profile-name-label':'Vollständiger Name',    'profile-orders-title':'Meine Bestellungen',    'profile-pwd-btn':'Aktualisieren',    'profile-pwd-confirm':'Passwort bestätigen',    'profile-pwd-current':'Aktuelles Passwort',    'profile-pwd-new':'Neues Passwort',    'profile-pwd-title':'Passwort ändern',    'profile-save-btn':'Speichern',    'profile-see-orders':'Alle anzeigen',    'proof-title':'Zahlungsnachweis (Foto / Screenshot erforderlich)',    'submit-order':'Bestellung absenden',    'track-btn':'Meine Bestellung verfolgen',    'tracking-title':'Meine Sendungsverfolgung',    'validée':'bestätigt',    'videos-subtitle':'Entdecken Sie unsere Parfüms im Video',    'videos-title':'Unsere Videos',    'vérifiez le code':'Code überprüfen','footer-copy':'© 2026 Lumière Parfums · Die Kunst des Premium-Parfüms','Nous contacter':'Kontaktieren Sie uns','Nom du Site':'Seitenname','Email':'E-Mail','Enregistrer les contacts':'Kontakte speichern'
  ,
    'Newsletter':'Newsletter',
    'Avis Clients':'Kundenbewertungen',
    'Ce que disent nos clients':'Was unsere Kunden sagen',
    'Donnez votre avis':'Teilen Sie Ihre Bewertung',
    'Partagez votre expérience avec nos parfums':'Teilen Sie Ihre Erfahrung mit unseren Parfüms',
    'Votre nom':'Ihr Name',
    'Produit':'Produkt',
    'Votre avis':'Ihre Bewertung',
    'Note':'Bewertung',
    'Envoyer mon avis':'Meine Bewertung senden',
    'S\'abonner':'Abonnieren',
    'Recevez nos offres exclusives':'Erhalten Sie unsere exklusiven Angebote',
    'Une question ? Une commande spéciale ?':'Eine Frage? Eine Sonderbestellung?',
    'Votre email':'Ihre E-Mail',
    'Suivez-nous':'Folgen Sie uns',
    'Ajoutez vos liens dans les paramètres':'Fügen Sie Ihre Links in den Einstellungen hinzu',
    'Non configuré':'Nicht konfiguriert',
    'Erreur connexion':'Anmeldefehler',
    'Erreur inscription':'Registrierungsfehler',
    'Identifiants incorrects':'Falsche Anmeldedaten',
    'Erreur upload':'Upload-Fehler',
    'Erreur upload image':'Fehler beim Bild-Upload',
    'Erreur enregistrement vidéo':'Fehler beim Speichern des Videos',
    'Veuillez entrer votre email':'Bitte geben Sie Ihre E-Mail ein',
    'Merci pour votre inscription !':'Danke für Ihr Abonnement!',
    'Soyez le premier à donner votre avis':'Seien Sie der Erste, der eine Bewertung abgibt',
    'Veuillez remplir votre nom et votre avis':'Bitte füllen Sie Ihren Namen und Ihre Bewertung aus',
    'Merci pour votre avis !':'Danke für Ihre Bewertung!',
    'Supprimer cet avis ?':'Diese Bewertung löschen?',
    'ajouté au panier':'zum Warenkorb hinzugefügt',
    'Envoyée':'Gesendet',
    'Aucune commande validée':'Keine bestätigten Bestellungen',
    'Livrées':'Geliefert',
    
    'Récapitulatif':'Zusammenfassung',
    'Coordonnées Bancaires':'Bankdaten',
    'Banque':'Bank',
    'Numéro de Compte':'Kontonummer',
    'Titulaire':'Kontoinhaber',
    'Mobile Money':'Mobile Money',
    'Les coordonnées bancaires ne sont pas encore configurées.':'Bankdaten wurden noch nicht konfiguriert.',
    'Veuillez contacter le vendeur directement pour effectuer votre paiement.':'Bitte kontaktieren Sie den Verkäufer direkt, um Ihre Zahlung vorzunehmen.',
    'Adresse complète de livraison':'Vollständige Lieferadresse',
    'Effectuez le virement, prenez une capture d\'écran de la preuve, puis envoyez-la ci-dessous. Votre commande sera validée après vérification.':'Führen Sie die Überweisung durch, machen Sie einen Screenshot des Nachweises und senden Sie ihn unten. Ihre Bestellung wird nach Überprüfung validiert.',
        'Code appliqué':'Code angewendet',
    'Réduction':'Rabatt',
    'Nouveau total':'Neue Gesamtsumme',
        'Entrez votre code (ex: LUM-XXXX-XXXXXX)':'Geben Sie Ihren Code ein (z.B. LUM-XXXX-XXXXXX)',
    'en livraison':'in Lieferung'}
};

// Détection de langue — via Accept-Language du navigateur (fiable, sans API externe)
function detectLang() {
  const raw = navigator.language || navigator.userLanguage || '';
  const lang = raw.split(/[-_]/)[0].toLowerCase();
  const supported = ['fr','en','ar','es','pt','de'];
  return supported.includes(lang) ? lang : 'fr';
}

let _currentLang = 'fr';

// Global translation helper for dynamic JS text
function __(key) {
  const t = I18N[_currentLang];
  return (t && t[key]) || key;
}

function applyI18n(forceLang) {
  const lang = forceLang || 'fr';
  _currentLang = lang;
  const t = I18N[lang];
  if (!t) return;
  document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  document.documentElement.setAttribute('lang', lang);
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (!t[key]) return;
    // Translate placeholder if this is an input/textarea
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.placeholder = t[key];
      return;
    }
    const hasChildren = el.querySelector('*') !== null;
    if (!hasChildren) {
      el.textContent = t[key];
    } else {
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
      let node;
      let found = false;
      while (node = walker.nextNode()) {
        if (node.textContent.trim().length > 0) {
          if (!found) {
            node.textContent = t[key];
            found = true;
          } else {
            node.textContent = '';
          }
        }
      }
    }
  });
}

function initI18n() {
  const lang = detectLang();
  applyI18n(lang);
  updateSiteIdentity();
}

// ════════════════════════════════════════════════════════════
//  BOTTOM NAV MOBILE
// ════════════════════════════════════════════════════════════
function updateBottomNav(activePage) {
  document.querySelectorAll('.bottom-nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.page === activePage);
  });
  // Compte : actif sur auth / profile / tracking
  const accountItem = document.querySelector('.bottom-nav-item[data-page="auth"]');
  if (accountItem) {
    accountItem.classList.toggle('active',
      activePage === 'auth' || activePage === 'profile' || activePage === 'tracking'
    );
  }
}

// ════════════════════════════════════════════════════════════
//  MENU MOBILE — Hamburger drawer
// ════════════════════════════════════════════════════════════
function toggleMobileMenu() {
  const btn     = document.getElementById('hamburger-btn');
  const menu    = document.getElementById('mobile-menu');
  const overlay = document.getElementById('mobile-menu-overlay');
  const isOpen  = menu.classList.contains('open');
  if (isOpen) {
    closeMobileMenu();
  } else {
    btn.classList.add('open');
    menu.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeMobileMenu() {
  document.getElementById('hamburger-btn').classList.remove('open');
  document.getElementById('mobile-menu').classList.remove('open');
  document.getElementById('mobile-menu-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

function mobileNav(page) {
  closeMobileMenu();
  showPage(page);
}

function mobileNavAuth(callback) {
  closeMobileMenu();
  if (state.currentUser) callback();
  else { showToast(__('Veuillez vous connecter'), 'warning'); showPage('auth'); }
}

// Mettre à jour le menu mobile quand l'état user change
function updateMobileMenuAuth() {
  const section = document.getElementById('mobile-menu-auth-section');
  if (!section) return;
  if (state.currentUser) {
    section.innerHTML = `
      <div style="color:var(--gold);font-size:12px;letter-spacing:1px;margin-bottom:12px">
        ${escHtml(state.currentUser.name.split(' ')[0])}
      </div>
      <button class="btn-nav" style="width:100%;text-align:center" onclick="closeMobileMenu();logout()">${__('Déconnecté')}</button>`;
  } else {
    section.innerHTML = `<button class="btn-nav" style="width:100%;text-align:center" onclick="mobileNav('auth')">Connexion</button>`;
  }
  // Badge panier mobile
  const badge = document.getElementById('mobile-cart-badge');
  if (badge) badge.textContent = state.cart.reduce((s, i) => s + i.qty, 0);
}

// ── Admin sidebar collapse on mobile ─────────────────────────
function toggleAdminSidebar() {
  const sidebar = document.getElementById('admin-sidebar');
  if (sidebar) sidebar.classList.toggle('collapsed');
}

// Auto-collapse admin nav on mobile after section click
function adminNavMobileCollapse() {
  if (window.innerWidth <= 768) {
    const sidebar = document.getElementById('admin-sidebar');
    if (sidebar) sidebar.classList.add('collapsed');
  }
}

// ════════════════════════════════════════════════════════════
//  ADMIN ACCESS via URL hash
// ════════════════════════════════════════════════════════════
window.addEventListener('hashchange', () => { if (location.hash === '#admin') showPage('admin-login'); });
if (location.hash === '#admin') showPage('admin-login');

const adminLink = document.createElement('a');
adminLink.href = '#admin';
adminLink.className = 'admin-secret-link';
adminLink.style.cssText = 'position:fixed;bottom:16px;right:16px;color:rgba(201,169,110,0.3);font-size:9px;letter-spacing:2px;text-decoration:none;text-transform:uppercase;transition:color 0.3s;z-index:999';
adminLink.textContent = 'Admin';
adminLink.addEventListener('mouseenter', () => adminLink.style.color = 'rgba(201,169,110,0.8)');
adminLink.addEventListener('mouseleave', () => adminLink.style.color = 'rgba(201,169,110,0.3)');
adminLink.addEventListener('click', () => showPage('admin-login'));
document.body.appendChild(adminLink);

initI18n();
