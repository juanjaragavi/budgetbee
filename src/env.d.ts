/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly BYPASS_QUIZ_COOKIE_VALIDATION: string;
  readonly BREVO_API_KEY: string;
  readonly SENDER_EMAIL?: string;
  readonly RECIPIENT_EMAIL?: string;
  readonly BREVO_SANDBOX?: string; // 'true' to skip remote calls in development
  readonly SENDGRID_SANDBOX?: string; // legacy flag maintained for backward compatibility
  readonly SMTP_HOST?: string;
  readonly SMTP_PORT?: string; // number as string
  readonly SMTP_SECURE?: string; // 'true' | 'false'
  readonly SMTP_USER?: string;
  readonly SMTP_PASS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
