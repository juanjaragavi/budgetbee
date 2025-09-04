import React from "react";

/**
 * MDX-safe Ad container specifically for the "below-title" slot.
 * Defaults to id="us_budgetbeepro_3" and applies neutral, non-decorative
 * classes to avoid unintended styling conflicts in blog content.
 *
 * Usage in MDX:
 *   <AdZoneTop3 />                // renders with default id="us_budgetbeepro_3"
 *   <AdZoneTop3 id="custom_id" /> // optional override
 *
 * Notes:
 * - Uses "ad-reset ad-zone-top" utility classes so ads occupy space naturally
 *   without extra borders/backgrounds and align with our ad-aware design system.
 * - This mirrors the successful pattern used for unit 4, adapted for unit 3.
 */
type Props = {
  id?: string;
  className?: string;
  style?: React.CSSProperties;
};

const AdZoneTop3: React.FC<Props> = ({
  id = "us_budgetbeepro_3",
  className = "",
  style,
}) => {
  return (
    <div
      id={id}
      className={`min-w-auto flex justify-center items-center ${className}`.trim()}
      style={style}
    />
  );
};

export default AdZoneTop3;
