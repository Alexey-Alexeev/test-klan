import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Puzzle, Package } from 'lucide-react';
import * as icons from 'lucide-react';
import { Button } from '@/components/ui/button';
import { widgetDefinitions } from '../lib/widgetDefaults';
import { WidgetDefinition, BDUIWidgetDefinition } from '../types';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addWidget, updateWidget, deleteWidget } from '../features/widgets/widgetsSlice';
import { WidgetRegistry } from '../components/ui/widget-registry';
import { WidgetBuilder } from '../components/builder/WidgetBuilder';
import { useToast } from '../hooks/use-toast';

const getIcon = (name: string): React.ComponentType<any> => {
  const Icon = icons[name as keyof typeof icons] as unknown as React.ComponentType<any> | undefined;
  return Icon || (icons.Box as unknown as React.ComponentType<any>);
};

export function WidgetsTab() {
  const dispatch = useAppDispatch();
  const { registry: customWidgets } = useAppSelector(state => state.widgets);
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showWidgetBuilder, setShowWidgetBuilder] = useState(false);
  const [editingWidget, setEditingWidget] = useState<BDUIWidgetDefinition | undefined>();
  const [activeView, setActiveView] = useState<'basic' | 'custom'>('basic');

  const filteredBasicWidgets = widgetDefinitions.filter(widget => {
    const matchesSearch = widget.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         widget.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || widget.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDragStart = (e: React.DragEvent, widgetType: string) => {
    e.dataTransfer.setData('widget-type', widgetType);
  };

  const handleCreateWidget = () => {
    setEditingWidget(undefined);
    setShowWidgetBuilder(true);
  };

  const handleEditWidget = (widgetId: string) => {
    const widget = customWidgets[widgetId];
    if (widget) {
      setEditingWidget(widget);
      setShowWidgetBuilder(true);
    }
  };

  const handleDeleteWidget = (widgetId: string) => {
    dispatch(deleteWidget(widgetId));
    toast({
      title: 'Виджет удален',
      description: 'Виджет был удален из реестра.',
    });
  };

  const handleDuplicateWidget = (widgetId: string) => {
    const widget = customWidgets[widgetId];
    if (widget) {
      const duplicatedWidget: BDUIWidgetDefinition = {
        ...widget,
        widgetId: `${widget.widgetId}_copy_${Date.now()}`,
        meta: {
          ...widget.meta,
          name: `${widget.meta.name} (Copy)`,
        },
      };
      dispatch(addWidget(duplicatedWidget));
      toast({
        title: 'Виджет дублирован',
        description: 'Создана копия виджета.',
      });
    }
  };

  const handleImportWidget = (widget: BDUIWidgetDefinition) => {
    dispatch(addWidget(widget));
    toast({
      title: 'Виджет импортирован',
      description: `Виджет "${widget.meta.name}" добавлен в реестр.`,
    });
  };

  const handleExportWidget = (widgetId: string) => {
    const widget = customWidgets[widgetId];
    if (widget) {
      const jsonString = JSON.stringify(widget, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `${widget.widgetId}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Виджет экспортирован',
        description: 'JSON виджета загружен.',
      });
    }
  };

  const handlePreviewWidget = (widgetId: string) => {
    // TODO: Implement widget preview
    toast({
      title: 'Предварительный просмотр',
      description: 'Предварительный просмотр виджета скоро будет доступен!',
    });
  };

  const handleSaveWidget = (widget: BDUIWidgetDefinition) => {
    if (editingWidget) {
      dispatch(updateWidget({ id: widget.widgetId, updates: widget }));
      toast({
        title: 'Виджет обновлен',
        description: `Виджет "${widget.meta.name}" был обновлен.`,
      });
    } else {
      dispatch(addWidget(widget));
      toast({
        title: 'Виджет создан',
        description: `Виджет "${widget.meta.name}" был создан.`,
      });
    }
    setShowWidgetBuilder(false);
    setEditingWidget(undefined);
  };

  const categories = [
    { id: 'all', name: 'Все Компоненты' },
    { id: 'basic', name: 'Базовые' },
    { id: 'form', name: 'Формы' },
    { id: 'layout', name: 'Макет' },
    { id: 'media', name: 'Медиа' },
  ];

  return (
    <div className="flex-1 flex flex-col h-full">
      <Tabs value={activeView} onValueChange={(value) => setActiveView(value as 'basic' | 'custom')} className="h-full flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Библиотека Виджетов</h1>
              <p className="text-muted-foreground">Перетащите компоненты на холст или управляйте пользовательскими виджетами</p>
            </div>
            
            <TabsList className="grid w-[300px] grid-cols-2">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                <Package size={16} />
                Базовые Компоненты
              </TabsTrigger>
              <TabsTrigger value="custom" className="flex items-center gap-2">
                <Puzzle size={16} />
                Пользовательские Виджеты
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="basic" className="flex-1 overflow-hidden m-0">
          <div className="p-6 h-full flex flex-col">
            {/* Search and filters */}
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Поиск компонентов..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex rounded-lg bg-white border p-1">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-primary text-white'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Basic widgets grid */}
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredBasicWidgets.map((widget) => {
                  const Icon = getIcon(widget.icon);
                  const isButton = widget.type === 'button';
                  
                  return (
                    <Card
                      key={widget.type}
                      className="cursor-move hover:shadow-md transition-all duration-200 group border-2 border-transparent hover:border-primary/20"
                      draggable
                      onDragStart={(e) => handleDragStart(e, widget.type)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            {isButton ? (
                              <Button variant="dsPrimary" className="h-6 px-2 text-[10px]">Button</Button>
                            ) : (
                              <Icon className="h-5 w-5 text-primary" />
                            )}
                          </div>
                          <div>
                            <CardTitle className="text-base">{widget.name}</CardTitle>
                            <div className="text-xs text-muted-foreground capitalize">
                              {widget.category}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <CardDescription className="text-sm mb-3">
                          {widget.description}
                        </CardDescription>

                        {widget.type === 'button' && (
                          <div className="space-y-2">
                            <div className="text-xs font-medium text-muted-foreground">Primary</div>
                            <div className="flex flex-wrap gap-2">
                              <Button variant="dsPrimary" className="h-8 px-3 text-xs">Primary</Button>
                              <Button variant="accent" className="h-8 px-3 text-xs">Accent</Button>
                              <Button variant="pay" className="h-8 px-3 text-xs">Pay</Button>
                              <Button variant="success" className="h-8 px-3 text-xs">Success</Button>
                              <Button variant="danger" className="h-8 px-3 text-xs">Danger</Button>
                            </div>
                            <div className="text-xs font-medium text-muted-foreground mt-2">Secondary</div>
                            <div className="flex flex-wrap gap-2">
                              <Button variant="secondaryDefault" className="h-8 px-3 text-xs">Default</Button>
                              <Button variant="secondaryAccent" className="h-8 px-3 text-xs">Accent</Button>
                              <Button variant="secondaryPay" className="h-8 px-3 text-xs">Pay</Button>
                            </div>
                            <div className="text-xs font-medium text-muted-foreground mt-2">Tertiary</div>
                            <div className="flex flex-wrap gap-2">
                              <Button variant="ghost" className="h-8 px-3 text-xs">Ghost</Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {filteredBasicWidgets.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-muted-foreground">
                    <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">No components found</p>
                    <p>Try adjusting your search or filters</p>
                  </div>
                </div>
              )}
            </div>

            {/* Usage hint */}
            <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium mt-0.5">
                  i
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">Как использовать:</p>
                  <p className="text-sm text-muted-foreground">
                    Перетащите любой компонент из библиотеки на холст конструктора. 
                    После размещения вы можете настроить его свойства, привязки данных и действия в правой панели.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="custom" className="flex-1 overflow-hidden m-0">
          <WidgetRegistry
            widgets={customWidgets}
            onCreateWidget={handleCreateWidget}
            onEditWidget={handleEditWidget}
            onDeleteWidget={handleDeleteWidget}
            onDuplicateWidget={handleDuplicateWidget}
            onImportWidget={handleImportWidget}
            onExportWidget={handleExportWidget}
            onPreviewWidget={handlePreviewWidget}
          />
        </TabsContent>
      </Tabs>

      {/* Widget Builder Modal */}
      <WidgetBuilder
        widget={editingWidget}
        isOpen={showWidgetBuilder}
        onSave={handleSaveWidget}
        onCancel={() => {
          setShowWidgetBuilder(false);
          setEditingWidget(undefined);
        }}
      />
    </div>
  );
}