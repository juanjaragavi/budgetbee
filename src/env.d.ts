/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly BYPASS_QUIZ_COOKIE_VALIDATION: string;
  readonly KIT_API_KEY: string;
  readonly KIT_API_URL: string;
  readonly SENDGRID_API_KEY: string;
  readonly SENDER_EMAIL?: string;
  readonly RECIPIENT_EMAIL?: string;
  readonly SENDGRID_REGION?: string; // 'eu' to enable EU residency
  readonly SENDGRID_SANDBOX?: string; // 'true' to enable sandbox mode in dev
  readonly SMTP_HOST?: string;
  readonly SMTP_PORT?: string; // number as string
  readonly SMTP_SECURE?: string; // 'true' | 'false'
  readonly SMTP_USER?: string;
  readonly SMTP_PASS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
