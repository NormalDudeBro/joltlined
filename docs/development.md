# Working on Joltlined

[Back to the README](../README.md) · [Technical reference](technical-reference.md)

## Setup and checks

Use Node.js 24 and npm. The generator itself supports Node 20+, but the pinned validation tools require Node 22.16+. Run every npm command from `website/`:

```sh
npm ci
npm run build
npm run validate
npx playwright install chromium
npm run test:e2e -- --workers=1
```

| Command | Purpose |
| --- | --- |
| `npm run build` | Validate note sources and regenerate Home and the three subject pages |
| `npm run validate` | Run HTML validation (`public/*.html`) and static/content checks without launching a browser |
| `npm run test:e2e -- --workers=1` | Run the Playwright suite with one browser worker |
| `npm test` | Run static validation, then the browser suite |

The **Quality** GitHub Actions workflow runs on pushes to `main` and on pull requests. Browser coverage includes navigation, offline reading, downloads, accessibility checks, and physical PDF page counts. Detailed coverage and known exceptions are in the [technical reference](technical-reference.md#verification).

## What to edit

- **Course content:** edit original and corresponding `Colored/` sources in `website/public/notes/`, preserving the marker rules and subject-specific line counts. Then, from `website/`, run `npm run build`.
- **Generated layout:** edit the appropriate generator in `website/scripts/`, not just its generated HTML output.
- **Literary companions:** edit `website/public/out-of-my-mind.html` and `website/public/of-mice-and-men.html` directly. They are maintained separately, not regenerated from note sources.
- **Shared presentation:** edit `website/public/styles/site.css`, and check every subject and both companions.

Commit regenerated pages alongside the source changes. Keep source text files in LF format as defined in `.gitattributes`; embedded downloads must preserve the source bytes.

## Export an offline preview

Run this from `website/`:

```sh
node scripts/build.mjs --preview "./preview/preview.html"
```

This rebuilds the pages in `public/` and exports an offline copy into the ignored `website/preview/` directory. Open `preview/index.html` for Home. The custom `preview/preview.html` filename opens World notes.

The export includes the sibling subject and literature pages, local images in `assets/images/`, stylesheet, and note sources. Copy the entire export directory, not just a single HTML file. Exports are snapshots: rebuild them after editing sources.

To include an exported preview in browser checks, set `PREVIEW_PATH` to its HTML path in your shell before running the suite.

## Import external World notes

Normal builds use the checked-in notes and need no external files. If importing independently reviewed originals and their marked counterparts, point the importer to the source directories:

```sh
node scripts/build.mjs --unit1 "../source-notes/unit-1" --unit2 "../source-notes/unit-2" --unit3 "../source-notes/unit-3"
```

Relative paths resolve from your current working directory; quote paths containing spaces. The importer validates the expected topics and copies the original and marked text; it does not author or recolor notes. Review imported source changes and generated output before committing.

## Hosting and repository hygiene

GitHub Pages is configured to use **GitHub Actions** as its publishing source. The Quality workflow publishes only `website/public/` after checks succeed, on pushes to `main` or a manual run on `main`; pull requests validate without deploying. For a fork, select GitHub Actions in Settings → Pages → Build and deployment before enabling publication. Preserve `CNAME`, existing page filenames, and relative links. Store site images in `website/public/assets/images/`. Update page references and the preview exporter when adding or renaming images. `website/tests/assets-checks.mjs` verifies the image layout and can check an offline export using `PREVIEW_PATH`.

Keep dependency folders, browser reports, local previews, and editor/OS metadata out of version control. Do not bundle private classroom handouts or add a license for third-party material without confirming permission.
