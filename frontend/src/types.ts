export type LoginAPIResponse = LoginAPISuccess | LoginAPIError;

export interface LoginAPISuccess {
  ok: true;
  userData: UserSessionData;
}

export interface LoginAPIError {
  ok: false;
  error: string;
}

export interface UserDataState extends UserSessionData {
  authenticated: boolean;
}

export interface UserSessionData {
  id: string;
  username: string;
  email: string;
  token: string;
}

export interface MessageType {
  messageId?: string;
  content: string;
  sentBy: {
    userId: string;
    username: string;
  };
  timeSent: string;
  roomId: string;
  seen?: boolean;
}
