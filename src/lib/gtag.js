export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

/**
 * Log pageview with custom page path
 * @param {string} url - relative path e.g. "/projects" or "/work?filter=web"
 */
export const pageview = (url) => {
  if (typeof window !== "undefined" && typeof window.gtag === "function" && GA_MEASUREMENT_ID) {
    window.gtag("event", "page_view", {
      page_path: url,
    });
  }
};

/**
 * Log custom GA4 event
 * @param {string} action - event name e.g. "cv_download", "lead_submit"
 * @param {object} params - event parameters e.g. { method: "contact_form" }
 */
export const event = (action, params = {}) => {
  if (typeof window !== "undefined" && typeof window.gtag === "function" && GA_MEASUREMENT_ID) {
    window.gtag("event", action, params);
  }
};

