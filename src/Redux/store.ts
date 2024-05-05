import { AnyAction, ThunkDispatch, UnknownAction, configureStore } from '@reduxjs/toolkit';
import sessionReducer from './Reducers/sessionReducer';
import likesSlice from './Reducers/likesSlice';
import commentsSlice from './Reducers/commentsSlice';
import commentsLikesSlice from './Reducers/commentsLikesSlice';
import followSlice from './Reducers/followSlice';
import userSubscriptionSlice from './Reducers/userSubscriptionSlice';

const rootReducer = {
  session: sessionReducer,
  comments: commentsSlice,
  likes: likesSlice,
  commentsLikes: commentsLikesSlice,
  followers: followSlice,
  userSubscription: userSubscriptionSlice.reducer,
};

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = ThunkDispatch<RootState, unknown, UnknownAction>;

export default store;