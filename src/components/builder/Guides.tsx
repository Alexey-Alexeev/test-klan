import React from 'react';
import { IWidget, IPosition, ISize } from '../../types';

interface GuidesProps {
  widgets: IWidget[];
  selectedWidgetId: string | null;
  canvasSize: { width: number; height: number };
  zoom: number;
  panOffset: IPosition;
}

interface GuideLine {
  id: string;
  type: 'horizontal' | 'vertical';
  position: number;
  color: string;
  label?: string;
}

export function Guides({ widgets, selectedWidgetId, canvasSize, zoom, panOffset }: GuidesProps) {
  const selectedWidget = widgets.find(w => w.id === selectedWidgetId);
  
  if (!selectedWidget) return null;

  const guides: GuideLine[] = [];
  const snapThreshold = 8; // pixels - увеличили порог для лучшего UX

  // Get all other widgets (excluding selected)
  const otherWidgets = widgets.filter(w => w.id !== selectedWidgetId);

  // Calculate selected widget bounds
  const selectedBounds = {
    left: selectedWidget.position.x,
    right: selectedWidget.position.x + selectedWidget.size.width,
    top: selectedWidget.position.y,
    bottom: selectedWidget.position.y + selectedWidget.size.height,
    centerX: selectedWidget.position.x + selectedWidget.size.width / 2,
    centerY: selectedWidget.position.y + selectedWidget.size.height / 2,
  };

  // Функция для проверки, есть ли уже направляющая на этой позиции
  const hasGuideAtPosition = (position: number, type: 'horizontal' | 'vertical') => {
    return guides.some(guide => 
      guide.type === type && Math.abs(guide.position - position) < 2
    );
  };

  // Check for alignment with other widgets - только самые близкие
  const alignmentCandidates: Array<{
    position: number;
    type: 'horizontal' | 'vertical';
    color: string;
    label: string;
    distance: number;
  }> = [];

  otherWidgets.forEach(widget => {
    const widgetBounds = {
      left: widget.position.x,
      right: widget.position.x + widget.size.width,
      top: widget.position.y,
      bottom: widget.position.y + widget.size.height,
      centerX: widget.position.x + widget.size.width / 2,
      centerY: widget.position.y + widget.size.height / 2,
    };

    // Horizontal alignments
    const leftDistance = Math.abs(selectedBounds.left - widgetBounds.left);
    if (leftDistance < snapThreshold) {
      alignmentCandidates.push({
        position: widgetBounds.left,
        type: 'vertical',
        color: '#3b82f6',
        label: 'Левый край',
        distance: leftDistance
      });
    }

    const rightDistance = Math.abs(selectedBounds.right - widgetBounds.right);
    if (rightDistance < snapThreshold) {
      alignmentCandidates.push({
        position: widgetBounds.right,
        type: 'vertical',
        color: '#3b82f6',
        label: 'Правый край',
        distance: rightDistance
      });
    }

    const centerXDistance = Math.abs(selectedBounds.centerX - widgetBounds.centerX);
    if (centerXDistance < snapThreshold) {
      alignmentCandidates.push({
        position: widgetBounds.centerX,
        type: 'vertical',
        color: '#10b981',
        label: 'Центр по X',
        distance: centerXDistance
      });
    }

    // Vertical alignments
    const topDistance = Math.abs(selectedBounds.top - widgetBounds.top);
    if (topDistance < snapThreshold) {
      alignmentCandidates.push({
        position: widgetBounds.top,
        type: 'horizontal',
        color: '#3b82f6',
        label: 'Верхний край',
        distance: topDistance
      });
    }

    const bottomDistance = Math.abs(selectedBounds.bottom - widgetBounds.bottom);
    if (bottomDistance < snapThreshold) {
      alignmentCandidates.push({
        position: widgetBounds.bottom,
        type: 'horizontal',
        color: '#3b82f6',
        label: 'Нижний край',
        distance: bottomDistance
      });
    }

    const centerYDistance = Math.abs(selectedBounds.centerY - widgetBounds.centerY);
    if (centerYDistance < snapThreshold) {
      alignmentCandidates.push({
        position: widgetBounds.centerY,
        type: 'horizontal',
        color: '#10b981',
        label: 'Центр по Y',
        distance: centerYDistance
      });
    }
  });

  // Сортируем по расстоянию и берем только самые близкие
  alignmentCandidates.sort((a, b) => a.distance - b.distance);
  
  // Группируем по типу и позиции, оставляем только лучшие
  const horizontalCandidates = alignmentCandidates.filter(c => c.type === 'horizontal');
  const verticalCandidates = alignmentCandidates.filter(c => c.type === 'vertical');
  
  // Берем только 2 лучших горизонтальных и 2 лучших вертикальных
  const bestHorizontal = horizontalCandidates.slice(0, 2);
  const bestVertical = verticalCandidates.slice(0, 2);
  
  [...bestHorizontal, ...bestVertical].forEach(candidate => {
    if (!hasGuideAtPosition(candidate.position, candidate.type)) {
      guides.push({
        id: `${candidate.type}-${candidate.position}`,
        type: candidate.type,
        position: candidate.position,
        color: candidate.color,
        label: candidate.label
      });
    }
  });

  // Canvas edge alignments - только если очень близко
  const edgeThreshold = 5;
  
  if (Math.abs(selectedBounds.left) < edgeThreshold) {
    guides.push({
      id: 'canvas-left',
      type: 'vertical',
      position: 0,
      color: '#ef4444',
      label: 'Край холста'
    });
  }

  if (Math.abs(selectedBounds.right - canvasSize.width) < edgeThreshold) {
    guides.push({
      id: 'canvas-right',
      type: 'vertical',
      position: canvasSize.width,
      color: '#ef4444',
      label: 'Край холста'
    });
  }

  if (Math.abs(selectedBounds.top) < edgeThreshold) {
    guides.push({
      id: 'canvas-top',
      type: 'horizontal',
      position: 0,
      color: '#ef4444',
      label: 'Край холста'
    });
  }

  if (Math.abs(selectedBounds.bottom - canvasSize.height) < edgeThreshold) {
    guides.push({
      id: 'canvas-bottom',
      type: 'horizontal',
      position: canvasSize.height,
      color: '#ef4444',
      label: 'Край холста'
    });
  }

  // Canvas center alignments - только если очень близко
  const centerThreshold = 10;
  
  if (Math.abs(selectedBounds.centerX - canvasSize.width / 2) < centerThreshold) {
    guides.push({
      id: 'canvas-center-x',
      type: 'vertical',
      position: canvasSize.width / 2,
      color: '#f59e0b',
      label: 'Центр холста'
    });
  }

  if (Math.abs(selectedBounds.centerY - canvasSize.height / 2) < centerThreshold) {
    guides.push({
      id: 'canvas-center-y',
      type: 'horizontal',
      position: canvasSize.height / 2,
      color: '#f59e0b',
      label: 'Центр холста'
    });
  }

  return (
    <div className="absolute inset-0 pointer-events-none">
      {guides.map(guide => (
        <div key={guide.id}>
          {guide.type === 'vertical' ? (
            <div
              className="absolute top-0 bottom-0 w-0.5 opacity-80"
              style={{
                left: (guide.position + (panOffset?.x || 0)) * zoom,
                backgroundColor: guide.color,
                boxShadow: `0 0 4px ${guide.color}`,
              }}
            >
              <div
                className="absolute -top-1 -left-1 w-2 h-2 rounded-full"
                style={{ backgroundColor: guide.color }}
              />
              <div
                className="absolute -bottom-1 -left-1 w-2 h-2 rounded-full"
                style={{ backgroundColor: guide.color }}
              />
            </div>
          ) : (
            <div
              className="absolute left-0 right-0 h-0.5 opacity-80"
              style={{
                top: (guide.position + (panOffset?.y || 0)) * zoom,
                backgroundColor: guide.color,
                boxShadow: `0 0 4px ${guide.color}`,
              }}
            >
              <div
                className="absolute -left-1 -top-1 w-2 h-2 rounded-full"
                style={{ backgroundColor: guide.color }}
              />
              <div
                className="absolute -right-1 -top-1 w-2 h-2 rounded-full"
                style={{ backgroundColor: guide.color }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
