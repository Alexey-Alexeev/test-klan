import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Save, X, Settings, Database, Zap } from 'lucide-react';
import { BDUIWidgetDefinition, StateVariable, EventDefinition, BDUIAction } from '../../types';
import { Canvas } from './Canvas';
import { EnhancedPropertiesPanel } from './EnhancedPropertiesPanel';

interface WidgetBuilderProps {
  widget?: BDUIWidgetDefinition;
  isOpen: boolean;
  onSave: (widget: BDUIWidgetDefinition) => void;
  onCancel: () => void;
}

export function WidgetBuilder({ widget, isOpen, onSave, onCancel }: WidgetBuilderProps) {
  const [activeTab, setActiveTab] = useState('design');
  const [widgetDef, setWidgetDef] = useState<BDUIWidgetDefinition>({
    widgetId: '',
    version: '1.0.0',
    meta: {
      name: '',
      description: '',
      author: '',
      tags: [],
    },
    params: {},
    localState: {},
    content: null,
    events: [],
  });

  const [newParamForm, setNewParamForm] = useState({
    key: '',
    type: 'string',
    required: false,
    description: '',
    defaultValue: '',
  });

  const [newStateForm, setNewStateForm] = useState({
    key: '',
    type: 'string',
    value: '',
    description: '',
  });

  const [showNewParamForm, setShowNewParamForm] = useState(false);
  const [showNewStateForm, setShowNewStateForm] = useState(false);

  useEffect(() => {
    if (widget) {
      setWidgetDef(widget);
    } else {
      // Reset form for new widget
      setWidgetDef({
        widgetId: `widget_${Date.now()}`,
        version: '1.0.0',
        meta: {
          name: '',
          description: '',
          author: '',
          tags: [],
        },
        params: {},
        localState: {},
        content: null,
        events: [],
      });
    }
  }, [widget, isOpen]);

  const handleMetaChange = (field: string, value: string) => {
    setWidgetDef(prev => ({
      ...prev,
      meta: {
        ...prev.meta,
        [field]: value,
      },
    }));
  };

  const handleTagsChange = (tagsStr: string) => {
    const tags = tagsStr.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    setWidgetDef(prev => ({
      ...prev,
      meta: {
        ...prev.meta,
        tags,
      },
    }));
  };

  const addParameter = () => {
    if (!newParamForm.key) return;

    const param = {
      type: newParamForm.type,
      required: newParamForm.required,
      description: newParamForm.description || undefined,
      default: parseValue(newParamForm.defaultValue, newParamForm.type),
    };

    setWidgetDef(prev => ({
      ...prev,
      params: {
        ...prev.params,
        [newParamForm.key]: param,
      },
    }));

    setNewParamForm({
      key: '',
      type: 'string',
      required: false,
      description: '',
      defaultValue: '',
    });
    setShowNewParamForm(false);
  };

  const removeParameter = (key: string) => {
    setWidgetDef(prev => {
      const newParams = { ...prev.params };
      delete newParams[key];
      return {
        ...prev,
        params: newParams,
      };
    });
  };

  const addLocalState = () => {
    if (!newStateForm.key) return;

    const stateVar: StateVariable = {
      id: `state_${Date.now()}`,
      key: newStateForm.key,
      type: newStateForm.type as any,
      value: parseValue(newStateForm.value, newStateForm.type),
      scope: 'local',
      description: newStateForm.description || undefined,
    };

    setWidgetDef(prev => ({
      ...prev,
      localState: {
        ...prev.localState,
        [newStateForm.key]: stateVar,
      },
    }));

    setNewStateForm({
      key: '',
      type: 'string',
      value: '',
      description: '',
    });
    setShowNewStateForm(false);
  };

  const removeLocalState = (key: string) => {
    setWidgetDef(prev => {
      const newLocalState = { ...prev.localState };
      delete newLocalState[key];
      return {
        ...prev,
        localState: newLocalState,
      };
    });
  };

  const parseValue = (value: string, type: string) => {
    switch (type) {
      case 'number':
        return Число(value) || 0;
      case 'boolean':
        return value === 'true';
      case 'array':
        try {
          return JSON.parse(value || '[]');
        } catch {
          return [];
        }
      case 'object':
        try {
          return JSON.parse(value || '{}');
        } catch {
          return {};
        }
      default:
        return value;
    }
  };

  const formatValue = (value: any): string => {
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return Строка(value);
  };

  const handleSave = () => {
    // Validate required fields
    if (!widgetDef.meta.name.trim()) {
      alert('Имя виджета обязательно');
      return;
    }

    if (!widgetDef.widgetId.trim()) {
      alert('ID виджета обязателен');
      return;
    }

    onSave(widgetDef);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[90vw] h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">
              {widget ? 'Редактировать Виджет' : 'Создать Виджет'}
            </h2>
            <p className="text-sm text-gray-600">
              Создайте переиспользуемый виджет с параметрами, состоянием и логикой
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel}>
              <X size={16} className="mr-1" />
              Отмена
            </Button>
            <Button onClick={handleSave}>
              <Save size={16} className="mr-1" />
              Сохранить Виджет
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Configuration */}
          <div className="w-80 border-r bg-gray-50 overflow-y-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
              <div className="p-3 border-b">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="meta" className="flex items-center gap-1">
                    <Settings size={14} />
                    Мета
                  </TabsTrigger>
                  <TabsTrigger value="params" className="flex items-center gap-1">
                    <Database size={14} />
                    Параметры
                  </TabsTrigger>
                  <TabsTrigger value="state" className="flex items-center gap-1">
                    <Zap size={14} />
                    Состояние
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 overflow-y-auto">
                <TabsContent value="meta" className="p-4 space-y-4 m-0">
                  <div>
                    <Label>Имя Виджета *</Label>
                    <Input
                      value={widgetDef.meta.name}
                      onChange={(e) => handleMetaChange('name', e.target.value)}
                      placeholder="Мой Пользовательский Виджет"
                    />
                  </div>

                  <div>
                    <Label>ID Виджета *</Label>
                    <Input
                      value={widgetDef.widgetId}
                      onChange={(e) => setWidgetDef(prev => ({ ...prev, widgetId: e.target.value }))}
                      placeholder="мой_пользовательский_виджет_v1"
                    />
                  </div>

                  <div>
                    <Label>Версия</Label>
                    <Input
                      value={widgetDef.version}
                      onChange={(e) => setWidgetDef(prev => ({ ...prev, version: e.target.value }))}
                      placeholder="1.0.0"
                    />
                  </div>

                  <div>
                    <Label>Описание</Label>
                    <Textarea
                      value={widgetDef.meta.description}
                      onChange={(e) => handleMetaChange('description', e.target.value)}
                      placeholder="Краткое описание того, что делает этот виджет"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label>Автор</Label>
                    <Input
                      value={widgetDef.meta.author}
                      onChange={(e) => handleMetaChange('author', e.target.value)}
                      placeholder="Ваше имя"
                    />
                  </div>

                  <div>
                    <Label>Теги (через запятую)</Label>
                    <Input
                      value={widgetDef.meta.tags?.join(', ')}
                      onChange={(e) => handleTagsChange(e.target.value)}
                      placeholder="ui, форма, ввод"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="params" className="p-4 m-0">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Параметры</h3>
                      <Button
                        size="sm"
                        onClick={() => setShowNewParamForm(true)}
                      >
                        <Plus size={14} className="mr-1" />
                        Добавить
                      </Button>
                    </div>

                    {Object.entries(widgetDef.params).map(([key, param]) => (
                      <Card key={key}>
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="font-medium">{key}</div>
                              <div className="text-sm text-gray-600">
                                Тип: {param.type}
                                {param.required && (
                                  <Badge variant="destructive" className="ml-2 text-xs">
                                    Обязательный
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeParameter(key)}
                            >
                              <Trash2 size={12} />
                            </Button>
                          </div>
                          {param.description && (
                            <p className="text-sm text-gray-500">{param.description}</p>
                          )}
                          {param.default !== undefined && (
                            <div className="text-xs text-gray-400 mt-1">
                              По умолчанию: {formatValue(param.default)}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}

                    {showNewParamForm && (
                      <Card>
                        <CardContent className="p-3 space-y-3">
                          <div>
                            <Label>Имя Параметра</Label>
                            <Input
                              value={newParamForm.key}
                              onChange={(e) => setNewParamForm(prev => ({ ...prev, key: e.target.value }))}
                              placeholder="имяПараметра"
                            />
                          </div>
                          <div>
                            <Label>Тип</Label>
                            <Select
                              value={newParamForm.type}
                              onValueChange={(value) => setNewParamForm(prev => ({ ...prev, type: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="string">Строка</SelectItem>
                                <SelectItem value="number">Число</SelectItem>
                                <SelectItem value="boolean">Логический</SelectItem>
                                <SelectItem value="array">Массив</SelectItem>
                                <SelectItem value="object">Объект</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Значение по Умолчанию</Label>
                            <Input
                              value={newParamForm.defaultValue}
                              onChange={(e) => setNewParamForm(prev => ({ ...prev, defaultValue: e.target.value }))}
                              placeholder="Значение по умолчанию"
                            />
                          </div>
                          <div>
                            <Label>Описание</Label>
                            <Input
                              value={newParamForm.description}
                              onChange={(e) => setNewParamForm(prev => ({ ...prev, description: e.target.value }))}
                              placeholder="Описание параметра"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={newParamForm.required}
                              onChange={(e) => setNewParamForm(prev => ({ ...prev, required: e.target.checked }))}
                            />
                            <Label>Обязательный</Label>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={addParameter}>
                              Добавить Параметр
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setShowNewParamForm(false)}
                            >
                              Отмена
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="state" className="p-4 m-0">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Local State</h3>
                      <Button
                        size="sm"
                        onClick={() => setShowNewStateForm(true)}
                      >
                        <Plus size={14} className="mr-1" />
                        Add
                      </Button>
                    </div>

                    {Object.entries(widgetDef.localState).map(([key, stateVar]) => (
                      <Card key={key}>
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="font-medium">{key}</div>
                              <div className="text-sm text-gray-600">
                                Type: {stateVar.type}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeLocalState(key)}
                            >
                              <Trash2 size={12} />
                            </Button>
                          </div>
                          {stateVar.description && (
                            <p className="text-sm text-gray-500">{stateVar.description}</p>
                          )}
                          <div className="text-xs text-gray-400 mt-1">
                            Initial: {formatValue(stateVar.value)}
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {showNewStateForm && (
                      <Card>
                        <CardContent className="p-3 space-y-3">
                          <div>
                            <Label>State Variable Name</Label>
                            <Input
                              value={newStateForm.key}
                              onChange={(e) => setNewStateForm(prev => ({ ...prev, key: e.target.value }))}
                              placeholder="variableName"
                            />
                          </div>
                          <div>
                            <Label>Type</Label>
                            <Select
                              value={newStateForm.type}
                              onValueChange={(value) => setNewStateForm(prev => ({ ...prev, type: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="string">Строка</SelectItem>
                                <SelectItem value="number">Число</SelectItem>
                                <SelectItem value="boolean">Логический</SelectItem>
                                <SelectItem value="array">Массив</SelectItem>
                                <SelectItem value="object">Объект</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Initial Value</Label>
                            <Input
                              value={newStateForm.value}
                              onChange={(e) => setNewStateForm(prev => ({ ...prev, value: e.target.value }))}
                              placeholder="Initial value"
                            />
                          </div>
                          <div>
                            <Label>Description</Label>
                            <Input
                              value={newStateForm.description}
                              onChange={(e) => setNewStateForm(prev => ({ ...prev, description: e.target.value }))}
                              placeholder="Variable description"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={addLocalState}>
                              Add Variable
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setShowNewStateForm(false)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>

          {/* Right Panel - Design Canvas */}
          <div className="flex-1 flex">
            <div className="flex-1 bg-gray-100">
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-600 mb-2">Widget Design Canvas</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    This will be the visual editor for designing your widget's layout
                  </p>
                  <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-8">
                    <p className="text-gray-400">
                      Widget canvas coming soon...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
