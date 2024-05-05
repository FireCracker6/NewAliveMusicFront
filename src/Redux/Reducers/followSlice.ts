import { Action, AnyAction, createAction, createAsyncThunk, createSlice, PayloadAction, ThunkAction, ThunkDispatch } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "../store";
import qs from "qs";


interface FollowState {
    followers: number[];
    following: number[];
    followCount: number;
    followersCountState: { [key: number]: number };
    
}

const initialState: FollowState = {
    followers: [],
    following: [],
    followCount: 0,
    followersCountState: {},
 
};
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;
export type AppDispatch = ThunkDispatch<RootState, unknown, AnyAction>;

export const followArtist = (userId: string, artistId: number): AppThunk => async (dispatch) => {
    try {
        const response = await axios.post(`/api/follow/follow`, {
            FollowerId: userId,
            artistId
        });
        dispatch(followSlice.actions.addFollower(artistId));
    } catch (err) {
        console.error(err);
    }
};

export const unFollowArtist = (userId: string, artistId: number): AppThunk => async (dispatch) => {
    try {
        const response = await axios.post(`/api/follow/unfollow`, {
            FollowerId: userId,
            artistId
        });
        dispatch(followSlice.actions.removeFollower(artistId));
    } catch (err) {
        console.error(err);
    }
};

export const fetchFollowingArtists = createAsyncThunk(
    'followers/fetchFollowingArtists',
    async (userId: string, { rejectWithValue }) => {
        if (!userId) {
            return rejectWithValue('Invalid userId');
        }
        const response = await axios.get(`http://192.168.1.80:5053/api/follow/following/${userId}`);
        console.log('response from fetchFollowingArtists', response.data);
        return response.data;
    }
);

export const incrementFollowersCount = createAction< { artistId: number, count: number }>('followers/incrementFollowersCount');

export const fetchFollowersCount = createAsyncThunk(
    'followers/fetchFollowersCount',
    async (artistIds: number[], { rejectWithValue }) => {
        artistIds = artistIds.filter(artistId => artistId !== undefined);
       
        if (!Array.isArray(artistIds) || artistIds.some(artistId => isNaN(artistId))) {
            return rejectWithValue('Invalid artistIds');
        }
        
        const followersCount: { [key: number]: number } = {};
        const response = await axios.get(`http://192.168.1.80:5053/api/Follow/getfollowcount`, { 
            params: { artistId: artistIds },
            paramsSerializer: params => qs.stringify(params, {arrayFormat: 'repeat'})
        });
        for (const artistId in response.data.data) {
            followersCount[Number(artistId)] = response.data.data[Number(artistId)];
        }
        console.log('follow count', followersCount)
        return followersCount;
    }
);


const followSlice = createSlice({
    name: 'follow',
    initialState,
    reducers: {
        addFollower: (state, action: PayloadAction<number>) => {
            state.followers.push(action.payload);
        },
        removeFollower: (state, action: PayloadAction<number>) => {
            state.followers = state.followers.filter(follower => follower !== action.payload);
        },
        updateFollowers: (state, action: PayloadAction<number[]>) => {
            state.followers = action.payload;
        },
        updateFollowing: (state, action: PayloadAction<number[]>) => {
            state.following = action.payload;
        },
        updateFollowCount: (state, action: PayloadAction<number>) => {
            state.followCount = action.payload;
        },
        incrementFollowersCount: (state, action: PayloadAction<{ artistId: number, count: number }>) => {
            const { artistId, count } = action.payload;
            state.followersCountState[artistId] = count;
        },
    },


    extraReducers: (builder) => {
        builder.addCase(fetchFollowingArtists.fulfilled, (state, action) => {
            state.followers = action.payload.$values;
        })
        .addCase(fetchFollowersCount.fulfilled, (state, action: PayloadAction< { [key: number]: number }>) => {
            state.followersCountState = {
                ...state.followersCountState,
                ...action.payload
            };
        })     
    }, 
});

export const { addFollower, removeFollower, updateFollowers, updateFollowing, updateFollowCount } = followSlice.actions;

export default followSlice.reducer;