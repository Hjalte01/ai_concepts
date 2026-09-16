# Validation and coverage — 2026-09-15

## Source audit

- Inventoried all 31 files under the live `study/ATDL` vault (hashes in `vault-inventory.json`).
- Read all three Markdown files: the root reflection prompt, topic 1 notes, and topic 2 Excalidraw document.
- Decompressed the Excalidraw data: two `freedraw` elements; no text/image elements or concept labels.
- Mapped every one of the 26 explicit keyword entries in topic 1 notes to a complete lesson. Root reflection prompts inform the retrieval practice and Sources page.
- Read extracted course-slide context and the first two pages of all PDF references to identify the supplied works; used relevant notes, slides and primary references to validate the related introductory concepts. Attached books are context, not an exhaustive concept-import target.
- Distinguish DiME counterfactual explanations from MeanFlow one-step generation. Distinguish information-bottleneck objectives from disputed universal training-phase interpretations. Preserve the notes' CTM, MDL and correlation corrections.

## Application checks

- 55 complete content records; no missing prerequisite IDs or cycles.
- All 26 note keyword mappings resolve.
- Numerical tests cover coding identities, asymmetric KL, impossible outcomes, zero-mass support, binary-channel information and optimization stability.
- Browser suite visits every lesson at 390px width, verifies formulas and recall answers, checks page errors and horizontal overflow, and exercises search aliases, category filtering, KL controls, local progress, paths, map, sources, history and unknown routes.
- Desktop and mobile screenshots reviewed. Corrected the brand mark and exposed prerequisite links on mobile.
- Hub's existing 8 tests pass with the added application entry.

## Live deployment verification

- `nxb` built and activated the mobile-dev configuration successfully.
- HTTPS `/concepts/` serves the atlas; `/concepts` redirects to `/concepts/` with HTTP 308.
- Served `concepts.json` is byte-identical to the committed source.
- Live Hub registry includes the AI Concepts entry; a real browser observed its **Available** state, clicked the card and opened the atlas.
- All four browser tests passed against `https://mobile-dev.tail55f864.ts.net/concepts/`, including all 55 lessons at phone width.
- Live mobile screenshot inspected with the shared Hub navigation present.
- Live testing initially exposed an ambiguous test selector: the Hub's shadow-root app switcher has its own search input. The test now selects the atlas search box by its accessible name. Production search behavior was unaffected.
- `nginx` is active. Static assets are deployed into the Nix store; no development server is required to keep the site available.

