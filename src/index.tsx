import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './App';
import reportWebVitals from './reportWebVitals';
import Modal from 'react-modal';
import { UserProvider } from './Contexts/UserContext';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './Redux/store';
import store from './Redux/store';
import { UserSubscriptionProvider } from './Contexts/UserSubscriptionContext';

// Create a Redux store with the rootReducer



// Setting the app element for react-modal
Modal.setAppElement('#root');

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <BrowserRouter>
   <Provider store={store}>
     <UserProvider>
      <UserSubscriptionProvider>
    <App />
    </UserSubscriptionProvider>
    </UserProvider>
    </Provider>
  </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

