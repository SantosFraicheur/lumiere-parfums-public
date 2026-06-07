-- ============================================================
--  LUMIÈRE — Schéma PostgreSQL
--  Compatible Render PostgreSQL, Supabase, Neon, Railway
--  Exécutez ce fichier une fois sur votre base de données.
-- ============================================================

CREATE TABLE IF NOT EXISTS customers (
  email      VARCHAR(255) PRIMARY KEY,
  name       VARCHAR(255) NOT NULL,
  phone      VARCHAR(50) NOT NULL,
  address    TEXT NOT NULL,
  password   VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ  DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id          BIGINT       PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  price       INTEGER      NOT NULL,
  category    VARCHAR(100) NOT NULL DEFAULT '',
  quantite    VARCHAR(100) NOT NULL DEFAULT '',
  description TEXT,
  created_at  TIMESTAMPTZ  DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_images (
  id         SERIAL  PRIMARY KEY,
  product_id BIGINT  REFERENCES products(id) ON DELETE CASCADE,
  image_url  TEXT
);

CREATE TABLE IF NOT EXISTS orders (
  id             VARCHAR(50)  PRIMARY KEY,
  "userId"       VARCHAR(255) REFERENCES customers(email) ON DELETE SET NULL,
  customer       VARCHAR(255),
  total          INTEGER,
  status         VARCHAR(50)  DEFAULT 'pending',
  address        TEXT,
  "trackingCode" VARCHAR(50),
  proof_url      TEXT,
  created_at     TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_userid       ON orders("userId");
CREATE INDEX IF NOT EXISTS idx_orders_trackingcode ON orders("trackingCode");

CREATE TABLE IF NOT EXISTS order_items (
  id           SERIAL      PRIMARY KEY,
  order_id     VARCHAR(50) REFERENCES orders(id) ON DELETE CASCADE,
  product_id   BIGINT,
  product_name VARCHAR(255),
  quantity     INTEGER,
  price        INTEGER
);

CREATE TABLE IF NOT EXISTS settings (
  id            INTEGER PRIMARY KEY DEFAULT 1,
  "bankName"    VARCHAR(255) NOT NULL DEFAULT '',
  "bankAccount" VARCHAR(255) NOT NULL DEFAULT '',
  "bankHolder"  VARCHAR(255) NOT NULL DEFAULT '',
  "bankMobile"  VARCHAR(50)  NOT NULL DEFAULT '',
  "siteName"    VARCHAR(255) NOT NULL DEFAULT '',
  "siteMotto"   VARCHAR(500) NOT NULL DEFAULT '',
  "sitePhone"   VARCHAR(100) NOT NULL DEFAULT '',
  "siteEmail"   VARCHAR(255) NOT NULL DEFAULT '',
  "siteWhatsapp" VARCHAR(100) NOT NULL DEFAULT '',
  "siteInstagram" VARCHAR(255) NOT NULL DEFAULT '',
  "siteFacebook" VARCHAR(255) NOT NULL DEFAULT '',
  "siteAddress" TEXT NOT NULL DEFAULT '',
  "siteTiktok"  VARCHAR(255) NOT NULL DEFAULT '',
  "currency"    VARCHAR(10) NOT NULL DEFAULT '',
  "smtpHost"    VARCHAR(255) NOT NULL DEFAULT '',
  "smtpPort"    VARCHAR(10) NOT NULL DEFAULT '587',
  "smtpUser"    VARCHAR(255) NOT NULL DEFAULT '',
  "smtpPass"    VARCHAR(255) NOT NULL DEFAULT '',
  "smtpFrom"    VARCHAR(255) NOT NULL DEFAULT '',
  CONSTRAINT settings_single_row CHECK (id = 1)
);

INSERT INTO settings (id, "bankName", "bankAccount", "bankHolder", "bankMobile", "siteName", "siteMotto", "sitePhone", "siteEmail", "siteWhatsapp", "siteInstagram", "siteFacebook", "siteAddress", "siteTiktok", "currency", "smtpHost", "smtpPort", "smtpUser", "smtpPass", "smtpFrom")
VALUES (1, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '587', '', '', '')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS videos (
  id         BIGINT      PRIMARY KEY,
  title      VARCHAR(255),
  url        TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
--  ADMINS
--  Le mot de passe est hashé (bcrypt) par le serveur au
--  démarrage via ADMIN_USERNAME / ADMIN_PASSWORD env vars.
--  Ne stockez jamais de mot de passe en clair ici.
-- ============================================================
CREATE TABLE IF NOT EXISTS admins (
  id       SERIAL      PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255)        NOT NULL
);
