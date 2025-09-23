import { useMemo } from 'react';
import { IPosition } from '../../types';

interface RulerProps {
  orientation: 'horizontal' | 'vertical';
  zoom: number;
  origin: IPosition; // canvas screen top-left in container pixels
}

export function Ruler({ orientation, zoom, origin }: RulerProps) {
  const rulerSize = 20;
  const tickInterval = 50; // canvas units between major ticks
  const minorTickInterval = 10; // canvas units between minor ticks

  const ticks = useMemo(() => {
    const ticks = [] as Array<{ position: number; value: number; isMajor: boolean }>;
    const containerLength = orientation === 'horizontal' ? window.innerWidth : window.innerHeight;
    const originPx = orientation === 'horizontal' ? (origin?.x || 0) : (origin?.y || 0);
    const minorStepPx = minorTickInterval * zoom; // convert canvas units to pixels

    // find the first tick index such that position >= 0
    const firstIndex = Math.ceil((0 - originPx) / minorStepPx);
    let positionPx = originPx + firstIndex * minorStepPx;
    while (positionPx <= containerLength) {
      const canvasValue = Math.round((positionPx - originPx) / zoom);
      const isMajor = canvasValue % tickInterval === 0;
      ticks.push({ position: positionPx, value: canvasValue, isMajor });
      positionPx += minorStepPx;
    }
    return ticks;
  }, [orientation, zoom, origin]);

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
