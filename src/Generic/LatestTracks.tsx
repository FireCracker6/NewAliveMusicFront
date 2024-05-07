import { useContext, useEffect, useRef, useState } from "react";
import resolveJsonReferences from "../Artists/Helpers/resolveJsonReferences";
import axios from "axios";
import Track from "../Artists/Track";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { addFollower, removeFollower, updateFollowers, updateFollowing, updateFollowCount, unFollowArtist, followArtist, fetchFollowingArtists, fetchFollowersCount } from "../Redux/Reducers/followSlice";
import { AppDispatch, RootState } from "../Redux/store";
import { jwtDecode } from "jwt-decode";
import { isAuthenticated } from "../Authentication/IsTokenValid";
import UserContext from "../Contexts/UserContext";
import TrackCommentForm from "../Artists/TrackCommentForm";
import TrackComments from "../Artists/TrackComments";
import { unlikeTrack, likeTrack, fetchLikedTracks, fetchLikesCount } from "../Redux/Reducers/likesSlice";
import { useParams } from "react-router-dom";
import { addComment } from "../Redux/Reducers/commentsSlice";

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
    album: Album;
    artistID: number;
    artist: Artist;


}
interface Artist {
    artistID: number;
    artistId: number;
    artistName: string;
    description: string;
    artistPicturePath: string;
    albums: Album[];
    tracks: Track[];
}
interface Album {
    albumID: number;
    albumName: string;
    artistID: number;
    genre: string;
    description: string;
    coverImagePath: string;
    artist: Artist;
    totalTracks: number;
    tracks: Track[];
}

const LatestTracks: React.FC = () => {
    const [artists, setArtists] = useState<Artist[]>([]);
   
    const [tracks, setTracks] = useState<Track[]>([]);
    const [artistName, setArtistName] = useState<string | null>(null);
    const [artistPicturePath, setArtistPicturePath] = useState<string | null>(null);
    const dispatch = useDispatch<AppDispatch>();
    const followers = useSelector((state: RootState) => state.followers.followers);
    const following = useSelector((state: RootState) => state.followers.following);
    const followCount = useSelector((state: RootState) => state.followers.followCount);
    const followersCountState = useSelector((state: RootState) => state.followers.followersCountState);
    const trackID = useRef<number>(0); // Declare the trackID ref
    const likedTracks = useSelector((state: RootState) => state.likes.likedTracks);
    const [visibleCommentFormTrackId, setVisibleCommentFormTrackId] = useState<Number | null>(null);
    const [showForm, setShowForm] = useState(true);

    const likesCountState = useSelector((state: any) => {
        console.log('Redux state', state);
        return state.likes.likesCountState;
      }, shallowEqual);
    

    const [userId, setUserId] = useState<string | undefined>(undefined);
    const { user } = useContext(UserContext);

    useEffect(() => {
        let socket: WebSocket | null = null;

        const connect = () => {
            socket = new WebSocket('ws://192.168.1.80:3001');

            socket.onopen = () => {
                console.log('Connected to websocket server');
            };

            socket.onerror = (error) => {
                console.log('Error connecting to websocket server:', error);
            };

            socket.onclose = (event) => {
                console.log('WebSocket closed:', event);
            };

            socket.onmessage = (message) => {
                console.log('Message received:', message);
                const data = JSON.parse(message.data);
                console.log('Data:', data);

                switch (data.type) { // Use data.type instead of message.type
                    case 'UPDATE_FOLLOWERS':
                        dispatch(updateFollowers(data.payload)); // Use data.payload instead of message.data
                        break;
                    case 'UPDATE_FOLLOWING':
                        dispatch(updateFollowing(data.payload));
                        break;
                    case 'UPDATE_FOLLOW_COUNT':
                        dispatch(updateFollowCount(data.payload));
                        break;
                    case 'follow': // Handle 'follow' event
                        dispatch(addFollower(data.payload));
                        break;
                    case 'unfollow': // Handle 'unfollow' event
                        dispatch(removeFollower(data.payload));
                        break;
                    default:
                        break;
                }
            };
        };

        connect(); // Call the connect function

        // Clean up function to close the socket when the component unmounts
        return () => {
            if (socket) {
                socket.close();
            }
        };
    }, [dispatch]); // Pass [dispatch] as the dependency array


    useEffect(() => {
        const token = localStorage.getItem('userJWTToken');
        if (isAuthenticated()) {
            const decodedToken: any = jwtDecode(token ?? '');
            setUserId(decodedToken.nameid);
        }
    }, [user]);

    useEffect(() => {
        if (userId) {
            dispatch(fetchFollowingArtists(userId));
        }
    }, [dispatch, userId]);

    console.log(userId)
    useEffect(() => {
        try {
            const fetchArtists = async () => {
                const response = await axios.get('http://192.168.1.80:5053/api/Artist/getallartists');
                const data = resolveJsonReferences(response.data.$values);
                if (response.data) {
               
                console.log('Artists:', data);
               }
           
    
                const artistData = data.map((item: any) => item.data) as Artist[];
                setArtists(artistData);
                dispatch(fetchFollowersCount(artistData.map(artist => artist.artistID)));
            };
            fetchArtists();
            console.log('Artists:', artists);
        } catch (error) {
            console.log('Error fetching artists:', error);
        }
    }, []);

    useEffect(() => {
        if (userId) {
            dispatch(fetchFollowingArtists(userId));
            dispatch(fetchFollowersCount(artists.map(artist => artist.artistID)));
        }
    }, [dispatch, userId, followers, following]);

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

    const handleCommentSubmit = ({ userId, content, trackId }: any) => {
        const track = artists.flatMap(artist => artist.tracks).find(track => track.trackID === trackId);
        const artistId = track ? track.artistID.toString() : '';
        console.log('comment is being submitted', { userId, content, trackId });
        dispatch(addComment({ userID: userId, content, trackID: trackId, artistID: parseInt(artistId) }));
        setShowForm(true);
    };




        const handleFormSubmit = () => {
                setShowForm(false);
        };
    

    return (
        <>
            <section className="latest-tracks mt-4">
                <div className="container d-flex justify-content-center">
                    <div className="main-header pt-2 pb-2">
                        <h1>Latest Releases</h1>
                    </div>
                </div>
                <div className="container d-grid justify-content-center">
                    <div className="row">
                        {artists.map((artist) => {
                            const isFollowing = followers.includes(artist.artistID);
                            const isFollowed = following.includes(artist.artistID);
                            const countFollow = followersCountState[artist.artistID] ?? 0;
                            console.log('count follow', countFollow)
                            console.log('followers:', followers);
                            console.log('artist.artistID:', artist.artistID);
                            return (
                                <div className="col-md-12" key={artist.artistID}>
                                    <div className="card mb-4">
                                        <img src={artist.artistPicturePath} className="card-img-top" alt={artist.artistName} />
                                        <div className="card-body">
                                            <h5 className="card-title">{artist.artistName}</h5>
                                            <p className="card-text">{artist.description}</p>
                                           
                                            {countFollow > 0 && <p className="card-text">Followers: {countFollow}</p>}
                                            <button
                                                className="btn btn-primary"
                                                onClick={() => {
                                                    if (isFollowing && userId !== undefined) {
                                                        dispatch(unFollowArtist(userId, artist.artistID));
                                                    } else {
                                                        dispatch(followArtist(userId ?? '', artist.artistID));
                                                    }
                                                }}
                                            >
                                                {isFollowing ? 'Unfollow' : 'Follow'}
                                            </button>
                                            {artist.albums.length > 0 && <h2 className="mb-5 mt-4">Albums</h2>}
                                            <div className="row row-cols-1 row-cols-md-3 g-4 justify-content-center albums ">
                                                {artist?.albums?.map((album: Album) => (
                                                    <div className="col" key={album.albumID}>
                                                        <div className="card mb-4">
                                                            <img src={album.coverImagePath} className="card-img-top" alt={album.albumName} />
                                                            <div className="card-body">
                                                                <h5 className="card-title">{album.albumName}</h5>
                                                                <p className="card-text">Total Tracks: {album.totalTracks}</p>
                                                                <button type="button" className="btn btn-dark">View Album</button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="playlist mb-5 pb-5">
  <div className="container d-flex justify-content-center mb-5 mt-4">
    <h2 className="header pb-2 pt-2 ">Playlist</h2>
  </div>
  <div className="container d-flex justify-content-center">
    <div className="row">
      {artists.flatMap((artist) => artist.tracks.map((track) => (
        <div key={track.trackID} className="col-md-12">
          <div className="card-mb-4">
            <div className="card-body">
              <div className="tracks">
                <div> 
                  <h3>{artist.artistName}</h3>
                  <h4>{track.trackName}</h4>
                </div>
                <Track src={track.trackFilePath} />

                <div className='likes-section'>
                  <button className='track-like-button' onClick={() => handleLikeAndIncrement(track.trackID)} disabled={!userId}>
                    {likedTracks.includes(track.trackID)
                      ? <i className="fa-solid fa-heart liked"></i>
                      : <i className="fa-solid fa-heart"></i>}
                  </button>
                  {likesCountState[Number(track.trackID)] > 0 && <div>Likes: {likesCountState[Number(track.trackID)]}</div>}
                </div>
                <button className='add-hide-comment-button mt-2 mb-3' onClick={() => setVisibleCommentFormTrackId(visibleCommentFormTrackId === track.trackID ? null : track.trackID)}>
                  {visibleCommentFormTrackId === track.trackID ? 'Hide Comment Form' : <><span>Add a comment</span>&nbsp;<i className="fa-sharp fa-regular fa-comment-smile"></i></>}
                </button>
                {visibleCommentFormTrackId === track.trackID && showForm && <TrackCommentForm trackId={track.trackID} onCommentSubmit={handleCommentSubmit} onFormSubmit={handleFormSubmit} userId={userId} />}
                <TrackComments trackId={track.trackID}  />
              </div>
            </div>
          </div>
        </div>
      )))}
    </div>
  </div>
</div>
            </section>
        </>
    );
}

export default LatestTracks;