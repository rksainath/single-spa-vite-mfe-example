import { useState } from 'react';
import './App.css';

export default function App() {
    const [items, setItems] = useState(['Wire up root config', 'Build MFE one']);
    const [text, setText] = useState('');

    const addItem = () => {
        if (!text.trim()) return;
        setItems((prev) => [...prev, text.trim()]);
        setText('');
    };

    return (
        <div className="mfe-two">
            <h2>MFE Two</h2>
            <p>Independent React + TypeScript micro-frontend, served from port 4102.</p>
            <div className="mfe-two-input">
                <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addItem()}
                    placeholder="Add an item"
                />
                <button onClick={addItem}>Add</button>
            </div>
            <ul>
                {items.map((item, i) => (
                    <li key={i}>{item}</li>
                ))}
            </ul>
        </div>
    );
}
