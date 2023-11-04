import { AppDispatch, RootState } from './store';
import {
  TypedAddListener,
  TypedStartListening,
  addListener,
  createListenerMiddleware
} from '@reduxjs/toolkit';

const socketIOMiddleware = createListenerMiddleware<RootState>();

export type AppStartListening = TypedStartListening<RootState, AppDispatch>;

export const startAppListening =
  socketIOMiddleware.startListening as AppStartListening;

export const addAppListener = addListener as TypedAddListener<
  RootState,
  AppDispatch
>;

export default socketIOMiddleware;
