// Where every "Request Pro access" CTA points. Now an on-site form (/request-pro)
// that stores the lead and emails us, instead of a mailto (mail-client friction +
// a personal address). One constant, so every CTA across the site picks it up.
export const REQUEST_ACCESS_URL = "/request-pro";

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

// The consultant WhatsApp community invite. One constant, so the /community
// page, the nav, the report sidebar and the help widget all light up the moment
// the real invite is pasted here.
// TODO: paste the WhatsApp group invite link (https://chat.whatsapp.com/...).
export const COMMUNITY_WHATSAPP_URL = "";

// True once a real invite is set, so CTAs can render a "coming soon" state
// instead of a dead link while the URL is still a placeholder.
export const hasCommunityLink = COMMUNITY_WHATSAPP_URL.length > 0;
