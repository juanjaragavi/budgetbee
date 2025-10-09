import type { APIRoute } from "astro";
import { googleSheetsService } from "../../lib/googleSheets";
import { getBogotaTimestamp } from "../../lib/utils/timezone";

function isEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function generateUniqueId(): string {
  return `budgetbee-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json().catch(() => ({}));
    const {
      preference,
      income,
      email,
      name,
      acceptedTerms,
      // UTM and tracking data from frontend
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term,
      referrer,
      userAgent,
      pageUrl,
    } = data as {
      preference?: string;
      income?: string;
      email?: string;
      name?: string;
      acceptedTerms?: boolean;
      utm_source?: string;
      utm_medium?: string;
      utm_campaign?: string;
      utm_content?: string;
      utm_term?: string;
      referrer?: string;
      userAgent?: string;
      pageUrl?: string;
    };

    // Basic validation
    if (!email || !name || !acceptedTerms || !isEmail(email)) {
      return new Response(
        JSON.stringify({ message: "Invalid or missing fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Generate unique ID and timestamp
    const submissionId = generateUniqueId();
    const timestamp = getBogotaTimestamp();

    // Split name into first/last (matching SendGrid logic)
    const [first_name, ...rest] = name.trim().split(/\s+/);
    const last_name = rest.join(" ") || undefined;

    // Prepare comprehensive submission data for Google Sheets
    const submissionData = {
      // Core form data
      name: name.trim(),
      email: email.trim().toLowerCase(),
      preference,
      income,
      acceptedTerms,

      // SendGrid-specific fields
      first_name,
      last_name,
      country: "United States", // Hardcoded as in SendGrid payload
      external_id: submissionId,
      brand: "BudgetBee",

      // UTM and tracking data
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term,
      referrer,
      userAgent,
      pageUrl,

      // System fields
      timestamp,
      submissionId,
    };

    // Initialize Google Sheets integration
    let googleSheetsSuccess = false;
    let googleSheetsAction: string | undefined;
    try {
      console.log("Google Sheets: Starting integration...");
      await googleSheetsService.initializeSheet();
      const upsertResult =
        await googleSheetsService.upsertSubmission(submissionData);
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

        // Generate ext_id with timestamp (budgetbee-{timestamp})
        const brevoExtId = `budgetbee-${Date.now()}`;

        // Build Brevo payload
        const payload = {
          attributes: {
            FIRSTNAME: first_name,
            LASTNAME: last_name || "",
            COUNTRIES: "United States",
          },
          updateEnabled: true, // Allow updates if contact already exists
          listIds: [7, 5], // Using list ID 7 as in the reference payload
          email: email.trim().toLowerCase(),
          ext_id: brevoExtId,
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
          submissionId,
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
