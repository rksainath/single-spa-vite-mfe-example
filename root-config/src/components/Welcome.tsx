import Parcel from 'single-spa-react/parcel';
import { mountRootParcel } from 'single-spa';
import type { AppStore } from '@poc/shared-store';

// Routed through a variable (not an inline string literal) for the same reason as
// main.tsx's specifiers: it keeps Vite/Rollup from statically resolving the dynamic
// import, so the browser's import map resolves it natively at runtime instead.
const mfeOneSpecifier = '@poc/mfe-one';

type WelcomeProps = {
    store: AppStore;
};

export default function Welcome({ store }: WelcomeProps) {
    return (
        <div className="welcome">
            <h2>Welcome</h2>
            <p>Select a micro-frontend from the sidebar to mount it below.</p>
            <p>
                Or see MFE One's counter mounted right here as a <strong>parcel</strong> — the same
                module registered as an application at <code>/mfe-one</code>, with no MFE-side code
                changes, sharing the same Redux store either way.
            </p>
            <Parcel
                config={() => import(/* @vite-ignore */ mfeOneSpecifier)}
                mountParcel={mountRootParcel}
                store={store}
                wrapClassName="welcome-parcel"
            />
        </div>
    );
}
