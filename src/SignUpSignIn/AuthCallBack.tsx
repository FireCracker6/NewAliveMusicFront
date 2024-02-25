import React, { Dispatch, SetStateAction, useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User } from './types';
import { json } from 'node:stream/consumers';
import UserContext from '../Contexts/UserContext';
import { jwtDecode } from 'jwt-decode';
export interface CustomJwtPayload {
    name: string;
    email: string;
    roles: string[];
    nameid: string;
    // ... any other custom claims you expect in your JWT
  }
  function AuthCallback()  {
    const location = useLocation();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const userContext = useContext(UserContext);
    const { setUser } = userContext; 

   
    useEffect(() => {
        console.log('AuthCallback useEffect running');
        // Extract the code from the URL query parameters
        const urlParams = new URLSearchParams(location.search);
        const code = urlParams.get('code');

        if (!code) {
            setError("No authorization code found.");
            setIsProcessing(false);
            return;
        }

        console.log('Attempting to authenticate with code:', code);

        // Replace this URL with the URL of your backend
        const backendUrl = 'http://192.168.1.80:5053/api/Auth/google-auth';

        // Send the code to the backend
        axios.post(backendUrl, { code })
            .then(response => {
                console.log('Backend response:', response);
                if (response.status === 200) {
                   
                    const token = response.data.token; // Corrected token access
                    // Assuming jwtDecode can decode your token and that the necessary claims are present
                    const decoded = jwtDecode<CustomJwtPayload>(token);
                    
                    setUser({
                      fullName: decoded.name,
                      email: decoded.email,
                      roles: decoded.roles as string[],
                      token: token,
                  
                      isAuthorized: true,
                    });
                 
                    // Save the token to localStorage
                    localStorage.setItem('userToken', token);
                    console.log('Token saved to local storage.');
                    navigate('/dashboard');


    // Navigate to the dashboard
                //    navigate('/dashboard');
                } else {
                    setError("Token was not provided by the server.");
                }
            })
            .catch(err => {
                console.error('An error occurred while verifying the Google credential:', err);
                setError("Error processing authentication. Please try again later.");
            })
            .finally(() => {
                setIsProcessing(false);
            });
    }, [location.search, navigate, setUser]);

    if (isProcessing) {
        return <div>Processing...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    // You can redirect the user or show a success message here
    return <div>Authentication successful! Redirecting...</div>;
}

export default AuthCallback;
