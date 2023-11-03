import { RoomData } from './store/slices';

export type CreateRoomAPIResponse = CreateRoomAPISuccess | APIResponseError;

interface CreateRoomAPISuccess {
  ok: true;
  room: RoomData;
}

export type LoginAPIResponse = LoginAPISuccess | APIResponseError;

export interface LoginAPISuccess {
  ok: true;
  userData: UserSessionData;
}

export interface APIResponseError {
  ok: false;
  error: string;
}

export interface UserDataState extends UserSessionData {
  authenticated: boolean;
}

export interface UserSessionData {
  ID: string;
  username: string;
  email: string;
  token: string;
}

export interface MessageType {
  messageID?: string;
  content: string;
  sentBy: {
    userID: string;
    username: string;
  };
  timeSent: string;
  roomID: string;
  seen?: boolean;
}
