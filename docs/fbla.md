# FBLA study reference

[Development guide](development.md) · [FBLA page](../website/public/fbla.html)

## Source and build

`website/scripts/fbla.mjs` validates and renders the ten structured modules in `website/scripts/fbla-content/`, the hub, four event pages and the original plaintext pilot at `website/public/notes/fbla/ipv4-subnetting.txt`. Run the normal build from `website/`; edit source JSON and generators rather than generated course pages or downloads.

Each structured course sheet renders to 48 ASCII lines in two 24-line pages. The plain and marked text files are generated from the same data; section sources, objective mappings, practice answers, lab instructions and limitations remain available outside the finite printable bodies. Downloads are embedded for offline use, and the preview build includes all four event pages and note encodings.

FBLA event pages use the same `.notes-site`, `.pages` and `.sheet` presentation as AP World, AP Lang and Algebra: warm-white paper, ruled rows, 9px line numbers, Georgia notes, shared captions and responsive spacing. Maintain the common component in `website/public/styles/site.css`, not a separate set of FBLA typography rules. The shared named print page preserves A4 sheets while keeping pagination rules away from the other site sections.

## How the curriculum works

The hub leads with a repeatable study loop: choose an event and sheet, open its **Sources, practice, lab and scope notes**, attempt practice before revealing answers, use the matching event subdeck for recall, then apply the idea in a lab or spoken rehearsal. Card order is not a lesson sequence. The same module lab can appear under several sheets; it is not a new assignment each time. The IPv4 example is an optional demonstration, not the mandatory starting lesson. Experienced students can attempt practice first and use the notes to close gaps.

The scheduling guidance uses flexible stages rather than assuming a fixed preparation period, state or prior qualification. Regional deadlines and entry rules take priority. The website works without the optional Anki package and does not track personal scores or synchronize Anki. The 654-card package stays in the private delivery channel, not the public site; public copy must not imply that every visitor has received it.

### What the 17 rehearsal flags mean

`website/scripts/fbla-rehearsal.json` records the instructional subset of the completed private audit marked for external rehearsal: **8 Network Design items** (`ND-NSR-02` plus `ND-RP-01` through `ND-RP-07`) and **9 Sales items** (`SP-R-01` through `SP-R-04`, and `SP-R-06` through `SP-R-10`). These are local review categories, not missing lessons, official extra tasks, learner scores, or a prescription for 17 sessions. One run-through can exercise multiple criteria. Other skills still need practice even when they are not in this category.

Each item links to an existing related sheet and names a concrete practice action. The build verifies the event, sheet and objective mapping. Do not publish private card GUIDs, candidate reviews or personal performance evidence with this list. The full source ledger is reference material, not the learning sequence.

Present this section to learners as **17 practice skills**, not as a conversation-specific question about “requirements” or a report of an internal review. Use “study reference” for IDs. Keep development/audit history in maintainer documentation; the landing page should stand alone for a new visitor, including someone without Anki or networking experience.

Use American English in instructional copy, including **practice**, **practiced**, and **practicing** for both the noun and verb forms.

## Review limits

All four event pages link the National 2026–27 CONNECT guideline PDFs. All 160 objective entries have been content-reviewed and mapped; their IDs are local study mappings, not official FBLA identifiers. The source ledger records objective coverage ranges, reading scopes, source links, and unresolved guideline ambiguities. Technical readings are not claimed as exhaustive or independently normative verification of every fact, and the site does not certify exam readiness. Companion deck review is complete as a separate workstream; neither review certifies individual mastery or exam readiness.

The subnetting pilot addresses portions of locally indexed NI-NB-07 and ND-NIC-07. Those labels are local study identifiers, not official FBLA IDs. It does not complete either event or guarantee exam preparation. Its original examples use RFC 5737 documentation ranges. RFC 4632 supports classless prefixes, RFC 3021 establishes the /31 point-to-point exception, and the cited Cisco reference supplies additional subnetting context.

Keep recall prompts distinct from the answer key. Do not replace the /31 exception with an unconditional subtract-two formula, infer a modern subnet mask from a historical address class, or require hundreds of simulator PCs merely to demonstrate subnet sizing.

## Privacy and publication

Only original instructional content and public references belong in the site. Keep personal mastery, scores, mistake logs, private classroom/test-bank material, laptop setup files, credentials, and local research drafts outside this public repository. A content candidate index is not proof of semantic coverage or personal mastery.

The companion Anki deck was reviewed and revised in a separate private workstream after the website checks passed. Its package, individual-card audit records, source-health report, and personal logs are not public repository assets. Website mappings do not certify personal mastery, exhaustive independent verification, or performance on future questions.

## Checks

Run the documented `npm run build`, `npm run validate`, and browser suite. FBLA checks cover fixed counts, generated notes, source-ledger mappings, event navigation, local downloads, responsive keyboard disclosure, offline file loading, accessibility outside the already-documented palette contrast exception, and physical PDF page totals. Hub regressions cover the exact 8/9 rehearsal split, working related-sheet anchors, 320px expanded-ledger layout in both directions, consistent audit status and printed answers/rehearsal content while disclosures remain closed. Expand the reference ledger before printing if its full records are wanted. Changes must preserve the existing subjects and custom domain.
