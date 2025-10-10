import type { APIRoute } from "astro";
import { googleSheetsService } from "../../lib/googleSheets";
import {
  buildBrevoAttributes,
  createMarketingLeadRecord,
} from "../../lib/marketing/lead";
import type { MarketingLeadRecord } from "../../lib/marketing/lead";

function isEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json().catch(() => ({}));

    const normalizeString = (value: unknown) =>
      typeof value === "string" && value.trim().length > 0
        ? value.trim()
        : undefined;

    const rawEmail = typeof data.email === "string" ? data.email : undefined;
    const rawName = typeof data.name === "string" ? data.name : undefined;
    const rawAcceptedTerms =
      typeof data.acceptedTerms === "boolean"
        ? data.acceptedTerms
        : typeof data.acceptedTerms === "string"
          ? data.acceptedTerms.toLowerCase() === "true"
          : false;

    if (!rawEmail || !rawName || !rawAcceptedTerms || !isEmail(rawEmail)) {
      return new Response(
        JSON.stringify({ message: "Invalid or missing fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    let leadRecord: MarketingLeadRecord;
    try {
      leadRecord = createMarketingLeadRecord({
        name: rawName,
        email: rawEmail,
        preference: normalizeString(data.preference),
        income: normalizeString(data.income),
        acceptedTerms: rawAcceptedTerms,
        Pais: normalizeString(data.Pais),
        pais: normalizeString(data.pais),
        Marca: normalizeString(data.Marca),
        marca: normalizeString(data.marca),
        country: normalizeString(data.country),
        brand: normalizeString(data.brand),
        utm_source: normalizeString(data.utm_source),
        utm_medium: normalizeString(data.utm_medium),
        utm_campaign: normalizeString(data.utm_campaign),
        utm_content: normalizeString(data.utm_content),
        utm_term: normalizeString(data.utm_term),
        source: normalizeString(data.source),
        medium: normalizeString(data.medium),
        campaign: normalizeString(data.campaign),
        content: normalizeString(data.content),
        term: normalizeString(data.term),
        referrer: normalizeString(data.referrer),
        userAgent: normalizeString(data.userAgent),
        pageUrl: normalizeString(data.pageUrl),
        timestamp: normalizeString(data.timestamp),
        submissionId: normalizeString(data.submissionId),
        externalId: normalizeString(data.externalId),
        formSource: normalizeString(data.formSource) ?? "credit-card-quiz",
        formName: "Credit Card Quiz",
      });
    } catch (error) {
      console.error("Quiz submission: failed to build marketing record", error);
      return new Response(
        JSON.stringify({ message: "Unable to process submission" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // Initialize Google Sheets integration
    let googleSheetsSuccess = false;
    let googleSheetsAction: string | undefined;
    try {
      console.log("Google Sheets: Starting integration...");
      await googleSheetsService.initializeSheet();
      const upsertResult =
        await googleSheetsService.upsertSubmission(leadRecord);
      googleSheetsSuccess = upsertResult.success;
      googleSheetsAction = upsertResult.action;
      console.log(
        `Google Sheets: Integration ${googleSheetsSuccess ? "successful" : "failed"}`,
      );
    } catch (error) {
      console.error("Google Sheets integration failed:", error);
      // Continue with SendGrid even if Google Sheets fails
    }

    // Continue with Brevo logic
    const BREVO_API_KEY = import.meta.env.BREVO_API_KEY;

    let brevoSuccess = false;
    if (!BREVO_API_KEY) {
      console.warn(
        "Brevo: BREVO_API_KEY not configured, skipping Brevo integration",
      );
    } else {
      try {
        console.log("Brevo: Starting integration...");

        const payload = {
          attributes: buildBrevoAttributes(leadRecord),
          updateEnabled: true, // Allow updates if contact already exists
          listIds: [7, 5],
          email: leadRecord.email,
          ext_id: leadRecord.externalId,
        };

        const brevoRes = await fetch("https://api.brevo.com/v3/contacts", {
          method: "POST",
          headers: {
            accept: "application/json",
            "content-type": "application/json",
            "api-key": BREVO_API_KEY,
          },
          body: JSON.stringify(payload),
        });

        // Brevo returns 201 on successful creation or 204 on successful update
        if (brevoRes.status === 201 || brevoRes.status === 204) {
          brevoSuccess = true;
          console.log("Brevo: Integration successful");
        } else {
          const details = await brevoRes.json().catch(() => ({}));
          console.error("Brevo: Failed to add/update subscriber", details);
        }
      } catch (error) {
        console.error("Brevo integration failed:", error);
      }
    }

    // Return success if at least one integration worked
    if (googleSheetsSuccess || brevoSuccess) {
      return new Response(
        JSON.stringify({
          ok: true,
          submissionId: leadRecord.submissionId,
          integrations: {
            googleSheets: googleSheetsSuccess,
            googleSheetsAction,
            brevo: brevoSuccess,
          },
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    } else {
      return new Response(
        JSON.stringify({ message: "All integrations failed" }),
        { status: 502, headers: { "Content-Type": "application/json" } },
      );
    }
  } catch (error) {
    console.error("Quiz submission error:", error);
    return new Response(JSON.stringify({ message: "Unexpected error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
