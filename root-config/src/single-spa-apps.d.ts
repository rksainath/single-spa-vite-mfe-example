// These are remote modules resolved at runtime via the browser import map
// (see src/importMap.dev.json / src/importMap.json), not by TypeScript/Vite's
// own module resolution, so they need ambient declarations.
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
