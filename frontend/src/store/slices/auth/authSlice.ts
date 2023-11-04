import { UserDataState } from '@/types';
import { getSessionStorage } from '@/utils';
import { createSlice } from '@reduxjs/toolkit';
import { RootState } from '../../store.js';
import { loginAPI, registerAPI } from './authActions.js';

const user = getSessionStorage<UserDataState>('user');

const initialState = {
  loading: false,
  userData: user || {
    authenticated: false,
    username: '',
    ID: '',
    token: '',
    email: ''
  },
  error: ''
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUserData(state, { payload }) {
      state.userData = payload;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(loginAPI.pending, (state) => {
      state.loading = true;
    }),
      builder.addCase(loginAPI.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.userData = { ...payload, authenticated: true };
      });
    builder.addCase(loginAPI.rejected, (state, action) => {
      state.error = action.payload || 'Something went wrong...';
    });
    builder.addCase(registerAPI.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(registerAPI.fulfilled, (state, { payload }) => {
      state.loading = false;
      state.userData = { ...payload, authenticated: true };
    });
  }
});

export const { setUserData } = authSlice.actions;

export const selectUserData = (state: RootState) => state.auth.userData;
export const selectAuthLoadingState = (state: RootState) => state.auth.loading;
export const selectAuthErrorState = (state: RootState) => state.auth.error;

export default authSlice.reducer;
