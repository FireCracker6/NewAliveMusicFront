import React, { useEffect, useState } from 'react';
import TrackInfo, { Segment } from './TracInfo';
import axios from 'axios';

interface JobInfoProps {
    jobId: string;
    apiKey: string;
}

const JobInfo: React.FC<JobInfoProps> = ({ jobId, apiKey }) => {
    const [jobInfo, setJobInfo] = useState<JobInfoProps | null>(null);
    const [resultData, setResultData] = useState<Segment[]>([]);

    
    const replaceTrack = async (newFile: File, blobName: string) => {
        const formData = new FormData();
        formData.append('newFile', newFile);
        formData.append('blobName', blobName);

        try {
            const response = await axios.post('http://192.168.1.80:5053/api/Track/replaceTrack', formData);
            console.log('Track replaced successfully');
        } catch (error) {
            console.error('An error occurred while replacing the track:', error);
        }
    };

    const startMixing = async () => {
        console.log('Starting mixing process...');
        const jobData = await axios.post('https://api.music.ai/api/job', {
            name: 'My mix job 1',
            workflow: 'testmix',
            params: {
                inputUrl: 'https://aliveprofile24.blob.core.windows.net/tracks/c78d03d4-2685-40cf-90bf-fd7b12c0d3aa.mp3', // Use trackUrl here
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
            const proxyUrl = `http://192.168.1.80:3001/fetchData`; // Updated to use port 3001
            const resultResponse = await axios.post(proxyUrl, { url: resultUrl });
            console.log(resultResponse);
            if (resultResponse.status !== 200) {
                console.error(`Error fetching data: ${resultResponse.status} ${resultResponse.statusText}`);
            } else {
                const resultData = resultResponse.data;
                console.log('Result data:', resultData);
                setResultData(resultData);
                console.log('resultUrl:', resultUrl)

          // Download the new mix file
      
        const response = await axios.get(resultUrl, { responseType: 'blob' });
        const newFile = new File([response.data], 'newMix.wav');

        // Replace the track in Azure Blob Storage
        const blobName = 'c78d03d4-2685-40cf-90bf-fd7b12c0d3aa.mp3'; // You need to get the blob name here
        await replaceTrack(newFile, blobName);
            }
        }
    };

    useEffect(() => {
        fetchJobInfo();
    }, [jobId, apiKey]);

    return (
        <div>
            {jobInfo && (
                <div>
                    <h2>Job Info</h2>
                    <p>Status: {jobInfo.jobId}</p>
                    {/* Display other job info as needed */}
                    <button onClick={startMixing}>Start Mixing</button>
                </div>
            )}
            {resultData.length > 0 && <TrackInfo data={resultData} />}
        </div>
    );
};

export default JobInfo;