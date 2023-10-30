import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { RootState } from '../../store';
import { fetchRooms, newRoom } from './roomsActions';
import { getSessionStorage } from '@/utils';

export interface RoomsState {
  currentRoom: {
    ID: string;
    displayName: string;
  };
  rooms: RoomData[];
  allRoomIDs: string[];
  loading: boolean;
  createRoomError: string;
}

export interface RoomData {
  roomID: string;
  displayName: string;
  members: {
    ID: string;
    username: string;
  }[];
  lastMsg: {
    timeSent: string;
    content: string;
    username: string;
  } | null;
}

const sessionRoom = getSessionStorage<{ ID: string; displayName: string }>(
  'currentRoom'
);

const initialState: RoomsState = {
  currentRoom: sessionRoom || { ID: '', displayName: '' },
  rooms: [],
  allRoomIDs: [],
  loading: false,
  createRoomError: ''
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
        prevRoomID?: string;
        nextRoom: { ID: string; displayName: string };
      }>
    ) {
      state.currentRoom.ID = payload.nextRoom.ID;
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

        if (!state.currentRoom.ID) {
          state.currentRoom.ID = payload[0].roomID;
          state.currentRoom.displayName = payload[0].displayName;
        }

        state.allRoomIDs = payload.map((room) => room.roomID);
      });

    builder.addCase(newRoom.fulfilled, (state, { payload }) => {
      state.loading = false;
      state.rooms = [...state.rooms, payload];

      state.currentRoom.ID = payload.roomID;
      state.currentRoom.displayName = payload.displayName;
    });
    builder.addCase(newRoom.rejected, (state, action) => {
      state.loading = false;
      state.createRoomError = action.payload || '';
    });
  }
});

export const { getRooms, setCurrentRoom } = roomsSlice.actions;

export const selectRooms = (state: RootState) => state.rooms.rooms;
export const selectCurrentRoom = (state: RootState) => state.rooms.currentRoom;
export const selectCreateRoomError = (state: RootState) =>
  state.rooms.createRoomError;

export default roomsSlice.reducer;
