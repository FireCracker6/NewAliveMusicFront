import { useState, useEffect, SetStateAction } from "react";
import { Link } from "react-router-dom";
import { fetchUserInfo } from "../SignUpSignIn/fetchUserInfo";
import { User } from "../SignUpSignIn/types";
import axios from "axios";
import { setUserId } from "firebase/analytics";
import { jwtDecode } from "jwt-decode";
import { isAuthenticated } from "../Authentication/IsTokenValid";
import { useUserSubscription } from "../Contexts/UserSubscriptionContext";

interface UserSubscriptionDTO {

  data : {
    subscriptionPlan: {
      name: string;
      maxTrackUploads: number;
      // Add other properties of the subscription plan here
    };
    // Add other properties of the user subscription here
  }
  id: number;
  userId: number;
  
  subscriptionId: number;
  startDate: string;
  endDate: string;
}
const Dashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  //const [userSubscription, setUserSubscription] = useState<UserSubscriptionDTO | null>(null);
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const { userSubscription, trackCount } = useUserSubscription();
  useEffect(() => {
    const token = localStorage.getItem('userJWTToken');
    console.log(token)
    const decodedToken: any = jwtDecode(token ?? '');
    if (token) {
      fetchUserInfo(token).then((fetchedUser: SetStateAction<User | null>) => {
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
       {userSubscription && (
        <div>
          <h1>{userSubscription.subscriptionPlan?.name}</h1>
          <p>Max Track Uploads: {userSubscription.subscriptionPlan?.maxTrackUploads}</p>
          {/* Render other properties of the user subscription */}
          {/* ... */}
        </div>
      )}
      <>
      {trackCount && (
        <div>
          <h1>You have uploaded: {trackCount} tracks</h1>
          </div>
      )}
      </>

        </div>
      )}
    </div>
    </>
  );
};

export default Dashboard;