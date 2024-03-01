import { jwtDecode } from "jwt-decode";
import { useEffect, useRef, useState } from "react";
import AvatarEditor from "react-avatar-editor";
import { useParams } from "react-router-dom";

type UserProfile = {
    userProfileID: number;
    fullName: string;
    bio: string | null;
    profilePicturePath: string | undefined | null;
    bannerPicturePath: string | undefined | null; // Add this line
    location: string | null;
    websiteURL: string | null;
};

const token = localStorage.getItem('userJWTToken');
let userId = '';
if (token) {
  const decodedToken: any = jwtDecode(token);
  userId = decodedToken.nameid;
}


const Profile: React.FC = () => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [bannerPic, setBannerPic] = useState<File | null>(null);
    const [bannerPicURL, setBannerPicURL] = useState<string | null>(null);
    const bannerEditor = useRef<AvatarEditor>(null);// Define editor
    const [scale, setScale] = useState(1.0); // Define setScale
    const [position, setPosition] = useState({ x: 0.5, y: 0.5 });
    const [bannerPicBlob, setBannerPicBlob] = useState<Blob | null>(null);

    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const [editorWidth, setEditorWidth] = useState(window.innerWidth);

    useEffect(() => {
        const fetchProfile = async () => {
          const response = await fetch(`http://192.168.1.80:5053/api/profile/${userId}`);
          const data = await response.json();
          setProfile(data);
        };
    
        fetchProfile();
    }, [userId]);


    const handleScale = (e: any) => {
        const scale = parseFloat(e.target.value);
        setScale(scale);
      };

      const handleSaveBanner = () => {
        if (bannerEditor.current) {
          const canvas = bannerEditor.current.getImageScaledToCanvas();
          canvas.toBlob((blob) => {
            setBannerPicBlob(blob);
            if (blob) {
              setBannerPicURL(URL.createObjectURL(blob));
            }
          });
        }
      };

      const handleNewBannerImage = (e: any) => {
        if (e.target.files) {
          setBannerPic(e.target.files[0]);
          setBannerPicURL(URL.createObjectURL(e.target.files[0]));
        }
      };


      useEffect(() => {
        const handleResize = () => {
            setEditorWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);
      
  if (!profile) {
    return <div>Loading...</div>;
  }
    return (
        <>
      {isUpdatingProfile && (
            <div className="updateProfileForm">
                {/* Add your form for updating the profile information here */}
                <div className="bannerPic mt-2">
                    <label htmlFor="BannerPic">Banner Picture:</label>
                    <input type="file" onChange={handleNewBannerImage} />
                    {bannerPicURL && (
                        <div>
                        <AvatarEditor
                                ref={bannerEditor}
                                image={bannerPicURL}
                                width={editorWidth}
                                height={250}
                                border={50}
                                color={[255, 255, 255, 0.6]} // RGBA
                                scale={scale}
                                position={position}
                                onPositionChange={setPosition}
                            />
                            <input name="scale" type="range" onChange={handleScale} min="1" max="2" step="0.01" defaultValue="1" />
                            <button onClick={handleSaveBanner}>Save</button>
                        </div>
                    )}
                </div>
            </div>
        )}
        <div className="container d-flex justify-content-center py-4">
            {profile && (
                <div>
                    <h2>{profile.fullName}</h2>
                    <p>{profile.bio}</p>
               
                    <img src={profile.profilePicturePath || undefined} alt="Profile" />
                    <p>{profile.location}</p>
                    <a href={profile.websiteURL || undefined}>{profile.websiteURL}</a>
                    <button onClick={() => setIsUpdatingProfile(true)}>Update Profile</button>
                </div>
            )}
        </div>
      
        </>
    )
    
}
export default Profile;