/**
 * BudgetBee Google Ad Manager Tag Verification System
 * Enhanced implementation based on Google Ads Manager professional recommendations
 * Prevents duplicate tag calls and ensures proper ad monetization
 */

class BudgetBeeAdManager {
  constructor() {
    this.initializedTags = new Set();
    this.tagStates = new Map();
    this.displayAttempts = new Map(); // Track display attempts per tag
    this.isInitialized = false;
    this.maxRetries = 3;
    this.retryDelay = 1000;
    this.duplicateCallAlerts = []; // Store duplicate call alerts
    this.performanceMetrics = new Map(); // Track performance metrics

    // Enhanced monitoring for GAM recommendations
    this.tagCallHistory = [];
    this.maxHistorySize = 100;
    this.alertThreshold = 2; // Alert after 2 duplicate calls

    // Bind methods to preserve context
    this.initializeGAM = this.initializeGAM.bind(this);
    this.defineAdSlot = this.defineAdSlot.bind(this);
    this.displayAd = this.displayAd.bind(this);
    this.trackTagCall = this.trackTagCall.bind(this);
    this.generateDuplicateReport = this.generateDuplicateReport.bind(this);

    // Initialize performance monitoring
    this.initializePerformanceMonitoring();
  }

  /**
   * Initialize performance monitoring for better insights
   */
  initializePerformanceMonitoring() {
    // Monitor page load performance
    if (typeof window !== "undefined" && window.performance) {
      this.pageLoadStart = window.performance.now();
    }

    // Set up interval reporting
    this.reportingInterval = setInterval(() => {
      this.generatePerformanceReport();
    }, 30000); // Report every 30 seconds
  }

  /**
   * Enhanced GAM initialization with comprehensive duplicate prevention
   */
  async initializeGAM() {
    const initStartTime = performance.now();

    if (this.isInitialized) {
      this.logDuplicateAttempt(
        "GAM_INIT",
        "Attempted to initialize GAM multiple times",
      );
      console.warn(
        "BudgetBee AdManager: GAM already initialized - preventing duplicate initialization",
      );
      return;
    }

    try {
      // Ensure googletag is available
      if (typeof window.googletag === "undefined") {
        window.googletag = { cmd: [] };
      }

      // Check for existing GAM initialization
      if (window.googletag.apiReady) {
        console.warn(
          "BudgetBee AdManager: GAM API already ready, skipping initialization",
        );
        this.isInitialized = true;
        return;
      }

      // Initialize GAM with error handling
      await this.loadGPTScript();

      window.googletag.cmd.push(() => {
        try {
          // Define BudgetBee ad slots with enhanced duplication checks
          this.defineAdSlot(
            "mob_1",
            "/YOUR_NETWORK_CODE/budgetbee_mob_1",
            [
              [300, 250],
              [250, 250],
              [336, 280],
            ],
            "div-gpt-ad-budgetbee-mob-1",
          );

          this.defineAdSlot(
            "mob_2",
            "/YOUR_NETWORK_CODE/budgetbee_mob_2",
            [
              [300, 250],
              [250, 250],
              [336, 280],
            ],
            "div-gpt-ad-budgetbee-mob-2",
          );

          this.defineAdSlot(
            "interstitial",
            "/YOUR_NETWORK_CODE/budgetbee_interstitial",
            ["fluid"],
            "div-gpt-ad-budgetbee-interstitial",
          );

          this.defineAdSlot(
            "offerwall",
            "/YOUR_NETWORK_CODE/budgetbee_offerwall",
            ["fluid"],
            "div-gpt-ad-budgetbee-offerwall",
          );

          // Enhanced GAM configuration
          window.googletag.pubads().enableSingleRequest();
          window.googletag.pubads().collapseEmptyDivs();
          window.googletag.pubads().setCentering(true);

          // Enhanced targeting for better ad relevance
          window.googletag.pubads().setTargeting("site", "budgetbee");
          window.googletag.pubads().setTargeting("content", "financial");
          window.googletag.pubads().setTargeting("vertical", "credit-cards");
          window.googletag
            .pubads()
            .setTargeting("page_type", this.getPageType());

          // Enable services
          window.googletag.enableServices();

          // Record successful initialization
          const initTime = performance.now() - initStartTime;
          this.performanceMetrics.set("gam_init_time", initTime);
          this.isInitialized = true;

          console.log(
            `BudgetBee AdManager: Successfully initialized in ${initTime.toFixed(2)}ms`,
          );
          this.trackTagCall("GAM_INIT", "success", { initTime });
        } catch (error) {
          console.error("BudgetBee AdManager: Initialization error:", error);
          this.handleInitError(error);
          this.trackTagCall("GAM_INIT", "error", { error: error.message });
        }
      });
    } catch (error) {
      console.error("BudgetBee AdManager: Failed to initialize GAM:", error);
      this.handleInitError(error);
      this.trackTagCall("GAM_INIT", "fatal_error", { error: error.message });
    }
  }

  /**
   * Enhanced ad slot definition with comprehensive duplicate prevention
   */
  defineAdSlot(tagId, adUnitPath, sizes, divId) {
    const defineStartTime = performance.now();

    if (this.initializedTags.has(tagId)) {
      this.logDuplicateAttempt(
        "DEFINE_SLOT",
        `Tag ${tagId} already defined, preventing duplicate slot definition`,
      );
      console.warn(
        `BudgetBee AdManager: Tag ${tagId} already defined, skipping duplicate`,
      );
      return null;
    }

    try {
      // Check if slot already exists in GAM
      const existingSlots = window.googletag.pubads().getSlots();
      const existingSlot = existingSlots.find(
        (slot) => slot.getSlotElementId() === divId,
      );

      if (existingSlot) {
        this.logDuplicateAttempt(
          "DEFINE_SLOT",
          `Slot with divId ${divId} already exists in GAM`,
        );
        console.warn(
          `BudgetBee AdManager: Slot ${divId} already exists, skipping duplicate definition`,
        );
        return existingSlot;
      }

      const slot = window.googletag.defineSlot(adUnitPath, sizes, divId);
      if (slot) {
        slot.addService(window.googletag.pubads());
        this.initializedTags.add(tagId);

        const defineTime = performance.now() - defineStartTime;
        this.performanceMetrics.set(`${tagId}_define_time`, defineTime);

        this.tagStates.set(tagId, {
          defined: true,
          displayed: false,
          adUnitPath,
          divId,
          timestamp: Date.now(),
          defineTime,
          slot: slot,
        });

        console.log(
          `BudgetBee AdManager: Defined ad slot ${tagId} in ${defineTime.toFixed(2)}ms`,
        );
        this.trackTagCall(tagId, "defined", { adUnitPath, divId, defineTime });
        return slot;
      }
    } catch (error) {
      console.error(
        `BudgetBee AdManager: Error defining slot ${tagId}:`,
        error,
      );
      this.tagStates.set(tagId, {
        defined: false,
        error: error.message,
        timestamp: Date.now(),
      });
      this.trackTagCall(tagId, "define_error", { error: error.message });
    }

    return null;
  }

  /**
   * Enhanced ad display with strict duplicate call prevention
   * This addresses the Google Ads Manager recommendation for mob_1 and mob_2 tags
   */
  displayAd(tagId, divId) {
    const displayStartTime = performance.now();
    const tagState = this.tagStates.get(tagId);

    // Enhanced validation and duplicate prevention
    if (!tagState || !tagState.defined) {
      console.warn(`BudgetBee AdManager: Tag ${tagId} not properly defined`);
      this.trackTagCall(tagId, "display_error", { reason: "not_defined" });
      return false;
    }

    // Critical duplicate prevention check
    if (tagState.displayed) {
      const attemptCount = this.incrementDisplayAttempt(tagId);
      this.logDuplicateAttempt(
        "DISPLAY_AD",
        `Tag ${tagId} already displayed, preventing duplicate call (attempt #${attemptCount})`,
      );

      console.warn(
        `BudgetBee AdManager: Tag ${tagId} already displayed, preventing duplicate call (attempt #${attemptCount})`,
      );
      this.trackTagCall(tagId, "duplicate_display_blocked", { attemptCount });

      // Alert if too many duplicate attempts
      if (attemptCount >= this.alertThreshold) {
        this.generateDuplicateAlert(tagId, attemptCount);
      }

      return false;
    }

    // Check if div element exists
    const adDiv = document.getElementById(divId);
    if (!adDiv) {
      console.warn(`BudgetBee AdManager: Ad container ${divId} not found`);
      this.trackTagCall(tagId, "display_error", { reason: "div_not_found" });
      return false;
    }

    // Check if div already has ad content
    if (adDiv.children.length > 0) {
      this.logDuplicateAttempt(
        "DISPLAY_AD",
        `Ad container ${divId} already contains content, potential duplicate display`,
      );
      console.warn(
        `BudgetBee AdManager: Ad container ${divId} already has content`,
      );
    }

    try {
      window.googletag.cmd.push(() => {
        const displayCallTime = performance.now();
        window.googletag.display(divId);

        const totalDisplayTime = performance.now() - displayStartTime;
        this.performanceMetrics.set(`${tagId}_display_time`, totalDisplayTime);

        // Update tag state to prevent duplicates
        this.tagStates.set(tagId, {
          ...tagState,
          displayed: true,
          displayTimestamp: Date.now(),
          displayTime: totalDisplayTime,
        });

        console.log(
          `BudgetBee AdManager: Successfully displayed ad ${tagId} in ${totalDisplayTime.toFixed(2)}ms`,
        );
        this.trackTagCall(tagId, "displayed", {
          displayTime: totalDisplayTime,
        });
      });

      return true;
    } catch (error) {
      console.error(
        `BudgetBee AdManager: Error displaying ad ${tagId}:`,
        error,
      );
      this.tagStates.set(tagId, {
        ...tagState,
        displayError: error.message,
      });
      this.trackTagCall(tagId, "display_error", { error: error.message });
      return false;
    }
  }

  /**
   * Track display attempts for duplicate detection
   */
  incrementDisplayAttempt(tagId) {
    const currentAttempts = this.displayAttempts.get(tagId) || 0;
    const newAttempts = currentAttempts + 1;
    this.displayAttempts.set(tagId, newAttempts);
    return newAttempts;
  }

  /**
   * Log duplicate attempts for monitoring and reporting
   */
  logDuplicateAttempt(type, message) {
    const duplicateLog = {
      type,
      message,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    this.duplicateCallAlerts.push(duplicateLog);

    // Keep only recent alerts
    if (this.duplicateCallAlerts.length > 50) {
      this.duplicateCallAlerts.splice(0, this.duplicateCallAlerts.length - 50);
    }

    // Store in sessionStorage for persistence
    sessionStorage.setItem(
      "budgetbee_duplicate_alerts",
      JSON.stringify(this.duplicateCallAlerts),
    );
  }

  /**
   * Generate alert for excessive duplicate attempts
   */
  generateDuplicateAlert(tagId, attemptCount) {
    const alert = {
      tagId,
      attemptCount,
      timestamp: Date.now(),
      severity: "HIGH",
      message: `Tag ${tagId} has ${attemptCount} duplicate display attempts`,
      recommendations: [
        "Review ad implementation code",
        "Check for multiple ad manager instances",
        "Verify GAM tag configuration",
      ],
    };

    console.error("BudgetBee AdManager: DUPLICATE ALERT:", alert);

    // Store critical alerts separately
    const criticalAlerts = JSON.parse(
      sessionStorage.getItem("budgetbee_critical_alerts") || "[]",
    );
    criticalAlerts.push(alert);
    sessionStorage.setItem(
      "budgetbee_critical_alerts",
      JSON.stringify(criticalAlerts),
    );
  }

  /**
   * Enhanced tag call tracking with detailed analytics
   */
  trackTagCall(tagId, action, metadata = {}) {
    const timestamp = Date.now();
    const callData = {
      tagId,
      action,
      timestamp,
      userAgent: navigator.userAgent,
      url: window.location.href,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      metadata,
    };

    // Add to history
    this.tagCallHistory.push(callData);

    // Maintain history size limit
    if (this.tagCallHistory.length > this.maxHistorySize) {
      this.tagCallHistory.splice(
        0,
        this.tagCallHistory.length - this.maxHistorySize,
      );
    }

    // Store in sessionStorage for debugging and reporting
    sessionStorage.setItem(
      "budgetbee_ad_calls",
      JSON.stringify(this.tagCallHistory),
    );
  }

  /**
   * Generate comprehensive duplicate call report
   */
  generateDuplicateReport() {
    const report = {
      timestamp: Date.now(),
      totalDuplicates: this.duplicateCallAlerts.length,
      duplicatesByType: {},
      tagAnalysis: {},
      recommendations: [],
    };

    // Analyze duplicates by type
    this.duplicateCallAlerts.forEach((alert) => {
      if (!report.duplicatesByType[alert.type]) {
        report.duplicatesByType[alert.type] = 0;
      }
      report.duplicatesByType[alert.type]++;
    });

    // Analyze each tag
    this.tagStates.forEach((state, tagId) => {
      const attempts = this.displayAttempts.get(tagId) || 0;
      report.tagAnalysis[tagId] = {
        defined: state.defined,
        displayed: state.displayed,
        displayAttempts: attempts,
        hasErrors: !!state.error || !!state.displayError,
        performance: {
          defineTime: this.performanceMetrics.get(`${tagId}_define_time`),
          displayTime: this.performanceMetrics.get(`${tagId}_display_time`),
        },
      };

      // Generate recommendations
      if (attempts > 1) {
        report.recommendations.push(
          `Review implementation for tag ${tagId} - ${attempts} display attempts detected`,
        );
      }
      if (state.error) {
        report.recommendations.push(
          `Fix definition error for tag ${tagId}: ${state.error}`,
        );
      }
      if (state.displayError) {
        report.recommendations.push(
          `Fix display error for tag ${tagId}: ${state.displayError}`,
        );
      }
    });

    // Store comprehensive report
    sessionStorage.setItem(
      "budgetbee_duplicate_report",
      JSON.stringify(report),
    );

    console.log("BudgetBee AdManager: Duplicate Report Generated", report);
    return report;
  }

  /**
   * Generate performance report for optimization insights
   */
  generatePerformanceReport() {
    const report = {
      timestamp: Date.now(),
      metrics: Object.fromEntries(this.performanceMetrics),
      tagStates: Object.fromEntries(this.tagStates),
      callHistory: this.tagCallHistory.slice(-20), // Last 20 calls
      duplicateAlerts: this.duplicateCallAlerts.slice(-10), // Last 10 alerts
      systemInfo: {
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
        connection: navigator.connection
          ? {
              effectiveType: navigator.connection.effectiveType,
              downlink: navigator.connection.downlink,
            }
          : null,
      },
    };

    sessionStorage.setItem(
      "budgetbee_performance_report",
      JSON.stringify(report),
    );
    return report;
  }

  /**
   * Get page type for enhanced targeting
   */
  getPageType() {
    const path = window.location.pathname;
    if (path.includes("credit-card-recommender")) return "quiz";
    if (path.includes("financial-solutions")) return "product";
    if (path.includes("blog")) return "content";
    if (path.includes("personal-finance")) return "education";
    if (path === "/") return "homepage";
    return "other";
  }

  /**
   * Enhanced GPT script loading with retry and verification
   */
  async loadGPTScript() {
    return new Promise((resolve, reject) => {
      // Check if script already loaded
      const existingScript = document.querySelector(
        'script[src*="securepubads.g.doubleclick.net"]',
      );
      if (existingScript) {
        console.log("BudgetBee AdManager: GPT script already present");
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.async = true;
      script.src = "https://securepubads.g.doubleclick.net/tag/js/gpt.js";
      script.crossOrigin = "anonymous";

      const loadStartTime = performance.now();

      script.onload = () => {
        const loadTime = performance.now() - loadStartTime;
        this.performanceMetrics.set("gpt_script_load_time", loadTime);
        console.log(
          `BudgetBee AdManager: GPT script loaded successfully in ${loadTime.toFixed(2)}ms`,
        );
        this.trackTagCall("GPT_SCRIPT", "loaded", { loadTime });
        resolve();
      };

      script.onerror = () => {
        const error = new Error("Failed to load GPT script");
        console.error("BudgetBee AdManager: GPT script load error");
        this.trackTagCall("GPT_SCRIPT", "load_error");
        reject(error);
      };

      document.head.appendChild(script);
    });
  }

  /**
   * Enhanced error handling with detailed reporting
   */
  async handleInitError(error) {
    console.error("BudgetBee AdManager: Handling init error:", error);

    this.trackTagCall("ERROR_HANDLER", "init_error", {
      error: error.message,
      stack: error.stack,
      retriesLeft: this.maxRetries,
    });

    // Implement retry logic for transient errors
    if (this.maxRetries > 0) {
      this.maxRetries--;
      console.log(
        `BudgetBee AdManager: Retrying initialization (${this.maxRetries} attempts left)`,
      );

      setTimeout(() => {
        this.initializeGAM();
      }, this.retryDelay);
    } else {
      // Final failure - generate comprehensive error report
      const errorReport = {
        timestamp: Date.now(),
        finalError: error.message,
        callHistory: this.tagCallHistory,
        duplicateAlerts: this.duplicateCallAlerts,
        performanceMetrics: Object.fromEntries(this.performanceMetrics),
      };

      sessionStorage.setItem(
        "budgetbee_error_report",
        JSON.stringify(errorReport),
      );
      console.error(
        "BudgetBee AdManager: Final initialization failure",
        errorReport,
      );
    }
  }

  /**
   * Enhanced diagnostic information with actionable insights
   */
  getDiagnostics() {
    return {
      isInitialized: this.isInitialized,
      initializedTags: Array.from(this.initializedTags),
      tagStates: Object.fromEntries(this.tagStates),
      displayAttempts: Object.fromEntries(this.displayAttempts),
      duplicateAlerts: this.duplicateCallAlerts,
      performanceMetrics: Object.fromEntries(this.performanceMetrics),
      callHistory: this.tagCallHistory,
      systemInfo: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: Date.now(),
      },
      reports: {
        duplicateReport: this.generateDuplicateReport(),
        performanceReport: this.generatePerformanceReport(),
      },
    };
  }

  /**
   * Enhanced reset functionality with cleanup
   */
  reset() {
    // Clear intervals
    if (this.reportingInterval) {
      clearInterval(this.reportingInterval);
    }

    // Reset all state
    this.initializedTags.clear();
    this.tagStates.clear();
    this.displayAttempts.clear();
    this.duplicateCallAlerts = [];
    this.tagCallHistory = [];
    this.performanceMetrics.clear();
    this.isInitialized = false;
    this.maxRetries = 3;

    // Clear stored data
    sessionStorage.removeItem("budgetbee_ad_calls");
    sessionStorage.removeItem("budgetbee_duplicate_alerts");
    sessionStorage.removeItem("budgetbee_critical_alerts");
    sessionStorage.removeItem("budgetbee_duplicate_report");
    sessionStorage.removeItem("budgetbee_performance_report");
    sessionStorage.removeItem("budgetbee_error_report");

    console.log("BudgetBee AdManager: Complete reset performed");

    // Reinitialize monitoring
    this.initializePerformanceMonitoring();
  }

  /**
   * Public method to check for duplicate issues
   */
  checkForDuplicates() {
    const issues = [];

    this.displayAttempts.forEach((attempts, tagId) => {
      if (attempts > 1) {
        issues.push({
          tagId,
          attempts,
          severity: attempts > 3 ? "HIGH" : "MEDIUM",
        });
      }
    });

    return {
      hasIssues: issues.length > 0,
      issues,
      totalDuplicateAlerts: this.duplicateCallAlerts.length,
    };
  }
}

// Create global instance with enhanced monitoring
window.BudgetBeeAdManager = new BudgetBeeAdManager();

// Auto-initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    window.BudgetBeeAdManager.initializeGAM();
  });
} else {
  window.BudgetBeeAdManager.initializeGAM();
}

// Enhanced diagnostic functions for debugging and monitoring
window.getAdDiagnostics = () => window.BudgetBeeAdManager.getDiagnostics();
window.resetAdManager = () => window.BudgetBeeAdManager.reset();
window.checkAdDuplicates = () => window.BudgetBeeAdManager.checkForDuplicates();
window.generateDuplicateReport = () =>
  window.BudgetBeeAdManager.generateDuplicateReport();
window.generatePerformanceReport = () =>
  window.BudgetBeeAdManager.generatePerformanceReport();

// Console commands for easy debugging
console.log(`
🟡 BudgetBee Ad Manager Debug Commands:
   getAdDiagnostics() - Get complete diagnostics
   checkAdDuplicates() - Check for duplicate tag issues
   generateDuplicateReport() - Generate duplicate call report
   generatePerformanceReport() - Generate performance metrics
   resetAdManager() - Reset ad manager state
`);

export default BudgetBeeAdManager;
