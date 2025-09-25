import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { StateVariable, RuntimeState } from '../../types';

export interface StateManagementState {
  // Screen-level state definitions
  screenState: Record<string, StateVariable>;
  // App-level state definitions
  appState: Record<string, StateVariable>;
  // Runtime values
  runtime: RuntimeState;
  // Widget instances local state
  widgetInstances: Record<string, Record<string, any>>;
}

const initialState: StateManagementState = {
  screenState: {},
  appState: {},
  runtime: {
    app: {},
    screen: {},
    widgets: {},
  },
  widgetInstances: {},
};

const stateSlice = createSlice({
  name: 'state',
  initialState,
  reducers: {
    // State definitions management
    addStateVariable: (state, action: PayloadAction<{ scope: 'screen' | 'app'; variable: StateVariable }>) => {
      const { scope, variable } = action.payload;
      const targetState = scope === 'screen' ? state.screenState : state.appState;
      targetState[variable.key] = variable;
      
      // Initialize runtime value
      const runtimeTarget = scope === 'screen' ? state.runtime.screen : state.runtime.app;
      runtimeTarget[variable.key] = variable.value;
    },
    
    updateStateVariable: (state, action: PayloadAction<{ 
      scope: 'screen' | 'app'; 
      key: string; 
      updates: Partial<StateVariable> 
    }>) => {
      const { scope, key, updates } = action.payload;
      const targetState = scope === 'screen' ? state.screenState : state.appState;
      
      if (targetState[key]) {
        targetState[key] = { ...targetState[key], ...updates };
        
        // Update runtime value if value changed
        if (updates.value !== undefined) {
          const runtimeTarget = scope === 'screen' ? state.runtime.screen : state.runtime.app;
          runtimeTarget[key] = updates.value;
        }
      }
    },
    
    deleteStateVariable: (state, action: PayloadAction<{ scope: 'screen' | 'app'; key: string }>) => {
      const { scope, key } = action.payload;
      const targetState = scope === 'screen' ? state.screenState : state.appState;
      
      delete targetState[key];
      
      // Remove from runtime
      const runtimeTarget = scope === 'screen' ? state.runtime.screen : state.runtime.app;
      delete runtimeTarget[key];
    },
    
    // Runtime state management
    setRuntimeValue: (state, action: PayloadAction<{
      scope: 'screen' | 'app' | 'widget';
      path: string;
      value: any;
      widgetInstanceId?: string;
    }>) => {
      const { scope, path, value, widgetInstanceId } = action.payload;
      
      if (scope === 'widget' && widgetInstanceId) {
        if (!state.runtime.widgets[widgetInstanceId]) {
          state.runtime.widgets[widgetInstanceId] = {};
        }
        state.runtime.widgets[widgetInstanceId][path] = value;
      } else {
        const target = scope === 'screen' ? state.runtime.screen : state.runtime.app;
        
        // Support nested path setting (e.g., "cart.items[0].count")
        const keys = path.split('.');
        let current = target;
        
        for (let i = 0; i < keys.length - 1; i++) {
          const key = keys[i];
          if (!(key in current)) {
            current[key] = {};
          }
          current = current[key];
        }
        
        current[keys[keys.length - 1]] = value;
      }
    },
    
    incrementValue: (state, action: PayloadAction<{
      scope: 'screen' | 'app' | 'widget';
      path: string;
      by: number;
      widgetInstanceId?: string;
    }>) => {
      const { scope, path, by, widgetInstanceId } = action.payload;
      
      if (scope === 'widget' && widgetInstanceId) {
        if (!state.runtime.widgets[widgetInstanceId]) {
          state.runtime.widgets[widgetInstanceId] = {};
        }
        const current = state.runtime.widgets[widgetInstanceId][path] || 0;
        state.runtime.widgets[widgetInstanceId][path] = current + by;
      } else {
        const target = scope === 'screen' ? state.runtime.screen : state.runtime.app;
        const current = target[path] || 0;
        target[path] = current + by;
      }
    },
    
    pushToArray: (state, action: PayloadAction<{
      scope: 'screen' | 'app' | 'widget';
      path: string;
      value: any;
      widgetInstanceId?: string;
    }>) => {
      const { scope, path, value, widgetInstanceId } = action.payload;
      
      if (scope === 'widget' && widgetInstanceId) {
        if (!state.runtime.widgets[widgetInstanceId]) {
          state.runtime.widgets[widgetInstanceId] = {};
        }
        if (!Array.isArray(state.runtime.widgets[widgetInstanceId][path])) {
          state.runtime.widgets[widgetInstanceId][path] = [];
        }
        state.runtime.widgets[widgetInstanceId][path].push(value);
      } else {
        const target = scope === 'screen' ? state.runtime.screen : state.runtime.app;
        if (!Array.isArray(target[path])) {
          target[path] = [];
        }
        target[path].push(value);
      }
    },
    
    // Widget instance state management
    initializeWidgetInstance: (state, action: PayloadAction<{
      instanceId: string;
      initialState: Record<string, any>;
    }>) => {
      const { instanceId, initialState: widgetState } = action.payload;
      state.widgetInstances[instanceId] = widgetState;
      state.runtime.widgets[instanceId] = { ...widgetState };
    },
    
    updateWidgetInstanceState: (state, action: PayloadAction<{
      instanceId: string;
      key: string;
      value: any;
    }>) => {
      const { instanceId, key, value } = action.payload;
      
      if (!state.widgetInstances[instanceId]) {
        state.widgetInstances[instanceId] = {};
      }
      
      state.widgetInstances[instanceId][key] = value;
      
      if (!state.runtime.widgets[instanceId]) {
        state.runtime.widgets[instanceId] = {};
      }
      
      state.runtime.widgets[instanceId][key] = value;
    },
    
    removeWidgetInstance: (state, action: PayloadAction<string>) => {
      const instanceId = action.payload;
      delete state.widgetInstances[instanceId];
      delete state.runtime.widgets[instanceId];
    },
    
    // Bulk operations
    loadScreenState: (state, action: PayloadAction<Record<string, StateVariable>>) => {
      state.screenState = action.payload;
      
      // Initialize runtime values
      state.runtime.screen = {};
      Object.values(action.payload).forEach(variable => {
        state.runtime.screen[variable.key] = variable.value;
      });
    },
    
    loadAppState: (state, action: PayloadAction<Record<string, StateVariable>>) => {
      state.appState = action.payload;
      
      // Initialize runtime values
      state.runtime.app = {};
      Object.values(action.payload).forEach(variable => {
        state.runtime.app[variable.key] = variable.value;
      });
    },
    
    clearState: (state, action: PayloadAction<'screen' | 'app' | 'all'>) => {
      const scope = action.payload;
      
      if (scope === 'screen' || scope === 'all') {
        state.screenState = {};
        state.runtime.screen = {};
      }
      
      if (scope === 'app' || scope === 'all') {
        state.appState = {};
        state.runtime.app = {};
      }
      
      if (scope === 'all') {
        state.widgetInstances = {};
        state.runtime.widgets = {};
      }
    },
    
    // Snapshot and restore for undo/redo
    saveStateSnapshot: (state, action: PayloadAction<{ 
      snapshot: RuntimeState;
      widgetInstances: Record<string, Record<string, any>>;
    }>) => {
      const { snapshot, widgetInstances } = action.payload;
      state.runtime = snapshot;
      state.widgetInstances = widgetInstances;
    },
  },
});

export const {
  addStateVariable,
  updateStateVariable,
  deleteStateVariable,
  setRuntimeValue,
  incrementValue,
  pushToArray,
  initializeWidgetInstance,
  updateWidgetInstanceState,
  removeWidgetInstance,
  loadScreenState,
  loadAppState,
  clearState,
  saveStateSnapshot,
} = stateSlice.actions;

export default stateSlice.reducer;
