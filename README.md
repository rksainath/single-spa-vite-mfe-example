# single-spa + Vite POC

Three independent React + TypeScript apps wired together with [single-spa](https://single-spa.js.org/) and
[vite-plugin-single-spa](https://github.com/WJSoftware/vite-plugin-single-spa):

- **root-config** (port 9000) — the shell. Renders the top bar and sidebar itself (a regular React app,
  not single-spa managed), uses `react-router-dom` for its own navigation/active-link state, and
  registers/orchestrates the two micro-frontends with `single-spa`.
- **mfe-one** (port 4101) — React micro-frontend mounted at `/mfe-one`.
- **mfe-two** (port 4102) — React micro-frontend mounted at `/mfe-two`.
- **shared** (`@poc/shared-store`) — not served, not a single-spa app; a plain workspace package holding
  the Redux Toolkit store both MFEs read from (`store/store.ts`, `store/rootReducer.ts`,
  `features/*/slice.ts`), mirroring the `store.ts`/`rootReducer.ts`/`slice.ts` layout used by real
  enterprise Redux apps.

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

## How the shell's router and single-spa's routing coexist

`root-config` wraps `<Shell />` in a `react-router-dom` `<BrowserRouter>` ([main.tsx](root-config/src/main.tsx)),
and `Sidebar.tsx` uses `<NavLink>` instead of plain `<a href>`. This works alongside — not instead of —
single-spa's own routing (`activeWhen` in `main.tsx`) because of how each side reacts to URL changes:

- `react-router-dom`'s `BrowserRouter` listens for the browser's `popstate` event to know when to
  re-render with a new location.
- `single-spa` monkey-patches `window.history.pushState`/`replaceState` (see `historyApiIsPatched` in
  `single-spa`'s source) and, after calling through to the native method, manually dispatches a
  synthetic `popstate` event — because the browser does **not** natively fire `popstate` on
  `pushState`/`replaceState` calls (only on actual back/forward navigation).

So whether navigation is triggered by clicking a `NavLink` (which calls `history.pushState` under the
hood) or by the browser's back/forward buttons, single-spa's patch ensures a `popstate` event fires
either way — keeping `react-router`'s `useLocation`/`NavLink` state and single-spa's `activeWhen`
matching perfectly in sync, with neither needing to know about the other. This is also why `Shell.tsx`
no longer needs a manual `single-spa:routing-event` listener: `react-router-dom` already re-renders on
every relevant navigation, sourced from the same underlying event single-spa relies on.

## Sharing state across the single-spa boundary (`@poc/shared-store`)

Switching MFEs fully unmounts the outgoing one and mounts a fresh instance of the next one — that's
single-spa's `unmount`/`mount` lifecycle (see `single-spa-react`'s source), not a bug. Any state held in
a `useState` inside `mfe-one`'s or `mfe-two`'s `App` is destroyed when you navigate away and recreated
from scratch when you come back.

**Why a shared React Context doesn't fix this:** each MFE mounts into its own independent React root
(`ReactDOMClient.createRoot`, called inside `single-spa-react`) — it is never a descendant of
`root-config`'s own React tree. Context can't cross between two separately-created roots no matter
which one defines the `Provider`, so wrapping `<Shell />` in a `<Provider>` would be invisible to the
MFEs.

**The actual mechanism — `customProps`:** `registerApplication`'s `customProps` (set once in
[main.tsx](root-config/src/main.tsx)) is merged by single-spa core into the props object passed to
every lifecycle call, and `single-spa-react` forwards that object directly as React props onto the
MFE's root component. That's the only thing that legitimately crosses the app boundary here — a plain
object reference, not Context.

So the store itself is created **once**, in `root-config`, and handed to both MFEs as a `store` prop:

```
root-config (main.tsx)
  const store = createAppStore()          // @poc/shared-store, created once, survives every reroute
  registerApplication({ ..., customProps: { store } })   // mfe-one
  registerApplication({ ..., customProps: { store } })   // mfe-two
```

Each MFE then wraps **its own** tree with **its own** bundled `react-redux`'s `<Provider store={store}>`
(`mfe-one/src/App.tsx`, `mfe-two/src/App.tsx`) — this is safe even though Context still can't cross the
boundary, because the `Provider` and its `useSelector`/`useDispatch` consumers all live inside that one
MFE's own tree. Only the `store` object itself (held outside React, in `root-config`'s module scope)
needs to survive the remount, and it does — unmounting an MFE doesn't touch `root-config`, so the store
is still there, with the same data, the next time that MFE mounts.

Running an MFE standalone (`npm run dev -w mfe-one`, bypassing single-spa entirely) has no
`customProps`, so `standalone.tsx` creates its own throwaway store via the same `createAppStore()`
factory instead.
