import { WidgetComponentProps, ITextWidget } from '../../types';

export function TextWidget({ widget, isSelected, onSelect }: WidgetComponentProps) {
  const textWidget = widget as ITextWidget;
  const Tag = textWidget.props.tag;
  
  return (
    <Tag
      onClick={() => onSelect?.(widget.id)}
      className={`w-full h-full outline-none ${isSelected ? 'ring-2 ring-primary' : ''}`}
      style={{
        ...textWidget.style,
        fontSize: textWidget.style.fontSize ? `${textWidget.style.fontSize}px` : undefined,
        fontWeight: textWidget.style.fontWeight,
        color: textWidget.style.color || undefined,
        backgroundColor: textWidget.style.backgroundColor || undefined,
        textAlign: textWidget.props.align,
        padding: textWidget.style.padding,
        margin: textWidget.style.margin,
        borderRadius: textWidget.style.borderRadius ? `${textWidget.style.borderRadius}px` : undefined,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {textWidget.props.content}
    </Tag>
  );
}