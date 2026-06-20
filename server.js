// ============================================================
//  LUMIÈRE — Serveur Backend (Node.js + Express + PostgreSQL)
//  Stockage fichiers : Cloudinary
//  Production-ready pour Railway / Render
// ============================================================

require('dotenv').config();

const express      = require('express');
const { Pool }     = require('pg');
const cors         = require('cors');
const path         = require('path');
const nodemailer   = require('nodemailer');
const bcrypt       = require('bcryptjs');
const jwt          = require('jsonwebtoken');
const helmet       = require('helmet');
const rateLimit    = require('express-rate-limit');
const cloudinary   = require('cloudinary').v2;
const { body, param, query, validationResult } = require('express-validator');

const app  = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1);

const JWT_SECRET     = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!JWT_SECRET) {
  console.error('FATAL: JWT_SECRET non défini. Arrêt.');
  process.exit(1);
}

cloudinary.config({
  cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
  api_key    : process.env.CLOUDINARY_API_KEY,
  api_secret : process.env.CLOUDINARY_API_SECRET,
  secure     : true,
});

const cloudinaryEnabled = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

const dbUrl = buildDbUrl();
function isLocalDatabaseUrl(url) {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return ['localhost', '127.0.0.1', '::1'].includes(parsed.hostname);
  } catch (_) {
    return false;
  }
}

const previewMode = !dbUrl || isLocalDatabaseUrl(dbUrl) || process.env.PREVIEW_MODE === '1';

const PRODUCT_CATEGORIES = ['Coffret', 'Miniatures'];

function normalizeProductCategory(category) {
  const value = String(category || '').trim();
  if (!value) return PRODUCT_CATEGORIES[0];
  const lower = value.toLowerCase();
  if (lower === 'femme' || lower === 'homme' || lower === 'mixte' || lower === 'coffret' || lower === 'coffrets') return 'Coffret';
  if (lower === 'miniature' || lower === 'miniatures') return 'Miniatures';
  return PRODUCT_CATEGORIES.includes(value) ? value : PRODUCT_CATEGORIES[0];
}

const previewState = {
  adminHash: ADMIN_PASSWORD ? bcrypt.hashSync(ADMIN_PASSWORD, 12) : null,
  customers: [],
  products: [
    {
      id: 1001,
      name: 'Ambre Nocturne',
      price: 24900,
      category: 'Coffret',
      quantite: '100ml',
      description: 'Un parfum ambré profond, chaud et élégant.',
      images: ['/hero-perfumes.png'],
      created_at: new Date('2026-06-01T10:00:00Z'),
      desc: 'Un parfum ambré profond, chaud et élégant.',
    },
    {
      id: 1002,
      name: 'Bois Impérial',
      price: 21900,
      category: 'Miniatures',
      quantite: '50ml',
      description: 'Des notes boisées sèches avec un sillage raffiné.',
      images: ['/hero-perfumes.png'],
      created_at: new Date('2026-06-02T10:00:00Z'),
      desc: 'Des notes boisées sèches avec un sillage raffiné.',
    },
    {
      id: 1003,
      name: 'Rose Lumière',
      price: 19900,
      category: 'Coffret',
      quantite: '75ml',
      description: 'Une rose lumineuse, douce et contemporaine.',
      images: ['/hero-perfumes.png'],
      created_at: new Date('2026-06-03T10:00:00Z'),
      desc: 'Une rose lumineuse, douce et contemporaine.',
    },
  ],
  settings: {
    id: 1,
    bankName: 'Banque Lumière',
    bankAccount: '0000 0000 0000',
    bankHolder: 'LUMIÈRE Parfums',
    bankMobile: '+225 00 00 00 00',
    siteName: 'LUMIÈRE',
    siteMotto: 'Parfums Premium',
    sitePhone: '+225 00 00 00 00',
    siteEmail: 'contactbloise@gmail.com',
    siteWhatsapp: '+225 00 00 00 00',
    siteInstagram: '@lumiere.parfums',
    siteFacebook: 'LUMIÈRE Parfums',
    siteAddress: 'Abidjan, Côte d’Ivoire',
    siteTiktok: '@lumiere.parfums',
    currency: '€',
    smtpHost: '',
    smtpPort: '587',
    smtpUser: '',
    smtpPass: '',
    smtpFrom: '',
  },
  videos: [
    {
      id: 2001,
      title: 'Lumière - Collection signature',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      created_at: new Date('2026-06-03T12:00:00Z'),
    },
  ],
  reviews: [
    {
      id: 3001,
      name: 'HIVA',
      product: 'Florat',
      content: 'Sympa',
      rating: 5,
      created_at: new Date('2026-06-10T12:00:00Z'),
      approved: true,
    },
    {
      id: 3002,
      name: 'LUCAS DUPONT',
      product: 'Coffrets cadeaux',
      content: 'Superbe coffret cadeau, ma femme a adoré',
      rating: 5,
      created_at: new Date('2026-06-09T12:00:00Z'),
      approved: true,
    },
    {
      id: 3003,
      name: 'ÉLISE MOREAU',
      product: 'Coffrets Premium',
      content: 'Livraison rapide, emballage soigné. Parfum conforme à la description.',
      rating: 5,
      created_at: new Date('2026-06-08T12:00:00Z'),
      approved: true,
    },
    {
      id: 3004,
      name: 'VÉTIVER',
      product: 'Miniatures Premium',
      content: "Vétiver authentique, j'aime beaucoup",
      rating: 5,
      created_at: new Date('2026-06-07T12:00:00Z'),
      approved: true,
    },
    {
      id: 3005,
      name: 'SOPHIE LEFEBVRE',
      product: 'Flora',
      content: "Parfait pour l'hiver, odeur boisée intense",
      rating: 5,
      created_at: new Date('2026-06-06T12:00:00Z'),
      approved: true,
    },
    {
      id: 3006,
      name: 'THOMAS BERNARD',
      product: 'Coffrets Valentino',
      content: 'Ambre enveloppant, très agréable',
      rating: 5,
      created_at: new Date('2026-06-05T12:00:00Z'),
      approved: true,
    },
  ],
  orders: [],
  orderItems: [],
  promoCodes: [],
  newsletter: [],
};

function normalizeSql(sql) {
  return String(sql || '').replace(/\s+/g, ' ').trim().toLowerCase();
}

function createPreviewPool() {
  return {
    async query(sql, params = []) {
      const q = normalizeSql(sql);

      if (q.startsWith('create table') || q.startsWith('create index') || q.startsWith('alter table')) {
        return { rows: [], rowCount: 0 };
      }

      if (q.startsWith('insert into settings') || q.startsWith('update settings')) {
        const [
          bankName, bankAccount, bankHolder, bankMobile,
          siteName, siteMotto, sitePhone, siteEmail,
          siteWhatsapp, siteInstagram, siteFacebook, siteAddress, siteTiktok, currency,
          smtpHost, smtpPort, smtpUser, smtpPass, smtpFrom,
        ] = params;
        previewState.settings = {
          ...previewState.settings,
          bankName: bankName || '',
          bankAccount: bankAccount || '',
          bankHolder: bankHolder || '',
          bankMobile: bankMobile || '',
          siteName: siteName || '',
          siteMotto: siteMotto || '',
          sitePhone: sitePhone || '',
          siteEmail: siteEmail || '',
          siteWhatsapp: siteWhatsapp || '',
          siteInstagram: siteInstagram || '',
          siteFacebook: siteFacebook || '',
          siteAddress: siteAddress || '',
          siteTiktok: siteTiktok || '',
          currency: currency || '',
          smtpHost: smtpHost || '',
          smtpPort: smtpPort || '587',
          smtpUser: smtpUser || '',
          smtpPass: smtpPass || '',
          smtpFrom: smtpFrom || '',
        };
        return { rows: [], rowCount: 1 };
      }

      if (q.includes('select * from settings where id=1')) {
        return { rows: [previewState.settings], rowCount: 1 };
      }

      if (q.startsWith('select') && q.includes('from products')) {
        const rows = previewState.products.map(p => ({
          ...p,
          images: Array.isArray(p.images) ? [...p.images] : [],
        }));
        return { rows, rowCount: rows.length };
      }

      if (q.startsWith('select') && q.includes('from videos')) {
        const rows = previewState.videos.map(v => ({ ...v }));
        return { rows, rowCount: rows.length };
      }

      if (q.startsWith('select') && q.includes('from reviews')) {
        const rows = q.startsWith('select * from reviews')
          ? previewState.reviews.map(r => ({ ...r }))
          : previewState.reviews.filter(r => r.approved === true).map(r => ({ ...r }));
        return { rows, rowCount: rows.length };
      }

      if (q.includes('from promo_codes where code=$1 and active=true')) {
        const code = String(params[0] || '').toUpperCase();
        const rows = previewState.promoCodes.filter(p => p.code === code && p.active);
        return { rows: rows.map(p => ({ ...p })), rowCount: rows.length };
      }

      if (q.includes('from admins where username=$1')) {
        const username = params[0];
        if (username === ADMIN_USERNAME && previewState.adminHash) {
          if (q.includes('select password from admins') || q.includes('select id, password from admins')) {
            return { rows: [{ id: 1, password: previewState.adminHash }], rowCount: 1 };
          }
        }
        return { rows: [], rowCount: 0 };
      }

      if (q.includes('from customers where email=$1')) {
        const email = params[0];
        const found = previewState.customers.find(c => c.email === email);
        if (!found) return { rows: [], rowCount: 0 };
        const row = { ...found };
        if (q.includes('password as hash')) {
          row.hash = row.password;
        }
        return { rows: [row], rowCount: 1 };
      }

      if (q.startsWith('insert into customers')) {
        const [email, name, phone, address, password] = params;
        const existing = previewState.customers.find(c => c.email === email);
        const record = {
          email,
          name,
          phone: phone || null,
          address: address || null,
          password,
          created_at: new Date(),
          photo_url: null,
        };
        if (existing) Object.assign(existing, record);
        else previewState.customers.push(record);
        return { rows: [], rowCount: 1 };
      }

      if (q.startsWith('insert into products')) {
        const [id, name, price, category, quantite, description] = params;
        const record = {
          id: Number(id),
          name,
          price: Number(price),
          category: normalizeProductCategory(category),
          quantite: quantite || '',
          description: description || '',
          desc: description || '',
          images: [],
          created_at: new Date(),
        };
        previewState.products = [record, ...previewState.products.filter(p => Number(p.id) !== Number(id))];
        return { rows: [], rowCount: 1 };
      }

      if (q.startsWith('insert into product_images')) {
        const [productId, imageUrl] = params;
        const found = previewState.products.find(p => Number(p.id) === Number(productId));
        if (found) {
          if (!Array.isArray(found.images)) found.images = [];
          found.images.push(imageUrl);
        }
        return { rows: [], rowCount: 1 };
      }

      if (q.startsWith('update customers set name=')) {
        const [name, email] = params;
        const found = previewState.customers.find(c => c.email === email);
        if (found) found.name = name;
        return { rows: [], rowCount: 1 };
      }

      if (q.startsWith('update customers set photo_url=')) {
        const [photoUrl, email] = params;
        const found = previewState.customers.find(c => c.email === email);
        if (found) found.photo_url = photoUrl;
        return { rows: [], rowCount: 1 };
      }

      if (q.startsWith('update customers set password=')) {
        const [password, email] = params;
        const found = previewState.customers.find(c => c.email === email);
        if (found) found.password = password;
        return { rows: [], rowCount: 1 };
      }

      if (q.startsWith('update products set name=')) {
        const [name, price, description, category, quantite, id] = params;
        const found = previewState.products.find(p => Number(p.id) === Number(id));
        if (found) {
          found.name = name;
          found.price = Number(price);
          found.description = description || '';
          found.desc = description || '';
          found.category = normalizeProductCategory(category);
          found.quantite = quantite || '';
        }
        return { rows: [], rowCount: 1 };
      }

      if (q.startsWith('delete from product_images where product_id=$1')) {
        const productId = Number(params[0]);
        const found = previewState.products.find(p => Number(p.id) === productId);
        if (found) found.images = [];
        return { rows: [], rowCount: 1 };
      }

      if (q.startsWith('delete from products where id=$1')) {
        const productId = Number(params[0]);
        previewState.products = previewState.products.filter(p => Number(p.id) !== productId);
        return { rows: [], rowCount: 1 };
      }

      if (q.startsWith('select email, name, phone, address, created_at from customers')) {
        return {
          rows: previewState.customers.map(({ password, photo_url, ...rest }) => rest),
          rowCount: previewState.customers.length,
        };
      }

      if (q.includes('from orders where "trackingcode"=$1')) {
        const code = params[0];
        const order = previewState.orders.find(o => o.trackingCode === code);
        if (!order) return { rows: [], rowCount: 0 };
        return {
          rows: [{
            id: order.id,
            customer: order.customer,
            total: order.total,
            status: order.status,
            transaction_ref: order.transaction_ref || '',
            trackingCode: order.trackingCode,
            created_at: order.created_at,
          }],
          rowCount: 1,
        };
      }

      if (q.includes('from orders where "userid"=$1')) {
        const email = params[0];
        const rows = previewState.orders.filter(o => o.userId === email).map(o => ({
          ...o,
          proof_url: o.proof_url || null,
          transaction_ref: o.transaction_ref || '',
        }));
        return { rows, rowCount: rows.length };
      }

      if (q.includes('from orders order by created_at desc')) {
        const rows = previewState.orders.map(o => ({ ...o, proof_url: o.proof_url || null, transaction_ref: o.transaction_ref || '' }));
        return { rows, rowCount: rows.length };
      }

      if (q.startsWith('insert into orders')) {
        const [id, userId, customer, total, address, trackingCode, transactionRef, proofUrl] = params;
        previewState.orders.push({
          id,
          userId,
          customer,
          total,
          status: 'pending',
          address,
          trackingCode,
          transaction_ref: transactionRef || '',
          proof_url: proofUrl,
          created_at: new Date(),
        });
        return { rows: [], rowCount: 1 };
      }

      if (q.startsWith('update orders set status=$1 where id=$2')) {
        const [status, id] = params;
        const found = previewState.orders.find(o => o.id === id);
        if (found) found.status = status;
        return { rows: [], rowCount: 1 };
      }

      if (q.startsWith('delete from orders where id=$1')) {
        const id = params[0];
        previewState.orders = previewState.orders.filter(o => o.id !== id);
        previewState.orderItems = previewState.orderItems.filter(i => i.order_id !== id);
        return { rows: [], rowCount: 1 };
      }

      if (q.startsWith('insert into order_items')) {
        const [orderId, productId, productName, quantity, price] = params;
        previewState.orderItems.push({
          order_id: orderId,
          product_id: productId,
          product_name: productName,
          quantity,
          price,
        });
        return { rows: [], rowCount: 1 };
      }

      if (q.includes('from order_items where order_id=$1')) {
        const orderId = params[0];
        const rows = previewState.orderItems.filter(i => i.order_id === orderId).map(({ order_id, ...rest }) => rest);
        return { rows, rowCount: rows.length };
      }

      if (q.startsWith('insert into videos')) {
        const [id, title, url] = params;
        previewState.videos = [
          {
            id: Number(id),
            title,
            url,
            created_at: new Date(),
          },
          ...previewState.videos.filter(v => Number(v.id) !== Number(id)),
        ];
        return { rows: [], rowCount: 1 };
      }

      if (q.startsWith('delete from videos where id=$1')) {
        const id = Number(params[0]);
        previewState.videos = previewState.videos.filter(v => Number(v.id) !== id);
        return { rows: [], rowCount: 1 };
      }

      if (q.startsWith('select') && q.includes('from newsletter')) {
        const rows = previewState.newsletter.map(n => ({ ...n }));
        return { rows, rowCount: rows.length };
      }

      if (q.startsWith('insert into newsletter')) {
        const email = params[0];
        if (!previewState.newsletter.find(n => n.email === email)) {
          previewState.newsletter.push({ id: Date.now(), email, created_at: new Date() });
        }
        return { rows: [], rowCount: 1 };
      }

      if (q.startsWith('insert into promo_codes')) {
        const [code, discountType, discountValue, maxUses] = params;
        const existing = previewState.promoCodes.find(p => p.code === code);
        const record = existing || {
          id: Date.now(),
          used_count: 0,
          active: true,
          created_at: new Date(),
        };
        Object.assign(record, {
          code,
          discount_type: discountType,
          discount_value: Number(discountValue),
          max_uses: maxUses ?? null,
        });
        if (!existing) previewState.promoCodes.unshift(record);
        return { rows: [record], rowCount: 1 };
      }

      if (q.startsWith('update promo_codes set active = not active where id=$1')) {
        const id = Number(params[0]);
        const found = previewState.promoCodes.find(p => Number(p.id) === id);
        if (found) found.active = !found.active;
        return { rows: [], rowCount: 1 };
      }

      if (q.startsWith('update promo_codes set used_count = used_count + 1 where code=$1')) {
        const code = String(params[0] || '').toUpperCase();
        const found = previewState.promoCodes.find(p => p.code === code);
        if (found) found.used_count = Number(found.used_count || 0) + 1;
        return { rows: [], rowCount: 1 };
      }

      if (q.startsWith('delete from promo_codes where id=$1')) {
        const id = Number(params[0]);
        previewState.promoCodes = previewState.promoCodes.filter(p => Number(p.id) !== id);
        return { rows: [], rowCount: 1 };
      }

      if (q.startsWith('select * from promo_codes order by created_at desc')) {
        return { rows: previewState.promoCodes.map(p => ({ ...p })), rowCount: previewState.promoCodes.length };
      }

      if (q.includes('from promo_codes')) {
        return { rows: previewState.promoCodes.map(p => ({ ...p })), rowCount: previewState.promoCodes.length };
      }

      if (q.startsWith('update reviews set approved=$1 where id=$2')) {
        const [approved, id] = params;
        const found = previewState.reviews.find(r => Number(r.id) === Number(id));
        if (found) found.approved = approved === true || approved === 'true';
        return { rows: [], rowCount: 1 };
      }

      if (q.startsWith('delete from reviews where id=$1')) {
        const id = Number(params[0]);
        previewState.reviews = previewState.reviews.filter(r => Number(r.id) !== id);
        return { rows: [], rowCount: 1 };
      }

      if (q.startsWith('insert into reviews')) {
        const [name, product, content, rating, approved] = params;
        const record = {
          id: Date.now(),
          name,
          product: product || '',
          content,
          rating: Number(rating) || 5,
          approved: approved === undefined ? true : (approved === true || approved === 'TRUE' || approved === 'true'),
          created_at: new Date(),
        };
        previewState.reviews.unshift(record);
        return { rows: [record], rowCount: 1 };
      }

      if (q.startsWith('delete from newsletter where id=$1')) {
        const id = Number(params[0]);
        previewState.newsletter = previewState.newsletter.filter(n => Number(n.id) !== id);
        return { rows: [], rowCount: 1 };
      }

      if (q.startsWith('delete from newsletter')) return { rows: [], rowCount: 1 };

      return { rows: [], rowCount: 0 };
    },
    async connect() {
      return { release() {} };
    },
    on() {},
  };
}

function buildDbUrl() {
  const u = process.env.DATABASE_URL || '';
  if (u.startsWith('postgres')) return u;
  const h  = process.env.PGHOST;
  const p  = process.env.PGPORT  || '5432';
  const us = process.env.PGUSER;
  const pw = process.env.PGPASSWORD;
  const db = process.env.PGDATABASE;
  if (h && us && pw && db) {
    return `postgresql://${encodeURIComponent(us)}:${encodeURIComponent(pw)}@${h}:${p}/${db}`;
  }
  return '';
}

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc    : ["'self'"],
      scriptSrc     : ["'self'", "'unsafe-inline'", 'https://unpkg.com', 'https://cdn.jsdelivr.net'],
      scriptSrcAttr : ["'unsafe-inline'"],
      styleSrc      : ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc       : ["'self'", 'https://fonts.gstatic.com'],
      imgSrc        : ["'self'", 'data:', 'blob:', 'https://res.cloudinary.com'],
      mediaSrc      : ["'self'", 'data:', 'blob:', 'https://res.cloudinary.com'],
      connectSrc    : ["'self'", 'https://res.cloudinary.com', 'https://cdn.jsdelivr.net'],
      frameAncestors : ["*"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false,
  frameguard: false,
}));

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()).filter(Boolean)
  : [];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowedOrigins.length === 0) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('Origin non autorisée par CORS'));
  },
  credentials: true,
}));

app.use(express.json({ limit: '600mb' }));
app.use(express.urlencoded({ extended: true }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Trop de tentatives, réessayez dans 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', apiLimiter);

app.use('/api/', (_req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

if (previewMode) {
  app.get('/api/health', (_req, res) => res.json({ status: 'ok', preview: true }));
  app.get('/api/products', (_req, res) => {
    res.json(previewState.products.map(p => ({ ...p })));
  });
  app.get('/api/settings', (_req, res) => {
    res.json({ ...previewState.settings });
  });
  app.get('/api/videos', (_req, res) => {
    res.json(previewState.videos.map(v => ({ ...v })));
  });
  app.get('/api/reviews', (_req, res) => {
    res.json(previewState.reviews.filter(r => r.approved === true).map(r => ({ ...r })));
  });
  console.warn('MODE APERÇU: aucune base PostgreSQL détectée, données de démonstration activées.');
}

const pool = previewMode
  ? createPreviewPool()
  : new Pool({
      connectionString: dbUrl,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

pool.on('error', (err) => {
  console.error('Erreur pool PostgreSQL :', err.message);
});

app.listen(PORT, () => {
  console.log(`Serveur LUMIÈRE démarré sur le port ${PORT}`);
  if (!cloudinaryEnabled) console.warn('ATTENTION: Cloudinary non configuré — uploads désactivés');
  if (!previewMode) {
    connectWithRetry();
  } else {
    console.log('Preview local actif: backend PostgreSQL remplacé par des données de démonstration.');
  }
});

async function connectWithRetry(attempts = 10, delayMs = 3000) {
  for (let i = 1; i <= attempts; i++) {
    try {
      const client = await pool.connect();
      console.log('Connecté à PostgreSQL');
      client.release();
      await initDatabase();
      await initAdminPassword();
      return;
    } catch (err) {
      console.error(`Tentative ${i}/${attempts} — PostgreSQL inaccessible : ${err.message || err.code}`);
      if (i === attempts) {
        console.error('FATAL: Impossible de joindre PostgreSQL. Arrêt.');
        process.exit(1);
      }
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
}

async function initDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS customers (
        email     VARCHAR(255) PRIMARY KEY,
        name      VARCHAR(255) NOT NULL,
        phone     VARCHAR(50) NOT NULL,
        address   TEXT NOT NULL,
        password  VARCHAR(255) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS products (
        id          BIGINT PRIMARY KEY,
        name        VARCHAR(255) NOT NULL,
        price       INTEGER NOT NULL,
        category    VARCHAR(100) NOT NULL DEFAULT '',
        quantite    VARCHAR(100) NOT NULL DEFAULT '',
        description TEXT,
        created_at  TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS product_images (
        id         SERIAL PRIMARY KEY,
        product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
        image_url  TEXT
      );
      CREATE TABLE IF NOT EXISTS orders (
        id             VARCHAR(50) PRIMARY KEY,
        "userId"       VARCHAR(255) REFERENCES customers(email) ON DELETE SET NULL,
        customer       VARCHAR(255),
        total          INTEGER,
        status         VARCHAR(50) DEFAULT 'pending',
        address        TEXT,
        "trackingCode" VARCHAR(50),
        transaction_ref VARCHAR(100) NOT NULL DEFAULT '',
        proof_url      TEXT,
        created_at     TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_orders_userid       ON orders("userId");
      CREATE INDEX IF NOT EXISTS idx_orders_trackingcode ON orders("trackingCode");
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS transaction_ref VARCHAR(100) NOT NULL DEFAULT '';
      UPDATE products SET category='Coffret' WHERE category IN ('Femme', 'femme', 'Homme', 'homme', 'Mixte', 'mixte');
      DO $$
      DECLARE
        amouage_created TIMESTAMPTZ;
        chanel_created  TIMESTAMPTZ;
      BEGIN
        SELECT created_at INTO amouage_created
        FROM products
        WHERE category='Miniatures' AND name ILIKE '%AMOUAGE%'
        ORDER BY created_at DESC
        LIMIT 1;

        SELECT created_at INTO chanel_created
        FROM products
        WHERE category='Miniatures'
          AND (name ILIKE '%ALURE%CHANEL%' OR name ILIKE '%ALLURE%CHANEL%')
        ORDER BY created_at DESC
        LIMIT 1;

        IF amouage_created IS NOT NULL AND chanel_created IS NOT NULL THEN
          UPDATE products
          SET category='Coffret'
          WHERE category='Miniatures'
            AND created_at BETWEEN LEAST(amouage_created, chanel_created)
                               AND GREATEST(amouage_created, chanel_created);
        END IF;
      END $$;
      CREATE TABLE IF NOT EXISTS order_items (
        id           SERIAL PRIMARY KEY,
        order_id     VARCHAR(50) REFERENCES orders(id) ON DELETE CASCADE,
        product_id   BIGINT,
        product_name VARCHAR(255),
        quantity     INTEGER,
        price        INTEGER
      );
      CREATE TABLE IF NOT EXISTS settings (
        id            INTEGER PRIMARY KEY DEFAULT 1,
        "bankName"    VARCHAR(255) DEFAULT '',
        "bankAccount" VARCHAR(255) DEFAULT '',
        "bankHolder"  VARCHAR(255) DEFAULT '',
        "bankMobile"  VARCHAR(50)  DEFAULT '',
        "siteName"    VARCHAR(255) DEFAULT '',
        "siteMotto"   VARCHAR(500) DEFAULT '',
        "sitePhone"   VARCHAR(100) DEFAULT '',
        "siteEmail"   VARCHAR(255) DEFAULT '',
        "siteWhatsapp" VARCHAR(100) DEFAULT '',
        "siteInstagram" VARCHAR(255) DEFAULT '',
        "siteFacebook" VARCHAR(255) DEFAULT '',
        "siteAddress" TEXT DEFAULT '',
        "siteTiktok"  VARCHAR(255) DEFAULT '',
        "currency"    VARCHAR(10) DEFAULT '',
        "smtpHost"    VARCHAR(255) DEFAULT '',
        "smtpPort"    VARCHAR(10) DEFAULT '587',
        "smtpUser"    VARCHAR(255) DEFAULT '',
        "smtpPass"    VARCHAR(255) DEFAULT '',
        "smtpFrom"    VARCHAR(255) DEFAULT '',
        CONSTRAINT settings_single_row CHECK (id = 1)
      );
      INSERT INTO settings (id, "bankName", "bankAccount", "bankHolder", "bankMobile", "siteName", "siteMotto", "sitePhone", "siteEmail", "siteWhatsapp", "siteInstagram", "siteFacebook", "siteAddress", "siteTiktok", "currency", "smtpHost", "smtpPort", "smtpUser", "smtpPass", "smtpFrom")
      VALUES (1, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '587', '', '', '')
      ON CONFLICT (id) DO NOTHING;
      CREATE TABLE IF NOT EXISTS promo_codes (
        id             SERIAL PRIMARY KEY,
        code           VARCHAR(50) UNIQUE NOT NULL,
        discount_type  VARCHAR(20) NOT NULL DEFAULT 'percent',
        discount_value INTEGER NOT NULL DEFAULT 0,
        max_uses       INTEGER,
        used_count     INTEGER NOT NULL DEFAULT 0,
        active         BOOLEAN NOT NULL DEFAULT TRUE,
        created_at     TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS admins (
        id       SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL
      );
      CREATE TABLE IF NOT EXISTS videos (
        id         BIGINT PRIMARY KEY,
        title      VARCHAR(255),
        url        TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS newsletter (
        id         SERIAL PRIMARY KEY,
        email      VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS reviews (
        id         SERIAL PRIMARY KEY,
        name       VARCHAR(255) NOT NULL,
        product    VARCHAR(255) NOT NULL DEFAULT '',
        content    TEXT NOT NULL,
        rating     INTEGER DEFAULT 5,
        approved   BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('Tables initialisées avec succès');
  } catch (err) {
    console.error('Erreur init tables :', err.message);
    throw err;
  }
}

async function initAdminPassword() {
  if (!ADMIN_USERNAME || !ADMIN_PASSWORD) return;
  try {
    const { rows } = await pool.query(
      'SELECT password FROM admins WHERE username=$1', [ADMIN_USERNAME]
    );
    if (rows.length === 0) {
      const hash = await bcrypt.hash(ADMIN_PASSWORD, 12);
      await pool.query(
        'INSERT INTO admins (username, password) VALUES ($1,$2) ON CONFLICT (username) DO UPDATE SET password=EXCLUDED.password',
        [ADMIN_USERNAME, hash]
      );
      console.log('Admin initialisé');
    } else {
      const stored = rows[0].password;
      // Update if stored is plaintext OR if env var password changed
      if (!stored.startsWith('$2') || !(await bcrypt.compare(ADMIN_PASSWORD, stored))) {
        const hash = await bcrypt.hash(ADMIN_PASSWORD, 12);
        await pool.query('UPDATE admins SET password=$1 WHERE username=$2', [hash, ADMIN_USERNAME]);
        console.log('Mot de passe admin mis à jour');
      }
    }
  } catch (err) {
    console.error('Erreur init admin:', err.message);
  }
}

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });
  next();
}

function authenticateAdmin(req, res, next) {
  const header = req.headers.authorization || '';
  const token  = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Token requis' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (payload.role !== 'admin') return res.status(403).json({ error: 'Accès refusé' });
    req.admin = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Token invalide ou expiré' });
  }
}

function authenticateUser(req, res, next) {
  const header = req.headers.authorization || '';
  const token  = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Connexion requise' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token invalide ou expiré' });
  }
}

// ── Générateur d'identifiants unique côté serveur ─────────────
function genOrderId() {
  const ts   = Date.now().toString(36).toUpperCase();
  const rand = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  return 'CMD-' + ts.slice(-4) + rand;
}
function genTrackingCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'LUM-';
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  code += '-';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code; // ex: LUM-K3MX-A7B2C3
}

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));


// ════════════════════════════════════════════════════════════
//  UPLOAD CLOUDINARY
// ════════════════════════════════════════════════════════════

app.post('/api/upload', authenticateAdmin, [
  body('data').notEmpty().withMessage('Données requises'),
  body('resourceType').optional().isIn(['image', 'video', 'auto']),
], validate, async (req, res) => {
  if (!cloudinaryEnabled) {
    return res.status(503).json({ error: 'Stockage cloud non configuré (CLOUDINARY_*)' });
  }
  const { data, resourceType = 'auto' } = req.body;
  try {
    const result = await cloudinary.uploader.upload(data, {
      folder        : 'lumiere',
      resource_type : resourceType,
      quality       : 'auto',
      fetch_format  : 'auto',
    });
    res.json({ url: result.secure_url, publicId: result.public_id });
  } catch (err) {
    console.error('Cloudinary upload error:', err.message);
    res.status(500).json({ error: 'Erreur upload fichier : ' + err.message });
  }
});

app.post('/api/upload/proof', authenticateUser, [
  body('data').notEmpty().withMessage('Données requises'),
], validate, async (req, res) => {
  if (!cloudinaryEnabled) {
    return res.status(503).json({ error: 'Stockage cloud non configuré (CLOUDINARY_*)' });
  }
  const { data } = req.body;
  try {
    const result = await cloudinary.uploader.upload(data, {
      folder        : 'lumiere/proofs',
      resource_type : 'image',
      quality       : 'auto',
    });
    res.json({ url: result.secure_url });
  } catch (err) {
    console.error('Cloudinary proof upload error:', err.message);
    res.status(500).json({ error: 'Erreur upload preuve' });
  }
});


// ════════════════════════════════════════════════════════════
//  AUTH CLIENTS
// ════════════════════════════════════════════════════════════

app.post('/api/register', authLimiter, [
  body('email').isEmail().withMessage('Email invalide').normalizeEmail(),
  body('name').trim().notEmpty().withMessage('Nom requis').isLength({ max: 255 }),
  body('password').isLength({ min: 6 }).withMessage('Mot de passe : 6 caractères minimum'),
  body('phone').trim().notEmpty().withMessage('Téléphone requis').isLength({ max: 50 }),
  body('address').trim().notEmpty().withMessage('Adresse requise').isLength({ max: 1000 }),
], validate, async (req, res) => {
  const { name, email, phone, address, password } = req.body;
  try {
    const hash = await bcrypt.hash(password, 12);
    await pool.query(
      'INSERT INTO customers (email, name, phone, address, password) VALUES ($1,$2,$3,$4,$5)',
      [email, name, phone || null, address || null, hash]
    );
    const token = jwt.sign({ email, name, role: 'customer' }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    res.json({ ok: true, token, user: { email, name, phone, address } });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Email déjà utilisé' });
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/api/login', authLimiter, [
  body('email').isEmail().normalizeEmail().withMessage('Email invalide'),
  body('password').notEmpty().withMessage('Mot de passe requis'),
], validate, async (req, res) => {
  const { email, password } = req.body;
  try {
    await migrateCustomersColumns();
    const { rows } = await pool.query(
      'SELECT email, name, phone, address, photo_url, password AS hash FROM customers WHERE email=$1',
      [email]
    );
    if (rows.length === 0) return res.status(401).json({ error: 'Identifiants incorrects' });
    const user     = rows[0];
    const stored   = user.hash;
    const isBcrypt = stored && stored.startsWith('$2');
    const valid    = isBcrypt
      ? await bcrypt.compare(password, stored)
      : password === stored;
    if (!valid) return res.status(401).json({ error: 'Identifiants incorrects' });
    if (!isBcrypt) {
      const h = await bcrypt.hash(password, 12);
      await pool.query('UPDATE customers SET password=$1 WHERE email=$2', [h, email]);
    }
    const token = jwt.sign({ email: user.email, name: user.name, role: 'customer' }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    res.json({ ok: true, token, user: { email: user.email, name: user.name, phone: user.phone, address: user.address, photoUrl: user.photo_url || null } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


// ── Migration photo_url ──────────────────────────────────────
async function migrateCustomersColumns() {
  try {
    await pool.query(`ALTER TABLE customers ADD COLUMN IF NOT EXISTS photo_url TEXT`);
  } catch (_) {}
}

// ── Modifier le profil (nom) ──────────────────────────────────
app.patch('/api/auth/profile', authenticateUser, [
  body('name').trim().notEmpty().withMessage('Nom requis'),
], validate, async (req, res) => {
  const { name } = req.body;
  try {
    await pool.query('UPDATE customers SET name=$1 WHERE email=$2', [name, req.user.email]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ── Modifier la photo de profil ───────────────────────────────
app.patch('/api/auth/photo', authenticateUser, [
  body('photoUrl').trim().notEmpty().isURL().withMessage('URL valide requise'),
], validate, async (req, res) => {
  const { photoUrl } = req.body;
  try {
    await migrateCustomersColumns();
    await pool.query('UPDATE customers SET photo_url=$1 WHERE email=$2', [photoUrl, req.user.email]);
    res.json({ ok: true, photoUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur mise à jour photo' });
  }
});

// ── Changer le mot de passe ────────────────────────────────────
app.patch('/api/auth/password', authenticateUser, [
  body('currentPassword').notEmpty().withMessage('Mot de passe actuel requis'),
  body('newPassword').isLength({ min: 6 }).withMessage('Nouveau mot de passe : 6 caractères minimum'),
], validate, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const { rows } = await pool.query('SELECT password FROM customers WHERE email=$1', [req.user.email]);
    if (!rows.length) return res.status(404).json({ error: 'Utilisateur introuvable' });
    const valid = await bcrypt.compare(currentPassword, rows[0].password);
    if (!valid) return res.status(401).json({ error: 'Mot de passe actuel incorrect' });
    const hash = await bcrypt.hash(newPassword, 12);
    await pool.query('UPDATE customers SET password=$1 WHERE email=$2', [hash, req.user.email]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ════════════════════════════════════════════════════════════
//  PRODUITS
// ════════════════════════════════════════════════════════════

app.get('/api/products', async (_req, res) => {
  res.set('Cache-Control', 'public, max-age=60, s-maxage=300');
  try {
    const { rows: products } = await pool.query(`
      SELECT p.*, 
        COALESCE(
          (SELECT json_agg(pi.image_url) FROM product_images pi WHERE pi.product_id = p.id),
          '[]'::json
        ) AS images
      FROM products p
      ORDER BY p.created_at DESC
    `);
    for (const p of products) {
      p.images = p.images || [];
      p.desc = p.description;
      p.category = normalizeProductCategory(p.category);
    }
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur chargement produits' });
  }
});

app.post('/api/products', authenticateAdmin, [
  body('name').trim().notEmpty().isLength({ max: 255 }),
  body('price').isInt({ min: 0 }),
  body('category').optional().trim().custom(value => PRODUCT_CATEGORIES.includes(normalizeProductCategory(value))).withMessage('Catégorie invalide'),
  body('quantite').optional().trim().isLength({ max: 100 }),
  body('desc').optional().trim().isLength({ max: 5000 }),
  body('images').optional().isArray(),
], validate, async (req, res) => {
  const { id, name, price, category, quantite, desc, images = [] } = req.body;
  const productId = id || Date.now();
  const normalizedCategory = normalizeProductCategory(category);
  try {
    await pool.query(
      'INSERT INTO products (id, name, price, category, quantite, description) VALUES ($1,$2,$3,$4,$5,$6)',
      [productId, name, price, normalizedCategory, quantite || '', desc]
    );
    for (const url of images) {
      await pool.query('INSERT INTO product_images (product_id, image_url) VALUES ($1,$2)', [productId, url]);
    }
    res.json({ ok: true, id: productId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur création produit' });
  }
});

app.put('/api/products/:id', authenticateAdmin, [
  param('id').isNumeric(),
  body('name').optional().trim().isLength({ max: 255 }),
  body('price').optional().isInt({ min: 0 }),
  body('category').optional().trim().custom(value => PRODUCT_CATEGORIES.includes(normalizeProductCategory(value))).withMessage('Catégorie invalide'),
  body('images').optional().isArray(),
], validate, async (req, res) => {
  const { id } = req.params;
  const { name, price, desc, category, quantite, images = [] } = req.body;
  try {
    await pool.query(
      'UPDATE products SET name=$1, price=$2, description=$3, category=$4, quantite=$5 WHERE id=$6',
      [name, price, desc, normalizeProductCategory(category), quantite || '', id]
    );
    await pool.query('DELETE FROM product_images WHERE product_id=$1', [id]);
    for (const url of images) {
      await pool.query('INSERT INTO product_images (product_id, image_url) VALUES ($1,$2)', [id, url]);
    }
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur modification produit' });
  }
});

app.delete('/api/products/:id', authenticateAdmin, [
  param('id').isNumeric(),
], validate, async (req, res) => {
  try {
    await pool.query('DELETE FROM products WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur suppression produit' });
  }
});


// ════════════════════════════════════════════════════════════
//  COMMANDES
// ════════════════════════════════════════════════════════════

app.get('/api/orders/track', [
  query('code').trim().notEmpty().isLength({ max: 50 }),
], validate, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, customer, total, status, transaction_ref, "trackingCode", created_at
       FROM orders WHERE "trackingCode"=$1`,
      [req.query.code]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Commande introuvable' });
    const o = rows[0];
    const { rows: items } = await pool.query(
      'SELECT product_name, quantity FROM order_items WHERE order_id=$1', [o.id]
    );
    res.json({ ...o, items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur recherche commande' });
  }
});

app.get('/api/orders/me', authenticateUser, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT *, "userId", "trackingCode", transaction_ref, proof_url FROM orders WHERE "userId"=$1 ORDER BY created_at DESC`,
      [req.user.email]
    );
    for (const o of rows) {
      const { rows: items } = await pool.query('SELECT * FROM order_items WHERE order_id=$1', [o.id]);
      o.items    = items;
      o.proofUrl = o.proof_url;
      o.transactionRef = o.transaction_ref || '';
    }
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur chargement commandes' });
  }
});

app.get('/api/orders', authenticateAdmin, async (_req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT *, "userId", "trackingCode", transaction_ref, proof_url FROM orders ORDER BY created_at DESC'
    );
    for (const o of rows) {
      const { rows: items } = await pool.query('SELECT * FROM order_items WHERE order_id=$1', [o.id]);
      o.items    = items;
      o.proofUrl = o.proof_url;
      o.transactionRef = o.transaction_ref || '';
    }
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur chargement commandes' });
  }
});

// POST /api/orders — IDs générés côté serveur (plus de collision possible)
app.post('/api/orders', authenticateUser, [
  body('customer').trim().notEmpty().isLength({ max: 255 }),
  body('total').isInt({ min: 0 }),
  body('address').trim().notEmpty().isLength({ max: 1000 }),
  body('items').isArray({ min: 1 }),
  body('transactionRef').trim().notEmpty().isLength({ max: 100 }).withMessage('Référence de transaction requise'),
  body('proofUrl').notEmpty().withMessage('Preuve de paiement requise'),
  body('promoCode').optional().trim().isLength({ max: 50 }),
], validate, async (req, res) => {
  const { customer, items = [], total, address, transactionRef, proofUrl, promoCode } = req.body;
  const userId      = req.user.email;
  const id          = genOrderId();
  const trackingCode = genTrackingCode();
  try {
    const baseTotal = items.reduce((sum, item) => {
      const qty = Number(item.qty ?? item.quantity ?? 0);
      const price = Number(item.price ?? 0);
      return sum + (qty > 0 ? qty : 0) * (price > 0 ? price : 0);
    }, 0);

    let finalTotal = baseTotal;
    let promoToIncrement = null;
    if (promoCode) {
      const { rows } = await pool.query(
        `SELECT * FROM promo_codes WHERE code=$1 AND active=TRUE`,
        [String(promoCode).toUpperCase()]
      );
      if (!rows.length) {
        return res.status(404).json({ error: 'Code promo invalide ou désactivé' });
      }
      const promo = rows[0];
      if (promo.max_uses !== null && promo.used_count >= promo.max_uses) {
        return res.status(400).json({ error: 'Ce code promo a atteint sa limite d\'utilisation' });
      }
      const discount = promo.discount_type === 'percent'
        ? Math.round(baseTotal * promo.discount_value / 100)
        : Math.min(promo.discount_value, baseTotal);
      finalTotal = Math.max(0, baseTotal - discount);
      promoToIncrement = promo.code;
    }

    await pool.query(
      `INSERT INTO orders (id, "userId", customer, total, status, address, "trackingCode", transaction_ref, proof_url)
       VALUES ($1,$2,$3,$4,'pending',$5,$6,$7,$8)`,
      [id, userId, customer, finalTotal, address, trackingCode, transactionRef.trim(), proofUrl]
    );
    for (const item of items) {
      await pool.query(
        'INSERT INTO order_items (order_id, product_id, product_name, quantity, price) VALUES ($1,$2,$3,$4,$5)',
        [id, item.id, item.name || item.product_name, item.qty || item.quantity, item.price]
      );
    }
    if (promoToIncrement) await incrementPromoUsage(promoToIncrement);
    res.json({ ok: true, id, trackingCode, total: finalTotal });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur création commande' });
  }
});

app.put('/api/orders/:id', authenticateAdmin, [
  param('id').trim().notEmpty().isLength({ max: 50 }),
  body('status').isIn(['pending', 'confirmed', 'shipping', 'delivered']),
], validate, async (req, res) => {
  try {
    await pool.query('UPDATE orders SET status=$1 WHERE id=$2', [req.body.status, req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur mise à jour commande' });
  }
});

app.delete('/api/orders/:id', authenticateAdmin, [
  param('id').trim().notEmpty().isLength({ max: 50 }),
], validate, async (req, res) => {
  try {
    await pool.query('DELETE FROM orders WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur suppression commande' });
  }
});


// ════════════════════════════════════════════════════════════
//  PARAMÈTRES BOUTIQUE
// ════════════════════════════════════════════════════════════

// Migration : ajout des nouvelles colonnes si elles n'existent pas encore
async function migrateSettingsColumns() {
  const cols = [
    `ALTER TABLE settings ADD COLUMN IF NOT EXISTS "siteName"     VARCHAR(255) DEFAULT ''`,
    `ALTER TABLE settings ADD COLUMN IF NOT EXISTS "siteMotto"    VARCHAR(500) DEFAULT ''`,
    `ALTER TABLE settings ADD COLUMN IF NOT EXISTS "sitePhone"    VARCHAR(100) DEFAULT ''`,
    `ALTER TABLE settings ADD COLUMN IF NOT EXISTS "siteEmail"    VARCHAR(255) DEFAULT ''`,
    `ALTER TABLE settings ADD COLUMN IF NOT EXISTS "siteWhatsapp" VARCHAR(100) DEFAULT ''`,
    `ALTER TABLE settings ADD COLUMN IF NOT EXISTS "siteInstagram" VARCHAR(255) DEFAULT ''`,
    `ALTER TABLE settings ADD COLUMN IF NOT EXISTS "siteFacebook" VARCHAR(255) DEFAULT ''`,
    `ALTER TABLE settings ADD COLUMN IF NOT EXISTS "siteAddress"  TEXT         DEFAULT ''`,
    `ALTER TABLE settings ADD COLUMN IF NOT EXISTS "bankMobile"   VARCHAR(50)  DEFAULT ''`,
    `ALTER TABLE settings ADD COLUMN IF NOT EXISTS "siteTiktok"  VARCHAR(255) DEFAULT ''`,
    `ALTER TABLE settings ADD COLUMN IF NOT EXISTS "currency"    VARCHAR(10)  DEFAULT ''`,
    `ALTER TABLE settings ADD COLUMN IF NOT EXISTS "smtpHost"    VARCHAR(255) DEFAULT ''`,
    `ALTER TABLE settings ADD COLUMN IF NOT EXISTS "smtpPort"    VARCHAR(10)  DEFAULT '587'`,
    `ALTER TABLE settings ADD COLUMN IF NOT EXISTS "smtpUser"    VARCHAR(255) DEFAULT ''`,
    `ALTER TABLE settings ADD COLUMN IF NOT EXISTS "smtpPass"    VARCHAR(255) DEFAULT ''`,
    `ALTER TABLE settings ADD COLUMN IF NOT EXISTS "smtpFrom"    VARCHAR(255) DEFAULT ''`,
  ];
  for (const sql of cols) {
    try { await pool.query(sql); } catch (_) {}
  }
}

app.get('/api/settings', async (_req, res) => {
  try {
    await migrateSettingsColumns();
    const { rows } = await pool.query(`SELECT * FROM settings WHERE id=1`);
    res.json(rows[0] || {});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur paramètres' });
  }
});

app.post('/api/settings', authenticateAdmin, [
  body('bankName').optional().trim().isLength({ max: 255 }),
  body('bankAccount').optional().trim().isLength({ max: 255 }),
  body('bankHolder').optional().trim().isLength({ max: 255 }),
  body('bankMobile').optional().trim().isLength({ max: 50 }),
  body('siteName').optional().trim().isLength({ max: 255 }),
  body('siteMotto').optional().trim().isLength({ max: 500 }),
  body('sitePhone').optional().trim().isLength({ max: 100 }),
  body('siteEmail').optional().trim().isLength({ max: 255 }),
  body('siteWhatsapp').optional().trim().isLength({ max: 100 }),
  body('siteInstagram').optional().trim().isLength({ max: 255 }),
  body('siteFacebook').optional().trim().isLength({ max: 255 }),
  body('siteAddress').optional().trim().isLength({ max: 1000 }),
  body('siteTiktok').optional().trim().isLength({ max: 255 }),
  body('currency').optional().trim().isLength({ max: 10 }),
  body('smtpHost').optional().trim().isLength({ max: 255 }),
  body('smtpPort').optional().trim().isLength({ max: 10 }),
  body('smtpUser').optional().trim().isLength({ max: 255 }),
  body('smtpPass').optional().trim().isLength({ max: 255 }),
  body('smtpFrom').optional().trim().isLength({ max: 255 }),
], validate, async (req, res) => {
  const {
    bankName, bankAccount, bankHolder, bankMobile,
    siteName, siteMotto, sitePhone, siteEmail,
    siteWhatsapp, siteInstagram, siteFacebook, siteAddress, siteTiktok,
    currency, smtpHost, smtpPort, smtpUser, smtpPass, smtpFrom,
  } = req.body;
  try {
    await migrateSettingsColumns();
    await pool.query(
      `INSERT INTO settings (id,"bankName","bankAccount","bankHolder","bankMobile",
        "siteName","siteMotto","sitePhone","siteEmail","siteWhatsapp","siteInstagram","siteFacebook","siteAddress","siteTiktok","currency",
        "smtpHost","smtpPort","smtpUser","smtpPass","smtpFrom")
       VALUES (1,$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
       ON CONFLICT (id) DO UPDATE SET
         "bankName"=EXCLUDED."bankName","bankAccount"=EXCLUDED."bankAccount",
         "bankHolder"=EXCLUDED."bankHolder","bankMobile"=EXCLUDED."bankMobile",
         "siteName"=EXCLUDED."siteName","siteMotto"=EXCLUDED."siteMotto",
         "sitePhone"=EXCLUDED."sitePhone","siteEmail"=EXCLUDED."siteEmail",
         "siteWhatsapp"=EXCLUDED."siteWhatsapp","siteInstagram"=EXCLUDED."siteInstagram",
         "siteFacebook"=EXCLUDED."siteFacebook","siteAddress"=EXCLUDED."siteAddress",
         "siteTiktok"=EXCLUDED."siteTiktok","currency"=EXCLUDED."currency",
         "smtpHost"=EXCLUDED."smtpHost","smtpPort"=EXCLUDED."smtpPort",
         "smtpUser"=EXCLUDED."smtpUser","smtpPass"=EXCLUDED."smtpPass",
         "smtpFrom"=EXCLUDED."smtpFrom"`,
      [bankName||'', bankAccount||'', bankHolder||'', bankMobile||'',
       siteName||'', siteMotto||'', sitePhone||'', siteEmail||'',
       siteWhatsapp||'', siteInstagram||'', siteFacebook||'', siteAddress||'', siteTiktok||'', currency||'',
       smtpHost||'', smtpPort||'', smtpUser||'', smtpPass||'', smtpFrom||'']
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur sauvegarde paramètres' });
  }
});

// ════════════════════════════════════════════════════════════
//  CODES PROMO
// ════════════════════════════════════════════════════════════

app.get('/api/promo-codes', authenticateAdmin, async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM promo_codes ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur chargement codes promo' });
  }
});

app.post('/api/promo-codes', authenticateAdmin, [
  body('code').trim().notEmpty().isLength({ max: 50 }),
  body('discount_type').isIn(['percent', 'fixed']),
  body('discount_value').isInt({ min: 1 }),
  body('max_uses').optional({ nullable: true }).isInt({ min: 1 }),
], validate, async (req, res) => {
  const { code, discount_type, discount_value, max_uses } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO promo_codes (code, discount_type, discount_value, max_uses)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [code.toUpperCase(), discount_type, discount_value, max_uses || null]
    );
    res.json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Ce code existe déjà' });
    console.error(err);
    res.status(500).json({ error: 'Erreur création code promo' });
  }
});

app.patch('/api/promo-codes/:id/toggle', authenticateAdmin, [
  param('id').isInt(),
], validate, async (req, res) => {
  try {
    await pool.query(
      `UPDATE promo_codes SET active = NOT active WHERE id=$1`, [req.params.id]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur mise à jour code' });
  }
});

app.delete('/api/promo-codes/:id', authenticateAdmin, [
  param('id').isInt(),
], validate, async (req, res) => {
  try {
    await pool.query(`DELETE FROM promo_codes WHERE id=$1`, [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur suppression code promo' });
  }
});

app.post('/api/promo-codes/apply', [
  body('code').trim().notEmpty().isLength({ max: 50 }),
  body('total').isInt({ min: 1 }),
], validate, async (req, res) => {
  const { code, total } = req.body;
  try {
    const { rows } = await pool.query(
      `SELECT * FROM promo_codes WHERE code=$1 AND active=TRUE`,
      [code.toUpperCase()]
    );
    if (!rows.length) return res.status(404).json({ error: 'Code promo invalide ou désactivé' });
    const promo = rows[0];
    if (promo.max_uses !== null && promo.used_count >= promo.max_uses) {
      return res.status(400).json({ error: 'Ce code promo a atteint sa limite d\'utilisation' });
    }
    const discount = promo.discount_type === 'percent'
      ? Math.round(total * promo.discount_value / 100)
      : Math.min(promo.discount_value, total);
    const finalTotal = Math.max(0, total - discount);
    res.json({
      code: promo.code,
      discount_type: promo.discount_type,
      discount_value: promo.discount_value,
      discount,
      finalTotal,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur validation code promo' });
  }
});

// Incrément usage lors d'une commande confirmée (appelé en interne)
async function incrementPromoUsage(code) {
  if (!code) return;
  try {
    await pool.query(
      `UPDATE promo_codes SET used_count = used_count + 1 WHERE code=$1`, [code]
    );
  } catch (_) {}
}


// ════════════════════════════════════════════════════════════
//  VIDÉOS
// ════════════════════════════════════════════════════════════

// Détection de langue — via Accept-Language du navigateur (fiable, sans API externe)
app.get('/api/geoip', (req, res) => {
  const accept = req.headers['accept-language'] || '';
  const top = accept.split(',')[0].trim().toLowerCase().split(/[-_]/)[0];
  const supported = ['en','ar','es','pt','de'];
  const lang = supported.includes(top) ? top : null;
  res.json({ country_code: null, lang });
});

app.get('/api/videos', async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, title, url, created_at FROM videos ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur chargement vidéos' });
  }
});

app.post('/api/videos', authenticateAdmin, [
  body('title').trim().notEmpty().isLength({ max: 255 }),
  body('url').notEmpty(),
], validate, async (req, res) => {
  const { id, title, url } = req.body;
  const videoId = id || Date.now();
  try {
    await pool.query('INSERT INTO videos (id, title, url) VALUES ($1,$2,$3)', [videoId, title, url]);
    res.json({ ok: true, id: videoId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur ajout vidéo' });
  }
});

app.delete('/api/videos/:id', authenticateAdmin, [
  param('id').isNumeric(),
], validate, async (req, res) => {
  try {
    await pool.query('DELETE FROM videos WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur suppression vidéo' });
  }
});


// ════════════════════════════════════════════════════════════
//  AVIS CLIENTS
// ════════════════════════════════════════════════════════════

// GET /api/reviews - public, returns all reviews (auto-approved)
app.get('/api/reviews', async (_req, res) => {
  await migrateReviewsTable();
  try {
    const { rows } = await pool.query(
      'SELECT id, name, product, content, rating, created_at FROM reviews WHERE approved=TRUE ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur chargement avis' });
  }
});

// POST /api/reviews - public, submit a review
async function migrateNewsletterTable() {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS newsletter (
      id         SERIAL PRIMARY KEY,
      email      VARCHAR(255) UNIQUE NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`);
  } catch (_) {}
}

async function migrateReviewsTable() {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS reviews (
      id         SERIAL PRIMARY KEY,
      name       VARCHAR(255) NOT NULL,
      product    VARCHAR(255) NOT NULL DEFAULT '',
      content    TEXT NOT NULL,
      rating     INTEGER DEFAULT 5,
      approved   BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`);
  } catch (_) {}
}

app.post('/api/reviews', [
  body('name').trim().notEmpty().isLength({ max: 255 }),
  body('content').trim().notEmpty().isLength({ max: 1000 }),
  body('product').optional().trim().isLength({ max: 255 }),
  body('rating').optional().isInt({ min: 1, max: 5 }),
], validate, async (req, res) => {
  await migrateReviewsTable();
  const { name, content, product, rating } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO reviews (name, product, content, rating, approved) VALUES ($1,$2,$3,$4,TRUE) RETURNING id',
      [name, product || '', content, rating || 5]
    );
    res.json({ ok: true, id: rows[0].id, message: 'Merci pour votre avis !' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur enregistrement avis' });
  }
});

// GET /api/reviews/all - admin, get ALL reviews (including unapproved)
app.get('/api/reviews/all', authenticateAdmin, async (_req, res) => {
  await migrateReviewsTable();
  try {
    const { rows } = await pool.query(
      'SELECT * FROM reviews ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur chargement avis' });
  }
});

// PUT /api/reviews/:id - admin, approve/update review
app.put('/api/reviews/:id', authenticateAdmin, [
  param('id').isNumeric(),
  body('approved').optional().isBoolean(),
], validate, async (req, res) => {
  try {
    const { approved } = req.body;
    if (approved !== undefined) {
      await pool.query('UPDATE reviews SET approved=$1 WHERE id=$2', [approved, req.params.id]);
    }
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur mise à jour avis' });
  }
});

// DELETE /api/reviews/:id - admin, delete review
app.delete('/api/reviews/:id', authenticateAdmin, [
  param('id').isNumeric(),
], validate, async (req, res) => {
  try {
    await pool.query('DELETE FROM reviews WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur suppression avis' });
  }
});

// POST /api/newsletter - subscribe
app.post('/api/newsletter', [
  body('email').trim().isEmail().normalizeEmail(),
], validate, async (req, res) => {
  await migrateNewsletterTable();
  try {
    await pool.query(
      'INSERT INTO newsletter (email) VALUES ($1) ON CONFLICT (email) DO NOTHING',
      [req.body.email]
    );
    res.json({ ok: true, message: 'Merci pour votre inscription !' });
  } catch (err) {
    console.error('Newsletter error:', err);
    res.status(500).json({ error: err.message || 'Erreur inscription newsletter' });
  }
});


// GET /api/newsletter/subscribers - admin, list all subscribers
app.get('/api/newsletter/subscribers', authenticateAdmin, async (_req, res) => {
  await migrateNewsletterTable();
  try {
    const { rows } = await pool.query(
      'SELECT id, email, created_at FROM newsletter ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur chargement abonnés' });
  }
});

// DELETE /api/newsletter/subscribers/:id - admin, delete subscriber
app.delete('/api/newsletter/subscribers/:id', authenticateAdmin, [
  param('id').isNumeric(),
], validate, async (req, res) => {
  await migrateNewsletterTable();
  try {
    await pool.query('DELETE FROM newsletter WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur suppression abonné' });
  }
});

// POST /api/newsletter/send - admin, send newsletter to all subscribers
app.post('/api/newsletter/send', authenticateAdmin, [
  body('subject').trim().notEmpty().isLength({ max: 255 }),
  body('html').trim().notEmpty().isLength({ max: 50000 }),
], validate, async (req, res) => {
  try {
    // Get SMTP settings
    const { rows } = await pool.query('SELECT * FROM settings WHERE id=1');
    const s = rows[0] || {};
    const { smtpHost, smtpPort, smtpUser, smtpPass, smtpFrom, siteName } = s;
    
    if (!smtpHost || !smtpUser || !smtpPass) {
      return res.status(400).json({ error: 'Configuration SMTP incomplète. Configurez d\'abord les paramètres SMTP dans les paramètres du site.' });
    }
    
    // Get all subscribers
    const subs = await pool.query('SELECT email FROM newsletter ORDER BY created_at DESC');
    const emails = subs.rows.map(r => r.email).filter(Boolean);
    
    if (emails.length === 0) {
      return res.status(400).json({ error: 'Aucun abonné à la newsletter.' });
    }
    
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort || '587'),
      secure: smtpPort === '465',
      auth: { user: smtpUser, pass: smtpPass },
    });
    
    const fromName = siteName || 'Lumière Parfums';
    const fromEmail = smtpFrom || smtpUser;
    
    // Send to all subscribers (BCC for privacy)
    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      bcc: emails,
      subject: req.body.subject,
      html: req.body.html,
    });
    
    res.json({ ok: true, sent: emails.length });
  } catch (err) {
    console.error('Newsletter send error:', err);
    res.status(500).json({ error: err.message || 'Erreur envoi newsletter' });
  }
});

// ════════════════════════════════════════════════════════════
//  ADMIN — Auth
// ════════════════════════════════════════════════════════════

app.post('/api/admin/login', authLimiter, [
  body('username').trim().notEmpty().isLength({ max: 100 }),
  body('password').notEmpty(),
], validate, async (req, res) => {
  const { username, password } = req.body;
  try {
    const { rows } = await pool.query(
      'SELECT id, password FROM admins WHERE username=$1', [username]
    );
    if (rows.length === 0) return res.status(401).json({ error: 'Identifiants admin incorrects' });
    const stored   = rows[0].password;
    const isBcrypt = stored && stored.startsWith('$2');
    const valid    = isBcrypt
      ? await bcrypt.compare(password, stored)
      : password === stored;
    if (!valid) return res.status(401).json({ error: 'Identifiants admin incorrects' });
    if (!isBcrypt) {
      const hash = await bcrypt.hash(password, 12);
      await pool.query('UPDATE admins SET password=$1 WHERE username=$2', [hash, username]);
    }
    const token = jwt.sign({ username, role: 'admin' }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    res.json({ ok: true, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


// ════════════════════════════════════════════════════════════
//  CLIENTS (admin)
// ════════════════════════════════════════════════════════════

app.get('/api/customers', authenticateAdmin, async (_req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT email, name, phone, address, created_at FROM customers ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur chargement clients' });
  }
});


// ════════════════════════════════════════════════════════════
//  Fallback SPA
// ════════════════════════════════════════════════════════════
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ════════════════════════════════════════════════════════════
//  Export for Vercel Serverless
// ════════════════════════════════════════════════════════════
module.exports = app;
