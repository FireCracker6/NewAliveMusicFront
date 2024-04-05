import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';

// Create a context
export const UserSubscriptionContext = createContext<any>(null);
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

  useEffect(() => {
    const token = localStorage.getItem('userJWTToken');
    if (token) {
      const decodedToken = jwtDecode<CustomJwtPayload>(token);
      setUserId(decodedToken.nameid);
     
    }
  }, []);

  useEffect(() => {
    const fetchUserSubscription = async () => {
      setLoading(true);
      const response = await axios.get(`http://192.168.1.80:5053/api/UserSubscription/getsubscription/${userId}`);
      setUserSubscription(response.data.data);
      console.log('User subscription context:', response.data.data);
      setLoading(false);
    };
  
    if (userId) {
      fetchUserSubscription();
    }
  }, [userId]);

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
    <UserSubscriptionContext.Provider value={{ userSubscription, trackCount, loading }}>
      {children}
    </UserSubscriptionContext.Provider>
  );
};

// Create a custom hook to use the context
export const useUserSubscription = () => {
  const context = useContext(UserSubscriptionContext);
  if (context === undefined) {
    throw new Error('useUserSubscription must be used within a UserSubscriptionProvider');
  }
  return context;
};