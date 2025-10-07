import type { APIRoute } from "astro";
export const prerender = false;
import nodemailer from "nodemailer";

const BREVO_CONTACT_URL = "https://api.brevo.com/v3/contacts";
const BREVO_EMAIL_URL = "https://api.brevo.com/v3/smtp/email";
const BREVO_LIST_IDS = [7, 5] as const;

function generateBrevoExtId(): string {
  return `budgetbee-contact-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return new Response(
        JSON.stringify({ message: "Content-Type must be application/json" }),
        { status: 415, headers: { "Content-Type": "application/json" } },
      );
    }

    const raw = await request.text();
    if (!raw) {
      return new Response(JSON.stringify({ message: "Empty request body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    let data: any;
    try {
      data = JSON.parse(raw);
    } catch {
      return new Response(JSON.stringify({ message: "Invalid JSON" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { name, email, subject, message } = data ?? {};

    if (!name || !email || !subject || !message) {
      return new Response(
        JSON.stringify({ message: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ message: "Invalid email format" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const brevoApiKey = import.meta.env.BREVO_API_KEY;
    const senderEmail = import.meta.env.SENDER_EMAIL || "info@budgetbeepro.com";
    const recipientEmail =
      import.meta.env.RECIPIENT_EMAIL || "juan.jaramillo@topnetworks.co";

    if (!brevoApiKey) {
      console.error("Missing Brevo API key");
      return new Response(
        JSON.stringify({ message: "Server configuration error" }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const [firstName, ...restName] = name.trim().split(/\s+/);
    const lastName = restName.join(" ");

    const htmlMessage = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px; }
          h1 { color: #E7B739; margin-bottom: 20px; }
          .info-row { margin-bottom: 10px; }
          .label { font-weight: bold; margin-right: 10px; }
          .message-box { background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 20px; }
          .footer { margin-top: 30px; font-size: 12px; color: #777; border-top: 1px solid #e0e0e0; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>New Contact Form Submission</h1>
          <div class="info-row"><span class="label">Name:</span> ${name}</div>
          <div class="info-row"><span class="label">Email:</span> ${email}</div>
          <div class="info-row"><span class="label">Subject:</span> ${subject}</div>
          <div class="message-box">
            <span class="label">Message:</span>
            <p>${message.replace(/\n/g, "<br>")}</p>
          </div>
          <div class="footer">This email was sent from the BudgetBee Contact Form.</div>
        </div>
      </body>
      </html>
    `;

    const textMessage = `You received a new message from your contact form:\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`;

    const useSandbox = Boolean(
      import.meta.env.DEV ||
        import.meta.env.BREVO_SANDBOX === "true" ||
        import.meta.env.SENDGRID_SANDBOX === "true",
    );

    const brevoHeaders = {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": brevoApiKey,
    };

    let contactSynced = false;
    if (useSandbox) {
      contactSynced = true;
      console.info("[Brevo] Sandbox mode enabled - skipping contact sync.");
    } else {
      try {
        const contactPayload = {
          email: normalizedEmail,
          attributes: {
            FIRSTNAME: firstName,
            LASTNAME: lastName,
            COUNTRIES: "United States",
            SOURCE: "contact-form",
          },
          listIds: BREVO_LIST_IDS,
          updateEnabled: true,
          ext_id: generateBrevoExtId(),
        };

        const contactResponse = await fetch(BREVO_CONTACT_URL, {
          method: "POST",
          headers: brevoHeaders,
          body: JSON.stringify(contactPayload),
        });

        if (contactResponse.status === 201 || contactResponse.status === 204) {
          contactSynced = true;
        } else {
          const contactDetails = await contactResponse
            .json()
            .catch(() => undefined);
          const duplicateError =
            contactResponse.status === 400 &&
            typeof contactDetails?.message === "string" &&
            contactDetails.message.toLowerCase().includes("duplicate");

          if (duplicateError) {
            contactSynced = true;
          } else {
            console.error("Brevo contact sync failed:", {
              status: contactResponse.status,
              details: contactDetails,
            });
          }
        }
      } catch (error) {
        console.error("Brevo contact sync threw:", error);
      }
    }

    let emailSent = false;
    let primaryEmailError: unknown;
    if (useSandbox) {
      emailSent = true;
      console.info("[Brevo] Sandbox mode enabled - skipping outbound email.");
    } else {
      try {
        const emailPayload = {
          sender: { email: senderEmail, name: "BudgetBee Contact" },
          to: [{ email: recipientEmail }],
          replyTo: { email: normalizedEmail, name },
          subject: `Contact Form: ${subject}`,
          htmlContent: htmlMessage,
          textContent: textMessage,
          tags: ["budgetbee-contact-form"],
          headers: {
            "X-Contact-List-Ids": BREVO_LIST_IDS.join(","),
          },
        };

        const emailResponse = await fetch(BREVO_EMAIL_URL, {
          method: "POST",
          headers: brevoHeaders,
          body: JSON.stringify(emailPayload),
        });

        if (emailResponse.ok) {
          emailSent = true;
        } else {
          const emailDetails = await emailResponse
            .json()
            .catch(() => undefined);
          primaryEmailError = {
            status: emailResponse.status,
            details: emailDetails,
          };
          console.error("Brevo email send failed:", primaryEmailError);
        }
      } catch (error) {
        primaryEmailError = error;
        console.error("Brevo email send threw:", error);
      }
    }

    if (!emailSent) {
      const smtpHost = import.meta.env.SMTP_HOST;
      if (smtpHost) {
        const smtpPort = Number(import.meta.env.SMTP_PORT || 587);
        const smtpSecure =
          String(import.meta.env.SMTP_SECURE || "false") === "true";
        const smtpUser = import.meta.env.SMTP_USER;
        const smtpPass = import.meta.env.SMTP_PASS;

        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpSecure,
          auth:
            smtpUser && smtpPass
              ? { user: smtpUser, pass: smtpPass }
              : undefined,
        });

        try {
          await transporter.sendMail({
            from: `"BudgetBee Contact" <${senderEmail}>`,
            to: recipientEmail,
            replyTo: normalizedEmail,
            subject: `Contact Form: ${subject}`,
            text: textMessage,
            html: htmlMessage,
          });
          emailSent = true;
        } catch (smtpError) {
          const error = new Error("Failed to send message via Brevo or SMTP.");
          (error as any).details = {
            brevo: primaryEmailError,
            smtp: smtpError,
          };
          throw error;
        }
      } else {
        const error = new Error("Failed to send message via Brevo.");
        (error as any).details = primaryEmailError;
        throw error;
      }
    }

    return new Response(
      JSON.stringify({
        message: "Message sent successfully!",
        integrations: {
          brevo: {
            contactSynced,
            emailSent: !useSandbox ? emailSent : false,
            sandbox: useSandbox,
            listIds: BREVO_LIST_IDS,
          },
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error: any) {
    if (error?.details) {
      console.error("Contact form error:", error.details);
    } else {
      console.error("Contact form error:", error);
    }

    const responseBody: Record<string, unknown> = {
      message: "Failed to send message",
    };

    if (import.meta.env.DEV && error?.details) {
      responseBody.details = error.details;
    } else if (import.meta.env.DEV && error?.message && !error.details) {
      responseBody.details = String(error.message);
    }

    return new Response(JSON.stringify(responseBody), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
