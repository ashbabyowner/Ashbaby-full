import React from 'react';
import {
  Box,
  VStack,
  Text,
  Button,
  useColorModeValue,
  Heading,
  Divider,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';

interface Suggestion {
  category: string;
  suggestions: string[];
}

interface SuggestionsPanelProps {
  suggestions: Suggestion[];
}

export const SuggestionsPanel: React.FC<SuggestionsPanelProps> = ({
  suggestions,
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

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
      <Heading size="md" mb={4}>
        Suggestions
      </Heading>
      <VStack spacing={4} align="stretch">
        {suggestions.map((category, index) => (
          <Box key={index}>
            <Text
              fontWeight="bold"
              color="blue.500"
              mb={2}
            >
              {category.category}
            </Text>
            <VStack spacing={2} align="stretch">
              {category.suggestions.map((suggestion, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  justifyContent="flex-start"
                  whiteSpace="normal"
                  textAlign="left"
                  height="auto"
                  py={2}
                  _hover={{
                    bg: useColorModeValue('blue.50', 'blue.900'),
                  }}
                >
                  {suggestion}
                </Button>
              ))}
            </VStack>
            {index < suggestions.length - 1 && (
              <Divider my={2} />
            )}
          </Box>
        ))}
      </VStack>
    </Box>
  );
};
