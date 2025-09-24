import React from 'react';
import { cn } from '@/lib/utils';

interface AlignmentControlProps {
  value: string;
  onChange: (value: string) => void;
  direction: 'horizontal' | 'vertical';
  className?: string;
}

export function AlignmentControl({ value, onChange, direction, className }: AlignmentControlProps) {
  const isHorizontal = direction === 'horizontal';
  
  const options = isHorizontal 
    ? [
        { value: 'flex-start', label: 'Начало', icon: '←' },
        { value: 'center', label: 'Центр', icon: '↔' },
        { value: 'flex-end', label: 'Конец', icon: '→' },
        { value: 'space-between', label: 'Распределить', icon: '⇄' },
        { value: 'space-around', label: 'Вокруг', icon: '⇉' },
        { value: 'space-evenly', label: 'Равномерно', icon: '⇊' }
      ]
    : [
        { value: 'flex-start', label: 'Начало', icon: '↑' },
        { value: 'center', label: 'Центр', icon: '↕' },
        { value: 'flex-end', label: 'Конец', icon: '↓' },
        { value: 'stretch', label: 'Растянуть', icon: '⇳' }
      ];

  return (
    <div className={cn("grid grid-cols-3 gap-1", className)}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "flex flex-col items-center justify-center p-2 text-xs border rounded hover:bg-gray-50 transition-colors",
            value === option.value 
              ? "bg-blue-100 border-blue-300 text-blue-700" 
              : "border-gray-200 text-gray-600"
          )}
          title={option.label}
        >
          <span className="text-lg mb-1">{option.icon}</span>
          <span className="text-[10px] leading-tight">{option.label}</span>
        </button>
      ))}
    </div>
  );
}

interface ContentAlignmentGridProps {
  xValue: string;
  yValue: string;
  onXChange: (value: string) => void;
  onYChange: (value: string) => void;
  className?: string;
}

export function ContentAlignmentGrid({ xValue, yValue, onXChange, onYChange, className }: ContentAlignmentGridProps) {
  const gridPositions = [
    { x: 'flex-start', y: 'flex-start', label: 'Верх-лево' },
    { x: 'center', y: 'flex-start', label: 'Верх-центр' },
    { x: 'flex-end', y: 'flex-start', label: 'Верх-право' },
    { x: 'flex-start', y: 'center', label: 'Центр-лево' },
    { x: 'center', y: 'center', label: 'Центр' },
    { x: 'flex-end', y: 'center', label: 'Центр-право' },
    { x: 'flex-start', y: 'flex-end', label: 'Низ-лево' },
    { x: 'center', y: 'flex-end', label: 'Низ-центр' },
    { x: 'flex-end', y: 'flex-end', label: 'Низ-право' }
  ];

  const getCurrentPosition = () => {
    return gridPositions.find(pos => pos.x === xValue && pos.y === yValue);
  };

  const currentPosition = getCurrentPosition();

  return (
    <div className={cn("space-y-3", className)}>
      <div className="grid grid-cols-3 gap-1">
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
              {isSelected ? '●' : '○'}
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

interface OrientationControlProps {
  value: 'row' | 'column';
  onChange: (value: 'row' | 'column') => void;
  className?: string;
}

export function OrientationControl({ value, onChange, className }: OrientationControlProps) {
  return (
    <div className={cn("grid grid-cols-2 gap-2", className)}>
      <button
        onClick={() => onChange('row')}
        className={cn(
          "flex flex-col items-center justify-center p-3 border rounded hover:bg-gray-50 transition-colors",
          value === 'row' 
            ? "bg-blue-100 border-blue-300 text-blue-700" 
            : "border-gray-200 text-gray-600"
        )}
      >
        <div className="text-lg mb-1">↔</div>
        <span className="text-xs">Горизонтально</span>
      </button>
      
      <button
        onClick={() => onChange('column')}
        className={cn(
          "flex flex-col items-center justify-center p-3 border rounded hover:bg-gray-50 transition-colors",
          value === 'column' 
            ? "bg-blue-100 border-blue-300 text-blue-700" 
            : "border-gray-200 text-gray-600"
        )}
      >
        <div className="text-lg mb-1">↕</div>
        <span className="text-xs">Вертикально</span>
      </button>
    </div>
  );
}
