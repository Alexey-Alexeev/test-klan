import { Input } from '@/components/ui/input';
import { WidgetComponentProps, IInputWidget } from '../../types';

export function InputWidget({ widget, isSelected, onSelect }: WidgetComponentProps) {
  const inputWidget = widget as IInputWidget;
  
  return (
    <Input
      type={inputWidget.props.inputType}
      placeholder={inputWidget.props.placeholder}
      disabled={inputWidget.props.disabled}
      required={inputWidget.props.required}
      onClick={() => onSelect?.(widget.id)}
      className={`w-full h-full ${isSelected ? 'ring-2 ring-primary' : ''}`}
      style={{
        ...inputWidget.style,
        fontSize: inputWidget.style.fontSize ? `${inputWidget.style.fontSize}px` : undefined,
        fontWeight: inputWidget.style.fontWeight,
        backgroundColor: inputWidget.style.backgroundColor,
        color: inputWidget.style.color,
        borderRadius: inputWidget.style.borderRadius ? `${inputWidget.style.borderRadius}px` : undefined,
        border: inputWidget.style.border,
        padding: inputWidget.style.padding,
      }}
    />
  );
}