import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  IconButton,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  SentimentVeryDissatisfied,
  SentimentDissatisfied,
  SentimentNeutral,
  SentimentSatisfied,
  SentimentVerySatisfied,
  Add as AddIcon,
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

interface MoodEntry {
  score: number;
  note: string;
  timestamp: string;
}

interface MoodData {
  current: {
    score: number;
    note: string;
  };
  history: MoodEntry[];
  insights: string[];
}

interface Props {
  data: MoodData;
  onMoodUpdate: (score: number, note: string) => void;
}

const MoodTracker: React.FC<Props> = ({ data, onMoodUpdate }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [moodNote, setMoodNote] = useState('');

  const moodIcons = [
    { icon: <SentimentVeryDissatisfied />, score: 1, label: 'Very Bad' },
    { icon: <SentimentDissatisfied />, score: 2, label: 'Bad' },
    { icon: <SentimentNeutral />, score: 3, label: 'Okay' },
    { icon: <SentimentSatisfied />, score: 4, label: 'Good' },
    { icon: <SentimentVerySatisfied />, score: 5, label: 'Very Good' },
  ];

  const getMoodIcon = (score: number) => {
    return moodIcons.find((mood) => mood.score === score)?.icon;
  };

  const getMoodLabel = (score: number) => {
    return moodIcons.find((mood) => mood.score === score)?.label;
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
    setSelectedMood(null);
    setMoodNote('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSubmitMood = () => {
    if (selectedMood) {
      onMoodUpdate(selectedMood, moodNote);
      handleCloseDialog();
    }
  };

  const moodChartData: ChartData<'line'> = {
    labels: data.history.map((entry) =>
      new Date(entry.timestamp).toLocaleDateString()
    ),
    datasets: [
      {
        label: 'Mood Score',
        data: data.history.map((entry) => entry.score),
        borderColor: '#ff4081',
        backgroundColor: 'rgba(255, 64, 129, 0.1)',
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
        min: 1,
        max: 5,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <Card>
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Typography variant="h6">Mood Tracker</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
          >
            Log Mood
          </Button>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Current Mood
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mb: 1,
                }}
              >
                <Box sx={{ transform: 'scale(1.5)' }}>
                  {getMoodIcon(data.current.score)}
                </Box>
                <Typography variant="h6">
                  {getMoodLabel(data.current.score)}
                </Typography>
              </Box>
              {data.current.note && (
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{
                    p: 1,
                    bgcolor: 'background.default',
                    borderRadius: 1,
                  }}
                >
                  "{data.current.note}"
                </Typography>
              )}
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Mood Insights
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
                Mood History
              </Typography>
              <Line data={moodChartData} options={chartOptions} />
            </Box>
          </Grid>
        </Grid>
      </CardContent>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>How are you feeling?</DialogTitle>
        <DialogContent>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              mb: 3,
              mt: 2,
            }}
          >
            {moodIcons.map((mood) => (
              <IconButton
                key={mood.score}
                onClick={() => setSelectedMood(mood.score)}
                color={selectedMood === mood.score ? 'primary' : 'default'}
                sx={{
                  transform: selectedMood === mood.score ? 'scale(1.2)' : 'none',
                  transition: '0.3s',
                }}
              >
                {mood.icon}
              </IconButton>
            ))}
          </Box>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Add a note (optional)"
            value={moodNote}
            onChange={(e) => setMoodNote(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmitMood}
            variant="contained"
            disabled={!selectedMood}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default MoodTracker;
