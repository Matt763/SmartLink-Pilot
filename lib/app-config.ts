/**
 * App Configuration
 * Update these values in Admin CMS → App Config tab.
 * These are the static defaults. DB values (set via admin) take priority.
 */
export const APP_CONFIG = {
  appName: "SmartLink Pilot",
  appTagline: "Shorten, Share & Analyze",
  appDescription: "The ultimate SaaS platform to manage your branded links, track global analytics, and boost your marketing campaigns.",
  supportEmail: "support@smartlinkpilot.com",
  legalEmail: "legal@smartlinkpilot.com",
  privacyEmail: "privacy@smartlinkpilot.com",
  officeLocation: "Arusha, Tanzania",
  phone: "+254 700 000 000",
  foundedYear: "2024",

  // App Store Links — Update these when your app is live
  playStoreUrl: "#", // "https://play.google.com/store/apps/details?id=com.mayobe.smartlink"
  appStoreUrl: "#",  // "https://apps.apple.com/app/smartlink-pilot/id123456789"
  apkDownloadUrl: "/downloads/smartlink-pilot.apk", // Direct APK path in /public/downloads/
  appVersion: "1.0.0",
  apkSize: "18 MB",

  // Social Links
  twitterUrl: "https://twitter.com/smartlinkpilot",
  linkedinUrl: "https://linkedin.com/company/smartlinkpilot",
  githubUrl: "https://github.com/mayobe/smartlink",
  instagramUrl: "https://instagram.com/smartlinkpilot",
  whatsappUrl: "https://wa.me/254700000000",
  telegramUrl: "https://t.me/smartlinkpilot",

  // Site URLs
  siteUrl: process.env.NEXTAUTH_URL || "https://smartlinkpilot.com",
};
