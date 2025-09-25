import React, { useState } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Plus, Trash2, Edit, ChevronDown, ChevronRight } from 'lucide-react';
import { StateVariable, VariableScope } from '../../types';

interface BindingsPanelProps {
  // State variables organized by scope
  appState: Record<string, StateVariable>;
  screenState: Record<string, StateVariable>;
  widgetParams?: Record<string, any>;
  widgetLocalState?: Record<string, StateVariable>;
  // Current bindings for selected element
  currentBindings: Record<string, string>;
  // Available properties that can be bound
  availableProperties: Array<{
    key: string;
    name: string;
    type: string;
    description?: string;
  }>;
  // Callbacks
  onAddStateVariable: (scope: VariableScope, variable: StateVariable) => void;
  onUpdateStateVariable: (scope: VariableScope, key: string, updates: Partial<StateVariable>) => void;
  onDeleteStateVariable: (scope: VariableScope, key: string) => void;
  onUpdateBinding: (property: string, expression: string) => void;
  onRemoveBinding: (property: string) => void;
}

export function BindingsPanel({
  appState,
  screenState,
  widgetParams = {},
  widgetLocalState = {},
  currentBindings,
  availableProperties,
  onAddStateVariable,
  onUpdateStateVariable,
  onDeleteStateVariable,
  onUpdateBinding,
  onRemoveBinding,
}: BindingsPanelProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['bindings']));
  const [editingVariable, setEditingVariable] = useState<{
    scope: VariableScope;
    key: string;
  } | null>(null);
  const [newVariableForm, setNewVariableForm] = useState<{
    scope: VariableScope;
    key: string;
    type: string;
    value: string;
    description: string;
  }>({
    scope: 'screen',
    key: '',
    type: 'string',
    value: '',
    description: '',
  });
  const [showNewVariableForm, setShowNewVariableForm] = useState(false);

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const handleAddVariable = () => {
    if (!newVariableForm.key) return;

    const variable: StateVariable = {
      id: `var_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      key: newVariableForm.key,
      type: newVariableForm.type as any,
      value: parseVariableValue(newVariableForm.value, newVariableForm.type),
      scope: newVariableForm.scope,
      description: newVariableForm.description || undefined,
    };

    onAddStateVariable(newVariableForm.scope, variable);
    
    // Reset form
    setNewVariableForm({
      scope: 'screen',
      key: '',
      type: 'string',
      value: '',
      description: '',
    });
    setShowNewVariableForm(false);
  };

  const parseVariableValue = (value: string, type: string) => {
    switch (type) {
      case 'number':
        return Number(value) || 0;
      case 'boolean':
        return value === 'true';
      case 'array':
        try {
          return JSON.parse(value);
        } catch {
          return [];
        }
      case 'object':
        try {
          return JSON.parse(value);
        } catch {
          return {};
        }
      default:
        return value;
    }
  };

  const formatVariableValue = (value: any): string => {
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  };

  const getScopeColor = (scope: VariableScope) => {
    switch (scope) {
      case 'app':
        return 'bg-blue-100 text-blue-800';
      case 'screen':
        return 'bg-green-100 text-green-800';
      case 'params':
        return 'bg-purple-100 text-purple-800';
      case 'local':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStateSection = (
    title: string,
    scope: VariableScope,
    variables: Record<string, StateVariable>,
    readonly = false
  ) => {
    const sectionKey = `state_${scope}`;
    const isExpanded = expandedSections.has(sectionKey);

    return (
      <Card key={sectionKey} className="mb-3">
        <CardHeader 
          className="py-2 px-3 cursor-pointer hover:bg-gray-50"
          onClick={() => toggleSection(sectionKey)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              <CardTitle className="text-sm">{title}</CardTitle>
              <Badge variant="outline" className={getScopeColor(scope)}>
                {Object.keys(variables).length}
              </Badge>
            </div>
            {!readonly && (
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  setNewVariableForm({ ...newVariableForm, scope });
                  setShowNewVariableForm(true);
                }}
              >
                <Plus size={14} />
              </Button>
            )}
          </div>
        </CardHeader>
        {isExpanded && (
          <CardContent className="py-2 px-3 pt-0">
            {Object.values(variables).map((variable) => (
              <div key={variable.key} className="flex items-center justify-between py-1 border-b last:border-b-0">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{variable.key}</span>
                    <Badge variant="outline" className="text-xs">
                      {variable.type}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {formatVariableValue(variable.value)}
                  </div>
                  {variable.description && (
                    <div className="text-xs text-gray-400 truncate">
                      {variable.description}
                    </div>
                  )}
                </div>
                {!readonly && (
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingVariable({ scope, key: variable.key })}
                    >
                      <Edit size={12} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDeleteStateVariable(scope, variable.key)}
                    >
                      <Trash2 size={12} />
                    </Button>
                  </div>
                )}
              </div>
            ))}
            {Object.keys(variables).length === 0 && (
              <div className="text-sm text-gray-400 py-2">
                No {scope} variables defined
              </div>
            )}
          </CardContent>
        )}
      </Card>
    );
  };

  const renderBindingsSection = () => {
    const isExpanded = expandedSections.has('bindings');

    return (
      <Card className="mb-3">
        <CardHeader 
          className="py-2 px-3 cursor-pointer hover:bg-gray-50"
          onClick={() => toggleSection('bindings')}
        >
          <div className="flex items-center gap-2">
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            <CardTitle className="text-sm">Привязки Свойств</CardTitle>
            <Badge variant="outline">
              {Object.keys(currentBindings).length}
            </Badge>
          </div>
        </CardHeader>
        {isExpanded && (
          <CardContent className="py-2 px-3 pt-0">
            {availableProperties.map((property) => {
              const currentBinding = currentBindings[property.key];
              
              return (
                <div key={property.key} className="py-2 border-b last:border-b-0">
                  <div className="flex items-center justify-between mb-1">
                    <Label className="text-sm font-medium">{property.name}</Label>
                    <Badge variant="outline" className="text-xs">
                      {property.type}
                    </Badge>
                  </div>
                  {property.description && (
                    <div className="text-xs text-gray-400 mb-1">
                      {property.description}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g., {screen.title} or static value"
                      value={currentBinding || ''}
                      onChange={(e) => onUpdateBinding(property.key, e.target.value)}
                      className="text-sm"
                    />
                    {currentBinding && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onRemoveBinding(property.key)}
                      >
                        <Trash2 size={12} />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        )}
      </Card>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b">
        <h3 className="text-sm font-medium">Данные и Привязки</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3">
        {/* Property Bindings */}
        {renderBindingsSection()}

        {/* State Variables */}
        {renderStateSection('App State', 'app', appState)}
        {renderStateSection('Screen State', 'screen', screenState)}
        
        {/* Widget Parameters (readonly) */}
        {Object.keys(widgetParams).length > 0 && (
          <Card className="mb-3">
            <CardHeader className="py-2 px-3">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm">Widget Parameters</CardTitle>
                <Badge variant="outline" className={getScopeColor('params')}>
                  {Object.keys(widgetParams).length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="py-2 px-3 pt-0">
              {Object.entries(widgetParams).map(([key, value]) => (
                <div key={key} className="py-1 border-b last:border-b-0">
                  <div className="text-sm font-medium">{key}</div>
                  <div className="text-xs text-gray-500 truncate">
                    {formatVariableValue(value)}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Widget Local State */}
        {Object.keys(widgetLocalState).length > 0 &&
          renderStateSection('Widget Local State', 'local', widgetLocalState, true)
        }
      </div>

      {/* New Variable Form */}
      {showNewVariableForm && (
        <div className="border-t p-3 bg-gray-50">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Add Variable</h4>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowNewVariableForm(false)}
              >
                Cancel
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Scope</Label>
                <Select
                  value={newVariableForm.scope}
                  onValueChange={(value) => 
                    setNewVariableForm({ ...newVariableForm, scope: value as VariableScope })
                  }
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="app">App</SelectItem>
                    <SelectItem value="screen">Screen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-xs">Type</Label>
                <Select
                  value={newVariableForm.type}
                  onValueChange={(value) => 
                    setNewVariableForm({ ...newVariableForm, type: value })
                  }
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="string">String</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="boolean">Boolean</SelectItem>
                    <SelectItem value="array">Array</SelectItem>
                    <SelectItem value="object">Object</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-xs">Key</Label>
              <Input
                placeholder="Variable name"
                value={newVariableForm.key}
                onChange={(e) => 
                  setNewVariableForm({ ...newVariableForm, key: e.target.value })
                }
                className="h-8"
              />
            </div>

            <div>
              <Label className="text-xs">Initial Value</Label>
              <Input
                placeholder="Default value"
                value={newVariableForm.value}
                onChange={(e) => 
                  setNewVariableForm({ ...newVariableForm, value: e.target.value })
                }
                className="h-8"
              />
            </div>

            <div>
              <Label className="text-xs">Description</Label>
              <Input
                placeholder="Optional description"
                value={newVariableForm.description}
                onChange={(e) => 
                  setNewVariableForm({ ...newVariableForm, description: e.target.value })
                }
                className="h-8"
              />
            </div>

            <Button size="sm" onClick={handleAddVariable} className="w-full">
              Add Variable
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
