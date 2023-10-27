import { fetchWithToken } from '@/api/fetchApi';
import { RootState } from '@/store/store';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { RoomData, setCurrentRoom } from './roomsSlice';

export const fetchRooms = createAsyncThunk<
  RoomData[],
  string,
  { state: RootState }
>('rooms/fetchRooms', async (userId: string, { rejectWithValue, getState }) => {
  const currentRoom = getState().rooms.currentRoom;

  const roomsData = await fetchWithToken<RoomData[]>('/get-rooms', {
    userId
  });

  if (!roomsData) return rejectWithValue('Could not get rooms data');

  if (!currentRoom.id) {
    sessionStorage.setItem(
      'currentRoom',
      JSON.stringify({
        id: roomsData[0].roomId,
        displayName: roomsData[0].displayName
      })
    );
  }
  return roomsData;
});

export const newRoom = createAsyncThunk<RoomData, string, { state: RootState }>(
  'rooms/newRoom',
  async (email: string, { rejectWithValue, getState, dispatch }) => {
    const { auth } = getState();

    const newRoom = await fetchWithToken<RoomData>('/new-room', undefined, {
      userID: auth.userData.id,
      email
    });

    if (!newRoom) return rejectWithValue('Failed to create chatroom');

    dispatch(
      setCurrentRoom({
        nextRoom: { id: newRoom.roomId, displayName: newRoom.displayName }
      })
    );
    return newRoom;
  }
);
