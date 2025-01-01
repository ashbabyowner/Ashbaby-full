import React from 'react';
import {
  Box,
  VStack,
  Text,
  IconButton,
  useColorModeValue,
  Heading,
  Image,
  AspectRatio,
  Flex,
} from '@chakra-ui/react';
import { IoClose } from 'react-icons/io5';
import { motion } from 'framer-motion';
import { CreativeContent } from '../../types/chat';

interface CreativePanelProps {
  content?: CreativeContent;
  onClose: () => void;
}

export const CreativePanel: React.FC<CreativePanelProps> = ({
  content,
  onClose,
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const renderContent = () => {
    if (!content) return null;

    switch (content.contentType) {
      case 'image':
        return (
          <Image
            src={content.content}
            alt="AI Generated Image"
            borderRadius="md"
            objectFit="cover"
          />
        );
      case 'video':
        return (
          <AspectRatio ratio={16 / 9}>
            <video
              controls
              src={content.content}
              style={{ borderRadius: '0.375rem' }}
            />
          </AspectRatio>
        );
      case 'music':
        return (
          <audio
            controls
            src={content.content}
            style={{ width: '100%' }}
          />
        );
      default:
        return (
          <Text fontSize="sm" whiteSpace="pre-wrap">
            {content.content}
          </Text>
        );
    }
  };

  return (
    <Box
      as={motion.div}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      bg={bgColor}
      borderRadius="lg"
      borderWidth="1px"
      borderColor={borderColor}
      p={4}
      w="100%"
      h="fit-content"
      maxH="50vh"
      overflowY="auto"
    >
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="md">
          {content?.contentType
            ? `AI Generated ${content.contentType.charAt(0).toUpperCase() + content.contentType.slice(1)}`
            : 'Creative Content'}
        </Heading>
        <IconButton
          aria-label="Close panel"
          icon={<IoClose />}
          size="sm"
          variant="ghost"
          onClick={onClose}
        />
      </Flex>
      <VStack spacing={4} align="stretch">
        {content && (
          <>
            <Text fontSize="sm" color="gray.500">
              Prompt: {content.prompt}
            </Text>
            {renderContent()}
          </>
        )}
      </VStack>
    </Box>
  );
};
