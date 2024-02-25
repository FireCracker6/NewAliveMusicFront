import axios from "axios";
import { User } from "./types";

export const fetchUserInfo = async (token: string): Promise<User | null> => {
  if (!token) {
    console.error("No token provided");
    return null;
  }

  try {
    const response = await axios.get('http://192.168.1.80:5053/api/Account/getuserinfo', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.status === 200) {
      const newUserData = {
        ...response.data,
        isAuthorized: true,
        token: token, // Include the token in the user object
      };

      return newUserData;
    }
  } catch (error) {
    console.error("Error fetching user info:", error);
    // Handle the error appropriately - possibly resetting the user context
  }

  return null;
};