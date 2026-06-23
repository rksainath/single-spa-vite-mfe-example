# Setup Guide: single-spa + Vite (React) from scratch

This walks through building this exact POC step by step — a single-spa root config (the
"shell") plus two independently deployable React micro-frontends (MFEs), wired together with
[`vite-plugin-single-spa`](https://github.com/WJSoftware/vite-plugin-single-spa). See
[README.md](README.md) for the architecture summary and day-to-day commands; this doc is for
recreating the setup (or understanding why each piece exists).

## Prerequisites

- Node.js 18+ and npm (npm workspaces are used for the monorepo).

## 1. Create the workspace root

```bash
mkdir vite-single-spa && cd vite-single-spa
npm init -y
```

Edit the generated `package.json` to declare the three sub-projects as npm workspaces and add
scripts that run/build all of them together:

```json
{
  "name": "vite-single-spa-poc",
  "private": true,
  "version": "0.0.0",
  "workspaces": ["root-config", "mfe-one", "mfe-two"],
  "scripts": {
    "dev": "concurrently -n root-config,mfe-one,mfe-two -c blue,green,magenta \"npm run dev -w root-config\" \"npm run dev -w mfe-one\" \"npm run dev -w mfe-two\"",
    "build": "npm run build -w mfe-one && npm run build -w mfe-two && npm run build -w root-config"
  },
  "devDependencies": {
    "concurrently": "^10.0.3"
  }
}
```

`concurrently` runs all three Vite dev servers in one terminal with labeled, colored output.
Build order matters: the MFEs must build first since `root-config`'s production import map
points at their built `spa.js` output.

Add a `.gitignore`:

```
node_modules
dist
*.tsbuildinfo
*.local
.DS_Store
```

## 2. Scaffold `root-config` (the shell)

```bash
mkdir -p root-config/src/components
cd root-config
npm init -y
npm install react react-dom react-router-dom single-spa
npm install -D vite @vitejs/plugin-react typescript vite-plugin-single-spa
```

### `package.json` scripts

```json
{
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview --port 9000"
  }
}
```

### `vite.config.ts` — `type: 'root'`

This is the key difference from a normal Vite React app. `vite-plugin-single-spa` in `'root'`
mode emits the native `<script type="overridable-importmap">` tag and (with `imo: true`) the
dev-only import-map-overrides UI:

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import vitePluginSingleSpa from 'vite-plugin-single-spa';

export default defineConfig({
    plugins: [
        react(),
        vitePluginSingleSpa({
            type: 'root',
            imo: true,
            importMaps: {
                dev: 'src/importMap.dev.json',
                build: 'src/importMap.json',
            },
        }),
    ],
    server: { port: 9000 },
});
```

### Import maps

Two JSON files map the bare specifiers used in code to actual URLs — one for dev (pointing at
each MFE's Vite dev server), one for production builds (pointing at built `spa.js` files; swap
these for real hosted URLs when deploying for real):

`src/importMap.dev.json`:
```json
{
    "imports": {
        "@poc/mfe-one": "http://localhost:4101/src/spa.tsx",
        "@poc/mfe-two": "http://localhost:4102/src/spa.tsx"
    }
}
```

`src/importMap.json`:
```json
{
    "imports": {
        "@poc/mfe-one": "http://localhost:4101/spa.js",
        "@poc/mfe-two": "http://localhost:4102/spa.js"
    }
}
```

### `index.html`

Standard Vite entry — the plugin injects the import-map `<script>` automatically:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Single-SPA POC &mdash; Root Config</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### `src/main.tsx` — register the MFEs and render the shell

```tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { registerApplication, start } from 'single-spa';
import Shell from './components/Shell';
import './styles.css';

// Specifiers are kept in variables (rather than inlined as string literals) so that
// Vite's dev-time import analysis and Rollup's build-time bundling both treat these as
// non-statically-analyzable and leave them untouched for the browser's native import map
// to resolve at runtime.
const mfeOneSpecifier = '@poc/mfe-one';
const mfeTwoSpecifier = '@poc/mfe-two';

registerApplication({
    name: '@poc/mfe-one',
    app: () => import(/* @vite-ignore */ mfeOneSpecifier),
    activeWhen: ['/mfe-one'],
});

registerApplication({
    name: '@poc/mfe-two',
    app: () => import(/* @vite-ignore */ mfeTwoSpecifier),
    activeWhen: ['/mfe-two'],
});

start();

createRoot(document.getElementById('app')!).render(
    <React.StrictMode>
        <BrowserRouter>
            <Shell />
        </BrowserRouter>
    </React.StrictMode>,
);
```

`registerApplication`'s `activeWhen` is completely independent of `BrowserRouter` — single-spa watches
the URL itself (see the routing note below), so wrapping the shell in a router doesn't change how or
when the MFEs mount.

> **Gotcha**: writing `import('@poc/mfe-one')` directly (a literal string) breaks both `vite
> dev` and `vite build` — they statically resolve literal dynamic-import specifiers, and
> `@poc/mfe-one` isn't a real installed package, only a runtime import-map key.
> `/* @vite-ignore */` alone doesn't stop this; routing the specifier through a `const`
> variable first does, because then it's no longer statically analyzable.

### Ambient module declarations for TypeScript

TypeScript has no way to know what `@poc/mfe-one` exports, since it's resolved by the browser
at runtime, not by `tsc`/Vite module resolution. Without this, `tsc -b` fails with "Cannot find
module". Add `src/single-spa-apps.d.ts`:

```ts
declare module '@poc/mfe-one' {
    import type { LifeCycles } from 'single-spa';
    export const bootstrap: LifeCycles['bootstrap'];
    export const mount: LifeCycles['mount'];
    export const unmount: LifeCycles['unmount'];
}

declare module '@poc/mfe-two' {
    import type { LifeCycles } from 'single-spa';
    export const bootstrap: LifeCycles['bootstrap'];
    export const mount: LifeCycles['mount'];
    export const unmount: LifeCycles['unmount'];
}
```

### The shell UI: `Shell.tsx`, `TopBar.tsx`, `Sidebar.tsx`, `Welcome.tsx`

`Shell.tsx` is a normal React component (not single-spa-managed) that renders the top bar and
sidebar itself, and provides the `<div id="single-spa-content" />` mount point that
`registerApplication`'s `domElementGetter` (in each MFE) targets. Because `main.tsx` already wraps
it in a `<BrowserRouter>`, the shell can use `react-router-dom`'s own primitives (`<Routes>`,
`<Route>`) for its own pages, instead of hand-rolling path-tracking state:

```tsx
import { Route, Routes } from 'react-router-dom';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import Welcome from './Welcome';

export default function Shell() {
    return (
        <div className="shell">
            <TopBar />
            <div className="shell-body">
                <Sidebar />
                <main className="shell-content">
                    <Routes>
                        <Route path="/" element={<Welcome />} />
                    </Routes>
                    <div id="single-spa-content" />
                </main>
            </div>
        </div>
    );
}
```

```tsx
// src/components/Welcome.tsx
export default function Welcome() {
    return (
        <div className="welcome">
            <h2>Welcome</h2>
            <p>Select a micro-frontend from the sidebar to mount it below.</p>
        </div>
    );
}
```

Note there's no `<Route>` for `/mfe-one` or `/mfe-two` — those paths aren't rendered by
react-router at all. The `<div id="single-spa-content" />` is rendered unconditionally alongside
`<Routes>`, and single-spa mounts/unmounts each MFE into it directly based on `activeWhen`,
entirely outside react-router's render tree.

Sidebar links use `<NavLink>` instead of plain `<a href>`, which computes its own active state
from router context — no manually-tracked `currentPath` prop needed:

```tsx
import { NavLink } from 'react-router-dom';

const links = [
    { to: '/mfe-one', label: 'MFE One' },
    { to: '/mfe-two', label: 'MFE Two' },
];

export default function Sidebar() {
    return (
        <nav className="sidebar">
            <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
                Home
            </NavLink>
            {links.map((link) => (
                <NavLink key={link.to} to={link.to} className={({ isActive }) => (isActive ? 'active' : '')}>
                    {link.label}
                </NavLink>
            ))}
        </nav>
    );
}
```

`end` on the `Home` link matters: without it, `NavLink to="/"` matches *every* path (since every
path starts with `/`), so it would always show as active.

> **Why not a manual `single-spa:routing-event` listener?** That works fine without a router (see
> the [README's routing-coexistence note](README.md#how-the-shells-router-and-single-spas-routing-coexist)),
> but once `react-router-dom` is already wrapping the shell, it's the redundant approach: single-spa
> monkey-patches `history.pushState`/`replaceState` to also dispatch a synthetic `popstate` event,
> which is exactly what `BrowserRouter` listens for to re-render. So `useLocation`/`NavLink` already
> stay in sync with single-spa's reroutes for free, whether navigation was triggered by a `NavLink`
> click, a plain anchor, or the browser's back/forward buttons.

### TypeScript config (solution-style split)

Three files, mirroring Vite's React+TS template: `tsconfig.json` is references-only,
`tsconfig.app.json` covers `src/`, `tsconfig.node.json` covers `vite.config.ts`.

`tsconfig.json`:
```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

`tsconfig.app.json` (key bits): `"jsx": "react-jsx"`, `"moduleResolution": "bundler"`,
`"strict": true`, `"include": ["src"]`.

`tsconfig.node.json`: same strictness, scoped to `"include": ["vite.config.ts"]`.

## 3. Scaffold each MFE (`mfe-one`, `mfe-two`)

Both MFEs follow an identical structure — only the port and UI differ.

```bash
mkdir -p mfe-one/src
cd mfe-one
npm init -y
npm install react react-dom single-spa-react
npm install -D vite @vitejs/plugin-react typescript vite-plugin-single-spa
```

### `package.json` scripts

```json
{
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview --port 4101"
  }
}
```

### `vite.config.ts` — mife mode (the default, no `type` needed)

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import vitePluginSingleSpa from 'vite-plugin-single-spa';

export default defineConfig({
    plugins: [
        react(),
        vitePluginSingleSpa({
            serverPort: 4101,
            spaEntryPoints: 'src/spa.tsx',
            cssStrategy: 'multiMife',
        }),
    ],
});
```

> **Gotcha**: the plugin defaults `spaEntryPoints` to `src/spa.ts`. Since this entry exports
> JSX-producing lifecycles, it must be `.tsx` — set `spaEntryPoints` explicitly or the build
> fails with "Cannot resolve entry module".

`cssStrategy: 'multiMife'` pairs with `cssLifecycleFactory` below so each MFE's CSS is
injected/removed from the page in step with its own mount/unmount, instead of leaking onto
other routes.

### `src/spa.tsx` — the single-spa lifecycle export

This is the module the root config's import map points at. It wraps the plain `App` component
with `single-spa-react`'s lifecycle adapter:

```tsx
import React from 'react';
import ReactDOMClient from 'react-dom/client';
import singleSpaReact from 'single-spa-react';
import { cssLifecycleFactory } from 'vite-plugin-single-spa/ex';
import App from './App';

const cssLifecycles = cssLifecycleFactory('mfe-one');

const reactLifecycles = singleSpaReact({
    React,
    ReactDOMClient,
    rootComponent: App,
    domElementGetter: () => document.getElementById('single-spa-content')!,
    errorBoundary(err: unknown) {
        return <div>Error mounting MFE One: {String(err)}</div>;
    },
});

export const bootstrap = [cssLifecycles.bootstrap, reactLifecycles.bootstrap];
export const mount = [cssLifecycles.mount, reactLifecycles.mount];
export const unmount = [cssLifecycles.unmount, reactLifecycles.unmount];
```

`domElementGetter` targets the `<div id="single-spa-content" />` rendered by `Shell.tsx` in
root-config — that's the contract between shell and MFE.

### `src/App.tsx` — the actual UI (framework-agnostic of single-spa)

```tsx
import { useState } from 'react';
import './App.css';

export default function App() {
    const [count, setCount] = useState(0);
    return (
        <div className="mfe-one">
            <h2>MFE One</h2>
            <button onClick={() => setCount((c) => c + 1)}>Count is {count}</button>
        </div>
    );
}
```

### `src/standalone.tsx` + `index.html` — run the MFE outside single-spa

Useful for developing/testing the MFE in isolation:

```tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

createRoot(document.getElementById('single-spa-content')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
);
```

```html
<!doctype html>
<html lang="en">
  <head><title>mfe-one (standalone)</title></head>
  <body>
    <div id="single-spa-content"></div>
    <script type="module" src="/src/standalone.tsx"></script>
  </body>
</html>
```

### TypeScript config

Same solution-style split as `root-config` (`tsconfig.json` / `tsconfig.app.json` /
`tsconfig.node.json`), no special settings needed since there's no ambient-module concern here.

### Repeat for `mfe-two`

Identical structure — change the package name, `serverPort` (4102), `cssLifecycleFactory('mfe-two')`,
and the `App.tsx` UI (a small todo list in this POC instead of a counter).

## 4. Add a shared Redux store (`shared`)

Switching MFEs unmounts the outgoing one and mounts a fresh instance of the next one — that's
single-spa's lifecycle, not a bug — so any `useState` inside an MFE's `App` resets every time you
navigate away and back. A React Context `Provider` doesn't fix this: each MFE mounts into its own
separate React root (`single-spa-react` calls `ReactDOMClient.createRoot` per MFE), never as a
descendant of `root-config`'s tree, so Context can't cross that boundary regardless of where the
`Provider` lives.

The fix is a plain workspace package holding a Redux Toolkit store, created **once** in
`root-config` and handed to each MFE as a prop — not through Context, but through single-spa's own
`customProps`, which it merges into the props every lifecycle call receives, and which
`single-spa-react` forwards directly onto the MFE's root component.

```bash
mkdir -p shared/src/store shared/src/features/counter shared/src/features/todos
cd shared
npm init -y
npm install @reduxjs/toolkit
npm install -D typescript
```

Name it in `package.json` and point `main`/`types` straight at the TypeScript source — with
`moduleResolution: "bundler"` (already set in every consumer's `tsconfig.app.json`), both `tsc` and
Vite resolve these to the `.ts` file directly, no build step needed for this package:

```json
{
  "name": "@poc/shared-store",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "dependencies": { "@reduxjs/toolkit": "^2.0.0" }
}
```

One slice per feature (`src/features/counter/slice.ts`, `src/features/todos/slice.ts`), combined
into a root reducer, and a factory — not a singleton — so standalone mode and tests can each create
their own isolated instance:

```ts
// src/store/rootReducer.ts
import { combineReducers } from '@reduxjs/toolkit';
import counterReducer from '../features/counter/slice';
import todosReducer from '../features/todos/slice';

const rootReducer = combineReducers({ counter: counterReducer, todos: todosReducer });
export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
```

```ts
// src/store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './rootReducer';

export function createAppStore() {
    return configureStore({ reducer: rootReducer });
}
export type AppStore = ReturnType<typeof createAppStore>;
export type AppDispatch = AppStore['dispatch'];
export type { RootState } from './rootReducer';
```

Add `"shared"` to the root `package.json`'s `workspaces` array, then in `root-config`,
`mfe-one`, and `mfe-two`'s `package.json`, depend on it with `"@poc/shared-store": "*"` (npm
workspaces resolves `*` to the local package via a symlink — no version to bump). `mfe-one` and
`mfe-two` additionally need their own `react-redux` dependency, since each wraps its **own** React
tree with its **own** `<Provider>`.

In `root-config/src/main.tsx`, create the store once and pass it to both registrations:

```tsx
import { createAppStore } from '@poc/shared-store';

const store = createAppStore();

registerApplication({
    name: '@poc/mfe-one',
    app: () => import(/* @vite-ignore */ mfeOneSpecifier),
    activeWhen: ['/mfe-one'],
    customProps: { store },
});
// ...same customProps: { store } for mfe-two
```

In each MFE's `App.tsx`, accept `store` as a prop and wrap a child component that does the actual
`useSelector`/`useDispatch` work:

```tsx
// mfe-one/src/App.tsx
import { Provider, useDispatch, useSelector } from 'react-redux';
import { incremented, type AppDispatch, type AppStore, type RootState } from '@poc/shared-store';

export default function App({ store }: { store: AppStore }) {
    return (
        <Provider store={store}>
            <Counter />
        </Provider>
    );
}

function Counter() {
    const count = useSelector((state: RootState) => state.counter.value);
    const dispatch = useDispatch<AppDispatch>();
    return <button onClick={() => dispatch(incremented())}>Count is {count}</button>;
}
```

This is safe even though Context still can't cross the single-spa boundary: `Provider` and its
consumers all live inside this one MFE's own tree. Only the `store` object — held outside React, in
`root-config`'s module scope — needs to survive the remount, and it does, because unmounting an MFE
never touches `root-config`.

Finally, `standalone.tsx` (no single-spa, no `customProps`) creates its own throwaway store via the
same factory:

```tsx
// mfe-one/src/standalone.tsx
import { createAppStore } from '@poc/shared-store';
const store = createAppStore();
createRoot(document.getElementById('single-spa-content')!).render(<App store={store} />);
```

## 5. Install and verify

From the workspace root:

```bash
npm install        # installs all four workspaces in one pass
npm run dev         # starts all three dev servers; open http://localhost:9000
npm run build       # builds mfe-one, mfe-two, then root-config in order
```

In the browser at `http://localhost:9000`, the sidebar should navigate between Home / MFE One /
MFE Two without a full page reload, each MFE mounting into `#single-spa-content`. Increment MFE
One's counter, switch to MFE Two, switch back — the count should still be there.

## Why this differs from "classic" single-spa tutorials

- **Native import maps, not SystemJS.** `vite-plugin-single-spa` defaults to the browser's
  native `overridable-importmap`, so there's no SystemJS runtime or `System.import` to wire up.
- **A framework-based (React) root config**, not the framework-free vanilla-JS shell classic
  single-spa docs assume — the plugin explicitly supports this.
- **`cssLifecycleFactory`** for per-MFE CSS scoping on mount/unmount, which is a plugin-provided
  helper, not part of single-spa core.

## Known limitation: no shared dependencies

Each project (`root-config`, `mfe-one`, `mfe-two`) currently bundles its own independent copy
of React/ReactDOM — there's no `external` config or shared import-map entries. That's fine for
a POC; for a real multi-team setup you'd typically add `react`/`react-dom` as import-map
externals shared across all three, to avoid shipping the same library three times.

`@poc/shared-store` doesn't change this — it's a *source* package (plain `.ts`, resolved via
`moduleResolution: "bundler"`), not an externalized runtime dependency, so each MFE still bundles
its own copy of `@reduxjs/toolkit` and `react-redux`. What's shared is the *store instance* at
runtime (one object, passed by reference via `customProps`), not the library code that creates it.
