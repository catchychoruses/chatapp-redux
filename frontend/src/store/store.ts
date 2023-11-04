import { combineReducers, configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/auth/authSlice';
import roomsReducer from './slices/rooms/roomsSlice';
import messagesReducer from './slices/messages/messagesSlice';
import socketIOMiddleware from './listenerMiddleware';

const rootReducer = combineReducers({
  auth: authReducer,
  messages: messagesReducer,
  rooms: roomsReducer
});
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(socketIOMiddleware.middleware)
});

export type AppDispatch = typeof store.dispatch;

export type RootState = ReturnType<typeof rootReducer>;
