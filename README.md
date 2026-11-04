<p align="center">
  <img src="docs/assets/banner.svg" alt="Joltlined — notes, ideas, and close reading" width="900">
</p>

<p align="center">
  An orderly place to study a subject, follow an argument, or return to a story.
</p>

<p align="center">
  <a href="https://github.com/NormalDudeBro/outofmymind/actions/workflows/quality.yml"><img src="https://github.com/NormalDudeBro/outofmymind/actions/workflows/quality.yml/badge.svg" alt="Quality workflow status"></a>
  <img src="https://img.shields.io/badge/site-static_HTML-213749" alt="Static HTML site">
  <img src="https://img.shields.io/badge/reading-offline_ready-168438" alt="Offline-ready reading">
</p>

<p align="center">
  <a href="https://www.joltlined.com"><strong>Explore the collection ↗</strong></a>
  &nbsp; · &nbsp;
  <a href="docs/development.md">Development guide</a>
  &nbsp; · &nbsp;
  <a href="docs/technical-reference.md">Technical reference</a>
</p>

---

**Joltlined** brings course notes, worked examples, and literary analysis together in a quiet, paper-inspired study collection. It includes three course-note collections and three reading companions. The pages use local assets and system fonts, work without JavaScript, and can be kept for offline reading or printing.

## The collection

| Collection | Contents | Print notes |
| --- | --- | --- |
| [AP English Language](website/public/ap-lang.html) | Unit 1: rhetorical situation, a writer’s choices, evidence, and audience | 4 pages |
| [AP World History](website/public/ap-world.html) | Units 1–3: The Global Tapestry, Networks of Exchange, and Land-Based Empires | 40 pages · 18 official topics + 2 supplements |
| [Algebra 2](website/public/algebra-2.html) | Modules 1B and 2A: functions, transformations, linear systems, and optimization | 26 pages · 13 lessons |
| [Out of My Mind](website/public/out-of-my-mind.html) | A reading companion to Sharon M. Draper’s novel | — |
| [Of Mice and Men](website/public/of-mice-and-men.html) | A reading companion to John Steinbeck’s novella | — |
| [Fahrenheit 451](website/public/fahrenheit-451.html) | A reading companion to Ray Bradbury’s novel | — |

The collection is designed for independent study: native links and complete HTML documents work over HTTP or directly from files; original and marked plaintext sources are available from notes pages; and print layouts are designed for A4. Unit 3's supplements are keyword-colored using the shared nine-ink palette. The 3.4 comparison sheet introduces orange for revenue and local elites; the earlier topic colors are unchanged. Some approved pastel highlight colors and light-blue headings do not meet WCAG text-contrast requirements. This is a known limitation, not a claim of full WCAG compliance. Original pencil-text plaintext downloads offer an alternative for every notes topic or lesson.

## Getting started

To read locally, download or clone the repository and open [`website/public/index.html`](website/public/index.html). Keep the sibling HTML files and `assets/`, `styles/`, and `notes/` directories together for offline reading. No installation or build is needed. For printing, use A4 portrait, disable browser headers and footers, and enable background graphics to preserve highlight colors.

To work on the collection, use Node.js 24 and npm (the validation tools require Node.js 22.16 or newer). Run all npm commands from `website/`:

```sh
git clone https://github.com/NormalDudeBro/outofmymind.git
cd outofmymind/website
npm ci
npm run build
npm run validate
npx playwright install chromium
npm run test:e2e -- --workers=1
```

The single-worker example keeps local browser memory use modest. `npm test` runs static validation and the browser suite together. See the [development guide](docs/development.md) for the editing workflow and portable previews, and the [technical reference](docs/technical-reference.md) for content, palette, print-layout, and verification details.

The reusable [AP World History master prompt](docs/prompts/ap-world-history.txt) defines full-unit and individual-topic generation, source cross-checking, exact page/line validation, and the current keyword-coloring conventions.

## Repository map

```text
.
├── README.md
├── docs/                 The reading room: guides, reference, and artwork
├── .github/              Quality checks and deployment workflow
└── website/              Site and its tooling
    ├── public/           Seven HTML pages, assets/images/, styles/, notes/, CNAME
    ├── scripts/          Page generators and note importers
    ├── tests/            Content, accessibility, and browser checks
    ├── package.json      Package scripts and dependencies
    ├── package-lock.json
    ├── playwright.config.mjs
    └── .htmlvalidate.json
```

Generated pages are checked in under `website/public/`. Edit note sources and generators, then rebuild; maintain the three literary-analysis pages directly. GitHub Pages is configured to use **GitHub Actions**, publishing only `website/public/` after quality checks pass. The custom domain and public page URLs are unchanged; no application backend or database is required.

These are independent study resources, not official College Board materials or an official answer key. Literary interpretations and practice examples are starting points for your own evidence and reasoning. Check quotations and page references against your edition. See the [technical reference](docs/technical-reference.md) for provenance and verification limits.

Found a broken link, confusing explanation, or content error? [Open an issue](https://github.com/NormalDudeBro/outofmymind/issues) with the page, section, and a source or example where helpful.

No reuse license is currently declared. Do not assume the repository’s text or third-party images are freely licensed; confirm permission before redistributing them.
