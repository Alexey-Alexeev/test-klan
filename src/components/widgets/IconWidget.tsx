import { WidgetComponentProps, IIconWidget } from '../../types';
import { Star, Heart, User, Home, Settings, Search, Plus, Minus, Check, X } from 'lucide-react';

const iconMap: { [key: string]: any } = {
  star: Star,
  heart: Heart,
  user: User,
  home: Home,
  settings: Settings,
  search: Search,
  plus: Plus,
  minus: Minus,
  check: Check,
  x: X,
};

export function IconWidget({ widget, isSelected, onSelect }: WidgetComponentProps) {
  const iconWidget = widget as IIconWidget;
  const IconComponent = iconMap[iconWidget.props.name] || Star;
  
  const iconStyle = {
    width: `${iconWidget.props.size}px`,
    height: `${iconWidget.props.size}px`,
    color: iconWidget.props.color,
    ...iconWidget.style,
  };

  return (
    <div
      className={`w-full h-full flex items-center justify-center ${isSelected ? 'ring-2 ring-primary' : ''}`}
      onClick={() => onSelect?.(widget.id)}
    >
      <IconComponent style={iconStyle} />
    </div>
  );
}
