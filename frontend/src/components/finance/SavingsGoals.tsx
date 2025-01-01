import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  InputAdornment,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AttachMoney,
  Flag,
  CalendarToday,
  Info,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { format } from 'date-fns';

interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  description: string;
}

interface Props {
  goals: SavingsGoal[];
  onAddGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
  onEditGoal: (goal: SavingsGoal) => void;
  onDeleteGoal: (id: string) => void;
}

const validationSchema = yup.object({
  name: yup.string().required('Name is required'),
  targetAmount: yup
    .number()
    .required('Target amount is required')
    .positive('Amount must be positive'),
  currentAmount: yup
    .number()
    .required('Current amount is required')
    .min(0, 'Amount cannot be negative'),
  targetDate: yup.string().required('Target date is required'),
  description: yup.string(),
});

const SavingsGoals: React.FC<Props> = ({
  goals,
  onAddGoal,
  onEditGoal,
  onDeleteGoal,
}) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);

  const formik = useFormik({
    initialValues: {
      name: '',
      targetAmount: '',
      currentAmount: '',
      targetDate: format(new Date(), 'yyyy-MM-dd'),
      description: '',
    },
    validationSchema,
    onSubmit: (values) => {
      if (editingGoal) {
        onEditGoal({
          ...values,
          id: editingGoal.id,
          targetAmount: Number(values.targetAmount),
          currentAmount: Number(values.currentAmount),
        });
      } else {
        onAddGoal({
          ...values,
          targetAmount: Number(values.targetAmount),
          currentAmount: Number(values.currentAmount),
        });
      }
      handleCloseDialog();
    },
  });

  const handleOpenDialog = (goal?: SavingsGoal) => {
    if (goal) {
      setEditingGoal(goal);
      formik.setValues({
        name: goal.name,
        targetAmount: String(goal.targetAmount),
        currentAmount: String(goal.currentAmount),
        targetDate: format(new Date(goal.targetDate), 'yyyy-MM-dd'),
        description: goal.description,
      });
    } else {
      setEditingGoal(null);
      formik.resetForm();
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingGoal(null);
    formik.resetForm();
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
          <Typography variant="h6">Savings Goals</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Goal
          </Button>
        </Box>

        <Grid container spacing={2}>
          {goals.map((goal) => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100;
            const remainingAmount = goal.targetAmount - goal.currentAmount;
            const daysUntilTarget = Math.ceil(
              (new Date(goal.targetDate).getTime() - new Date().getTime()) /
                (1000 * 60 * 60 * 24)
            );

            return (
              <Grid item xs={12} md={6} key={goal.id}>
                <Card variant="outlined">
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
                          {goal.name}
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
                          onClick={() => onDeleteGoal(goal.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>

                    <Box sx={{ mt: 2 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          mb: 1,
                        }}
                      >
                        <Typography variant="body2">Progress</Typography>
                        <Typography variant="body2">
                          ${goal.currentAmount.toLocaleString()} of $
                          {goal.targetAmount.toLocaleString()}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(progress, 100)}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          mb: 2,
                        }}
                      />

                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}
                          >
                            <Flag fontSize="small" color="error" />
                            <Typography variant="body2" color="textSecondary">
                              ${remainingAmount.toLocaleString()} to go
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}
                          >
                            <CalendarToday fontSize="small" color="primary" />
                            <Typography variant="body2" color="textSecondary">
                              {daysUntilTarget} days left
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </CardContent>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>
            {editingGoal ? 'Edit Savings Goal' : 'Add Savings Goal'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
              <TextField
                fullWidth
                label="Goal Name"
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />

              <TextField
                fullWidth
                label="Target Amount"
                name="targetAmount"
                type="number"
                value={formik.values.targetAmount}
                onChange={formik.handleChange}
                error={
                  formik.touched.targetAmount &&
                  Boolean(formik.errors.targetAmount)
                }
                helperText={
                  formik.touched.targetAmount && formik.errors.targetAmount
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AttachMoney />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Current Amount"
                name="currentAmount"
                type="number"
                value={formik.values.currentAmount}
                onChange={formik.handleChange}
                error={
                  formik.touched.currentAmount &&
                  Boolean(formik.errors.currentAmount)
                }
                helperText={
                  formik.touched.currentAmount && formik.errors.currentAmount
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AttachMoney />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Target Date"
                type="date"
                name="targetDate"
                value={formik.values.targetDate}
                onChange={formik.handleChange}
                error={
                  formik.touched.targetDate && Boolean(formik.errors.targetDate)
                }
                helperText={formik.touched.targetDate && formik.errors.targetDate}
              />

              <TextField
                fullWidth
                label="Description (Optional)"
                name="description"
                multiline
                rows={3}
                value={formik.values.description}
                onChange={formik.handleChange}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button
              variant="contained"
              type="submit"
              disabled={!formik.isValid || !formik.dirty}
            >
              {editingGoal ? 'Save' : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Card>
  );
};

export default SavingsGoals;
