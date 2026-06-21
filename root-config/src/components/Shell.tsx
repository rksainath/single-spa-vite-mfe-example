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
