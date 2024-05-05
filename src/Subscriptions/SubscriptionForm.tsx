import { jwtDecode } from "jwt-decode";
import { useContext, useEffect, useState } from "react"
import { isAuthenticated } from "../Authentication/IsTokenValid";
import UserContext from "../Contexts/UserContext";
import { useDispatch } from "react-redux";
import axios from "axios";
import redirectToPayPal from "./Payments/redirectToPayPal";
import { useNavigate } from "react-router-dom";
import { set } from "firebase/database";
import { fetchUserSubscription } from "../SignUpSignIn/fetchUserSubscription";
import userSubscriptionSlice from "../Redux/Reducers/userSubscriptionSlice";
import { UserSubscriptionContext } from "../Contexts/UserSubscriptionContext";

const SubscriptionForm = ({ setLocalUserSubscription, setShowForm, showForm } : any) => { 
  
  const [subscriptionPlanID, setSubscriptionPlanID] = useState(2);

  
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const { user, setUser } = useContext(UserContext);
  const [message, setMessage] = useState('');
  const [isUpdateSuccessful, setIsUpdateSuccessful] = useState(false);
  const [subscriptionUpdated, setSubscriptionUpdated] = useState(false);
  const context = useContext(UserSubscriptionContext);

  if (!context) {
    throw new Error('useUserSubscription must be used within a UserSubscriptionProvider');
  }
  
  const { setUserSubscription } = context;
  const dispatch = useDispatch();
  const navigate = useNavigate();


  useEffect(() => {
    const token = localStorage.getItem('userJWTToken');
    if (isAuthenticated()) {
      const decodedToken: any = jwtDecode(token ?? '');
      setUserId(decodedToken.nameid);
    }
  }, [dispatch, user]);

  const handleSubscrtionPlanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSubscriptionPlanID(parseInt(e.target.value));
  };
  const token = localStorage.getItem('userJWTToken');
  useEffect(() => {

    const fetchData = async () => {
      const subscription = await fetchUserSubscription(user?.userId ?? '', token ?? '', dispatch);
      console.log('subscription', subscription);
      setUserSubscription(subscription);
    };
  
    fetchData();
  }, [userId, token]);

  useEffect(() => {
    
    if (subscriptionUpdated) {
      // Fetch updated subscription
      setShowForm(false);
      const fetchUpdatedSubscription = async () => {
        const token = localStorage.getItem('userJWTToken');
        const updatedSubscription = await fetchUserSubscription(userId ?? '', token ?? '', dispatch);
        console.log('updatedSubscription', updatedSubscription);
        if (updatedSubscription) {
       //   localStorage.setItem('userSubscription', JSON.stringify(updatedSubscription));
          // Update local state here
        }
      };
  
      fetchUpdatedSubscription();
  
      // Reset subscriptionUpdated to false after fetching updated subscription
      setSubscriptionUpdated(false);
    }
  }, [subscriptionUpdated, userId, dispatch, setSubscriptionUpdated]);

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
  
    // If a paid subscription was selected, redirect to PayPal
    if (price) {
      const updatedSubscription = await redirectToPayPal(userSubscriptionDTO, price); // Await the redirectToPayPal function
      setIsUpdateSuccessful(true);
      setSubscriptionUpdated(true);
      setUserSubscription(updatedSubscription);
     // localStorage.setItem('userSubscription', JSON.stringify(updatedSubscription)); // Update the local storage
    //  dispatch(userSubscriptionSlice.actions.setUserSubscription(updatedSubscription)); // Dispatch the action with the returned data
   //   setShowSubscriptionForm(false);
    //  setLocalUserSubscription(updatedSubscription);
    // setShowSuccessMessage(true);
      setShowForm(false); 
    } else {
      try {
        const response = await axios.post('http://192.168.1.80:5053/api/Subscription/subscription', userSubscriptionDTO);
        console.log(response.data);
        setMessage('Subscription Successful!, Redirecting to dashboard...');
        navigate('/dashboard');
        setIsUpdateSuccessful(true);
        setSubscriptionUpdated(true);
        setUserSubscription(response.data);
        setLocalUserSubscription(response.data); 
        //localStorage.setItem('userSubscription', JSON.stringify(response.data)); // Update the local storage
       console.log('userSubscriptionDTO', userSubscriptionDTO)
        //dispatch(userSubscriptionSlice.actions.setUserSubscription(userSubscriptionDTO));
      //  setShowSuccessMessage(true);
        setShowForm(false); 
        console.log('showForm', showForm)
      
  
      } catch (error) {
        console.log(error);
        setMessage('Subscription Failed! Please try again');
      } 
   
    }
  };



  return (
    <>
 {/* {showSuccessMessage &&   <div>Subscription updated successfully!</div>} */}
      {showForm && 
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
      <div className="container d-flex justify-content-center py-4 mt-5">
        <div>{message}</div>
      </div>
    </>
    }
  </>
  );
}

export default SubscriptionForm;