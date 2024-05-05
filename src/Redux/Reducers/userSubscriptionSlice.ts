import { createSlice } from '@reduxjs/toolkit';

const userSubscriptionSlice = createSlice({
  name: 'userSubscription',
  initialState: null,
  reducers: {
    setUserSubscription: (state, action) => {
      return action.payload;
    },
  },
});

export const { setUserSubscription } = userSubscriptionSlice.actions;

export default userSubscriptionSlice; // Export the entire slice object