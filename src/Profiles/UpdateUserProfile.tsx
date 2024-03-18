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
  const [isEditing, setIsEditing] = useState(false);

  const toggleEditing = () => {
    setIsEditing(!isEditing);
  };

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
<>
    {/* <div className="container d-flex justify-content-center py-4">
      
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
            
            <input id="ProfilePic" className="mt-2  file-input" type="file" onChange={handleNewImage} />
            <label className="upload-button" htmlFor="ProfilePic">Upload New Image</label>
             

              {profilePicURL && (
                <div className="profile-canvas mt-2" >
                  <AvatarEditor 
                    ref={editor}
                    image={profilePicURL}
                    width={290}
                    height={290}
                    border={20}
                    color={[255, 255, 255, 0.6]} // RGBA
                    scale={scale}
                    position={position}
                    onPositionChange={setPosition}
                  />
                  <input className="mt-1" name="scale" type="range" onChange={handleScale} min="1" max="2" step="0.01" defaultValue="1" />
                 <div>
                 <button className="profile-button mt-1" onClick={handleSave}>Save Photo</button>
                 </div>
                </div>
              )}
            </div>

            <div className="button mt-4">
              <button className="profile-button " type="submit">Update Profile!</button>
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
    </div> */}

    <div className="container d-flex justify-content-center py-4">
    <div className="create-profile-grid">
     <div className="edit edit-buttons mb-2">
     <button onClick={toggleEditing}>
        {isEditing ? 'Cancel Editing' : 'Edit Profile'}
      </button>
     </div>
      {isEditing ? (
        // Render the editing form
        <>
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
            
            <input id="ProfilePic" className="mt-2  file-input" type="file" onChange={handleNewImage} />
            <label className="upload-button" htmlFor="ProfilePic">Upload New Image</label>
             

              {profilePicURL && (
                <div className="profile-canvas mt-2" >
                  <AvatarEditor 
                    ref={editor}
                    image={profilePicURL}
                    width={290}
                    height={290}
                    border={20}
                    color={[255, 255, 255, 0.6]} // RGBA
                    scale={scale}
                    position={position}
                    onPositionChange={setPosition}
                  />
                  <input className="mt-1" name="scale" type="range" onChange={handleScale} min="1" max="2" step="0.01" defaultValue="1" />
                 <div>
                 <button className="profile-button mt-1" onClick={handleSave}>Save Photo</button>
                 </div>
                </div>
              )}
            </div>

            <div className="button mt-2 mb-2">
              <button className="profile-button " type="submit">Update Profile!</button>
            </div>
          </form>
        </div>
        <div className="preview">
          {profilePicURL && <img src={profilePicURL} alt="Profile preview" />}
          <div className="mt-1">Name: {fullName}</div>
          <div className="mt-1">Bio: {bio}</div>
          <div className="mt-1">Location: {location}</div>
          <div className="mt-1">Web Site: {websiteURL}</div>
        </div>
       
        </>
      ) : (
        // Render the profile
        <>
         <div className="preview">
          {profilePicURL &&
          <div className="profile-prev-image">
          <img src={profilePicURL} alt="Profile preview" />
          </div>}
       <div className="preview-info pt-1">
       <div className="mt-1">Name: </div> <div>{fullName}</div>
          <div className="mt-1">Bio:</div>
          <div>{bio}</div>
          <div className="mt-1">Location:</div>
          <div> {location}</div>
          <div className="mt-1">Web Site:</div>
          <div> {websiteURL}</div>
       </div>
        </div>
        </>
      )}

    
      </div>

</div>
</>
  );
};

export default UpdateProfile;
