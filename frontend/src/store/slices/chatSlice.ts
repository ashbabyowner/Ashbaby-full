import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: string;
  category?: string;
  sentiment?: string;
}

interface ChatState {
  messages: Message[];
  loading: boolean;
  error: string | null;
  activeConversation: string | null;
}

const initialState: ChatState = {
  messages: [],
  loading: false,
  error: null,
  activeConversation: null,
};

// Async thunks
export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (content: string, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/chat/messages', { content });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || 'Failed to send message');
      }
      return rejectWithValue('Failed to send message');
    }
  }
);

export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async (conversationId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/chat/conversations/${conversationId}/messages`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch messages');
      }
      return rejectWithValue('Failed to fetch messages');
    }
  }
);

export const startNewConversation = createAsyncThunk(
  'chat/startNewConversation',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/chat/conversations');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || 'Failed to start conversation');
      }
      return rejectWithValue('Failed to start conversation');
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    messageReceived(state, action: PayloadAction<Message>) {
      state.messages.push(action.payload);
    },
    clearMessages(state) {
      state.messages = [];
    },
    setActiveConversation(state, action: PayloadAction<string>) {
      state.activeConversation = action.payload;
    },
    updateMessageCategory(
      state,
      action: PayloadAction<{ messageId: string; category: string }>
    ) {
      const message = state.messages.find(m => m.id === action.payload.messageId);
      if (message) {
        message.category = action.payload.category;
      }
    },
    updateMessageSentiment(
      state,
      action: PayloadAction<{ messageId: string; sentiment: string }>
    ) {
      const message = state.messages.find(m => m.id === action.payload.messageId);
      if (message) {
        message.sentiment = action.payload.sentiment;
      }
    },
  },
  extraReducers: (builder) => {
    // Send Message
    builder
      .addCase(sendMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading = false;
        state.messages.push(action.payload);
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Messages
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Start New Conversation
    builder
      .addCase(startNewConversation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startNewConversation.fulfilled, (state, action) => {
        state.loading = false;
        state.activeConversation = action.payload.id;
        state.messages = [];
      })
      .addCase(startNewConversation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  messageReceived,
  clearMessages,
  setActiveConversation,
  updateMessageCategory,
  updateMessageSentiment,
} = chatSlice.actions;

export default chatSlice.reducer;
