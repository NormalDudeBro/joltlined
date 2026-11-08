# FBLA study reference

[Development guide](development.md) · [FBLA page](../website/public/fbla.html)

## Source and build

`website/scripts/fbla.mjs` validates and renders the ten structured modules in `website/scripts/fbla-content/`, the hub, four event pages and the original plaintext pilot at `website/public/notes/fbla/ipv4-subnetting.txt`. Run the normal build from `website/`; edit source JSON and generators rather than generated course pages or downloads.

Each structured course sheet renders to 48 ASCII lines in two 24-line pages. The plain and marked text files are generated from the same data; section sources, objective mappings, practice answers, lab instructions and limitations remain available outside the finite printable bodies. Downloads are embedded for offline use, and the preview build includes all four event pages and note encodings.

## Evidence and scope

All four event pages link the National 2026–27 CONNECT guideline PDFs. All 160 objective entries have been content-reviewed and mapped; their IDs are local study mappings, not official FBLA identifiers. The source ledger records objective coverage ranges, reading scopes, source links, and unresolved guideline ambiguities. Technical readings are not claimed as exhaustive or independently normative verification of every fact, and the site does not certify exam readiness. Companion deck review is complete as a separate workstream; neither review certifies individual mastery or exam readiness.

The subnetting pilot addresses portions of locally indexed NI-NB-07 and ND-NIC-07. Those labels are local study identifiers, not official FBLA IDs. It does not complete either event or guarantee exam preparation. Its original examples use RFC 5737 documentation ranges. RFC 4632 supports classless prefixes, RFC 3021 establishes the /31 point-to-point exception, and the cited Cisco reference supplies additional subnetting context.

Keep recall prompts distinct from the answer key. Do not replace the /31 exception with an unconditional subtract-two formula, infer a modern subnet mask from a historical address class, or require hundreds of simulator PCs merely to demonstrate subnet sizing.

## Privacy and publication

Only original instructional content and public references belong in the site. Keep personal mastery, scores, mistake logs, private classroom/test-bank material, laptop setup files, credentials, and local research drafts outside this public repository. A content candidate index is not proof of semantic coverage or personal mastery.

The companion Anki deck was reviewed and revised in a separate private workstream after the website checks passed. Its package, individual-card audit records, source-health report, and personal logs are not public repository assets. Website mappings do not certify personal mastery, exhaustive independent verification, or performance on future questions.

## Checks

Run the documented `npm run build`, `npm run validate`, and browser suite. FBLA checks cover fixed counts, generated notes, source-ledger mappings, event navigation, local downloads, responsive keyboard disclosure, offline file loading, accessibility outside the already-documented palette contrast exception, and physical PDF page totals. Changes must preserve the existing subjects and custom domain.
