import { Route, Routes } from 'react-router-dom';
import type { AppStore } from '@poc/shared-store';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import Welcome from './Welcome';

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
            </div>
        </div>
    );
}
