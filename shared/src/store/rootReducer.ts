import { combineReducers } from '@reduxjs/toolkit';
import counterReducer from '../features/counter/slice';
import todosReducer from '../features/todos/slice';

const rootReducer = combineReducers({
    counter: counterReducer,
    todos: todosReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
