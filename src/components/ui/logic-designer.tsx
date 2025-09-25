import React, { useState } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Textarea } from './textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './dialog';
import { Plus, Trash2, Edit, Play, ArrowRight, Split, GitBranch, Zap } from 'lucide-react';
import { EventDefinition, BDUIAction, EventTrigger } from '../../types';

interface LogicDesignerProps {
  events: EventDefinition[];
  availableElements: Array<{ id: string; name: string; type: string }>;
  availableVariables: Array<{ scope: string; key: string; type: string; path: string }>;
  onAddEvent: (event: EventDefinition) => void;
  onUpdateEvent: (eventId: string, updates: Partial<EventDefinition>) => void;
  onDeleteEvent: (eventId: string) => void;
  onTestEvent?: (eventId: string) => void;
}

export function LogicDesigner({
  events,
  availableElements,
  availableVariables,
  onAddEvent,
  onUpdateEvent,
  onDeleteEvent,
  onTestEvent,
}: LogicDesignerProps) {
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventDefinition | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const triggerOptions: Array<{ value: EventTrigger; label: string; description: string }> = [
    { value: 'on_click', label: 'По клику', description: 'Когда элемент нажат' },
    { value: 'on_longpress', label: 'Долгое нажатие', description: 'Когда элемент нажат и удержан' },
    { value: 'on_change', label: 'При изменении', description: 'Когда значение ввода изменяется' },
    { value: 'on_load', label: 'При загрузке', description: 'Когда экран загружается' },
    { value: 'on_init', label: 'При инициализации', description: 'Когда компонент инициализируется' },
    { value: 'custom_event', label: 'Пользовательское событие', description: 'Пользовательское событие, вызванное действиями' },
  ];

  const createNewEvent = (): EventDefinition => ({
    id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    trigger: {
      on: 'on_click',
    },
    actions: [],
    enabled: true,
  });

  const handleCreateEvent = () => {
    setEditingEvent(createNewEvent());
    setShowEventForm(true);
  };

  const handleEditEvent = (event: EventDefinition) => {
    setEditingEvent({ ...event });
    setShowEventForm(true);
  };

  const handleSaveEvent = () => {
    if (!editingEvent) return;

    const isNew = !events.find(e => e.id === editingEvent.id);
    
    if (isNew) {
      onAddEvent(editingEvent);
    } else {
      onUpdateEvent(editingEvent.id, editingEvent);
    }

    setEditingEvent(null);
    setShowEventForm(false);
  };

  const handleAddCondition = () => {
    if (!editingEvent) return;
    
    const newConditions = [...(editingEvent.conditions || []), ''];
    setEditingEvent({
      ...editingEvent,
      conditions: newConditions,
    });
  };

  const handleUpdateCondition = (index: number, condition: string) => {
    if (!editingEvent) return;
    
    const newConditions = [...(editingEvent.conditions || [])];
    newConditions[index] = condition;
    setEditingEvent({
      ...editingEvent,
      conditions: newConditions,
    });
  };

  const handleRemoveCondition = (index: number) => {
    if (!editingEvent) return;
    
    const newConditions = [...(editingEvent.conditions || [])];
    newConditions.splice(index, 1);
    setEditingEvent({
      ...editingEvent,
      conditions: newConditions,
    });
  };

  const getTriggerColor = (trigger: EventTrigger) => {
    switch (trigger) {
      case 'on_click':
        return 'bg-blue-100 text-blue-800';
      case 'on_change':
        return 'bg-green-100 text-green-800';
      case 'on_load':
        return 'bg-purple-100 text-purple-800';
      case 'custom_event':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderEventFlow = (event: EventDefinition) => {
    const hasConditions = event.conditions && event.conditions.length > 0;
    const hasActions = event.actions && event.actions.length > 0;

    return (
      <div className="flex items-center gap-2 text-sm">
        {/* Trigger */}
        <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
          <Zap size={14} className="text-blue-600" />
          <span className="font-medium text-blue-800">
            {triggerOptions.find(opt => opt.value === event.trigger.on)?.label}
          </span>
          {event.trigger.elementId && (
            <Badge variant="outline" className="text-xs">
              {availableElements.find(el => el.id === event.trigger.elementId)?.name || 'Element'}
            </Badge>
          )}
        </div>

        {/* Arrow */}
        <ArrowRight size={16} className="text-gray-400" />

        {/* Conditions */}
        {hasConditions && (
          <>
            <div className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
              <GitBranch size={14} className="text-yellow-600" />
              <span className="font-medium text-yellow-800">
                {event.conditions!.length} condition{event.conditions!.length !== 1 ? 's' : ''}
              </span>
            </div>
            <ArrowRight size={16} className="text-gray-400" />
          </>
        )}

        {/* Actions */}
        {hasActions ? (
          <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-md">
            <Play size={14} className="text-green-600" />
            <span className="font-medium text-green-800">
              {event.actions.length} action{event.actions.length !== 1 ? 's' : ''}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded-md">
            <span className="text-gray-500">No actions</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Конструктор Логики</h2>
            <p className="text-sm text-gray-600">
              Создавайте потоки событий с триггерами, условиями и действиями
            </p>
          </div>
          <Button onClick={handleCreateEvent}>
            <Plus size={16} className="mr-1" />
            Новое Событие
          </Button>
        </div>
      </div>

      {/* Events List */}
      <div className="flex-1 overflow-y-auto p-4">
        {events.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Zap size={48} className="mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">События не определены</h3>
              <p className="text-sm">Создайте первое событие для добавления логики в интерфейс</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <Card key={event.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className={getTriggerColor(event.trigger.on)}>
                        {event.trigger.on}
                      </Badge>
                      <div>
                        <CardTitle className="text-base">
                          Event: {event.trigger.on}
                          {event.trigger.name && ` (${event.trigger.name})`}
                        </CardTitle>
                        {!event.enabled && (
                          <Badge variant="outline" className="text-xs mt-1">
                            Disabled
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {onTestEvent && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onTestEvent(event.id)}
                        >
                          <Play size={12} className="mr-1" />
                          Test
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditEvent(event)}
                      >
                        <Edit size={12} className="mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDeleteEvent(event.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={12} className="mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Event Flow Visualization */}
                  {renderEventFlow(event)}
                  
                  {/* Details */}
                  <div className="mt-4 pt-4 border-t">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="font-medium text-gray-600">Trigger</div>
                        <div>{triggerOptions.find(opt => opt.value === event.trigger.on)?.label}</div>
                        {event.trigger.elementId && (
                          <div className="text-xs text-gray-500">
                            Element: {availableElements.find(el => el.id === event.trigger.elementId)?.name}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-600">Conditions</div>
                        <div>{event.conditions?.length || 0}</div>
                      </div>
                      <div>
                        <div className="font-medium text-gray-600">Actions</div>
                        <div>{event.actions?.length || 0}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Event Form Dialog */}
      {showEventForm && editingEvent && (
        <Dialog open={showEventForm} onOpenChange={setShowEventForm}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {events.find(e => e.id === editingEvent.id) ? 'Редактировать Событие' : 'Создать Событие'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Trigger Configuration */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Триггер</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Тип Триггера</Label>
                    <Select
                      value={editingEvent.trigger.on}
                      onValueChange={(value) => 
                        setEditingEvent({
                          ...editingEvent,
                          trigger: { ...editingEvent.trigger, on: value as EventTrigger },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {triggerOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div>
                              <div className="font-medium">{option.label}</div>
                              <div className="text-xs text-gray-500">{option.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {(editingEvent.trigger.on === 'on_click' || 
                    editingEvent.trigger.on === 'on_change' ||
                    editingEvent.trigger.on === 'on_longpress') && (
                    <div>
                      <Label>Целевой Элемент (Необязательно)</Label>
                      <Select
                        value={editingEvent.trigger.elementId || 'any'}
                        onValueChange={(value) => 
                          setEditingEvent({
                            ...editingEvent,
                            trigger: { ...editingEvent.trigger, elementId: value === 'any' ? undefined : value },
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Любой элемент" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">Любой элемент</SelectItem>
                          {availableElements.map((element) => (
                            <SelectItem key={element.id} value={element.id}>
                              {element.name} ({element.type})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {editingEvent.trigger.on === 'custom_event' && (
                  <div>
                    <Label>Имя События</Label>
                    <Input
                      placeholder="custom_event_name"
                      value={editingEvent.trigger.name || ''}
                      onChange={(e) => 
                        setEditingEvent({
                          ...editingEvent,
                          trigger: { ...editingEvent.trigger, name: e.target.value },
                        })
                      }
                    />
                  </div>
                )}
              </div>

              {/* Conditions */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Условия (Необязательно)</h3>
                  <Button size="sm" onClick={handleAddCondition}>
                    <Plus size={14} className="mr-1" />
                    Добавить Условие
                  </Button>
                </div>
                
                {editingEvent.conditions && editingEvent.conditions.length > 0 ? (
                  <div className="space-y-3">
                    {editingEvent.conditions.map((condition, index) => (
                      <div key={index} className="flex gap-2">
                        <div className="flex-1">
                          <Textarea
                            placeholder="например: screen.cart.items.length > 0"
                            value={condition}
                            onChange={(e) => handleUpdateCondition(index, e.target.value)}
                            rows={2}
                          />
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveCondition(index)}
                        >
                          <Trash2 size={12} />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    Условия не определены. Событие будет выполняться всегда при срабатывании.
                  </p>
                )}
              </div>

              {/* Event Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Настройки</h3>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingEvent.enabled !== false}
                    onChange={(e) => 
                      setEditingEvent({
                        ...editingEvent,
                        enabled: e.target.checked,
                      })
                    }
                  />
                  <Label>Включить это событие</Label>
                </div>
              </div>

              {/* Actions Note */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium mt-0.5">
                    i
                  </div>
                  <div>
                    <p className="font-medium text-blue-800 mb-1">Настройка Действий</p>
                    <p className="text-sm text-blue-600">
                      Действия для этого события будут настроены в панели Действия редактора свойств. 
                      Сначала сохраните это событие, затем выберите элемент и добавьте действия, которые ссылаются на это событие.
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowEventForm(false)}>
                  Отмена
                </Button>
                <Button onClick={handleSaveEvent}>
                  Сохранить Событие
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
