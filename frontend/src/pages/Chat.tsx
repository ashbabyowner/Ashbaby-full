import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Avatar,
  CircularProgress,
  Card,
  CardContent,
} from '@mui/material';
import { Send as SendIcon, SmartToy as BotIcon } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useTheme } from '@mui/material/styles';

interface Message {
  id: string;
  content: string;
  isAi: boolean;
  timestamp: Date;
}

const Chat: React.FC = () => {
  const theme = useTheme();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const { user } = useSelector((state: RootState) => state.auth);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      isAi: false,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage('');
    setIsTyping(true);

    try {
      // API call to send message and get AI response
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: message }),
      });

      const data = await response.json();
      const aiMessage: Message = {
        id: Date.now().toString(),
        content: data.content,
        isAi: true,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box sx={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      <Card sx={{ mb: 3, p: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            AI Support Chat
          </Typography>
          <Typography variant="body2" color="textSecondary">
            I'm here to help you with your personal growth, wellness, and life challenges.
            Feel free to ask me anything!
          </Typography>
        </CardContent>
      </Card>

      <Paper
        elevation={3}
        sx={{
          flex: 1,
          mb: 2,
          p: 2,
          overflow: 'auto',
          backgroundColor: theme.palette.background.default,
        }}
      >
        {messages.map((msg) => (
          <Box
            key={msg.id}
            sx={{
              display: 'flex',
              justifyContent: msg.isAi ? 'flex-start' : 'flex-end',
              mb: 2,
            }}
          >
            {msg.isAi && (
              <Avatar
                sx={{
                  bgcolor: theme.palette.primary.main,
                  mr: 1,
                }}
              >
                <BotIcon />
              </Avatar>
            )}
            <Paper
              sx={{
                maxWidth: '70%',
                p: 2,
                backgroundColor: msg.isAi
                  ? theme.palette.background.paper
                  : theme.palette.primary.main,
                color: msg.isAi ? 'inherit' : 'white',
                borderRadius: 2,
              }}
            >
              <Typography variant="body1">{msg.content}</Typography>
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  mt: 1,
                  color: msg.isAi ? 'text.secondary' : 'rgba(255, 255, 255, 0.7)',
                }}
              >
                {new Date(msg.timestamp).toLocaleTimeString()}
              </Typography>
            </Paper>
            {!msg.isAi && (
              <Avatar
                sx={{
                  ml: 1,
                  bgcolor: theme.palette.secondary.main,
                }}
              >
                {user?.fullName?.[0] || 'U'}
              </Avatar>
            )}
          </Box>
        ))}
        {isTyping && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 1 }}>
            <CircularProgress size={20} />
            <Typography variant="body2" color="textSecondary">
              AI is typing...
            </Typography>
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Paper>

      <Paper
        elevation={3}
        sx={{
          p: 2,
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            variant="outlined"
            size="small"
          />
          <IconButton
            color="primary"
            onClick={handleSend}
            disabled={!message.trim() || isTyping}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Paper>
    </Box>
  );
};

export default Chat;
