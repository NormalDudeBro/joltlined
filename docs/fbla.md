# FBLA study reference

[Development guide](development.md) · [FBLA page](../website/public/fbla.html)

## Source and build

`website/scripts/fbla.mjs` renders the event overview and the original plaintext pilot at `website/public/notes/fbla/ipv4-subnetting.txt`. Run the normal build from `website/`; edit these sources rather than only the generated `fbla.html`.

FBLA uses a flowing reference-page format, not the AP subjects' fixed-length colored sheets. This supports worked addressing examples, semantic ordered lists, a native answer-key disclosure, and an application lab without padding content to a line count. The source remains downloadable, printable, and readable without JavaScript. Offline preview export includes the page and its source file.

## Evidence and scope

The event overview links the accessible reference PDF for each event. The 2026–27 Cybersecurity document is verified; the other three documents are explicitly 2025–26 provisional references, not established current-year rules. Counts are test items listed in the study-guide headings, not chart-axis ticks. Verify later editions before updating their status.

The subnetting pilot addresses portions of locally indexed NI-NB-07 and ND-NIC-07. Those labels are local study identifiers, not official FBLA IDs. It does not complete either event or guarantee exam preparation. Its original examples use RFC 5737 documentation ranges. RFC 4632 supports classless prefixes, RFC 3021 establishes the /31 point-to-point exception, and the cited Cisco reference supplies additional subnetting context.

Keep recall prompts distinct from the answer key. Do not replace the /31 exception with an unconditional subtract-two formula, infer a modern subnet mask from a historical address class, or require hundreds of simulator PCs merely to demonstrate subnet sizing.

## Privacy and publication

Only original instructional content and public references belong in the site. Keep personal mastery, scores, mistake logs, private classroom/test-bank material, laptop setup files, credentials, and local research drafts outside this public repository. A content candidate index is not proof of semantic coverage or personal mastery.

The initial change does not publish an unreviewed Anki package as a complete official syllabus. Existing local deck tags are navigation aids only. Further card changes need a source/objective audit and must preserve existing note identifiers when practical.

## Checks

Run the documented `npm run build`, `npm run validate`, and browser suite. FBLA checks cover source reproducibility, edition labels and item counts, source links, safe rendering, local downloads, mobile layout, keyboard-operated answer disclosure, offline file loading, and automated accessibility. Changes must preserve the existing subjects and custom domain.
