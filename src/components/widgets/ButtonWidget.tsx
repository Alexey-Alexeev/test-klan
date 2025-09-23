import { Button } from '@/components/ui/button';
import { WidgetComponentProps, IButtonWidget } from '../../types';

export function ButtonWidget({ widget, isSelected, onSelect }: WidgetComponentProps) {
  const buttonWidget = widget as IButtonWidget;
  
  const getVariant = () => {
    switch (buttonWidget.props.variant) {
      case 'primary':
        return 'dsPrimary';
      case 'secondary':
        return 'secondary';
      case 'accent':
      case 'pay':
      case 'success':
      case 'danger':
      case 'secondaryDefault':
      case 'secondaryAccent':
      case 'secondaryPay':
      case 'ghost':
        return buttonWidget.props.variant as any;
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
        ...( (() => { const { backgroundColor: _bg, color: _color, ...rest } = (buttonWidget.style || {}) as any; return rest; })() ),
        fontSize: buttonWidget.style.fontSize ? `${buttonWidget.style.fontSize}px` : undefined,
        fontWeight: buttonWidget.style.fontWeight,
        borderRadius: buttonWidget.style.borderRadius ? `${buttonWidget.style.borderRadius}px` : undefined,
      }}
    >
      {buttonWidget.props.text}
    </Button>
  );
}