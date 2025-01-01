import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { websocketService } from '../../services/websocket';

interface WebSocketState {
  connected: boolean;
  error: string | null;
  lastMessage: any | null;
}

const initialState: WebSocketState = {
  connected: false,
  error: null,
  lastMessage: null,
};

const websocketSlice = createSlice({
  name: 'websocket',
  initialState,
  reducers: {
    connected(state) {
      state.connected = true;
      state.error = null;
    },
    disconnected(state) {
      state.connected = false;
    },
    error(state, action: PayloadAction<string>) {
      state.connected = false;
      state.error = action.payload;
    },
    messageReceived(state, action: PayloadAction<any>) {
      state.lastMessage = action.payload;
    },
  },
});

// Thunks
export const connectWebSocket = (userId: string) => (dispatch: any) => {
  try {
    websocketService.connect(userId);
    dispatch(connected());
  } catch (error) {
    dispatch(error(error instanceof Error ? error.message : 'Unknown error'));
  }
};

export const disconnectWebSocket = () => (dispatch: any) => {
  websocketService.disconnect();
  dispatch(disconnected());
};

export const sendWebSocketMessage = (message: any) => () => {
  websocketService.send(message);
};

export const {
  connected,
  disconnected,
  error,
  messageReceived,
} = websocketSlice.actions;

export default websocketSlice.reducer;
