import { store } from '../store';

class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout = 1000; // Start with 1 second
  private pingInterval: NodeJS.Timeout | null = null;
  private userId: string | null = null;

  connect(userId: string) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      return;
    }

    this.userId = userId;
    const token = store.getState().auth.token;
    const wsUrl = `${process.env.REACT_APP_WS_URL}/ws/${userId}`;

    this.socket = new WebSocket(wsUrl);
    this.socket.onopen = this.handleOpen.bind(this);
    this.socket.onmessage = this.handleMessage.bind(this);
    this.socket.onclose = this.handleClose.bind(this);
    this.socket.onerror = this.handleError.bind(this);

    // Add token to headers
    if (token) {
      this.socket.onopen = () => {
        if (this.socket) {
          this.socket.send(JSON.stringify({ authorization: `Bearer ${token}` }));
        }
      };
    }
  }

  private handleOpen() {
    console.log('WebSocket connected');
    this.reconnectAttempts = 0;
    this.reconnectTimeout = 1000;

    // Start ping interval
    this.pingInterval = setInterval(() => {
      this.send({ type: 'ping' });
    }, 30000);
  }

  private handleMessage(event: MessageEvent) {
    try {
      const message = JSON.parse(event.data);
      
      switch (message.type) {
        case 'pong':
          // Handle pong response
          break;
        case 'chat_message':
          // Dispatch chat message to Redux store
          store.dispatch({
            type: 'chat/messageReceived',
            payload: message.data,
          });
          break;
        case 'goal_update':
          // Dispatch goal update to Redux store
          store.dispatch({
            type: 'goals/goalUpdated',
            payload: message.data,
          });
          break;
        case 'transaction_update':
          // Dispatch transaction update to Redux store
          store.dispatch({
            type: 'finance/transactionUpdated',
            payload: message.data,
          });
          break;
        case 'post_update':
          // Dispatch community post update to Redux store
          store.dispatch({
            type: 'community/postUpdated',
            payload: message.data,
          });
          break;
        default:
          console.log('Unhandled message type:', message.type);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }

  private handleClose(event: CloseEvent) {
    console.log('WebSocket disconnected:', event.code, event.reason);
    
    // Clear ping interval
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    // Attempt to reconnect if not closed intentionally
    if (event.code !== 1000) {
      this.attemptReconnect();
    }
  }

  private handleError(error: Event) {
    console.error('WebSocket error:', error);
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts && this.userId) {
      setTimeout(() => {
        console.log(
          `Attempting to reconnect... (${this.reconnectAttempts + 1}/${
            this.maxReconnectAttempts
          })`
        );
        this.connect(this.userId!);
        this.reconnectAttempts++;
        this.reconnectTimeout *= 2; // Exponential backoff
      }, this.reconnectTimeout);
    } else {
      console.error('Max reconnection attempts reached');
      // Dispatch connection error to Redux store
      store.dispatch({
        type: 'app/websocketError',
        payload: 'Unable to establish WebSocket connection',
      });
    }
  }

  send(data: any) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    } else {
      console.error('WebSocket is not connected');
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close(1000, 'User disconnected');
      this.socket = null;
    }

    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }
}

export const websocketService = new WebSocketService();
