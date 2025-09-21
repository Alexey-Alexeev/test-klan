import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, MousePointer, Type, Edit3, Image, Layout } from 'lucide-react';
import { widgetDefinitions } from '../lib/widgetDefaults';
import { WidgetDefinition } from '../types';

const iconMap = {
  MousePointer,
  Type,
  Edit3,
  Image,
  Layout,
};

export function WidgetsTab() {
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
        </div>

        {/* Widgets grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredWidgets.map((widget) => {
            const Icon = iconMap[widget.icon as keyof typeof iconMap];
            
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
                      <Icon className="h-5 w-5 text-primary" />
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
                  <CardDescription className="text-sm">
                    {widget.description}
                  </CardDescription>
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
      </div>
    </div>
  );
}