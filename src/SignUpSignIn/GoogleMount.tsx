

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const GoogleAuthHandler: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | undefined>();

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        try {
            const urlParams = new URLSearchParams(location.search);
            const code = urlParams.get('code');
            console.log(code);
            
            // if (code) {
            //     sendCodeToBackend(code, "239924498555-ttk9cn2eg5j31kh85jdgidu1gm1qbhpo.apps.googleusercontent.com");
            // } else {
            //     setIsLoading(false);
            //     setError('Authentication code not found in the URL.');
            // }
        } catch (err) {
            console.error("Error in useEffect:", err);
            setIsLoading(false);
            setError('An unexpected error occurred.');
        }
    }, [location]);
    

 
    const sendCodeToBackend = async (code: string, clientId: string) => {
        const payload = {
            client_id: clientId,  // Using snake_case as it seems the standard for OAuth operations
            code: code,
           // credential: credential,
            // ... Add other necessary attributes
        };
    
        try {
            const response = await axios.post('http://192.168.1.80:5053/api/Auth/google', payload, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
    
            if (response.status === 200) {
                console.log("Token exchanged successfully:", response.data);
                navigate('/home'); // or another route
            }
        } catch (err) {
            console.error("Error sending code to backend:", err);
        }
    };
    

    if (isLoading) {
        return (
            <>
                <p>Loading...</p>
            </>
        );
    }
    if (error) {
        return <p>Error: {error}</p>;
    }
    return <p>Authentication successful!</p>;
    
}

export default GoogleAuthHandler;
