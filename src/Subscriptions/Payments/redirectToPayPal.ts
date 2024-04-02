import axios from "axios";

    interface Window { paypal: any; }

    declare var process : {
        env: {
          PAYPAL_CLIENT_ID : string
        }
      }
      
      const redirectToPayPal = async (userSubscriptionDTO: any, price: string) => {
        // Get the PayPal client ID from the server
        const response = await axios.get('/api/paypal-client-id');
        const clientId = response.data.clientId;
      
        // Load the PayPal JavaScript SDK
        const script = document.createElement('script');
        script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}`;
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
          try {
            const response = await axios.post('http://192.168.1.80:5053/api/Subscription/subscription', userSubscriptionDTO);
            console.log(response.data);
          } catch (error) {
            console.log(error);
          }
        }
      }).render('#paypal-button-container');
    };
    document.body.appendChild(script);
  }
export default redirectToPayPal;