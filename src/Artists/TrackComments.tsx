import { Dispatch, useEffect } from "react";
import { fetchCommentsByTrackId } from '../Redux/Reducers/commentsSlice';
import { useDispatch, useSelector } from "react-redux";
// Comment component
const Comment = ({ comment, onReply }: any) => {
    return (
        <div>
            <h2>{comment?.userName}</h2>
            <p>{comment?.content ?? ''}</p>
            <button onClick={() => onReply(comment.commentID)}>Reply</button>
        </div>
    );
};

const TrackComments = ({ trackId }: any) => {
    const dispatch: Dispatch<any> = useDispatch();
    const comments = useSelector((state: any) => state.comments.comments[trackId]);

    useEffect(() => {
        console.log('Fetching comments for trackId:', trackId);
        dispatch(fetchCommentsByTrackId(Number(trackId)));
    }, [dispatch, trackId]);

    const handleReply = (commentId: number) => {
        // Implement the reply functionality here
        console.log('Replying to comment ID:', commentId);
    };

    return (
        <div>
            {comments?.map((comment: any) => <Comment key={comment.commentID} comment={comment} onReply={handleReply} />)}
        </div>
    );
}

export default TrackComments;