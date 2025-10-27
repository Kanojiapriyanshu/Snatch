// src/lib/gtag.js
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID;

export const pageview = (url) => {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("config", GA_MEASUREMENT_ID, {
      page_path: url,
        debug_mode: window.location.search.includes("debug_mode=true"),
    });
  }
};

// Track specific events (like button clicks)
export const event = ({ action, category, label, value }) => {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
        debug_mode: window.location.search.includes("debug_mode=true"),
    });
  }
};
