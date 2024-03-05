import React from 'react';

export interface Segment {
    start: number;
    end: number;
    text: string;
    tags: Array<{ tag: string; probability: number; }>;
}

interface TrackInfoProps {
    data: Segment[];
}

const TrackInfo: React.FC<TrackInfoProps> = ({ data }) => {
    return (
        <div>
            {data.map((segment, index) => (
                <div key={index}>
                    <h2>Segment {index + 1}</h2>
                    <p>Start: {segment.start}</p>
                    <p>End: {segment.end}</p>
                    <p>Text: {segment.text}</p>
                    <h3>Tags</h3>
                    {segment.tags.map((tag, tagIndex) => (
                        <p key={tagIndex}>{tag.tag}: {tag.probability}</p>
                    ))}
                </div>
            ))}
        </div>
    );
};

export default TrackInfo;