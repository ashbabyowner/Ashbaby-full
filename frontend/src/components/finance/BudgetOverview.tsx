import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Grid,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Info,
  AttachMoney,
  ShoppingCart,
  Home,
  DirectionsCar,
  LocalHospital,
  School,
  Restaurant,
  TheaterComedy,
} from '@mui/icons-material';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, ChartTooltip, Legend);

interface Category {
  name: string;
  budget: number;
  spent: number;
  icon: React.ReactNode;
  color: string;
}

interface Props {
  totalIncome: number;
  totalExpenses: number;
  categories: Category[];
}

const BudgetOverview: React.FC<Props> = ({
  totalIncome,
  totalExpenses,
  categories,
}) => {
  const remainingBudget = totalIncome - totalExpenses;
  const savingsRate = ((totalIncome - totalExpenses) / totalIncome) * 100;

  const chartData = {
    labels: categories.map((cat) => cat.name),
    datasets: [
      {
        data: categories.map((cat) => cat.spent),
        backgroundColor: categories.map((cat) => cat.color),
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: {
        display: false,
      },
    },
    cutout: '70%',
  };

  return (
    <Card>
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Typography variant="h6">Budget Overview</Typography>
          <Tooltip title="Monthly budget overview and spending patterns">
            <IconButton size="small">
              <Info />
            </IconButton>
          </Tooltip>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Monthly Income
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <AttachMoney />
                <Typography variant="h4">
                  ${totalIncome.toLocaleString()}
                </Typography>
                <TrendingUp color="success" />
              </Box>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Total Expenses
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <ShoppingCart />
                <Typography variant="h4" color="error">
                  ${totalExpenses.toLocaleString()}
                </Typography>
                <TrendingDown color="error" />
              </Box>
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Remaining Budget
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Typography variant="h4" color={remainingBudget >= 0 ? 'success.main' : 'error.main'}>
                  ${Math.abs(remainingBudget).toLocaleString()}
                </Typography>
                <Typography
                  variant="body2"
                  color={remainingBudget >= 0 ? 'success.main' : 'error.main'}
                >
                  ({remainingBudget >= 0 ? 'Under' : 'Over'} Budget)
                </Typography>
              </Box>
              <Typography variant="body2" color="textSecondary">
                Savings Rate: {savingsRate.toFixed(1)}%
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ height: 200, position: 'relative' }}>
              <Doughnut data={chartData} options={chartOptions} />
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center',
                }}
              >
                <Typography variant="h6">
                  ${totalExpenses.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Total Spent
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12}>
            {categories.map((category) => (
              <Box key={category.name} sx={{ mb: 2 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {category.icon}
                    <Typography variant="body2">{category.name}</Typography>
                  </Box>
                  <Typography variant="body2">
                    ${category.spent.toLocaleString()} /{' '}
                    ${category.budget.toLocaleString()}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(category.spent / category.budget) * 100}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: `${category.color}40`,
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: category.color,
                    },
                  }}
                />
              </Box>
            ))}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export const defaultCategories: Category[] = [
  {
    name: 'Housing',
    budget: 2000,
    spent: 1800,
    icon: <Home />,
    color: '#2196f3',
  },
  {
    name: 'Transportation',
    budget: 500,
    spent: 450,
    icon: <DirectionsCar />,
    color: '#4caf50',
  },
  {
    name: 'Healthcare',
    budget: 300,
    spent: 200,
    icon: <LocalHospital />,
    color: '#f44336',
  },
  {
    name: 'Education',
    budget: 400,
    spent: 350,
    icon: <School />,
    color: '#9c27b0',
  },
  {
    name: 'Food',
    budget: 600,
    spent: 550,
    icon: <Restaurant />,
    color: '#ff9800',
  },
  {
    name: 'Entertainment',
    budget: 300,
    spent: 280,
    icon: <TheaterComedy />,
    color: '#795548',
  },
];

export default BudgetOverview;
