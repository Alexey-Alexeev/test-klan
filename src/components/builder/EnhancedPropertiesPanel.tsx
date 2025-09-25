import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Database, Zap } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { updateWidget } from '../../features/canvas/canvasSlice';
import { 
  addStateVariable, 
  updateStateVariable, 
  deleteStateVariable,
  setRuntimeValue 
} from '../../features/state/stateSlice';
import { 
  IWidget, 
  StateVariable, 
  VariableScope,
  BDUIAction,
} from '../../types';

// Import existing PropertiesPanel content
import { PropertiesPanel as OriginalPropertiesPanel } from './PropertiesPanel';
import { BindingsPanel } from '../ui/bindings-panel';
import { ActionsPanel } from '../ui/actions-panel';

export function EnhancedPropertiesPanel() {
  const dispatch = useAppDispatch();
  const { selectedWidgetId, widgets } = useAppSelector(state => state.canvas);
  const { isPropertiesPanelOpen } = useAppSelector(state => state.app);
  const { screenState, appState, runtime } = useAppSelector(state => state.state);
  
  const selectedWidget = widgets.find(w => w.id === selectedWidgetId);
  const [activeTab, setActiveTab] = useState('properties');

  // Get available properties for binding based on widget type
  const getAvailableProperties = (widget: IWidget) => {
    const commonProperties = [
      { key: 'style.color', name: 'Цвет Текста', type: 'string', description: 'Значение цвета текста' },
      { key: 'style.backgroundColor', name: 'Цвет Фона', type: 'string', description: 'Значение цвета фона' },
      { key: 'style.opacity', name: 'Прозрачность', type: 'number', description: 'Значение прозрачности (0-1)' },
    ];

    switch (widget.type) {
      case 'text':
        return [
          ...commonProperties,
          { key: 'props.content', name: 'Содержимое Текста', type: 'string', description: 'Текстовое содержимое для отображения' },
        ];
      case 'button':
        return [
          ...commonProperties,
          { key: 'props.text', name: 'Текст Кнопки', type: 'string', description: 'Метка кнопки' },
          { key: 'props.disabled', name: 'Отключена', type: 'boolean', description: 'Отключена ли кнопка' },
        ];
      case 'image':
        return [
          ...commonProperties,
          { key: 'props.src', name: 'Источник Изображения', type: 'string', description: 'URL или путь к изображению' },
          { key: 'props.alt', name: 'Альтернативный Текст', type: 'string', description: 'Альтернативный текст для доступности' },
        ];
      case 'input':
        return [
          ...commonProperties,
          { key: 'props.placeholder', name: 'Заполнитель', type: 'string', description: 'Текст заполнителя' },
          { key: 'props.disabled', name: 'Отключен', type: 'boolean', description: 'Отключен ли ввод' },
        ];
      default:
        return commonProperties;
    }
  };

  // Get all available variables for targeting in actions
  const getAllAvailableVariables = () => {
    const variables: Array<{
      scope: string;
      key: string;
      type: string;
      path: string;
    }> = [];

    // Add app state variables
    Object.values(appState).forEach(variable => {
      variables.push({
        scope: 'app',
        key: variable.key,
        type: variable.type,
        path: `app.${variable.key}`,
      });
    });

    // Add screen state variables
    Object.values(screenState).forEach(variable => {
      variables.push({
        scope: 'screen',
        key: variable.key,
        type: variable.type,
        path: `screen.${variable.key}`,
      });
    });

    return variables;
  };

  const handleAddStateVariable = (scope: VariableScope, variable: StateVariable) => {
    dispatch(addStateVariable({ scope, variable }));
  };

  const handleUpdateStateVariable = (scope: VariableScope, key: string, updates: Partial<StateVariable>) => {
    dispatch(updateStateVariable({ scope, key, updates }));
  };

  const handleDeleteStateVariable = (scope: VariableScope, key: string) => {
    dispatch(deleteStateVariable({ scope, key }));
  };

  const handleUpdateBinding = (property: string, expression: string) => {
    if (!selectedWidget) return;
    
    const currentBindings = selectedWidget.bindings || {};
    const newBindings = { ...currentBindings };
    
    if (expression.trim()) {
      newBindings[property] = expression;
    } else {
      delete newBindings[property];
    }
    
    dispatch(updateWidget({ 
      id: selectedWidget.id, 
      updates: { bindings: newBindings } 
    }));
  };

  const handleRemoveBinding = (property: string) => {
    if (!selectedWidget) return;
    
    const currentBindings = selectedWidget.bindings || {};
    const newBindings = { ...currentBindings };
    delete newBindings[property];
    
    dispatch(updateWidget({ 
      id: selectedWidget.id, 
      updates: { bindings: newBindings } 
    }));
  };

  const handleAddAction = (action: BDUIAction) => {
    if (!selectedWidget) return;
    
    const currentActions = selectedWidget.actions || [];
    const newActions = [...currentActions, action];
    
    dispatch(updateWidget({ 
      id: selectedWidget.id, 
      updates: { actions: newActions } 
    }));
  };

  const handleUpdateAction = (index: number, action: BDUIAction) => {
    if (!selectedWidget) return;
    
    const currentActions = selectedWidget.actions || [];
    const newActions = [...currentActions];
    newActions[index] = action;
    
    dispatch(updateWidget({ 
      id: selectedWidget.id, 
      updates: { actions: newActions } 
    }));
  };

  const handleDeleteAction = (index: number) => {
    if (!selectedWidget) return;
    
    const currentActions = selectedWidget.actions || [];
    const newActions = currentActions.filter((_, i) => i !== index);
    
    dispatch(updateWidget({ 
      id: selectedWidget.id, 
      updates: { actions: newActions } 
    }));
  };

  const handleReorderActions = (fromIndex: number, toIndex: number) => {
    if (!selectedWidget) return;
    
    const currentActions = selectedWidget.actions || [];
    const newActions = [...currentActions];
    const [movedAction] = newActions.splice(fromIndex, 1);
    newActions.splice(toIndex, 0, movedAction);
    
    dispatch(updateWidget({ 
      id: selectedWidget.id, 
      updates: { actions: newActions } 
    }));
  };

  const handleTestAction = (action: BDUIAction) => {
    // Simple action testing - just log for now
    console.log('Testing action:', action);
    
    // For state_update actions, we can actually execute them
    if (action.type === 'state_update') {
      const { target, operation, value, by } = action.params;
      
      // Determine scope from target path
      if (target.startsWith('screen.')) {
        const key = target.replace('screen.', '');
        switch (operation) {
          case 'set':
            dispatch(setRuntimeValue({ scope: 'screen', path: key, value }));
            break;
          case 'increment':
            dispatch(setRuntimeValue({ 
              scope: 'screen', 
              path: key, 
              value: (runtime.screen[key] || 0) + (by || 1) 
            }));
            break;
          case 'decrement':
            dispatch(setRuntimeValue({ 
              scope: 'screen', 
              path: key, 
              value: (runtime.screen[key] || 0) - (by || 1) 
            }));
            break;
        }
      } else if (target.startsWith('app.')) {
        const key = target.replace('app.', '');
        switch (operation) {
          case 'set':
            dispatch(setRuntimeValue({ scope: 'app', path: key, value }));
            break;
          case 'increment':
            dispatch(setRuntimeValue({ 
              scope: 'app', 
              path: key, 
              value: (runtime.app[key] || 0) + (by || 1) 
            }));
            break;
          case 'decrement':
            dispatch(setRuntimeValue({ 
              scope: 'app', 
              path: key, 
              value: (runtime.app[key] || 0) - (by || 1) 
            }));
            break;
        }
      }
    }
  };

  if (!isPropertiesPanelOpen) {
    return null;
  }

  return (
    <div className="w-80 h-full bg-white border-l border-border flex flex-col">
      {!selectedWidget ? (
        <div className="p-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Панель Свойств</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Выберите элемент на холсте для редактирования его свойств, привязок данных и действий.
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
          <div className="p-3 border-b">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="properties" className="flex items-center gap-1">
                <Settings size={14} />
                Свойства
              </TabsTrigger>
              <TabsTrigger value="bindings" className="flex items-center gap-1">
                <Database size={14} />
                Данные
              </TabsTrigger>
              <TabsTrigger value="actions" className="flex items-center gap-1">
                <Zap size={14} />
                Действия
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="properties" className="h-full m-0 overflow-y-auto">
              {/* Use the original PropertiesPanel content */}
              <div className="p-4">
                <OriginalPropertiesPanel />
              </div>
            </TabsContent>

            <TabsContent value="bindings" className="h-full m-0">
              <BindingsPanel
                appState={appState}
                screenState={screenState}
                currentBindings={selectedWidget.bindings || {}}
                availableProperties={getAvailableProperties(selectedWidget)}
                onAddStateVariable={handleAddStateVariable}
                onUpdateStateVariable={handleUpdateStateVariable}
                onDeleteStateVariable={handleDeleteStateVariable}
                onUpdateBinding={handleUpdateBinding}
                onRemoveBinding={handleRemoveBinding}
              />
            </TabsContent>

            <TabsContent value="actions" className="h-full m-0">
              <ActionsPanel
                actions={selectedWidget.actions || []}
                availableVariables={getAllAvailableVariables()}
                onAddAction={handleAddAction}
                onUpdateAction={handleUpdateAction}
                onDeleteAction={handleDeleteAction}
                onReorderActions={handleReorderActions}
                onTestAction={handleTestAction}
              />
            </TabsContent>
          </div>
        </Tabs>
      )}
    </div>
  );
}
