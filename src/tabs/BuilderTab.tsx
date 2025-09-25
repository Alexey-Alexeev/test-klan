import { useEffect, useLayoutEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Code, Copy } from 'lucide-react';
import * as icons from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { useToast } from '../hooks/use-toast';
import { loadWidgets, addWidget, setCanvasSize, setSelectedPreset } from '../features/canvas/canvasSlice';
import { widgetDefinitions, createDefaultWidget } from '../lib/widgetDefaults';
import { convertWidgetsToScreenJson, convertScreenJsonToWidgets } from '../lib/jsonConverter';
import { Toolbar } from '../components/builder/Toolbar';
import { Canvas } from '../components/builder/Canvas';
import { PropertiesPanel } from '../components/builder/PropertiesPanel';
import { ComponentsTree } from '../components/builder/ComponentsTree';

export function BuilderTab() {
  const dispatch = useAppDispatch();
  const { widgets, canvasSize, selectedPreset } = useAppSelector(state => state.canvas);
  const { viewMode } = useAppSelector(state => state.app);
  const { toast } = useToast();
  
  const mainAreaRef = useRef<HTMLDivElement>(null);
  const [jsonValue, setJsonValue] = useState('');
  const [jsonError, setJsonError] = useState('');

  const handleJsonImport = () => {
    try {
      const parsed = JSON.parse(jsonValue);
      
      // Проверяем, является ли это новой структурой экрана
      if (parsed.type === 'screen' && parsed.typeParams && parsed.typeParams.content) {
        try {
          const result = convertScreenJsonToWidgets(parsed);
          dispatch(loadWidgets(result.widgets));
          
          // Обновляем размер canvas и выбранное устройство, если они есть в JSON
          if (result.canvasSize) {
            dispatch(setCanvasSize(result.canvasSize));
          }
          if (result.selectedPreset) {
            dispatch(setSelectedPreset(result.selectedPreset));
          }
          
          setJsonError('');
        } catch (error) {
          console.error('Ошибка при конвертации JSON экрана:', error);
          setJsonError('Ошибка при конвертации JSON экрана');
        }
      } else if (Array.isArray(parsed)) {
        // Старая структура - массив виджетов
        dispatch(loadWidgets(parsed));
        setJsonError('');
      } else {
        setJsonError('JSON должен быть структурой экрана или массивом виджетов');
      }
    } catch (error) {
      setJsonError('Неверный формат JSON');
    }
  };

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(jsonValue || exportJson());
      toast({
        title: "JSON скопирован",
        description: "JSON структура скопирована в буфер обмена",
        duration: 2000,
      });
    } catch (error) {
      console.error('Ошибка при копировании JSON:', error);
      toast({
        title: "Ошибка копирования",
        description: "Не удалось скопировать JSON в буфер обмена",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const exportJson = useCallback(() => {
    try {
      console.log('exportJson called with:', { canvasSize, selectedPreset });
      // Преобразуем виджеты в новую структуру экрана
      const screenJson = convertWidgetsToScreenJson(widgets, canvasSize, selectedPreset);
      console.log('Generated screenJson:', screenJson);
      return JSON.stringify(screenJson, null, 2);
    } catch (error) {
      console.error('Ошибка при экспорте JSON:', error);
      return JSON.stringify({ error: 'Ошибка при экспорте JSON' }, null, 2);
    }
  }, [widgets, canvasSize, selectedPreset]);

  const handleWidgetClick = (widgetType: string) => {
    // Добавляем виджет в центр текущего холста
    const def = widgetDefinitions.find((d) => d.type === widgetType);
    const defSize = def?.defaultSize || { width: 100, height: 40 };
    const position = {
      x: Math.max(0, Math.round((canvasSize.width - defSize.width) / 2)),
      y: Math.max(44, Math.round((canvasSize.height - defSize.height) / 2)), // Размещаем в main зоне
    };
    const widget = createDefaultWidget(widgetType, position);
    if (widget) dispatch(addWidget(widget));
  };

  // Вычисляем JSON с помощью useMemo для лучшей производительности
  const computedJson = useMemo(() => {
    console.log('Computing JSON with:', { 
      widgetsCount: widgets.length, 
      canvasSize, 
      selectedPreset 
    });
    return exportJson();
  }, [widgets, canvasSize, selectedPreset, exportJson]);

  // Update JSON when computedJson changes
  useLayoutEffect(() => {
    console.log('Setting JSON value from computedJson');
    setJsonValue(computedJson);
  }, [computedJson]);

  // Дополнительный useEffect для обработки изменений selectedPreset с задержкой
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      console.log('Delayed JSON update for selectedPreset:', selectedPreset);
      setJsonValue(exportJson());
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [selectedPreset, exportJson]);

  // Еще один useEffect с requestAnimationFrame для гарантии обновления
  useEffect(() => {
    const rafId = requestAnimationFrame(() => {
      console.log('RAF JSON update for selectedPreset:', selectedPreset);
      setJsonValue(exportJson());
    });
    
    return () => cancelAnimationFrame(rafId);
  }, [selectedPreset, exportJson]);

  // Финальный useEffect с длительной задержкой для гарантии обновления
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      console.log('Final JSON update for selectedPreset:', selectedPreset);
      setJsonValue(exportJson());
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [selectedPreset, exportJson]);

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Toolbar */}
      <Toolbar />
      
      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar with Components Tree and Widgets Palette */}
        {viewMode === 'design' && (
          <div className="w-96 border-r border-border bg-card flex flex-col">
            {/* Components Tree */}
            <div className="flex-1 p-4 border-b min-h-[400px]">
              <ComponentsTree />
            </div>
            
            {/* Widgets Palette */}
            <div className="p-4 overflow-y-auto">
              <h3 className="font-semibold text-sm mb-4">Компоненты</h3>
              <div className="grid grid-cols-2 gap-2">
                {widgetDefinitions.map((widget) => {
                  const IconComponent = icons[widget.icon as keyof typeof icons] as React.ComponentType<any>;
                  const isButton = widget.type === 'button';
                  
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
                        {isButton ? (
                          <Button variant="dsPrimary" className="h-7 px-3 text-[11px]">Кнопка</Button>
                        ) : (
                          IconComponent && (
                            <IconComponent className="h-6 w-6 text-muted-foreground" />
                          )
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
          </div>
        )}
        
        {/* Canvas or JSON editor */}
        <div ref={mainAreaRef} className="flex-1 flex flex-col">
          {viewMode === 'design' ? (
            <Canvas viewportContainerRef={mainAreaRef} />
          ) : (
            <div className="flex-1 p-6 space-y-4 overflow-y-auto">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold">JSON Редактор</h2>
                  <p className="text-sm text-muted-foreground">
                    Редактируйте структуру экрана в формате JSON. Поддерживается новая структура экрана и старый формат виджетов.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCopyJson} variant="outline">
                    <Copy className="h-4 w-4 mr-2" />
                    Копировать JSON
                  </Button>
                  <Button onClick={handleJsonImport} disabled={!jsonValue.trim()}>
                    <Code className="h-4 w-4 mr-2" />
                    Применить изменения
                  </Button>
                </div>
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
                className="font-mono text-sm min-h-[600px] custom-scrollbar"
                placeholder="JSON структура экрана или виджетов..."
              />
              
              <div className="text-xs text-muted-foreground">
                Количество виджетов: {widgets.length}
              </div>
              
              {/* Подсказки для JSON значений */}
              <div className="mt-4 p-3 bg-muted/50 rounded-lg border">
                <h4 className="text-sm font-medium mb-2">Подсказки для JSON значений:</h4>
                <div className="space-y-3 text-xs">
                  <div>
                    <strong>direction:</strong>
                    <div className="mt-1 text-muted-foreground">
                      <code>"row"</code> (горизонтально), <code>"column"</code> (вертикально)
                    </div>
                  </div>
                  <div>
                    <strong>alignment:</strong>
                    <div className="mt-1 text-muted-foreground">
                      <code>"top-left"</code>, <code>"top-center"</code>, <code>"top-right"</code>,<br/>
                      <code>"center-left"</code>, <code>"center"</code>, <code>"center-right"</code>,<br/>
                      <code>"bottom-left"</code>, <code>"bottom-center"</code>, <code>"bottom-right"</code>
                    </div>
                  </div>
                  <div>
                    <strong>widthMode / heightMode:</strong>
                    <div className="mt-1 text-muted-foreground">
                      <code>"fill"</code> (заполнить), <code>"fixed"</code> (фиксированный), <code>"auto"</code> (авто)
                    </div>
                  </div>
                  <div>
                    <strong>variant (для кнопок):</strong>
                    <div className="mt-1 text-muted-foreground">
                      <code>"primary"</code>, <code>"secondary"</code>, <code>"outline"</code>, <code>"ghost"</code>
                    </div>
                  </div>
                  <div>
                    <strong>disabled:</strong>
                    <div className="mt-1 text-muted-foreground">
                      <code>true</code> (отключено), <code>false</code> (активно)
                    </div>
                  </div>
                  <div>
                    <strong>style свойства:</strong>
                    <div className="mt-1 text-muted-foreground">
                      <code>backgroundColor</code>, <code>color</code>, <code>fontSize</code>, <code>fontWeight</code>,<br/>
                      <code>padding</code>, <code>margin</code>, <code>borderRadius</code>, <code>border</code>
                    </div>
                  </div>
                </div>
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