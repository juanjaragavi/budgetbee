import type { APIRoute } from "astro";
import { googleSheetsService } from "../../lib/googleSheets";

function isEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function generateUniqueId(): string {
  return `budgetbee-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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
    const timestamp = new Date().toISOString();

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
    try {
      console.log("Google Sheets: Starting integration...");
      await googleSheetsService.initializeSheet();
      googleSheetsSuccess =
        await googleSheetsService.appendSubmission(submissionData);
      console.log(
        `Google Sheets: Integration ${googleSheetsSuccess ? "successful" : "failed"}`,
      );
    } catch (error) {
      console.error("Google Sheets integration failed:", error);
      // Continue with SendGrid even if Google Sheets fails
    }

    // Continue with existing SendGrid logic
    const API_KEY = import.meta.env.SENDGRID_API_KEY;
    const LIST_ID = import.meta.env.SENDGRID_LIST_ID;

    let sendGridSuccess = false;
    if (!API_KEY || !LIST_ID) {
      console.warn(
        "SendGrid: API_KEY or LIST_ID not configured, skipping SendGrid integration",
      );
    } else {
      try {
        console.log("SendGrid: Starting integration...");

        // Build SendGrid upsert payload; use same external_id as Google Sheets
        const payload = {
          list_ids: [LIST_ID],
          contacts: [
            {
              email: email.trim().toLowerCase(),
              first_name,
              last_name,
              country: "United States",
              external_id: submissionId, // Use same ID as Google Sheets
              custom_fields: {
                brand: "BudgetBee",
              },
            },
          ],
        };

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

        // SendGrid returns 202 on success
        if (sgRes.status === 202) {
          sendGridSuccess = true;
          console.log("SendGrid: Integration successful");
        } else {
          const details = await sgRes.json().catch(() => ({}));
          console.error("SendGrid: Failed to add subscriber", details);
        }
      } catch (error) {
        console.error("SendGrid integration failed:", error);
      }
    }

    // Return success if at least one integration worked
    if (googleSheetsSuccess || sendGridSuccess) {
      return new Response(
        JSON.stringify({
          ok: true,
          submissionId,
          integrations: {
            googleSheets: googleSheetsSuccess,
            sendGrid: sendGridSuccess,
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
