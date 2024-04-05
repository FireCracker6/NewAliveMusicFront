import { useEffect, useState } from "react";
import resolveJsonReferences from "../Artists/Helpers/resolveJsonReferences";
import axios from "axios";
import Track from "../Artists/Track";

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
    tracks: Track[];
}

const LatestTracks: React.FC = () => {
    const [artists, setArtists] = useState<Artist[]>([]);



    useEffect(() => {
        try {
            const fetchArtists = async () => {
                const response = await axios.get('http://192.168.1.80:5053/api/Artist/getallartists');
                const data = resolveJsonReferences(response.data.$values);
                console.log('Artists:', data);
                
                setArtists(data.map((item: any) => item.data) as Artist[]);
            };
            fetchArtists();
            console.log('Artists:', artists);
        } catch (error) {
            console.log('Error fetching artists:', error);
        }
    }, [artists]);

    return (
        <>
         <h1>Latest Tracks</h1>
<div className="container d-grid justify-content-center">
    <div className="row">
        {artists.map((artist) => (
            <div className="col-md-12" key={artist.artistID}>
                <div className="card mb-4">
                    <img src={artist.artistPicturePath} className="card-img-top" alt={artist.artistName} />
                    <div className="card-body">
                        <h5 className="card-title">{artist.artistName}</h5>
                        <p className="card-text">{artist.description}</p>
                        <button>Follow</button>
                        <div className="row">
                            {artist?.albums?.map((album: Album) => (
                                <div className="col-md-12" key={album.albumID}>
                                    <div className="card mb-4">
                                        <img src={album.coverImagePath} className="card-img-top" alt={album.albumName} />
                                        <div className="card-body">
                                            <h5 className="card-title">{album.albumName}</h5>
                                            <p className="card-text">{album.description}</p>
                                            <button>View Album</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        ))}
    </div>
</div>
            <h2>Playlist</h2>
        <div className="row">
            {artists.flatMap((artist) => artist.tracks.map((track) => (
                <div key={track.trackID} className="col-md-3">
                    <h3>{artist.artistName}</h3>
                    <h4>{track.trackName}</h4>
                    <Track src={track.trackFilePath} />
                </div>
            )))}
        </div>
        </>
    );
}

export default LatestTracks;