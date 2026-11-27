"use client";

import { useRef } from "react";
import Script from "next/script";

const SCRIPT_URL = "https://vlibras.gov.br/app/vlibras-plugin.js";
const APP_URL = "https://vlibras.gov.br/app";

export default function VLibrasWidget() {
  const initialized = useRef(false);

  const initializeWidget = () => {
    if (
      initialized.current ||
      typeof window === "undefined" ||
      window.__vlibrasInitialized
    ) {
      return;
    }

    const Widget = window.VLibras?.Widget;
    if (!Widget) return;

    try {
      new Widget(APP_URL);
      initialized.current = true;
      window.__vlibrasInitialized = true;
    } catch {
      // The external widget may be unavailable or blocked.
    }
  };

  return (
    <>
      <div {...{ vw: "" }} className="enabled">
        <div {...{ "vw-access-button": "" }} className="active" />
        <div {...{ "vw-plugin-wrapper": "" }}>
          <div className="vw-plugin-top-wrapper" />
        </div>
      </div>
      <Script
        src={SCRIPT_URL}
        strategy="afterInteractive"
        onLoad={initializeWidget}
        onError={() => undefined}
      />
    </>
  );
}
