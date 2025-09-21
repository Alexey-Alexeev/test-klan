import { Badge } from '@/components/ui/badge';
import { WidgetComponentProps, IBadgeWidget } from '../../types';

export function BadgeWidget({ widget, isSelected, onSelect }: WidgetComponentProps) {
  const badgeWidget = widget as IBadgeWidget;
  
  const getVariant = () => {
    switch (badgeWidget.props.variant) {
      case 'default':
        return 'default';
      case 'secondary':
        return 'secondary';
      case 'destructive':
        return 'destructive';
      case 'outline':
        return 'outline';
      default:
        return 'default';
    }
  };

  const getSizeClass = () => {
    switch (badgeWidget.props.size) {
      case 'sm':
        return 'text-xs px-2 py-1';
      case 'md':
        return 'text-sm px-2.5 py-1.5';
      case 'lg':
        return 'text-base px-3 py-2';
      default:
        return 'text-sm px-2.5 py-1.5';
    }
  };

  return (
    <div
      className={`w-full h-full flex items-center justify-center ${isSelected ? 'ring-2 ring-primary' : ''}`}
      onClick={() => onSelect?.(widget.id)}
    >
      <Badge
        variant={getVariant()}
        className=""
        style={{
          ...badgeWidget.style,
          fontSize: badgeWidget.style.fontSize ? `${badgeWidget.style.fontSize}px` : undefined,
          fontWeight: badgeWidget.style.fontWeight,
          color: badgeWidget.style.color || undefined,
          backgroundColor: badgeWidget.style.backgroundColor || undefined,
          borderRadius: badgeWidget.style.borderRadius ? `${badgeWidget.style.borderRadius}px` : undefined,
          padding: badgeWidget.style.padding || undefined,
        }}
      >
        {badgeWidget.props.text}
      </Badge>
    </div>
  );
}
