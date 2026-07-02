"use client";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { trackClient } from "@/lib/clientTelemetry";

// Returns the referring domain only when it is external to this site.
function externalReferrerDomain() {
  try {
    const ref = document.referrer;
    if (!ref) return "";
    const url = new URL(ref);
    if (url.hostname === window.location.hostname) return "";
    return url.hostname;
  } catch {
    return "";
  }
}

// Whole-site page-view tracking + the pre-contact "source path" used by the
// enquiry form, plus uncaught client-error capture. All emitted as custom
// events to Application Insights via /api/track.
export default function PageTracker() {
  const pathname = usePathname();
  const prevRef = useRef(null);

  useEffect(() => {
    if (!pathname) return;

    // Remember the page the user was on before navigating to /contact, so the
    // contact form can report which page drove the enquiry.
    if (prevRef.current && prevRef.current !== pathname) {
      try {
        sessionStorage.setItem("cta_source_path", prevRef.current);
      } catch {
        /* storage blocked — non-fatal */
      }
    }

    // First page view of the session = the entry page (for bounce analysis).
    let isEntry = false;
    try {
      if (!sessionStorage.getItem("vv_entry_done")) {
        isEntry = true;
        sessionStorage.setItem("vv_entry_done", "1");
      }
    } catch {
      /* storage blocked — treat as non-entry */
    }

    trackClient("PageView", {
      referrerDomain: isEntry ? externalReferrerDomain() : "",
      isEntry,
    });

    prevRef.current = pathname;
  }, [pathname]);

  // Capture uncaught client errors (the App Insights web SDK would do this
  // automatically; we do it manually since we only load the server emitter).
  useEffect(() => {
    const onError = (e) => {
      trackClient("ClientError", {
        message: (e && e.message) || "unknown",
        source: e && e.filename ? `${e.filename}:${e.lineno || 0}` : "",
      });
    };
    const onRejection = (e) => {
      const reason = e && e.reason;
      trackClient("ClientError", {
        message: (reason && (reason.message || String(reason))) || "unhandledrejection",
        source: "promise",
      });
    };
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return null;
}
