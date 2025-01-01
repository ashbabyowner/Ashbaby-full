import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Grid,
  Icon,
  CircularProgress,
  CircularProgressLabel,
  useColorModeValue,
  Badge,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import {
  IoLeafOutline,
  IoPlayOutline,
  IoAddOutline,
  IoTimeOutline,
  IoStatsChartOutline,
  IoMusicalNotesOutline,
  IoWaterOutline,
  IoSunnyOutline,
} from 'react-icons/io5';
import { useMindfulness } from '../../hooks/useMindfulness';
import { LineChart } from '../Charts/LineChart';

interface MindfulnessTrackerProps {
  compact?: boolean;
}

export const MindfulnessTracker: React.FC<MindfulnessTrackerProps> = ({ compact }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    sessions,
    stats,
    currentSession,
    startSession,
    endSession,
    getMindfulnessInsights,
    isLoading,
  } = useMindfulness();

  const MotionBox = motion(Box);

  const MeditationTimer = () => (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent bg={bgColor}>
        <ModalHeader>Meditation Session</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={6} py={8}>
            <CircularProgress
              value={currentSession?.progress || 0}
              size="200px"
              thickness="4px"
              color="purple.500"
            >
              <CircularProgressLabel>
                <VStack spacing={0}>
                  <Text fontSize="3xl">
                    {currentSession?.remainingTime || '15:00'}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    minutes
                  </Text>
                </VStack>
              </CircularProgressLabel>
            </CircularProgress>

            <HStack spacing={4}>
              <Button
                leftIcon={<IoPlayOutline />}
                colorScheme="purple"
                size="lg"
                onClick={() => startSession()}
              >
                {currentSession ? 'Pause' : 'Start'}
              </Button>
              <Button
                leftIcon={<IoMusicalNotesOutline />}
                variant="outline"
                size="lg"
              >
                Change Sound
              </Button>
            </HStack>

            <VStack align="stretch" width="100%" spacing={4}>
              <Text fontSize="sm" fontWeight="medium">
                Background Sound
              </Text>
              <Slider
                defaultValue={30}
                min={0}
                max={100}
                colorScheme="purple"
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb boxSize={6}>
                  <Icon as={IoMusicalNotesOutline} />
                </SliderThumb>
              </Slider>
            </VStack>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );

  const SessionCard = ({ session }: { session: any }) => (
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
              as={IoLeafOutline}
              color="green.500"
              boxSize={5}
            />
            <Text fontWeight="medium">{session.type}</Text>
          </HStack>
          <Badge colorScheme="green" variant="subtle">
            {session.duration} min
          </Badge>
        </HStack>

        <HStack justify="space-between" fontSize="sm" color="gray.500">
          <HStack>
            <Icon as={IoTimeOutline} />
            <Text>
              {new Date(session.date).toLocaleDateString()}
            </Text>
          </HStack>
          <HStack>
            <Icon as={IoWaterOutline} />
            <Text>Stress Level: {session.stressLevel}</Text>
          </HStack>
        </HStack>

        {session.notes && (
          <Text fontSize="sm" color="gray.500">
            {session.notes}
          </Text>
        )}

        <HStack spacing={2}>
          {session.tags.map((tag: string) => (
            <Badge key={tag} variant="subtle" colorScheme="purple">
              {tag}
            </Badge>
          ))}
        </HStack>
      </VStack>
    </MotionBox>
  );

  const StatsCard = ({ stat }: { stat: any }) => (
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
      <VStack spacing={2}>
        <Icon as={stat.icon} boxSize={6} color={stat.color} />
        <Text fontSize="2xl" fontWeight="bold">
          {stat.value}
        </Text>
        <Text fontSize="sm" color="gray.500">
          {stat.label}
        </Text>
      </VStack>
    </MotionBox>
  );

  if (compact) {
    return (
      <Box>
        <HStack mb={4} justify="space-between">
          <Text fontSize="lg" fontWeight="bold">
            Mindfulness
          </Text>
          <Button
            leftIcon={<IoPlayOutline />}
            size="sm"
            colorScheme="purple"
            variant="ghost"
            onClick={onOpen}
          >
            Meditate
          </Button>
        </HStack>
        <Grid templateColumns="repeat(2, 1fr)" gap={4}>
          <StatsCard
            stat={{
              icon: IoLeafOutline,
              value: stats.totalMinutes,
              label: 'Minutes',
              color: 'green.500',
            }}
          />
          <StatsCard
            stat={{
              icon: IoSunnyOutline,
              value: stats.streak,
              label: 'Day Streak',
              color: 'orange.500',
            }}
          />
        </Grid>
        <MeditationTimer />
      </Box>
    );
  }

  return (
    <Box p={6}>
      <VStack align="stretch" spacing={8}>
        {/* Header */}
        <HStack justify="space-between">
          <Text fontSize="2xl" fontWeight="bold">
            Mindfulness Tracker
          </Text>
          <HStack>
            <Button
              leftIcon={<IoStatsChartOutline />}
              variant="outline"
              onClick={() => getMindfulnessInsights()}
            >
              Insights
            </Button>
            <Button
              leftIcon={<IoPlayOutline />}
              colorScheme="purple"
              onClick={onOpen}
            >
              Start Session
            </Button>
          </HStack>
        </HStack>

        {/* Stats Overview */}
        <Grid
          templateColumns={{
            base: 'repeat(2, 1fr)',
            md: 'repeat(4, 1fr)',
          }}
          gap={4}
        >
          <StatsCard
            stat={{
              icon: IoLeafOutline,
              value: stats.totalMinutes,
              label: 'Total Minutes',
              color: 'green.500',
            }}
          />
          <StatsCard
            stat={{
              icon: IoSunnyOutline,
              value: stats.streak,
              label: 'Day Streak',
              color: 'orange.500',
            }}
          />
          <StatsCard
            stat={{
              icon: IoWaterOutline,
              value: stats.averageStressLevel,
              label: 'Avg Stress Level',
              color: 'blue.500',
            }}
          />
          <StatsCard
            stat={{
              icon: IoMusicalNotesOutline,
              value: stats.totalSessions,
              label: 'Total Sessions',
              color: 'purple.500',
            }}
          />
        </Grid>

        {/* Progress Chart */}
        <Box>
          <Text fontSize="xl" fontWeight="bold" mb={4}>
            Mindfulness Progress
          </Text>
          <LineChart
            data={stats.weeklyProgress}
            categories={['Minutes', 'Stress Level']}
            colors={['green.500', 'orange.500']}
          />
        </Box>

        {/* Recent Sessions */}
        <Box>
          <Text fontSize="xl" fontWeight="bold" mb={4}>
            Recent Sessions
          </Text>
          <Grid
            templateColumns={{
              base: '1fr',
              md: 'repeat(2, 1fr)',
              lg: 'repeat(3, 1fr)',
            }}
            gap={6}
          >
            {sessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </Grid>
        </Box>

        {/* Meditation Timer Modal */}
        <MeditationTimer />
      </VStack>
    </Box>
  );
};
