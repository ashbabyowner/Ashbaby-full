import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';

interface Goal {
  id: number;
  title: string;
  description: string;
  category: string;
  progress: number;
  targetDate: string;
  status: 'in_progress' | 'completed' | 'cancelled';
}

const categories = [
  'Personal Growth',
  'Career',
  'Health',
  'Education',
  'Finance',
  'Relationships',
];

const validationSchema = yup.object({
  title: yup.string().required('Title is required'),
  description: yup.string().required('Description is required'),
  category: yup.string().required('Category is required'),
  targetDate: yup.date().required('Target date is required'),
});

const Goals: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: 1,
      title: 'Learn React',
      description: 'Master React and its ecosystem',
      category: 'Education',
      progress: 75,
      targetDate: '2024-12-31',
      status: 'in_progress',
    },
    // Add more sample goals
  ]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  const handleOpenDialog = (goal?: Goal) => {
    if (goal) {
      setSelectedGoal(goal);
    } else {
      setSelectedGoal(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedGoal(null);
  };

  const formik = useFormik({
    initialValues: {
      title: selectedGoal?.title || '',
      description: selectedGoal?.description || '',
      category: selectedGoal?.category || '',
      targetDate: selectedGoal?.targetDate || '',
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      if (selectedGoal) {
        // Update existing goal
        setGoals((prev) =>
          prev.map((g) =>
            g.id === selectedGoal.id
              ? { ...g, ...values, progress: g.progress }
              : g
          )
        );
      } else {
        // Add new goal
        setGoals((prev) => [
          ...prev,
          {
            id: Date.now(),
            ...values,
            progress: 0,
            status: 'in_progress',
          } as Goal,
        ]);
      }
      handleCloseDialog();
    },
  });

  const handleDeleteGoal = (goalId: number) => {
    setGoals((prev) => prev.filter((g) => g.id !== goalId));
  };

  const handleUpdateProgress = (goalId: number, newProgress: number) => {
    setGoals((prev) =>
      prev.map((g) =>
        g.id === goalId
          ? {
              ...g,
              progress: newProgress,
              status: newProgress === 100 ? 'completed' : 'in_progress',
            }
          : g
      )
    );
  };

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
        }}
      >
        <Typography variant="h4">Goals</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Goal
        </Button>
      </Box>

      <Grid container spacing={3}>
        {goals.map((goal) => (
          <Grid item xs={12} md={6} key={goal.id}>
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      {goal.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      gutterBottom
                    >
                      {goal.description}
                    </Typography>
                  </Box>
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(goal)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteGoal(goal.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    Progress: {goal.progress}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={goal.progress}
                    sx={{ mb: 1 }}
                  />
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mt: 2,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      backgroundColor: 'primary.main',
                      color: 'white',
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                    }}
                  >
                    {goal.category}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Due: {new Date(goal.targetDate).toLocaleDateString()}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>
            {selectedGoal ? 'Edit Goal' : 'Create New Goal'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="Title"
                name="title"
                value={formik.values.title}
                onChange={formik.handleChange}
                error={formik.touched.title && Boolean(formik.errors.title)}
                helperText={formik.touched.title && formik.errors.title}
              />
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                name="description"
                value={formik.values.description}
                onChange={formik.handleChange}
                error={
                  formik.touched.description && Boolean(formik.errors.description)
                }
                helperText={
                  formik.touched.description && formik.errors.description
                }
              />
              <TextField
                fullWidth
                select
                label="Category"
                name="category"
                value={formik.values.category}
                onChange={formik.handleChange}
                error={formik.touched.category && Boolean(formik.errors.category)}
                helperText={formik.touched.category && formik.errors.category}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                type="date"
                label="Target Date"
                name="targetDate"
                value={formik.values.targetDate}
                onChange={formik.handleChange}
                error={
                  formik.touched.targetDate && Boolean(formik.errors.targetDate)
                }
                helperText={formik.touched.targetDate && formik.errors.targetDate}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {selectedGoal ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Goals;
