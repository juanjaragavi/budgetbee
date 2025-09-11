import type { APIRoute } from "astro";
export const prerender = false;
import sgMail from "@sendgrid/mail";
import nodemailer from "nodemailer";

export const POST: APIRoute = async ({ request }) => {
  try {
    // Safely parse JSON body
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

    // Basic validation
    if (!name || !email || !subject || !message) {
      return new Response(
        JSON.stringify({ message: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ message: "Invalid email format" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get environment variables
    const apiKey = import.meta.env.SENDGRID_API_KEY;
    const senderEmail = import.meta.env.SENDER_EMAIL || "info@budgetbeepro.com";
    const recipientEmail =
      import.meta.env.RECIPIENT_EMAIL || "juan.jaramillo@topnetworks.co";

    if (!apiKey) {
      console.error("Missing SendGrid API key");
      return new Response(
        JSON.stringify({ message: "Server configuration error" }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    // Configure SendGrid SDK
    sgMail.setApiKey(apiKey);
    if (import.meta.env.SENDGRID_REGION === "eu") {
      // Optional: enable EU data residency if using an EU regional subuser
      // @ts-expect-error: setDataResidency exists at runtime for supported versions
      sgMail.setDataResidency("eu");
    }

    // Email HTML template
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

    const useSandbox =
      import.meta.env.DEV || import.meta.env.SENDGRID_SANDBOX === "true";

    const msg: any = {
      to: recipientEmail,
      from: {
        email: senderEmail,
        name: "BudgetBee Contact",
      },
      replyTo: { email },
      subject: `Contact Form: ${subject}`,
      text: `You received a new message from your contact form:\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`,
      html: htmlMessage,
      ...(useSandbox
        ? { mailSettings: { sandboxMode: { enable: true } } }
        : {}),
    };

    // Send email via SendGrid; if quota exceeded and SMTP fallback is configured, try SMTP
    try {
      await sgMail.send(msg);
    } catch (err: any) {
      const sgBody = err?.response?.body;
      const firstErrMsg: string | undefined = sgBody?.errors?.[0]?.message;
      const quotaExceeded =
        typeof firstErrMsg === "string" &&
        firstErrMsg.toLowerCase().includes("maximum credits exceeded");

      const smtpHost = import.meta.env.SMTP_HOST;
      if (quotaExceeded && smtpHost) {
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

        await transporter.sendMail({
          from: `"BudgetBee Contact" <${msg.from.email}>`,
          to: msg.to,
          replyTo: email,
          subject: msg.subject,
          text: msg.text,
          html: msg.html,
        });
      } else {
        throw err;
      }
    }

    return new Response(
      JSON.stringify({ message: "Message sent successfully!" }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error: any) {
    // Log extended SendGrid error body when available
    const sgBody = error?.response?.body;
    if (sgBody) {
      console.error("SendGrid error:", sgBody);
    } else {
      console.error("Error processing contact form:", error);
    }
    // Map common SendGrid errors to clearer messages
    let message = "Failed to send message";
    const firstErrMsg: string | undefined = sgBody?.errors?.[0]?.message;
    if (firstErrMsg?.toLowerCase().includes("maximum credits exceeded")) {
      message = "Email provider quota exceeded. Please try again later.";
    } else if (
      firstErrMsg?.toLowerCase().includes("verified sender") ||
      firstErrMsg?.toLowerCase().includes("sender identity")
    ) {
      message = "Sender email is not verified with SendGrid.";
    }

    const devDetails =
      import.meta.env.DEV && (sgBody || error?.message)
        ? { details: sgBody || String(error?.message || "") }
        : undefined;
    const body = { message, ...(devDetails || {}) };
    return new Response(JSON.stringify(body), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
