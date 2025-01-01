import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  dueDate: string;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  category: string;
  startDate: string;
  targetDate: string;
  progress: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold';
  priority: 'low' | 'medium' | 'high';
  milestones: Milestone[];
  notes: string[];
}

interface GoalsState {
  goals: Goal[];
  activeGoal: Goal | null;
  loading: boolean;
  error: string | null;
  filters: {
    category: string | null;
    status: string | null;
    priority: string | null;
  };
}

const initialState: GoalsState = {
  goals: [],
  activeGoal: null,
  loading: false,
  error: null,
  filters: {
    category: null,
    status: null,
    priority: null,
  },
};

// Async thunks
export const fetchGoals = createAsyncThunk(
  'goals/fetchGoals',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/goals');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch goals');
      }
      return rejectWithValue('Failed to fetch goals');
    }
  }
);

export const createGoal = createAsyncThunk(
  'goals/createGoal',
  async (goal: Omit<Goal, 'id'>, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/goals', goal);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || 'Failed to create goal');
      }
      return rejectWithValue('Failed to create goal');
    }
  }
);

export const updateGoal = createAsyncThunk(
  'goals/updateGoal',
  async (goal: Goal, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/goals/${goal.id}`, goal);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || 'Failed to update goal');
      }
      return rejectWithValue('Failed to update goal');
    }
  }
);

export const deleteGoal = createAsyncThunk(
  'goals/deleteGoal',
  async (goalId: string, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/goals/${goalId}`);
      return goalId;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || 'Failed to delete goal');
      }
      return rejectWithValue('Failed to delete goal');
    }
  }
);

export const updateMilestone = createAsyncThunk(
  'goals/updateMilestone',
  async (
    {
      goalId,
      milestone,
    }: { goalId: string; milestone: Milestone },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.put(
        `/api/goals/${goalId}/milestones/${milestone.id}`,
        milestone
      );
      return { goalId, milestone: response.data };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || 'Failed to update milestone');
      }
      return rejectWithValue('Failed to update milestone');
    }
  }
);

const goalsSlice = createSlice({
  name: 'goals',
  initialState,
  reducers: {
    setActiveGoal(state, action: PayloadAction<Goal | null>) {
      state.activeGoal = action.payload;
    },
    updateFilters(
      state,
      action: PayloadAction<Partial<GoalsState['filters']>>
    ) {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters(state) {
      state.filters = initialState.filters;
    },
    addNote(
      state,
      action: PayloadAction<{ goalId: string; note: string }>
    ) {
      const goal = state.goals.find((g) => g.id === action.payload.goalId);
      if (goal) {
        goal.notes.push(action.payload.note);
      }
    },
    updateProgress(
      state,
      action: PayloadAction<{ goalId: string; progress: number }>
    ) {
      const goal = state.goals.find((g) => g.id === action.payload.goalId);
      if (goal) {
        goal.progress = action.payload.progress;
        if (goal.progress === 100) {
          goal.status = 'completed';
        } else if (goal.progress > 0) {
          goal.status = 'in_progress';
        }
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch Goals
    builder
      .addCase(fetchGoals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGoals.fulfilled, (state, action) => {
        state.loading = false;
        state.goals = action.payload;
      })
      .addCase(fetchGoals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create Goal
    builder
      .addCase(createGoal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createGoal.fulfilled, (state, action) => {
        state.loading = false;
        state.goals.push(action.payload);
      })
      .addCase(createGoal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update Goal
    builder
      .addCase(updateGoal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateGoal.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.goals.findIndex((g) => g.id === action.payload.id);
        if (index !== -1) {
          state.goals[index] = action.payload;
        }
      })
      .addCase(updateGoal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete Goal
    builder
      .addCase(deleteGoal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteGoal.fulfilled, (state, action) => {
        state.loading = false;
        state.goals = state.goals.filter((g) => g.id !== action.payload);
        if (state.activeGoal?.id === action.payload) {
          state.activeGoal = null;
        }
      })
      .addCase(deleteGoal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update Milestone
    builder
      .addCase(updateMilestone.fulfilled, (state, action) => {
        const goal = state.goals.find((g) => g.id === action.payload.goalId);
        if (goal) {
          const index = goal.milestones.findIndex(
            (m) => m.id === action.payload.milestone.id
          );
          if (index !== -1) {
            goal.milestones[index] = action.payload.milestone;
          }
        }
      });
  },
});

export const {
  setActiveGoal,
  updateFilters,
  clearFilters,
  addNote,
  updateProgress,
} = goalsSlice.actions;

export default goalsSlice.reducer;
