import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { registerApplication, start } from 'single-spa';
import { createAppStore } from '@poc/shared-store';
import Shell from './components/Shell';
import './styles.css';

// Specifiers are kept in variables (rather than inlined as string literals) so that
// Vite's dev-time import analysis and Rollup's build-time bundling both treat these as
// non-statically-analyzable and leave them untouched for the browser's native import map
// to resolve at runtime.
const mfeOneSpecifier = '@poc/mfe-one';
const mfeTwoSpecifier = '@poc/mfe-two';

// Created once and handed to every MFE via customProps. single-spa-react forwards
// customProps straight onto each MFE's root component as plain React props, which is
// the only thing that crosses the boundary — React Context can't, since each MFE
// mounts into its own separate React root, not as a descendant of this tree.
const store = createAppStore();

registerApplication({
    name: '@poc/mfe-one',
    app: () => import(/* @vite-ignore */ mfeOneSpecifier),
    activeWhen: ['/mfe-one'],
    customProps: { store },
});

registerApplication({
    name: '@poc/mfe-two',
    app: () => import(/* @vite-ignore */ mfeTwoSpecifier),
    activeWhen: ['/mfe-two'],
    customProps: { store },
});

start();

createRoot(document.getElementById('app')!).render(
    <React.StrictMode>
        <BrowserRouter>
            <Shell />
        </BrowserRouter>
    </React.StrictMode>,
);
