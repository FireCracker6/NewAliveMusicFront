import axios from "axios";
import userSubscriptionSlice from "../../Redux/Reducers/userSubscriptionSlice";
import { Dispatch } from 'redux';

    interface Window { paypal: any; }

    declare var process : {
        env: {
          PAYPAL_CLIENT_ID : string
        }
      }
      
      const redirectToPayPal = async (userSubscriptionDTO: any, price: string) => {
        // Get the PayPal client ID from the server
        console.log('Getting PayPal client ID...');
        const response = await axios.get('/api/paypal-client-id');
        console.log('Got PayPal client ID:', response.data.clientId);
        const clientId = response.data.clientId;
        const { setUserSubscription } = userSubscriptionSlice.actions;
      
        // Load the PayPal JavaScript SDK
        const script = document.createElement('script');
        script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}`;
      
        // Create a new promise that resolves when the script is loaded
        const scriptLoadPromise = new Promise((resolve, reject) => {
          script.onload = () => {
            // Create the PayPal button
            const paypal = (window as any).paypal;
            paypal.Buttons({
              createOrder: (data: any, actions: any) => {
                // Set up the transaction
                return actions.order.create({
                  purchase_units: [{
                    amount: {
                      value: price // Use the passed price
                    }
                  }]
                });
              },
              onApprove: async (data: any, actions: any) => {
                // Capture the transaction
                const order = await actions.order.capture();
      
                // After the transaction is successful, update the user's subscription
                console.log('Updating user subscription...');
                try {
                  const response = await axios.post('http://192.168.1.80:5053/api/Subscription/subscription', userSubscriptionDTO);
                  console.log('Updated user subscription:', response.data);
                  resolve(response.data); // Resolve the promise with the updated subscription
                
                } catch (error) {
                  console.log('Error updating user subscription:', error);
                  reject(error); // Reject the promise with the error
                }
              }
            }).render('#paypal-button-container');
          };
        });
      
        document.body.appendChild(script);
      
        // Return the promise
        return scriptLoadPromise;
      }
export default redirectToPayPal;

function dispatch(arg0: { payload: any; type: "userSubscription/setUserSubscription"; }) {
  throw new Error("Function not implemented.");
}
