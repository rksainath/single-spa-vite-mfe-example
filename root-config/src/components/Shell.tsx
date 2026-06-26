import { Route, Routes } from 'react-router-dom';
import Parcel from 'single-spa-react/parcel';
import { mountRootParcel } from 'single-spa';
import type { AppStore } from '@poc/shared-store';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import Welcome from './Welcome';

// Routed through variables (not inline string literals) for the same reason as main.tsx's
// specifiers: it keeps Vite/Rollup from statically resolving the dynamic import, so the
// browser's import map resolves it natively at runtime instead.
const mfeThreeSpecifier = '@poc/mfe-three';
const mfeFourSpecifier = '@poc/mfe-four';

type ShellProps = {
    store: AppStore;
};

export default function Shell({ store }: ShellProps) {
    return (
        <div className="shell">
            <TopBar />
            <div className="shell-body">
                <Sidebar />
                <main className="shell-content">
                    <Routes>
                        <Route path="/" element={<Welcome store={store} />} />
                    </Routes>
                    <div id="single-spa-content" />
                </main>
                {/* mfe-three/mfe-four are never registered as applications — unlike mfe-one/mfe-two,
                    they're mounted here unconditionally as parcels, so they're present on every
                    route (Welcome, /mfe-one, /mfe-two alike), not gated by activeWhen at all. */}
                <aside className="shell-widgets">
                    <Parcel
                        config={() => import(/* @vite-ignore */ mfeThreeSpecifier)}
                        mountParcel={mountRootParcel}
                        wrapClassName="shell-widget"
                    />
                    <Parcel
                        config={() => import(/* @vite-ignore */ mfeFourSpecifier)}
                        mountParcel={mountRootParcel}
                        wrapClassName="shell-widget"
                    />
                </aside>
            </div>
        </div>
    );
}
