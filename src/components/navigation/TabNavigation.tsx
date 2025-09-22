import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Monitor, Layers, Bookmark } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setActiveTab } from '../../features/app/appSlice';

const tabs = [
  {
    id: 'builder' as const,
    name: 'Конструктор',
    icon: Monitor,
    description: 'Создание макетов на холсте',
  },
  {
    id: 'widgets' as const,
    name: 'Компоненты',
    icon: Layers,
    description: 'Библиотека элементов интерфейса',
  },
  {
    id: 'templates' as const,
    name: 'Макеты',
    icon: Bookmark,
    description: 'Сохраненные шаблоны',
  },
];

export function TabNavigation() {
  const dispatch = useAppDispatch();
  const { activeTab } = useAppSelector(state => state.app);

  return (
    <nav className="bg-white border-b border-border px-6">
      <div className="flex h-14 items-center">
        {/* Logo/Brand */}
        <div className="flex items-center gap-3 mr-8">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <div>
            <h1 className="font-semibold text-foreground">Конструктор</h1>
          </div>
        </div>

        <Separator orientation="vertical" className="h-8 mr-6" />

        {/* Tab navigation */}
        <div className="flex items-center space-x-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <Button
                key={tab.id}
                variant={isActive ? 'default' : 'ghost'}
                onClick={() => dispatch(setActiveTab(tab.id))}
                className={`flex items-center gap-2 px-4 py-2 h-10 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-primary text-white shadow-md' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium">{tab.name}</span>
              </Button>
            );
          })}
        </div>

        {/* Right side actions */}
        <div className="ml-auto flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            {activeTab === 'builder' && 'Перетащите элементы на холст'}
            {activeTab === 'widgets' && 'Выберите компонент для добавления'}
            {activeTab === 'templates' && 'Управление сохраненными макетами'}
          </div>
        </div>
      </div>
    </nav>
  );
}