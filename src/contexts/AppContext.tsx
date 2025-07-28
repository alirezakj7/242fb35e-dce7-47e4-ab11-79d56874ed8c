import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { JalaliCalendar } from '@/utils/jalali';

// Types
export interface Goal {
  id: string;
  title: string;
  description?: string;
  type: 'annual' | 'quarterly' | 'financial';
  targetAmount?: number;
  currentAmount?: number;
  deadline: Date;
  category: WheelOfLifeCategory;
  completed: boolean;
  createdAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: WheelOfLifeCategory;
  tags: string[];
  endDate?: Date;
  scheduledDate?: Date;
  status: 'not_started' | 'in_progress' | 'postponed' | 'done';
  financialType?: 'spend' | 'earn_once' | 'earn_routine';
  routineJobId?: string;
  goalId?: string;
  timeSpent?: number;
  createdAt: Date;
  completedAt?: Date;
}

export interface RoutineJob {
  id: string;
  name: string;
  earnings: number;
  schedule: {
    frequency: 'daily' | 'weekly' | 'monthly';
    daysOfWeek?: number[];
    timeSlots?: { start: string; end: string }[];
  };
  category: WheelOfLifeCategory;
  active: boolean;
  createdAt: Date;
}

export interface Habit {
  id: string;
  name: string;
  description?: string;
  category: WheelOfLifeCategory;
  schedule: {
    daysOfWeek: number[];
    reminderTime?: string;
  };
  streak: number;
  completions: { date: string; completed: boolean }[];
  createdAt: Date;
}

export interface FinancialRecord {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: WheelOfLifeCategory;
  taskId?: string;
  routineJobId?: string;
  date: Date;
}

export type WheelOfLifeCategory = 
  | 'career' | 'finance' | 'health' | 'family' 
  | 'personal' | 'spiritual' | 'social' | 'education';

interface AppState {
  goals: Goal[];
  tasks: Task[];
  routineJobs: RoutineJob[];
  habits: Habit[];
  financialRecords: FinancialRecord[];
  currentDate: Date;
  selectedDate: Date;
}

type AppAction = 
  | { type: 'ADD_GOAL'; payload: Goal }
  | { type: 'UPDATE_GOAL'; payload: Goal }
  | { type: 'DELETE_GOAL'; payload: string }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'ADD_ROUTINE_JOB'; payload: RoutineJob }
  | { type: 'UPDATE_ROUTINE_JOB'; payload: RoutineJob }
  | { type: 'DELETE_ROUTINE_JOB'; payload: string }
  | { type: 'ADD_HABIT'; payload: Habit }
  | { type: 'UPDATE_HABIT'; payload: Habit }
  | { type: 'DELETE_HABIT'; payload: string }
  | { type: 'ADD_FINANCIAL_RECORD'; payload: FinancialRecord }
  | { type: 'SET_SELECTED_DATE'; payload: Date };

const initialState: AppState = {
  goals: [],
  tasks: [],
  routineJobs: [],
  habits: [],
  financialRecords: [],
  currentDate: new Date(),
  selectedDate: new Date(),
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'ADD_GOAL':
      return { ...state, goals: [...state.goals, action.payload] };
    case 'UPDATE_GOAL':
      return {
        ...state,
        goals: state.goals.map(g => g.id === action.payload.id ? action.payload : g)
      };
    case 'DELETE_GOAL':
      return { ...state, goals: state.goals.filter(g => g.id !== action.payload) };
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(t => t.id === action.payload.id ? action.payload : t)
      };
    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter(t => t.id !== action.payload) };
    case 'ADD_ROUTINE_JOB':
      return { ...state, routineJobs: [...state.routineJobs, action.payload] };
    case 'UPDATE_ROUTINE_JOB':
      return {
        ...state,
        routineJobs: state.routineJobs.map(j => j.id === action.payload.id ? action.payload : j)
      };
    case 'DELETE_ROUTINE_JOB':
      return { ...state, routineJobs: state.routineJobs.filter(j => j.id !== action.payload) };
    case 'ADD_HABIT':
      return { ...state, habits: [...state.habits, action.payload] };
    case 'UPDATE_HABIT':
      return {
        ...state,
        habits: state.habits.map(h => h.id === action.payload.id ? action.payload : h)
      };
    case 'DELETE_HABIT':
      return { ...state, habits: state.habits.filter(h => h.id !== action.payload) };
    case 'ADD_FINANCIAL_RECORD':
      return { ...state, financialRecords: [...state.financialRecords, action.payload] };
    case 'SET_SELECTED_DATE':
      return { ...state, selectedDate: action.payload };
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  wheelOfLifeCategories: { key: WheelOfLifeCategory; label: string; icon: string }[];
} | null>(null);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const wheelOfLifeCategories = [
    { key: 'career' as WheelOfLifeCategory, label: 'شغل و کار', icon: '💼' },
    { key: 'finance' as WheelOfLifeCategory, label: 'مالی', icon: '💰' },
    { key: 'health' as WheelOfLifeCategory, label: 'سلامت', icon: '💪' },
    { key: 'family' as WheelOfLifeCategory, label: 'خانواده', icon: '👨‍👩‍👧‍👦' },
    { key: 'personal' as WheelOfLifeCategory, label: 'شخصی', icon: '🌱' },
    { key: 'spiritual' as WheelOfLifeCategory, label: 'معنوی', icon: '🕯️' },
    { key: 'social' as WheelOfLifeCategory, label: 'اجتماعی', icon: '👥' },
    { key: 'education' as WheelOfLifeCategory, label: 'آموزش', icon: '📚' },
  ];

  return (
    <AppContext.Provider value={{ state, dispatch, wheelOfLifeCategories }}>
      {children}
    </AppContext.Provider>
  );
};