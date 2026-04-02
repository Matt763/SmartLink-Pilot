/**
 * Run: npx tsx scripts/seed-blog-posts.ts
 * Updates the main how-to guide and inserts additional SEO blog posts.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ─── Main how-to guide ──────────────────────────────────────────────────────

const HOW_TO_CONTENT = `
<h2>What Is SmartLink Pilot?</h2>
<p>SmartLink Pilot is a free, professional-grade URL shortener built for marketers, content creators, developers, and everyday users who want more from their links. Instead of sharing a long, messy web address, you create a clean short link, track every click in real time, and learn exactly who is engaging with your content.</p>
<p>Whether you are promoting a YouTube video, sharing a product page, running a social media campaign, or simply sending a link to a friend, SmartLink Pilot gives you control, clarity, and insight that a plain long URL never could.</p>

<h2>Creating Your Account</h2>
<p>Getting started with SmartLink Pilot takes less than a minute. Head to <strong>smartlinkpilot.com</strong> and click <strong>Get Started Free</strong> in the top navigation bar. You can sign up using your Google account for a one-click registration, or enter your email address and create a password manually.</p>
<p>Once your account is created, you will receive a confirmation email. Click the link inside to verify your address, and you are ready to go. No credit card is required to start — the free plan is genuinely free, forever.</p>

<h2>Shortening Your First Link</h2>
<p>After logging in, you will land on your personal dashboard. The link shortener is front and center. Here is how to shorten a URL in three easy steps:</p>
<ol>
  <li>Paste your long URL into the input field on the dashboard or the home page shortener.</li>
  <li>Optionally, type a custom alias in the "Custom Alias" field — for example, <em>my-product-launch</em> — to create a branded link like <strong>smartlinkpilot.com/my-product-launch</strong>.</li>
  <li>Click <strong>Shorten</strong>. Your short link is instantly generated and copied to your clipboard.</li>
</ol>
<p>That's it. Share it anywhere — social media, email campaigns, SMS, printed materials, or anywhere else your audience finds you.</p>

<h2>Your Dashboard: The Command Centre</h2>
<p>Your dashboard is where everything lives. Once you have created a few short links, you will see them listed here with key information at a glance:</p>
<ul>
  <li><strong>Original URL</strong> — the destination your link points to.</li>
  <li><strong>Short link</strong> — your compact, shareable address.</li>
  <li><strong>Total clicks</strong> — how many times the link has been clicked.</li>
  <li><strong>Created date</strong> — when you made the link.</li>
  <li><strong>Status</strong> — whether the link is active, expired, or password-protected.</li>
</ul>
<p>You can search, filter, and sort your links to find exactly what you need. Every link also has a quick-copy button so you can grab it instantly without navigating anywhere.</p>

<h2>Understanding Link Analytics</h2>
<p>This is where SmartLink Pilot truly shines. Every time someone clicks your short link, SmartLink Pilot records detailed information about that visit. To see the analytics for any link, click on it in your dashboard and then open the <strong>Analytics</strong> view.</p>
<p>Here is what you will find:</p>
<ul>
  <li><strong>Total clicks over time</strong> — a clear chart showing traffic trends by day, week, or month.</li>
  <li><strong>Geographic breakdown</strong> — see which countries your clicks are coming from, displayed on an interactive map.</li>
  <li><strong>Device types</strong> — understand whether your audience is on desktop, mobile, or tablet.</li>
  <li><strong>Browser data</strong> — see which browsers your visitors use, helpful for compatibility testing.</li>
  <li><strong>Referrer sources</strong> — find out whether clicks came from Twitter, a newsletter, a website, or direct traffic.</li>
</ul>
<p>Armed with this data, you can make smarter decisions. If 80% of your audience is on mobile, you know to prioritize mobile-friendly landing pages. If most clicks come from Instagram, you know where to invest more marketing effort.</p>

<h2>Generating QR Codes for Any Link</h2>
<p>Every short link on SmartLink Pilot comes with a built-in QR code generator. QR codes are perfect for bridging the gap between offline and online — place them on business cards, product packaging, event posters, restaurant menus, or storefront displays.</p>
<p>To generate a QR code for a link, open the link details from your dashboard and click the <strong>QR Code</strong> button. You can download the QR code as a high-resolution PNG image, ready to print or use in any design. The QR code updates automatically if you ever change the destination URL, so your printed materials never go out of date.</p>

<h2>Custom Aliases and Branded Links</h2>
<p>A custom alias turns a random short code into something meaningful and memorable. Instead of <em>smartlinkpilot.com/x7k2q</em>, you can have <em>smartlinkpilot.com/summer-sale-2025</em>.</p>
<p>Custom aliases are available to all users. When creating or editing a link, simply enter your desired alias in the custom alias field. If it is already taken, you will be prompted to choose a different one. Branded links improve click-through rates because people trust links they recognise.</p>

<h2>Password-Protecting a Link</h2>
<p>Sometimes you need to share something privately — a draft document, a confidential report, an early product preview, or a private download. SmartLink Pilot lets you add a password to any link.</p>
<p>When you create or edit a link, enable the <strong>Password Protection</strong> toggle and enter a password. Anyone who clicks the short link will be shown a clean password entry page before they can continue to the destination. Share the password separately from the link for maximum security.</p>

<h2>Setting Link Expiry Dates</h2>
<p>Link expiration is useful for time-limited offers, event registrations, or temporary file sharing. You can set a specific date and time after which your short link will automatically stop working and display an expiry message to anyone who tries to visit it.</p>
<p>To set an expiry, open the link editor and enable the <strong>Expiry Date</strong> option. Choose the date and time, and save. Once the link expires, it is deactivated automatically — you don't need to do anything.</p>

<h2>Upgrading to Pro</h2>
<p>The free plan is generous, but the <strong>Pro plan</strong> unlocks everything. For a small monthly fee, Pro members get:</p>
<ul>
  <li>Unlimited link shortening with no daily cap.</li>
  <li>Advanced analytics with deeper audience insights.</li>
  <li>Priority link processing and faster redirects.</li>
  <li>Advanced QR code customisation options.</li>
  <li>Access to API integrations for connecting SmartLink Pilot with your other tools.</li>
  <li>Pro badge on your account.</li>
</ul>
<p>To upgrade, go to the <strong>Pricing</strong> page from the main navigation and choose the Pro plan. Payment is securely handled — once confirmed, your account is upgraded instantly.</p>

<h2>Enterprise Features for Teams</h2>
<p>The <strong>Enterprise plan</strong> is designed for businesses and teams who need the full power of SmartLink Pilot at scale:</p>
<ul>
  <li><strong>Team workspaces</strong> — invite colleagues and collaborate on link management together.</li>
  <li><strong>Full API access</strong> — integrate SmartLink Pilot into your own applications and workflows programmatically.</li>
  <li><strong>Bulk link creation</strong> — create hundreds of short links at once via the API.</li>
  <li><strong>Advanced security controls</strong> and dedicated support.</li>
</ul>
<p>Enterprise users can manage everything from one central workspace, making it ideal for marketing agencies, SaaS companies, e-commerce stores, and media brands.</p>

<h2>The SmartLink Pilot Mobile App</h2>
<p>You don't have to be at a computer to manage your links. The SmartLink Pilot mobile app lets you shorten links, check analytics, and manage your account from your smartphone. Visit the <strong>Download</strong> page to find installation instructions for iOS and Android. The app syncs with your account in real time, so every link you create on desktop appears instantly on mobile and vice versa.</p>

<h2>The URL Detector — A Smart Shortcut</h2>
<p>SmartLink Pilot includes a clever browser feature called the <strong>URL Detector</strong>. When you copy a URL on your device, a small prompt appears in the bottom of your screen, asking if you would like to shorten it immediately. You can shorten and copy the result in a single tap, without even opening a new tab or navigating to the dashboard. It's a small feature that saves a surprising amount of time.</p>

<h2>Accessing Your API Keys</h2>
<p>Pro and Enterprise users can access their personal API keys from the dashboard under <strong>Account Settings → API Keys</strong>. The SmartLink Pilot API lets you create short links, retrieve click statistics, update link settings, and delete links programmatically. This is ideal for developers who want to integrate link shortening directly into their apps, CMS platforms, or automated marketing pipelines.</p>

<h2>Tips for Getting the Most from SmartLink Pilot</h2>
<ul>
  <li><strong>Use descriptive aliases</strong> for every important link — it helps with tracking and looks more professional when shared.</li>
  <li><strong>Check your analytics weekly</strong> to understand which content drives the most engagement.</li>
  <li><strong>Set expiry dates</strong> on promotional links so you are never sending traffic to an outdated page.</li>
  <li><strong>Use QR codes</strong> on physical marketing materials and track how many people scan them.</li>
  <li><strong>Password-protect sensitive links</strong> instead of emailing files or using unsecured sharing methods.</li>
  <li><strong>Add UTM parameters</strong> to your destination URLs before shortening — this way Google Analytics gets detailed campaign data while SmartLink Pilot gives you link-level click data.</li>
</ul>

<h2>Privacy and Security</h2>
<p>SmartLink Pilot takes your data seriously. All links are stored securely, and click data is collected in an anonymised and aggregated way that respects visitor privacy. We do not sell your data to third parties. Passwords for protected links are encrypted so that only the recipient can access them. Your account is protected with industry-standard authentication practices.</p>

<h2>Getting Help</h2>
<p>If you ever get stuck, there are several ways to get help. You can reach our support team through the <strong>Contact</strong> page, or ask <strong>Paulina</strong> — the SmartLink Pilot assistant — directly in the chat widget available on every page. Paulina can help with account questions, billing inquiries, password resets, and general platform guidance. She's available around the clock and responds instantly.</p>

<h2>Start Shortening Smarter Today</h2>
<p>SmartLink Pilot is more than a URL shortener. It is a complete link intelligence platform that gives you clean links, deep analytics, and powerful tools to understand and grow your audience. Whether you are running a one-person blog or managing campaigns for a global brand, SmartLink Pilot scales with you.</p>
<p>Sign up free at <strong>smartlinkpilot.com</strong> and create your first short link in under a minute. No credit card needed. No complicated setup. Just smarter links, starting now.</p>
`.trim();

// ─── Additional posts ────────────────────────────────────────────────────────

const ANALYTICS_POST = {
  slug: "how-to-track-link-clicks-and-analyze-your-audience",
  title: "How to Track Link Clicks and Analyze Your Audience with SmartLink Pilot",
  excerpt: "Learn how to use SmartLink Pilot's built-in analytics to track every click, understand your audience geography, device types, and referral sources — and use that data to grow.",
  content: `
<h2>Why Link Analytics Matter</h2>
<p>Sharing a link without tracking it is like sending out a marketing campaign and never checking the results. You might get engagement, but you have no idea what is working, who is responding, or where your best traffic is coming from. SmartLink Pilot's analytics dashboard changes that entirely.</p>
<p>Every short link you create automatically records click data in real time. You do not need to install any extra tools, connect third-party accounts, or add tracking codes. It all happens automatically from the moment you share your link.</p>

<h2>How to Access Analytics for a Link</h2>
<p>Accessing analytics for any of your links is straightforward. Log into your SmartLink Pilot account and head to your dashboard. You will see all your short links listed there. Click on any link to open its details page, then select the <strong>Analytics</strong> tab. That's all it takes.</p>

<h2>What the Analytics Dashboard Shows You</h2>
<p>The analytics view gives you a rich picture of how your link is performing:</p>
<ul>
  <li><strong>Total clicks</strong> — the complete count of all visits since the link was created.</li>
  <li><strong>Click timeline</strong> — a graph showing clicks over time. You can filter by the last 7 days, 30 days, or all time to spot trends.</li>
  <li><strong>Top countries</strong> — a ranked list of the countries generating the most clicks, so you know your audience's geographic spread.</li>
  <li><strong>Device breakdown</strong> — the percentage of visitors on desktop, mobile, and tablet devices.</li>
  <li><strong>Browser stats</strong> — which browsers your visitors use, which can inform technical decisions about your website.</li>
  <li><strong>Referrer data</strong> — where your traffic is coming from. This shows whether clicks arrived from Twitter, Instagram, a specific website, an email newsletter, or direct access.</li>
</ul>

<h2>Using Data to Improve Your Marketing</h2>
<p>The real value of analytics is not the numbers themselves — it is what you do with them. Here are practical ways to act on what SmartLink Pilot tells you:</p>
<ul>
  <li>If a link gets most of its clicks in the first 24 hours, schedule future posts and emails for peak engagement times.</li>
  <li>If 70% of your audience is on mobile, audit your landing pages for mobile responsiveness.</li>
  <li>If most referrals come from a specific platform, focus your content and ad budget there.</li>
  <li>If an old link suddenly spikes in traffic, investigate who shared it and consider creating fresh content around that topic.</li>
</ul>

<h2>Combining SmartLink Pilot Data with Google Analytics</h2>
<p>For even richer insights, combine SmartLink Pilot with Google Analytics by adding UTM parameters to your destination URLs before shortening. A UTM-tagged URL looks like this:</p>
<p><em>https://yourwebsite.com/page?utm_source=instagram&utm_medium=social&utm_campaign=launch</em></p>
<p>Shorten this URL with SmartLink Pilot and you get both link-level click data from SmartLink Pilot and full session-level behaviour data in Google Analytics. Together, these two tools give you the complete picture from the click all the way through to conversion.</p>

<h2>Exporting and Sharing Your Data</h2>
<p>Pro and Enterprise users can access their analytics data via the SmartLink Pilot API, making it easy to pull link performance metrics into spreadsheets, custom dashboards, or internal reporting tools. This is especially useful for agencies and marketing teams who need to present click data to clients or stakeholders.</p>

<h2>Making Analytics a Habit</h2>
<p>The teams and creators who get the most from SmartLink Pilot are those who check their analytics consistently. Set aside a few minutes each week to review your top-performing links, identify any that are underperforming, and adjust your strategy accordingly. Over time, you will build a clear picture of what resonates with your audience and what doesn't — and that knowledge is genuinely valuable.</p>
<p>Start tracking smarter today. Every link you share is an opportunity to learn something new about your audience.</p>
  `.trim(),
};

const QR_POST = {
  slug: "how-to-create-custom-qr-codes-for-your-business",
  title: "How to Create Custom QR Codes for Your Business with SmartLink Pilot",
  excerpt: "QR codes bridge the gap between physical and digital marketing. Here is how to generate professional QR codes for any link using SmartLink Pilot — and how to use them effectively.",
  content: `
<h2>Why QR Codes Are More Relevant Than Ever</h2>
<p>After years of being underused, QR codes have become a standard part of modern communication. Restaurants use them for menus. Events use them for registration. Retailers use them for product information and promotions. With a smartphone camera, anyone can scan a QR code instantly and reach any web destination you choose.</p>
<p>SmartLink Pilot makes QR code creation completely effortless. Every short link you create comes with an automatically generated QR code that is ready to download and use anywhere.</p>

<h2>Generating a QR Code in SmartLink Pilot</h2>
<p>You don't need a separate QR code tool when you use SmartLink Pilot. Here is how to get your QR code:</p>
<ol>
  <li>Log in to your SmartLink Pilot dashboard.</li>
  <li>Locate the short link you want a QR code for, or create a new one.</li>
  <li>Open the link's detail page and click the <strong>QR Code</strong> button.</li>
  <li>Your QR code is displayed immediately. Click <strong>Download</strong> to save it as a high-resolution PNG image.</li>
</ol>
<p>The downloaded image is print-quality and works whether you need it small on a business card or large on a banner or poster.</p>

<h2>What Makes a Good QR Code Strategy</h2>
<p>Generating a QR code is the easy part. Using it effectively requires a bit of thought:</p>
<ul>
  <li><strong>Always test before printing.</strong> Scan your QR code with a phone camera to confirm it links to the right destination before you commit to a print run.</li>
  <li><strong>Add a call to action.</strong> Place a short instruction near the QR code, such as "Scan to see our full menu" or "Scan for an exclusive discount." People scan more when they know what they're getting.</li>
  <li><strong>Keep the destination mobile-friendly.</strong> Most QR code scans happen on a smartphone. Make sure the page you are linking to looks great on mobile.</li>
  <li><strong>Link to something specific.</strong> A QR code that takes people to your homepage is less effective than one that links directly to a product, offer, or registration form.</li>
  <li><strong>Use a short, branded link first.</strong> Because SmartLink Pilot creates the QR code from a short link, you can update the destination URL at any time without reprinting. This is a huge advantage for ongoing campaigns.</li>
</ul>

<h2>Creative Ways to Use QR Codes</h2>
<p>Here are some ideas for putting QR codes to work in different contexts:</p>
<ul>
  <li><strong>Business cards</strong> — link to your LinkedIn profile, portfolio, or website.</li>
  <li><strong>Product packaging</strong> — link to usage instructions, recipes, or how-to videos.</li>
  <li><strong>Event signage</strong> — link to event schedules, maps, or registration pages.</li>
  <li><strong>Restaurant menus</strong> — link to an online menu or ordering system.</li>
  <li><strong>Email signatures</strong> — embed a QR code that links to a scheduling calendar or landing page.</li>
  <li><strong>Retail displays</strong> — link to product reviews, comparison guides, or promotions.</li>
</ul>

<h2>Tracking QR Code Performance</h2>
<p>One of the biggest advantages of using SmartLink Pilot for QR codes is the built-in tracking. Because your QR code links to a SmartLink Pilot short URL, every scan is recorded as a click in your analytics dashboard. You can see how many people scanned your code, when they scanned it, which devices they used, and where they were located.</p>
<p>This data is invaluable for understanding the real-world performance of your physical marketing materials — something traditional QR code generators simply cannot provide.</p>

<h2>Getting Started</h2>
<p>Creating your first QR code with SmartLink Pilot takes about thirty seconds. Log in, shorten a link, click QR Code, and download. It really is that simple. Once you see how much insight the analytics give you, you will wonder how you ever managed without it.</p>
  `.trim(),
};

const PRICING_POST = {
  slug: "smartlink-pilot-pricing-free-pro-enterprise-plans-compared",
  title: "SmartLink Pilot Pricing Explained: Free, Pro & Enterprise Plans Compared",
  excerpt: "Not sure which SmartLink Pilot plan is right for you? This honest breakdown explains exactly what each plan includes, who it is for, and how to choose between Free, Pro, and Enterprise.",
  content: `
<h2>Choosing the Right Plan</h2>
<p>SmartLink Pilot is built to serve everyone from individuals sharing a few links a month to enterprise marketing teams managing thousands of URLs. That's why the platform offers three distinct plans, each designed for a different stage of growth. Here is an honest look at each option so you can make the right choice.</p>

<h2>The Free Plan: Genuinely Free, No Catches</h2>
<p>The free plan on SmartLink Pilot is not a watered-down trial — it is a real, functional plan that is free forever. It includes:</p>
<ul>
  <li>URL shortening with no hard daily limit for standard use.</li>
  <li>Basic click analytics including total clicks and geographic data.</li>
  <li>QR code generation for every link you create.</li>
  <li>Custom alias support for creating branded short links.</li>
  <li>Password-protected links to share content privately.</li>
  <li>Link expiration date settings.</li>
</ul>
<p>The free plan is perfect for bloggers, students, freelancers, and anyone who wants clean, trackable links without paying anything. No credit card required to start.</p>

<h2>The Pro Plan: For Serious Creators and Marketers</h2>
<p>The Pro plan is designed for people who are actively using their links as part of a business or marketing strategy. In addition to everything in the free plan, Pro gives you:</p>
<ul>
  <li>Unlimited link creation with no restrictions.</li>
  <li>Advanced analytics with deeper audience insights and extended data history.</li>
  <li>Priority redirect processing for faster link performance.</li>
  <li>Advanced QR code options.</li>
  <li>API access to integrate SmartLink Pilot into your other tools and workflows.</li>
  <li>A Pro badge on your profile.</li>
</ul>
<p>The Pro plan is ideal for content creators, social media managers, affiliate marketers, small business owners, and digital agencies. If you rely on links to drive traffic and you want to understand that traffic deeply, Pro is worth it.</p>

<h2>The Enterprise Plan: For Teams and Businesses</h2>
<p>Enterprise is built for organisations that need collaboration, scale, and power. It includes everything in Pro plus:</p>
<ul>
  <li>Team workspaces — invite multiple users to manage links together under one account.</li>
  <li>Full API access with higher rate limits for bulk operations.</li>
  <li>Bulk link creation for high-volume campaigns.</li>
  <li>Advanced security and access controls.</li>
  <li>Dedicated customer support with faster response times.</li>
</ul>
<p>Enterprise is the right choice for marketing agencies managing multiple clients, e-commerce brands running large-scale campaigns, media companies, SaaS businesses, and any organisation where a team needs shared access to link management.</p>

<h2>How to Upgrade</h2>
<p>Upgrading from Free to Pro or Enterprise takes under two minutes. Go to the <strong>Pricing</strong> page from the main navigation, choose your plan, and complete the payment. Your account is upgraded immediately after payment is confirmed. You can manage, pause, or cancel your subscription from your account settings at any time.</p>

<h2>Which Plan Should You Choose?</h2>
<p>Here's a simple guide:</p>
<ul>
  <li>Start with <strong>Free</strong> if you are new to link shortening or only need it occasionally.</li>
  <li>Upgrade to <strong>Pro</strong> when you are actively using links for marketing, content, or business — and you want full analytics and API access.</li>
  <li>Choose <strong>Enterprise</strong> when you are working with a team and need shared workspaces, bulk capabilities, and dedicated support.</li>
</ul>
<p>There is no risk in starting free. Create your account today, explore the platform, and upgrade whenever the need arises. SmartLink Pilot grows with you.</p>
  `.trim(),
};

// ─── Run ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("Seeding blog posts...");

  // Update the main how-to guide (match by slug pattern)
  const existing = await prisma.blogPost.findFirst({
    where: { slug: { contains: "how-to-use-smartlink" } },
  });

  if (existing) {
    await prisma.blogPost.update({
      where: { id: existing.id },
      data: {
        title: "How to Use SmartLink Pilot: The Complete Step-by-Step Guide",
        slug: "how-to-use-smartlink-pilot",
        excerpt:
          "Everything you need to know about using SmartLink Pilot — from shortening your first link to mastering analytics, QR codes, custom aliases, and link management. A complete guide for beginners and power users alike.",
        content: HOW_TO_CONTENT,
        featuredImage: null,
        published: true,
      },
    });
    console.log("Updated main how-to guide.");
  } else {
    await prisma.blogPost.create({
      data: {
        title: "How to Use SmartLink Pilot: The Complete Step-by-Step Guide",
        slug: "how-to-use-smartlink-pilot",
        excerpt:
          "Everything you need to know about using SmartLink Pilot — from shortening your first link to mastering analytics, QR codes, custom aliases, and link management. A complete guide for beginners and power users alike.",
        content: HOW_TO_CONTENT,
        featuredImage: null,
        published: true,
      },
    });
    console.log("Created main how-to guide.");
  }

  // Insert additional posts (skip if slug already exists)
  for (const post of [ANALYTICS_POST, QR_POST, PRICING_POST]) {
    const exists = await prisma.blogPost.findUnique({ where: { slug: post.slug } });
    if (exists) {
      console.log(`Skipped (already exists): ${post.slug}`);
      continue;
    }
    await prisma.blogPost.create({
      data: { ...post, published: true },
    });
    console.log(`Created: ${post.slug}`);
  }

  console.log("Done!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
