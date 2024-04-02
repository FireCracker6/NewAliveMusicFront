import { Dispatch, useContext, useEffect, useState } from "react";
import { addReply, fetchCommentsByTrackId } from '../Redux/Reducers/commentsSlice';
import { useDispatch, useSelector } from "react-redux";
import ReplyForm from "./ReplyForm";
import store, { RootState } from "../Redux/store";
import UserContext from "../Contexts/UserContext";
import { fetchCommentsLikesCount, fetchLikedComments, likeComment, unlikeComment } from "../Redux/Reducers/commentsLikesSlice";
import { jwtDecode } from "jwt-decode";
import { isAuthenticated } from "../Authentication/IsTokenValid";
import { shallowEqual } from "react-redux";
import moment from "moment";

const Comment = ({ comment, onReply, trackId }: any) => {
  const dispatch: Dispatch<any> = useDispatch();
  const { user } = useContext(UserContext);

  // Local state
  const [isReplying, setIsReplying] = useState(false);
  const [isReplyFormVisible, setIsReplyFormVisible] = useState(false);
  const [userId, setUserId] = useState<string | undefined>(undefined);

  // Selectors
  const artistId = useSelector((state: any) => state.comments.artistId[trackId]) ?? null;
  const likedComments = useSelector((state: any) => state.commentsLikes?.likedComments ?? []);
  const commentsLikesCountState = useSelector((state: any) => state.commentsLikes.commentsLikesCountState) as { [key: number]: number };
  const loading = useSelector((state: any) => state.commentsLikes.loading);


  console.log('liked comments', likedComments);
  // Effects
  useEffect(() => {
    const token = localStorage.getItem('userJWTToken');
    if (isAuthenticated()) {
      const decodedToken: any = jwtDecode(token ?? '');
      setUserId(decodedToken.nameid);
      console.log('User ID:', userId);
    }
  }, [dispatch, user]);
  useEffect(() => {
    dispatch(fetchLikedComments(userId ?? ''));
    console.log('Fetching liked comments for user:', userId);
  }, [dispatch, userId]);

  useEffect(() => {
    dispatch(fetchCommentsLikesCount(trackId));
  }, [dispatch, trackId]);

  // Handlers
  const handleLikeAndIncrement = async (commentId: number) => {
    if (userId) {
      if (likedComments.includes(commentId)) {
        await dispatch(unlikeComment({ commentId, userId }));
      } else {
        await dispatch(likeComment({ commentId, userId }));
      }
      dispatch(fetchCommentsLikesCount(trackId));
    }
  };

  const handleReplyClick = () => {
    setIsReplying(true);
    setIsReplyFormVisible(true);
  };

  const handleFormSubmit = () => {
    setIsReplyFormVisible(false);
    setIsReplying(false);
  };

  // Render
  return (
    <>
      <div className="comment">
        <div className="profile-pic">
          <img src={comment.userPicturePath} alt="Profile" className="profile-picture" />
          <div className="username">{comment?.userName}</div>
          <div className="timestamp">{moment(comment?.timestamp).fromNow()}</div>
        </div>
        <div className="comment-content">

          <div className="comment-text">{comment?.content ?? ''}</div>
          <div className="comment-likes">
            <button
              title={likedComments.map(String).includes(String(comment.commentID)) ? 'Unlike' : 'Like'}
              type="button"
              className="track-like-comment-button"
              onClick={() => handleLikeAndIncrement(comment.commentID)}
            >
              {loading ? (
                <i className="fa-solid fa-spinner"></i> // Show a spinner or some other loading indicator while the liked comments are being fetched
              ) : (
                <i className={`fa-solid fa-heart ${likedComments.map(String).includes(String(comment.commentID)) ? 'liked' : ''}`}></i>
              )}
            </button>
            {/* <p>Likes: {commentsLikesCountState[comment.commentID] || 0}</p> */}
            {commentsLikesCountState[comment.commentID] > 0 && <div className="likes">Likes: {commentsLikesCountState[comment.commentID]}</div>}
          </div>
          <button className="reply-button" onClick={handleReplyClick}>Reply</button>
          {isReplying && isReplyFormVisible && <ReplyForm parentCommentId={comment.commentID} onReplySubmit={onReply} trackId={trackId} artistId={artistId} onFormClose={handleFormSubmit} />}

        </div>
      </div>
    </>
  );
};

const CommentWithReplies = ({ comment, onReply, trackId, artistId, depth = 0 }: any) => {
  const className = depth > 4 ? "reply max-depth" : "reply";
  return (
    <>
      <Comment comment={comment} onReply={onReply} trackId={trackId} artistId={artistId} />
      {comment.replies?.$values?.map((reply: any, index: number) => (
        <div className={className} key={`${reply.commentID}-${index}`}>
          <CommentWithReplies comment={reply} onReply={onReply} trackId={trackId} artistId={artistId} depth={depth + 1} />
        </div>
      ))}
    </>
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
    dispatch(addReply({ userID: userId, content, trackID, artistID, parentCommentID: parentCommentId }));
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