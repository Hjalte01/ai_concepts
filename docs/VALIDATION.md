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


## Follow-up validation — 2026-09-16

The vault scan still matches the same 31-file snapshot. Refined signal/noise, counterfactual, joint image–mask and feature-distribution graphics to match their lessons directly. Five local browser tests pass, including a new interaction check showing that SNR can fall when the mean gradient shrinks while noise stays fixed.

## Flow paper walkthroughs — 2026-09-18

- Interpreted the requested sequence as Flow Matching (2210.02747), Mean Flows
  for One-step Generative Modeling (2505.13447), and Improved Mean Flows
  (2512.02012). The last is explicitly distinguished from the separate
  Understanding, Accelerating, and Improving MeanFlow Training paper.
- Read the MeanFlow v1 and iMF v2 primary derivations, algorithms and architecture
  details, plus the official iMF implementation. Added links to primary Flow
  Matching, Rectified Flow and DiT sources. No vault import was requested.
- Expanded the existing Flow Matching lesson and added two connected chapters:
  57 complete lessons, 26 unchanged vault keyword mappings, no dependency cycles.
- Added optional math primers, exact trajectory/interval controls, architecture
  maps, a six-stage training microscope, method comparisons and thesis prompts.
- Sampling examples use an exact scalar ODE, explicitly labeled as an oracle.
  Training examples fit one pair with manual stopped-branch gradients; they do
  not reproduce the papers' image experiments or establish relative quality.
- `npm ci`, `npm run check`, seven numerical/interpreter tests and the six-example
  CPython parity check pass. Tests include the MeanFlow identity, interval
  composition, equal-time limits, tangent differences and interpreter limits.
- Eight browser tests pass with Nix Chromium, including all 57 lessons on phone,
  editable output/error/reset/download behavior, navigation, math disclosures,
  keyboard access, reduced-motion mode and unavailable browser storage.
- Inspected actual desktop and phone screenshots of the training microscope and
  editor; full chapter captures are in ignored `test-results/`.
- The downloadable neural-network example passed Python syntax validation.
  PyTorch is not installed in the default environment; its execution is not
  included in the CPython parity claim (which covers the browser examples).
- Added the repository to the Nix deployment registry and validated it with the
  queue's actual `plan_for` function. The existing unrelated `flake.nix` edit is
  preserved and excluded from this task's commits. No Git pushes are performed.
