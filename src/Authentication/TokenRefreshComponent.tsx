import { useEffect, useContext, useCallback } from 'react';
import axios from 'axios';

import UserContext from '../Contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from './IsTokenValid';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  exp: number;
  email: string;
  // Add other properties as needed
}

const TokenRefreshComponent = () => {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const refreshToken = useCallback(async () => {
    const currentToken = localStorage.getItem('userJWTToken');
    const currentRefreshToken = localStorage.getItem('refreshToken');
   
    if (!currentRefreshToken) {
      console.warn('No refresh token available, redirecting to login.');
      navigate('/');
      return;
    }
  
    try {
      const response = await axios.post('http://192.168.1.80:5053/api/token/refresh', {
        refreshToken: currentRefreshToken,
      }, {
        headers: {
          'Authorization': `Bearer ${currentToken}`
        }
      });
  
      const { accessToken, refreshToken: newRefreshToken } = response.data;
      localStorage.setItem('userJWTToken', accessToken);
      localStorage.setItem('refreshToken', newRefreshToken);
  
      const decodedToken: DecodedToken = jwtDecode(accessToken);
      const newUser = { email: decodedToken.email };
      // Set other user properties as needed
  
      // Only call setUser if the new user is different from the current user
      if (JSON.stringify(user) !== JSON.stringify(newUser)) {
        setUser(newUser);
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      // Handle specific error scenarios here
      // For example, redirect to login if refresh token is invalid
    }
  }, [user]);

  useEffect(() => {
    if (!isAuthenticated()) {
      refreshToken();
    }
  }, [user, refreshToken]);

  return null;
};

export default TokenRefreshComponent;