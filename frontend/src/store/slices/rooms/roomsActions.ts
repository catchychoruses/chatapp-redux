import { fetchWithToken } from '@/api/fetchApi';
import { RootState } from '@/store/store';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { RoomData, setCurrentRoom } from './roomsSlice';
import { CreateRoomAPIResponse } from '@/types';

export const fetchRooms = createAsyncThunk<
  RoomData[],
  string,
  { state: RootState }
>('rooms/fetchRooms', async (userID: string, { rejectWithValue, getState }) => {
  const currentRoom = getState().rooms.currentRoom;

  const t1 = performance.now();

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
  const t2 = performance.now();
  console.log(`fetching rooms: ${t2 - t1}`);

  return roomsData;
});

export const newRoom = createAsyncThunk<
  RoomData,
  string,
  { state: RootState; rejectValue: string }
>(
  'rooms/newRoom',
  async (email: string, { rejectWithValue, getState, dispatch }) => {
    const { auth } = getState();

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
          ID: response.newRoom.roomID,
          displayName: response.newRoom.displayName
        }
      })
    );
    return response.newRoom;
  }
);
