import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  userId: null,
  authStatus: 'logged out',
};

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    logIn: (state, action) => {
      state.userId = action.payload.userId;
      state.authStatus = 'logged in';
    },
    logOut: (state) => {
      state.userId = null;
      state.authStatus = 'logged out';
    },
  },
});

export const { logIn, logOut } = sessionSlice.actions;

export default sessionSlice.reducer;