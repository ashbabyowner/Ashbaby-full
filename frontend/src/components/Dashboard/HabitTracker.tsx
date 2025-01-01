import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Grid,
  Icon,
  Progress,
  useColorModeValue,
  IconButton,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import {
  IoAddOutline,
  IoCheckmarkOutline,
  IoCloseOutline,
  IoTrendingUpOutline,
} from 'react-icons/io5';
import { useHabits } from '../../hooks/useHabits';

interface HabitTrackerProps {
  compact?: boolean;
}

export const HabitTracker: React.FC<HabitTrackerProps> = ({ compact }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const { habits, addHabit, toggleHabit, getHabitAnalysis, isLoading } = useHabits();

  const MotionBox = motion(Box);

  const HabitCard = ({
    habit,
    showDetails = true,
  }: {
    habit: any;
    showDetails?: boolean;
  }) => (
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
          <HStack>
            <Icon
              as={habit.icon}
              color={habit.completed ? 'green.500' : 'gray.500'}
              boxSize={5}
            />
            <Text fontWeight="medium">{habit.name}</Text>
          </HStack>
          <HStack>
            {showDetails && (
              <Text fontSize="sm" color="gray.500">
                Streak: {habit.streak} days
              </Text>
            )}
            <IconButton
              aria-label={habit.completed ? 'Mark incomplete' : 'Mark complete'}
              icon={habit.completed ? <IoCheckmarkOutline /> : <IoCloseOutline />}
              size="sm"
              colorScheme={habit.completed ? 'green' : 'gray'}
              variant="ghost"
              onClick={() => toggleHabit(habit.id)}
            />
          </HStack>
        </HStack>

        {showDetails && (
          <>
            <Progress
              value={(habit.completedDays / habit.totalDays) * 100}
              colorScheme="blue"
              size="sm"
              borderRadius="full"
            />

            <HStack justify="space-between" fontSize="sm">
              <Text color="gray.500">
                {habit.completedDays}/{habit.totalDays} days
              </Text>
              <HStack>
                <Icon as={IoTrendingUpOutline} />
                <Text color={habit.trend > 0 ? 'green.500' : 'red.500'}>
                  {habit.trend > 0 ? '+' : ''}{habit.trend}%
                </Text>
              </HStack>
            </HStack>

            {habit.notes && (
              <Text fontSize="sm" color="gray.500">
                {habit.notes}
              </Text>
            )}
          </>
        )}
      </VStack>
    </MotionBox>
  );

  if (compact) {
    return (
      <Box>
        <HStack mb={4} justify="space-between">
          <Text fontSize="lg" fontWeight="bold">
            Habits
          </Text>
          <Button
            leftIcon={<IoAddOutline />}
            size="sm"
            colorScheme="blue"
            variant="ghost"
            onClick={() => addHabit()}
          >
            Add
          </Button>
        </HStack>
        <VStack align="stretch" spacing={4}>
          {habits.slice(0, 3).map((habit) => (
            <HabitCard key={habit.id} habit={habit} showDetails={false} />
          ))}
        </VStack>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <HStack mb={6} justify="space-between">
        <Text fontSize="2xl" fontWeight="bold">
          Habit Tracker
        </Text>
        <HStack>
          <Button
            leftIcon={<IoTrendingUpOutline />}
            variant="outline"
            onClick={() => getHabitAnalysis()}
          >
            Analysis
          </Button>
          <Button
            leftIcon={<IoAddOutline />}
            colorScheme="blue"
            onClick={() => addHabit()}
          >
            New Habit
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
      >
        {habits.map((habit) => (
          <HabitCard key={habit.id} habit={habit} />
        ))}
      </Grid>
    </Box>
  );
};
