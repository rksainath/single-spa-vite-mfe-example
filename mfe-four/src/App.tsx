import { useEffect, useState } from 'react';
import './App.css';

export default function App() {
    const [time, setTime] = useState(() => new Date());

    useEffect(() => {
        const id = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(id);
    }, []);

    return (
        <div className="mfe-four">
            <h3>Server Clock</h3>
            <p>{time.toLocaleTimeString()}</p>
        </div>
    );
}
