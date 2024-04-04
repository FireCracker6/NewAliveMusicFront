import axios from "axios";
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Track from "../Track";
import AlbumTrack from "./AlbumtTrack";
interface Track {
  trackID: number;
  trackFilePath: string;
}

interface Album {
  albumID: number;
  albumName: string;
  tracks: {
    $id: string;
    $values: Track[];
  };
  // Add other properties of the album here if needed
}
const AlbumsList = ({ artistID }: { artistID: number }) => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [currentTrackID, setCurrentTrackID] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const audioPlayer = useRef(new Audio());

  useEffect(() => {
    // Find the current track based on the current track index
    const currentTrack = albums.flatMap(album => album.tracks.$values).find(track => track.trackID === currentTrackID);

    // If the current track is found
    if (currentTrack) {
      // Update the source of the audio player and play the track
      audioPlayer.current.src = currentTrack.trackFilePath;
      console.log('audioPlayer.src:', audioPlayer.current.src);
      if (isPlaying) {
        audioPlayer.current.play();
      } else {
        audioPlayer.current.pause();
      }
    }
  }, [currentTrackID, albums, isPlaying]);

  useEffect(() => {
    if (albums.length > 0) {
      setCurrentTrackID(albums[0]?.tracks.$values[0]?.trackID);
    }
  }, [albums]);

  const playNext = () => {
    console.log('playNext called');
    setCurrentTrackID((prevTrackID) => {
      console.log('Previous track ID:', prevTrackID);

      // Find the current album and its index based on the current track ID
      const currentAlbumIndex = albums.findIndex(album =>
        album.tracks.$values.some(track => track.trackID === prevTrackID)
      );
      const currentAlbum = albums[currentAlbumIndex];

      console.log('Current album:', currentAlbum);

      // If the current album is found
      if (currentAlbum) {
        // Find the index of the current track in the current album
        const currentTrackIndexInAlbum = currentAlbum.tracks.$values.findIndex(track => track.trackID === prevTrackID);

        console.log('Current track index in album:', currentTrackIndexInAlbum);

        // If the current track is the last track in the album
        if (currentTrackIndexInAlbum === currentAlbum.tracks.$values.length - 1) {
          // Play the first track of the next album
          const nextAlbum = albums[(currentAlbumIndex + 1) % albums.length];
          return nextAlbum.tracks.$values[0].trackID;
        } else {
          // Calculate the next track index in the current album
          const nextTrackIndexInAlbum = currentTrackIndexInAlbum + 1;

          // Return the track ID of the next track
          console.log('Next track index in album:', nextTrackIndexInAlbum);
          return currentAlbum.tracks.$values[nextTrackIndexInAlbum].trackID;
        }
      }

      // If the current album is not found, return the first track ID of the first album
      return albums[0]?.tracks.$values[0]?.trackID;
    });
  };





  useEffect(() => {
    // Play the next track when the current track ends
    const handleEnded = () => {
      setIsPlaying(true);
    };

    audioPlayer.current.addEventListener('ended', handleEnded);

    // Clean up the event listener when the component unmounts
    return () => {
      audioPlayer.current.removeEventListener('ended', handleEnded);
    };
  }, []);

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const response = await axios.get(`http://192.168.1.80:5053/api/Album/getAlbumsByArtist/${artistID}`);
        setAlbums(response.data.$values);
        console.log('Albums:', response.data.$values);
        console.log('A track from the first album:', albums[0]?.tracks.$values[0]);
      } catch (error: any) {
        console.error('Error fetching albums:', error);
      }
    };

    fetchAlbums();
  }, [artistID]);


  return (
    <>
     <div className="container d-flex justify-content-center mb-4">
      <Carousel showThumbs={false} showStatus={false} showIndicators={false} infiniteLoop useKeyboardArrows>
  {albums.map((album: any) => (
    <div className="artisttrack-album-profile" key={album.id}>
      <div className="coverimage"> <img src={album.coverImagePath} alt={album.albumName} /></div>
      <h2 className="album">{album.name}</h2>
    </div>
  ))}
</Carousel>
      </div>
   
    <div className='mb-5 pb-5'>
     
      <div className="container-fluid">
     
        {albums.map((album: any) => {
          return (
            <div key={album.albumID} className="artisttrack-album-profile">
              <div className="artisttrack-album-banner">
                <img src={album.artist.artistPicturePath ?? ''} alt={album.artist.artistName ?? 'artist name'} />
              </div>
              <div className='artisttrack-album-header'>
                <h2 className="album">Album: {album.albumName}</h2>
                <div className="coverimage">  <img src={album.coverImagePath} alt={album.albumName} /></div>

                <h2 className="artist">Artist: {album.artist.artistName}</h2>
              </div>
              <div className="container d-flex justify-content-center">
                <div className="artisttracks-album">
                  {album.tracks.$values.map((track: any, index: number) => {
                    return (
                      <div key={track.trackID}>
                        <h3>{track.trackName}</h3>
                        <AlbumTrack
                         isPlaying={isPlaying} 
                         setIsPlaying={setIsPlaying} 
                         currentTrackID={currentTrackID ?? 0} 
                         setCurrentTrackID={setCurrentTrackID} 
                          audioPlayer={audioPlayer}
                          src={track.trackFilePath}
                          playNext={playNext}
                       
                          trackID={track.trackID}
       
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
    </>
  );

};

export default AlbumsList;