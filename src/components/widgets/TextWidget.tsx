import { WidgetComponentProps, ITextWidget } from '../../types';

export function TextWidget({ widget, isSelected, onSelect }: WidgetComponentProps) {
  const textWidget = widget as ITextWidget;
  const Tag = textWidget.props.tag;
  const bindingHint = textWidget.props.binding;
  
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
      <span className="flex items-center gap-2">
        {textWidget.props.content}
        {bindingHint && (
          <span className="px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide rounded bg-amber-50 text-amber-700 border border-amber-200">
            {bindingHint}
          </span>
        )}
      </span>
    </Tag>
  );
}