import { LoginAPIResponse } from '@/types.js';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { setUserData } from './authSlice';

export const loginAPI = createAsyncThunk(
  'auth/login',
  async (
    authData: { email: string; password: string },
    { rejectWithValue }
  ) => {
    const response: LoginAPIResponse = await fetch(
      `${import.meta.env.VITE_BACKEND_API_URL}/login`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authData)
      }
    ).then((res) => res.json());

    if (!response) return rejectWithValue('Could not log in');

    if (!response.ok) return rejectWithValue(response.error);

    if (response.ok) {
      sessionStorage.setItem(
        'user',
        JSON.stringify({ ...response.userData, authenticated: true })
      );
    }
    return response.userData;
  }
);

export const registerAPI = createAsyncThunk(
  'auth/register',
  async (
    authData: { email: string; username: string; password: string },
    { rejectWithValue }
  ) => {
    const response: LoginAPIResponse = await fetch(
      `${import.meta.env.VITE_BACKEND_API_URL}/register`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authData)
      }
    ).then((res) => res.json());

    if (!response || !response.ok) return rejectWithValue('Could not register');

    if (response.ok) {
      sessionStorage.setItem(
        'user',
        JSON.stringify({ ...response.userData, authenticated: true })
      );
    }

    return response.userData;
  }
);

export const logoutAPI = createAsyncThunk(
  'auth/logout',
  async (params, { dispatch }) => {
    sessionStorage.removeItem('user');
    dispatch(
      setUserData({
        authenticated: false,
        username: '',
        ID: '',
        token: '',
        email: ''
      })
    );
  }
);
