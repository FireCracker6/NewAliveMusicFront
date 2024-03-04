import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from './IsTokenValid'; // Import the utility function

interface PrivateRouteProps {
  component: React.ComponentType;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ component: Component }) => {
  const [isAuth, setIsAuth] = useState(isAuthenticated());
  const location = useLocation();

 
  return <Component />;
};

export default PrivateRoute;