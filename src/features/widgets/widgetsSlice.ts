import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BDUIWidgetDefinition } from '../../types';

export interface WidgetsState {
  registry: Record<string, BDUIWidgetDefinition>;
  loading: boolean;
  error: string | null;
}

const initialState: WidgetsState = {
  registry: {},
  loading: false,
  error: null,
};

const widgetsSlice = createSlice({
  name: 'widgets',
  initialState,
  reducers: {
    addWidget: (state, action: PayloadAction<BDUIWidgetDefinition>) => {
      const widget = action.payload;
      state.registry[widget.widgetId] = widget;
    },
    
    updateWidget: (state, action: PayloadAction<{ id: string; updates: Partial<BDUIWidgetDefinition> }>) => {
      const { id, updates } = action.payload;
      if (state.registry[id]) {
        state.registry[id] = { ...state.registry[id], ...updates };
      }
    },
    
    deleteWidget: (state, action: PayloadAction<string>) => {
      delete state.registry[action.payload];
    },
    
    loadWidgets: (state, action: PayloadAction<Record<string, BDUIWidgetDefinition>>) => {
      state.registry = action.payload;
    },
    
    clearWidgets: (state) => {
      state.registry = {};
    },
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  addWidget,
  updateWidget,
  deleteWidget,
  loadWidgets,
  clearWidgets,
  setLoading,
  setError,
} = widgetsSlice.actions;

export default widgetsSlice.reducer;
