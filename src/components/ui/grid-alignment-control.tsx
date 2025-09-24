import React from 'react';
import { cn } from '@/lib/utils';

interface GridAlignmentControlProps {
  xValue: 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly';
  yValue: 'start' | 'center' | 'end';
  onXChange: (value: 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly') => void;
  onYChange: (value: 'start' | 'center' | 'end') => void;
  direction: 'row' | 'column';
  className?: string;
}

export function GridAlignmentControl({ xValue, yValue, onXChange, onYChange, direction, className }: GridAlignmentControlProps) {
  // Создаем расширенную сетку с дополнительными опциями для горизонтального выравнивания
  const gridPositions = [
    // Первая строка - базовые выравнивания
    { x: 'start', y: 'start', label: direction === 'column' ? 'Верх-лево' : 'Лево-верх', icon: '↖' },
    { x: 'center', y: 'start', label: direction === 'column' ? 'Верх-центр' : 'Центр-верх', icon: '↑' },
    { x: 'end', y: 'start', label: direction === 'column' ? 'Верх-право' : 'Право-верх', icon: '↗' },
    
    // Вторая строка - центровые выравнивания
    { x: 'start', y: 'center', label: direction === 'column' ? 'Центр-лево' : 'Лево-центр', icon: '←' },
    { x: 'center', y: 'center', label: 'Центр', icon: '●' },
    { x: 'end', y: 'center', label: direction === 'column' ? 'Центр-право' : 'Право-центр', icon: '→' },
    
    // Третья строка - нижние выравнивания
    { x: 'start', y: 'end', label: direction === 'column' ? 'Низ-лево' : 'Лево-низ', icon: '↙' },
    { x: 'center', y: 'end', label: direction === 'column' ? 'Низ-центр' : 'Центр-низ', icon: '↓' },
    { x: 'end', y: 'end', label: direction === 'column' ? 'Низ-право' : 'Право-низ', icon: '↘' },
    
    // Дополнительные опции для горизонтального распределения (только для row направления)
    ...(direction === 'row' ? [
      { x: 'space-between', y: 'start', label: 'Между-верх', icon: '⇄' },
      { x: 'space-around', y: 'center', label: 'Вокруг-центр', icon: '⇉' },
      { x: 'space-evenly', y: 'end', label: 'Равномерно-низ', icon: '⇊' }
    ] : [])
  ];

  const getCurrentPosition = () => {
    return gridPositions.find(pos => pos.x === xValue && pos.y === yValue);
  };

  const currentPosition = getCurrentPosition();

  // Определяем количество колонок в зависимости от направления
  const gridCols = direction === 'row' ? 4 : 3; // Для row показываем 4 колонки (9 + 3 дополнительных), для column - 3 колонки (9 базовых)
  
  return (
    <div className={cn("space-y-3", className)}>
      <div className="text-sm font-medium">Выравнивание контента</div>
      <div className={cn("grid gap-1", `grid-cols-${gridCols}`)}>
        {gridPositions.map((position, index) => {
          const isSelected = position.x === xValue && position.y === yValue;
          return (
            <button
              key={index}
              onClick={() => {
                onXChange(position.x);
                onYChange(position.y);
              }}
              className={cn(
                "w-8 h-8 border rounded flex items-center justify-center text-xs transition-colors",
                isSelected 
                  ? "bg-blue-100 border-blue-300 text-blue-700" 
                  : "border-gray-200 text-gray-400 hover:bg-gray-50"
              )}
              title={position.label}
            >
              {position.icon}
            </button>
          );
        })}
      </div>
      
      {currentPosition && (
        <div className="text-xs text-gray-600 text-center">
          {currentPosition.label}
        </div>
      )}
    </div>
  );
}
