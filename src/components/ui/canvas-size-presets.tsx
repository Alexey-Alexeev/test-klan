import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface CanvasSizePreset {
  id: string;
  name: string;
  width: number;
  height: number;
}

export const CANVAS_SIZE_PRESETS: CanvasSizePreset[] = [
  {
    id: 'iphone-16-pro',
    name: 'iPhone 16 Pro',
    width: 402,
    height: 874,
  },
  {
    id: 'samsung-galaxy-s23',
    name: 'Samsung Galaxy S23',
    width: 360,
    height: 780,
  },
  {
    id: 'custom',
    name: 'Кастомный размер',
    width: 0,
    height: 0,
  },
];

interface CanvasSizePresetSelectorProps {
  value?: string;
  onValueChange: (presetId: string) => void;
  disabled?: boolean;
}

export const CanvasSizePresetSelector: React.FC<CanvasSizePresetSelectorProps> = ({
  value,
  onValueChange,
  disabled = false,
}) => {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className="h-8 w-48 text-sm">
        <SelectValue placeholder="Выберите устройство" />
      </SelectTrigger>
      <SelectContent>
        {CANVAS_SIZE_PRESETS.map((preset) => (
          <SelectItem key={preset.id} value={preset.id} className="text-sm">
            <div className="flex flex-col">
              <span className="font-medium">{preset.name}</span>
              {preset.id !== 'custom' && (
                <span className="text-xs text-gray-500">
                  {preset.width} × {preset.height} px
                </span>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
