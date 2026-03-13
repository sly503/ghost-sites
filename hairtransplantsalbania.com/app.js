const API_URL = "https://albaniamedicaldirectory.com/api/contact/lead-intake";

function getSiteConfig() {
  return window.SITE_CONFIG || {};
}

function initAnalytics() {
  const config = getSiteConfig();
  if (!config.gaMeasurementId || window.__ghostAnalyticsLoaded) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function gtag() {
      window.dataLayer.push(arguments);
    };

  window.gtag("js", new Date());
  window.gtag("config", config.gaMeasurementId, {
    send_page_view: true,
    page_title: document.title,
    page_location: window.location.href
  });

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(
    config.gaMeasurementId
  )}`;
  document.head.appendChild(script);
  window.__ghostAnalyticsLoaded = true;
}

function trackEvent(eventName, params = {}) {
  const config = getSiteConfig();
  if (typeof window.gtag !== "function" || !config.gaMeasurementId) return;

  window.gtag("event", eventName, {
    site_domain: window.location.hostname,
    brand: config.brand || window.location.hostname,
    procedure: config.procedure || "Consultation",
    campaign_slug: config.campaignSlug || window.location.hostname,
    ...params
  });
}

function readUtmParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get("utm_source"),
    utm_medium: params.get("utm_medium"),
    utm_campaign: params.get("utm_campaign"),
    utm_content: params.get("utm_content")
  };
}

async function submitLead(form) {
  const statusEl = form.querySelector("[data-status]");
  const config = getSiteConfig();
  const data = new FormData(form);
  const payload = {
    name: data.get("name")?.toString().trim() || "",
    email: data.get("email")?.toString().trim() || null,
    phone: data.get("phone")?.toString().trim() || null,
    whatsapp: data.get("whatsapp")?.toString().trim() || null,
    procedure: config.procedure || "Consultation",
    source_domain: window.location.hostname,
    brand: config.brand || window.location.hostname,
    source: data.get("source")?.toString().trim() || "website",
    campaign_slug: config.campaignSlug || window.location.hostname,
    country: data.get("country")?.toString().trim() || null,
    budget_range: data.get("budget_range")?.toString().trim() || null,
    timeline: data.get("timeline")?.toString().trim() || null,
    notes: data.get("notes")?.toString().trim() || null,
    consent_to_contact: data.get("consent_to_contact") === "on",
    consent_to_call: data.get("consent_to_call") === "on",
    ...readUtmParams()
  };

  statusEl.textContent = "Sending request...";
  statusEl.className = "status-message";
  trackEvent("lead_submit_attempt", {
    contact_preference: payload.source || "website"
  });

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Request failed with ${response.status}`);
    }

    form.reset();
    statusEl.textContent =
      "Request received. We will follow up through Albania Medical Directory.";
    statusEl.className = "status-message success";
    trackEvent("generate_lead", {
      contact_preference: payload.source || "website"
    });
  } catch (error) {
    statusEl.textContent =
      "Submission failed. Please try again or contact via Albania Medical Directory.";
    statusEl.className = "status-message error";
    trackEvent("lead_submit_error", {
      contact_preference: payload.source || "website"
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initAnalytics();

  document
    .querySelectorAll('a[href="#lead-form"], a[href^="tel:"], a[href*="wa.me"], a[href*="whatsapp.com"]')
    .forEach((link) => {
      link.addEventListener("click", () => {
        const href = link.getAttribute("href") || "";
        let eventName = "cta_click";
        if (href.startsWith("tel:")) eventName = "phone_click";
        if (href.includes("wa.me") || href.includes("whatsapp.com")) {
          eventName = "whatsapp_click";
        }
        trackEvent(eventName, { href });
      });
    });

  const form = document.querySelector(".lead-form");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    submitLead(form);
  });
});
