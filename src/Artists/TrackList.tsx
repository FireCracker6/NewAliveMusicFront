import React, { useContext, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import Track from './Track';
import { app, db, realtimeDb } from '../Firebase/firebaseConfig';
import { addDoc, collection, getDocs, getFirestore, query, serverTimestamp, where } from 'firebase/firestore';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { addLikedTrack, fetchLikesCount, incrementLikesCount, likeTrack, updateLikedTrackIDs, updateLikesCount } from '../Redux/Reducers/likesSlice';
import { AppDispatch, RootState } from '../Redux/store';
import { jwtDecode } from 'jwt-decode';
import UserContext from '../Contexts/UserContext';
import { isAuthenticated } from '../Authentication/IsTokenValid';

import { ref, set, update, get, increment, onValue } from "firebase/database";
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
  likesCount: number;
}

interface Artist {
  artistID: number;
  artistName: string;
  bio: string;
  artistPicturePath: string;
}

const TracksList: React.FC = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [artistName, setArtistName] = useState<string | null>(null);
  const [artistPicturePath, setArtistPicturePath] = useState<string | null>(null);
  // const [likedTracks, setLikedTracks] = useState<number[]>([]);
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const { user } = useContext(UserContext);
  const dispatch = useDispatch<AppDispatch>();
  const artistId = 2; // Replace with the actual artist ID
  const likedTracks = useSelector((state: any) => state.likes.likedTracks);
  const [likedTrackIDs, setLikedTrackIDs] = useState<number[]>([]);
  const [likesCount, setLikesCount] = useState(0);
  const likesCountState = useSelector((state: any) => {
    console.log('Redux state', state); // Add this line
    return state.likes.likesCountState;
  }, shallowEqual);
  // const updatedTrackLikesIDs = useSelector((state: RootState) => state.likes.updateLikedTrackIDs);
  const [isTrackLiked, setIsTrackLiked] = useState(false);
  const [likedTracksState, setLikedTracksState] = useState<Record<number, boolean>>({});
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  console.log('likesCountState:', likesCountState);

// Inside your component
useEffect(() => {
  const socket = new WebSocket('ws://192.168.1.80:3001');

  socket.onopen = (event) => {
    console.log('WebSocket connection opened', event);
  };

  socket.onerror = (error) => {
    console.error('WebSocket error', error);
  };

// Log WebSocket messages
socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  const { trackId, likesCount } = data;

  // If trackId or likesCount is undefined, try to get them with different keys
  const trackID = trackId || data.TrackId || data.TrackID;
  const likes = likesCount || data.LikesCount || data.likesCount;
  dispatch(incrementLikesCount({ trackID: trackID, count: likes }));
 // console.log('WebSocket message received', data);

  // Log the Redux state
 // console.log('Redux state', state);

  // Only dispatch the updateLikesCount action if the track ID exists in likesCountState
  if (trackID in likesCountState) {
    dispatch(updateLikesCount({ trackId: trackID, likesCount: likes }));
  }
};

  // Close the WebSocket connection when the component unmounts
  return () => {
    socket.close();
  };
}, [dispatch]);



  useEffect(() => {
    setLastUpdate(Date.now());
  }, [likedTrackIDs]);

  useEffect(() => {
    const fetchTracks = async () => {
      const response = await axios.get(`http://192.168.1.80:5053/api/Track/artist/${artistId}`);
      setTracks(response.data);
      if (response.data[0]) {
        setArtistName(response.data[0].artist.artistName);
        setArtistPicturePath(response.data[0].artist.artistPicturePath);
      }
    };

    fetchTracks();
  }, []);

  


  useEffect(() => {
    const token = localStorage.getItem('userJWTToken');
    if (isAuthenticated()) {
      const decodedToken: any = jwtDecode(token ?? '');
      setUserId(decodedToken.nameid); // Change this line
   //   console.log('userid from tracklist', userId)

    }
  }, [dispatch, user]);


  useEffect(() => {
    const token = localStorage.getItem('userJWTToken');
    if (isAuthenticated()) {
      const decodedToken: any = jwtDecode(token ?? '');
      const userIdFromToken = decodedToken.nameid;
      setUserId(userIdFromToken);
   //   console.log('userid from tracklist', userIdFromToken);

  
    }
  }, [dispatch, user]);



  const sortedTracks = tracks.sort((a, b) => {
    if (a.albumID !== b.albumID) {
      return (a.albumID ?? 0) - (b.albumID ?? 0);
    }
    return a.trackNumber - b.trackNumber;
  });

 


  useEffect(() => {
    const trackRef = ref(realtimeDb, 'tracks/' + sortedTracks);
    set(trackRef, { likesCount: 0 });
  }, []);
  const trackID = useRef(0);


  const handleLikeAndIncrement = async (id: number) => {
    const userEmail = localStorage.getItem('email');
  
    if (userId) {
      console.log('trackid', id);
      trackID.current = id; // Update the ref here
      
      await dispatch(likeTrack({
        username: userEmail ?? '',
        trackID: id,
        artistName: artistName ?? '',
        timestamp: new Date().toISOString(),
        userId: userId,
        likesCount: (likesCountState[id] ?? 0) + 1
      }));
  
        // Fetch the likes count after a track is liked
        dispatch(fetchLikesCount([id]));
    }
  };





  useEffect(() => {
    const trackRef = ref(realtimeDb, 'tracks/' + trackID.current);

    // Check if likesCount exists before initializing it to 0
    get(trackRef).then((snapshot) => {
      if (!snapshot.exists() || snapshot.val().likesCount === undefined) {
        set(trackRef, { likesCount: 0 });
      }
    });

    // Listen for changes in likesCount
    const unsubscribe = onValue(trackRef, (snapshot) => {
      if (snapshot.exists()) {
        setIsTrackLiked(likedTracks.includes(trackID.current));
        setLikedTracksState(prevState => ({ ...prevState, [trackID.current]: likedTracks.includes(trackID.current) }));
      }
    });

    // Clean up the listener when the component unmounts
    return () => unsubscribe();

  }, [trackID.current, likedTracks]);


  
  useEffect(() => {
    const trackIds = tracks.map(track => track.trackID);
    dispatch(fetchLikesCount(trackIds));
    console.log('fetching likes count for tracks', trackIds);
    console.log('track.trackID:', trackIds);

  }, [dispatch, tracks]);

  return (
    <div>
      <div className="artisttrack-profile">

        <div className="artisttrack-banner">
          <img src={artistPicturePath ?? ''} alt={artistName ?? 'artist name'} />
        </div>




        <div className='artisttrack-header'>
          <h1>Artist: {artistName}</h1>
          <h2>Tracks</h2>
        </div>
        {sortedTracks.map(track => {

          return (
            <div key={track.trackID} className='artisttracks' >
              <h3>{track.trackName}</h3>

              <Track src={track.trackFilePath} />
              <button onClick={() => handleLikeAndIncrement(track.trackID)} disabled={!userId}>
                {likedTrackIDs.includes(track.trackID) ? 'Unlike' : 'Like'}
              </button>
              <div>Likes: {likesCountState[track.trackID]}</div>
             
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TracksList;