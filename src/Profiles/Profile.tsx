import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

type UserProfile = {
    userProfileID: number;
    fullName: string;
    bio: string | null;
    profilePicturePath: string | undefined | null;
    location: string | null;
    websiteURL: string | null;

};



const Profile: React.FC = () => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const { userId } = useParams<{ userId: string }>();
    useEffect(() => {
        fetch(`/api/Profile/${userId}`)
        .then(response => response.json())
        .then(data => setProfile(data))
        .catch(error => console.error('Error fetching profile:', error));
    }, [userId]);

    return (
        <>
        <div>
            {profile && (
                <div>
                    <h2>{profile.fullName}</h2>
                    <p>{profile.bio}</p>
               
                    <img src={profile.profilePicturePath || undefined} alt="Profile" />
                    <p>{profile.location}</p>
                    <a href={profile.websiteURL || undefined}>{profile.websiteURL}</a>
                </div>
            )}
        </div>
        </>
    )
    
}
export default Profile;