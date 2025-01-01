import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Grid,
  Chip,
} from '@mui/material';
import {
  DirectionsRun,
  FitnessCenter,
  LocalFireDepartment,
} from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface ExerciseData {
  steps: {
    current: number;
    target: number;
    history: number[];
  };
  workouts: {
    completed: number;
    target: number;
    types: {
      name: string;
      duration: number;
    }[];
  };
  calories: {
    burned: number;
    target: number;
  };
}

interface Props {
  data: ExerciseData;
}

const ExerciseTracker: React.FC<Props> = ({ data }) => {
  const stepsChartData: ChartData<'line'> = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Steps',
        data: data.steps.history,
        borderColor: '#2196f3',
        backgroundColor: 'rgba(33, 150, 243, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Exercise Tracker
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <DirectionsRun sx={{ mr: 1 }} />
                <Typography variant="subtitle2">Daily Steps</Typography>
              </Box>
              <Typography variant="h4">
                {data.steps.current.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Target: {data.steps.target.toLocaleString()}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={(data.steps.current / data.steps.target) * 100}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <FitnessCenter sx={{ mr: 1 }} />
                <Typography variant="subtitle2">Workouts</Typography>
              </Box>
              <Typography variant="h4">
                {data.workouts.completed} / {data.workouts.target}
              </Typography>
              <Box sx={{ mt: 1 }}>
                {data.workouts.types.map((workout) => (
                  <Chip
                    key={workout.name}
                    label={`${workout.name} (${workout.duration}min)`}
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
              </Box>
            </Box>

            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LocalFireDepartment sx={{ mr: 1 }} />
                <Typography variant="subtitle2">Calories Burned</Typography>
              </Box>
              <Typography variant="h4">{data.calories.burned}</Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Target: {data.calories.target}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={(data.calories.burned / data.calories.target) * 100}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#ff5722',
                  },
                }}
              />
            </Box>
          </Grid>

          <Grid item xs={12} md={8}>
            <Box sx={{ height: 300 }}>
              <Typography variant="subtitle2" gutterBottom>
                Steps History
              </Typography>
              <Line data={stepsChartData} options={chartOptions} />
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default ExerciseTracker;
