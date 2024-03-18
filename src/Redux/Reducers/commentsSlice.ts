import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
interface CommentsState {
  comments: Record<number, Comment[]>; // Store comments by track ID
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}
// Define the Comment type
interface Comment {
    //userName?: string;
    userID?: string;
    artistID?: number;
    trackID: number;
    childComments?: Comment[];
   //commentID: number;
   
    parentCommentID?: string;
    content: string;
  }
  
  const initialState: CommentsState = {
    comments: [],
    status: 'idle',
    error: null
  };
  function extractComments(data: any): Comment[] {
    let comments: Comment[] = [];
  
    // Extract the top-level comments
    if (data.$values) {
      comments = data.$values.flatMap((comment: any) => {
        // Check if the comment is a reference
        if (comment.$ref) {
          // Find the referenced comment in the data
          const referencedComment = data.$values.find((c: any) => c.$id === comment.$ref);
          if (referencedComment) {
            comment = referencedComment;
          } else {
            // If the referenced comment is not found, return an empty array
            return [];
          }
        }
  
        // Extract the comment data
        return [{
          commentID: comment.commentID,
          content: comment.content,
          timestamp: comment.timestamp,
          userID: comment.userID,
          trackID: comment.trackID,
          artistID: comment.artistID,
          parentCommentID: comment.parentCommentID,
          childComments: comment.childComments ? extractComments(comment.childComments) : [],  // Recursively extract child comments
        }];
      });
    }
  
    return comments;
  }
  
  // export const fetchCommentsByTrackId = createAsyncThunk(
  //   'comments/fetchCommentsByTrackId',
  //   async (trackId: number, { rejectWithValue }) => {
  //     try {
  //       const response = await axios.get(`http://192.168.1.80:5053/api/Comments/track/${trackId}/comments`);
  //       console.log('Full response:', response);
        
  //       const comments = response.data.$values;
  //       const childComments = response.data.$values.flatMap((comment: any) => comment.childComments);
  //       console.log('Child comments:', childComments);
  //       return { trackId, comments };
  //     } catch (err: any) {
  //       return rejectWithValue(err.message);
  //     }
  //   }
  // );

 export const fetchCommentsByTrackId = createAsyncThunk(
    'comments/fetchCommentsByTrackId',
    async (trackId: any, { rejectWithValue }) => {
      try {
        const response = await axios.get(`http://192.168.1.80:5053/api/Comments/track/${trackId}/comments`);
        const comments = response.data.$values;
        return { [trackId]: comments };
      } catch (err: any) {
        return rejectWithValue(err.message);
      }
    }
  );
  
export const addComment = createAsyncThunk<Comment, Comment>(
  'comments/addComment',
  async (commentDTO) => {
    const response = await axios.post('http://192.168.1.80:5053/api/Comments/addcomment', commentDTO);
    return response.data;
  }
);
  
export const commentsSlice = createSlice({
  name: 'comments',
  initialState,

  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchCommentsByTrackId.fulfilled, (state, action) => {
      state.comments = { ...state.comments, ...action.payload };
    })
      .addCase(fetchCommentsByTrackId.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? null;
      });
  }
});
export default commentsSlice.reducer;