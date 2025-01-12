import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import './App.css';

import logo from './images/logos/alive-logo-transparent-png.png';
import Navbar from './Navbars/global_navbar';
import SignUp from './SignUpSignIn/SignUp';
import Profile from './Profiles/Profile';
import GoogleOneTapTest from './SignUpSignIn/GoogleSignUpTest';
import GoogleAuthHandler from './SignUpSignIn/GoogleMount';
import GoogleSignInButton from './SignUpSignIn/GoogleSignInButton';
import { GoogleOAuthProvider } from '@react-oauth/google';
import GoogleAuthButton from './SignUpSignIn/GoogleSignInButton';
import AuthCallback from './SignUpSignIn/AuthCallBack';
import Dashboard from './Dashboard/Dashboard';
import { UserProvider } from './Contexts/UserContext';
import SignIn from './SignUpSignIn/SignIn';
import PrivateRoute from './Authentication/PrivateRoute';
import { isAuthenticated } from './Authentication/IsTokenValid';
import { User } from './SignUpSignIn/types';
import PasswordResetRequestForm from './SignUpSignIn/PasswordResetRequestForm';
import ResetPassword from './SignUpSignIn/ResetPassword';
import Modal from 'react-modal';
import RoleBasedRoute from './Authentication/RoleBasedRoute';
import CreateProfile from './Profiles/CreateProfile';
import RoleCheck from './Authentication/RoleBasedRoute';
import { DiagnosticCategory } from 'typescript';
import { fetchUserInfo } from './SignUpSignIn/fetchUserInfo';
import TokenRefreshComponent from './Authentication/TokenRefreshComponent';

import ArtistBanner from './Profiles/ArtistBanner';
import CreateBannerLogo from './Profiles/ArtistProfiles/CreateBannerLogo';
import CreateArtistProfile from './Profiles/ArtistProfiles/CreateArtistProfile';
import ArtistProfile from './Profiles/ArtistProfiles/ArtistProfile';
import UploadTrackForm from './Artists/UploadTrackForm';
import JobInfo from './Artists/JobInfo';
import TracksList from './Artists/TrackList';
import UpdateProfile from './Profiles/UpdateUserProfile';
import Footer from './Footer/Footer';
import EmojiPickerTest from './Artists/EmotePickerTest';
import ArtistTracksList from './Artists/BackOffice/ArtistTrackList';
import CreateAlbum from './Artists/BackOffice/CreateAlbum';
import AlbumsList from './Artists/BackOffice/AlbumList';
import SubscriptionForm from './Subscriptions/SubscriptionForm';
import UserArtistProfile from './Profiles/UserArtistProfile';
import LatestTracks from './Generic/LatestTracks';
interface AuthCallbackProps {
  setUser: Dispatch<SetStateAction<User>>;
}

function App() {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalSignInOpen, setIsModalSignInOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  const openModal = () => {
    setIsModalOpen(true);
    setIsModalSignInOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setIsModalSignInOpen(false);
  };


  const [modalContent, setModalContent] = useState("signIn");

  const openSignInModal = () => {
    setModalContent("signIn");
    setIsModalSignInOpen(true);
  };

  const openPasswordResetModal = () => {
    setModalContent("passwordReset");
    setIsModalSignInOpen(true);
  };
  const openModalWithContent = (content: any) => {
    setModalContent(content);
    setIsModalSignInOpen(true);
  };



  const handleForgotPasswordClick = () => {
    setModalContent("signIn");
  };

  {isModalOpen && <SignUp isModal={isModalOpen} closeModal={closeModal} openSignInModal={openSignInModal} />}






  return (
    <>
      <TokenRefreshComponent />
      <header>
        <Navbar
          openModal={() => setIsModalOpen(true)}
          openSignInModal={() => setIsModalSignInOpen(true)}
        />
      {isModalOpen && <SignUp isModal={isModalOpen} closeModal={closeModal} openSignInModal={openSignInModal} />}
        {isModalSignInOpen && (
          modalContent === "signIn" ? (
            <SignIn
              isModal={isModalSignInOpen}
              closeModal={closeModal}
              changeModalContent={setModalContent}
            />
          ) : modalContent === "passwordReset" ? (
            <PasswordResetRequestForm
              isModal={isModalSignInOpen}
              closeModal={closeModal}
              changeModalContent={setModalContent}
            />
          ) : null
        )}
      </header>
  

      {user && !user.isAuthorized && <h1>Welcome to Alive!</h1>}

      <Routes>
        <Route path="/google" element={<GoogleOneTapTest />} />
        <Route path="/profile/:userId" element={<Profile />} />
        <Route path="/google-auth" element={<GoogleAuthHandler />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/reset-password" element={<ResetPassword />} />
       
      


        <Route path='/create-profile' element={
          <RoleCheck roles={['Admin', 'Manager', 'Employee', 'SubscribingMember', 'NonPayingMember']}>
            <CreateProfile />
          </RoleCheck>
        } />

        <Route path='/update-profile' element={
          <RoleCheck roles={['Admin', 'Manager', 'Employee', 'SubscribingMember', 'NonPayingMember']}>
            <UpdateProfile />
          </RoleCheck>
        } />

        <Route path='/dashboard' element={
          <RoleCheck roles={['Admin', 'Manager', 'Employee', 'SubscribingMember', 'NonPayingMember']}>
            <Dashboard />
          </RoleCheck>
        } />
            <Route path='/profile' element={
          <RoleCheck roles={['Admin', 'Manager', 'Employee', 'SubscribingMember', 'NonPayingMember']}>
            <Profile />
          </RoleCheck>
        } />

<Route path='/artistProfile' element={
          <RoleCheck roles={['Admin', 'Manager', 'Employee', 'SubscribingMember', 'NonPayingMember']}>
            <CreateArtistProfile />
          </RoleCheck>
        } />

        
<Route path='/create-artistProfile' element={
          <RoleCheck roles={['Admin', 'Manager', 'Employee', 'SubscribingMember', 'NonPayingMember']}>
            <CreateBannerLogo />
          </RoleCheck>
        } />

<Route path='/artistBanner' element={
          <RoleCheck roles={['Admin', 'Manager', 'Employee', 'SubscribingMember', 'NonPayingMember']}>
            <ArtistBanner />
          </RoleCheck>
        } />

<Route path='/getartistprofile/:artistId' element={
          <RoleCheck roles={['Admin', 'Manager', 'Employee', 'SubscribingMember', 'NonPayingMember']}>
            <ArtistProfile />
          </RoleCheck>
        } />

<Route path='/getuserartistprofile' element={
          <RoleCheck roles={['Admin', 'Manager', 'Employee', 'SubscribingMember', 'NonPayingMember']}>
            <UserArtistProfile />
          </RoleCheck>
        } />

<Route path='/uploadTrack' element={
          <RoleCheck roles={['Admin', 'Manager', 'Employee', 'SubscribingMember', 'NonPayingMember']}>
            <UploadTrackForm />
          </RoleCheck>
        } />




<Route path='/tracklist/:artistId' element={
          <RoleCheck roles={['Admin', 'Manager', 'Employee', 'SubscribingMember', 'NonPayingMember']}>
            <TracksList />
          </RoleCheck>
        } />

<Route path='/artist-tracklist' element={
          <RoleCheck roles={['Admin', 'Manager', 'Employee', 'SubscribingMember', 'NonPayingMember']}>
            <ArtistTracksList />
          </RoleCheck>
        } />

{/* <Route path='/albumlist/:artistId' element={
          <RoleCheck roles={['Admin', 'Manager', 'Employee', 'SubscribingMember', 'NonPayingMember']}>
            <AlbumsList />
          </RoleCheck>
        } /> */}

<Route path='/create-album' element={
          <RoleCheck roles={['Admin', 'Manager', 'Employee', 'SubscribingMember', 'NonPayingMember']}>
            <CreateAlbum />
          </RoleCheck>
        } />
        <Route path='/emotepicker' element={
          <RoleCheck roles={['Admin', 'Manager', 'Employee', 'SubscribingMember', 'NonPayingMember']}>
            <EmojiPickerTest />
          </RoleCheck>
        } />

<Route path='/subscription' element={
          <RoleCheck roles={['Admin', 'Manager', 'Employee', 'SubscribingMember', 'NonPayingMember']}>
            <SubscriptionForm />
          </RoleCheck>
        } />

<Route path='/latesttracks' element={
          <RoleCheck roles={['Admin', 'Manager', 'Employee', 'SubscribingMember', 'NonPayingMember']}>
            <LatestTracks />
          </RoleCheck>
        } />






      </Routes>
      <footer>
        <Footer />
      </footer>
    </>
  );

}

export default App;
