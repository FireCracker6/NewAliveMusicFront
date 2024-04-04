import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import { useParams } from 'react-router-dom';

interface ArtistProfile {
    artistName: string;
    description: string;
    genre: string[];
    artistPicturePath?: string | undefined | null;
    bannerPicturePath?: string | undefined | null;
    userID: string;
}

const ArtistProfile = () => {
    const { artistId } = useParams();
    const [profile, setProfile] = useState<ArtistProfile | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            const response = await fetch(`http://192.168.1.80:5053/api/ArtistProfile/getartistprofilebyartistid/${artistId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            data.genre = JSON.parse(data.genre);
            setProfile(data);
        }
        fetchProfile();
    }, [artistId]);

    return (
        <>
          <div className="artist-profile">
    <div className="artist-banner">
        <img src={profile?.artistPicturePath ?? ''} alt="Artist " />
    </div>
    <div className="artist-info">
        <h1>{profile?.artistName}</h1>
        <p>{profile?.description}</p>
        <p>{profile?.genre?.join(', ')}</p>
    </div>
</div>
        </>
    );
};

export default ArtistProfile;