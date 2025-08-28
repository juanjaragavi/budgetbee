{
  /* // src/components/analytics/AnalyticsWrapper.tsx */
}
import React from "react";
import UtmPersister from "./UtmPersister";
import UtmMonitor from "./UtmMonitor";
import AdZepActivator from "./AdZepActivator";
import AdZepDebugger from "./AdZepDebugger";

export default function AnalyticsWrapper() {
  // In Astro, import.meta.env.DEV is available in .astro files and server-side .ts files.
  // For client-side .tsx components, this value needs to be passed down or checked differently
  // if the component isn't processed by Astro's Vite build in a way that makes import.meta.env available.
  // However, for a React component rendered by Astro with a client directive,
  // Astro typically makes these env vars available.
  // If not, a common pattern is to pass it as a prop from the .astro file.
  // Let's assume import.meta.env.DEV works here as Astro processes TSX for client islands.
  const isDevelopment = import.meta.env.DEV;

  return (
    <>
      <UtmPersister />
      <AdZepActivator />
      {isDevelopment && <UtmMonitor />}
      {isDevelopment && <AdZepDebugger />}
    </>
  );
}
