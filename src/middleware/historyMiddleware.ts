import { Middleware } from '@reduxjs/toolkit';
import { pushToHistory } from '../features/history/historySlice';
import { RootState } from '../store';

// Actions that should be saved to history
const historyActions = [
  'canvas/addWidget',
  'canvas/updateWidget',
  'canvas/updateWidgetPosition',
  'canvas/updateWidgetSize',
  'canvas/deleteWidget',
  'canvas/duplicateWidget',
  'canvas/clearCanvas',
  'canvas/loadWidgets',
  'canvas/setCanvasSize',
  'canvas/bringToFront',
  'canvas/sendToBack',
  'canvas/groupWidgets',
];

export const historyMiddleware: Middleware<{}, RootState> = (store) => (next) => (action) => {
  const result = next(action);
  
  // Check if this action should be saved to history
  if (historyActions.includes(action.type)) {
    const currentState = store.getState();
    
    // Only save to history if canvas state has changed
    if (action.type.startsWith('canvas/')) {
      store.dispatch(pushToHistory(currentState.canvas));
    }
  }
  
  return result;
};
