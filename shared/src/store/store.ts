import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './rootReducer';

// A factory, not a singleton: root-config calls this once per session and hands the
// resulting instance to every MFE via customProps, so each standalone dev server
// (and any future test) can still create its own isolated store.
export function createAppStore() {
    return configureStore({ reducer: rootReducer });
}

export type AppStore = ReturnType<typeof createAppStore>;
export type AppDispatch = AppStore['dispatch'];
export type { RootState } from './rootReducer';
