import { useEffect, useState } from 'react';
import TopBar from './TopBar';
import Sidebar from './Sidebar';

export default function Shell() {
    const [path, setPath] = useState(window.location.pathname);

    useEffect(() => {
        const onRoute = () => setPath(window.location.pathname);
        window.addEventListener('single-spa:routing-event', onRoute);
        window.addEventListener('popstate', onRoute);
        return () => {
            window.removeEventListener('single-spa:routing-event', onRoute);
            window.removeEventListener('popstate', onRoute);
        };
    }, []);

    return (
        <div className="shell">
            <TopBar />
            <div className="shell-body">
                <Sidebar currentPath={path} />
                <main className="shell-content">
                    {path === '/' && (
                        <div className="welcome">
                            <h2>Welcome</h2>
                            <p>Select a micro-frontend from the sidebar to mount it below.</p>
                        </div>
                    )}
                    <div id="single-spa-content" />
                </main>
            </div>
        </div>
    );
}
