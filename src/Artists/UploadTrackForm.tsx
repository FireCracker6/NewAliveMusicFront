import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from 'react-dropzone';
function UploadTrackForm() {
    const [file, setFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);
    const [trackUrl, setTrackUrl] = useState<string | null>(null);

    const [trackName, setTrackName] = useState('');
    const [duration, setDuration] = useState('');
    const [trackNumber, setTrackNumber] = useState('');
    const [lyrics, setLyrics] = useState('');
    //const [albumID, setAlbumID] = useState<number>(0);
    const [artistID, setArtistID] = useState<number>(0);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        setFile(acceptedFiles[0]);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });


    useEffect(() => {
        setDuration('00:03:00');
        setArtistID(2);

        setTrackName('test');
        setTrackNumber('1');
    }, []);
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const formData = new FormData();
        formData.append('TrackFile', file as Blob);
        formData.append('TrackName', trackName);
        formData.append('Duration', duration);
        formData.append('TrackNumber', trackNumber);

        // if (albumID !== 0) {
        //     formData.append('AlbumID', albumID.toString());
        // }
        if (artistID !== 0) {
            formData.append('ArtistID', artistID.toString());
        }
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
            const resultResponse = await fetch(trackInfo.result['Output 1']);
            if (!resultResponse.ok) {
                console.error(`Error fetching data: ${resultResponse.status} ${resultResponse.statusText}`);
            } else {
                const resultData = await resultResponse.json();
                console.log(resultData);
            }
            // Use the result data in your app
        
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