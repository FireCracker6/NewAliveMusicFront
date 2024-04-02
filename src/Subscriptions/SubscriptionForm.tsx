import { jwtDecode } from "jwt-decode";
import { useContext, useEffect, useState } from "react"
import { isAuthenticated } from "../Authentication/IsTokenValid";
import UserContext from "../Contexts/UserContext";
import { useDispatch } from "react-redux";
import axios from "axios";
import redirectToPayPal from "./Payments/redirectToPayPal";
import { useNavigate } from "react-router-dom";

const SubscriptionForm = () => {
    const [subscriptionPlanID, setSubscriptionPlanID] = useState(0);
    const [userId, setUserId] = useState<string | undefined>(undefined);
    const { user } = useContext(UserContext);
    const [message, setMessage] = useState('');
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

    const handleSubmit = async (event: any) => {
        event.preventDefault();
        console.log(subscriptionPlanID);
      
        const userSubscriptionDTO =  {
          UserID : userId,
          SubscriptionPlanID : subscriptionPlanID,
        };
      
        // Determine the price based on the subscriptionPlanID
        let price;
        if (subscriptionPlanID === 2) {
          price = '29.99';
        } else if (subscriptionPlanID === 3) {
          price = '49.99';
        }
      
        // If a paid subscription was selected, redirect to PayPal
        if (price) {
          redirectToPayPal(userSubscriptionDTO, price);
        } else {
            try {
                const response = await axios.post('http://192.168.1.80:5053/api/Subscription/subscription', userSubscriptionDTO);
                console.log(response.data);
               setMessage('Subscription Successful!, Redirecting to dashboard...');
               navigate('/dashboard');
              } catch (error) {
                console.log(error);
                setMessage('Subscription Failed! Please try again');
              }
            
        }
      };

      return (
        <>
          <div className="container d-flex justify-content-center py-4 mt-5">
            <form onSubmit={handleSubmit}>
              <label>
                Select Subscription:
                <select value={subscriptionPlanID} onChange={handleSubscrtionPlanChange}>
                  <option value="0">Free Membership (Upload up to 3 tracks, no AI access)</option>
                  <option value="2">Premium Membership (Upload up to 10 tracks, master 5 tracks, AI Access) - $29.99/month</option>
                  <option value="3">Unlimited Premium Membership (Upload up to 100 tracks, master 20 tracks, AI Access) - $49.99/month</option>
                </select>
              </label>
              <input type="submit" value="Submit" />
            </form>
            <div id="paypal-button-container"></div> {/* Add this line */}
          </div>
          <div className="container d-flex justify-content-center py-4 mt-5">
            <div>{message}</div>
          </div>
        </>
      );
}

export default SubscriptionForm;