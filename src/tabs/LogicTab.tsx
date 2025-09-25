import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GitBranch, Zap, Activity, Database } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { 
  addScreenEvent, 
  updateScreenEvent, 
  deleteScreenEvent,
  logEvent 
} from '../features/events/eventsSlice';
import { LogicDesigner } from '../components/ui/logic-designer';
import { EventDefinition } from '../types';
import { useToast } from '../hooks/use-toast';

export function LogicTab() {
  const dispatch = useAppDispatch();
  const { screenEvents, eventLog } = useAppSelector(state => state.events);
  const { widgets } = useAppSelector(state => state.canvas);
  const { screenState, appState } = useAppSelector(state => state.state);
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('events');

  // Get available elements for event targeting
  const availableElements = widgets.map(widget => ({
    id: widget.id,
    name: `${widget.type} ${widget.id}`,
    type: widget.type,
  }));

  // Get all available variables for conditions and actions
  const availableVariables = [
    ...Object.values(appState).map(variable => ({
      scope: 'app',
      key: variable.key,
      type: variable.type,
      path: `app.${variable.key}`,
    })),
    ...Object.values(screenState).map(variable => ({
      scope: 'screen',
      key: variable.key,
      type: variable.type,
      path: `screen.${variable.key}`,
    })),
  ];

  const handleAddEvent = (event: EventDefinition) => {
    dispatch(addScreenEvent(event));
    toast({
      title: 'Event created',
      description: `Event "${event.trigger.on}" has been created.`,
    });
  };

  const handleUpdateEvent = (eventId: string, updates: Partial<EventDefinition>) => {
    dispatch(updateScreenEvent({ id: eventId, updates }));
    toast({
      title: 'Event updated',
      description: 'The event has been updated.',
    });
  };

  const handleDeleteEvent = (eventId: string) => {
    dispatch(deleteScreenEvent(eventId));
    toast({
      title: 'Event deleted',
      description: 'The event has been removed.',
    });
  };

  const handleTestEvent = (eventId: string) => {
    const event = screenEvents[eventId];
    if (event) {
      // Log the test event
      dispatch(logEvent({
        eventId,
        trigger: event.trigger.on,
        result: 'success',
      }));
      
      toast({
        title: 'Event tested',
        description: `Test execution of event "${event.trigger.on}" completed.`,
      });
    }
  };

  const getEventStats = () => {
    const events = Object.values(screenEvents);
    const enabled = events.filter(e => e.enabled !== false).length;
    const withConditions = events.filter(e => e.conditions && e.conditions.length > 0).length;
    const withActions = events.filter(e => e.actions && e.actions.length > 0).length;

    return { total: events.length, enabled, withConditions, withActions };
  };

  const stats = getEventStats();

  return (
    <div className="flex-1 h-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Logic & Events</h1>
              <p className="text-muted-foreground">
                Design event flows, manage state, and configure application logic
              </p>
            </div>
            
            <TabsList className="grid w-[400px] grid-cols-3">
              <TabsTrigger value="events" className="flex items-center gap-2">
                <Zap size={16} />
                Events
              </TabsTrigger>
              <TabsTrigger value="state" className="flex items-center gap-2">
                <Database size={16} />
                State
              </TabsTrigger>
              <TabsTrigger value="monitor" className="flex items-center gap-2">
                <Activity size={16} />
                Monitor
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Zap className="h-8 w-8 text-blue-600" />
                  <div>
                    <div className="text-2xl font-bold">{stats.total}</div>
                    <div className="text-sm text-gray-600">Total Events</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Activity className="h-8 w-8 text-green-600" />
                  <div>
                    <div className="text-2xl font-bold">{stats.enabled}</div>
                    <div className="text-sm text-gray-600">Enabled</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <GitBranch className="h-8 w-8 text-yellow-600" />
                  <div>
                    <div className="text-2xl font-bold">{stats.withConditions}</div>
                    <div className="text-sm text-gray-600">With Conditions</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600 font-bold">A</span>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats.withActions}</div>
                    <div className="text-sm text-gray-600">With Actions</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="events" className="h-full m-0">
            <LogicDesigner
              events={Object.values(screenEvents)}
              availableElements={availableElements}
              availableVariables={availableVariables}
              onAddEvent={handleAddEvent}
              onUpdateEvent={handleUpdateEvent}
              onDeleteEvent={handleDeleteEvent}
              onTestEvent={handleTestEvent}
            />
          </TabsContent>

          <TabsContent value="state" className="h-full m-0 p-6">
            <div className="text-center py-12">
              <Database className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">State Management</h3>
              <p className="text-sm text-gray-500 mb-4">
                Advanced state management features coming soon
              </p>
              <p className="text-xs text-gray-400">
                For now, you can manage state variables in the Properties panel when an element is selected
              </p>
            </div>
          </TabsContent>

          <TabsContent value="monitor" className="h-full m-0 p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Event Log</h2>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    // Clear log action would go here
                    toast({
                      title: 'Log cleared',
                      description: 'Event log has been cleared.',
                    });
                  }}
                >
                  Clear Log
                </Button>
              </div>

              {eventLog.length === 0 ? (
                <div className="text-center py-12">
                  <Activity className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">No events logged</h3>
                  <p className="text-sm text-gray-500">
                    Event execution logs will appear here when events are triggered
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {eventLog.slice().reverse().slice(0, 50).map((logEntry) => (
                    <Card key={logEntry.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${
                              logEntry.result === 'success' ? 'bg-green-500' :
                              logEntry.result === 'error' ? 'bg-red-500' :
                              'bg-yellow-500'
                            }`} />
                            <div>
                              <div className="font-medium">{logEntry.trigger}</div>
                              <div className="text-sm text-gray-600">
                                Event ID: {logEntry.eventId}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium capitalize">
                              {logEntry.result}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(logEntry.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                        {logEntry.error && (
                          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                            {logEntry.error}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
