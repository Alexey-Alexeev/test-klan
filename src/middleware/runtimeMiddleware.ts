import { Middleware } from '@reduxjs/toolkit';
import { RootState } from '../types';
import { createRuntime, RuntimeUtils } from '../lib/runtime';
import { setRuntimeValue } from '../features/state/stateSlice';
import { logEvent } from '../features/events/eventsSlice';

// Runtime instance
let runtime = createRuntime({
  maxEventDepth: 10,
  enableLogging: true,
});

// Track element click events to trigger associated actions
const elementClickMap = new Map<string, string[]>(); // elementId -> actionIds

export const runtimeMiddleware: Middleware<{}, RootState> = (store) => (next) => (action) => {
  const result = next(action);
  const state = store.getState();

  // Handle actions that should trigger runtime execution
  switch (action.type) {
    case 'canvas/updateWidget': {
      // When a widget is updated, check if it has actions that should be executed
      const { id, updates } = action.payload;
      
      if (updates.actions) {
        // Register widget actions for potential execution
        registerWidgetActions(id, updates.actions);
      }
      break;
    }

    case 'state/setRuntimeValue': {
      // State was updated, check if any events should be triggered
      const { scope, path } = action.payload;
      checkForTriggeredEvents(store, scope, path);
      break;
    }

    case 'events/addScreenEvent':
    case 'events/updateScreenEvent': {
      // Event was added or updated, register it for potential execution
      const event = action.type === 'events/addScreenEvent' 
        ? action.payload 
        : state.events.screenEvents[action.payload.id];
      
      if (event) {
        registerEvent(event);
      }
      break;
    }

    case 'runtime/executeWidgetAction': {
      // Custom action to execute widget actions
      const { widgetId, trigger, eventData } = action.payload;
      executeWidgetActions(store, widgetId, trigger, eventData);
      break;
    }

    case 'runtime/executeEvent': {
      // Custom action to execute a specific event
      const { eventId, context } = action.payload;
      executeEvent(store, eventId, context);
      break;
    }
  }

  return result;
};

function registerWidgetActions(widgetId: string, actions: any[]) {
  // Register widget actions for future execution
  // This would be called when widget actions are updated
  console.log(`Registered ${actions.length} actions for widget ${widgetId}`);
}

function registerEvent(event: any) {
  // Register event for potential execution based on triggers
  console.log(`Registered event ${event.id} with trigger ${event.trigger.on}`);
}

function checkForTriggeredEvents(store: any, scope: string, path: string) {
  const state = store.getState();
  const events = Object.values(state.events.screenEvents);
  
  // Check if any events should be triggered by this state change
  events.forEach((event: any) => {
    if (event.trigger.on === 'on_change' && event.enabled !== false) {
      // Check if this state change should trigger the event
      // This is a simplified check - in practice, you'd want more sophisticated triggering logic
      executeEventInternal(store, event);
    }
  });
}

async function executeWidgetActions(store: any, widgetId: string, trigger: string, eventData?: any) {
  const state = store.getState();
  const widget = state.canvas.widgets.find((w: any) => w.id === widgetId);
  
  if (!widget || !widget.actions) {
    return;
  }

  // Find actions that match the trigger
  const matchingActions = widget.actions.filter((action: any) => {
    // In a real implementation, you'd have better action filtering logic
    return true; // For now, execute all actions
  });

  if (matchingActions.length === 0) {
    return;
  }

  // Create execution context
  const context = RuntimeUtils.createContext(
    state.state.runtime,
    {}, // widget params would go here
    {} // widget local state would go here
  );

  // Execute actions
  for (const action of matchingActions) {
    try {
      const result = await runtime.executeAction(action, context, state.state.runtime);
      
      if (result.success) {
        // Apply state changes
        if (result.stateChanges) {
          Object.entries(result.stateChanges).forEach(([path, value]) => {
            const [scope, ...pathParts] = path.split('.');
            store.dispatch(setRuntimeValue({
              scope: scope as any,
              path: pathParts.join('.'),
              value,
            }));
          });
        }
        
        // Log successful execution
        store.dispatch(logEvent({
          eventId: `widget_action_${action.id}`,
          trigger: trigger,
          result: 'success',
        }));
      } else {
        // Log failed execution
        store.dispatch(logEvent({
          eventId: `widget_action_${action.id}`,
          trigger: trigger,
          result: 'error',
          error: result.error,
        }));
      }
    } catch (error) {
      console.error('Error executing widget action:', error);
      store.dispatch(logEvent({
        eventId: `widget_action_${action.id}`,
        trigger: trigger,
        result: 'error',
        error: String(error),
      }));
    }
  }
}

async function executeEvent(store: any, eventId: string, context?: any) {
  const state = store.getState();
  const event = state.events.screenEvents[eventId];
  
  if (!event) {
    console.warn(`Event ${eventId} not found`);
    return;
  }

  await executeEventInternal(store, event, context);
}

async function executeEventInternal(store: any, event: any, customContext?: any) {
  const state = store.getState();
  
  // Create execution context
  const context = customContext || RuntimeUtils.createContext(
    state.state.runtime,
    {}, // widget params
    {} // widget local state
  );

  try {
    const result = await runtime.executeEvent(event, context, state.state.runtime);
    
    if (result.success) {
      // Apply state changes
      if (result.stateChanges) {
        Object.entries(result.stateChanges).forEach(([path, value]) => {
          const [scope, ...pathParts] = path.split('.');
          store.dispatch(setRuntimeValue({
            scope: scope as any,
            path: pathParts.join('.'),
            value,
          }));
        });
      }
      
      // Log successful execution
      store.dispatch(logEvent({
        eventId: event.id,
        trigger: event.trigger.on,
        result: 'success',
      }));
    } else {
      // Log failed execution
      store.dispatch(logEvent({
        eventId: event.id,
        trigger: event.trigger.on,
        result: 'error',
        error: result.error,
      }));
    }
  } catch (error) {
    console.error('Error executing event:', error);
    store.dispatch(logEvent({
      eventId: event.id,
      trigger: event.trigger.on,
      result: 'error',
      error: String(error),
    }));
  }
}

// Action creators for runtime execution
export const runtimeActions = {
  executeWidgetAction: (widgetId: string, trigger: string, eventData?: any) => ({
    type: 'runtime/executeWidgetAction' as const,
    payload: { widgetId, trigger, eventData },
  }),
  
  executeEvent: (eventId: string, context?: any) => ({
    type: 'runtime/executeEvent' as const,
    payload: { eventId, context },
  }),
};

// Export runtime instance for direct access if needed
export { runtime };
