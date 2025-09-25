import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { EventDefinition, BDUIAction } from '../../types';

export interface EventsState {
  // Screen-level events
  screenEvents: Record<string, EventDefinition>;
  // Widget-level events (for widget definitions)
  widgetEvents: Record<string, Record<string, EventDefinition>>; // widgetId -> eventId -> event
  // Active event processing
  processing: boolean;
  eventQueue: Array<{
    id: string;
    event: EventDefinition;
    context: any;
    timestamp: number;
  }>;
  // Event log for debugging
  eventLog: Array<{
    id: string;
    eventId: string;
    trigger: string;
    timestamp: number;
    result: 'success' | 'error' | 'cancelled';
    error?: string;
  }>;
  maxEventDepth: number;
  currentDepth: number;
}

const initialState: EventsState = {
  screenEvents: {},
  widgetEvents: {},
  processing: false,
  eventQueue: [],
  eventLog: [],
  maxEventDepth: 10,
  currentDepth: 0,
};

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    // Event definition management
    addScreenEvent: (state, action: PayloadAction<EventDefinition>) => {
      const event = action.payload;
      state.screenEvents[event.id] = event;
    },
    
    updateScreenEvent: (state, action: PayloadAction<{ id: string; updates: Partial<EventDefinition> }>) => {
      const { id, updates } = action.payload;
      if (state.screenEvents[id]) {
        state.screenEvents[id] = { ...state.screenEvents[id], ...updates };
      }
    },
    
    deleteScreenEvent: (state, action: PayloadAction<string>) => {
      delete state.screenEvents[action.payload];
    },
    
    addWidgetEvent: (state, action: PayloadAction<{ widgetId: string; event: EventDefinition }>) => {
      const { widgetId, event } = action.payload;
      if (!state.widgetEvents[widgetId]) {
        state.widgetEvents[widgetId] = {};
      }
      state.widgetEvents[widgetId][event.id] = event;
    },
    
    updateWidgetEvent: (state, action: PayloadAction<{ 
      widgetId: string; 
      eventId: string; 
      updates: Partial<EventDefinition> 
    }>) => {
      const { widgetId, eventId, updates } = action.payload;
      if (state.widgetEvents[widgetId]?.[eventId]) {
        state.widgetEvents[widgetId][eventId] = { 
          ...state.widgetEvents[widgetId][eventId], 
          ...updates 
        };
      }
    },
    
    deleteWidgetEvent: (state, action: PayloadAction<{ widgetId: string; eventId: string }>) => {
      const { widgetId, eventId } = action.payload;
      if (state.widgetEvents[widgetId]) {
        delete state.widgetEvents[widgetId][eventId];
        
        // Clean up empty widget event collections
        if (Object.keys(state.widgetEvents[widgetId]).length === 0) {
          delete state.widgetEvents[widgetId];
        }
      }
    },
    
    // Event queue management
    enqueueEvent: (state, action: PayloadAction<{
      event: EventDefinition;
      context: any;
    }>) => {
      const { event, context } = action.payload;
      const queueItem = {
        id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        event,
        context,
        timestamp: Date.now(),
      };
      
      state.eventQueue.push(queueItem);
    },
    
    dequeueEvent: (state) => {
      state.eventQueue.shift();
    },
    
    clearEventQueue: (state) => {
      state.eventQueue = [];
    },
    
    // Event processing state
    setProcessing: (state, action: PayloadAction<boolean>) => {
      state.processing = action.payload;
    },
    
    incrementDepth: (state) => {
      state.currentDepth++;
    },
    
    decrementDepth: (state) => {
      state.currentDepth = Math.max(0, state.currentDepth - 1);
    },
    
    resetDepth: (state) => {
      state.currentDepth = 0;
    },
    
    setMaxEventDepth: (state, action: PayloadAction<number>) => {
      state.maxEventDepth = action.payload;
    },
    
    // Event logging
    logEvent: (state, action: PayloadAction<{
      eventId: string;
      trigger: string;
      result: 'success' | 'error' | 'cancelled';
      error?: string;
    }>) => {
      const { eventId, trigger, result, error } = action.payload;
      const logEntry = {
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        eventId,
        trigger,
        timestamp: Date.now(),
        result,
        error,
      };
      
      state.eventLog.push(logEntry);
      
      // Keep only last 100 log entries
      if (state.eventLog.length > 100) {
        state.eventLog = state.eventLog.slice(-100);
      }
    },
    
    clearEventLog: (state) => {
      state.eventLog = [];
    },
    
    // Bulk operations
    loadScreenEvents: (state, action: PayloadAction<Record<string, EventDefinition>>) => {
      state.screenEvents = action.payload;
    },
    
    loadWidgetEvents: (state, action: PayloadAction<Record<string, Record<string, EventDefinition>>>) => {
      state.widgetEvents = action.payload;
    },
    
    clearAllEvents: (state) => {
      state.screenEvents = {};
      state.widgetEvents = {};
      state.eventQueue = [];
      state.eventLog = [];
      state.currentDepth = 0;
    },
    
    // Action sequence management for events
    updateEventActions: (state, action: PayloadAction<{
      scope: 'screen' | 'widget';
      eventId: string;
      widgetId?: string;
      actions: BDUIAction[];
    }>) => {
      const { scope, eventId, widgetId, actions } = action.payload;
      
      if (scope === 'screen' && state.screenEvents[eventId]) {
        state.screenEvents[eventId].actions = actions;
      } else if (scope === 'widget' && widgetId && state.widgetEvents[widgetId]?.[eventId]) {
        state.widgetEvents[widgetId][eventId].actions = actions;
      }
    },
    
    addActionToEvent: (state, action: PayloadAction<{
      scope: 'screen' | 'widget';
      eventId: string;
      widgetId?: string;
      action: BDUIAction;
      index?: number;
    }>) => {
      const { scope, eventId, widgetId, action: newAction, index } = action.payload;
      
      let targetEvent: EventDefinition | undefined;
      
      if (scope === 'screen') {
        targetEvent = state.screenEvents[eventId];
      } else if (scope === 'widget' && widgetId) {
        targetEvent = state.widgetEvents[widgetId]?.[eventId];
      }
      
      if (targetEvent) {
        if (index !== undefined && index >= 0 && index <= targetEvent.actions.length) {
          targetEvent.actions.splice(index, 0, newAction);
        } else {
          targetEvent.actions.push(newAction);
        }
      }
    },
    
    removeActionFromEvent: (state, action: PayloadAction<{
      scope: 'screen' | 'widget';
      eventId: string;
      widgetId?: string;
      actionIndex: number;
    }>) => {
      const { scope, eventId, widgetId, actionIndex } = action.payload;
      
      let targetEvent: EventDefinition | undefined;
      
      if (scope === 'screen') {
        targetEvent = state.screenEvents[eventId];
      } else if (scope === 'widget' && widgetId) {
        targetEvent = state.widgetEvents[widgetId]?.[eventId];
      }
      
      if (targetEvent && actionIndex >= 0 && actionIndex < targetEvent.actions.length) {
        targetEvent.actions.splice(actionIndex, 1);
      }
    },
  },
});

export const {
  addScreenEvent,
  updateScreenEvent,
  deleteScreenEvent,
  addWidgetEvent,
  updateWidgetEvent,
  deleteWidgetEvent,
  enqueueEvent,
  dequeueEvent,
  clearEventQueue,
  setProcessing,
  incrementDepth,
  decrementDepth,
  resetDepth,
  setMaxEventDepth,
  logEvent,
  clearEventLog,
  loadScreenEvents,
  loadWidgetEvents,
  clearAllEvents,
  updateEventActions,
  addActionToEvent,
  removeActionFromEvent,
} = eventsSlice.actions;

export default eventsSlice.reducer;
