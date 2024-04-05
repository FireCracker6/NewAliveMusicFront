import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import UserContext from '../../Contexts/UserContext';
import { jwtDecode } from 'jwt-decode';
import { isAuthenticated } from '../../Authentication/IsTokenValid';
import { useDispatch } from 'react-redux';
import AvatarEditor from 'react-avatar-editor';
import { useUserSubscription } from '../../Contexts/UserSubscriptionContext';

interface Tracks {
    artistName: string;
    trackID: number;
    jobID: string | null;
    trackName: string;
    duration: string;
    trackNumber: number;
    lyrics: string | null;
    trackFilePath: string;
    albumID: number | null;
    album: any;
    artistID: number;
    artist: Artist;
    
  }
  interface Artist {
    artistID: number;
    artistName: string;
    bio: string;
    coverImagePath: string;
  }
  const CreateAlbum: React.FC = () => {
    const { userSubscription } = useUserSubscription();
    const artistId = userSubscription?.artists?.$values[0]?.artistID;
    const [tracks, setTracks] = useState([]);
    const [selectedTracks, setSelectedTracks] = useState<Tracks[]>([]);
    const [albumName, setAlbumName] = useState('');
    const [description, setDescription] = useState('');
    const [genre, setGenre] = useState('');
    const [artistName, setArtistName] = useState('');
    const [coverImagePath, setCoverImagePath] = useState('');
    const [userId, setUserId] = useState<string | undefined>(undefined);
    const { user } = useContext(UserContext);
    const dispatch = useDispatch();

    const [coverImage, setCoverImage] = useState<File | null>(null);
    const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
    const [coverImageBlob, setCoverImageBlob] = useState<Blob | null>(null);
    const [coverImageExtension, setCoverImageExtension] = useState('');

    const [coverImageScale, setCoverImageScale] = useState(1.0);
    const editor = useRef<AvatarEditor>(null);
    const [poisiton, setPosition] = useState({ x: 0.5, y: 0.5 });

    const handleNewImage = (e: any) => {
      if (e.target.files) {
        setCoverImage(e.target.files[0]);
        setCoverImageUrl(URL.createObjectURL(e.target.files[0]));
        setCoverImageExtension(e.target.files[0].name.split('.').pop());
      }
    }

      const handleScale = (e: any) => {
        const scale = parseFloat(e.target.value);
        setCoverImageScale(scale);
      }

        const handleSave = () => {
            if (editor.current) {
            const canvas = editor.current.getImageScaledToCanvas();
            canvas.toBlob((blob) => {
                setCoverImageBlob(blob);
                if (blob) {
                setCoverImageUrl(URL.createObjectURL(blob));
                }
            });
            }
        }

    useEffect(() => {
        const token = localStorage.getItem('userJWTToken');
        if (isAuthenticated()) {
          const decodedToken: any = jwtDecode(token ?? '');
          setUserId(decodedToken.nameid);
        }
      }, [dispatch, user]);
    useEffect(() => {
      // Fetch the tracks uploaded by the artist
      const fetchTracks = async () => {
        const response = await axios.get(`http://192.168.1.80:5053/api/Track/artist/${artistId}`);
        setTracks(response.data.$values);
  console.log('Tracks:', response.data.$values);
        // If there are tracks and they have artist information, use it to pre-populate the form fields
        if (response.data.$values.length > 0 && response.data.$values[0].artist) {
          setArtistName(response.data.$values[0].artist.artistName);
          setCoverImagePath(response.data.$values[0].artist.artistPicturePath);
          setDescription(response.data.$values[0].artist.description);
          setGenre(response.data.$values[0].artist.genre);
        }
      };
  
      fetchTracks();
    }, []);

  const handleTrackSelect = (trackId: any) => {
    setSelectedTracks([...selectedTracks, trackId]);
  };

  const handleAlbumNameChange = (event: any) => {
    setAlbumName(event.target.value);
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();

    handleSave();
    const formData = new FormData();
    formData.append('artistId', artistId ?? '');
    formData.append('artistName', artistName);
    formData.append('albumName', albumName);
    selectedTracks.forEach((trackId) => {
        formData.append('trackIds', trackId.toString());
    });
    formData.append('description', description);
    formData.append('genre', genre);
    formData.append('coverImagePath', coverImagePath);
    formData.append('userId', userId ?? '');
   
    if (coverImageBlob) {
      const blob = new Blob([coverImageBlob], { type: coverImageBlob.type });
      formData.append('coverImage', blob, `coverImage.${coverImageExtension}`);
    }
  
    try {
      const response = await axios.post('http://192.168.1.80:5053/api/Album/uploadalbum', formData);
      console.log('Album created successfully with ID:', response.data.albumID);
    } catch (error) {
      console.error('An error occurred while creating the album:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Album Name:
        <input type="text" value={albumName} onChange={handleAlbumNameChange} />
      </label>
      <div>Cover Image: 
        <input type="file" onChange={handleNewImage} />
        {coverImageUrl && (
            <div>
            <AvatarEditor
                ref={editor}
                image={coverImageUrl}
                width={250}
                height={250}
                border={50}
                color={[255, 255, 255, 0.6]} // RGBA
                scale={coverImageScale}
                position={poisiton}
            />
            <input type="range" min="1" max="2" step="0.01" value={coverImageScale} onChange={handleScale} />
            <button onClick={(event) => { event.preventDefault(); handleSave(); }}>Save</button>
            </div>
        )}
      </div>
      <div>
        Select Tracks:
        {tracks.map((track: any) => (
          <div key={track.trackID}>
            <input type="checkbox" id={track.trackID} name={track.trackName} onChange={() => handleTrackSelect(track.trackID)} />
            <label htmlFor={track.trackID}>{track.trackName}</label>
          </div>
        ))}
      </div>
   <div className='mb-4 pb-4'>
   <input type="submit" value="Create Album" />
   </div>
    </form>
  );
};

export default CreateAlbum;