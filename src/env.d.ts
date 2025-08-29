/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly BYPASS_QUIZ_COOKIE_VALIDATION: string;
  readonly KIT_API_KEY: string;
  readonly KIT_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
