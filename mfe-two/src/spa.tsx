import React from 'react';
import ReactDOMClient from 'react-dom/client';
import singleSpaReact from 'single-spa-react';
import { cssLifecycleFactory } from 'vite-plugin-single-spa/ex';
import App from './App';

const cssLifecycles = cssLifecycleFactory('mfe-two');

const reactLifecycles = singleSpaReact({
    React,
    ReactDOMClient,
    rootComponent: App,
    domElementGetter: () => document.getElementById('single-spa-content')!,
    errorBoundary(err: unknown) {
        return <div>Error mounting MFE Two: {String(err)}</div>;
    },
});

export const bootstrap = [cssLifecycles.bootstrap, reactLifecycles.bootstrap];
export const mount = [cssLifecycles.mount, reactLifecycles.mount];
export const unmount = [cssLifecycles.unmount, reactLifecycles.unmount];
