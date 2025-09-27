import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search } from 'lucide-react';
import * as icons from 'lucide-react';
import { Button } from '@/components/ui/button';
import { widgetDefinitions } from '../lib/widgetDefaults';
import { WidgetDefinition } from '../types';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loadUserWidgets, deleteUserWidget } from '../features/userWidgets/userWidgetsSlice';
import { loadWidgets, setCanvasSize, setSelectedPreset } from '../features/widgetBuilder/widgetBuilderSlice';
import { setActiveTab } from '../features/app/appSlice';
import { UserWidgetsList } from '../components/ui/user-widgets-list';

const getIcon = (name: string): React.ComponentType<any> => {
  const Icon = icons[name as keyof typeof icons] as unknown as React.ComponentType<any> | undefined;
  return Icon || (icons.Box as unknown as React.ComponentType<any>);
};

export function WidgetsTab() {
  const dispatch = useAppDispatch();
  const { widgets: userWidgets } = useAppSelector(state => state.userWidgets);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredWidgets = widgetDefinitions.filter(widget => {
    const matchesSearch = widget.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         widget.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || widget.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDragStart = (e: React.DragEvent, widgetType: string) => {
    e.dataTransfer.setData('widget-type', widgetType);
  };

  // Загружаем пользовательские виджеты при монтировании компонента
  useEffect(() => {
    dispatch(loadUserWidgets());
  }, [dispatch]);

  const handleEditUserWidget = (widget: any) => {
    // Загружаем виджет в конструктор и переходим к редактированию
    dispatch(loadWidgets(widget.widgets));
    dispatch(setCanvasSize(widget.canvasSize));
    dispatch(setSelectedPreset(widget.selectedPreset));
    dispatch(setActiveTab('widgetBuilder'));
    // Устанавливаем ID виджета для редактирования в localStorage
    localStorage.setItem('editingWidgetId', widget.id);
  };

  const handleDeleteUserWidget = (id: string) => {
    dispatch(deleteUserWidget(id));
  };

  const categories = [
    { id: 'all', name: 'Все компоненты' },
    { id: 'basic', name: 'Базовые' },
    { id: 'form', name: 'Формы' },
    { id: 'layout', name: 'Макеты' },
    { id: 'media', name: 'Медиа' },
  ];

  return (
    <div className="flex-1 p-6 bg-muted/20">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Библиотека компонентов</h1>
            <p className="text-muted-foreground">Перетащите элементы на холст для создания интерфейса</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="library" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="library">Библиотека</TabsTrigger>
            <TabsTrigger value="created">Созданные виджеты</TabsTrigger>
          </TabsList>
          
          <TabsContent value="library" className="space-y-6">
            {/* Search and filters */}
            <div className="flex gap-4">
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

            {/* Widgets grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredWidgets.map((widget) => {
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
                        <Button variant="dsPrimary" className="h-6 px-2 text-[10px]">Кнопка</Button>
                      ) : (
                        <Icon className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-base">{widget.name}</CardTitle>
                      <div className="text-xs text-muted-foreground capitalize">
                        {widget.category === 'basic' && 'Базовый'}
                        {widget.category === 'form' && 'Форма'}
                        {widget.category === 'layout' && 'Макет'}
                        {widget.category === 'media' && 'Медиа'}
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
                      <div className="text-xs font-medium text-muted-foreground">Основные</div>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="dsPrimary" className="h-8 px-3 text-xs">Primary</Button>
                        <Button variant="accent" className="h-8 px-3 text-xs">Accent</Button>
                        <Button variant="pay" className="h-8 px-3 text-xs">Pay</Button>
                        <Button variant="success" className="h-8 px-3 text-xs">Success</Button>
                        <Button variant="danger" className="h-8 px-3 text-xs">Danger</Button>
                      </div>
                      <div className="text-xs font-medium text-muted-foreground mt-2">Второстепенные</div>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="secondaryDefault" className="h-8 px-3 text-xs">Default secondary</Button>
                        <Button variant="secondaryAccent" className="h-8 px-3 text-xs">Accent secondary</Button>
                        <Button variant="secondaryPay" className="h-8 px-3 text-xs">Pay secondary</Button>
                      </div>
                      <div className="text-xs font-medium text-muted-foreground mt-2">Третичные</div>
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

            {filteredWidgets.length === 0 && (
              <div className="text-center py-12">
                <div className="text-muted-foreground">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">Компоненты не найдены</p>
                  <p>Попробуйте изменить поисковый запрос или фильтры</p>
                </div>
              </div>
            )}

            {/* Usage hint */}
            <div className="mt-8 p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium mt-0.5">
                  i
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">Как использовать:</p>
                  <p className="text-sm text-muted-foreground">
                    Перетащите любой компонент из библиотеки на холст конструктора. 
                    После размещения вы сможете настроить его свойства в панели справа.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="created" className="space-y-6">
            <UserWidgetsList
              widgets={userWidgets}
              onEdit={handleEditUserWidget}
              onDelete={handleDeleteUserWidget}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}