import { useState } from "react"
import JobInfo from "../JobInfo";
import axios from "axios";

const TrackMenu = ({ track, jobId, apiKey, trackUrl, setBlobName, removeTrackById }: any) => {
    const [selectOption, setSelectOptions] = useState(null);
    const [localBlobName, setLocalBlobName] = useState(''); // Local state for blobName

    const isValidUrl = (string: string) => {
        console.log('Checking if valid URL:', string);
        try {
          new URL(string);
        } catch (_) {
          return false;  
        }
      
        return true;
    };

    const handleOptionClick = (option: any) => {
        setSelectOptions(option);
        console.log('trackUrl', trackUrl)
        console.log('track', track)
        if (option === 'master' && isValidUrl(track.trackFilePath)) {
            const url = new URL(track.trackFilePath);
            const blobNameUrl = url.pathname.split('/').pop();
            console.log('Extracted blob name:', blobNameUrl);
            setLocalBlobName(blobNameUrl ?? ''); // Update localBlobName
        }
    };

    const deleteTrack = async () => {
        if (window.confirm('Are you sure you want to delete this track?')) {
            try {
                const response = await axios.delete(`http://192.168.1.80:5053/api/Track/${track.trackID}`);
                console.log('Track deleted successfully', response.data);
                removeTrackById(track.trackID);
            } catch (error: any) {
                console.error('Error deleting track:', error);
            }
        }
    }

    return (
        <>
       
            <button className="btn btn-secondary" onClick={() => handleOptionClick('master')}>Master Track</button>
            <button className="btn btn-danger" onClick={deleteTrack}>Delete Track</button>
           {/**  FOR FUTURE IMPLEMENTATON OF REMOVING INSTRUMENTS AND VOCALS **/}

            {/* <button onClick={() => handleOptionClick('removeInstrument')}>Remove Instrument</button>
            <button onClick={() => handleOptionClick('removeVocals')}>Remove Vocals</button> */}

            {selectOption === 'master' && <JobInfo jobId={jobId} apiKey={apiKey} trackUrl={trackUrl} blobName={localBlobName} />}

     
        </>
    );
};

export default TrackMenu;