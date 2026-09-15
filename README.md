# AI Concepts

A visual ML and deep-learning atlas built around motivating questions, derivations, worked examples, interactive graphics and connected prerequisites.

**Live:** https://mobile-dev.tail55f864.ts.net/concepts/ (on the private Tailscale network)

55 lessons cover the 26 named keyword entries in the current ATDL written notes, their mathematical foundations, and introductory learning-theory and generative-modeling connections. See the site's Sources page for the coverage map. Additional attached textbooks and papers are supporting references; this is not a claim of exhaustive textbook coverage.

## Run

```sh
npm ci
npm run dev
```

Open http://localhost:4173. Production needs only the files in `public/`; no server process, build step or external runtime assets are required.

## Check

```sh
npm run check
npm test
# NixOS: use Nix-provided Chromium
nix shell nixpkgs#chromium -c bash -c 'PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH="$(command -v chromium)" npm run test:browser'
```

Browser tests exercise all lessons at phone width, interactive numerical examples, search, navigation, recall and progress. They also capture screenshots under ignored `test-results/`. Pass `ATLAS_URL=https://mobile-dev.tail55f864.ts.net/concepts/` to test the deployment.

## Add ideas

Follow [AGENTS.md](AGENTS.md). Content lives in `public/concepts.json`; written-note coverage in `public/coverage.json`; reusable visualizations in `public/visuals.js`. `npm run vault:scan` reports source changes without publishing raw notes or changing the vault.

Progress is stored locally in the browser. The site does not synchronize progress between devices. Historical sections distinguish documented motivation from a teaching reconstruction; toy visuals are labeled as such.

## Deployment

`/home/hjalte/.dotfiles/pkgs/ai-concepts.nix` pins a tested commit, and `nixos/mobile-dev.nix` serves it at `/concepts/`. VPS Hub has its own committed manifest entry. After changing either pinned source, update the Nix revision and run `nxb`, then check the live HTTPS route.
