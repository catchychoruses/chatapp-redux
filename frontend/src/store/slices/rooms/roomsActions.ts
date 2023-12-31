import { fetchWithToken } from '@/api/fetchApi';
import { RootState } from '@/store/store';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { RoomData, setCurrentRoom } from './roomsSlice';
import { CreateRoomAPIResponse } from '@/types';

export const fetchRooms = createAsyncThunk<
  RoomData[],
  string | null,
  { state: RootState }
>(
  'rooms/fetchRooms',
  async (ID: string | null, { rejectWithValue, getState }) => {
    const currentRoom = getState().rooms.currentRoom;

    const userID = ID ?? getState().rooms.currentRoom.ID;

    const roomsData = await fetchWithToken<RoomData[]>('/get-rooms', {
      userID
    });

    if (!roomsData) return rejectWithValue('Could not get rooms data');

    if (!currentRoom.ID) {
      sessionStorage.setItem(
        'currentRoom',
        JSON.stringify({
          ID: roomsData[0].roomID,
          displayName: roomsData[0].displayName
        })
      );
    }

    return roomsData;
  }
);

export const newRoom = createAsyncThunk<
  RoomData,
  string,
  { state: RootState; rejectValue: string }
>(
  'rooms/newRoom',
  async (email: string, { rejectWithValue, getState, dispatch }) => {
    const { auth } = getState();

    if (email === auth.userData.email)
      return rejectWithValue('Do not create a room with yourself only ; (');

    const response = await fetchWithToken<CreateRoomAPIResponse>(
      '/new-room',
      undefined,
      {
        userID: auth.userData.ID,
        email
      }
    );

    if (!response) return rejectWithValue('Failed to create chatroom');
    if (!response.ok) return rejectWithValue(response.error);

    dispatch(
      setCurrentRoom({
        nextRoom: {
          ID: response.room.roomID,
          displayName: response.room.displayName
        }
      })
    );
    return response.room;
  }
);
