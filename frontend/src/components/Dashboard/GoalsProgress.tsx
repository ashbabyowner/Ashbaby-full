import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Progress,
  CircularProgress,
  CircularProgressLabel,
  Grid,
  Badge,
  Button,
  useColorModeValue,
  Icon,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import {
  IoTrophyOutline,
  IoAddOutline,
  IoCheckmarkCircleOutline,
} from 'react-icons/io5';
import { useGoals } from '../../hooks/useGoals';

interface GoalsProgressProps {
  compact?: boolean;
}

export const GoalsProgress: React.FC<GoalsProgressProps> = ({ compact }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const { goals, addGoal, updateProgress, isLoading } = useGoals();

  const MotionBox = motion(Box);

  const GoalCard = ({
    goal,
    showDetails = true,
  }: {
    goal: any;
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
              as={IoTrophyOutline}
              color={`${goal.category}.500`}
              boxSize={5}
            />
            <Text fontWeight="medium">{goal.title}</Text>
          </HStack>
          <Badge
            colorScheme={goal.category}
            variant="subtle"
            borderRadius="full"
          >
            {goal.category}
          </Badge>
        </HStack>

        <HStack spacing={4}>
          <CircularProgress
            value={goal.progress}
            color={`${goal.category}.500`}
            size="60px"
          >
            <CircularProgressLabel>
              {goal.progress}%
            </CircularProgressLabel>
          </CircularProgress>

          {showDetails && (
            <VStack align="stretch" flex="1">
              <Text fontSize="sm" color="gray.500">
                {goal.description}
              </Text>
              <HStack fontSize="sm">
                <Text color="gray.500">Target:</Text>
                <Text fontWeight="medium">{goal.target}</Text>
              </HStack>
            </VStack>
          )}
        </HStack>

        {showDetails && (
          <VStack align="stretch" spacing={2}>
            <Text fontSize="sm" color="gray.500">
              Milestones
            </Text>
            {goal.milestones.map((milestone: any, index: number) => (
              <HStack key={index} justify="space-between">
                <HStack>
                  <Icon
                    as={IoCheckmarkCircleOutline}
                    color={milestone.completed ? 'green.500' : 'gray.400'}
                  />
                  <Text fontSize="sm">{milestone.title}</Text>
                </HStack>
                <Badge
                  colorScheme={milestone.completed ? 'green' : 'gray'}
                  variant="subtle"
                >
                  {milestone.completed ? 'Done' : 'Pending'}
                </Badge>
              </HStack>
            ))}
          </VStack>
        )}
      </VStack>
    </MotionBox>
  );

  if (compact) {
    return (
      <Box>
        <HStack mb={4} justify="space-between">
          <Text fontSize="lg" fontWeight="bold">
            Goals Overview
          </Text>
          <Button
            leftIcon={<IoAddOutline />}
            size="sm"
            colorScheme="blue"
            variant="ghost"
            onClick={() => addGoal()}
          >
            Add
          </Button>
        </HStack>
        <VStack align="stretch" spacing={4}>
          {goals.slice(0, 2).map((goal) => (
            <GoalCard key={goal.id} goal={goal} showDetails={false} />
          ))}
        </VStack>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <HStack mb={6} justify="space-between">
        <Text fontSize="2xl" fontWeight="bold">
          Goals Progress
        </Text>
        <Button
          leftIcon={<IoAddOutline />}
          colorScheme="blue"
          onClick={() => addGoal()}
        >
          Add New Goal
        </Button>
      </HStack>

      <Grid
        templateColumns={{
          base: '1fr',
          md: 'repeat(2, 1fr)',
          lg: 'repeat(3, 1fr)',
        }}
        gap={6}
      >
        {goals.map((goal) => (
          <GoalCard key={goal.id} goal={goal} />
        ))}
      </Grid>
    </Box>
  );
};
