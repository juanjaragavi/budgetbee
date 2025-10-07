# Current Issues & TODOs

(_Last Updated: May 26, 2025_)

## Immediate Tasks

1. [x] Update site configuration with BudgetBee branding _(Completed: May 24, 2025)_
   - **Important:** Consult `.clinerules/5-BRANDING.md` for brand guidelines, color palette (#E7B739, #7ED321, #4A90E2), typography (Montserrat font), and tagline
   - ✓ Updated config.json with BudgetBee title and branding
   - ✓ Updated package.json with project name and description
   - ✓ Updated Base.astro with theme name
   - ✓ Added logo.png and square-logo.png
   - ✓ Updated theme.json with brand colors (primary: #E7B739) and Montserrat font
   - ✓ Footer content updated with legal texts and contact information
   - ✓ Updated footer navigation: 'Our Mission' to 'Our Promise' linked to #our-promise anchor in About Us page. _(Completed: May 24, 2025)_
   - ✓ Contact form action endpoint needs configuration _(Completed: May 24, 2025)_
2. [x] Replace placeholder content on homepage _(Completed: May 24, 2025)_
   - **Important:** Follow brand voice and tone guidelines in `.clinerules/5-BRANDING.md` - approachable, trustworthy, modern voice with clear, jargon-free content
   - ✓ Updated banner section with BudgetBee tagline and mission statement
   - ✓ Replaced feature section with BudgetBee's key differentiators (unbiased, free, no sign-ups)
   - ✓ Updated services section with credit cards, budgeting, and financial wellness content
   - ✓ Revised workflow section to explain BudgetBee's approach
   - ✓ Updated call-to-action with appropriate messaging
3. [x] Establish blog content structure with TOFU/MOFU strategy _(Completed: May 24, 2025)_
   - **Important:** Follow TOFU (Top of Funnel) and MOFU (Middle of Funnel) content strategy from `src/lib/documents/CONTENT-GUIDELINES.md`
   - ✓ Created comprehensive category structure based on UK TopFinanzas analysis
   - ✓ Implemented TOFU categories (personal-finance, budgeting-basics, financial-literacy, money-management, financial-planning)
   - ✓ Implemented MOFU categories (financial-solutions, credit-cards, personal-loans, banking-products, investment-products)
   - ✓ Added supporting categories (reviews, comparisons, guides, tools)
   - ✓ Created dynamic category pages with SEO optimization
   - ✓ Implemented category pagination system
   - ✓ Documented category structure in `src/lib/documents/BLOG-CATEGORY-STRUCTURE.md`
   - ✓ Ready for content migration from UK TopFinanzas in next iteration
4. [x] Create real blog posts about budgeting/finance _(Completed: May 24, 2025)_
   - **Important:** Reference `.clinerules/5-BRANDING.md` for content tone (engaging, relatable, encouraging) and target audience (Gen-Z/Millennials)
   - ✓ Replaced 5 placeholder blog posts with high-quality financial content
   - ✓ Adapted content from UK TopFinanzas site for US market
   - ✓ Applied BudgetBee brand voice and tone guidelines
   - ✓ Created balanced TOFU/MOFU content across categories:
     - Personal Finance: "Your Practical Guide to Getting Out of Debt" (TOFU)
     - Financial Literacy: "Understanding Credit Card Interest Rates" (TOFU)
     - Credit Cards: "Best Cashback Credit Cards" (MOFU)
     - Credit Cards: "Top Rewards Credit Cards" (MOFU)
     - Financial Solutions: "Personal Loans: Strategic Debt Management" (MOFU)
   - ✓ Localized currency, regulatory references, and terminology for US market
   - ✓ Maintained original image URLs as specified for future replacement
   - ✓ Properly categorized and tagged content according to blog structure
5. [x] Implement Credit Card Quiz System _(Completed: May 26, 2025)_
   - ✓ Created multi-step quiz interface adapted from UK TopFinanzas
   - ✓ Built React components with Framer Motion animations
   - ✓ Implemented 3-step questionnaire: preferences, income, and user details
   - ✓ Added US localization (currency, phone format validation)
   - ✓ Integrated cookie-based user tracking for returning visitors
   - ✓ Quiz redirects to credit-card-recommender-p1 page instead of blog articles
   - ✓ Updated navigation menu to feature "Credit Card Quiz"
   - ✓ Added quiz CTA to homepage banner and services section
6. [x] Create Categories Page _(Completed: May 26, 2025)_
   - ✓ Built dedicated categories page at /categories
   - ✓ Replaced dropdown menu with direct link to categories page
   - ✓ Designed attractive category cards with icons and descriptions
   - ✓ Applied BudgetBee brand colors to category cards
   - ✓ Added call-to-action section promoting the quiz
7. [x] Fix mobile responsiveness issues _(Completed: May 26, 2025)_
   - ✓ Fixed blog article overflow on mobile devices
   - ✓ Enhanced mobile-optimizations.css with comprehensive responsive fixes
   - ✓ Created blog-mobile.css for blog-specific mobile styling
   - ✓ Updated PostSingle layout with better responsive classes
   - ✓ Implemented proper word-wrapping and overflow handling
   - ✓ Fixed responsive display of tables, code blocks, and images
   - ✓ Added touch-friendly scrolling for horizontal content
8. [In Progress] Migrate marketing-related components and custom scripts from TopFinanzas UK Blog to BudgetBee AstroJS project. _(Started: May 26, 2025)_
   - **Important:** Analyze TopFinanzas UK Blog source, identify marketing integrations (Google Tag, third-party tools), analyze complex components (e.g., UTM Persister), and adapt/implement them into BudgetBee AstroJS, using official documentation for guidance (e.g., Google Analytics, Ad Manager via @upstash/context7-mcp).
9. [ ] Design and implement BudgetBee-specific features
   - **Important:** Align with brand personality and competitive differentiation outlined in `.clinerules/5-BRANDING.md` - focus on unbiased, free, and accessible features
10. [ ] Update images and visual assets
    - **Important:** Use color palette from `.clinerules/5-BRANDING.md` - Warm Yellow (#E7B739), Fresh Green (#7ED321), Soft Blue (#4A90E2), Light Gray (#F5F5F5)

11. [x] Configure contact form endpoint (Sep 11, 2025) — Implemented `/api/contact` using Brevo REST APIs; requires `BREVO_API_KEY`, `SENDER_EMAIL`, `RECIPIENT_EMAIL`, and supports optional sandbox flag plus SMTP fallback envs.
12. [ ] Set up proper domain and base URL
13. [x] Fix ad unit visibility and CTA styling regressions _(Completed: Sep 1, 2025)_

- Created shortcode `AdZoneTop3` and auto-injected `id="us_budgetbeepro_3"` directly below the H1 for posts in Personal Finance and Financial Solutions.
- Normalized category matching in `PostSingle.astro` to avoid casing/spacing mismatches.
- Standardized MDX link/CTA styles: inline links stay brand yellow/underlined; `.btn` CTAs are not underlined; ensured ad iframes size naturally.

1. [ ] Implement GPT SPA lifecycle for Astro ads _(Added: Oct 2, 2025)_
   - Integrate Google Publisher Tags with manual load disabled.
   - Refresh or recreate ad slots on route change with updated correlator/URL.
   - Destroy obsolete ad slots during navigation cleanup.
   - Ensure ads render automatically without manual refresh on navigation.

2. [ ] Simplify credit card recommender CTAs to single-click flows _(Added: Oct 2, 2025)_
   - Refactor `credit-card-recommender-p2.astro` and `credit-card-recommender-p3.astro` to remove reveal steps.
   - Implement direct CTA buttons aligned with `credit-card-recommender-p1.astro` experience.
   - Ensure brand styling and ad placements remain consistent across pages.

3. [x] Publish TOFU article: "How to Confidently Ask for a Raise (with Scripts and a Preparation Guide)" _(Completed: Oct 3, 2025)_
   - Added a personal-finance post with preparation steps, ready-to-use scripts, and internal links supporting the Money Management pillar.

4. [x] Push latest local changes to remote _(Completed: Oct 3, 2025)_
   - Followed `.github/instructions/project-rules.instructions.md` workflow by clearing commit message, checking repo status, and running `pnpm workflow` with merges.

5. [x] Migrate contact form integration to Brevo _(Completed: Oct 7, 2025)_
   - Replaced SendGrid usage in `/src/pages/api/contact.ts` with Brevo contact creation and transactional email.
   - Ensured new contacts are added to Brevo `listIds` `[7, 5]`.
   - Preserved admin notification flow (SMTP fallback) and updated docs/ENV references.

## Technical Improvements Needed

1. [ ] Implement actual budgeting features (if this is a budgeting app)
2. [ ] Add user authentication system (if needed)
3. [ ] Create budget tracking components
4. [ ] Integrate with financial APIs (if applicable)
5. [ ] Add data visualization for budgets
6. [ ] Implement user dashboard
