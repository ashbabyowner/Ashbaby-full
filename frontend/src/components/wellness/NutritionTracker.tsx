import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Grid,
} from '@mui/material';
import { PieChart } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartData,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface MacroNutrient {
  current: number;
  target: number;
  label: string;
  color: string;
}

interface NutritionData {
  calories: {
    consumed: number;
    target: number;
  };
  macros: {
    protein: MacroNutrient;
    carbs: MacroNutrient;
    fat: MacroNutrient;
  };
}

interface Props {
  data: NutritionData;
}

const NutritionTracker: React.FC<Props> = ({ data }) => {
  const chartData: ChartData<'pie'> = {
    labels: ['Protein', 'Carbs', 'Fat'],
    datasets: [
      {
        data: [
          data.macros.protein.current,
          data.macros.carbs.current,
          data.macros.fat.current,
        ],
        backgroundColor: [
          data.macros.protein.color,
          data.macros.carbs.color,
          data.macros.fat.color,
        ],
      },
    ],
  };

  const calorieProgress = (data.calories.consumed / data.calories.target) * 100;

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Nutrition Tracker
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Calories
              </Typography>
              <Typography variant="h4">
                {data.calories.consumed} / {data.calories.target}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={Math.min(calorieProgress, 100)}
                sx={{ mt: 1, height: 8, borderRadius: 4 }}
              />
            </Box>

            {Object.entries(data.macros).map(([key, macro]) => (
              <Box key={key} sx={{ mb: 2 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mb: 1,
                  }}
                >
                  <Typography variant="body2">{macro.label}</Typography>
                  <Typography variant="body2">
                    {macro.current}g / {macro.target}g
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(macro.current / macro.target) * 100}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: `${macro.color}40`,
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: macro.color,
                    },
                  }}
                />
              </Box>
            ))}
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ height: 200 }}>
              <PieChart data={chartData} />
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default NutritionTracker;
