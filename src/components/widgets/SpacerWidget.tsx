import { WidgetComponentProps, ISpacerWidget } from '../../types';

export function SpacerWidget({ widget, isSelected, onSelect }: WidgetComponentProps) {
  const spacerWidget = widget as ISpacerWidget;
  
  const spacerStyle = {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
    border: isSelected ? '2px dashed hsl(var(--primary))' : '1px dashed #e5e7eb',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...spacerWidget.style,
  };

  return (
    <div
      className={`${isSelected ? 'ring-2 ring-primary' : ''}`}
      style={spacerStyle}
      onClick={() => onSelect?.(widget.id)}
    >
      <span className="text-xs text-gray-400">
        Отступ ({spacerWidget.props.size}px)
      </span>
    </div>
  );
}
