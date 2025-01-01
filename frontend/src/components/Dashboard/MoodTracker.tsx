import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Grid,
  Icon,
  useColorModeValue,
  Tooltip,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import {
  IoHappyOutline,
  IoSadOutline,
  IoAddOutline,
  IoAnalyticsOutline,
} from 'react-icons/io5';
import { LineChart } from '../Charts/LineChart';
import { useMoodTracking } from '../../hooks/useMoodTracking';

interface MoodTrackerProps {
  compact?: boolean;
}

export const MoodTracker: React.FC<MoodTrackerProps> = ({ compact }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const { moods, addMood, getMoodAnalysis, isLoading } = useMoodTracking();

  const MotionBox = motion(Box);

  const moodEmojis: { [key: string]: string } = {
    great: '😊',
    good: '🙂',
    okay: '😐',
    bad: '🙁',
    terrible: '😢',
  };

  const MoodCard = ({ mood }: { mood: any }) => (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      p={4}
      bg={bgColor}
      borderRadius="lg"
      borderWidth="1px"
      borderColor={borderColor}
      boxShadow="sm"
    >
      <VStack align="stretch" spacing={3}>
        <HStack justify="space-between">
          <Text fontSize="2xl">{moodEmojis[mood.type]}</Text>
          <Text fontSize="sm" color="gray.500">
            {new Date(mood.timestamp).toLocaleTimeString()}
          </Text>
        </HStack>

        <Text fontSize="md" fontWeight="medium">
          {mood.type.charAt(0).toUpperCase() + mood.type.slice(1)}
        </Text>

        {mood.notes && (
          <Text fontSize="sm" color="gray.500">
            {mood.notes}
          </Text>
        )}

        {mood.factors && mood.factors.length > 0 && (
          <HStack flexWrap="wrap" spacing={2}>
            {mood.factors.map((factor: string, index: number) => (
              <Box
                key={index}
                px={2}
                py={1}
                bg={useColorModeValue('gray.100', 'gray.700')}
                borderRadius="full"
                fontSize="xs"
              >
                {factor}
              </Box>
            ))}
          </HStack>
        )}
      </VStack>
    </MotionBox>
  );

  if (compact) {
    return (
      <Box>
        <HStack mb={4} justify="space-between">
          <Text fontSize="lg" fontWeight="bold">
            Mood Tracking
          </Text>
          <Button
            leftIcon={<IoAddOutline />}
            size="sm"
            colorScheme="blue"
            variant="ghost"
            onClick={() => addMood()}
          >
            Log
          </Button>
        </HStack>
        <Grid templateColumns="repeat(5, 1fr)" gap={2}>
          {Object.entries(moodEmojis).map(([type, emoji]) => (
            <Tooltip key={type} label={type.charAt(0).toUpperCase() + type.slice(1)}>
              <Button
                fontSize="xl"
                variant="outline"
                onClick={() => addMood(type)}
                p={6}
              >
                {emoji}
              </Button>
            </Tooltip>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <HStack mb={6} justify="space-between">
        <Text fontSize="2xl" fontWeight="bold">
          Mood Tracker
        </Text>
        <HStack>
          <Button
            leftIcon={<IoAnalyticsOutline />}
            variant="outline"
            onClick={() => getMoodAnalysis()}
          >
            Analysis
          </Button>
          <Button
            leftIcon={<IoAddOutline />}
            colorScheme="blue"
            onClick={() => addMood()}
          >
            Log Mood
          </Button>
        </HStack>
      </HStack>

      <Grid
        templateColumns={{
          base: '1fr',
          md: 'repeat(2, 1fr)',
          lg: 'repeat(3, 1fr)',
        }}
        gap={6}
        mb={8}
      >
        {moods.slice(0, 6).map((mood) => (
          <MoodCard key={mood.id} mood={mood} />
        ))}
      </Grid>

      <Box>
        <Text fontSize="xl" fontWeight="bold" mb={4}>
          Mood Trends
        </Text>
        <LineChart
          data={moods.map((mood) => ({
            timestamp: mood.timestamp,
            value: Object.keys(moodEmojis).indexOf(mood.type) + 1,
          }))}
          categories={['Mood Level']}
          colors={['purple.500']}
        />
      </Box>
    </Box>
  );
};
