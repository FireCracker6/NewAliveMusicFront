import { useState, useEffect, useRef } from "react";
import { jwtDecode } from "jwt-decode";
import { isAuthenticated } from "../Authentication/IsTokenValid";
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'

const TrackCommentForm = ({ trackId, onCommentSubmit, onFormSubmit }: any) => {
    const storedUserName = localStorage.getItem('userEmail') || '';
    const [userName, setUserName] = useState(storedUserName);
    const [userId, setUserId] = useState<string | undefined>(undefined)
    const [content, setContent] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const emojiPickerRef = useRef(null);

    const toggleEmojiPicker = (e: any) => {
        e.preventDefault();
        setShowEmojiPicker(!showEmojiPicker);
    };
    
    const addEmoji = (emoji: any) => {
        console.log(emoji);
        const emojiCharacter = emoji.native;
        setContent(prevContent => prevContent + emojiCharacter);
    };

    useEffect(() => {

        const token = localStorage.getItem('userJWTToken');
        if (isAuthenticated()) {
            const decodedToken: any = jwtDecode(token ?? '');
            setUserId(decodedToken.nameid);
        }
        
        const handleClickOutside = (event: any) => {
            if (emojiPickerRef.current && (emojiPickerRef.current as HTMLElement).contains(event.target)) {
                setShowEmojiPicker(false);
            }
        }

        document.addEventListener("focusout", handleClickOutside);
        return () => {
            document.removeEventListener("focusout", handleClickOutside);
        };
    }, []);

    const handleSubmit = (e: any) => {
        e.preventDefault();
        onCommentSubmit({ userId, content, trackId });
       onFormSubmit();

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
            <button onClick={toggleEmojiPicker}>Toggle Emoji Picker</button>
            <div ref={emojiPickerRef}>
                {showEmojiPicker && <Picker onEmojiSelect={addEmoji} />}
            </div>
            <div className="d-grid">
                <button type="submit">Submit</button>
            </div>
        </form>
    );
}

export default TrackCommentForm;