import React, { useEffect, useState } from 'react';
import TrackInfo, { Segment } from './TracInfo';
import axios from 'axios';

interface JobInfoProps {
    jobId: string;
    apiKey: string;
    trackUrl: string;
    blobName: string;
    trackId: number;
}

const JobInfo: React.FC<JobInfoProps> = ({ jobId, apiKey, trackUrl, trackId, blobName }) => {
    const [jobInfo, setJobInfo] = useState<JobInfoProps | null>(null);
    const [resultData, setResultData] = useState<Segment[]>([]);
    const [startMixingClicked, setStartMixingClicked] = useState(false);
    const [status, setStatus] = useState('');

    const replaceTrack = async (newFile: File, blobName: string) => {
        const formData = new FormData();
        console.log('Replacing track...', formData, 'newFile', newFile, 'blobName', blobName);
        formData.append('newFile', newFile);
        formData.append('blobName', blobName);

        try {
        await axios.post('http://192.168.1.80:5053/api/Track/replaceTrack', formData);
            console.log('Track replaced successfully');
        } catch (error: any) {
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.log(error.response.data);
                console.log(error.response.status);
                console.log(error.response.headers);
            } else if (error.request) {
                // The request was made but no response was received
                console.log(error.request);
            } else {
                // Something happened in setting up the request that triggered an Error
                console.log('Error', error.message);
            }
            console.log(error.config);
        }
    };

    const startMixing = async () => {
        setStartMixingClicked(true);
        console.log('Starting mixing process...');
        const jobData = await axios.post('https://api.music.ai/api/job', {
            name: 'My mix job 1',
            workflow: 'MASTER',
            params: {
                inputUrl: trackUrl,
                outputFormat: 'mp3',
                steps: [
                    {
                        name: 'audioEncoder',
                        params: {
                            format: 'mp3',
                            bitRate: '128k',
                            sampleRate: '44100',
                            channels: '2'
                        }
                    }
                ]
            }
        }, {
            headers: { 'Authorization': apiKey, 'Content-Type': 'application/json' }
        });
        console.log('Mixing job started with ID:', jobData.data.id);
    };

    const fetchJobInfo = async () => {
        console.log('Fetching job info...');

        const response = await axios.get(`https://api.music.ai/api/job/${jobId}`, {
            headers: {
                'Authorization': apiKey
            }
        });
        const data = response.data;
        console.log('Job info:', data);
        setJobInfo(data);

        if (data.status === 'SUCCEEDED' && data.result && data.result['Output 1']) {
            console.log('Fetching result data...');
            const resultUrl = data.result['Output 1'];
            const proxyUrl = `http://192.168.1.80:3001/fetchData`; // Use the new route
            const response = await axios.post(proxyUrl, { trackId: trackId }, { responseType: 'blob' });
            console.log(response.data);
            const newFile = new File([response.data], 'newMix.mp3');
            if (blobName) {
                await replaceTrack(newFile, blobName);
                setStatus('File replaced and uploaded successfully');
            } else {
                console.error('blobName is not defined');
                setStatus('Error: blobName is not defined');
            }
            
        }

    };

    useEffect(() => {
        if (startMixingClicked)
            fetchJobInfo();
    }, [jobId, apiKey, startMixingClicked]);

    

    return (
        <div>
            <button onClick={startMixing}>Start Mixing</button>
            {status && (
                <div>
                    <h2>Status</h2>
                    <p>{status}</p>
                </div>
            )}
            {jobInfo && (
                <div>
                    <h2>Job Info</h2>
                    <p>Job ID: {jobInfo.jobId}</p>
                    {/* Display other job info as needed */}
                </div>
            )}
            {resultData.length > 0 && <TrackInfo data={resultData} />}
        </div>
    );
};

export default JobInfo;