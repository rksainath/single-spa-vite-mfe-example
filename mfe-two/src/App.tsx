import { useState } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { added, type AppDispatch, type AppStore, type RootState } from '@poc/shared-store';
import './App.css';

type AppProps = {
    store: AppStore;
};

export default function App({ store }: AppProps) {
    return (
        <Provider store={store}>
            <TodoList />
        </Provider>
    );
}

function TodoList() {
    const items = useSelector((state: RootState) => state.todos.items);
    const dispatch = useDispatch<AppDispatch>();
    const [text, setText] = useState('');

    const addItem = () => {
        if (!text.trim()) return;
        dispatch(added(text.trim()));
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
