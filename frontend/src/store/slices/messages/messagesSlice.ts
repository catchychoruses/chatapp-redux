import { MessageType } from '@/types';
import {
  PayloadAction,
  createAsyncThunk,
  createSelector,
  createSlice
} from '@reduxjs/toolkit';
import { RootState } from '../../store.js';
import { fetchWithToken } from '@/api/fetchApi.js';

export interface MessagesState {
  messages: MessageType[];
  loading: boolean;
}

export const fetchMessages = createAsyncThunk(
  'messages/fetchMessages',
  async (roomID: string, { rejectWithValue }) => {
    const messages = await fetchWithToken<MessageType[]>('/get-messages', {
      roomID,
      limit: '10'
    });

    if (!messages) return rejectWithValue('Could not retrieve messages');

    return messages;
  }
);

const initialState: MessagesState = {
  loading: false,
  messages: []
};

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    sendMessage(state, { payload }: PayloadAction<MessageType>) {
      state.messages.unshift(payload);
    },
    receiveMessage(state, { payload }: PayloadAction<MessageType>) {
      state.messages.unshift(payload);
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchMessages.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchMessages.fulfilled, (state, action) => {
      state.messages = action.payload;
      state.loading = false;
    });
  }
});

export const { receiveMessage, sendMessage } = messagesSlice.actions;

export const selectMessages = (state: RootState) => state.messages.messages;
export const selectMessagesLoadingState = (state: RootState) =>
  state.messages.loading;

export const SelectMessages = createSelector(
  [selectMessages],
  (selectMessages) => {
    return selectMessages;
  }
);

export default messagesSlice.reducer;
