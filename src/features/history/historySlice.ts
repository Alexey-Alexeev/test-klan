import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { HistoryState, CanvasState } from '../../types';

const initialState: HistoryState = {
  past: [],
  present: {
    widgets: [],
    selectedWidgetId: null,
    selectedWidgetIds: [],
    canvasSize: { width: 1200, height: 800 },
    gridSnap: true,
    snapSize: 8,
    zoom: 1,
    panOffset: { x: 0, y: 0 },
    showRulers: true,
    gridSize: 20,
    showGrid: true,
    isMultiSelecting: false,
    selectionBox: null,
  },
  future: [],
  maxHistorySize: 50,
};

const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    pushToHistory: (state, action: PayloadAction<CanvasState>) => {
      // Add current state to past
      state.past.push(state.present);
      
      // Limit history size
      if (state.past.length > state.maxHistorySize) {
        state.past.shift();
      }
      
      // Update present
      state.present = action.payload;
      
      // Clear future when new action is performed
      state.future = [];
    },

    undo: (state) => {
      if (state.past.length > 0) {
        // Move current state to future
        state.future.unshift(state.present);
        
        // Get previous state from past
        const previousState = state.past.pop()!;
        state.present = previousState;
      }
    },

    redo: (state) => {
      if (state.future.length > 0) {
        // Move current state to past
        state.past.push(state.present);
        
        // Get next state from future
        const nextState = state.future.shift()!;
        state.present = nextState;
      }
    },

    clearHistory: (state) => {
      state.past = [];
      state.future = [];
    },

    setMaxHistorySize: (state, action: PayloadAction<number>) => {
      state.maxHistorySize = action.payload;
      
      // Trim past if it exceeds new max size
      if (state.past.length > state.maxHistorySize) {
        state.past = state.past.slice(-state.maxHistorySize);
      }
    },
  },
});

export const {
  pushToHistory,
  undo,
  redo,
  clearHistory,
  setMaxHistorySize,
} = historySlice.actions;

export default historySlice.reducer;
