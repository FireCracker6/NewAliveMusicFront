import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { isAuthenticated } from "../Authentication/IsTokenValid";

const TrackCommentForm = ({ trackId, onCommentSubmit }: any) => {
    const storedUserName = localStorage.getItem('userEmail') || '';
    const [userName, setUserName] = useState(storedUserName);
    const [userId, setUserId] = useState<string | undefined>(undefined)
    const [content, setContent] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('userJWTToken');
        if (isAuthenticated()) {
            const decodedToken: any = jwtDecode(token ?? '');
            setUserId(decodedToken.nameid);
        }
    }, []);

    const handleSubmit = (e: any) => {
        e.preventDefault();
        onCommentSubmit({ userId, content, trackId });

        setContent('');
    };

    return (
        <form onSubmit={handleSubmit} className="comments-form">
            <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Your name"
            />
            <input
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Your comment"
            />
            <div className="d-grid">
                <button type="submit">Submit</button>
            </div>
        </form>
    );
}

export default TrackCommentForm;