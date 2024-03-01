import React, { useContext, useEffect, useRef, useState } from 'react';
import logo from '../images/logos/alive-logo-transparent-png.png';
import SignUp from '../SignUpSignIn/SignUp';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { CustomJwtPayload } from '../SignUpSignIn/AuthCallBack';
import UserContext from '../Contexts/UserContext';


interface NavbarProps {
  openModal: () => void;
  openSignInModal: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ openModal, openSignInModal }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
 
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLLIElement | null>(null);
  const { user } = useContext(UserContext);

  const userEmail = user?.email;
  const navigate = useNavigate();

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const toggleDropdown = (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsDropdownOpen(!isDropdownOpen);
  };

  useEffect(() => {
    function handleClickOutside(event: Event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
  
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('userJWTToken');
      let userId = null;
      if (token) {
        const decoded = jwtDecode<CustomJwtPayload>(token);
        userId = decoded.nameid;
      }
  
      // Call the backend API to log out
      await axios.post(`http://192.168.1.80:5053/api/users/logout?userId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
  
      // Clear frontend storage and user context
      localStorage.removeItem('userJWTToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('email');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('roles');
      localStorage.removeItem('userFullName');
 
  
      navigate('/', { replace: true }); // Redirect to home 
      window.location.reload();
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };



  return (
    <nav className="navbar">
      <div className="container">
        <div className='logo'>
          ALIVE!
          <span className='subtitle'>Musical Minds</span>
        </div>
        <button title='navbar' className={`menu-toggle ${menuOpen ? 'open' : ''}`} onClick={toggleMenu}></button>
        <div className={`menu-groups ${menuOpen ? 'open' : ''}`}>
          <ul className="menu-group center">
            <li><a href="#">Who We Are</a></li>
            <li><a href="#">Our Vision</a></li>
          </ul>
          <ul className="menu-group right">
          {user?.email ? (
            <li ref={dropdownRef}>
              <a href="#" onClick={toggleDropdown}>
                {user?.email} <i className={`dropdown-icon ${isDropdownOpen ? 'open' : ''}`}></i>
              </a>
              {isDropdownOpen && (
                <div className="dropdown-menu">
                  <a href="#">Profile</a>
                  <a href="#">Account</a>
                  <a href="#" onClick={handleLogout}>Logout</a>
                </div>
              )}
            </li>
          ) : (
            <>
              <li><a href="#" onClick={openSignInModal}>Login</a></li>
              <li><a href="#" onClick={openModal}>Create Account</a></li>
            </>
          )}
          <li><a href="#">For Artists</a></li>
        </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;