/**
 * One place for Saarthi Classes contact details, links and branding.
 * Change values here and they update across the site, emails and dashboard.
 */
export const SITE = {
  name: "Saarthi Classes",
  url: "https://classes.saarthilife.com",
  parent: { name: "Saarthi", url: "https://www.saarthilife.com" },

  /** Saarthi's logo. Served from saarthilife.com; copy it to /public and change to "/saarthi-logo.webp" any time. */
  logoUrl: "https://www.saarthilife.com/saarthi-logo.webp",

  email: "contact@saarthilife.com",
  phone: "+91 89202 29024",
  /** Digits only, with country code, for wa.me and tel: links */
  phoneDigits: "918920229024",
  whatsappMessage: "Hi! I'd like to know more about Saarthi Classes psychology batches.",
  address: "New Delhi, India",
  hours: "Mon to Sat, 10 am to 7 pm",

  social: [
    { label: "Instagram", href: "https://instagram.com/saarthi.safespace" },
    { label: "YouTube", href: "https://youtube.com/@saarthi_theguidanceforlife" },
    { label: "Facebook", href: "https://www.facebook.com/share/1HszJAuHfi/" },
    { label: "LinkedIn", href: "https://www.linkedin.com/company/saarthi-the-guidance-for-life/" },
  ],
} as const;

export const whatsappUrl = (text: string = SITE.whatsappMessage) =>
  `https://wa.me/${SITE.phoneDigits}?text=${encodeURIComponent(text)}`;
