import { useContext, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import UserContext from "../Contexts/UserContext";
import { isAuthenticated } from "./IsTokenValid";

type RoleCheckProps = {
  roles: string[];
  children: React.ReactNode;
};

const RoleCheck: React.FC<RoleCheckProps> = ({ roles, children }) => {
  const { user, loading } = useContext(UserContext);
  const rolecheckrole = JSON.parse(localStorage.getItem('roles') || '[]');
  console.log('roles from rolebasedrole', rolecheckrole)
  const navigate = useNavigate();

  useEffect(() => {
    if (user && isAuthenticated() && rolecheckrole.some((role: string) => roles.includes(role))) {
      console.log(rolecheckrole)
     
    }
  }, [user, rolecheckrole, roles]);

  // if (loading || !user) {
  //   return <div>Loading...</div>; // Replace this with your actual loading component
  // }

  if (!isAuthenticated()) {
    console.log(user?.isAuthorized)
    console.log('User is not authorized');
    return <Navigate to="/login" replace />;
  }

  if (!rolecheckrole.some((role: string) => roles.includes(role))) {
    console.log('User does not have the correct role');
    return <Navigate to="/not-authorized" replace />;
  }

  console.log('User is authorized and has the correct role');
  return <>{children}</>;
};

export default RoleCheck;