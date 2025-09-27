import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IWidget } from '../../types';

export interface IUserWidget {
  id: string;
  name: string;
  description?: string;
  widgets: IWidget[];
  canvasSize: { width: number; height: number };
  selectedPreset: string;
  createdAt: string;
  updatedAt: string;
}

interface UserWidgetsState {
  widgets: IUserWidget[];
  loading: boolean;
  error: string | null;
}

const initialState: UserWidgetsState = {
  widgets: [],
  loading: false,
  error: null,
};

const userWidgetsSlice = createSlice({
  name: 'userWidgets',
  initialState,
  reducers: {
    loadUserWidgets: (state) => {
      try {
        const stored = localStorage.getItem('userWidgets');
        if (stored) {
          state.widgets = JSON.parse(stored);
        }
      } catch (error) {
        state.error = 'Ошибка при загрузке пользовательских виджетов';
      }
    },

    saveUserWidget: (state, action: PayloadAction<Omit<IUserWidget, 'id' | 'createdAt' | 'updatedAt'>>) => {
      const newWidget: IUserWidget = {
        ...action.payload,
        id: `userWidget_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      state.widgets.push(newWidget);
      
      // Сохраняем в localStorage
      try {
        localStorage.setItem('userWidgets', JSON.stringify(state.widgets));
      } catch (error) {
        state.error = 'Ошибка при сохранении виджета';
      }
    },

    updateUserWidget: (state, action: PayloadAction<{ id: string; updates: Partial<Omit<IUserWidget, 'id' | 'createdAt'>> }>) => {
      const { id, updates } = action.payload;
      const widgetIndex = state.widgets.findIndex(w => w.id === id);
      
      if (widgetIndex !== -1) {
        state.widgets[widgetIndex] = {
          ...state.widgets[widgetIndex],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        
        // Сохраняем в localStorage
        try {
          localStorage.setItem('userWidgets', JSON.stringify(state.widgets));
        } catch (error) {
          state.error = 'Ошибка при обновлении виджета';
        }
      }
    },

    deleteUserWidget: (state, action: PayloadAction<string>) => {
      state.widgets = state.widgets.filter(w => w.id !== action.payload);
      
      // Сохраняем в localStorage
      try {
        localStorage.setItem('userWidgets', JSON.stringify(state.widgets));
      } catch (error) {
        state.error = 'Ошибка при удалении виджета';
      }
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const {
  loadUserWidgets,
  saveUserWidget,
  updateUserWidget,
  deleteUserWidget,
  setError,
  setLoading,
} = userWidgetsSlice.actions;

export default userWidgetsSlice.reducer;
