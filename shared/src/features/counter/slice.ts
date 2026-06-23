import { createSlice } from '@reduxjs/toolkit';

type CounterState = {
    value: number;
};

const initialState: CounterState = {
    value: 0,
};

const counterSlice = createSlice({
    name: 'counter',
    initialState,
    reducers: {
        incremented: (state) => {
            state.value += 1;
        },
        reset: (state) => {
            state.value = 0;
        },
    },
});

export const { incremented, reset } = counterSlice.actions;
export default counterSlice.reducer;
