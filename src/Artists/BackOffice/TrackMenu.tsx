import { useEffect, useState } from "react"
import JobInfo from "../JobInfo";
import axios from "axios";
import { useUserSubscription } from "../../Contexts/UserSubscriptionContext";

const TrackMenu = ({ track, jobId, apiKey, trackUrl, setBlobName, removeTrackById }: any) => {
    const [selectOption, setSelectOptions] = useState(null);
    const [localBlobName, setLocalBlobName] = useState(''); // Local state for blobName
    const { userSubscription, trackCount } = useUserSubscription();
    const [tracksLeftToMaster, setTracksLeftToMaster] = useState(0);

    useEffect(() => {
        if (userSubscription?.subscriptionPlan?.name === 'Premium Membership') {
            setTracksLeftToMaster(5);
        }
        else if (userSubscription?.subscriptionPlan?.name  === 'Unlimited Membership') {
            setTracksLeftToMaster(10);
        }
    })
    console.log('userSubscription', userSubscription); // Logs the actual subscription data
    console.log('userSubscription', userSubscription?.subscriptionPlan); // Logs the subscription plan
    console.log('userSubscription ai access', userSubscription?.subscriptionPlan?.hasAIAccess); // Logs the AI access status
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
        if (option === 'master' && isValidUrl(track.trackFilePath) && tracksLeftToMaster > 0) {
            const url = new URL(track.trackFilePath);
            const blobNameUrl = url.pathname.split('/').pop();
            console.log('Extracted blob name:', blobNameUrl);
            setLocalBlobName(blobNameUrl ?? ''); // Update localBlobName
            setTracksLeftToMaster(tracksLeftToMaster - 1);
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
     {userSubscription?.subscriptionPlan?.hasAIAccess && tracksLeftToMaster > 0 && (
            <button className="btn btn-secondary" onClick={() => handleOptionClick('master')}>Master Track</button>
        )}
        {tracksLeftToMaster === 0 && <p>You have reached your limit of mastered tracks.</p>}
            
            <button className="btn btn-danger" onClick={deleteTrack}>Delete Track</button>
           {/**  FOR FUTURE IMPLEMENTATON OF REMOVING INSTRUMENTS AND VOCALS **/}

            {/* <button onClick={() => handleOptionClick('removeInstrument')}>Remove Instrument</button>
            <button onClick={() => handleOptionClick('removeVocals')}>Remove Vocals</button> */}

            {selectOption === 'master' && <JobInfo jobId={jobId} apiKey={apiKey} trackUrl={trackUrl} blobName={localBlobName} />}

     
        </>
    );
};

export default TrackMenu;