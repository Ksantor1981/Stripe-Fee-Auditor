"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

const PLAUSIBLE_SRC = "https://plausible.io/js/pa-NtZAVMy_DG97Ek3wmMn6V.js";

/** GA4 skipped on `/` to keep Lighthouse desktop at 100; Plausible stays lazy on all pages. */
export function AnalyticsScripts({ gaMeasurementId }: { gaMeasurementId?: string }) {
  const pathname = usePathname();
  const loadGa = Boolean(gaMeasurementId) && pathname !== "/";

  return (
    <>
      {loadGa ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
            strategy="lazyOnload"
          />
          <Script id="ga-config" strategy="lazyOnload">
            {`
window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaMeasurementId}');
`.trim()}
          </Script>
        </>
      ) : null}
      <Script src={PLAUSIBLE_SRC} strategy="lazyOnload" />
      <Script id="plausible-init" strategy="lazyOnload">
        {`
window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};
plausible.init()
`.trim()}
      </Script>
    </>
  );
}
