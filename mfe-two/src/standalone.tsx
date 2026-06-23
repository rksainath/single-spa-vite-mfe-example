import React from 'react';
import { createRoot } from 'react-dom/client';
import { createAppStore } from '@poc/shared-store';
import App from './App';

const store = createAppStore();

createRoot(document.getElementById('single-spa-content')!).render(
    <React.StrictMode>
        <App store={store} />
    </React.StrictMode>,
);
