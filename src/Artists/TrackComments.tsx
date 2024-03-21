import { Dispatch, useEffect, useState } from "react";
import { addReply, fetchCommentsByTrackId } from '../Redux/Reducers/commentsSlice';
import { useDispatch, useSelector } from "react-redux";
import ReplyForm from "./ReplyForm";
import store from "../Redux/store";

const Comment = ({ comment, onReply, trackId }: any) => {
    const [isReplying, setIsReplying] = useState(false);
    const artistId = useSelector((state: any) => state.comments.artistId[trackId]) ?? null;
    const [isReplyFormVisible, setIsReplyFormVisible] = useState(false);
    console.log('State:', useSelector((state: any) => state.comments)); 
    console.log('TrackId:', trackId); 
    console.log('ArtistId:', artistId); 

    const handleReplyClick = () => {
        setIsReplying(true);
        setIsReplyFormVisible(true);
    };

    const handleFormSubmit = () => {
        setIsReplyFormVisible(false);
        setIsReplying(false);
    };


    return (
     <>
     <div className="comment">
           <div className="profile-pic">  
           <img src={comment.userPicturePath} alt="Profile" className="profile-picture" />
           <div>{comment?.userName}</div>
           <div>{comment?.timestamp}</div>
           </div>

            
            <div className="comment-content">
          
                {comment?.content ?? ''}
                <button className="reply-button" onClick={handleReplyClick}>Reply</button>
                {isReplying && isReplyFormVisible && <ReplyForm parentCommentId={comment.commentID} onReplySubmit={onReply} trackId={trackId} artistId={artistId}  onFormClose={handleFormSubmit}/>}


               </div>
                </div>
                </>
    );
};

const CommentWithReplies = ({ comment, onReply, trackId, artistId, depth = 0 }: any) => {
    const className = depth > 4 ? "reply max-depth" : "reply";
    return (
        <div key={comment.commentID}>
            <Comment comment={comment} onReply={onReply} trackId={trackId} artistId={artistId} />
            {comment.replies?.$values?.map((reply: any) => (
                <div key={reply.commentID} className={className}>
                    <CommentWithReplies comment={reply} onReply={onReply} trackId={trackId} artistId={artistId} depth={depth + 1} />
                </div>
            ))}
        </div>
    );
};

const TrackComments = ({ trackId, artistId }: any) => {
    const dispatch: Dispatch<any> = useDispatch();
    const comments = useSelector((state: any) => state.comments.comments[trackId]);

    useEffect(() => {
        console.log('Fetching comments for trackId:', trackId);
        dispatch(fetchCommentsByTrackId(Number(trackId)));
    }, [dispatch, trackId]);

    const handleReply = (reply: any) => {
        const { userId, content, trackID, artistID, parentCommentId } = reply;
        dispatch(addReply({ userID : userId, content, trackID, artistID, parentCommentID: parentCommentId }));
        console.log('Replying to comment:', reply);
        const state = store.getState(); // Replace "store" with your Redux store variable
        console.log('Redux state after replying:', state);
        dispatch(fetchCommentsByTrackId(Number(trackID)));
    };

    return (
        <div className="comments-container">
            {comments?.map((comment: any) => (
                <CommentWithReplies comment={comment} onReply={handleReply} trackId={trackId} artistId={artistId} />
            ))}
        </div>
    );
}

export default TrackComments;