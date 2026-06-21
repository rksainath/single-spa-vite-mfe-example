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
