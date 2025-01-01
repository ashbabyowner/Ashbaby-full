import React from 'react';
import {
  Box,
  VStack,
  Text,
  useColorModeValue,
  Heading,
  Badge,
  Divider,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';

interface Insight {
  category: string;
  content: string;
}

interface InsightsPanelProps {
  insights: Insight[];
}

export const InsightsPanel: React.FC<InsightsPanelProps> = ({
  insights,
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const insightBg = useColorModeValue('blue.50', 'blue.900');

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'emotional':
        return 'pink';
      case 'behavioral':
        return 'purple';
      case 'goals':
        return 'green';
      case 'support_needs':
        return 'orange';
      default:
        return 'blue';
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
      <Heading size="md" mb={4}>
        AI Insights
      </Heading>
      <VStack spacing={4} align="stretch">
        {insights.map((insight, index) => (
          <Box
            key={index}
            bg={insightBg}
            p={4}
            borderRadius="md"
            position="relative"
          >
            <Badge
              colorScheme={getCategoryColor(insight.category)}
              position="absolute"
              top={2}
              right={2}
            >
              {insight.category}
            </Badge>
            <Text
              mt={2}
              fontSize="sm"
              whiteSpace="pre-wrap"
            >
              {insight.content}
            </Text>
            {index < insights.length - 1 && (
              <Divider my={2} />
            )}
          </Box>
        ))}
      </VStack>
    </Box>
  );
};
