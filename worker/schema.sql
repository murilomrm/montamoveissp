-- Banco de leads da MontaMóveis SP (Cloudflare D1).
-- Aplicar com: npx wrangler d1 execute montamoveissp-leads --remote --file=./schema.sql

CREATE TABLE IF NOT EXISTS leads (
  id            TEXT PRIMARY KEY,
  criado_em     TEXT NOT NULL,
  nome          TEXT NOT NULL,
  whatsapp      TEXT NOT NULL,
  regiao        TEXT NOT NULL,
  servico       TEXT NOT NULL,
  moveis        TEXT NOT NULL,
  data_desejada TEXT,
  pagina        TEXT,
  utm_source    TEXT,
  utm_medium    TEXT,
  utm_campaign  TEXT,
  utm_term      TEXT,
  utm_content   TEXT,
  gclid         TEXT,
  fbclid        TEXT,
  fotos         TEXT,           -- JSON: array de chaves no R2
  ip_hash       TEXT,           -- SHA-256 do IP + salt secreto. Nunca o IP puro (LGPD).
  user_agent    TEXT
);

CREATE INDEX IF NOT EXISTS idx_leads_criado_em ON leads (criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_leads_ip_hash   ON leads (ip_hash, criado_em);
