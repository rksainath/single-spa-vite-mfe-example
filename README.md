# single-spa + Vite POC

Three independent React + TypeScript apps wired together with [single-spa](https://single-spa.js.org/) and
[vite-plugin-single-spa](https://github.com/WJSoftware/vite-plugin-single-spa):

- **root-config** (port 9000) — the shell. Renders the top bar and sidebar itself (a regular React app,
  not single-spa managed) and registers/orchestrates the two micro-frontends with `single-spa`.
- **mfe-one** (port 4101) — React micro-frontend mounted at `/mfe-one`.
- **mfe-two** (port 4102) — React micro-frontend mounted at `/mfe-two`.

This follows `vite-plugin-single-spa`'s own conventions rather than single-spa's classic recommendations:
native (`overridable-importmap`) import maps instead of SystemJS, a framework-based (React) root config
instead of a framework-free one, and `cssLifecycleFactory` for per-MFE CSS mount/unmount.

## Install

```bash
npm install
```

(npm workspaces install all three projects' dependencies in one pass.)

## Run

```bash
npm run dev
```

This starts all three Vite dev servers concurrently. Open http://localhost:9000 and use the sidebar to
navigate between MFE One and MFE Two — each is loaded on demand via the import map declared in
`root-config/src/importMap.dev.json`.

Each MFE can also run standalone (mounts its `App` directly, bypassing single-spa) via
`npm run dev -w mfe-one` / `npm run dev -w mfe-two` and visiting its own port directly.

A dev-only "import map overrides" UI (bottom-right popup) is enabled in the root config, letting you swap
any MFE's URL at runtime — e.g. to point `@poc/mfe-one` at a build you're running on a different port.

## Build

```bash
npm run build
```

Builds both MFEs first, then the root config (which inlines `src/importMap.json`). The production import
map currently still points at `localhost`; for real deployment, replace it with the actual hosted URLs.

## Gotcha: loading MFEs by import-map specifier

`root-config/src/main.tsx` loads each MFE with `import(/* @vite-ignore */ someVariable)`, where
`someVariable` holds the bare specifier (e.g. `@poc/mfe-one`) — **not** an inline string literal. Vite's
dev-time import analysis (and Rollup at build time) statically resolve any dynamic `import()` whose
argument is a literal string, which fails because `@poc/mfe-one` isn't a real installed package — it only
exists as a key in the browser's `<script type="overridable-importmap">`. Routing the specifier through a
variable first makes the import non-statically-analyzable, so both tools leave it untouched for the
browser to resolve natively at runtime. `/* @vite-ignore */` alone (without the variable indirection) is
not enough to suppress this.
