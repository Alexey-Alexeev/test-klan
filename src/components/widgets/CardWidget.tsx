import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { WidgetComponentProps, ICardWidget } from '../../types';

export function CardWidget({ widget, isSelected, onSelect }: WidgetComponentProps) {
  const cardWidget = widget as ICardWidget;
  
  return (
    <Card
      onClick={() => onSelect?.(widget.id)}
      className={`w-full h-full ${isSelected ? 'ring-2 ring-primary' : ''}`}
      style={{
        ...cardWidget.style,
        backgroundColor: cardWidget.style.backgroundColor || undefined,
        color: cardWidget.style.color || undefined,
        borderRadius: cardWidget.style.borderRadius ? `${cardWidget.style.borderRadius}px` : undefined,
        border: cardWidget.style.border,
        padding: cardWidget.style.padding,
        fontSize: cardWidget.style.fontSize ? `${cardWidget.style.fontSize}px` : undefined,
        fontWeight: cardWidget.style.fontWeight,
      }}
    >
      {cardWidget.props.imageUrl && (
        <div className="aspect-video w-full overflow-hidden rounded-t-lg">
          <img
            src={cardWidget.props.imageUrl}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{cardWidget.props.title}</CardTitle>
      </CardHeader>
      
      <CardContent className="pt-0">
        <CardDescription>{cardWidget.props.content}</CardDescription>
      </CardContent>
      
      {cardWidget.props.hasFooter && (
        <CardFooter className="pt-2">
          <div className="text-sm text-muted-foreground">Подвал карточки</div>
        </CardFooter>
      )}
    </Card>
  );
}