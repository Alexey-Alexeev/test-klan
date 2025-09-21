import { Button } from '@/components/ui/button';
import { WidgetComponentProps, IButtonWidget } from '../../types';

export function ButtonWidget({ widget, isSelected, onSelect }: WidgetComponentProps) {
  const buttonWidget = widget as IButtonWidget;
  
  const getVariant = () => {
    switch (buttonWidget.props.variant) {
      case 'primary':
        return 'default';
      case 'secondary':
        return 'secondary';
      case 'outline':
        return 'outline';
      default:
        return 'default';
    }
  };

  return (
    <Button
      variant={getVariant()}
      disabled={buttonWidget.props.disabled}
      onClick={() => onSelect?.(widget.id)}
      className={`w-full h-full ${isSelected ? 'ring-2 ring-primary' : ''}`}
      style={{
        ...buttonWidget.style,
        fontSize: buttonWidget.style.fontSize ? `${buttonWidget.style.fontSize}px` : undefined,
        fontWeight: buttonWidget.style.fontWeight,
        backgroundColor: buttonWidget.style.backgroundColor || (buttonWidget.props.variant === 'primary' ? 'hsl(var(--primary))' : undefined),
        color: buttonWidget.style.color || (buttonWidget.props.variant === 'primary' ? 'white' : undefined),
        borderRadius: buttonWidget.style.borderRadius ? `${buttonWidget.style.borderRadius}px` : undefined,
      }}
    >
      {buttonWidget.props.text}
    </Button>
  );
}