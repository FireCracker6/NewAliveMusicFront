import { useState, useEffect, SetStateAction, useContext, useRef } from "react";
import { Link } from "react-router-dom";
import { fetchUserInfo } from "../SignUpSignIn/fetchUserInfo";
import { User } from "../SignUpSignIn/types";
import axios from "axios";

import { jwtDecode } from "jwt-decode";
import { isAuthenticated, isAuthenticated2 } from "../Authentication/IsTokenValid";
import { useUserSubscription } from "../Contexts/UserSubscriptionContext";
import UserContext from "../Contexts/UserContext";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import SubscriptionForm from "../Subscriptions/SubscriptionForm";
import { fetchUserSubscription } from "../SignUpSignIn/fetchUserSubscription";
import userSubscriptionSlice from "../Redux/Reducers/userSubscriptionSlice";
import redirectToPayPal from "../Subscriptions/Payments/redirectToPayPal";
import { set } from "firebase/database";
import { get } from "http";

export interface UserSubscriptionDTO {
  subscriptionPlan: {
    name: string;
    maxTrackUploads: number;
    subscriptionId: number;
    startDate: string;
    endDate: string;
  };
  data: {


  }
  id: number;
  name: string;
  userId: string;


  subscriptionId: number;
  startDate: string;
  endDate: string;
}

const Dashboard: React.FC = () => {
  const { user, setUser } = useContext(UserContext);
  const { trackCount, loading: userSubscriptionLoading } = useUserSubscription();
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);

  const [userData, setUserData] = useState<User | null>(null);
  const [userDataLoading, setUserDataLoading] = useState(true);
  const [localUserSubscription, setLocalUserSubscription] = useState<UserSubscriptionDTO | null>(null);
  const authStatus = useSelector((state: any) => state.session.authStatus);
  const [hasProfile, setHasProfile] = useState<boolean | null>(false);
  const [showSubscriptionForm, setShowSubscriptionForm] = useState<boolean>(false);
  const [subscriptionUpdated, setSubscriptionUpdated] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const userSubscription = useSelector((state: any) => state.userSubscription);
  const [showForm, setShowForm] = useState(false);
  const [subscriptionPlanID, setSubscriptionPlanID] = useState(2);
  const [message, setMessage] = useState('');
  const [isUpdateSuccessful, setIsUpdateSuccessful] = useState(false);
  const [isDowngrading, setIsDowngrading] = useState(false);

  const [userId, setUserId] = useState<string | undefined>(undefined);



  useEffect(() => {
    console.log(message);
  }, [message]);




  useEffect(() => {
    // This code will run whenever userSubscription changes
    console.log(userSubscription);
  }, [userSubscription]);

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      const token = localStorage.getItem('userJWTToken');
      if (token) {
        const fetchedUser = await fetchUserInfo(token);
        if (fetchedUser) {
          const decodedToken: any = jwtDecode(token);
          setUserId(decodedToken.nameid);
          console.log('userId from dashboard useEffect', decodedToken.nameid);
        }
      }
    };

    fetchUserAndProfile();
  }, [userSubscription]);

  const GetSubscription = async () => {
    const token = localStorage.getItem('userJWTToken');
    if (token) {
      const fetchedUser = await fetchUserInfo(token);
      if (fetchedUser) {
        const decodedToken: any = jwtDecode(token);
        setUserId(decodedToken.nameid);
        console.log('userId from dashboard useEffect', decodedToken.nameid);

        const updatedSubscription = await fetchUserSubscription(userId ?? '', token, dispatch);
        console.log('updatedSubscription', updatedSubscription);
        if (updatedSubscription) {
          localStorage.setItem('userSubscription', JSON.stringify(updatedSubscription));
          setLocalUserSubscription(updatedSubscription);
          dispatch(userSubscriptionSlice.actions.setUserSubscription(updatedSubscription));

          console.log('local user subscription', localUserSubscription)
          setSubscriptionUpdated(true);
        }
      }
    }

    useEffect(() => {
      GetSubscription();
    }, [subscriptionUpdated]);

  }

  useEffect(() => {
    const fetchProfileAndSubscription = async (userId: string) => {
      const token = localStorage.getItem('userJWTToken');
      if (token) {
        const fetchedUser = await fetchUserInfo(token);
        if (fetchedUser) {
          const profileResponse = await fetch(`http://192.168.1.80:5053/api/Profile/${userId}`);
          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            fetchedUser.profilePicturePath = profileData.profilePicturePath;
            setHasProfile(true);
          }
          else {
            setHasProfile(false);
          }
          setUser(fetchedUser);
          setLoading(false);

          return fetchedUser;
        }
      }
    };

    const fetchData = async () => {
      if (userId) {
        const response = await fetchProfileAndSubscription(userId);
        if (response !== undefined) {
          setUserData(response);

        }
      }
      setUserDataLoading(false);
    };

    fetchData();
  }, [dispatch, authStatus, setHasProfile, user, userId, setUser]);


  useEffect(() => {
    setSubscriptionUpdated(true);
  }, [userSubscription]);

  if (userDataLoading) {
    return (
      <>
        <div className="d-flex justify-content-center align-items-center vh-100">
          <div className="spinner">
          </div>
        </div>
      </>
    );
  }


  const handleButtonClick = () => {
    console.log('Button clicked');
    setShowForm(prevShowForm => !prevShowForm);
  };

  const handleSubscrtionPlanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSubscriptionPlanID(parseInt(e.target.value));
  };


  const handleSubmit = async (event: any) => {
    event.preventDefault();
    console.log(subscriptionPlanID);

    const userSubscriptionDTO = {
      UserID: userId,
      SubscriptionPlanID: subscriptionPlanID,
    };

    // Determine the price based on the subscriptionPlanID
    let price;
    if (subscriptionPlanID === 3) {
      price = '29.99';
    } else if (subscriptionPlanID === 4) {
      price = '49.99';
    }

    // Create a copy of the current userSubscription before making any changes
    const currentSubscription = { ...userSubscription };

    console.log('current subscription plan', currentSubscription?.subscriptionPlan?.subscriptionPlanID);

    // Check if the user is downgrading their subscription
    let isDowngrading = currentSubscription?.subscriptionPlan?.subscriptionPlanID > subscriptionPlanID;
    console.log('isDowngrading', isDowngrading);
    // If a paid subscription was selected, redirect to PayPal
    if (price) {
      const updatedSubscription = await redirectToPayPal(userSubscriptionDTO, price); // Await the redirectToPayPal function
      setIsUpdateSuccessful(true);
      setSubscriptionUpdated(true);

      if (typeof updatedSubscription === 'object' && updatedSubscription !== null && 'isActive' in updatedSubscription && updatedSubscription.isActive) {
        localStorage.setItem('userSubscription', JSON.stringify(updatedSubscription)); // Update the local storage
        dispatch(userSubscriptionSlice.actions.setUserSubscription(updatedSubscription)); // Dispatch the action with the returned data
      }
      setShowForm(false);
      // Set the message based on whether the user is downgrading or not
      if (isDowngrading) {
        setMessage('You have downgraded your subscription. Your current subscription will remain active until the end of the paid period.');
      } else {
        setMessage('Subscription Successful!, Redirecting to dashboard...');
      }
    } else {
      try {
        const response = await axios.post('http://192.168.1.80:5053/api/Subscription/subscription', userSubscriptionDTO);
        console.log(response.data);

        setIsUpdateSuccessful(true);
        setSubscriptionUpdated(true);

        if (response.data.isActive) {
          setLocalUserSubscription(response.data);
          localStorage.setItem('userSubscription', JSON.stringify(response.data)); // Update the local storage
          console.log('userSubscriptionDTO', response.data)
          dispatch(userSubscriptionSlice.actions.setUserSubscription(response.data));
        }
        setShowForm(false);
        // Set the message based on whether the user is downgrading or not
        if (isDowngrading) {
          setMessage('You have downgraded your subscription. Your current subscription will remain active until the end of the paid period.');
        } else {
          setMessage('Subscription Successful!, Redirecting to dashboard...');
        }
        console.log('isUpdateSuccessful', isUpdateSuccessful)
        console.log('showForm', showForm)
      } catch (error) {
        console.log(error);
        setMessage('Subscription Failed! Please try again');
      }
    }


  };



  return (
    <>
      <div className='container d-flex justify-content-center py-4'>
        {userData && (
          <div>
            <h1>Welcome, {userData?.email ?? ''}!</h1>
            <div>
              <h2> What do you want to do today?</h2>
              {!hasProfile ? (
                <Link to="/create-profile">Create a profile</Link>
              ) : (
                <>
                  <Link to="/upload-tracks">Upload tracks</Link>
                  <Link to="/create-artist-profile">Create artist profile</Link>
                  <Link to="/account-information">Account information</Link>
                </>
              )}
            </div>
            {userSubscription && (
              <div>
                <h1>{userSubscription?.subscriptionPlan?.name}</h1>

                <button onClick={handleButtonClick}>
                  {showForm ? 'Cancel' : 'Change Subscription'}
                </button>


                <p>Max Track Uploads: {userSubscription?.subscriptionPlan?.maxTrackUploads}</p>
                <p>Start Date: {moment(userSubscription?.startDate).format('LL')}</p>
                <p>End Date: {moment(userSubscription?.endDate).format('LL')}</p>
                {trackCount !== null && trackCount !== undefined && (


                  <div>
                    <div>You have uploaded: {trackCount} tracks</div>
                  </div>
                )}
              </div>

            )}

            {showForm && (
              <>

                <div className="container d-flex justify-content-center py-4 mt-5">
                  <form onSubmit={handleSubmit}>

                    <label>
                      Select Subscription:
                      <select value={subscriptionPlanID} onChange={handleSubscrtionPlanChange}>
                        <option value="2">Free Membership (Upload up to 3 tracks, no AI access)</option>
                        <option value="3">Premium Membership (Upload up to 10 tracks, master 5 tracks, AI Access) - $29.99/month</option>
                        <option value="4">Unlimited Premium Membership (Upload up to 100 tracks, master 20 tracks, AI Access) - $49.99/month</option>
                      </select>
                    </label>

                    <input type="submit" value="Submit" />
                  </form>
                  <div id="paypal-button-container"></div>
                </div>

              </>
            )}
            {!showForm && (
              <div className="container d-flex justify-content-center pt-4">
                <div>{message}</div>
              </div>
            )}


          </div>
        )}
      </div>
    </>
  );
}

export default Dashboard;