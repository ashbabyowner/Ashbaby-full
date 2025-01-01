import React, { useState } from 'react';
import {
  Box,
  Grid,
  Flex,
  Text,
  useColorModeValue,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Container,
  Heading,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { HealthMetrics } from './HealthMetrics';
import { FinanceOverview } from './FinanceOverview';
import { GoalsProgress } from './GoalsProgress';
import { MoodTracker } from './MoodTracker';
import { HabitTracker } from './HabitTracker';
import { JournalEntries } from './JournalEntries';
import { LearningProgress } from './LearningProgress';
import { SocialConnections } from './SocialConnections';
import { MindfulnessTracker } from './MindfulnessTracker';
import { TaskManager } from './TaskManager';
import { useUserData } from '../../hooks/useUserData';

export const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const { userData, isLoading } = useUserData();

  const tabs = [
    { name: 'Overview', icon: '📊' },
    { name: 'Health', icon: '❤️' },
    { name: 'Finance', icon: '💰' },
    { name: 'Goals', icon: '🎯' },
    { name: 'Mood', icon: '😊' },
    { name: 'Habits', icon: '⭐' },
    { name: 'Journal', icon: '📔' },
    { name: 'Learning', icon: '📚' },
    { name: 'Social', icon: '👥' },
    { name: 'Mindfulness', icon: '🧘' },
    { name: 'Tasks', icon: '✅' },
  ];

  const MotionBox = motion(Box);

  return (
    <Container maxW="container.xl" py={8}>
      <Flex direction="column" gap={8}>
        {/* Welcome Section */}
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Heading size="lg" mb={2}>
            Welcome back, {userData?.name}! 👋
          </Heading>
          <Text color="gray.500">
            Here's your personalized wellness dashboard
          </Text>
        </MotionBox>

        {/* Main Dashboard */}
        <Box
          bg={bgColor}
          borderRadius="xl"
          borderWidth="1px"
          borderColor={borderColor}
          overflow="hidden"
          boxShadow="lg"
        >
          <Tabs
            index={activeTab}
            onChange={setActiveTab}
            variant="enclosed"
            colorScheme="blue"
          >
            <TabList px={4} pt={4}>
              {tabs.map((tab, index) => (
                <Tab
                  key={index}
                  _selected={{
                    color: 'blue.500',
                    borderColor: 'blue.500',
                    borderBottom: 'none',
                  }}
                >
                  <Text fontSize="lg" mr={2}>
                    {tab.icon}
                  </Text>
                  <Text display={{ base: 'none', md: 'block' }}>
                    {tab.name}
                  </Text>
                </Tab>
              ))}
            </TabList>

            <TabPanels>
              {/* Overview Panel */}
              <TabPanel>
                <Grid
                  templateColumns={{
                    base: '1fr',
                    md: 'repeat(2, 1fr)',
                    lg: 'repeat(3, 1fr)',
                  }}
                  gap={6}
                >
                  <HealthMetrics compact />
                  <FinanceOverview compact />
                  <GoalsProgress compact />
                  <MoodTracker compact />
                  <HabitTracker compact />
                  <TaskManager compact />
                </Grid>
              </TabPanel>

              {/* Health Panel */}
              <TabPanel>
                <HealthMetrics />
              </TabPanel>

              {/* Finance Panel */}
              <TabPanel>
                <FinanceOverview />
              </TabPanel>

              {/* Goals Panel */}
              <TabPanel>
                <GoalsProgress />
              </TabPanel>

              {/* Mood Panel */}
              <TabPanel>
                <MoodTracker />
              </TabPanel>

              {/* Habits Panel */}
              <TabPanel>
                <HabitTracker />
              </TabPanel>

              {/* Journal Panel */}
              <TabPanel>
                <JournalEntries />
              </TabPanel>

              {/* Learning Panel */}
              <TabPanel>
                <LearningProgress />
              </TabPanel>

              {/* Social Panel */}
              <TabPanel>
                <SocialConnections />
              </TabPanel>

              {/* Mindfulness Panel */}
              <TabPanel>
                <MindfulnessTracker />
              </TabPanel>

              {/* Tasks Panel */}
              <TabPanel>
                <TaskManager />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Flex>
    </Container>
  );
};
