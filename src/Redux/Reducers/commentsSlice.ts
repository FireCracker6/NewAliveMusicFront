import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the Comment type
interface Comment {
    userName: string;
    id: string;
    text: string;
    // ...other properties...
  }
  
  // Use the Comment type for the initial state
  const initialState: Comment[] = [];
  
  const commentsSlice = createSlice({
    name: 'comments',
    initialState,
    reducers: {
      addComment: (state, action: PayloadAction<Comment>) => {
        state.push(action.payload);
      },
      removeComment: (state, action: PayloadAction<string>) => {
        return state.filter(comment => comment.id !== action.payload);
      },
      // ...other reducers...
    },
  });

  export default commentsSlice.reducer;