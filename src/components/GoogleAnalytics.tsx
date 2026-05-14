"use client";

import Script from "next/script";
import { useState, useEffect } from "react";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const CONSENT_KEY = "gm_cookie_consent";

export function GoogleAnalytics() {
  const [consented, setConsented] = useState(false);

  useEffect(() => {
    const check = () =>
      setConsented(localStorage.getItem(CONSENT_KEY) === "granted");
    check();
    window.addEventListener("gm-consent-update", check);
    return () => window.removeEventListener("gm-consent-update", check);
  }, []);

  if (!GA_ID || !consented) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${GA_ID}', { page_path: window.location.pathname });
      `}</Script>
    </>
  );
}
