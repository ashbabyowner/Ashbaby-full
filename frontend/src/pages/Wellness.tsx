import React, { useState } from 'react';
import { Box, Grid, Typography, Tab, Tabs } from '@mui/material';
import NutritionTracker from '../components/wellness/NutritionTracker';
import ExerciseTracker from '../components/wellness/ExerciseTracker';
import SleepTracker from '../components/wellness/SleepTracker';
import MoodTracker from '../components/wellness/MoodTracker';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`wellness-tabpanel-${index}`}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const Wellness: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  // Sample data - replace with actual data from your API
  const nutritionData = {
    calories: {
      consumed: 1850,
      target: 2000,
    },
    macros: {
      protein: {
        current: 85,
        target: 150,
        label: 'Protein',
        color: '#2196f3',
      },
      carbs: {
        current: 200,
        target: 250,
        label: 'Carbs',
        color: '#4caf50',
      },
      fat: {
        current: 65,
        target: 70,
        label: 'Fat',
        color: '#ff9800',
      },
    },
  };

  const exerciseData = {
    steps: {
      current: 8500,
      target: 10000,
      history: [6500, 7200, 8500, 9000, 8500, 7800, 8500],
    },
    workouts: {
      completed: 3,
      target: 5,
      types: [
        { name: 'Running', duration: 30 },
        { name: 'Yoga', duration: 45 },
        { name: 'Strength', duration: 40 },
      ],
    },
    calories: {
      burned: 450,
      target: 500,
    },
  };

  const sleepData = {
    today: {
      duration: 7.5,
      quality: 4,
      bedtime: '10:30 PM',
      wakeTime: '6:00 AM',
    },
    weekly: {
      dates: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      durations: [7, 6.5, 8, 7.5, 7, 8.5, 7.5],
      qualities: [3, 3.5, 4, 4, 3.5, 4.5, 4],
    },
    insights: [
      'Your average sleep duration is improving',
      'Consistent bedtime helps maintain good sleep quality',
      'Consider going to bed 30 minutes earlier',
    ],
  };

  const moodData = {
    current: {
      score: 4,
      note: 'Feeling productive and energetic today!',
    },
    history: [
      { score: 3, note: 'Regular day', timestamp: '2023-12-24' },
      { score: 4, note: 'Good progress at work', timestamp: '2023-12-25' },
      { score: 5, note: 'Great day!', timestamp: '2023-12-26' },
      { score: 4, note: 'Productive day', timestamp: '2023-12-27' },
      { score: 3, note: 'Tired but okay', timestamp: '2023-12-28' },
      { score: 4, note: 'Getting better', timestamp: '2023-12-29' },
      { score: 4, note: 'Feeling good', timestamp: '2023-12-30' },
    ],
    insights: [
      'Your mood has been consistently positive this week',
      'Exercise seems to improve your mood',
      'Consider journaling on lower mood days',
    ],
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleMoodUpdate = (score: number, note: string) => {
    // Update mood data through your API
    console.log('Mood updated:', { score, note });
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Wellness Tracker
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="wellness tracker tabs"
          variant="fullWidth"
        >
          <Tab label="Overview" />
          <Tab label="Nutrition" />
          <Tab label="Exercise" />
          <Tab label="Sleep" />
          <Tab label="Mood" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <MoodTracker data={moodData} onMoodUpdate={handleMoodUpdate} />
          </Grid>
          <Grid item xs={12} md={6}>
            <NutritionTracker data={nutritionData} />
          </Grid>
          <Grid item xs={12} md={6}>
            <ExerciseTracker data={exerciseData} />
          </Grid>
          <Grid item xs={12}>
            <SleepTracker data={sleepData} />
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <NutritionTracker data={nutritionData} />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <ExerciseTracker data={exerciseData} />
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <SleepTracker data={sleepData} />
      </TabPanel>

      <TabPanel value={tabValue} index={4}>
        <MoodTracker data={moodData} onMoodUpdate={handleMoodUpdate} />
      </TabPanel>
    </Box>
  );
};

export default Wellness;
