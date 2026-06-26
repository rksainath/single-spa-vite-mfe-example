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

// mfe-three and mfe-four are never registered as single-spa applications — they're only
// ever mounted as parcels (see Shell.tsx) — but <Parcel>'s config prop still resolves this
// specifier via a dynamic import(), so TypeScript needs the same ambient shape regardless.
declare module '@poc/mfe-three' {
    import type { LifeCycles } from 'single-spa';
    export const bootstrap: LifeCycles['bootstrap'];
    export const mount: LifeCycles['mount'];
    export const unmount: LifeCycles['unmount'];
}

declare module '@poc/mfe-four' {
    import type { LifeCycles } from 'single-spa';
    export const bootstrap: LifeCycles['bootstrap'];
    export const mount: LifeCycles['mount'];
    export const unmount: LifeCycles['unmount'];
}
