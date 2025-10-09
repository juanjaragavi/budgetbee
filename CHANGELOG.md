# Changelog

All notable changes to BudgetBee will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Initial project setup based on BudgetBee platform (originally forked from Bigspring Light Astro v3.1.0 theme)
- Project structure and configuration files
- Git workflow automation script
- Development guidelines in `.clinerules/` directory
- CHANGELOG.md file for tracking project changes
- Credit Card Quiz System with multi-step form (May 26, 2025)
- Categories page with organized content structure (May 26, 2025)
- Blog category system with TOFU/MOFU strategy (May 24, 2025)
- 5 high-quality financial blog posts adapted for US market (May 24, 2025)
- Mobile-specific CSS optimizations for blog content (May 26, 2025)
- Blog-specific mobile styles (`blog-mobile.css`) (May 26, 2025)
- Started migration of marketing-related components and custom scripts (e.g., Google Tag Manager, UTM persister) from TopFinanzas UK. (May 26, 2025)
- Added AdZep ad units us_budgetbeepro_3 (post-top) and us_budgetbeepro_4 (in-article fallback) to all Personal Finance (TOFU/MOFU) articles by updating PostSingle layout with category-normalized detection. (Sep 1, 2025)
- Contact form backend endpoint at `/api/contact` implemented with Brevo REST APIs, including contact list sync, HTML/text templates, reply-to handling, and env-configurable sender/recipient. (Oct 7, 2025)

### Changed

- Transformed original theme structure to BudgetBee financial platform
- Updated site branding to BudgetBee (logo, colors, typography) (May 24, 2025)
- Replaced homepage placeholder content with financial focus (May 24, 2025)
- Updated footer with legal texts and proper navigation (May 24, 2025)
- Enhanced PostSingle layout for better mobile responsiveness (May 26, 2025)
- Improved mobile CSS with comprehensive overflow fixes (May 26, 2025)
- Migrated `/api/contact` service from Twilio SendGrid to Brevo, syncing submitters to Brevo lists `[7, 5]` and using Brevo transactional email with SMTP fallback. (Oct 7, 2025)

### Fixed

- Mobile viewport overflow issues in blog articles (May 26, 2025)
- Responsive display of tables, code blocks, and images (May 26, 2025)
- Touch-friendly scrolling for horizontal content (May 26, 2025)
- Corrected three external financial solution links (Chase Freedom Unlimited, Current Build Visa Signature, Wells Fargo Autograph) to updated official URLs (Aug 15, 2025)
- Vertically centered text for all CTA buttons sitewide by applying flex items-center justify-center to base .btn Tailwind class (Aug 26, 2025)
- Ensured AdZep ad activation on SPA/transitions by adding an Astro client lifecycle bridge that listens to `astro:page-load`/`astro:after-swap` (plus safety nets) and calls `window.AdZepActivateAds()` only when ad units are present. Integrated site-wide via Base.astro and verified with the AdZep Debug Panel. (Sep 4, 2025)
- AdZep not triggering on direct blog/article loads due to early-return in article bootstrap; removed premature guard so activation schedules even if slots mount slightly later. Verified on `financial-solutions/amazon-rewards-visa-credit-card-benefits`. (Sep 10, 2025)
- Normalized quiz registration timestamps to `America/Bogota (GMT-5)` and shared the formatter across client/server so Google Sheets records match the required local time. (Oct 9, 2025)

### To Do

- Design and implement BudgetBee-specific features
- Update images and visual assets
- Verify Brevo sender domain and adjust `SENDER_EMAIL`/`RECIPIENT_EMAIL` per environment
- Set up proper domain and base URL

---

## Version History

### [0.1.0] - 2025-05-23

- Initial setup of BudgetBee platform
- Project initialization with placeholder content
