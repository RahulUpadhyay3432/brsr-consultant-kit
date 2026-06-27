// Where every "Request Pro access" CTA points. At launch this is a plain mailto so
// interested consultants reach out and we onboard + bill them manually (no billing
// system yet). Swap this single constant for a Calendly / Tally / Google-Form URL
// when one exists and the whole site picks it up.
export const REQUEST_ACCESS_URL =
  "mailto:rahulu626@gmail.com" +
  "?subject=" + encodeURIComponent("Saaksh Pro (Collect), access request") +
  "&body=" + encodeURIComponent(
    "Hi Rahul,\n\nI'd like access to Saaksh Pro (the Collect tier).\n\n" +
    "Name:\nOrganisation:\nRoughly how many clients:\n\nThanks"
  );
