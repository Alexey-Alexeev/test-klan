import { useMemo } from 'react';
import { IPosition } from '../../types';

interface RulerProps {
  orientation: 'horizontal' | 'vertical';
  zoom: number;
  panOffset: IPosition;
}

export function Ruler({ orientation, zoom, panOffset }: RulerProps) {
  const rulerSize = 20;
  const tickInterval = 50; // pixels between major ticks
  const minorTickInterval = 10; // pixels between minor ticks

  const ticks = useMemo(() => {
    const ticks = [];
    const offsetX = panOffset?.x || 0;
    const offsetY = panOffset?.y || 0;
    const start = orientation === 'horizontal' ? -offsetX : -offsetY;
    const end = start + (orientation === 'horizontal' ? window.innerWidth : window.innerHeight);
    
    for (let i = Math.floor(start / tickInterval) * tickInterval; i <= end; i += minorTickInterval) {
      const isMajor = i % tickInterval === 0;
      const position = i + (orientation === 'horizontal' ? offsetX : offsetY);
      
      if (position >= 0) {
        ticks.push({
          position,
          value: Math.round(i / zoom),
          isMajor,
        });
      }
    }
    
    return ticks;
  }, [orientation, panOffset, zoom]);

  if (orientation === 'horizontal') {
    return (
      <div 
        className="absolute top-0 left-0 right-0 bg-gray-100 border-b border-gray-300 text-xs"
        style={{ height: rulerSize }}
      >
        <div className="relative h-full">
          {ticks.map((tick, index) => (
            <div
              key={index}
              className="absolute top-0 text-gray-600"
              style={{
                left: tick.position,
                height: tick.isMajor ? rulerSize : rulerSize / 2,
                borderLeft: '1px solid #9ca3af',
                paddingLeft: tick.isMajor ? '2px' : '1px',
                fontSize: '10px',
                lineHeight: `${rulerSize}px`,
              }}
            >
              {tick.isMajor && tick.value}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div 
      className="absolute top-0 left-0 bottom-0 bg-gray-100 border-r border-gray-300 text-xs"
      style={{ width: rulerSize }}
    >
      <div className="relative w-full h-full">
        {ticks.map((tick, index) => (
          <div
            key={index}
            className="absolute left-0 text-gray-600"
            style={{
              top: tick.position,
              width: tick.isMajor ? rulerSize : rulerSize / 2,
              borderTop: '1px solid #9ca3af',
              paddingTop: tick.isMajor ? '2px' : '1px',
              fontSize: '10px',
              lineHeight: '1',
              writingMode: 'vertical-rl',
              textOrientation: 'mixed',
            }}
          >
            {tick.isMajor && tick.value}
          </div>
        ))}
      </div>
    </div>
  );
}
