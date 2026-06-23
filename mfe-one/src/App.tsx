import { Provider, useDispatch, useSelector } from 'react-redux';
import { incremented, type AppDispatch, type AppStore, type RootState } from '@poc/shared-store';
import './App.css';

type AppProps = {
    store: AppStore;
};

export default function App({ store }: AppProps) {
    return (
        <Provider store={store}>
            <Counter />
        </Provider>
    );
}

function Counter() {
    const count = useSelector((state: RootState) => state.counter.value);
    const dispatch = useDispatch<AppDispatch>();

    return (
        <div className="mfe-one">
            <h2>MFE One</h2>
            <p>Independent React + TypeScript micro-frontend, served from port 4101.</p>
            <button onClick={() => dispatch(incremented())}>Count is {count}</button>
        </div>
    );
}
