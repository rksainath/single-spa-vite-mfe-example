import { useState } from 'react';
import './App.css';

const initialNotifications = [
    'Build pipeline completed successfully',
    'New comment on PR #42',
    'Storage usage at 80%',
];

export default function App() {
    const [notifications, setNotifications] = useState(initialNotifications);

    return (
        <div className="mfe-three">
            <h3>Notifications</h3>
            {notifications.length === 0 ? (
                <p>All caught up.</p>
            ) : (
                <ul>
                    {notifications.map((note) => (
                        <li key={note}>{note}</li>
                    ))}
                </ul>
            )}
            <button onClick={() => setNotifications([])}>Clear all</button>
        </div>
    );
}
