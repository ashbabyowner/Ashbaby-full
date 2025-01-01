import React from 'react';
import {
  Box,
  Flex,
  Text,
  Avatar,
  useColorModeValue,
  Badge,
} from '@chakra-ui/react';
import { Message } from '../../types/chat';
import { format } from 'date-fns';

interface MessageBubbleProps {
  message: Message;
  isUser: boolean;
  timestamp: Date;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isUser,
  timestamp,
}) => {
  const bubbleBg = useColorModeValue(
    isUser ? 'blue.500' : 'gray.100',
    isUser ? 'blue.400' : 'gray.700'
  );
  const textColor = useColorModeValue(
    isUser ? 'white' : 'gray.800',
    isUser ? 'white' : 'gray.100'
  );

  return (
    <Flex
      justify={isUser ? 'flex-end' : 'flex-start'}
      mb={4}
      align="flex-start"
    >
      {!isUser && (
        <Avatar
          size="sm"
          name="AI Assistant"
          src="/ai-avatar.png"
          mr={2}
        />
      )}
      <Box maxW="70%">
        <Box
          bg={bubbleBg}
          color={textColor}
          px={4}
          py={2}
          borderRadius="lg"
          boxShadow="sm"
        >
          <Text fontSize="md">{message.content}</Text>
          {'category' in message && (
            <Badge
              colorScheme={isUser ? 'blue' : 'gray'}
              mt={2}
            >
              {message.category}
            </Badge>
          )}
        </Box>
        <Text
          fontSize="xs"
          color="gray.500"
          mt={1}
          textAlign={isUser ? 'right' : 'left'}
        >
          {format(timestamp, 'h:mm a')}
        </Text>
      </Box>
      {isUser && (
        <Avatar
          size="sm"
          name="User"
          src={message.userAvatar}
          ml={2}
        />
      )}
    </Flex>
  );
};
