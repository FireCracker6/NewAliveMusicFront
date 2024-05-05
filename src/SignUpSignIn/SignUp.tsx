import Modal from 'react-modal';

import { faEnvelope, faLock } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useEffect, useState } from 'react';
import axios from 'axios';
import GoogleAuthButton from './GoogleSignInButton';
import { useNavigate } from 'react-router-dom';

interface SignUpProps {
    isModal: boolean;
    closeModal: () => void;
    openSignInModal: () => void;
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

const SignUp: React.FC<SignUpProps> = ({ isModal, closeModal, openSignInModal }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [confirmPasswordError, setConfirmPasswordError] = useState("");
    const navigate = useNavigate();
    const [isModalSignInOpen, setIsModalSignInOpen] = useState(false);
    const [modalContent, setModalContent] = useState("signIn");

  

    const isEmailValid = (email: string) => {
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
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
        } else if (value.length < 8) {
            setPasswordError("Password should be at least 8 characters");
        } else {
            setPasswordError("");
        }
    };

    const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        console.log("Typed Confirm Password:", value);
        console.log("Current Password:", password);
        setConfirmPassword(value);
        if (!value) {
            setConfirmPasswordError("Confirm password is required");
        } else if (value !== password) {
            setConfirmPasswordError("Passwords do not match");
        } else {
            setConfirmPasswordError("");
        }
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
                callback: handleGoogleResponse
            });
            console.log("Google Script Loaded.");
            // Prompting the user after initialization
            startGoogleOneTap();
        });
    }, []);




    const handleGoogleResponse = (response: any) => {
        const token = response.credential;
        if (token) {
            handleCredentialResponse(token);
        } else {
            console.error("Google authentication failed. No credential provided.");
        }
    };

    const handleCredentialResponse = async (token: string) => {
        console.log("Google token:", token);

        try {
            const response = await axios.post('http://192.168.1.80:5053/api/users/register', { token });

            if (response.status === 200) {
                console.log("Signup or authentication successful!", response.data);

                // Storing the received token and redirecting
                localStorage.setItem('token', response.data.token);
                navigate('/dashboard');
            }
        } catch (error: any) {
            console.error("Error:", error.response ? error.response.data : error.message);
            if (error.response && error.response.data && error.response.data.errors) {
                console.log("Validation errors:", error.response.data.errors);
            }
        }
    };

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

        if (emailError || passwordError || confirmPasswordError) {
            console.error("Validation errors present");
            console.log(emailError, passwordError, confirmPasswordError);

            return;
        }


        try {
            const response = await axios.post('http://192.168.1.80:5053/api/users/register', {
                email,
                password,
                confirmPassword
            });


            if (response.status === 201) {
                closeModal()
                console.log("Signup successful!", response.data);
                console.log("sign up data", response.data);


                // Storing the received token and redirecting
                localStorage.setItem('token', response.data.content.token);

                console.log("token data " + response.data.content.token)


                openSignInModal();

            }
        } catch (error: any) {
            console.error("Error signing up:", error.response ? error.response.data : error.message);
            if (error.response && error.response.data && error.response.data.errors) {
                console.log("Validation errors:", error.response.data.errors);
            }
        }
    }

    return (
        <>
            <Modal isOpen={isModal} onRequestClose={closeModal} style={customStyles}>
                <button onClick={closeModal} className="modal-close-button">X</button>
                <div className="sign-up-container">
                    <form className="sign-up-form" onSubmit={handleSubmit}>
                        <div className='container py-4 d-flex justify-content-center'>
                            <h2>Create your account </h2>
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
                        <div className="mb-3 position-relative">
                            <label htmlFor="confirmPassword" className="form-label-top">Confirm Password</label>
                            <input
                                type="password"
                                className="form-control"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={handleConfirmPasswordChange}
                            />

                            {confirmPasswordError && <span className="text-danger">{confirmPasswordError}</span>}
                            <FontAwesomeIcon icon={faLock} className="icon-right" />
                        </div>
                        <div className='d-grid'>
                            <button type="submit" className="btn btn-secondary">Sign Up</button>
                        </div>


                        {/*Sign up with google */}

                    </form>
                    <div className='container d-flex justify-content-center py-4'>
                        <GoogleAuthButton
                            clientId="239924498555-ttk9cn2eg5j31kh85jdgidu1gm1qbhpo.apps.googleusercontent.com"
                            redirectUri="http://localhost:3000/auth/callback"
                            scope="profile email"
                            onStartGoogleOneTap={startGoogleOneTap}
                            actionType='signUp'
                        />

                    </div>

                </div>
            </Modal>
        </>
    )
}
export default SignUp;