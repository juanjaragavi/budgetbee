import type { APIRoute } from "astro";
import { googleSheetsService } from "../../lib/googleSheets";

export const prerender = false;

export const POST: APIRoute = async () => {
  try {
    console.log("Testing Google Sheets connection...");

    // Test basic connection
    const connectionTest = await googleSheetsService.testConnection();

    if (!connectionTest) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Google Sheets connection failed",
          details: "Check API credentials and sheet permissions",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Test sheet initialization
    const initTest = await googleSheetsService.initializeSheet();

    if (!initTest) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Google Sheets initialization failed",
          details: "Could not access or initialize sheet headers",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Google Sheets connection successful",
        sheetId: import.meta.env.GOOGLE_SHEET_ID,
        sheetName: import.meta.env.GOOGLE_SHEET_NAME || "Sheet1",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Google Sheets connection test error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        message: "Google Sheets test failed with error",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
