import React from "react";

type Props = {
  id?: string;
  className?: string;
  style?: React.CSSProperties;
};

/**
 * MDX-safe Ad container that renders a plain div the ad stack can target.
 * Usage in MDX:
 *   <AdZone id="us_budgetbeepro_4" />
 *
 * Notes:
 * - We use a default id of "us_budgetbeepro_4" so the ad script can pick it up,
 *   but you can override via props.id if needed.
 * - Adds a base "ad-zone" class plus any provided className.
 * - No client directives are needed; this is static markup for ad scripts.
 */
const AdZone: React.FC<Props> = ({
  id = "us_budgetbeepro_4",
  className = "",
  style,
}) => {
  return (
    <div
      id={id}
      className={`ad-zone min-size-auto flex justify-center items-center ${className}`.trim()}
      style={style}
    />
  );
};

export default AdZone;
