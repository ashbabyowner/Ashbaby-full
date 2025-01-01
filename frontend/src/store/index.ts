import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import chatReducer from './slices/chatSlice';
import goalsReducer from './slices/goalsSlice';
import wellnessReducer from './slices/wellnessSlice';
import communityReducer from './slices/communitySlice';
import financeReducer from './slices/financeSlice';
import websocketReducer from './slices/websocketSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
    goals: goalsReducer,
    wellness: wellnessReducer,
    community: communityReducer,
    finance: financeReducer,
    websocket: websocketReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['websocket/messageReceived'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['websocket.lastMessage'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
