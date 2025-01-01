import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Rating,
  Chip,
} from '@mui/material';
import { Bedtime, Brightness4 } from '@mui/icons-material';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface SleepData {
  today: {
    duration: number;
    quality: number;
    bedtime: string;
    wakeTime: string;
  };
  weekly: {
    dates: string[];
    durations: number[];
    qualities: number[];
  };
  insights: string[];
}

interface Props {
  data: SleepData;
}

const SleepTracker: React.FC<Props> = ({ data }) => {
  const sleepChartData: ChartData<'bar'> = {
    labels: data.weekly.dates,
    datasets: [
      {
        label: 'Sleep Duration (hours)',
        data: data.weekly.durations,
        backgroundColor: '#5e35b1',
        borderColor: '#4527a0',
        borderWidth: 1,
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
        max: 12,
        ticks: {
          stepSize: 2,
        },
      },
    },
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Sleep Tracker
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Bedtime sx={{ mr: 1 }} />
                <Typography variant="subtitle2">Last Night's Sleep</Typography>
              </Box>
              <Typography variant="h3">{data.today.duration}h</Typography>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Sleep Quality
                </Typography>
                <Rating
                  value={data.today.quality}
                  readOnly
                  precision={0.5}
                  sx={{ color: '#5e35b1' }}
                />
              </Box>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Sleep Schedule
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Chip
                    icon={<Brightness4 />}
                    label={`Bed: ${data.today.bedtime}`}
                    sx={{ width: '100%' }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Chip
                    icon={<Bedtime />}
                    label={`Wake: ${data.today.wakeTime}`}
                    sx={{ width: '100%' }}
                  />
                </Grid>
              </Grid>
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Sleep Insights
              </Typography>
              {data.insights.map((insight, index) => (
                <Typography
                  key={index}
                  variant="body2"
                  color="textSecondary"
                  sx={{ mb: 1 }}
                >
                  • {insight}
                </Typography>
              ))}
            </Box>
          </Grid>

          <Grid item xs={12} md={8}>
            <Box sx={{ height: 300 }}>
              <Typography variant="subtitle2" gutterBottom>
                Weekly Sleep Pattern
              </Typography>
              <Bar data={sleepChartData} options={chartOptions} />
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default SleepTracker;
