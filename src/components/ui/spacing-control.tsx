import React from 'react';
import { cn } from '@/lib/utils';

interface SpacingControlProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
  className?: string;
}

export function SpacingControl({ value, onChange, label, className }: SpacingControlProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min="0"
          max="50"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        />
        <div className="flex items-center gap-1 min-w-[60px]">
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-12 h-8 text-xs text-center border border-gray-300 rounded"
            min="0"
            max="50"
          />
          <span className="text-xs text-gray-500">px</span>
        </div>
      </div>
    </div>
  );
}

interface BoxModelControlProps {
  padding: { top: number; right: number; bottom: number; left: number };
  margin: { top: number; right: number; bottom: number; left: number };
  onPaddingChange: (side: 'top' | 'right' | 'bottom' | 'left', value: number) => void;
  onMarginChange: (side: 'top' | 'right' | 'bottom' | 'left', value: number) => void;
  className?: string;
}

export function BoxModelControl({ 
  padding, 
  margin, 
  onPaddingChange, 
  onMarginChange, 
  className 
}: BoxModelControlProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Visual Box Model */}
      <div className="relative w-32 h-32 mx-auto">
        {/* Margin box */}
        <div 
          className="absolute inset-0 border-2 border-dashed border-gray-300"
          style={{
            top: -margin.top,
            right: -margin.right,
            bottom: -margin.bottom,
            left: -margin.left,
          }}
        >
          <div className="absolute -top-6 left-0 text-xs text-gray-500">Margins</div>
        </div>
        
        {/* Padding box */}
        <div 
          className="absolute border-2 border-blue-300 bg-blue-50"
          style={{
            top: margin.top,
            right: margin.right,
            bottom: margin.bottom,
            left: margin.left,
            paddingTop: padding.top,
            paddingRight: padding.right,
            paddingBottom: padding.bottom,
            paddingLeft: padding.left,
          }}
        >
          <div className="absolute -top-4 left-0 text-xs text-blue-600">Paddings</div>
          <div className="w-full h-full bg-white border border-gray-200 flex items-center justify-center">
            <span className="text-xs text-gray-500">content</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-3">
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Внутренние отступы (Padding)</h4>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-500">Верх</label>
              <input
                type="number"
                value={padding.top}
                onChange={(e) => onPaddingChange('top', Number(e.target.value))}
                className="w-full h-8 text-xs border border-gray-300 rounded px-2"
                min="0"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Низ</label>
              <input
                type="number"
                value={padding.bottom}
                onChange={(e) => onPaddingChange('bottom', Number(e.target.value))}
                className="w-full h-8 text-xs border border-gray-300 rounded px-2"
                min="0"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Лево</label>
              <input
                type="number"
                value={padding.left}
                onChange={(e) => onPaddingChange('left', Number(e.target.value))}
                className="w-full h-8 text-xs border border-gray-300 rounded px-2"
                min="0"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Право</label>
              <input
                type="number"
                value={padding.right}
                onChange={(e) => onPaddingChange('right', Number(e.target.value))}
                className="w-full h-8 text-xs border border-gray-300 rounded px-2"
                min="0"
              />
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Внешние отступы (Margin)</h4>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-500">Верх</label>
              <input
                type="number"
                value={margin.top}
                onChange={(e) => onMarginChange('top', Number(e.target.value))}
                className="w-full h-8 text-xs border border-gray-300 rounded px-2"
                min="0"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Низ</label>
              <input
                type="number"
                value={margin.bottom}
                onChange={(e) => onMarginChange('bottom', Number(e.target.value))}
                className="w-full h-8 text-xs border border-gray-300 rounded px-2"
                min="0"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Лево</label>
              <input
                type="number"
                value={margin.left}
                onChange={(e) => onMarginChange('left', Number(e.target.value))}
                className="w-full h-8 text-xs border border-gray-300 rounded px-2"
                min="0"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Право</label>
              <input
                type="number"
                value={margin.right}
                onChange={(e) => onMarginChange('right', Number(e.target.value))}
                className="w-full h-8 text-xs border border-gray-300 rounded px-2"
                min="0"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
