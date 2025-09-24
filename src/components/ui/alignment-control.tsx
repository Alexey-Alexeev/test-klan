import React from 'react';
import { cn } from '@/lib/utils';

export type AlignmentGridValue =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'center-left'
  | 'center'
  | 'center-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'
  // Legacy values for backward compatibility
  | 'top'
  | 'bottom';

const AlignmentGridOrder: AlignmentGridValue[] = [
  'top-left',
  'top-center',
  'top-right',
  'center-left',
  'center',
  'center-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
];

const AlignmentIcons: Record<AlignmentGridValue, string> = {
  'top-left': '↖',
  'top-center': '↑',
  'top-right': '↗',
  'center-left': '←',
  center: '●',
  'center-right': '→',
  'bottom-left': '↙',
  'bottom-center': '↓',
  'bottom-right': '↘',
};

const AlignmentLabels: Record<AlignmentGridValue, string> = {
  'top-left': 'Верх-лево',
  'top-center': 'Верх-центр',
  'top-right': 'Верх-право',
  'center-left': 'Центр-лево',
  center: 'Центр',
  'center-right': 'Центр-право',
  'bottom-left': 'Низ-лево',
  'bottom-center': 'Низ-центр',
  'bottom-right': 'Низ-право',
};

interface AlignmentGridControlProps {
  value: AlignmentGridValue;
  onChange: (value: AlignmentGridValue) => void;
  className?: string;
}

export function AlignmentGridControl({ value, onChange, className }: AlignmentGridControlProps) {
  // Handle legacy values by mapping them to new grid values
  const getDisplayValue = (val: AlignmentGridValue): AlignmentGridValue => {
    if (val === 'top') return 'top-left';
    if (val === 'bottom') return 'bottom-left';
    return val;
  };

  const displayValue = getDisplayValue(value);

  return (
    <div className={cn('space-y-3', className)}>
      <div className="grid grid-cols-3 gap-1">
        {AlignmentGridOrder.map((option) => {
          const isSelected = option === displayValue;
          return (
            <button
              key={option}
              onClick={() => onChange(option)}
              className={cn(
                'w-10 h-10 border rounded flex items-center justify-center text-base transition-colors',
                isSelected
                  ? 'bg-blue-100 border-blue-300 text-blue-700'
                  : 'border-gray-200 text-gray-500 hover:bg-gray-50'
              )}
              title={AlignmentLabels[option]}
            >
              {AlignmentIcons[option]}
            </button>
          );
        })}
      </div>
      <div className="text-xs text-gray-600 text-center">{AlignmentLabels[displayValue]}</div>
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
    <div className={cn('grid grid-cols-2 gap-2', className)}>
      <button
        onClick={() => onChange('row')}
        className={cn(
          'flex flex-col items-center justify-center p-3 border rounded hover:bg-gray-50 transition-colors',
          value === 'row'
            ? 'bg-blue-100 border-blue-300 text-blue-700'
            : 'border-gray-200 text-gray-600'
        )}
      >
        <div className="text-lg mb-1">↔</div>
        <span className="text-xs">Горизонтально</span>
      </button>
      <button
        onClick={() => onChange('column')}
        className={cn(
          'flex flex-col items-center justify-center p-3 border rounded hover:bg-gray-50 transition-colors',
          value === 'column'
            ? 'bg-blue-100 border-blue-300 text-blue-700'
            : 'border-gray-200 text-gray-600'
        )}
      >
        <div className="text-lg mb-1">↕</div>
        <span className="text-xs">Вертикально</span>
      </button>
    </div>
  );
}
