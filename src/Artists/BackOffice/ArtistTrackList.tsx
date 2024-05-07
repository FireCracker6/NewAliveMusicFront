import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Track from '../Track';
import resolveJsonReferences from '../Helpers/resolveJsonReferences';
import TrackMenu from './TrackMenu';
import { useUserSubscription } from '../../Contexts/UserSubscriptionContext';
interface Track {
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
    artistPicturePath: string;
  }
const ArtistTracksList: React.FC = () => {
  const { userSubscription } = useUserSubscription();
  const artistId = userSubscription?.artists?.$values[0]?.artistID;
  console.log('Artist ID:', artistId);
  const [localArtistId, setLocalArtistId] = useState<number | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [artistName, setArtistName] = useState<string | null>(null);
  const [artistPicturePath, setArtistPicturePath] = useState<string | null>(null);
  const [blobName, setBlobName] = useState<string | null>(null);


  
  const removeTrackById = (id: any) => {
    setTracks(tracks.filter(track => track.trackID !== id));
};
  const jobId = "3da13b83-de45-4838-a44d-f5f0d2bfa284";
  const apiKey = "2555cad4-34a6-427a-a2e8-965f848f69fc";
  
  const isValidUrl = (string: string) => {
    console.log('Checking if valid URL:', string);
    try {
      new URL(string);
    } catch (_) {
      return false;  
    }
  
    return true;
  };

  useEffect(() => {
    setLocalArtistId(artistId);
  }, [artistId]);

  useEffect(() => {
   
    
    const fetchTracks = async () => {
      if (!localArtistId) {
        return;
      }
      const url = `http://192.168.1.80:5053/api/Track/artist/${localArtistId}`;
      console.log('API call URL:', url);
      const response = await axios.get(`http://192.168.1.80:5053/api/Track/artist/${localArtistId}`);
      const data = resolveJsonReferences(response.data);
      setTracks(data as Track[]);
      if (response.data.$values[0]) {
        console.log('First track data:', response.data.$values[0]);
        if (response.data.$values[0].album) {
          setArtistName(response.data.$values[0].album.artist.artistName);
          setArtistPicturePath(response.data.$values[0].album.artist.artistPicturePath);
          if (isValidUrl(response.data.$values[0].trackFilePath)) {
            const url = new URL(response.data.$values[0].trackFilePath);
            console.log('URL pathname:', url.pathname);
            const blobNameUrl = url.pathname.split('/').pop();
            console.log('URL:', response.data.$values[0].trackFilePath); // Changed this line
            console.log('Extracted blob name:', blobNameUrl);
            setBlobName(blobNameUrl ?? '');
          }
        } else {
          setArtistName(response.data.$values[0].artist.artistName);
          setArtistPicturePath(response.data.$values[0].artist.artistPicturePath);
          if (isValidUrl(response.data.$values[0].trackFilePath)) {
            const url = new URL(response.data.$values[0].trackFilePath);
            console.log('URL pathname:', url.pathname);
            const blobNameUrl = url.pathname.split('/').pop();
            console.log('URL:', response.data.$values[0].trackFilePath); // Changed this line
            console.log('Extracted blob name:', blobNameUrl);
            setBlobName(blobNameUrl ?? '');
          }
        }
      }
    };
  
    fetchTracks();
  }, [localArtistId]);


  useEffect(() => {
    console.log('blobName', blobName);
  }, [blobName]);
  return (
    <div className='mb-5 pb-5'>
      <div className="artisttrack-profile">
        <div className="artisttrack-banner">
          <img src={artistPicturePath ?? ''} alt={artistName ?? 'artist name'} />
        </div>
        <div className='artisttrack-header'>
          <h1>Artist: {artistName}</h1>
          <h2>Tracks</h2>
        </div>
        {tracks.map(track => {
          return (
            <div className='container d-flex justify-content-center' key={track.trackID}>
              <div className='artisttracks'>
                <h3>{track.trackName}</h3>
                <Track src={track.trackFilePath} />
                <div className='track-menu'>
                <TrackMenu track={track} jobId={jobId} apiKey={apiKey} trackUrl={track.trackFilePath} blobName={blobName} removeTrackById={removeTrackById}/>
              </div>
              </div>
    
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ArtistTracksList;