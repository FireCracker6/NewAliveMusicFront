import { useState } from "react";
import Picker from '@emoji-mart/react'

const EmojiPickerTest = () => {
    const [content, setContent] = useState('');

    const addEmoji = (emoji: any) => {
        console.log(emoji);
        const emojiCharacter = emoji.native;
        setContent(prevContent => prevContent + emojiCharacter);
    };

    return (
        <div>
            <Picker onEmojiSelect={addEmoji} />
            <p>{content}</p>
        </div>
    );
}

export default EmojiPickerTest;