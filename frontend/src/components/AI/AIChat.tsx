import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Input,
  IconButton,
  Text,
  Avatar,
  useColorModeValue,
  Spinner,
  Textarea,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Badge,
  Tooltip,
  useToast,
} from '@chakra-ui/react';
import {
  IoSendOutline,
  IoAttachOutline,
  IoMicOutline,
  IoImageOutline,
  IoOptionsOutline,
  IoChevronDownOutline,
  IoRefreshOutline,
  IoCopyOutline,
  IoTrashOutline,
} from 'react-icons/io5';
import { motion } from 'framer-motion';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  attachments?: Array<{
    type: string;
    url: string;
    name: string;
  }>;
  status?: 'sending' | 'sent' | 'error';
  context?: {
    area?: string;
    confidence?: number;
    sources?: string[];
  };
}

interface AIContextMenu {
  regenerate: () => void;
  copyToClipboard: () => void;
  deleteMessage: () => void;
}

const MotionBox = motion(Box);

const MessageBubble: React.FC<{
  message: Message;
  contextMenu: AIContextMenu;
}> = ({ message, contextMenu }) => {
  const isUser = message.role === 'user';
  const bgColor = useColorModeValue(
    isUser ? 'blue.500' : 'gray.100',
    isUser ? 'blue.500' : 'gray.700'
  );
  const textColor = useColorModeValue(
    isUser ? 'white' : 'gray.800',
    isUser ? 'white' : 'gray.100'
  );

  return (
    <HStack
      alignSelf={isUser ? 'flex-end' : 'flex-start'}
      spacing={2}
      maxW="80%"
    >
      {!isUser && (
        <Avatar
          size="sm"
          name="AI Assistant"
          src="/ai-avatar.png"
          bg="blue.500"
        />
      )}
      <VStack align={isUser ? 'flex-end' : 'flex-start'} spacing={1}>
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          p={4}
          bg={bgColor}
          color={textColor}
          borderRadius="lg"
          position="relative"
        >
          <Text>{message.content}</Text>
          {message.attachments?.map((attachment, index) => (
            <Box
              key={index}
              mt={2}
              p={2}
              borderRadius="md"
              bg={useColorModeValue('gray.50', 'gray.600')}
            >
              <HStack>
                <Icon
                  as={
                    attachment.type === 'image'
                      ? IoImageOutline
                      : IoAttachOutline
                  }
                />
                <Text fontSize="sm">{attachment.name}</Text>
              </HStack>
            </Box>
          ))}
          {message.context && (
            <VStack mt={2} align="start" spacing={1}>
              {message.context.area && (
                <Badge colorScheme="blue">{message.context.area}</Badge>
              )}
              {message.context.confidence && (
                <Badge colorScheme="green">
                  {message.context.confidence}% confidence
                </Badge>
              )}
              {message.context.sources?.map((source, index) => (
                <Text key={index} fontSize="xs" color="gray.500">
                  Source: {source}
                </Text>
              ))}
            </VStack>
          )}
        </MotionBox>
        <HStack spacing={2}>
          <Text fontSize="xs" color="gray.500">
            {message.timestamp.toLocaleTimeString()}
          </Text>
          {message.status === 'sending' && <Spinner size="xs" />}
          {message.status === 'error' && (
            <Badge colorScheme="red">Error</Badge>
          )}
          {!isUser && (
            <Menu>
              <MenuButton
                as={IconButton}
                icon={<IoOptionsOutline />}
                variant="ghost"
                size="xs"
              />
              <MenuList>
                <MenuItem
                  icon={<IoRefreshOutline />}
                  onClick={contextMenu.regenerate}
                >
                  Regenerate Response
                </MenuItem>
                <MenuItem
                  icon={<IoCopyOutline />}
                  onClick={contextMenu.copyToClipboard}
                >
                  Copy to Clipboard
                </MenuItem>
                <MenuItem
                  icon={<IoTrashOutline />}
                  onClick={contextMenu.deleteMessage}
                  color="red.500"
                >
                  Delete Message
                </MenuItem>
              </MenuList>
            </Menu>
          )}
        </HStack>
      </VStack>
      {isUser && (
        <Avatar
          size="sm"
          name="User"
          src="/user-avatar.png"
          bg="gray.500"
        />
      )}
    </HStack>
  );
};

export const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() && attachments.length === 0) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
      status: 'sending',
      attachments: attachments.map(file => ({
        type: file.type.startsWith('image/') ? 'image' : 'file',
        url: URL.createObjectURL(file),
        name: file.name,
      })),
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue('');
    setAttachments([]);

    try {
      // TODO: Send message to backend
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: newMessage.content,
          attachments: newMessage.attachments,
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      const data = await response.json();
      
      setMessages(prev => [
        ...prev.slice(0, -1),
        { ...newMessage, status: 'sent' },
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
          context: data.context,
        },
      ]);
    } catch (error) {
      setMessages(prev => [
        ...prev.slice(0, -1),
        { ...newMessage, status: 'error' },
      ]);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAttachment = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const handleRecording = () => {
    setIsRecording(!isRecording);
    // TODO: Implement voice recording
  };

  const handleRegenerate = async (messageId: string) => {
    // TODO: Implement message regeneration
  };

  const handleCopyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: 'Copied',
      description: 'Message copied to clipboard',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleDeleteMessage = (messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  };

  return (
    <Box
      h="100%"
      display="flex"
      flexDirection="column"
      bg={useColorModeValue('white', 'gray.800')}
      borderRadius="lg"
      overflow="hidden"
    >
      <VStack
        flex={1}
        p={4}
        spacing={4}
        overflowY="auto"
        css={{
          '&::-webkit-scrollbar': {
            width: '4px',
          },
          '&::-webkit-scrollbar-track': {
            width: '6px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: useColorModeValue('gray.300', 'gray.600'),
            borderRadius: '24px',
          },
        }}
      >
        {messages.map(message => (
          <MessageBubble
            key={message.id}
            message={message}
            contextMenu={{
              regenerate: () => handleRegenerate(message.id),
              copyToClipboard: () => handleCopyToClipboard(message.content),
              deleteMessage: () => handleDeleteMessage(message.id),
            }}
          />
        ))}
        <div ref={chatEndRef} />
      </VStack>

      <Box p={4} borderTopWidth={1}>
        {attachments.length > 0 && (
          <HStack mb={2} spacing={2}>
            {attachments.map((file, index) => (
              <Badge key={index} colorScheme="blue">
                {file.name}
              </Badge>
            ))}
          </HStack>
        )}
        <HStack spacing={2}>
          <Tooltip label="Add attachment">
            <IconButton
              aria-label="Add attachment"
              icon={<IoAttachOutline />}
              onClick={handleAttachment}
            />
          </Tooltip>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileChange}
            multiple
          />
          <Tooltip label={isRecording ? 'Stop recording' : 'Start recording'}>
            <IconButton
              aria-label="Voice input"
              icon={<IoMicOutline />}
              onClick={handleRecording}
              colorScheme={isRecording ? 'red' : undefined}
            />
          </Tooltip>
          <Textarea
            placeholder="Type your message..."
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            rows={1}
            resize="none"
          />
          <IconButton
            aria-label="Send message"
            icon={<IoSendOutline />}
            colorScheme="blue"
            onClick={handleSend}
            isDisabled={!inputValue.trim() && attachments.length === 0}
          />
        </HStack>
      </Box>
    </Box>
  );
};
