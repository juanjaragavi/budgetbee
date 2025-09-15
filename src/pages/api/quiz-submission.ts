import type { APIRoute } from "astro";

// Cache for SendGrid field definitions to avoid repeated network calls during dev runtime
interface FieldDefinitionsCache {
  custom: Map<string, string>; // name(lower) -> id
  reserved: Map<string, string>; // name(lower) -> id
  fetchedAt: number;
}

let fieldDefsCache: FieldDefinitionsCache | null = null;

async function fetchFieldDefinitions(apiKey: string): Promise<FieldDefinitionsCache | null> {
  // Reuse cache for 10 minutes
  if (fieldDefsCache && Date.now() - fieldDefsCache.fetchedAt < 10 * 60 * 1000) {
    return fieldDefsCache;
  }
  try {
    const res = await fetch("https://api.sendgrid.com/v3/marketing/field_definitions", {
      method: "GET",
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!res.ok) {
      if (import.meta.env.DEV) {
        console.warn("[SendGrid] Failed to fetch field definitions", res.status);
      }
      return null;
    }
    const json = await res.json().catch(() => ({}));
    const customArray: Array<{ id: string; name: string }> = json.custom_fields || [];
    const reservedArray: Array<{ id: string; name: string }> = json.reserved_fields || [];
    fieldDefsCache = {
      custom: new Map(customArray.map((f) => [f.name.toLowerCase(), f.id])),
      reserved: new Map(reservedArray.map((f) => [f.name.toLowerCase(), f.id])),
      fetchedAt: Date.now(),
    };
    return fieldDefsCache;
  } catch (e) {
    if (import.meta.env.DEV) console.warn("[SendGrid] Error fetching field definitions", e);
    return null;
  }
}

function isEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json().catch(() => ({}));
    const { preference, income, email, name, acceptedTerms, brand, country } =
      data as {
        preference?: string;
        income?: string;
        email?: string;
        name?: string;
        acceptedTerms?: boolean;
        brand?: string;
        country?: string;
      };

    // Basic validation
    if (!email || !name || !acceptedTerms || !isEmail(email)) {
      return new Response(
        JSON.stringify({ message: "Invalid or missing fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // Normalize/sanitize enrichment fields (fallback to defaults so segmentation stays consistent)
    const safeBrand =
      typeof brand === "string" && brand.trim() !== ""
        ? brand.trim()
        : "BudgetBee";
    const safeCountry =
      typeof country === "string" && country.trim() !== ""
        ? country.trim()
        : "United States";

    const API_KEY = import.meta.env.SENDGRID_API_KEY;
    const LIST_ID = import.meta.env.SENDGRID_LIST_ID;
    if (!API_KEY || !LIST_ID) {
      return new Response(
        JSON.stringify({ message: "Server misconfiguration" }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    // Split full name
    const [first_name, ...rest] = name.trim().split(/\s+/);
    const last_name = rest.join(" ") || undefined;

    // Optional custom field IDs (create in SendGrid UI, then set in deployment env)
    let PREF_FIELD_ID = import.meta.env.SENDGRID_PREFERENCE_FIELD_ID as string | undefined;
    let INCOME_FIELD_ID = import.meta.env.SENDGRID_INCOME_FIELD_ID as string | undefined;
    let CONSENT_FIELD_ID = import.meta.env.SENDGRID_CONSENT_FIELD_ID as string | undefined;
    let BRAND_FIELD_ID = import.meta.env.SENDGRID_BRAND_FIELD_ID as string | undefined;
    let COUNTRY_FIELD_ID = import.meta.env.SENDGRID_COUNTRY_FIELD_ID as string | undefined;

    // If any desired custom field IDs are missing, attempt automatic lookup by field name.
    if (!PREF_FIELD_ID || !INCOME_FIELD_ID || !CONSENT_FIELD_ID || !BRAND_FIELD_ID || !COUNTRY_FIELD_ID) {
      const defs = await fetchFieldDefinitions(API_KEY);
      if (defs) {
        const lookup = (name: string) => defs.custom.get(name.toLowerCase()) || defs.reserved.get(name.toLowerCase());
        // Only assign if currently missing so explicit env vars always win.
        if (!PREF_FIELD_ID) PREF_FIELD_ID = lookup("Preference") || lookup("preference");
        if (!INCOME_FIELD_ID) INCOME_FIELD_ID = lookup("Income") || lookup("income");
        if (!CONSENT_FIELD_ID) CONSENT_FIELD_ID = lookup("Consent") || lookup("consent");
        if (!BRAND_FIELD_ID) BRAND_FIELD_ID = lookup("Brand") || lookup("brand");
        if (!COUNTRY_FIELD_ID) COUNTRY_FIELD_ID = lookup("Country") || lookup("country");
      }
    }

    const customFields: Record<string, string> = {};
    if (PREF_FIELD_ID && preference)
      customFields[PREF_FIELD_ID] = String(preference).slice(0, 255);
    if (INCOME_FIELD_ID && income)
      customFields[INCOME_FIELD_ID] = String(income).slice(0, 255);
    if (CONSENT_FIELD_ID)
      customFields[CONSENT_FIELD_ID] = acceptedTerms ? "1" : "0";
    if (BRAND_FIELD_ID && safeBrand) customFields[BRAND_FIELD_ID] = safeBrand;
    if (COUNTRY_FIELD_ID && safeCountry)
      customFields[COUNTRY_FIELD_ID] = safeCountry;

    // Prepare payload for SendGrid upsert
    const contact: Record<string, unknown> = {
      email: email.trim().toLowerCase(),
      first_name,
      last_name,
      // Set top-level country as well (SendGrid has a reserved field) to improve segmentation even if custom field missing.
      country: safeCountry,
    };
    // Only attach custom_fields if at least one mapping exists to avoid API errors
    if (Object.keys(customFields).length > 0) {
      contact.custom_fields = customFields;
    }

    const payload: Record<string, unknown> = {
      list_ids: [LIST_ID],
      contacts: [contact],
    };

    if (import.meta.env.DEV) {
      console.info("[SendGrid] Upserting contact with fields:", {
        email: contact.email,
        hasCustomFields: Boolean(contact.custom_fields),
        customFieldKeys: contact.custom_fields ? Object.keys(contact.custom_fields as Record<string, string>) : [],
        countryTopLevel: contact.country,
      });
    }

    const sgRes = await fetch(
      "https://api.sendgrid.com/v3/marketing/contacts",
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    if (sgRes.status !== 202) {
      const details = await sgRes.json().catch(() => ({}));
      return new Response(
        JSON.stringify({ message: "Failed to add subscriber", details }),
        { status: 502, headers: { "Content-Type": "application/json" } },
      );
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Quiz submission error", err);
    return new Response(JSON.stringify({ message: "Unexpected error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
