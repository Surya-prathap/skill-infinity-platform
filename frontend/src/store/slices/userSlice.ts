import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { userService } from '@/services';
import { normalizeError } from '@/utils';
import type { UserProfile } from '@/types';

export interface UserState {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  profile: null,
  loading: false,
  error: null,
};

export const fetchUserProfile = createAsyncThunk<UserProfile, void, { rejectValue: string }>(
  'user/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userService.getProfile();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(normalizeError(error).message);
    }
  },
);

export const updateUserProfile = createAsyncThunk<
  UserProfile,
  Partial<UserProfile>,
  { rejectValue: string; state: unknown }
>('user/updateProfile', async (payload, { rejectWithValue, getState }) => {
  try {
    const userId = (getState() as { auth: { user?: { userId?: string } } }).auth.user?.userId;
    if (!userId) {
      return rejectWithValue('Unable to determine your user ID.');
    }
    const response = await userService.updateProfile(userId, payload);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(normalizeError(error).message);
  }
});

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setProfile(state, action: PayloadAction<UserProfile | null>) {
      state.profile = action.payload;
    },
    resetUserState(state) {
      state.profile = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? null;
      })
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? null;
      });
  },
});

export const { setProfile, resetUserState } = userSlice.actions;

export default userSlice.reducer;
