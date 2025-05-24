import type { APIRoute } from "astro";
import nodemailer from "nodemailer";

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { name, email, subject, message } = data;

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
    const senderEmail = import.meta.env.SENDER_EMAIL || "noreply@budgetbee.co";
    const recipientEmail =
      import.meta.env.RECIPIENT_EMAIL || "info@budgetbee.co";

    if (!apiKey) {
      console.error("Missing SendGrid API key");
      return new Response(
        JSON.stringify({ message: "Server configuration error" }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    // Configure nodemailer with SendGrid
    const transporter = nodemailer.createTransport({
      host: "smtp.sendgrid.net",
      port: 587,
      secure: false,
      auth: {
        user: "apikey",
        pass: apiKey,
      },
    });

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

    const mailOptions = {
      from: `"BudgetBee Contact" <${senderEmail}>`,
      to: recipientEmail,
      replyTo: email,
      subject: `Contact Form: ${subject}`,
      text: `
        You received a new message from your contact form:

        Name: ${name}
        Email: ${email}
        Subject: ${subject}

        Message:
        ${message}
      `,
      html: htmlMessage,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return new Response(
      JSON.stringify({ message: "Message sent successfully!" }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Error processing contact form:", error);
    return new Response(JSON.stringify({ message: "Failed to send message" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
