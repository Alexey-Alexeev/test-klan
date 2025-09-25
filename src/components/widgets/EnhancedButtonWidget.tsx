import { Button } from '@/components/ui/button';
import { WidgetComponentProps, IButtonWidget } from '../../types';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { runtimeActions } from '../../middleware/runtimeMiddleware';

export function EnhancedButtonWidget({ widget, isSelected, onSelect, isEditable }: WidgetComponentProps) {
  const dispatch = useAppDispatch();
  const buttonWidget = widget as IButtonWidget;
  const { runtime } = useAppSelector(state => state.state);
  
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

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isEditable) {
      // In edit mode, select the widget
      onSelect?.(widget.id);
    } else {
      // In preview/run mode, execute actions
      if (buttonWidget.actions && buttonWidget.actions.length > 0) {
        dispatch(runtimeActions.executeWidgetAction(widget.id, 'on_click', {
          elementId: widget.id,
          elementType: 'button',
        }));
      }
    }
  };

  // Apply data bindings if any
  let displayText = buttonWidget.props.text;
  if (buttonWidget.bindings?.['props.text']) {
    const binding = buttonWidget.bindings['props.text'];
    // Simple binding evaluation
    if (binding.startsWith('{') && binding.endsWith('}')) {
      const path = binding.slice(1, -1);
      const [scope, ...pathParts] = path.split('.');
      const value = runtime[scope as keyof typeof runtime];
      if (value && typeof value === 'object') {
        const nestedValue = pathParts.reduce((obj, key) => obj?.[key], value);
        if (nestedValue !== undefined) {
          displayText = String(nestedValue);
        }
      }
    }
  }

  // Apply style bindings
  let dynamicStyle: any = {};
  if (buttonWidget.bindings) {
    Object.entries(buttonWidget.bindings).forEach(([property, binding]) => {
      if (property.startsWith('style.') && binding.startsWith('{') && binding.endsWith('}')) {
        const styleProp = property.replace('style.', '');
        const path = binding.slice(1, -1);
        const [scope, ...pathParts] = path.split('.');
        const value = runtime[scope as keyof typeof runtime];
        if (value && typeof value === 'object') {
          const nestedValue = pathParts.reduce((obj, key) => obj?.[key], value);
          if (nestedValue !== undefined) {
            dynamicStyle[styleProp] = nestedValue;
          }
        }
      }
    });
  }

  return (
    <Button
      variant={getVariant()}
      disabled={buttonWidget.props.disabled}
      onClick={handleClick}
      className={`w-full h-full ${isSelected ? 'ring-2 ring-primary' : ''} ${
        !isEditable && buttonWidget.actions?.length ? 'cursor-pointer' : ''
      }`}
      style={{
        ...( (() => { 
          const { backgroundColor: _bg, color: _color, ...rest } = (buttonWidget.style || {}) as any; 
          return rest; 
        })() ),
        fontSize: buttonWidget.style.fontSize ? `${buttonWidget.style.fontSize}px` : undefined,
        fontWeight: buttonWidget.style.fontWeight,
        borderRadius: buttonWidget.style.borderRadius ? `${buttonWidget.style.borderRadius}px` : undefined,
        ...dynamicStyle,
      }}
    >
      {displayText}
    </Button>
  );
}
