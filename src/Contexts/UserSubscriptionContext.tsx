import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';
import UserContext from './UserContext';
import { isAuthenticated2 } from '../Authentication/IsTokenValid';
import { response } from 'express';

interface UserSubscriptionContextType {
  userSubscription: any;
  setUserSubscription: (userSubscription: any) => void;
  trackCount: number;
  loading: boolean;
}
export const UserSubscriptionContext = createContext<UserSubscriptionContextType | null>(null);

interface CustomJwtPayload {
    nameid: string;
    name: string;
    email: string;
    roles: string[];
  
  }

  

  
// Create the provider component
export const UserSubscriptionProvider = ({ children }: any) => {
    const [userId, setUserId] = useState<string | undefined>(undefined);
  const [userSubscription, setUserSubscription] = useState(null);
  const [trackCount, setTrackCount] = useState(0);
  const [loading, setLoading] = useState(true);
const [localToken, setLocalToken] = useState<string | null>(null);
  const { user } = useContext(UserContext);
  const [token, setToken] = useState(localStorage.getItem('userJWTToken'));

  

useEffect(() => {
  // Update the token state whenever the localStorage value changes
  const handleStorageChange = () => {
    setToken(localStorage.getItem('userJWTToken'));
  };

  window.addEventListener('storage', handleStorageChange);

  // Cleanup function
  return () => {
    window.removeEventListener('storage', handleStorageChange);
  };
}, []);

const fetchTokenAndUserSubscription = async () => {
  setLoading(true);
  console.log( "token from userSubscriptionContext", token);
  if (token) {
    const decodedToken = jwtDecode<CustomJwtPayload>(token);
    const userId = decodedToken.nameid;
    console.log('userId from userSubscriptionContext', userId);
    if (userId) {
      try {
        const response = await axios.get(`http://192.168.1.80:5053/api/UserSubscription/getsubscription/${userId}`);
        console.log('Response:', response.data); // Log the entire response
        setUserSubscription(response.data.data);
        console.log('User subscription context:', response.data.data);
      } catch (error) {
        console.error('Error fetching user subscription:', error);
      }
    }
  }
  setLoading(false);
};

useEffect(() => {
  fetchTokenAndUserSubscription();
}, [token]);

  
  useEffect(() => {
    const fetchTrackCount = async () => {
      const response = await axios.get(`http://192.168.1.80:5053/api/UserSubscription/trackcount/${userId}`);
      setTrackCount(response.data);
    };

    if (userId) {
      fetchTrackCount();
    }
  }, [userId]);

  return (
    <UserSubscriptionContext.Provider value={{ userSubscription, setUserSubscription, trackCount, loading }}>
      {children}
    </UserSubscriptionContext.Provider>
  );
};

// Create a custom hook to use the context
export const useUserSubscription = () => {
  const context = useContext(UserSubscriptionContext);

  if (!context) {
    throw new Error('useUserSubscription must be used within a UserSubscriptionProvider');
  }

  const { userSubscription, setUserSubscription, trackCount, loading } = context;

  return { userSubscription, setUserSubscription, trackCount, loading };
};