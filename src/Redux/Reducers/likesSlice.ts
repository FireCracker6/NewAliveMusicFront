import { PayloadAction, createAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

interface UpdateLikesCountPayload {
  trackId: number;
  likesCount: number;
}

export const likeTrack = createAsyncThunk(
  'likes/likeTrack',
  async (like: { username: string, trackID: number, artistName: string, timestamp: string, userId: string, likesCount: number }) => {
    const response = await axios.post('http://192.168.1.80:5053/api/Likes', {
      TrackID: like.trackID,
      UserID: like.userId,
      // Add other fields as necessary
    });
    return response.data;
  }
);
// In your likes slice
export const incrementLikesCount = createAction<{ trackID: number, count: number }>('likes/incrementLikesCount');

export const fetchLikesCount = createAsyncThunk(
  'likes/fetchLikesCount',
  async (trackIds: number[]) => {
    const likesCount: { [key: number]: number } = {}; // Declare likesCount with an index signature
    for (const trackId of trackIds) {
      const response = await axios.get(`http://192.168.1.80:5053/api/Likes/${trackId}/likescount`);
      likesCount[trackId] = response.data;
    }
    return likesCount;
  }
);

type Track = { username: string, trackID: number, artistName: string, timestamp: string, likesCount: number };

interface LikesState {
  likedTracks: number[];
  tracks: Track[];
  likesCountState: { [key: number]: number };

}

const initialState: LikesState = {
  likedTracks: [],
  tracks: [],
  likesCountState: {}, 

};

//export const updateLikesCount = createAction<UpdateLikesCountPayload>('tracks/updateLikesCount');

const likesSlice = createSlice({
  name: 'likes',
  initialState,
  reducers: {
    addLikedTrack: (state, action: PayloadAction<number>) => {
      state.likedTracks.push(action.payload);
    },
    incrementLikesCount: (state, action: PayloadAction<{ trackID: number, count: number }>) => {
      const { trackID, count } = action.payload;
      state.likesCountState[trackID] = count;
    },
    updateLikesCount: (state, action: PayloadAction<{ trackId: number; likesCount: number }>) => {
      const { trackId, likesCount } = action.payload;
      state.likesCountState[trackId] = likesCount;
    },
    unlike: (state, action: PayloadAction<number>) => {
      state.tracks = state.tracks.filter(track => track.trackID !== action.payload);
      state.likedTracks = state.likedTracks.filter(trackID => trackID !== action.payload);
    },
    updateLikedTrackIDs: (state, action: PayloadAction<number[]>) => {
      state.likedTracks = action.payload;
    },
  },
  extraReducers: builder => {
    builder
    .addCase(likeTrack.fulfilled, (state, action: PayloadAction<Track>) => {
      // Find the liked track in the state
      const trackIndex = state.tracks.findIndex(track => track.trackID === action.payload.trackID);
    
      // If the track is found, increment its likesCount
      if (trackIndex !== -1) {
        state.tracks[trackIndex].likesCount += 1;
      }
    
      // Spread the existing likesCountState and increment the count for the liked track
      state.likesCountState = {
        ...state.likesCountState,
        [action.payload.trackID]: (state.likesCountState[action.payload.trackID] ?? 0) + 1,
      };
    })
    .addCase(fetchLikesCount.fulfilled, (state, action: PayloadAction<{ [key: number]: number }>) => {
      // Merge the new likes count with the existing likes count
      state.likesCountState = {
        ...state.likesCountState,
        ...action.payload,
      };
    })
   
    .addCase(updateLikesCount, (state, action: PayloadAction<{ trackId: number, likesCount: number }>) => {
      // Set the likes count for the track to the new value
      state.likesCountState[action.payload.trackId] = action.payload.likesCount;
      console.log('likesCountState from likesSlice', state.likesCountState);
    });
  },
});

export const { addLikedTrack, unlike, updateLikedTrackIDs, updateLikesCount } = likesSlice.actions;

export default likesSlice.reducer;