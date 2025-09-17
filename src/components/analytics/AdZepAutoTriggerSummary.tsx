/**
 * Blog Post AdZep Auto-Trigger Summary Component
 *
 * This React component provides a summary of the auto-trigger system status
 * and can be used for debugging or monitoring purposes.
 */

import React, { useEffect, useState } from "react";
import { useBlogPostAdZepAutoTrigger } from "../../hooks/useBlogPostAdZepAutoTrigger";

interface AdZepAutoTriggerSummaryProps {
  /** Whether to show the summary in development mode only (default: true) */
  devOnly?: boolean;
  /** Custom CSS classes for styling */
  className?: string;
}

export const AdZepAutoTriggerSummary: React.FC<
  AdZepAutoTriggerSummaryProps
> = ({ devOnly = true, className = "" }) => {
  const { isEligibleBlogPost, hasAutoTriggered } =
    useBlogPostAdZepAutoTrigger(false); // Don't auto-trigger from this component
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (devOnly) {
      setIsVisible(process.env.NODE_ENV === "development");
    } else {
      setIsVisible(true);
    }
  }, [devOnly]);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={`adzep-auto-trigger-summary ${className}`}
      style={{
        position: "fixed",
        bottom: "10px",
        left: "10px",
        background: "rgba(0, 0, 0, 0.8)",
        color: "white",
        padding: "8px 12px",
        borderRadius: "4px",
        fontSize: "12px",
        fontFamily: "monospace",
        zIndex: 9998,
        maxWidth: "250px",
      }}
    >
      <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
        🔄 AdZep Auto-Trigger
      </div>
      <div>Eligible: {isEligibleBlogPost ? "✅" : "❌"}</div>
      <div>Auto-Triggered: {hasAutoTriggered ? "✅" : "⏳"}</div>
      <div style={{ fontSize: "10px", opacity: 0.7, marginTop: "4px" }}>
        {isEligibleBlogPost
          ? "System active with 100ms + 1s + 2s reloaders"
          : "Not a blog post with ad units"}
      </div>
    </div>
  );
};

export default AdZepAutoTriggerSummary;
