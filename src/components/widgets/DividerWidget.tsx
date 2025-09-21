import { WidgetComponentProps, IDividerWidget } from '../../types';

export function DividerWidget({ widget, isSelected, onSelect }: WidgetComponentProps) {
  const dividerWidget = widget as IDividerWidget;
  
  const dividerStyle = {
    width: dividerWidget.props.orientation === 'horizontal' ? '100%' : `${dividerWidget.props.thickness}px`,
    height: dividerWidget.props.orientation === 'vertical' ? '100%' : `${dividerWidget.props.thickness}px`,
    backgroundColor: dividerWidget.props.color,
    ...dividerWidget.style,
  };

  return (
    <div
      className={`${isSelected ? 'ring-2 ring-primary' : ''}`}
      style={dividerStyle}
      onClick={() => onSelect?.(widget.id)}
    />
  );
}
