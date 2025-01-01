import { useState, useCallback } from 'react';
import { Message, CreativeContent } from '../types/chat';
import { useToast } from '@chakra-ui/react';

export const useAIChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [suggestions, setSuggestions] = useState([]);
  const [insights, setInsights] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const sendMessage = useCallback(async (content: string) => {
    try {
      setIsLoading(true);

      // Add user message
      const userMessage: Message = {
        content,
        isUser: true,
        timestamp: new Date(),
        userAvatar: '/user-avatar.png',
      };
      setMessages((prev) => [...prev, userMessage]);

      // Send to backend
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          context: {
            previousMessages: messages.slice(-5),
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();

      // Add AI response
      const aiMessage: Message = {
        content: data.response,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);

      // Update suggestions and insights
      setSuggestions(data.suggestions);
      setInsights(data.insights);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [messages, toast]);

  const generateCreativeContent = useCallback(async (
    contentType: string,
    prompt: string
  ) => {
    try {
      setIsLoading(true);

      // Send to backend
      const response = await fetch('/api/ai/creative', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content_type: contentType,
          prompt,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate creative content');
      }

      const data = await response.json();

      // Add creative content to messages
      const creativeMessage: CreativeContent = {
        contentType,
        content: data.content,
        prompt,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, creativeMessage]);
    } catch (error) {
      console.error('Error generating creative content:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate creative content. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return {
    messages,
    sendMessage,
    suggestions,
    insights,
    generateCreativeContent,
    isLoading,
  };
};
