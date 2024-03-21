import React, { useContext, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import Track from './Track';
import { app, db, realtimeDb } from '../Firebase/firebaseConfig';
import { addDoc, collection, getDocs, getFirestore, query, serverTimestamp, where } from 'firebase/firestore';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { addLikedTrack, fetchLikedTracks, fetchLikesCount, incrementLikesCount, likeTrack, unlikeTrack, updateLikedTrackIDs, updateLikesCount } from '../Redux/Reducers/likesSlice';
import { AppDispatch, RootState } from '../Redux/store';
import { jwtDecode } from 'jwt-decode';
import UserContext from '../Contexts/UserContext';
import { isAuthenticated } from '../Authentication/IsTokenValid';

import { ref, set, update, get, increment, onValue } from "firebase/database";
import TrackComments from './TrackComments';
import { addComment, fetchCommentsByTrackId } from '../Redux/Reducers/commentsSlice';
import TrackCommentForm from './TrackCommentForm';
import { useParams } from 'react-router-dom';

interface TrackListProps {
  artistId: number;
}


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

interface Comment {
  userName?: string;
  commentID?: number;
  userID?: string;
  artistID?: number;
  trackID: number;
  timestamp?: string;
  childComments?: Comment[];
  userPicturePath?: string;
  parentCommentID?: string;
  content: string;
}

const TracksList: React.FC = () => {
  const { artistId } = useParams<{ artistId: string }>();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [artistName, setArtistName] = useState<string | null>(null);
  const [artistPicturePath, setArtistPicturePath] = useState<string | null>(null);

  const [userId, setUserId] = useState<string | undefined>(undefined);
  const { user } = useContext(UserContext);
  const dispatch = useDispatch<AppDispatch>();
  
  const likedTracks = useSelector((state: RootState) => state.likes.likedTracks);
  const likedTrackIDs = useSelector((state: RootState) => state.likes.likedTrackIDs, shallowEqual);
  const [likesCount, setLikesCount] = useState(0);
  const [sortedTracks, setSortedTracks] = useState<Track[]>([]);
  const [isCommentFormVisible, setCommentFormVisible] = useState(false);
  const [visibleCommentFormTrackId, setVisibleCommentFormTrackId] = useState<Number | null>(null);
  const [addedCommentIds, setAddedCommentIds] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(true);

  const likesCountState = useSelector((state: any) => {
    console.log('Redux state', state);
    return state.likes.likesCountState;
  }, shallowEqual);

  const [isTrackLiked, setIsTrackLiked] = useState(false);
  const [likedTracksState, setLikedTracksState] = useState<Record<number, boolean>>({});
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  console.log('likesCountState:', likesCountState);

  // Inside your component
  useEffect(() => {
    let socket = new WebSocket('ws://192.168.1.80:3001');

    socket.onopen = (event) => {
      console.log('WebSocket connection opened', event);
    };

    socket.onerror = (error) => {
      console.error('WebSocket error', error);
    };

    socket.onclose = (event) => {
      console.log('WebSocket connection closed', event);
      // Try to reconnect after 5 seconds
      setTimeout(() => {
        socket = new WebSocket('ws://192.168.1.80:3001');
      }, 5000);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Received data:', data); // Log the received data
    
        const { trackId, likesCount, comments } = data; // Change 'comment' to 'comments'
    
        const trackID = trackId || data.TrackId || data.TrackID;
        const likes = likesCount || data.LikesCount || data.likesCount;
        dispatch(incrementLikesCount({ trackID: trackID, count: likes }));
    
        if (trackID in likesCountState) {
          dispatch(updateLikesCount({ trackId: trackID, likesCount: likes }));
        }
    
        // Handle comment updates
        if (comments) {
          dispatch(fetchCommentsByTrackId(trackID));
        } else {
          console.log('No comment in data'); // Log when there's no comment
        }
     
      } catch (error) {
        console.error('Error parsing WebSocket message', error);
      }
    };
    
    return () => {
      socket.close();
    };
    }, [dispatch]);

  useEffect(() => {
    const fetchTracks = async () => {
      const response = await axios.get(`http://192.168.1.80:5053/api/Track/artist/${artistId}`);
      setTracks(response.data.$values);
      if (response.data.$values[0]) {
        setArtistName(response.data.$values[0].artist.artistName);
        setArtistPicturePath(response.data.$values[0].artist.artistPicturePath);
        console.log('artist picture path:', response.data.$values[0].artist.artistPicturePath);
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
    if (!Array.isArray(tracks)) {
      console.error('tracks is not an array:', tracks);
      return;
    }

    const sorted = tracks.sort((a, b) => {
      if (a.albumID !== b.albumID) {
        return (a.albumID ?? 0) - (b.albumID ?? 0);
      }
      return a.trackNumber - b.trackNumber;
    });

    setSortedTracks(sorted);

    sorted.forEach(track => {
      const trackRef = ref(realtimeDb, 'tracks/' + track.trackID);
      set(trackRef, { likesCount: 0 });
    });
  }, [tracks, realtimeDb]);

  const trackID = useRef(0);


  const handleLikeAndIncrement = async (id: number) => {
    const userEmail = localStorage.getItem('email');

    if (userId) {
      console.log('trackid', id);
      trackID.current = id; // Update the ref here

      if (likedTracks.includes(id)) {
        await dispatch(unlikeTrack({ trackId: id, userId }));
      } else {
        await dispatch(likeTrack({
          username: userEmail ?? '',
          trackID: id,
          artistName: artistName ?? '',
          timestamp: new Date().toISOString(),
          userId: userId,
          likesCount: (likesCountState[id] ?? 0) + 1
        }));
      }

      //       // Fetch the liked tracks for the user after a track is liked or unliked
      dispatch(fetchLikedTracks(userId));

      //       // Fetch the likes count after a track is liked or unliked
      dispatch(fetchLikesCount([id]));
    }
  };



  useEffect(() => {
    dispatch(fetchLikedTracks(userId ?? ''));
  }, [dispatch, userId]);

  const handleCommentSubmit = ({ userId, content, trackId }: any) => {
    console.log('comment is being submitted', { userId, content, trackId });
    dispatch(addComment({ userID: userId, content, trackID: trackId, artistID: parseInt(artistId ?? '')  }));
    setShowForm(true);
  };




    const handleFormSubmit = () => {
        setShowForm(false);
    };

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
        {sortedTracks.map(track => {

          return (
            <div className='container d-flex justify-content-center'>
              <div key={track.trackID} className='artisttracks' >
                <h3>{track.trackName}</h3>

                <Track src={track.trackFilePath} />

                <div className='likes-section'>

                  <button className='track-like-button' onClick={() => handleLikeAndIncrement(track.trackID)} disabled={!userId}>
                    {likedTracks.includes(track.trackID)
                      ? <i className="fa-solid fa-heart liked"></i>
                      : <i className="fa-solid fa-heart"></i>}
                  </button>
                  {likesCountState[track.trackID] > 0 && <div>Likes: {likesCountState[track.trackID]}</div>}
                </div>
                <button className='add-hide-comment-button ' onClick={() => setVisibleCommentFormTrackId(visibleCommentFormTrackId === track.trackID ? null : track.trackID)}>
                {visibleCommentFormTrackId === track.trackID ? 'Hide Comment Form' : <><span>Add a comment</span>&nbsp;<i className="fa-sharp fa-regular fa-comment-smile"></i></>}
                </button>
                {visibleCommentFormTrackId === track.trackID && showForm && <TrackCommentForm trackId={track.trackID} onCommentSubmit={handleCommentSubmit} onFormSubmit={handleFormSubmit} userId={userId} />}
                <TrackComments trackId={track.trackID}  />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TracksList;