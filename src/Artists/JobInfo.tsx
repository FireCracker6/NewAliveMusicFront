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
                </div>
            )}
            {resultData.length > 0 && <TrackInfo data={resultData} />}
        </div>
    );
};

export default JobInfo;