/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_GOOGLE_ADS_ID?: string;
  readonly PUBLIC_GOOGLE_ADS_CONVERSION_LABEL?: string;
  readonly PUBLIC_GTM_ID?: string;
  readonly PUBLIC_LEAD_ENDPOINT?: string;
  readonly PUBLIC_CF_ANALYTICS_TOKEN?: string;
  readonly PUBLIC_SITE_URL?: string;
  readonly PUBLIC_NOINDEX_ALL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  dataLayer: Record<string, unknown>[];
  gtag?: (...args: unknown[]) => void;
}
