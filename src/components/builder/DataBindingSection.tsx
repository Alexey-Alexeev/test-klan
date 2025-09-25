import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Database, X, Info } from 'lucide-react';
import { FieldSelector } from './FieldSelector';
import { getAvailableCollections, getFieldsForCollection, getRecommendedAlias } from '../../lib/dataSchemas';
import { IWidget } from '../../types';

interface DataBindingSectionProps {
  widget: IWidget;
  onUpdate: (updates: Partial<IWidget>) => void;
  allWidgets?: IWidget[];
}

export function DataBindingSection({ widget, onUpdate, allWidgets = [] }: DataBindingSectionProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Find parent container with dataSource
  const findParentDataSource = (widgetId: string): any => {
    const currentWidget = allWidgets.find(w => w.id === widgetId);
    
    if (!currentWidget) return null;
    
    // If this widget has dataSource, return it
    if (currentWidget.type === 'container' && (currentWidget as any).props.dataSource) {
      return (currentWidget as any).props.dataSource;
    }
    
    // If this widget has a parent, check parent
    if (currentWidget.parentId) {
      return findParentDataSource(currentWidget.parentId);
    }
    
    return null;
  };
  
  const parentDataSource = findParentDataSource(widget.id);
  
  const handleDataSourceChange = (collection: string) => {
    if (collection && collection !== 'none') {
      const recommendedAlias = getRecommendedAlias(collection);
      onUpdate({
        props: {
          ...widget.props,
          dataSource: {
            type: 'table',
            collection,
            itemAlias: recommendedAlias
          }
        }
      });
    } else {
      onUpdate({
        props: {
          ...widget.props,
          dataSource: undefined
        }
      });
    }
  };

  const handleBindingChange = (field: string, value: string) => {
    onUpdate({
      props: {
        ...widget.props,
        [field]: value && value !== 'none' ? value : undefined
      }
    });
  };

  const handleItemAliasChange = (itemAlias: string) => {
    if (widget.props.dataSource) {
      onUpdate({
        props: {
          ...widget.props,
          dataSource: {
            ...widget.props.dataSource,
            itemAlias
          }
        }
      });
    }
  };

  const availableCollections = getAvailableCollections();
  const currentDataSource = (widget.props as any).dataSource;
  const availableFields = currentDataSource ? getFieldsForCollection(currentDataSource.collection) : [];
  
  
  // For text and checkbox widgets, use parent dataSource if available
  const effectiveDataSource = widget.type === 'container' ? currentDataSource : parentDataSource;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <Database className="h-4 w-4" />
          Привязка данных
        </h3>
        {currentDataSource && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDataSourceChange('')}
            className="text-red-600 hover:text-red-700"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Separator />

      {/* Container Widget - Data Source */}
      {widget.type === 'container' && (
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="text-sm text-blue-800">
              <strong>Контейнер с источником данных</strong><br/>
              Этот контейнер будет повторяться для каждого элемента в коллекции. 
              Дочерние элементы могут привязываться к полям из этого источника.
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium">Источник данных</Label>
            <Select
              value={currentDataSource?.collection || 'none'}
              onValueChange={handleDataSourceChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Выберите источник данных" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Без источника данных</SelectItem>
                {availableCollections.map(collection => (
                  <SelectItem key={collection.value} value={collection.value}>
                    {collection.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {currentDataSource && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Псевдоним элемента</Label>
              <Input
                value={currentDataSource.itemAlias || 'item'}
                onChange={(e) => handleItemAliasChange(e.target.value)}
                placeholder="item"
                className="w-full"
              />
            </div>
          )}

          {currentDataSource && availableFields.length > 0 && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  Доступные поля для {currentDataSource.collection}:
                </span>
              </div>
              <div className="space-y-1">
                {availableFields.map(field => (
                  <div key={field.name} className="text-xs text-blue-700">
                    • {field.name} ({field.type})
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Text Widget - Binding */}
      {widget.type === 'text' && (
        <div className="space-y-4">
          {effectiveDataSource && (
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="text-sm text-green-800">
                <strong>Доступны поля из родительского контейнера:</strong><br/>
                {effectiveDataSource.collection} → {effectiveDataSource.itemAlias}
              </div>
            </div>
          )}
          
          <FieldSelector
            dataSource={effectiveDataSource}
            value={(widget.props as any).binding || 'none'}
            onChange={(value) => handleBindingChange('binding', value)}
            label="Поле данных"
            placeholder="Выберите поле для текста"
          />
          
          {!currentDataSource && (
            <div className="p-3 bg-amber-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-amber-600" />
                <span className="text-sm text-amber-800">
                  Для привязки данных сначала настройте источник данных в родительском контейнере
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Checkbox Widget - Binding and ValueBinding */}
      {widget.type === 'checkbox' && (
        <div className="space-y-4">
          {effectiveDataSource && (
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="text-sm text-green-800">
                <strong>Доступны поля из родительского контейнера:</strong><br/>
                {effectiveDataSource.collection} → {effectiveDataSource.itemAlias}
              </div>
            </div>
          )}
          
          <FieldSelector
            dataSource={effectiveDataSource}
            value={(widget.props as any).binding || 'none'}
            onChange={(value) => handleBindingChange('binding', value)}
            label="Поле лейбла"
            placeholder="Выберите поле для лейбла"
          />
          
          <FieldSelector
            dataSource={effectiveDataSource}
            value={(widget.props as any).valueBinding || 'none'}
            onChange={(value) => handleBindingChange('valueBinding', value)}
            label="Поле состояния"
            placeholder="Выберите поле для состояния"
          />
          
          {!effectiveDataSource && (
            <div className="p-3 bg-amber-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-amber-600" />
                <span className="text-sm text-amber-800">
                  Для привязки данных сначала настройте источник данных в родительском контейнере
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Advanced Settings */}
      <div className="space-y-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full justify-start"
        >
          {showAdvanced ? 'Скрыть' : 'Показать'} дополнительные настройки
        </Button>
        
        {showAdvanced && (
          <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
            <div className="text-xs text-gray-600">
              <div>• Источник данных: {effectiveDataSource ? `${effectiveDataSource.collection} → ${effectiveDataSource.itemAlias}` : 'Не настроен'}</div>
              {widget.type === 'container' ? (
                <div>• Роль: Предоставляет данные для дочерних элементов</div>
              ) : (
                <>
                  <div>• Привязка: {(widget.props as any).binding || 'Не настроена'}</div>
                  {widget.type === 'checkbox' && (
                    <div>• Привязка состояния: {(widget.props as any).valueBinding || 'Не настроена'}</div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
