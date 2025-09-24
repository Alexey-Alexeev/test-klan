import { WidgetComponentProps, IContainerWidget } from '../../types';
import { useAppSelector } from '../../store/hooks';
import { WidgetRenderer } from '../builder/WidgetRenderer';

export function ContainerWidget({ widget, isSelected, onSelect }: WidgetComponentProps) {
  const containerWidget = widget as IContainerWidget;
  const { widgets, selectedWidgetId } = useAppSelector(state => state.canvas);
  
  // Get child widgets
  const childWidgets = widgets.filter(w => w.parentId === containerWidget.id);
  
  
  const containerStyle = {
    display: containerWidget.props.layout,
    flexDirection: containerWidget.props.layout === 'flex' ? containerWidget.props.direction : undefined,
    justifyContent: containerWidget.props.layout === 'flex' ? containerWidget.props.justifyContent : undefined,
    alignItems: containerWidget.props.layout === 'flex' ? containerWidget.props.alignItems : undefined,
    gap: `${containerWidget.props.gap}px`,
    padding: `${containerWidget.props.padding}px`,
    overflow: 'visible', // Allow children to be visible
    position: 'relative', // Ensure proper positioning context
    minHeight: '100px', // Ensure minimum height for visibility
    minWidth: '100px', // Ensure minimum width for visibility
    ...containerWidget.style,
  };

  return (
    <div
      className={`w-full h-full relative ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}`}
      style={containerStyle}
      onClick={() => onSelect?.(widget.id)}
    >
      {/* Render child widgets */}
      {childWidgets.map((childWidget) => (
        <WidgetRenderer
          key={childWidget.id}
          widget={childWidget}
          isSelected={selectedWidgetId === childWidget.id}
          isEditable={true}
        />
      ))}
      
      {/* Show container info if no children */}
      {childWidgets.length === 0 && (
        <div className="text-xs text-gray-400 text-center py-2">
          Контейнер ({containerWidget.props.layout})
        </div>
      )}
    </div>
  );
}
