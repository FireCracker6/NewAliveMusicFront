import axios from "axios";
import userSubscriptionSlice from "../Redux/Reducers/userSubscriptionSlice";
import { Dispatch } from "@reduxjs/toolkit";

export const fetchUserSubscription = async (userId: string, token: string, dispatch: Dispatch) => {
  if (!userId || !token) {
    console.error("No userId or token provided");
    return null;
  }

  try {
    const response = await axios.get(`http://192.168.1.80:5053/api/UserSubscription/getsubscription/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.status === 200) {
      console.log('response from fetchUserSubscription', response.data.data)
      
      // Dispatch the action here
      dispatch(userSubscriptionSlice.actions.setUserSubscription(response.data.data));

      return response.data.data;
    }
  } catch (error) {
    console.error("Error fetching user subscription:", error);
    // Handle the error appropriately
  }

  return null;
};