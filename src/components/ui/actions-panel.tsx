import React, { useState } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Textarea } from './textarea';
import { Plus, Trash2, Edit, ChevronDown, ChevronRight, Play, Copy, Move } from 'lucide-react';
import { BDUIAction, ActionType } from '../../types';

interface ActionsPanelProps {
  // Current actions for selected element
  actions: BDUIAction[];
  // Available state variables for targeting
  availableVariables: Array<{
    scope: string;
    key: string;
    type: string;
    path: string; // full path like "screen.cart.total"
  }>;
  // Callbacks
  onAddAction: (action: BDUIAction) => void;
  onUpdateAction: (index: number, action: BDUIAction) => void;
  onDeleteAction: (index: number) => void;
  onReorderActions: (fromIndex: number, toIndex: number) => void;
  onTestAction?: (action: BDUIAction) => void;
}

export function ActionsPanel({
  actions,
  availableVariables,
  onAddAction,
  onUpdateAction,
  onDeleteAction,
  onReorderActions,
  onTestAction,
}: ActionsPanelProps) {
  const [showNewActionForm, setShowNewActionForm] = useState(false);
  const [editingActionIndex, setEditingActionIndex] = useState<number | null>(null);
  const [newActionType, setNewActionType] = useState<ActionType>('state_update');

  const actionTypeOptions: Array<{ value: ActionType; label: string; description: string }> = [
    { value: 'navigation', label: 'Навигация', description: 'Переход между экранами или открытие модальных окон' },
    { value: 'state_update', label: 'Обновить Состояние', description: 'Изменение переменных состояния' },
    { value: 'recalculate', label: 'Пересчитать', description: 'Выполнение формулы для обновления состояния' },
    { value: 'api_call', label: 'API Вызов', description: 'Выполнение HTTP запросов' },
    { value: 'emit_event', label: 'Отправить Событие', description: 'Запуск пользовательских событий' },
    { value: 'condition', label: 'Условие', description: 'Условная логика потока' },
    { value: 'toast', label: 'Уведомление', description: 'Показать уведомление' },
    { value: 'open_widget', label: 'Открыть Виджет', description: 'Показать экземпляр виджета' },
    { value: 'close_widget', label: 'Закрыть Виджет', description: 'Скрыть экземпляр виджета' },
    { value: 'batch', label: 'Пакет', description: 'Группировка нескольких действий' },
  ];

  const getActionTypeColor = (type: ActionType) => {
    switch (type) {
      case 'navigation':
        return 'bg-blue-100 text-blue-800';
      case 'state_update':
        return 'bg-green-100 text-green-800';
      case 'recalculate':
        return 'bg-purple-100 text-purple-800';
      case 'api_call':
        return 'bg-orange-100 text-orange-800';
      case 'emit_event':
        return 'bg-yellow-100 text-yellow-800';
      case 'condition':
        return 'bg-indigo-100 text-indigo-800';
      case 'toast':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const createNewAction = (type: ActionType): BDUIAction => {
    const baseAction = {
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      meta: {
        name: `Новое действие ${type}`,
        enabled: true,
      },
    };

    switch (type) {
      case 'navigation':
        return {
          ...baseAction,
          type: 'navigation',
          params: {
            action: 'navigate_back',
          },
        };
      case 'state_update':
        return {
          ...baseAction,
          type: 'state_update',
          params: {
            target: '',
            operation: 'set',
            value: '',
          },
        };
      case 'recalculate':
        return {
          ...baseAction,
          type: 'recalculate',
          params: {
            target: '',
            formula: '',
          },
        };
      case 'api_call':
        return {
          ...baseAction,
          type: 'api_call',
          params: {
            method: 'GET',
            url: '',
          },
        };
      case 'emit_event':
        return {
          ...baseAction,
          type: 'emit_event',
          params: {
            name: '',
          },
        };
      case 'condition':
        return {
          ...baseAction,
          type: 'condition',
          params: {
            condition: '',
            ifTrue: [],
          },
        };
      case 'toast':
        return {
          ...baseAction,
          type: 'toast',
          params: {
            message: '',
            type: 'info',
          },
        };
      case 'open_widget':
      case 'close_widget':
        return {
          ...baseAction,
          type,
          params: {
            widgetInstanceId: '',
          },
        };
      case 'batch':
        return {
          ...baseAction,
          type: 'batch',
          params: {
            actions: [],
            atomic: false,
          },
        };
      default:
        return baseAction as BDUIAction;
    }
  };

  const handleAddAction = () => {
    const newAction = createNewAction(newActionType);
    onAddAction(newAction);
    setShowNewActionForm(false);
  };

  const renderActionForm = (action: BDUIAction, onChange: (updates: Partial<BDUIAction>) => void) => {
    switch (action.type) {
      case 'navigation':
        return (
          <div className="space-y-2">
            <div>
              <Label className="text-xs">Action</Label>
              <Select
                value={action.params.action}
                onValueChange={(value) => 
                  onChange({ params: { ...action.params, action: value as any } })
                }
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="navigate_to">Navigate To</SelectItem>
                  <SelectItem value="navigate_back">Navigate Back</SelectItem>
                  <SelectItem value="open_modal">Open Modal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {action.params.action === 'navigate_to' && (
              <div>
                <Label className="text-xs">Target Screen</Label>
                <Input
                  placeholder="screen_id"
                  value={action.params.target || ''}
                  onChange={(e) => 
                    onChange({ params: { ...action.params, target: e.target.value } })
                  }
                  className="h-8"
                />
              </div>
            )}
            {action.params.action === 'open_modal' && (
              <div>
                <Label className="text-xs">Modal ID</Label>
                <Input
                  placeholder="modal_id"
                  value={action.params.modalId || ''}
                  onChange={(e) => 
                    onChange({ params: { ...action.params, modalId: e.target.value } })
                  }
                  className="h-8"
                />
              </div>
            )}
          </div>
        );

      case 'state_update':
        return (
          <div className="space-y-2">
            <div>
              <Label className="text-xs">Target Variable</Label>
              <Select
                value={action.params.target}
                onValueChange={(value) => 
                  onChange({ params: { ...action.params, target: value } })
                }
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Select variable" />
                </SelectTrigger>
                <SelectContent>
                  {availableVariables.map((variable) => (
                    <SelectItem key={variable.path} value={variable.path}>
                      {variable.path} ({variable.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Operation</Label>
              <Select
                value={action.params.operation}
                onValueChange={(value) => 
                  onChange({ params: { ...action.params, operation: value as any } })
                }
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="set">Set</SelectItem>
                  <SelectItem value="increment">Increment</SelectItem>
                  <SelectItem value="decrement">Decrement</SelectItem>
                  <SelectItem value="push">Push to Array</SelectItem>
                  <SelectItem value="remove_by_index">Remove by Index</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(action.params.operation === 'set' || action.params.operation === 'push') && (
              <div>
                <Label className="text-xs">Value</Label>
                <Input
                  placeholder="Value or expression"
                  value={action.params.value || ''}
                  onChange={(e) => 
                    onChange({ params: { ...action.params, value: e.target.value } })
                  }
                  className="h-8"
                />
              </div>
            )}
            {(action.params.operation === 'increment' || action.params.operation === 'decrement') && (
              <div>
                <Label className="text-xs">By Amount</Label>
                <Input
                  type="number"
                  placeholder="1"
                  value={action.params.by || 1}
                  onChange={(e) => 
                    onChange({ params: { ...action.params, by: Number(e.target.value) } })
                  }
                  className="h-8"
                />
              </div>
            )}
          </div>
        );

      case 'recalculate':
        return (
          <div className="space-y-2">
            <div>
              <Label className="text-xs">Target Variable</Label>
              <Select
                value={action.params.target}
                onValueChange={(value) => 
                  onChange({ params: { ...action.params, target: value } })
                }
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Select variable" />
                </SelectTrigger>
                <SelectContent>
                  {availableVariables.map((variable) => (
                    <SelectItem key={variable.path} value={variable.path}>
                      {variable.path} ({variable.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Formula</Label>
              <Textarea
                placeholder="e.g., screen.cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0)"
                value={action.params.formula}
                onChange={(e) => 
                  onChange({ params: { ...action.params, formula: e.target.value } })
                }
                className="h-20 text-sm"
              />
            </div>
          </div>
        );

      case 'toast':
        return (
          <div className="space-y-2">
            <div>
              <Label className="text-xs">Message</Label>
              <Input
                placeholder="Notification message"
                value={action.params.message}
                onChange={(e) => 
                  onChange({ params: { ...action.params, message: e.target.value } })
                }
                className="h-8"
              />
            </div>
            <div>
              <Label className="text-xs">Type</Label>
              <Select
                value={action.params.type || 'info'}
                onValueChange={(value) => 
                  onChange({ params: { ...action.params, type: value as any } })
                }
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'emit_event':
        return (
          <div className="space-y-2">
            <div>
              <Label className="text-xs">Event Name</Label>
              <Input
                placeholder="custom_event_name"
                value={action.params.name}
                onChange={(e) => 
                  onChange({ params: { ...action.params, name: e.target.value } })
                }
                className="h-8"
              />
            </div>
            <div>
              <Label className="text-xs">Payload (JSON)</Label>
              <Textarea
                placeholder='{"key": "value"}'
                value={typeof action.params.payload === 'string' 
                  ? action.params.payload 
                  : JSON.stringify(action.params.payload || {}, null, 2)
                }
                onChange={(e) => {
                  try {
                    const payload = JSON.parse(e.target.value);
                    onChange({ params: { ...action.params, payload } });
                  } catch {
                    onChange({ params: { ...action.params, payload: e.target.value } });
                  }
                }}
                className="h-16 text-sm"
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="text-sm text-gray-500">
            Configuration for {action.type} actions coming soon
          </div>
        );
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Действия</h3>
          <Button
            size="sm"
            onClick={() => setShowNewActionForm(true)}
          >
            <Plus size={14} className="mr-1" />
            Добавить
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {actions.length === 0 ? (
          <div className="p-3 text-sm text-gray-500 text-center">
            Действия не определены. Нажмите "Добавить" для создания первого действия.
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {actions.map((action, index) => (
              <Card key={action.id} className="border border-gray-200">
                <CardHeader className="py-2 px-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={getActionTypeColor(action.type)}>
                        {action.type}
                      </Badge>
                      <span className="text-sm font-medium">
                        {action.meta?.name || `${action.type} action`}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {onTestAction && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onTestAction(action)}
                          title="Test action"
                        >
                          <Play size={12} />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingActionIndex(index)}
                        title="Edit action"
                      >
                        <Edit size={12} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDeleteAction(index)}
                        title="Delete action"
                      >
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {editingActionIndex === index && (
                  <CardContent className="py-2 px-3 pt-0 border-t">
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs">Action Name</Label>
                        <Input
                          placeholder="Action name"
                          value={action.meta?.name || ''}
                          onChange={(e) => 
                            onUpdateAction(index, {
                              ...action,
                              meta: { ...action.meta, name: e.target.value },
                            })
                          }
                          className="h-8"
                        />
                      </div>
                      {renderActionForm(action, (updates) => 
                        onUpdateAction(index, { ...action, ...updates })
                      )}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => setEditingActionIndex(null)}
                        >
                          Done
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const duplicate = { 
                              ...action, 
                              id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                              meta: { ...action.meta, name: `${action.meta?.name || action.type} (copy)` }
                            };
                            onAddAction(duplicate);
                          }}
                        >
                          <Copy size={12} className="mr-1" />
                          Duplicate
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* New Action Form */}
      {showNewActionForm && (
        <div className="border-t p-3 bg-gray-50">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Добавить Действие</h4>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowNewActionForm(false)}
              >
                Cancel
              </Button>
            </div>
            
            <div>
              <Label className="text-xs">Action Type</Label>
              <Select
                value={newActionType}
                onValueChange={(value) => setNewActionType(value as ActionType)}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {actionTypeOptions.map((option) => (
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

            <Button size="sm" onClick={handleAddAction} className="w-full">
              Add {actionTypeOptions.find(opt => opt.value === newActionType)?.label} Action
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
