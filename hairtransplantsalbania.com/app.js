const API_URL = "https://albaniamedicaldirectory.com/api/contact/lead-intake";

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
  const config = window.SITE_CONFIG || {};
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
  } catch (error) {
    statusEl.textContent =
      "Submission failed. Please try again or contact via Albania Medical Directory.";
    statusEl.className = "status-message error";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".lead-form");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    submitLead(form);
  });
});
