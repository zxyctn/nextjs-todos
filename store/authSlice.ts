import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

const initialState: {
  isGuest: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    image: string;
  } | null;
} = {
  isGuest: false,
  user: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setIsGuest: (state, action: PayloadAction<boolean>) => {
      state.isGuest = action.payload;
    },
    setUser: (
      state,
      action: PayloadAction<{
        id: string;
        name: string;
        email: string;
        image: string;
      } | null>
    ) => {
      state.user = action.payload;
    },
  },
});

export const { setIsGuest, setUser } = authSlice.actions;
export const authReducer = authSlice.reducer;
