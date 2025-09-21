import { WidgetComponentProps, IImageWidget } from '../../types';

export function ImageWidget({ widget, isSelected, onSelect }: WidgetComponentProps) {
  const imageWidget = widget as IImageWidget;
  
  return (
    <img
      src={imageWidget.props.src}
      alt={imageWidget.props.alt}
      onClick={() => onSelect?.(widget.id)}
      className={`w-full h-full object-${imageWidget.props.objectFit} ${isSelected ? 'ring-2 ring-primary' : ''}`}
      style={{
        ...imageWidget.style,
        borderRadius: imageWidget.style.borderRadius ? `${imageWidget.style.borderRadius}px` : undefined,
        border: imageWidget.style.border,
      }}
    />
  );
}