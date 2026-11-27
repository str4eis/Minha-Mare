"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (
      process.env.NODE_ENV !== "production" ||
      !("serviceWorker" in navigator)
    ) {
      return;
    }

    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch((error) => {
      console.error("Não foi possível preparar o aplicativo.", error);
    });
  }, []);

  return null;
}
