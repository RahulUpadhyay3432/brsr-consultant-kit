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

// Where every "Share feedback" affordance points. A prefilled mailto so a
// consultant can tell us what would make Saaksh better in one click, no login,
// nothing stored. Swap for a Tally / Google-Form URL when one exists.
export const FEEDBACK_URL =
  "mailto:rahulu626@gmail.com" +
  "?subject=" + encodeURIComponent("Saaksh feedback") +
  "&body=" + encodeURIComponent(
    "Hi Rahul,\n\nHere's what would make Saaksh better for me:\n\n" +
    "What I was trying to do:\nWhat got in the way / what I'd change:\n\n" +
    "(Anything else, a tool you wish existed, a bug, a rough edge, all welcome.)\n\nThanks"
  );
