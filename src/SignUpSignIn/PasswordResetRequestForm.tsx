import Modal from 'react-modal';
import React, { FC, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import UserContext from '../Contexts/UserContext';
import { useNavigate } from 'react-router-dom';

interface PasswordResetProps {
    isModal: boolean;
    closeModal: () => void;
    changeModalContent: (content: string) => void;
}
const PasswordResetRequestForm: React.FC<{
  isModal: boolean;
  closeModal: () => void;
  changeModalContent: (content: string) => void;
}> = ({ isModal, closeModal, changeModalContent }) => {
  
  const customStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      backgroundColor: 'white',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      border: '1px solid #ccc',
      borderRadius: '5px',
      boxShadow: '0 0 10px rgba(0,0,0,0.1)',
      width: '80%', 
      maxWidth: '500px', 
      padding: '20px',
      overflowY: "scroll" as "scroll",
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
};
const handleBackClick = () => {
  changeModalContent("signIn");
};
    const [email, setEmail] = useState('');
    const { user } = useContext(UserContext);
    const navigate = useNavigate();
  
    useEffect(() => {
      if (user?.isAuthorized) {
        // Redirect to dashboard or any other page if the user is already logged in
        navigate('/dashboard');
      }
    }, [user, navigate]);
    const handleSubmit = async (e: any) => {
        e.preventDefault();
        try {
          await axios.post('http://192.168.1.80:5053/api/ResetPassword/request-password-reset', { email });
          setEmail("");
          alert('If an account with that email exists, a password reset link has been sent.');
         
        } catch (error) {
          console.error('Error sending password reset request', error);
          // Optionally, keep the modal open here to show the error
          return; // Return early if you want the modal to stay open on error
        }
        closeModal();
       
      };
      

    return (
      <Modal isOpen={isModal} onRequestClose={closeModal} style={customStyles}>
         <button onClick={closeModal} className="modal-close-button">X</button>
    <button onClick={handleBackClick} className="modal-back-button"><i className="fa-duotone fa-backward"></i> Back to Sign In</button>
    <div className='request-reset-password-container py-4'>
      
        <form onSubmit={handleSubmit}>
         
            <div>
          <label htmlFor="email">Your Email:</label>
          <input className='form-control'
            type="email"
            value={email}
            id="email"
            onChange={(e) => setEmail(e.target.value)} 
            required 
          
          />
        </div>
            <div className='d-grid mt-3'>      
              <button type="submit" className='btn btn-secondary' >Send Password Reset Link</button>
            </div>
      
        </form>
        </div>
        </Modal>
    );
};

export default PasswordResetRequestForm;
