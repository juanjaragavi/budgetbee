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

export type UpsertAction = "inserted" | "updated";

export interface UpsertResult {
  success: boolean;
  action?: UpsertAction;
  rowNumber?: number;
}

export class GoogleSheetsService {
  private sheets;
  private auth;
  private readonly fallbackSheetId =
    "1VPUVv5eSeGxlcuKj3VoVSqwwHjFBjWxZLlbKQtVEhbQ";
  private readonly fallbackSheetName = "registros";

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

  private getSheetConfig() {
    const sheetId = import.meta.env.GOOGLE_SHEET_ID || this.fallbackSheetId;
    const sheetName =
      import.meta.env.GOOGLE_SHEET_NAME || this.fallbackSheetName;

    if (!sheetId) {
      throw new Error("Google Sheets: GOOGLE_SHEET_ID not configured");
    }

    return { sheetId, sheetName };
  }

  private normalizeEmail(email: string) {
    return email.toLowerCase().trim();
  }

  private buildRowData(submission: QuizSubmission) {
    return [
      submission.name,
      submission.email,
      submission.first_name,
      submission.last_name || "",
      submission.preference || "",
      submission.income || "",
      submission.acceptedTerms || false,
      submission.country,
      submission.external_id,
      submission.brand,
      submission.utm_source || "",
      submission.utm_medium || "",
      submission.utm_campaign || "",
      submission.utm_content || "",
      submission.utm_term || "",
      submission.referrer || "",
      submission.userAgent || "",
      submission.pageUrl || "",
      submission.timestamp,
      submission.submissionId,
    ];
  }

  private extractRowNumberFromRange(range?: string | null) {
    if (!range) return undefined;

    const match = range.match(/![A-Z]+(\d+)/i);
    if (!match) return undefined;

    const parsed = Number(match[1]);
    return Number.isNaN(parsed) ? undefined : parsed;
  }

  /**
   * Find the row number for a given email address
   */
  async findEmailRowNumber(email: string): Promise<number | null> {
    try {
      const { sheetId, sheetName } = this.getSheetConfig();

      // Read all email addresses (column B)
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: `${sheetName}!B:B`,
      });

      if (response.data.values) {
        const normalizedEmail = this.normalizeEmail(email);

        // Find the row (accounting for 1-based indexing and header row)
        for (let i = 1; i < response.data.values.length; i++) {
          const cellValue = response.data.values[i]?.[0];
          if (!cellValue) continue;

          const cellEmail = this.normalizeEmail(cellValue.toString());
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
  async updateExistingSubmission(
    submission: QuizSubmission,
    rowNumber?: number,
  ): Promise<boolean> {
    try {
      const { sheetId, sheetName } = this.getSheetConfig();
      const normalizedSubmission: QuizSubmission = {
        ...submission,
        email: this.normalizeEmail(submission.email),
      };
      const resolvedRowNumber =
        rowNumber ?? (await this.findEmailRowNumber(submission.email));

      if (!resolvedRowNumber) {
        console.log(
          "Google Sheets: Email not found for update, proceeding with new entry",
        );
        return false;
      }

      console.log(
        `Google Sheets: Updating existing entry at row ${resolvedRowNumber} for email: ${normalizedSubmission.email}`,
      );

      // Prepare updated row data
      const rowData = this.buildRowData(normalizedSubmission);

      // Update the specific row
      const result = await this.sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `${sheetName}!A${resolvedRowNumber}:T${resolvedRowNumber}`,
        valueInputOption: "RAW",
        requestBody: {
          values: [rowData],
        },
      });

      console.log(
        `Google Sheets: Successfully updated row ${resolvedRowNumber} for ${submission.email}`,
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
      const rowNumber = await this.findEmailRowNumber(email);

      if (rowNumber) {
        console.log(
          `Google Sheets: Email ${email} already exists at row ${rowNumber}`,
        );
        return true;
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

  async upsertSubmission(submission: QuizSubmission): Promise<UpsertResult> {
    try {
      const { sheetId, sheetName } = this.getSheetConfig();
      const normalizedEmail = this.normalizeEmail(submission.email);
      const normalizedSubmission: QuizSubmission = {
        ...submission,
        email: normalizedEmail,
      };

      const existingRowNumber = await this.findEmailRowNumber(normalizedEmail);

      if (existingRowNumber) {
        const updated = await this.updateExistingSubmission(
          normalizedSubmission,
          existingRowNumber,
        );

        if (!updated) {
          return { success: false };
        }

        return {
          success: true,
          action: "updated",
          rowNumber: existingRowNumber,
        };
      }

      const rowData = this.buildRowData(normalizedSubmission);
      const appendResult = await this.sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: `${sheetName}!A:T`,
        valueInputOption: "RAW",
        insertDataOption: "INSERT_ROWS",
        requestBody: {
          values: [rowData],
        },
      });

      const appendedRowNumber = this.extractRowNumberFromRange(
        appendResult.data.updates?.updatedRange,
      );

      console.log(
        `Google Sheets: Inserted new entry for ${normalizedEmail} at row ${appendedRowNumber ?? "unknown"}`,
      );

      return {
        success: true,
        action: "inserted",
        rowNumber: appendedRowNumber,
      };
    } catch (error) {
      console.error("Google Sheets: Upsert error:", error);
      return { success: false };
    }
  }

  /**
   * Append a new submission to the Google Sheet (with duplicate prevention)
   */
  async appendSubmission(submission: QuizSubmission): Promise<boolean> {
    const result = await this.upsertSubmission(submission);

    if (!result.success) {
      return false;
    }

    console.log(
      `Google Sheets: Upsert completed with action ${result.action ?? "unknown"}`,
    );

    return true;
  }

  /**
   * Initialize the sheet with proper headers if they don't exist
   */
  async initializeSheet(): Promise<boolean> {
    try {
      const { sheetId, sheetName } = this.getSheetConfig();

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
      const { sheetId, sheetName } = this.getSheetConfig();

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
