import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from './IsTokenValid'; // Import the utility function

interface PrivateRouteProps {
  component: React.ComponentType;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ component: Component }) => {
  const [isAuth, setIsAuth] = useState(isAuthenticated());
  const location = useLocation();

  // useEffect(() => {
  //   // This will run whenever the user's authentication status changes
  //   const interval = setInterval(() => {
  //     setIsAuth(isAuthenticated());
  //   }, 1000); // Check every second

  //   // Clean up the interval on unmount
  //   return () => clearInterval(interval);
  // }, []);

  // if (!isAuth) {
  //   // Redirect unauthenticated users to the login page
  //   return <Navigate to="/" state={{ from: location }} replace />;
  // }

  return <Component />;
};

export default PrivateRoute;