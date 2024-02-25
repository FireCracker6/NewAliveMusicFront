

import { faEnvelope, faLock } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import GoogleAuthButton from './GoogleSignInButton';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import  UserContext  from '../Contexts/UserContext';
import { fetchUserInfo } from './fetchUserInfo';
import PasswordResetRequestForm from './PasswordResetRequestForm';
import { CustomJwtPayload } from './AuthCallBack';
import Modal from 'react-modal';


interface SignInProps {
    isModal: boolean;
    closeModal: () => void;
    changeModalContent: (content: string) => void;
}



  

declare global {
    interface Window {
        gapi: any;
        handleCredentialResponse?: (response: any) => void;
    }
}

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

const SignIn: React.FC<SignInProps> = ({ isModal, closeModal, changeModalContent }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberme, setrememberme] = useState(false);
    
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const userContext = useContext(UserContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState("passwordReset"); // "signIn" or "passwordReset"
    const openModal = () => setIsModalOpen(true);
    const { setUserWithLocalStorage } = useContext(UserContext);
    if (!userContext) {
      throw new Error('SignIn must be used within UserProvider');
    }
    const { setUser } = userContext; 
  const navigate = useNavigate();
  const handleForgotPasswordClick = () => {
    changeModalContent("passwordReset");
  };
    
    const isEmailValid = (email: string) => {
        const emailRegex =  /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        return emailRegex.test(email);
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setEmail(value);
        if (!value) {
            setEmailError("Email is required");
        } else if (!isEmailValid(value)) {
            setEmailError("Please enter a valid email");
        } else {
            setEmailError("");
        }
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setPassword(value);
        if (!value) {
            setPasswordError("Password is required");
        } else if (value.length < 8 ) {
            setPasswordError("Password should be at least 8 characters");
        } else {
            setPasswordError("");
        }
    };

    const loginRequest = {
        email,
        password,
        rememberme,
      };
      const handleRememberMeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setrememberme(e.target.checked);
    };

 // Google Signup


const startGoogleOneTap = () => {
    if (window.google && window.google.accounts.id) {
        window.google.accounts.id.prompt();
    } else {
        console.error("Google One Tap library not loaded.");
    }
};
useEffect(() => {
    loadGoogleScript(() => {
        (window.google.accounts.id as any).initialize({
            client_id: '239924498555-ttk9cn2eg5j31kh85jdgidu1gm1qbhpo.apps.googleusercontent.com',
         //   callback: handleGoogleResponse
        });
        console.log("Google Script Loaded.");
        // Prompting the user after initialization
        startGoogleOneTap();
    });
}, []);






const loadGoogleScript = (callback: ((this: GlobalEventHandlers, ev: Event) => any) | null) => {
    const script = document.createElement("script");
    //script.defer = true
    script.referrerPolicy = "same-origin-allow-popups"
    script.src = "https://accounts.google.com/gsi/client";
    
    script.onload = callback;
    document.body.appendChild(script);
};
const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (emailError || passwordError) {
        console.error("Validation errors present");
        console.log(emailError, passwordError);

        return;
    }
    
    try {
        // Call your API endpoint for sign-in
        const response = await axios.post('http://192.168.1.80:5053/api/users/login', {
          email: email,
          password: password,
          rememberme: rememberme 
        });
      
        if (response.status === 200) {
          const token = response.data.token; // Corrected token access
      
          if (typeof token !== 'string') {
            console.error('Token is not a string:', token);
            return;
          }
      
          try {
            const userInfo = await fetchUserInfo(token);
            if (userInfo) {
              setUserWithLocalStorage(userInfo); // Store user data in localStorage
              navigate('/dashboard');
            }
          } catch (error) {
            console.error("Error fetching user info:", error);
          }
      
          // Close the modal after successful login
          closeModal();
        }
      } catch (error) {
        console.error("An error occurred during the login process", error);
      }
    }

    return (
        <>
            <Modal isOpen={isModal} onRequestClose={closeModal} style={customStyles}>
            <button onClick={closeModal} className="modal-close-button">X</button>
                <div className="sign-up-container">
                    <form className="sign-up-form" onSubmit={handleSubmit}>
                        <div className='container py-4 d-flex justify-content-center'>
                            <h2>Sign in to your account </h2>
                        </div>
                        <div className="mb-3 position-relative">
                            <label htmlFor="email" className="form-label-top">Email</label>
                            <input
                        type="email"
                        className="form-control"
                        id="email"
                        value={email}
                        onChange={handleEmailChange}
                        aria-describedby="emailHelp"
                    />
                    {emailError && <span className="text-danger">{emailError}</span>}
                            <FontAwesomeIcon icon={faEnvelope} className="icon-right" />
                            
                        </div>
                        <div className="mb-3 position-relative">
                            <label htmlFor="password" className="form-label-top">Password</label>
                            <input
                                type="password"
                                className="form-control"
                                id="password"
                                value={password}
                                onChange={handlePasswordChange}
                                aria-describedby="emailHelp"
                            />
                            {passwordError && <span className="text-danger">{passwordError}</span>}

                            <FontAwesomeIcon icon={faLock} className="icon-right" />
                        
                        </div>
                        <div className="remember-me mb-3 position-relative">
                       
                        <input type="checkbox" 
                        className='me-1'
                         id="rememberme"
                          name="rememberme"
                          value="RememberMe"
                          checked={rememberme}
                          onChange={handleRememberMeChange}

                           />
                        <label htmlFor="rememberme" className=' form-lable-top'>Remember Me</label>
                        </div>
                       
                            <div className='d-grid'>
                                <button type="submit" className="btn btn-secondary">Login to Alive!</button>
                            </div>
                            <div className='remember-me d-flex justify-content-center mt-2'>
  
  
    <button type="button" className='forgot-pwd-button ' onClick={handleForgotPasswordClick}>Forgot Password?</button>


</div>


                                            {/*Sign up with google */}
                                           
                    </form>
                   <div className='container d-flex justify-content-center py-2'>
                   <GoogleAuthButton 
                    clientId="239924498555-ttk9cn2eg5j31kh85jdgidu1gm1qbhpo.apps.googleusercontent.com"
                    redirectUri="http://localhost:3000/auth/callback"
                    scope="profile email"
                    onStartGoogleOneTap={startGoogleOneTap}
                    actionType='signIn'
                    

                     />

                   </div>
                
                </div>
            </Modal>
        </>
    )
}
export default SignIn;