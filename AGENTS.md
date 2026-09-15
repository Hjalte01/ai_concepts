# AI Concepts: authoring and maintenance

## Purpose
Build an intuitive, concise, heavily visual concept atlas for ML, deep learning, and their mathematical foundations. The reader wants to understand **why an idea was needed and how to reconstruct it**, not memorize disconnected definitions. Keep a researcher's eye: distinguish definitions, theorems, approximations, observations, and hypotheses.

The canonical repository is `git@github.com:Hjalte01/ai_concepts.git`. The live site is `https://mobile-dev.tail55f864.ts.net/concepts/`, reached from the VPS Hub.

## When the user says “look at the new Obsidian notes”
1. Inspect the current worktree and instructions. The primary vault on this host is `/srv/obsidian-webdav/study/ATDL`. `study/thesis` is secondary; use it when requested. Read access may require `sudo -n`; do not expose credentials or change vault permissions.
2. Run `npm run vault:scan` to compare current SHA-256 hashes with `docs/vault-inventory.json`. This command is read-only and does not overwrite the baseline. Read every added/changed Markdown note, including nested directories. Reconcile removed notes without automatically deleting useful lessons.
3. Extract all named concepts, aliases, equations, conceptual connections and explicit questions. Check Excalidraw text elements and, if compressed, decompress its JSON using `lz-string`; inspect images or strokes when they contain meaningful content. Never treat compressed text as an empty note without checking.
4. Read relevant attached papers/slides for context and factual validation. Do not reinterpret “all notes” as transcribing every word of an attached textbook. Explain coverage accurately and record what was reviewed. Use the supplied paper, not a guessed paper based on an acronym. Extract PDFs with `nix shell nixpkgs#poppler-utils -c pdftotext ...` (use sudo for protected source files).
5. Compare with `public/concepts.json` and `public/coverage.json`. Add or improve lessons and prerequisites instead of creating duplicates. Map every explicit note keyword to a lesson. The inventory tracks source changes; it does not prove conceptual coverage.
6. After reviewing changes, update the inventory with `sudo -n python scripts/scan-vault.py --json > docs/vault-inventory.json`. Keep raw notes, PDF copies, extracted text, personal material and credentials out of this public repository. Scratch imports belong under ignored `.private/` or a private temporary directory.
7. Complete the validation and deployment below. A keyword-only user request uses the same authoring standard without requiring a vault import.

## Lesson standard
`public/concepts.json` is the canonical content source. Each record needs:
- Stable ID, title, category and real prerequisite links.
- The motivating question and a short, intuitive answer.
- A step-by-step derivation or construction, with a readable formula.
- A concrete worked example, not just another abstraction.
- A relevant graphic; make quantities interactive when manipulating them teaches something. Add visual types in `public/visuals.js` as needed. Avoid generic decoration masquerading as an explanation.
- Historical/motivational context backed by the original paper, author or authoritative teaching source. Teaching reconstructions are not invented biographical anecdotes.
- Assumptions, limitations and a likely misconception.
- A retrieval question with a correct explanatory answer.

Follow the user's preferred chain: probability → surprise (−log p) → expected surprise / entropy → cross-entropy → KL as extra cost → joint/conditional entropy → mutual information → information bottleneck. “Multiple-entropy” is ambiguous: use precise terms, and clarify if a future request needs a specific multivariate quantity.

Use bits consistently in information examples; label natural-log results as nats. Handle zero probabilities. Do not claim universal compression by SGD, conflate binarized and Bayesian BNNs, treat BDM as exact Kolmogorov complexity, or confuse correlation with predictive quality. Cite historical claims; label toy curves as illustrations rather than experimental results.

## Implementation and checks
The production site is dependency-free static HTML/CSS/ES modules. It runs at a subpath; keep asset URLs relative. No build step or external fonts/scripts are needed. Preserve phone usability, keyboard navigation, SVG descriptions, reduced motion and graceful storage failure. Progress is browser-local, not synchronized across devices.

- `npm ci`
- `npm run check` — schema completeness, coverage links, prerequisite cycles.
- `npm test` — numerical identities and boundaries.
- `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/path/to/chromium npm run test:browser` — all lessons at phone width, navigation, search, controls and persistence. On NixOS use the system/Nix Chromium, not a downloaded incompatible binary; `nix shell nixpkgs#chromium -c ...` is available.
- Inspect actual desktop and mobile screenshots from `test-results/`; passing structural tests is not visual review.
- `npm run dev` serves at port 4173.

## Deploy through NixOS
Keep VPS-specific changes in `/home/hjalte/.dotfiles/nixos/mobile-dev.nix` and the app package `/home/hjalte/.dotfiles/pkgs/ai-concepts.nix`. The static package pins a committed revision from this repository. Hub entries live in `/home/hjalte/documents/vps-hub/public/apps.json`; its Nix package pins a commit too.

After committing tested site changes, update the ai-concepts package revision. If changing hub content, test and commit that repository and update its package revision. Preserve unrelated changes. Stage new Nix files so the flake sees them, run **`nxb`** (source the host metadata and shared bash functions if needed), then verify the real `/concepts/` route and Hub entry over Tailscale HTTPS. Push authorized project commits to GitHub. Do not declare deployment complete from local preview tests alone.
