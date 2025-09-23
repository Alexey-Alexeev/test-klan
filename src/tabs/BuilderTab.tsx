import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Code } from 'lucide-react';
import * as icons from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loadWidgets, addWidget } from '../features/canvas/canvasSlice';
import { widgetDefinitions, createDefaultWidget } from '../lib/widgetDefaults';
import { Toolbar } from '../components/builder/Toolbar';
import { Canvas } from '../components/builder/Canvas';
import { PropertiesPanel } from '../components/builder/PropertiesPanel';

export function BuilderTab() {
  const dispatch = useAppDispatch();
  const { widgets, canvasSize } = useAppSelector(state => state.canvas);
  const { viewMode } = useAppSelector(state => state.app);
  
  const mainAreaRef = useRef<HTMLDivElement>(null);
  const [jsonValue, setJsonValue] = useState('');
  const [jsonError, setJsonError] = useState('');

  const handleJsonImport = () => {
    try {
      const parsed = JSON.parse(jsonValue);
      if (Array.isArray(parsed)) {
        dispatch(loadWidgets(parsed));
        setJsonError('');
      } else {
        setJsonError('JSON должен быть массивом виджетов');
      }
    } catch (error) {
      setJsonError('Неверный формат JSON');
    }
  };


  const exportJson = () => {
    return JSON.stringify(widgets, null, 2);
  };

  const handleWidgetClick = (widgetType: string) => {
    // Добавляем виджет в центр текущего холста
    const def = widgetDefinitions.find((d) => d.type === widgetType);
    const defSize = def?.defaultSize || { width: 100, height: 40 };
    const position = {
      x: Math.max(0, Math.round((canvasSize.width - defSize.width) / 2)),
      y: Math.max(0, Math.round((canvasSize.height - defSize.height) / 2)),
    };
    const widget = createDefaultWidget(widgetType, position);
    if (widget) dispatch(addWidget(widget));
  };

  // Update JSON when widgets change and in JSON mode
  useState(() => {
    if (viewMode === 'json') {
      setJsonValue(exportJson());
    }
  });

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Toolbar */}
      <Toolbar />
      
      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Widgets Palette Sidebar */}
        {viewMode === 'design' && (
          <div className="w-64 border-r border-border bg-card p-4 overflow-y-auto">
            <h3 className="font-semibold text-sm mb-4">Компоненты</h3>
            <div className="grid grid-cols-2 gap-2">
              {widgetDefinitions.map((widget) => {
                const IconComponent = icons[widget.icon as keyof typeof icons] as React.ComponentType<any>;
                
                return (
                  <div
                    key={widget.type}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('widget-type', widget.type);
                    }}
                    onClick={() => handleWidgetClick(widget.type)}
                    className="p-3 border border-border rounded-lg cursor-pointer hover:bg-accent/50 hover:border-primary/50 transition-all duration-200 active:scale-95"
                  >
                    <div className="flex flex-col items-center gap-2 text-center">
                      {IconComponent && (
                        <IconComponent className="h-6 w-6 text-muted-foreground" />
                      )}
                      <span className="text-xs font-medium text-foreground">
                        {widget.name}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-6 p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground text-center">
                Кликните или перетащите компонент на холст для добавления
              </p>
            </div>
          </div>
        )}
        
        {/* Canvas or JSON editor */}
        <div ref={mainAreaRef} className="flex-1 flex flex-col">
          {viewMode === 'design' ? (
            <Canvas viewportContainerRef={mainAreaRef} />
          ) : (
            <div className="flex-1 p-6 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold">JSON Редактор</h2>
                  <p className="text-sm text-muted-foreground">
                    Редактируйте структуру виджетов напрямую в формате JSON
                  </p>
                </div>
                <Button onClick={handleJsonImport} disabled={!jsonValue.trim()}>
                  <Code className="h-4 w-4 mr-2" />
                  Применить изменения
                </Button>
              </div>
              
              {jsonError && (
                <div className="text-sm text-destructive bg-destructive/10 p-2 rounded border">
                  {jsonError}
                </div>
              )}
              
              <Textarea
                value={jsonValue || exportJson()}
                onChange={(e) => {
                  setJsonValue(e.target.value);
                  setJsonError('');
                }}
                className="font-mono text-sm min-h-[400px] custom-scrollbar"
                placeholder="JSON структура виджетов..."
              />
              
              <div className="text-xs text-muted-foreground">
                Количество виджетов: {widgets.length}
              </div>
            </div>
          )}
        </div>

        {/* Properties panel */}
        {viewMode === 'design' && <PropertiesPanel />}
      </div>
    </div>
  );
}