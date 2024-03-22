import { PayloadAction, createAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { update } from "firebase/database";
import { act } from "react-dom/test-utils";

export const likeComment = createAsyncThunk(
    'comments/likeComment',
    async ({ commentId, userId }: { commentId: number, userId: string }, { rejectWithValue }) => {
      try {
        const response = await axios.post(`http://192.168.1.80:5053/api/CommentLikes/addlike`, { commentId, userId });
        return { commentId, likes: response.data };
      } catch (err: any) {
        return rejectWithValue(err.message);
      }
    }
  );
  
  export const unlikeComment = createAsyncThunk(
    'comments/unlikeComment',
    async ({ commentId, userId }: { commentId: number, userId: string }, { rejectWithValue }) => {
      try {
        const response = await axios.post(`http://192.168.1.80:5053/api/CommentLikes/removelike`, { commentId, userId });
        return { commentId, likes: response.data };
      } catch (err: any) {
        return rejectWithValue(err.message);
      }
    }
  );


 // export const incrementCommentsLikesCount = createAction<{ commentId: number, count: number }>('commentsLikes/incrementCommentsLikesCount');
 export const fetchCommentsLikesCount = createAsyncThunk(
  'commentsLikes/fetchCommentsLikesCount',
  async (trackId: number, { rejectWithValue }) => {
    if (trackId === undefined) {
      return rejectWithValue('Track ID is undefined');
    }

    try {
      const response = await fetch(`http://192.168.1.80:5053/api/CommentLikes/track/${trackId}/likescount`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
    
      const likesCount: { [key: number]: number } = await response.json();
      console.log('Comment Likes count:', likesCount);
      return likesCount;
    } catch (error: any) {
      console.error('Error fetching likes count:', error);
      return rejectWithValue(error.message);
    }
  }
);

    export const fetchLikedComments = createAsyncThunk(
        'commentsLikes/fetchLikedComments',
        async (userId: string) => {
            const response = await axios.get(`http://192.168.1.80:5053/api/CommentLikes/${userId}`);
            console.log('response from fetchLikedComments', response.data.$values);
            return response.data;
        }
    );

  
  function findCommentInState(comments: any[], commentId: number): any {
    for (const comment of comments) {
      if (comment.commentID === commentId) {
        return comment;
      }
      if (comment.replies) {
        const found = findCommentInState(comment.replies, commentId);
        if (found) {
          return found;
        }
      }
    }
    return null;
  }

interface CommentsLikesState {
    comments: any[];
    likes: { [key: number]: number };
    likedComments: number[];
    commentsLikesCountState: { [key: number]: number };

}
const initialState: CommentsLikesState = {

    comments: [],
    likes: {},
    likedComments: [],
    commentsLikesCountState: {},
}

export const commentsLikesSlice = createSlice({
    name: 'commentsLikes',
    initialState,
  
    reducers: {
      incrementCommentsLikesCount: (state, action: PayloadAction<{ commentId: number, count: number }>) => {
        const { commentId, count } = action.payload;
        const comment = findCommentInState(state.comments, commentId);
        if (comment) {
          comment.likes = count;
        }
        state.commentsLikesCountState = {
          ...state.commentsLikesCountState,
          [commentId]: count,
        };
      },
      
      updateCommentsLikesCount: (state, action: PayloadAction<{ commentId: number; likesCount: number }>) => {
        const { commentId, likesCount } = action.payload;
        state.commentsLikesCountState[commentId] = likesCount;
      }
    },
   
    extraReducers: (builder) => {
        builder
        .addCase(likeComment.fulfilled, (state, action) => {
            const { commentId, likes } = action.payload;
            const comment = findCommentInState(state.comments, commentId);
            if (comment) {
                comment.likes = likes;
            }
            // Add commentId to likedComments if it's not already there
            if (!state.likedComments.includes(commentId as never)) {
                state.likedComments.push(commentId as never);
            }
            state.commentsLikesCountState = {
                ...state.commentsLikesCountState,
                [action.payload.commentId]: ((state.commentsLikesCountState as Record<number, number>)[action.payload.commentId] ?? 0) + 1,
            };
        })
        .addCase(unlikeComment.fulfilled, (state, action) => {
            const { commentId, likes } = action.payload;
            const comment = findCommentInState(state.comments, commentId);
            if (comment) {
              comment.likes = likes;
            }
            // Remove commentId from likedComments
            state.likedComments = state.likedComments.filter(id => id !== commentId);
            state.commentsLikesCountState = {
                ...state.commentsLikesCountState,
                [action.payload.commentId]: ((state.commentsLikesCountState as Record<number, number>)[action.payload.commentId] ?? 0) - 1,
            };
        })
        
        // .addCase(fetchCommentsLikesCount.fulfilled, (state, action: PayloadAction<{ [key: number]: number }>) => {
        //   console.log('Action payload:', action.payload);
        //     state.commentsLikesCountState = {
        //       ...state.commentsLikesCountState,
        //       ...action.payload,
        //     };
        // })

        .addCase(fetchCommentsLikesCount.fulfilled, (state, action: PayloadAction<{ [key: number]: number }>) => {
          state.commentsLikesCountState = {...state.commentsLikesCountState, ...action.payload};
        })
        

        

        
    },
  });

  export const { incrementCommentsLikesCount, updateCommentsLikesCount } = commentsLikesSlice.actions;
export default commentsLikesSlice.reducer;