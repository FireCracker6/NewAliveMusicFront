import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { Init } from "v8";

interface CommentResponse {
  [trackId: number]: Comment[];
}
interface CommentsState {
  comments: Record<number, Comment[]>; // Store comments by track ID
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  artistId: { [key: number]: number };
}
// Define the Comment type
interface Comment {
  userName?: string;
  commentID?: number;
  userID?: string;
  artistID?: number;
  trackID: number;
  timestamp?: string;
  childComments?: Comment[];
  userPicturePath?: string;
 
  parentCommentID?: string;
  content: string;

  likes?: number | string[];
}

const initialState: CommentsState = {
  comments: {},
  artistId: {},

  status: 'idle',
  error: null
};





export const fetchCommentsByTrackId = createAsyncThunk(
  'comments/fetchCommentsByTrackId',
  async (trackId: any, { rejectWithValue, getState }) => {
    try {
      const response = await axios.get(`http://192.168.1.80:5053/api/Comments/track/${trackId}/comments`);
      const comments = response.data.$values;

      // Get the current state
      const state = getState() as CommentsState;

      // Filter out any comments that have already been added
      const newComments = comments.filter((comment: any) => !state.comments[trackId]?.includes(comment.commentID));

      // Extract the artistId from the first comment, or use a default value if there are no comments
      const artistId = newComments[0]?.artistID ?? null;

      const payload = { [trackId]: newComments, artistId };
      console.log('Payload:', payload); // Add this line
      return payload;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);
export const addComment = createAsyncThunk(
  'comments/addComment',
  async ({ userID, content, trackID, artistID }: Comment, { rejectWithValue }) => {
    try {
      const response = await axios.post(`http://192.168.1.80:5053/api/Comments/addComment`, {
        userID,
        content,
        trackID,
        artistID
      });

      // The server should respond with the created comment
      const comment = response.data;

      // Return the comment and trackID so they can be added to the state
      return { [trackID]: comment };
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const addReply = createAsyncThunk(
  'comments/addReply',
  async ({ userID, content, trackID, artistID, parentCommentID }: Comment, { rejectWithValue }) => {
    try {
      const response = await axios.post(`http://192.168.1.80:5053/api/Comments/addreply`, {
        userID,
        content,
        trackID,
        artistID,
        parentCommentID,
      });

      const reply = response.data;
      console.log('Reply:', reply);

      return { [trackID]: reply };
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);



export const commentsSlice = createSlice({
  name: 'comments',
  initialState,

  reducers: {},
  extraReducers: (builder) => {
    builder
    .addCase(fetchCommentsByTrackId.fulfilled, (state, action: PayloadAction<{ [trackId: number]: Comment[], artistId?: number | null }>) => {
      const trackId = Object.keys(action.payload)[0];
      const comments = action.payload[Number(trackId)];
      const artistId = action.payload.artistId;
    
      console.log('TrackId:', trackId);
      console.log('ArtistId:', artistId);
      console.log('Comments:', comments);
    
      state.comments[Number(trackId)] = comments;
      state.artistId[Number(trackId)] = artistId ?? 0;
    })
      .addCase(fetchCommentsByTrackId.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? null;
      })
      .addCase(addComment.fulfilled, (state, action) => {
        const trackId = Object.keys(action.payload)[0];
        if (!(state.comments as any)[trackId]) {
          (state.comments as any)[trackId] = [];
        }
        (state.comments as any)[trackId].push(action.payload[Number(trackId)]);
      })

      .addCase(addReply.fulfilled, (state, action) => {
        const trackId = Object.keys(action.payload)[0];
        const reply = action.payload[Number(trackId)];


        // Find the comment being replied to and add the reply to its replies array
        const comment = (state.comments as any)[trackId].find((comment: any) => comment.commentID === reply.parentCommentId);
        if (comment) {
          if (!comment.replies) {
            comment.replies = [];
          }
          comment.replies.push(reply);
        }
      })

     
  }
});
export default commentsSlice.reducer;