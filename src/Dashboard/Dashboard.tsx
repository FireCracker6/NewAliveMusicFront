import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchUserInfo } from "../SignUpSignIn/fetchUserInfo";
import { User } from "../SignUpSignIn/types";

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('userJWTToken');
    console.log(token)
    if (token) {
      fetchUserInfo(token).then(fetchedUser => {
        if (fetchedUser) {
          setUser(fetchedUser);
        }
      });
    }
  }, []);

  console.log("Rendering with user:", user);

  return (
    <>
    <div className='container d-flex justify-content-center py-4'>
 
      {user && (
        <div>
          <h1>Welcome {user.email}</h1>
       <div>
       <h2> What do you want to do today?</h2>
      <Link to="/create-profile">Create a profile</Link>
       </div>
        </div>
      )}
    </div>
    </>
  );
};

export default Dashboard;