import { useEffect, useRef, useState } from "react"
import AvatarEditor from 'react-avatar-editor'
import {jwtDecode} from 'jwt-decode';

const UpdateProfile = () => {
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [websiteURL, setWebSiteURL] = useState('');
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [profilePicURL, setProfilePicURL] = useState<string | null>(null);
  const editor = useRef<AvatarEditor>(null);// Define editor
  const [scale, setScale] = useState(1.0); // Define setScale
  const [position, setPosition] = useState({ x: 0.5, y: 0.5 });
  const [profilePicBlob, setProfilePicBlob] = useState<Blob | null>(null);


  useEffect(() => {
    const loadProfile = async () => {
      const token = localStorage.getItem('userJWTToken');
      let userId = '';
      if (token) {
        const decodedToken: any = jwtDecode(token);
        userId = decodedToken.nameid;
      }

      const response = await fetch(`http://192.168.1.80:5053/api/profile/${userId}`);
      const profile = await response.json();

      setFullName(profile.fullName);
      setBio(profile.bio);
      setLocation(profile.location);
      setWebSiteURL(profile.websiteURL);
        // Fetch the profile picture through the proxy
        const imageUrl = new URL(profile.profilePicturePath);
        const imagePath = imageUrl.pathname;
        console.log('imageUrl', imagePath)
      
        const profilePicResponse = await fetch(`http://192.168.1.80:5053/api/profile/profile-picture/${userId}`);
        const profilePicBlob = await profilePicResponse.blob();
        setProfilePicURL(URL.createObjectURL(profilePicBlob));
    };

    loadProfile();
  }, []);

    const handleNewImage = (e: any) => {
        if (e.target.files) {
        setProfilePic(e.target.files[0]);
        setProfilePicURL(URL.createObjectURL(e.target.files[0]));
        }
    };
    const handleScale = (e: any) => {
        const scale = parseFloat(e.target.value);
        setScale(scale);
      };
    
      const handleSave = (event: React.MouseEvent) => {
        event.preventDefault();

        const token = localStorage.getItem('userJWTToken');
        let userId = '';
        if (token) {
          const decodedToken: any = jwtDecode(token);
          userId = decodedToken.nameid;
        }
        if (editor.current) {
          const canvas = editor.current.getImageScaledToCanvas();
          canvas.toBlob(async (blob) => {
            setProfilePicBlob(blob);
            if (blob) {
              const objectUrl = URL.createObjectURL(blob);
              setProfilePicURL(objectUrl);
      
              // Create a FormData instance to send the blob
              const formData = new FormData();
              formData.append('file', blob);
              formData.append('userId', userId); // Replace 'userId' with the actual user ID
      
              // Send the blob to your server
              const response = await fetch('http://192.168.1.80:5053/api/profile/updateprofilepicture', {
                method: 'PUT',
                body: formData,
              });
      
              if (!response.ok) {
                // Handle error
                console.error('Failed to upload image');
            } else {
                // Fetch the updated profile picture from the server
                const updatedProfilePicResponse =  await fetch(`http://192.168.1.80:5053/api/profile/profile-picture/${userId}`);
                const updatedProfilePicBlob = await updatedProfilePicResponse.blob();
                const updatedProfilePicURL = URL.createObjectURL(updatedProfilePicBlob);
                setProfilePicURL(updatedProfilePicURL);
              }
            }
          });
        }
      };
  

  const handleSubmit = async (event: any) => {
    event.preventDefault();

      // Get the token from local storage or wherever it's stored
  const token = localStorage.getItem('userJWTToken');
  let userId = '';
  if (token) {
    const decodedToken: any = jwtDecode(token);
    userId = decodedToken.nameid;
  }

    const formData = new FormData();
    formData.append('fullName', fullName);
    formData.append('bio', bio);
    formData.append('location', location);
    formData.append('websiteURL', websiteURL);
    formData.append('userId', userId);
    if (profilePicBlob) {
      formData.append('profilePic', profilePicBlob);
    }

    // Send the form data to the updateprofile endpoint
    const response = await fetch('http://192.168.1.80:5053/api/profile/updateprofile', {
      method: 'PUT',
      body: formData,
    });

    const result = await response.json();
    console.log(result);
  };

  return (

    <div className="container d-flex justify-content-center py-4">
      <div className="create-profile-grid">
        <div className="form-container">
          <form onSubmit={handleSubmit} className="form">
            <div className="fullname">
              <label htmlFor="FullName">Full Name:</label>
              <input  type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="bio mt-2">
              <label htmlFor="Bio">Bio:</label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} />
            </div>
            <div className="location mt-2">
              <label htmlFor="Location">Location:</label>
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <div className="websiteURL mt-2">
              <label htmlFor="WebSiteURL">Web site URL:</label>
              <input type="text" value={websiteURL} onChange={(e) => setWebSiteURL(e.target.value)} />
            </div>
            <div className="profilePic mt-2">
              <label htmlFor="ProfilePic">Profile Picture:</label>
              <input type="file" onChange={handleNewImage} />
              import AvatarEditor from 'react-avatar-editor';

              {profilePicURL && (
                <div>
                  <AvatarEditor
                    ref={editor}
                    image={profilePicURL}
                    width={250}
                    height={250}
                    border={50}
                    color={[255, 255, 255, 0.6]} // RGBA
                    scale={scale}
                    position={position}
                    onPositionChange={setPosition}
                  />
                  <input name="scale" type="range" onChange={handleScale} min="1" max="2" step="0.01" defaultValue="1" />
                  <button onClick={handleSave}>Save</button>
                </div>
              )}
            </div>

            <div className="button mt-4">
              <button type="submit">Create Profile!</button>
            </div>
          </form>
        </div>
        <div className="preview">
          {profilePicURL && <img src={profilePicURL} alt="Profile preview" />}
          <h2 className="mt-1">Name: {fullName}</h2>
          <p className="mt-1">Bio: {bio}</p>
          <p className="mt-1">Location: {location}</p>
          <p className="mt-1">Web Site: {websiteURL}</p>
        </div>
      </div>
    </div>
  );
};

export default UpdateProfile;
