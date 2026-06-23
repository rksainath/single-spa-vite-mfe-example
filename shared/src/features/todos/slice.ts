import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

type TodosState = {
    items: string[];
};

const initialState: TodosState = {
    items: ['Wire up root config', 'Build MFE one'],
};

const todosSlice = createSlice({
    name: 'todos',
    initialState,
    reducers: {
        added: (state, action: PayloadAction<string>) => {
            state.items.push(action.payload);
        },
    },
});

export const { added } = todosSlice.actions;
export default todosSlice.reducer;
