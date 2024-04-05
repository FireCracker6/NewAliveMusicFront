import axios from "axios";
import { useCallback, useContext, useEffect, useState } from "react";
import { useDropzone } from 'react-dropzone';
import { useParams } from "react-router-dom";
import { isAuthenticated } from "../Authentication/IsTokenValid";
import { jwtDecode } from "jwt-decode";
import UserContext from "../Contexts/UserContext";
import { useUserSubscription } from "../Contexts/UserSubscriptionContext";

function UploadTrackForm() {
    const { userSubscription } = useUserSubscription();
    const [file, setFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);
    const [trackUrl, setTrackUrl] = useState<string | null>(null);

    const [trackName, setTrackName] = useState('');
    const [duration, setDuration] = useState('');
    const [trackNumber, setTrackNumber] = useState('');
    const [lyrics, setLyrics] = useState('');
    //const [albumID, setAlbumID] = useState<number>(0);
    const artistId = userSubscription?.artists?.$values[0]?.artistID;
    const [userId, setUserId] = useState<string | undefined>(undefined);
    const [composerNames, setComposerNames] = useState<string[]>([]);
    const [lyricistNames, setLyricistNames] = useState<string[]>([]);
    const { user } = useContext(UserContext);
    const onDrop = useCallback((acceptedFiles: File[]) => {
        setFile(acceptedFiles[0]);
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('userJWTToken');
        if (isAuthenticated()) {
          const decodedToken: any = jwtDecode(token ?? '');
          setUserId(decodedToken.nameid);
          console.log('User ID:', userId);
        }
      }, [ user]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const formData = new FormData();
        formData.append('UserID', userId ?? '')
        formData.append('ArtistID', artistId ?? '');
        formData.append('TrackFile', file as Blob);
        formData.append('TrackName', trackName);
        formData.append('Duration', duration);
        formData.append('TrackNumber', trackNumber);

         // Append the composer and lyricist IDs to the form data
         composerNames.forEach((name, index) => {
            formData.append(`ComposerNames[${index}]`, name);
        });
        lyricistNames.forEach((name, index) => {
            formData.append(`LyricistNames[${index}]`, name);
        });

      
        const config = {
            onUploadProgress: (progressEvent: any) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                setUploadProgress(percentCompleted);
            },
        };

        try {
            const response = await axios.post('http://192.168.1.80:5053/api/Track/uploadtrack', formData, config);
            console.log('File uploaded successfully', formData);

            // Extract trackID from the response
            const trackId = response.data.trackID;
            const jobId = response.data.jobId;
            const trackResponse = await axios.get(`http://192.168.1.80:5053/api/Track/${trackId}`);
            setTrackUrl(trackResponse.data.trackFilePath);
            console.log(trackResponse.data.trackFilePath); // This should now log the correct URL
            fetchTrackInfo(jobId);



        } catch (error) {
            console.error('An error occurred while uploading the file:', error);
        }
    };


    async function fetchTrackInfo(jobId: any) {
        // Define your API key
        const apiKey = '2555cad4-34a6-427a-a2e8-965f848f69fc';
    
        let trackInfo;
        while (true) {
            // Make a request to your backend API to get the track info from the Music AI API
            const musicAiResponse = await fetch(`https://api.music.ai/api/job/${jobId}`, {
                headers: {
                    'Authorization': apiKey
                }
            });
            trackInfo = await musicAiResponse.json();
    
            // If the job is complete, break the loop
            if (trackInfo.status !== 'STARTED') {
                break;
            }
    
            // Wait for a bit before polling again
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    
        // Fetch the result from the URL in the response
        if (trackInfo.result && trackInfo.result['Output 1']) {
            const resultResponse = await fetch('/fetchData', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ url: trackInfo.result['Output 1'] })
            });
        
        } else {
            console.log('No result data found');
        }
    }
    return (
        <>
            <div className="container d-flex justify-content-center py-4">
                <div className="create-artist-profile-grid">
                    <div className="form-container">
                        <form onSubmit={handleSubmit} className="form">
                            <h1>Upload Track</h1>
                            <div {...getRootProps()} className="dropzone">
                                <input {...getInputProps()} />
                                {
                                    isDragActive ?
                                        <p>Drop the files here ...</p> :
                                        <p>Drag 'n' drop some files here, or click to select files</p>
                                }
                            </div>
                            <div>
                                {file && <p>Selected file: {file.name}</p>}
                            </div>
                            <div>
                                {uploadProgress && <p>Upload progress: {uploadProgress}%</p>}
                            </div>
                            <div>
                                <label>Track Title:</label>
                                <input type="text" onChange={e => setTrackName(e.target.value)} />
                            </div>
                             {/* Add new input fields for composers and lyricists */}
                             <div>
                                <label>Composer(s) (comma-separated):</label>
                                <input type="text" placeholder="(optional)" onChange={e => setComposerNames(e.target.value.split(','))} />
                            </div>
                            <div>
                                <label>Lyricist(s) (comma-separated):</label>
                                <input type="text" placeholder="(optional)" onChange={e => setLyricistNames(e.target.value.split(','))} />
                            </div>
                            <button type="submit" className="btn btn-primary">Upload</button>
                        </form>
                    </div>

                </div>
            </div>
            <div className="container d-flex justify-content-center pt-2">
                {trackUrl && (
                    <div>
                        <audio controls controlsList="nodownload">
                            <source src={trackUrl} type="audio/mpeg" />
                            Your browser does not support the audio element.
                        </audio>
                    </div>
                )}
            </div>
        </>

    );

}

export default UploadTrackForm;