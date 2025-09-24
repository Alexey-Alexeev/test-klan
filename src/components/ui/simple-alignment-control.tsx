import React from 'react';
import { cn } from '@/lib/utils';

interface SimpleAlignmentControlProps {
  value: 'top' | 'center' | 'bottom';
  onChange: (value: 'top' | 'center' | 'bottom') => void;
  direction: 'row' | 'column';
  className?: string;
}

export function SimpleAlignmentControl({ value, onChange, direction, className }: SimpleAlignmentControlProps) {
  // Адаптивные опции в зависимости от ориентации
  const getAlignmentOptions = () => {
    if (direction === 'column') {
      // Для вертикальной ориентации: лево, центр, право
      return [
        { value: 'top', label: 'Лево', icon: '←' },
        { value: 'center', label: 'Центр', icon: '↔' },
        { value: 'bottom', label: 'Право', icon: '→' }
      ];
    } else {
      // Для горизонтальной ориентации: верх, центр, низ
      return [
        { value: 'top', label: 'Верх', icon: '↑' },
        { value: 'center', label: 'Центр', icon: '↕' },
        { value: 'bottom', label: 'Низ', icon: '↓' }
      ];
    }
  };

  const alignmentOptions = getAlignmentOptions();

  return (
    <div className={cn("space-y-2", className)}>
      <div className="text-sm font-medium">Выравнивание</div>
      <div className="grid grid-cols-3 gap-1">
        {alignmentOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value as 'top' | 'center' | 'bottom')}
            className={cn(
              "flex flex-col items-center justify-center p-3 border rounded hover:bg-gray-50 transition-colors",
              value === option.value 
                ? "bg-blue-100 border-blue-300 text-blue-700" 
                : "border-gray-200 text-gray-600"
            )}
            title={option.label}
          >
            <div className="text-lg mb-1">{option.icon}</div>
            <span className="text-xs">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
