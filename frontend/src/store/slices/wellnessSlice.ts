import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

interface NutritionLog {
  id: string;
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  water: number;
  meals: {
    type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    foods: Array<{
      name: string;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    }>;
  }[];
}

interface ExerciseLog {
  id: string;
  date: string;
  type: string;
  duration: number;
  caloriesBurned: number;
  steps: number;
  distance?: number;
  heartRate?: {
    avg: number;
    max: number;
  };
}

interface SleepLog {
  id: string;
  date: string;
  duration: number;
  quality: number;
  bedtime: string;
  wakeTime: string;
  deepSleep?: number;
  remSleep?: number;
  interruptions?: number;
}

interface MoodLog {
  id: string;
  date: string;
  score: number;
  note: string;
  tags: string[];
  energy: number;
  stress: number;
  anxiety: number;
}

interface WellnessState {
  nutrition: {
    logs: NutritionLog[];
    goals: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      water: number;
    };
  };
  exercise: {
    logs: ExerciseLog[];
    goals: {
      weeklyWorkouts: number;
      dailySteps: number;
      activeMinutes: number;
    };
  };
  sleep: {
    logs: SleepLog[];
    goals: {
      duration: number;
      bedtime: string;
      wakeTime: string;
    };
  };
  mood: {
    logs: MoodLog[];
  };
  loading: boolean;
  error: string | null;
}

const initialState: WellnessState = {
  nutrition: {
    logs: [],
    goals: {
      calories: 2000,
      protein: 150,
      carbs: 250,
      fat: 70,
      water: 2000,
    },
  },
  exercise: {
    logs: [],
    goals: {
      weeklyWorkouts: 5,
      dailySteps: 10000,
      activeMinutes: 30,
    },
  },
  sleep: {
    logs: [],
    goals: {
      duration: 8,
      bedtime: '22:00',
      wakeTime: '06:00',
    },
  },
  mood: {
    logs: [],
  },
  loading: false,
  error: null,
};

// Async thunks
export const fetchWellnessData = createAsyncThunk(
  'wellness/fetchData',
  async (_, { rejectWithValue }) => {
    try {
      const [nutrition, exercise, sleep, mood] = await Promise.all([
        axios.get('/api/wellness/nutrition'),
        axios.get('/api/wellness/exercise'),
        axios.get('/api/wellness/sleep'),
        axios.get('/api/wellness/mood'),
      ]);

      return {
        nutrition: nutrition.data,
        exercise: exercise.data,
        sleep: sleep.data,
        mood: mood.data,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch wellness data');
      }
      return rejectWithValue('Failed to fetch wellness data');
    }
  }
);

export const logNutrition = createAsyncThunk(
  'wellness/logNutrition',
  async (log: Omit<NutritionLog, 'id'>, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/wellness/nutrition', log);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || 'Failed to log nutrition');
      }
      return rejectWithValue('Failed to log nutrition');
    }
  }
);

export const logExercise = createAsyncThunk(
  'wellness/logExercise',
  async (log: Omit<ExerciseLog, 'id'>, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/wellness/exercise', log);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || 'Failed to log exercise');
      }
      return rejectWithValue('Failed to log exercise');
    }
  }
);

export const logSleep = createAsyncThunk(
  'wellness/logSleep',
  async (log: Omit<SleepLog, 'id'>, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/wellness/sleep', log);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || 'Failed to log sleep');
      }
      return rejectWithValue('Failed to log sleep');
    }
  }
);

export const logMood = createAsyncThunk(
  'wellness/logMood',
  async (log: Omit<MoodLog, 'id'>, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/wellness/mood', log);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || 'Failed to log mood');
      }
      return rejectWithValue('Failed to log mood');
    }
  }
);

const wellnessSlice = createSlice({
  name: 'wellness',
  initialState,
  reducers: {
    updateNutritionGoals(
      state,
      action: PayloadAction<Partial<WellnessState['nutrition']['goals']>>
    ) {
      state.nutrition.goals = { ...state.nutrition.goals, ...action.payload };
    },
    updateExerciseGoals(
      state,
      action: PayloadAction<Partial<WellnessState['exercise']['goals']>>
    ) {
      state.exercise.goals = { ...state.exercise.goals, ...action.payload };
    },
    updateSleepGoals(
      state,
      action: PayloadAction<Partial<WellnessState['sleep']['goals']>>
    ) {
      state.sleep.goals = { ...state.sleep.goals, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    // Fetch Wellness Data
    builder
      .addCase(fetchWellnessData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWellnessData.fulfilled, (state, action) => {
        state.loading = false;
        state.nutrition.logs = action.payload.nutrition;
        state.exercise.logs = action.payload.exercise;
        state.sleep.logs = action.payload.sleep;
        state.mood.logs = action.payload.mood;
      })
      .addCase(fetchWellnessData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Log Nutrition
    builder
      .addCase(logNutrition.fulfilled, (state, action) => {
        state.nutrition.logs.push(action.payload);
      });

    // Log Exercise
    builder
      .addCase(logExercise.fulfilled, (state, action) => {
        state.exercise.logs.push(action.payload);
      });

    // Log Sleep
    builder
      .addCase(logSleep.fulfilled, (state, action) => {
        state.sleep.logs.push(action.payload);
      });

    // Log Mood
    builder
      .addCase(logMood.fulfilled, (state, action) => {
        state.mood.logs.push(action.payload);
      });
  },
});

export const {
  updateNutritionGoals,
  updateExerciseGoals,
  updateSleepGoals,
} = wellnessSlice.actions;

export default wellnessSlice.reducer;
