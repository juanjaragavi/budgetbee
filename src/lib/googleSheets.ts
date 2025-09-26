import { google } from "googleapis";
import path from "path";

interface QuizSubmission {
  // Core form data
  name: string;
  email: string;
  preference?: string;
  income?: string;
  acceptedTerms?: boolean;

  // SendGrid-specific fields
  first_name: string;
  last_name?: string;
  country: string;
  external_id: string;
  brand: string;

  // UTM and tracking data
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  referrer?: string;
  userAgent?: string;
  pageUrl?: string;

  // System fields
  timestamp: string;
  submissionId: string;
}

export class GoogleSheetsService {
  private sheets;
  private auth;

  constructor() {
    try {
      // Use the service account JSON file for authentication
      const keyFilePath = path.resolve(
        process.cwd(),
        "src",
        "lib",
        "absolute-brook-452020-d5-bfba282d0f42.json",
      );

      // Initialize Google Auth with service account file
      this.auth = new google.auth.GoogleAuth({
        keyFile: keyFilePath,
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      });

      // Initialize Sheets API
      this.sheets = google.sheets({ version: "v4", auth: this.auth });

      console.log(
        "✅ Google Sheets service initialized with service account file",
      );
    } catch (error) {
      console.error("❌ Failed to initialize Google Sheets service:", error);
      throw error;
    }
  }

  /**
   * Find the row number for a given email address
   */
  async findEmailRowNumber(email: string): Promise<number | null> {
    try {
      const sheetId =
        import.meta.env.GOOGLE_SHEET_ID ||
        "1VPUVv5eSeGxlcuKj3VoVSqwwHjFBjWxZLlbKQtVEhbQ";
      const sheetName = import.meta.env.GOOGLE_SHEET_NAME || "registros";

      // Read all email addresses (column B)
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: `${sheetName}!B:B`,
      });

      if (response.data.values) {
        const normalizedEmail = email.toLowerCase().trim();

        // Find the row (accounting for 1-based indexing and header row)
        for (let i = 1; i < response.data.values.length; i++) {
          const cellEmail = response.data.values[i][0]
            ?.toString()
            .toLowerCase()
            .trim();
          if (cellEmail === normalizedEmail) {
            return i + 1; // Return 1-based row number
          }
        }
      }

      return null;
    } catch (error) {
      console.error("Google Sheets: Error finding email row:", error);
      return null;
    }
  }

  /**
   * Update an existing submission in the Google Sheet
   */
  async updateExistingSubmission(submission: QuizSubmission): Promise<boolean> {
    try {
      const sheetId =
        import.meta.env.GOOGLE_SHEET_ID ||
        "1VPUVv5eSeGxlcuKj3VoVSqwwHjFBjWxZLlbKQtVEhbQ";
      const sheetName = import.meta.env.GOOGLE_SHEET_NAME || "registros";

      const rowNumber = await this.findEmailRowNumber(submission.email);

      if (!rowNumber) {
        console.log(
          "Google Sheets: Email not found for update, proceeding with new entry",
        );
        return false;
      }

      console.log(
        `Google Sheets: Updating existing entry at row ${rowNumber} for email: ${submission.email}`,
      );

      // Prepare updated row data
      const rowData = [
        submission.name, // A: Name
        submission.email, // B: Email
        submission.first_name, // C: First Name
        submission.last_name || "", // D: Last Name
        submission.preference || "", // E: Preference
        submission.income || "", // F: Income
        submission.acceptedTerms || false, // G: Accepted Terms
        submission.country, // H: Country
        submission.external_id, // I: External ID
        submission.brand, // J: Brand
        submission.utm_source || "", // K: UTM Source
        submission.utm_medium || "", // L: UTM Medium
        submission.utm_campaign || "", // M: UTM Campaign
        submission.utm_content || "", // N: UTM Content
        submission.utm_term || "", // O: UTM Term
        submission.referrer || "", // P: Referrer
        submission.userAgent || "", // Q: User Agent
        submission.pageUrl || "", // R: Page URL
        submission.timestamp, // S: Timestamp (update with new timestamp)
        submission.submissionId, // T: Submission ID (new ID for this update)
      ];

      // Update the specific row
      const result = await this.sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `${sheetName}!A${rowNumber}:T${rowNumber}`,
        valueInputOption: "RAW",
        requestBody: {
          values: [rowData],
        },
      });

      console.log(
        `Google Sheets: Successfully updated row ${rowNumber} for ${submission.email}`,
      );
      console.log(`Google Sheets: Updated range: ${result.data.updatedRange}`);

      return true;
    } catch (error) {
      console.error(
        "Google Sheets: Error updating existing submission:",
        error,
      );
      return false;
    }
  }

  /**
   * Check if an email already exists in the Google Sheet
   */
  async checkEmailExists(email: string): Promise<boolean> {
    try {
      const sheetId =
        import.meta.env.GOOGLE_SHEET_ID ||
        "1VPUVv5eSeGxlcuKj3VoVSqwwHjFBjWxZLlbKQtVEhbQ";
      const sheetName = import.meta.env.GOOGLE_SHEET_NAME || "registros";

      // Read all email addresses (column B)
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: `${sheetName}!B:B`,
      });

      if (response.data.values) {
        // Convert email to lowercase for comparison (skip header row)
        const existingEmails = response.data.values
          .slice(1) // Skip header row
          .map((row) => row[0]?.toString().toLowerCase().trim())
          .filter((email) => email); // Remove empty values

        const normalizedEmail = email.toLowerCase().trim();
        const exists = existingEmails.includes(normalizedEmail);

        if (exists) {
          console.log(
            `Google Sheets: Email ${email} already exists, skipping duplicate`,
          );
        }

        return exists;
      }

      return false;
    } catch (error) {
      console.error(
        "Google Sheets: Error checking for duplicate email:",
        error,
      );
      // If we can't check for duplicates, proceed with caution but don't fail
      return false;
    }
  }

  /**
   * Append a new submission to the Google Sheet (with duplicate prevention)
   */
  async appendSubmission(submission: QuizSubmission): Promise<boolean> {
    try {
      // Use environment variables with fallback for testing
      const sheetId =
        import.meta.env.GOOGLE_SHEET_ID ||
        "1VPUVv5eSeGxlcuKj3VoVSqwwHjFBjWxZLlbKQtVEhbQ";
      const sheetName = import.meta.env.GOOGLE_SHEET_NAME || "registros";

      console.log("Google Sheets: Using sheet ID:", sheetId);
      console.log("Google Sheets: Using sheet name:", sheetName);

      if (!sheetId) {
        console.error("Google Sheets: GOOGLE_SHEET_ID not configured");
        return false;
      }

      // Check for duplicate email before adding
      console.log(
        `Google Sheets: Checking for duplicate email: ${submission.email}`,
      );
      const emailExists = await this.checkEmailExists(submission.email);

      if (emailExists) {
        console.log(
          `Google Sheets: Skipping duplicate entry for email: ${submission.email}`,
        );
        // Optionally update existing entry instead of creating duplicate
        return await this.updateExistingSubmission(submission);
      }

      // Prepare row data matching the enhanced schema (A-T columns)
      const rowData = [
        submission.name, // A: Name
        submission.email, // B: Email
        submission.first_name, // C: First Name
        submission.last_name || "", // D: Last Name
        submission.preference || "", // E: Preference
        submission.income || "", // F: Income
        submission.acceptedTerms || false, // G: Accepted Terms
        submission.country, // H: Country
        submission.external_id, // I: External ID
        submission.brand, // J: Brand
        submission.utm_source || "", // K: UTM Source
        submission.utm_medium || "", // L: UTM Medium
        submission.utm_campaign || "", // M: UTM Campaign
        submission.utm_content || "", // N: UTM Content
        submission.utm_term || "", // O: UTM Term
        submission.referrer || "", // P: Referrer
        submission.userAgent || "", // Q: User Agent
        submission.pageUrl || "", // R: Page URL
        submission.timestamp, // S: Timestamp
        submission.submissionId, // T: Submission ID
      ];

      // Append the row to the sheet
      const result = await this.sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: `${sheetName}!A:T`,
        valueInputOption: "RAW",
        insertDataOption: "INSERT_ROWS",
        requestBody: {
          values: [rowData],
        },
      });

      console.log(
        `Google Sheets: Successfully appended submission ${submission.submissionId}`,
      );
      console.log(
        `Google Sheets: Updated range: ${result.data.updates?.updatedRange}`,
      );

      return true;
    } catch (error) {
      console.error("Google Sheets API Error:", error);

      // Log specific error details for debugging
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        if ("code" in error) {
          console.error("Error code:", error.code);
        }
      }

      return false;
    }
  }

  /**
   * Initialize the sheet with proper headers if they don't exist
   */
  async initializeSheet(): Promise<boolean> {
    try {
      // Use environment variables with fallback for testing
      const sheetId =
        import.meta.env.GOOGLE_SHEET_ID ||
        "1VPUVv5eSeGxlcuKj3VoVSqwwHjFBjWxZLlbKQtVEhbQ";
      const sheetName = import.meta.env.GOOGLE_SHEET_NAME || "registros";

      if (!sheetId) {
        console.error("Google Sheets: GOOGLE_SHEET_ID not configured");
        return false;
      }

      // Check if headers already exist
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: `${sheetName}!A1:T1`,
      });

      // If no headers exist, create them
      if (!response.data.values || response.data.values.length === 0) {
        console.log("Google Sheets: No headers found, creating them...");

        const headers = [
          "Name", // A
          "Email", // B
          "First Name", // C
          "Last Name", // D
          "Preference", // E
          "Income", // F
          "Accepted Terms", // G
          "Country", // H
          "External ID", // I
          "Brand", // J
          "UTM Source", // K
          "UTM Medium", // L
          "UTM Campaign", // M
          "UTM Content", // N
          "UTM Term", // O
          "Referrer", // P
          "User Agent", // Q
          "Page URL", // R
          "Timestamp", // S
          "Submission ID", // T
        ];

        await this.sheets.spreadsheets.values.update({
          spreadsheetId: sheetId,
          range: `${sheetName}!A1:T1`,
          valueInputOption: "RAW",
          requestBody: {
            values: [headers],
          },
        });

        console.log("Google Sheets: Headers created successfully");
      } else {
        console.log("Google Sheets: Headers already exist");
      }

      return true;
    } catch (error) {
      console.error("Google Sheets: Sheet initialization error:", error);

      if (error instanceof Error) {
        console.error("Initialization error message:", error.message);
      }

      return false;
    }
  }

  /**
   * Test the connection to Google Sheets
   */
  async testConnection(): Promise<boolean> {
    try {
      // Use environment variables with fallback for testing
      const sheetId =
        import.meta.env.GOOGLE_SHEET_ID ||
        "1VPUVv5eSeGxlcuKj3VoVSqwwHjFBjWxZLlbKQtVEhbQ";
      const sheetName = import.meta.env.GOOGLE_SHEET_NAME || "registros";

      if (!sheetId) {
        console.error("Google Sheets: GOOGLE_SHEET_ID not configured");
        return false;
      }

      // Try to read a small range to test access
      await this.sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: `${sheetName}!A1:A1`,
      });

      console.log("Google Sheets: Connection test successful");
      return true;
    } catch (error) {
      console.error("Google Sheets: Connection test failed:", error);
      return false;
    }
  }
}

// Export singleton instance
export const googleSheetsService = new GoogleSheetsService();
