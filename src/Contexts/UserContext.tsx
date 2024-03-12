import React, { createContext, useEffect, useState, Dispatch, SetStateAction } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { User } from '../SignUpSignIn/types';
import { useLocation, useNavigate } from 'react-router-dom';

interface UserContextType {
  user: User | null;
  setUser: Dispatch<SetStateAction<User | null>>;
  loading: boolean;
  setUserWithLocalStorage: (user: User | null) => void; // Add this line
 
}
const defaultState = {
  user: null,
  setUser: () => {},
};
interface CustomJwtPayload {
  nameId: string;
  name: string;
  email: string;
  roles: string[];

}


// Define a default context with dummy `setUser` and initial `user` state
const defaultUserContext: UserContextType = {
  user: null,
  loading: false,
  setUser: () => {}, 
  setUserWithLocalStorage: () => {},
};

const UserContext = createContext<UserContextType>(defaultUserContext);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('userJWTToken');
   
    if (storedUser) {
      const decoded = jwtDecode<CustomJwtPayload>(storedUser);
      return {
        userId: decoded.nameId,
        fullName: decoded.name,
        email: decoded.email,
        roles: decoded.roles as string[],
        token: storedUser,
        isAuthorized: true,
      } as User;
    }
    return null;
  });
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate(); 

  const setUserWithLocalStorage: Dispatch<SetStateAction<User | null>> = (user: any) => {
    return new Promise<void>((resolve) => {
     
      console.log("setUserWithLocalStorage called with user:", user);
      if (user) {
        console.log("Setting userToken in localStorage with value:", user.token);
        localStorage.setItem('userJWTToken', user.token || '');
      
        localStorage.setItem('userEmail', user.email || '');
        localStorage.setItem('email', user.email || '');
        localStorage.setItem('roles', JSON.stringify(user.roles) || ''); // Store roles in localStorage
        localStorage.setItem('userFullName', user.fullName || '');
        
      } else {
     //   localStorage.removeItem('userToken');
       // localStorage.removeItem('userEmail');
        //localStorage.removeItem('userFullName');
        //localStorage.removeItem('roles'); // Remove roles from localStorage
      }
      resolve();
    });
  };
const setUserSafely = (newUser: any) => {
  if (!user || (newUser && user.email !== newUser.email)) {
    setUserWithLocalStorage(newUser);
  }
};


  
  const fetchUserData = async () => {
    // Ensure the email is defined
    if (!user?.email) {
      console.warn("User email is undefined, cannot fetch user data");
      setLoading(false);
      return;
    }
  
    try {
      const response = await fetch(`http://192.168.1.80:5053/api/Account/user?email=${user.email}`);
      if (response.ok) {
        const userData = await response.json();
        console.log('userData:', userData);
        const { fullName, roles } = userData; 
        
        // Call setUserSafely here
        setUserSafely({ ...user, fullName, roles });
      } else {
        console.error('Failed to fetch user data:', response.status);
      }
    } catch (error) {
      console.error('An error occurred while fetching user data:', error);
    }
    setLoading(false);
  };

useEffect(() => {
  const loadUserFromLocalStorage = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Only attempt to decode if the token is in the expected format
        if (token.split('.').length === 3) {
          const decoded = jwtDecode<CustomJwtPayload>(token);
          setUser((prevUser: User | null) => ({
            ...prevUser,
            fullName: decoded.name,
            email: decoded.email,
            roles: decoded.roles,
            token: token,
            // contactId: decoded.contactId,
            isAuthorized: true,
          }));
          // Fetch user data after setting the user
          await fetchUserData();
        } else {
          console.error('Invalid token format');
          // Here you could also clear the token from localStorage if desired
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error('Invalid token', error);
        // Handle the invalid token case here, like logging out the user
      }
    }
    setLoading(false);
  };

  loadUserFromLocalStorage();
}, []);

 

  const location = useLocation();

  const userContextValue: UserContextType = {
    user,
    loading,
    setUser: setUserWithLocalStorage,
    setUserWithLocalStorage, // Add this line
};


return (
  <UserContext.Provider value={userContextValue}>
    {children}
  </UserContext.Provider>
);
}

export default UserContext;
