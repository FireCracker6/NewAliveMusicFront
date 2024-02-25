import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from './IsTokenValid'; // Import the utility function

interface PrivateRouteProps {
  component: React.ComponentType;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ component: Component }) => {

  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    setIsAuth(isAuthenticated());
  }, []);

  console.log("isAuthenticated:", isAuth);
  
  // if (!isAuth) {
  //   // Redirect unauthenticated users to the login page
  //   return <Navigate to="/" state={{ from: location }} replace />;
  // }

  return <Component />;
};

export default PrivateRoute;