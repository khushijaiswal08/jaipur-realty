import type { FaqScope } from "../../generated/prisma/enums";

// Demo agent, testimonials, blog content and general FAQs (SPEC §35.2).
// Testimonials and blog posts are demo content (isDemo = true, labelled in the UI).
// FAQs are process-only (no legal/tax claims) and are NOT demo-flagged — review before launch.

export const DEMO_AGENT = {
  name: "Aarav Sharma",
  slug: "aarav-sharma-demo",
  designation: "Property Consultant (demo profile)",
  bio: "This is a demo agent profile used to show how consultant details appear on listings. Replace it with your real team from the admin panel.",
  languages: ["Hindi", "English", "Rajasthani"],
  experienceYears: 8,
  photoUrl: "/placeholders/agent-avatar.svg",
};

export const DEMO_TESTIMONIALS = [
  {
    name: "Neha K.",
    location: "Vaishali Nagar",
    context: "Bought a 3 BHK apartment",
    quote:
      "The team shortlisted homes that actually matched our budget and needs, arranged visits on a single weekend and helped us through the paperwork. We moved in within two months.",
    rating: 5,
  },
  {
    name: "Rajesh M.",
    location: "Mansarovar",
    context: "Rented out a 2 BHK",
    quote:
      "I listed my flat through their website and had verified tenant enquiries within a week. They handled the visits and the agreement, which saved me a lot of time.",
    rating: 5,
  },
  {
    name: "Pooja & Ankit S.",
    location: "Jagatpura",
    context: "Booked a new-launch apartment",
    quote:
      "As first-time buyers we had many questions about possession timelines and payment plans. Every question got a clear answer on WhatsApp, usually within minutes.",
    rating: 4,
  },
  {
    name: "Suresh P.",
    location: "NRI, Dubai",
    context: "Bought a plot on Ajmer Road",
    quote:
      "Buying from abroad felt risky, but video walkthroughs of the plot and regular updates made the whole process transparent.",
    rating: 5,
  },
  {
    name: "Kavita R.",
    location: "C-Scheme",
    context: "Leased an office space",
    quote:
      "They understood exactly what our small firm needed and negotiated a fair lease for a furnished office close to our clients.",
    rating: 4,
  },
];

export const BLOG_CATEGORIES = [
  { name: "Buying Guide", slug: "buying-guide", description: "Practical guidance for buying a home or plot in Jaipur." },
  { name: "Locality Insights", slug: "locality-insights", description: "Neighbourhood guides and comparisons across Jaipur." },
  { name: "Renting", slug: "renting", description: "Tips for tenants and landlords." },
  { name: "Legal & Documentation", slug: "legal-documentation", description: "Understanding property paperwork (general information only)." },
];

export const DEMO_POSTS = [
  {
    title: "A first-time buyer's checklist for Jaipur",
    slug: "first-time-buyer-checklist-jaipur",
    categorySlug: "buying-guide",
    excerpt:
      "From fixing a budget to the final site visit, here is a simple step-by-step checklist for buying your first home in Jaipur.",
    tags: ["first-time buyer", "checklist", "home loan"],
    publishedDaysAgo: 6,
    content: `> **Demo article.** This post illustrates the blog layout. Replace it with your own content from the admin panel.

Buying your first home is exciting — and it is easier when you follow a clear sequence.

## 1. Fix your budget first

Work out how much you can pay upfront and what EMI is comfortable each month. Use our [EMI calculator](/tools/emi-calculator) to try different loan amounts and tenures.

## 2. Shortlist two or three localities

Think about your daily commute, schools, hospitals and markets. Our [locality guides](/localities) summarise each neighbourhood.

## 3. Compare like with like

When comparing homes, check which area is being quoted — carpet, built-up or super built-up — and compare the **price per sq ft** on the same basis.

## 4. Visit at different times of day

Traffic, noise and sunlight change through the day. A second visit in the evening often reveals things a morning visit does not.

## 5. Verify the paperwork with a professional

Ask for the title documents, approvals and, for new projects, the RERA registration. Always have documents reviewed by a qualified legal professional before paying a token amount.

## 6. Keep everything in writing

Payment schedules, possession dates and included fittings should all be written into the agreement.

*This article is general information, not legal or financial advice.*`,
  },
  {
    title: "Vaishali Nagar vs Mansarovar: which suits you?",
    slug: "vaishali-nagar-vs-mansarovar",
    categorySlug: "locality-insights",
    excerpt:
      "Two of Jaipur's most popular residential areas, compared on housing options, budgets, connectivity and lifestyle.",
    tags: ["Vaishali Nagar", "Mansarovar", "locality guide"],
    publishedDaysAgo: 14,
    content: `> **Demo article.** This post illustrates the blog layout. Replace it with your own content from the admin panel.

Both Vaishali Nagar and Mansarovar are established, family-friendly neighbourhoods — but they suit slightly different buyers.

## Housing options

- **Vaishali Nagar** has a mix of mature apartment societies and independent houses, with newer projects on the outskirts.
- **Mansarovar** is a large planned colony organised into sectors, with plenty of mid-segment flats and independent homes.

## Budget

Indicative rates are usually higher in Vaishali Nagar than in Mansarovar. See the latest indicative figures on each [locality page](/localities).

## Connectivity

Mansarovar benefits from metro connectivity, while Vaishali Nagar has quick access to Ajmer Road and the city centre.

## Lifestyle

Vaishali Nagar is known for its busy shopping streets and restaurants; Mansarovar offers quieter sector parks and local markets.

## Bottom line

If metro access and value matter most, start with Mansarovar. If you want a lively, central-west address, start with Vaishali Nagar. Browse [properties for sale](/buy) in both.`,
  },
  {
    title: "Renting in Jaipur: 7 questions to ask before you sign",
    slug: "renting-in-jaipur-questions-to-ask",
    categorySlug: "renting",
    excerpt:
      "Deposit, maintenance, notice period and more — the questions every tenant should ask before signing a rental agreement.",
    tags: ["renting", "tenant", "rental agreement"],
    publishedDaysAgo: 25,
    content: `> **Demo article.** This post illustrates the blog layout. Replace it with your own content from the admin panel.

A few questions up front can save a lot of trouble later.

1. **What is the security deposit, and when is it refunded?**
2. **Is maintenance included in the rent?** If not, how much is it each month?
3. **What is the notice period** for both tenant and owner?
4. **What is the lock-in period**, if any?
5. **Which furniture and appliances are included?** Make an inventory list and attach it to the agreement.
6. **Who pays for repairs** to appliances, plumbing and electrical fittings?
7. **Is the agreement registered**, and who pays the registration charges?

Looking for a rental? Browse [properties for rent](/rent) or [tell us what you need](/contact).

*This article is general information, not legal advice.*`,
  },
];

export const GENERAL_FAQS: Array<{ question: string; answer: string; scope: FaqScope }> = [
  {
    question: "How do I book a site visit?",
    answer:
      "Open any property or project page and use **Book a site visit** to pick a date and time slot. Our team will call or WhatsApp you to confirm.",
    scope: "GENERAL",
  },
  {
    question: "Do you charge buyers or tenants a fee?",
    answer:
      "Our fee depends on the type of transaction. Please ask our team for the applicable brokerage before your site visit — we will confirm it in writing.",
    scope: "GENERAL",
  },
  {
    question: "Can I list my property with you?",
    answer:
      "Yes. Use [Post your property](/post-property) to share the details. Our team reviews every submission and calls you before it is published.",
    scope: "SELLING",
  },
  {
    question: "Are the listings on this website verified?",
    answer:
      "Listings marked **Verified** have been physically checked by our team. For every property, please verify documents with a qualified professional before paying any amount.",
    scope: "BUYING",
  },
  {
    question: "Can you help me get a home loan?",
    answer:
      "We can connect you with lending partners and help you compare offers. Loan approval and interest rates are decided by the lender.",
    scope: "HOME_LOANS",
  },
  {
    question: "What documents does a tenant usually need?",
    answer:
      "Typically an identity proof, a recent photograph and, for company leases, a company letter. The owner may ask for additional documents.",
    scope: "RENTING",
  },
  {
    question: "Can I contact you on WhatsApp?",
    answer: "Yes — tap the WhatsApp button on any page and your message will include the property you are looking at.",
    scope: "GENERAL",
  },
  {
    question: "Do you help NRI buyers?",
    answer:
      "Yes. We offer video walkthroughs, WhatsApp updates and coordination with your chosen legal and banking professionals.",
    scope: "BUYING",
  },
];
