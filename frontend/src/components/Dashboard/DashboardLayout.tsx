import React, { useState } from 'react';
import {
  Box,
  Grid,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  VStack,
  useColorModeValue,
  Container,
  Flex,
  Icon,
  Text,
  Button,
} from '@chakra-ui/react';
import {
  IoHomeOutline,
  IoHeartOutline,
  IoWalletOutline,
  IoTrophyOutline,
  IoHappyOutline,
  IoLeafOutline,
  IoBookOutline,
  IoPeopleOutline,
  IoListOutline,
} from 'react-icons/io5';

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

import { useAI } from '../../hooks/useAI';
import { AIInsights } from '../AI/AIInsights';

export const DashboardLayout = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const { insights, getInsights, isLoading } = useAI();

  const tabs = [
    { name: 'Overview', icon: IoHomeOutline },
    { name: 'Health', icon: IoHeartOutline },
    { name: 'Finance', icon: IoWalletOutline },
    { name: 'Goals', icon: IoTrophyOutline },
    { name: 'Mood', icon: IoHappyOutline },
    { name: 'Habits', icon: IoLeafOutline },
    { name: 'Journal', icon: IoBookOutline },
    { name: 'Learning', icon: IoBookOutline },
    { name: 'Social', icon: IoPeopleOutline },
    { name: 'Mindfulness', icon: IoLeafOutline },
    { name: 'Tasks', icon: IoListOutline },
  ];

  const Overview = () => (
    <VStack spacing={6} align="stretch">
      {/* AI Insights */}
      {insights && (
        <Box
          p={6}
          bg={bgColor}
          borderRadius="lg"
          borderWidth="1px"
          borderColor={borderColor}
          boxShadow="sm"
        >
          <Text fontSize="xl" fontWeight="bold" mb={4}>
            AI Insights & Recommendations
          </Text>
          <AIInsights insights={insights} />
        </Box>
      )}

      {/* Quick Actions */}
      <Box
        p={6}
        bg={bgColor}
        borderRadius="lg"
        borderWidth="1px"
        borderColor={borderColor}
        boxShadow="sm"
      >
        <Text fontSize="xl" fontWeight="bold" mb={4}>
          Quick Actions
        </Text>
        <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
          <Button leftIcon={<IoLeafOutline />} onClick={() => setSelectedTab(9)}>
            Start Meditation
          </Button>
          <Button leftIcon={<IoListOutline />} onClick={() => setSelectedTab(10)}>
            Add Task
          </Button>
          <Button leftIcon={<IoBookOutline />} onClick={() => setSelectedTab(6)}>
            Journal Entry
          </Button>
          <Button leftIcon={<IoTrophyOutline />} onClick={() => setSelectedTab(3)}>
            Track Goal
          </Button>
        </Grid>
      </Box>

      {/* Main Dashboard Grid */}
      <Grid templateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={6}>
        <HealthMetrics compact />
        <FinanceOverview compact />
        <GoalsProgress compact />
        <MoodTracker compact />
        <HabitTracker compact />
        <TaskManager compact />
      </Grid>

      {/* Secondary Dashboard Grid */}
      <Grid templateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={6}>
        <JournalEntries compact />
        <LearningProgress compact />
        <SocialConnections compact />
        <MindfulnessTracker compact />
      </Grid>
    </VStack>
  );

  return (
    <Container maxW="container.xl" py={8}>
      <Tabs
        index={selectedTab}
        onChange={setSelectedTab}
        variant="enclosed"
        colorScheme="blue"
      >
        <TabList overflowX="auto" overflowY="hidden" whiteSpace="nowrap">
          {tabs.map((tab, index) => (
            <Tab key={index}>
              <Flex align="center">
                <Icon as={tab.icon} mr={2} />
                <Text>{tab.name}</Text>
              </Flex>
            </Tab>
          ))}
        </TabList>

        <TabPanels mt={6}>
          <TabPanel p={0}>
            <Overview />
          </TabPanel>
          <TabPanel p={0}>
            <HealthMetrics />
          </TabPanel>
          <TabPanel p={0}>
            <FinanceOverview />
          </TabPanel>
          <TabPanel p={0}>
            <GoalsProgress />
          </TabPanel>
          <TabPanel p={0}>
            <MoodTracker />
          </TabPanel>
          <TabPanel p={0}>
            <HabitTracker />
          </TabPanel>
          <TabPanel p={0}>
            <JournalEntries />
          </TabPanel>
          <TabPanel p={0}>
            <LearningProgress />
          </TabPanel>
          <TabPanel p={0}>
            <SocialConnections />
          </TabPanel>
          <TabPanel p={0}>
            <MindfulnessTracker />
          </TabPanel>
          <TabPanel p={0}>
            <TaskManager />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  );
};
