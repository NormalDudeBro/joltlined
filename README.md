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
  <a href="#getting-started">Get started</a>
  &nbsp; · &nbsp;
  <a href="docs/development.md">Development guide</a>
</p>

---

## A collection for curious minds

**Joltlined** brings course notes, worked examples, and literary analysis together in a quiet, paper-inspired study collection. Originally centered on *Out of My Mind*, it now includes three course-note collections and two reading companions.

The site uses local assets and system fonts, with no runtime dependencies. Read every page without JavaScript, keep a copy for offline use, or print the notes for your study binder.

## On the bookshelf

| Collection | What you’ll find | Print notes |
| --- | --- | --- |
| [AP English Language](ap-lang.html) | Unit 1: rhetorical situation, a writer’s choices, evidence, and audience | 4 pages |
| [AP World History](ap-world.html) | Units 1–3: The Global Tapestry, Networks of Exchange, and Land-Based Empires | 36 pages · 18 topics |
| [Algebra 2](algebra-2.html) | Modules 1B and 2A: functions, transformations, linear systems, and optimization | 26 pages · 13 lessons |
| [Out of My Mind](out-of-my-mind.html) | A reading companion to Sharon M. Draper’s novel: character, context, perspective, and theme | — |
| [Of Mice and Men](of-mice-and-men.html) | A reading companion to John Steinbeck’s novella, organized around active-reading prompts | — |

### Made for studying

- **Read anywhere.** Native links and complete HTML documents work over HTTP or directly from your files.
- **Choose your notes.** Download original or color-marked plaintext sources from each notes page.
- **Print with intention.** A4 layouts use 24 note lines per page for AP subjects and 29 for Algebra 2.
- **Stay oriented.** Shared subject navigation, section links, skip links, and visible keyboard focus help you find your place.

## Getting started

### Just want to read?

Visit **[www.joltlined.com](https://www.joltlined.com)**, or [download the repository](https://github.com/NormalDudeBro/outofmymind/archive/refs/heads/main.zip), extract it, and open `index.html` in your browser. Keep the sibling HTML files and the `assets/`, `styles/`, and `notes/` directories together for offline reading. No installation or build is needed.

For printed notes, use **A4 portrait**, disable browser headers and footers, and enable background graphics to preserve the highlight colors.

### Working on the collection?

Use **Node.js 24** and npm. The validation tools require Node.js **22.16 or newer**.

```sh
git clone https://github.com/NormalDudeBro/outofmymind.git
cd outofmymind
npm ci
npm run build
npm run validate
```

To run the browser tests as well:

```sh
npx playwright install chromium
npm run test:e2e -- --workers=1
```

The single-worker example keeps local browser memory use modest. `npm test` runs static validation and the browser suite together.

See the **[development guide](docs/development.md)** for imports, portable previews, and the editing workflow. The **[technical reference](docs/technical-reference.md)** preserves the detailed content, palette, print-layout, and test specifications.

## Repository map

```text
.
├── index.html                 Collection home
├── ap-*.html                  AP subject notes
├── algebra-2.html             Algebra notes
├── out-of-my-mind.html        Draper reading companion
├── of-mice-and-men.html       Steinbeck reading companion
├── assets/images/             Local book and analysis images
├── notes/                     Original and color-marked note sources
├── styles/                    Shared site styling
├── scripts/                   Page generators and note importers
├── tests/                     Content, accessibility, and browser checks
├── docs/                      Maintainer guides and README artwork
└── .github/workflows/         Automated quality checks
```

Generated pages are checked in so GitHub Pages can serve the collection directly. Edit note sources and generators, then rebuild; maintain the two literary-analysis pages directly. The existing custom domain and deployment configuration are unchanged.

## Accessibility & content notes

The collection provides semantic structure, keyboard navigation, and complete no-JavaScript reading. **Some approved pastel highlight colors and light-blue headings do not meet WCAG text-contrast requirements.** This is a known limitation, not a claim of full WCAG compliance. Original pencil-only plaintext downloads offer an alternative for every notes topic or lesson.

These are independent study resources, not official College Board materials or an official answer key. Literary interpretations and practice examples are starting points for your own evidence and reasoning. Check quotations and page references against your edition. See the [technical reference](docs/technical-reference.md) for provenance and verification limits.

## Feedback & reuse

Found a broken link, a confusing explanation, or a content error? [Open an issue](https://github.com/NormalDudeBro/outofmymind/issues) with the page, section, and a source or example where helpful.

No reuse license is currently declared. Don’t assume the repository’s text or third-party images are freely licensed; confirm permission before redistributing them.
