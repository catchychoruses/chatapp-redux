import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { RootState } from '../../store';
import { fetchRooms, newRoom } from './roomsActions';
import { getSessionStorage } from '@/utils';

export interface RoomsState {
  currentRoom: {
    id: string;
    displayName: string;
  };
  rooms: RoomData[];
  allRoomIds: string[];
  loading: boolean;
}

export interface RoomData {
  roomId: string;
  displayName: string;
  members: {
    id: string;
    username: string;
  }[];
  lastMsg: {
    timeSent: string;
    content: string;
    username: string;
  } | null;
}

const sessionRoom = getSessionStorage<{ id: string; displayName: string }>(
  'currentRoom'
);

const initialState: RoomsState = {
  currentRoom: sessionRoom || { id: '', displayName: '' },
  rooms: [],
  allRoomIds: [],
  loading: false
};

const roomsSlice = createSlice({
  name: 'rooms',
  initialState,
  reducers: {
    getRooms(state, { payload }) {
      state.rooms = payload;
    },

    setCurrentRoom(
      state,
      {
        payload
      }: PayloadAction<{
        prevRoomId?: string;
        nextRoom: { id: string; displayName: string };
      }>
    ) {
      state.currentRoom.id = payload.nextRoom.id;
      state.currentRoom.displayName = payload.nextRoom.displayName;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchRooms.pending, (state) => {
      state.loading = true;
    }),
      builder.addCase(fetchRooms.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.rooms = payload;

        if (!state.currentRoom.id) {
          state.currentRoom.id = payload[0].roomId;
          state.currentRoom.displayName = payload[0].displayName;
        }

        state.allRoomIds = payload.map((room) => room.roomId);
      });

    builder.addCase(newRoom.fulfilled, (state, { payload }) => {
      state.loading = false;
      state.rooms = [...state.rooms, payload];

      state.currentRoom.id = payload.roomId;
      state.currentRoom.displayName = payload.displayName;
    });
  }
});

export const { getRooms, setCurrentRoom } = roomsSlice.actions;

export const selectRooms = (state: RootState) => state.rooms.rooms;
export const selectCurrentRoom = (state: RootState) => state.rooms.currentRoom;

export default roomsSlice.reducer;
