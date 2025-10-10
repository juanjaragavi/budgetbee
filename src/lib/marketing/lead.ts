import { getBogotaTimestamp } from "../utils/timezone";

export const REQUIRED_TRACKING_FIELDS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "source",
  "medium",
  "campaign",
  "content",
  "term",
  "Pais",
  "Marca",
] as const;

export type RequiredTrackingField = (typeof REQUIRED_TRACKING_FIELDS)[number];

export interface LeadInput {
  name: string;
  email: string;
  preference?: string | null;
  income?: string | null;
  acceptedTerms?: boolean | null;
  subject?: string | null;
  message?: string | null;
  formName?: string | null;
  formSource?: string | null;
  Pais?: string | null;
  Marca?: string | null;
  pais?: string | null;
  marca?: string | null;
  country?: string | null;
  brand?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  utm_term?: string | null;
  source?: string | null;
  medium?: string | null;
  campaign?: string | null;
  content?: string | null;
  term?: string | null;
  referrer?: string | null;
  userAgent?: string | null;
  pageUrl?: string | null;
  timestamp?: string | null;
  submissionId?: string | null;
  externalId?: string | null;
}

export interface MarketingLeadRecord {
  name: string;
  email: string;
  firstName: string;
  lastName: string;
  preference?: string;
  income?: string;
  acceptedTerms: boolean;
  country: string;
  pais: string;
  brand: string;
  marca: string;
  externalId: string;
  submissionId: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  referrer?: string;
  userAgent?: string;
  pageUrl?: string;
  formSource: string;
  subject?: string;
  message?: string;
  timestamp: string;
}

const DEFAULT_COUNTRY = "United States";
const DEFAULT_PAIS = "Estados Unidos";
const DEFAULT_BRAND = "BudgetBee";
const DEFAULT_MARCA = "BudgetBee";

function generateLeadId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function splitName(fullName: string): { firstName: string; lastName: string } {
  const normalized = fullName.trim().replace(/\s+/g, " ");
  if (!normalized) {
    return { firstName: "", lastName: "" };
  }

  const parts = normalized.split(" ");
  const [first, ...rest] = parts;
  return {
    firstName: first,
    lastName: rest.join(" "),
  };
}

function normalizeField(value: string | null | undefined): string | undefined {
  if (value === null || value === undefined) return undefined;
  const trimmed = String(value).trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function normalizeBoolean(value: boolean | null | undefined): boolean {
  if (typeof value === "boolean") return value;
  return false;
}

function sanitizeMessage(value: string | null | undefined): string | undefined {
  const normalized = normalizeField(value);
  if (!normalized) return undefined;
  return normalized.replace(/\r?\n/g, " ");
}

export function createMarketingLeadRecord(
  input: LeadInput,
): MarketingLeadRecord {
  const name = normalizeField(input.name);
  const email = normalizeField(input.email)?.toLowerCase();

  if (!name || !email) {
    throw new Error("createMarketingLeadRecord requires name and email");
  }

  const { firstName, lastName } = splitName(name);

  const preference = normalizeField(input.preference ?? null);
  const income = normalizeField(input.income ?? null);
  const subject = normalizeField(input.subject ?? null);
  const message = sanitizeMessage(input.message ?? null);

  const acceptedTerms = normalizeBoolean(input.acceptedTerms ?? null);
  const country = normalizeField(input.country ?? null) ?? DEFAULT_COUNTRY;
  const pais = normalizeField(input.Pais ?? input.pais ?? null) ?? DEFAULT_PAIS;
  const brand = normalizeField(input.brand ?? null) ?? DEFAULT_BRAND;
  const marca =
    normalizeField(input.Marca ?? input.marca ?? null) ?? DEFAULT_MARCA;

  const utm_source = normalizeField(input.utm_source ?? input.source ?? null);
  const utm_medium = normalizeField(input.utm_medium ?? input.medium ?? null);
  const utm_campaign = normalizeField(
    input.utm_campaign ?? input.campaign ?? null,
  );
  const utm_content = normalizeField(
    input.utm_content ?? input.content ?? null,
  );
  const utm_term = normalizeField(input.utm_term ?? input.term ?? null);

  const referrer = normalizeField(input.referrer ?? null);
  const userAgent = normalizeField(input.userAgent ?? null);
  const pageUrl = normalizeField(input.pageUrl ?? null);

  const timestamp =
    normalizeField(input.timestamp ?? null) ?? getBogotaTimestamp();
  const submissionId =
    normalizeField(input.submissionId ?? null) ??
    generateLeadId("budgetbee-submission");
  const externalId =
    normalizeField(input.externalId ?? null) ?? generateLeadId("budgetbee");

  const formSource =
    normalizeField(input.formSource ?? null) ??
    normalizeField(input.formName ?? null) ??
    "unknown";

  return {
    name,
    email,
    firstName,
    lastName,
    preference,
    income,
    acceptedTerms,
    country,
    pais,
    brand,
    marca,
    externalId,
    submissionId,
    utm_source,
    utm_medium,
    utm_campaign,
    utm_content,
    utm_term,
    referrer,
    userAgent,
    pageUrl,
    formSource,
    subject,
    message,
    timestamp,
  };
}

export function buildBrevoAttributes(lead: MarketingLeadRecord) {
  return {
    FIRSTNAME: lead.firstName,
    LASTNAME: lead.lastName,
    COUNTRIES: lead.country,
    PAIS: lead.pais,
    BRAND: lead.brand,
    MARCA: lead.marca,
    SOURCE: lead.formSource,
    UTM_SOURCE: lead.utm_source,
    UTM_MEDIUM: lead.utm_medium,
    UTM_CAMPAIGN: lead.utm_campaign,
    UTM_CONTENT: lead.utm_content,
    UTM_TERM: lead.utm_term,
    REFERRER: lead.referrer,
    PAGE_URL: lead.pageUrl,
  };
}
