import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Flex,
  Input,
  IconButton,
  VStack,
  Text,
  useColorModeValue,
  Avatar,
  Spinner,
  Badge,
  Tooltip,
  Button,
} from '@chakra-ui/react';
import { IoSend, IoImage, IoMusicalNotes, IoVideocam } from 'react-icons/io5';
import { motion, AnimatePresence } from 'framer-motion';
import { useAIChat } from '../../hooks/useAIChat';
import { Message, CreativeContent } from '../../types/chat';
import { MessageBubble } from './MessageBubble';
import { SuggestionsPanel } from './SuggestionsPanel';
import { InsightsPanel } from './InsightsPanel';
import { CreativePanel } from './CreativePanel';

export const AIChat: React.FC = () => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showCreative, setShowCreative] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    messages,
    sendMessage,
    suggestions,
    insights,
    generateCreativeContent,
    isLoading,
  } = useAIChat();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!message.trim()) return;
    setIsTyping(true);
    await sendMessage(message);
    setMessage('');
    setIsTyping(false);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCreativeContent = async (type: string) => {
    if (!message.trim()) return;
    setShowCreative(true);
    await generateCreativeContent(type, message);
    setMessage('');
  };

  return (
    <Flex
      direction="column"
      h="100vh"
      maxW="1200px"
      mx="auto"
      p={4}
      bg={bgColor}
      borderRadius="lg"
      boxShadow="lg"
    >
      <Flex flex="1" gap={4}>
        {/* Main Chat Area */}
        <VStack flex="2" spacing={4} align="stretch">
          <Box
            flex="1"
            overflowY="auto"
            borderRadius="md"
            borderWidth="1px"
            borderColor={borderColor}
            p={4}
          >
            <AnimatePresence>
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <MessageBubble
                    message={msg}
                    isUser={msg.isUser}
                    timestamp={msg.timestamp}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
            {isTyping && (
              <Flex align="center" mt={2}>
                <Avatar size="sm" name="AI Assistant" src="/ai-avatar.png" />
                <Spinner size="sm" ml={2} />
              </Flex>
            )}
            <div ref={messagesEndRef} />
          </Box>

          {/* Input Area */}
          <Flex gap={2}>
            <Input
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask anything or type 'help' for assistance..."
              size="lg"
              borderRadius="full"
            />
            <Tooltip label="Generate Image">
              <IconButton
                aria-label="Generate Image"
                icon={<IoImage />}
                onClick={() => handleCreativeContent('image')}
                isLoading={isLoading && showCreative}
                borderRadius="full"
              />
            </Tooltip>
            <Tooltip label="Generate Music">
              <IconButton
                aria-label="Generate Music"
                icon={<IoMusicalNotes />}
                onClick={() => handleCreativeContent('music')}
                isLoading={isLoading && showCreative}
                borderRadius="full"
              />
            </Tooltip>
            <Tooltip label="Generate Video">
              <IconButton
                aria-label="Generate Video"
                icon={<IoVideocam />}
                onClick={() => handleCreativeContent('video')}
                isLoading={isLoading && showCreative}
                borderRadius="full"
              />
            </Tooltip>
            <IconButton
              aria-label="Send message"
              icon={<IoSend />}
              onClick={handleSend}
              isLoading={isLoading && !showCreative}
              colorScheme="blue"
              borderRadius="full"
            />
          </Flex>
        </VStack>

        {/* Side Panel */}
        <VStack flex="1" spacing={4} display={{ base: 'none', lg: 'flex' }}>
          <SuggestionsPanel suggestions={suggestions} />
          <InsightsPanel insights={insights} />
          {showCreative && (
            <CreativePanel
              onClose={() => setShowCreative(false)}
              content={messages
                .filter((msg): msg is CreativeContent => 'contentType' in msg)
                .slice(-1)[0]}
            />
          )}
        </VStack>
      </Flex>
    </Flex>
  );
};
