import { useState } from 'react';
import './App.css';

export default function App() {
    const [count, setCount] = useState(0);

    return (
        <div className="mfe-one">
            <h2>MFE One</h2>
            <p>Independent React + TypeScript micro-frontend, served from port 4101.</p>
            <button onClick={() => setCount((c) => c + 1)}>Count is {count}</button>
        </div>
    );
}
