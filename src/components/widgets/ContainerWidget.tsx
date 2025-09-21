import { WidgetComponentProps, IContainerWidget } from '../../types';

export function ContainerWidget({ widget, isSelected, onSelect }: WidgetComponentProps) {
  const containerWidget = widget as IContainerWidget;
  
  const containerStyle = {
    display: containerWidget.props.layout,
    flexDirection: containerWidget.props.layout === 'flex' ? containerWidget.props.direction : undefined,
    justifyContent: containerWidget.props.layout === 'flex' ? containerWidget.props.justifyContent : undefined,
    alignItems: containerWidget.props.layout === 'flex' ? containerWidget.props.alignItems : undefined,
    gap: `${containerWidget.props.gap}px`,
    padding: `${containerWidget.props.padding}px`,
    ...containerWidget.style,
  };

  return (
    <div
      className={`w-full h-full ${isSelected ? 'ring-2 ring-primary' : ''}`}
      style={containerStyle}
      onClick={() => onSelect?.(widget.id)}
    >
      <div className="text-xs text-gray-400 text-center py-2">
        Контейнер ({containerWidget.props.layout})
      </div>
    </div>
  );
}
