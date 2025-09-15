import type { APIRoute } from "astro";

function isEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json().catch(() => ({}));
    const { preference, income, email, name, acceptedTerms } = data as {
      preference?: string;
      income?: string;
      email?: string;
      name?: string;
      acceptedTerms?: boolean;
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

    const API_KEY = import.meta.env.SENDGRID_API_KEY;
    const LIST_ID = import.meta.env.SENDGRID_LIST_ID;
    if (!API_KEY || !LIST_ID) {
      return new Response(
        JSON.stringify({ message: "Server misconfiguration" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Split name into first/last
    const [first_name, ...rest] = name.trim().split(/\s+/);
    const last_name = rest.join(" ") || undefined;

    // Build SendGrid upsert payload; add custom_fields once created in SendGrid UI
    const payload = {
      list_ids: [LIST_ID],
      contacts: [
        {
          email: email.trim().toLowerCase(),
          first_name,
          last_name,
          country: "United States",
          external_id: `budgetbee-${Date.now()}`,
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
  } catch {
    return new Response(JSON.stringify({ message: "Unexpected error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
