import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import queryString from 'query-string';
import Modal from 'react-modal';
import axios from 'axios';
import UserContext from '../Contexts/UserContext';
import { fetchUserInfo } from './fetchUserInfo';
import { jwtDecode } from 'jwt-decode';
interface CustomJwtPayload {
    name: string;
    email: string;
    roles: string[];
    contactId: number;
  
  }

  const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const userContext = useContext(UserContext);
  
  const { setUser } = userContext; 
  useEffect(() => {
    const values = queryString.parse(location.search);
    setEmail(values.email as string);
    setToken(values.token as string);
    console.log("Parsed values: ", values);
    
  }, [location.search]);
  


  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    // Add validation for password and confirmPassword
  
    try {
        // Call your API endpoint to reset the password
        await axios.post('http://192.168.1.80:5053/api/ResetPassword/reset-password', { email, token, newPassword });
  
        // Clear the form
        setNewPassword('');
        setConfirmPassword('');
  
        // Now sign the user in automatically
          // Call your API endpoint for sign-in
          const response = await axios.post('http://192.168.1.80:5053/api/users/login', {
            email: email,
            password: newPassword,
          
          });
        
          if (response.status === 200) {
          
            const token = response.data.token; // Corrected token access
            // Assuming jwtDecode can decode your token and that the necessary claims are present
            const decoded = jwtDecode<CustomJwtPayload>(token);
            
            setUser({
              fullName: decoded.name,
              email: decoded.email,
              roles: decoded.roles as string[],
              token: token,
            //  contactId: decoded.contactId,
              isAuthorized: true,
            });
            try {
              await fetchUserInfo(token);
            navigate('/dashboard');
            } catch (error) {
              console.error("Error fetching user info:", error);
              // Handle fetching error
            }
            // Save the token to localStorage
            localStorage.setItem('userToken', token);
            console.log('Token saved to local storage.');
          
            
            // For debugging, log the token after a short delay
            setTimeout(() => {
              const debugToken = localStorage.getItem('userToken'); // Make sure the key is the same
              console.log('Debug Token:', debugToken);
            }, 1000);
        
           
            
          }
        } catch (error) {
          console.error("An error occurred during the login process", error);
          // Handle error (e.g., show error message to user)
        }
           
            
       
  };
  
  return (
    <> 
    

        <div className='reset-password-container py-4'>
      <h2>Reset Password</h2>
      <form onSubmit={handleSubmit}>
      <div>
    <label htmlFor="email">Email Address:</label>
    <input
        type="email"
        id="email"
        className='form-control'
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        readOnly // This makes the input field read-only
    />
</div>
        <div>
          <label htmlFor="password">New Password:</label>
          <input
            type="password"
            id="password"
            className='form-control'
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="confirmPassword">Confirm Password:</label>
          <input className='form-control'
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        <div>
        <button type="submit" className='form-button mt-3'>Reset Password</button>
        </div>
      </form>
    </div>
   
    </>
  );
};

export default ResetPassword;
