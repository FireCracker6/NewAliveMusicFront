import { useContext, useEffect, useState } from "react"
import UserContext from "../Contexts/UserContext";
import { jwtDecode } from "jwt-decode";
import AlbumsList from "../Artists/BackOffice/AlbumList";

interface UserArtistProfile {
    fullName: string;
    bio: string;
    profilePicturePath?: string | undefined | null;
    location: string;
    websiteURL: string;
    artist: Artist;
    userID: string;
}

interface Artist {
    artistName: string;
    description: string;
    artistID: number;
    genre: string[];
    artistPicturePath?: string | undefined | null;
    bannerPicturePath?: string | undefined | null;
}


const UserArtistProfile = () => {
   
    const [userId, setUserId] = useState<string | undefined>(undefined);
    const [userArtistProfile, setUserArtistProfile] = useState<UserArtistProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchArtistProfile = async (userId: string) => {
            const response = await fetch(`http://192.168.1.80:5053/api/ArtistProfile/getartistprofileuserid/${userId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Response:', data);
            data.artist.genre = JSON.parse(data.artist.genre);
            console.log('genre:', data.artist.genre);
            setUserArtistProfile(data);
            setIsLoading(false);
        }

        const token = localStorage.getItem('userJWTToken');

        if (token) {
            const decodedToken: any = jwtDecode(token);
            setUserId(decodedToken.nameid);
            console.log('User ID:', decodedToken.nameid);
            fetchArtistProfile(decodedToken.nameid);
        }
    }, []);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <>
        <div className="artist-profile">
            <div className="artist-banner">
                <img src={userArtistProfile?.artist.artistPicturePath ?? ''} alt="Artist " />
            </div>
            <div className="artist-info">
                <h1>{userArtistProfile?.artist?.artistName}</h1>
                <p>{userArtistProfile?.artist?.description}</p>
                <p>{userArtistProfile?.artist?.genre.join(', ')}</p>
            </div>
            <div className="artist-info">
                    <h2>{userArtistProfile?.fullName}</h2>
                    <p>{userArtistProfile?.bio}</p>
               
                    <img src={userArtistProfile?.profilePicturePath || undefined} alt="Profile" />
                    <p>{userArtistProfile?.location}</p>
                    <a href={userArtistProfile?.websiteURL || undefined}>{userArtistProfile?.websiteURL}</a>
                  
                </div>

        </div>
       {userId && <AlbumsList artistID={userArtistProfile?.artist.artistID ?? 0 } />}
        </>
    )
}

export default UserArtistProfile;