import { ReactNode } from 'react';

interface DeviceFrameProps {
  children: ReactNode;
  canvasSize: { width: number; height: number };
  zoom: number;
  panOffset: { x: number; y: number };
  hoveredZone: 'header' | 'main' | 'footer' | null;
  isDraggingWidget: boolean;
  onZoneHover: (zone: 'header' | 'main' | 'footer' | null) => void;
}

export function DeviceFrame({ 
  children, 
  canvasSize, 
  zoom, 
  panOffset, 
  hoveredZone, 
  isDraggingWidget,
  onZoneHover 
}: DeviceFrameProps) {
  return (
    <div
      className="relative mx-auto"
      style={{
        width: (canvasSize.width * zoom) + 40,
        height: (canvasSize.height * zoom) + 80,
        transform: `translate(${panOffset?.x || 0}px, ${panOffset?.y || 0}px)`,
      }}
    >
      {/* Device body (black bezel is the outer layer, we attach grips to it) */}
      <div className="absolute inset-0 rounded-[36px] bg-neutral-900 shadow-xl" />
      <div className="absolute inset-[10px] rounded-[28px] bg-neutral-800" />
      {/* Notch */}
      <div className="absolute left-1/2 -translate-x-1/2 top-3 h-6 w-40 rounded-full bg-black/80" />

      {/* Layout zones */}
      {/* Зоны как на макете: тонкие направляющие и подписи справа */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        {(() => {
          const headerOffsetPx = 40 * zoom; // увеличенная зона header
          const footerOffsetPx = 40 * zoom; // увеличенная зона footer
          const barHeightPx = Math.max(4, 4 * zoom);
          const sideInsetPx = Math.max(10, 12 * zoom);
          const rightShortenPx = Math.max(24, 28 * zoom);
          const headerBarTopPx = headerOffsetPx;
          const footerBarTopPx = (canvasSize.height * zoom) - footerOffsetPx - barHeightPx;
          return (
            <>
              {/* Header bar */}
              <div className="absolute" style={{ top: headerBarTopPx, height: barHeightPx, left: sideInsetPx, right: rightShortenPx }}>
                <div className="w-full h-full rounded-full transition-colors duration-200" style={{ background: hoveredZone === 'header' ? '#f59e0b' : '#fde047' }} />
              </div>
              {/* Footer bar */}
              <div className="absolute" style={{ top: footerBarTopPx, height: barHeightPx, left: sideInsetPx, right: rightShortenPx }}>
                <div className="w-full h-full rounded-full transition-colors duration-200" style={{ background: hoveredZone === 'footer' ? '#ef4444' : '#f87171' }} />
              </div>
            </>
          );
        })()}
      </div>

      {/* Labels outside: aligned to outer bezel right edge */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden={false}>
        <div className="absolute pointer-events-auto transition-all duration-200" style={{ top: (40 * zoom) - 10, right: -56 }} onMouseEnter={() => onZoneHover('header')} onMouseLeave={() => onZoneHover(null)}>
          <div className={`inline-flex items-center h-6 px-2 rounded bg-white shadow border text-[11px] transition-all duration-200 ${hoveredZone === 'header' ? 'border-amber-500 text-amber-600 bg-amber-50 scale-105' : 'text-gray-600'}`}>Header</div>
        </div>
        <div className="absolute pointer-events-auto" style={{ top: (canvasSize.height * zoom) / 2 - 10, right: -56 }} onMouseEnter={() => onZoneHover('main')} onMouseLeave={() => onZoneHover(null)}>
          <div className={`inline-flex items-center h-6 px-2 rounded bg-white shadow border text-[11px] transition-all duration-200 ${hoveredZone === 'main' ? 'border-blue-500 text-blue-600 bg-blue-50 scale-105' : 'text-gray-600'}`}>Main</div>
        </div>
        <div className="absolute pointer-events-auto transition-all duration-200" style={{ bottom: (40 * zoom) - 10, right: -56 }} onMouseEnter={() => onZoneHover('footer')} onMouseLeave={() => onZoneHover(null)}>
          <div className={`inline-flex items-center h-6 px-2 rounded bg-white shadow border text-[11px] transition-all duration-200 ${hoveredZone === 'footer' ? 'border-red-500 text-red-600 bg-red-50 scale-105' : 'text-gray-600'}`}>Footer</div>
        </div>
      </div>

      {children}
    </div>
  );
}
