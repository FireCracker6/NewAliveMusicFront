import { configureStore } from '@reduxjs/toolkit';
import sessionReducer from './Reducers/sessionReducer';
import likesSlice from './Reducers/likesSlice';
import commentsSlice from './Reducers/commentsSlice';

const rootReducer = {
  session: sessionReducer,
  comments: commentsSlice,
  likes: likesSlice,
};

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;