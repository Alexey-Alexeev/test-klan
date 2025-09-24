import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Copy, ArrowUp, ArrowDown } from 'lucide-react';
import { AlignmentGridControl, OrientationControl } from '@/components/ui/alignment-control';
import { SpacingControl, BoxModelControl } from '@/components/ui/spacing-control';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { updateWidget, deleteWidget, duplicateWidget, bringToFront, sendToBack } from '../../features/canvas/canvasSlice';
import { 
  IWidget, 
  IButtonWidget, 
  ITextWidget, 
  IInputWidget, 
  IImageWidget, 
  ICardWidget,
  IContainerWidget,
  IDividerWidget,
  ISpacerWidget,
  IIconWidget,
  IBadgeWidget,
  IAvatarWidget,
  IProgressWidget,
  ICheckboxWidget,
  IRadioWidget,
  ISelectWidget,
  ITextareaWidget,
  ISliderWidget,
  ISwitchWidget,
  ITabsWidget,
  IAccordionWidget
} from '../../types';

export function PropertiesPanel() {
  const dispatch = useAppDispatch();
  const { selectedWidgetId, widgets } = useAppSelector(state => state.canvas);
  const { isPropertiesPanelOpen } = useAppSelector(state => state.app);
  
  const selectedWidget = widgets.find(w => w.id === selectedWidgetId);
  const [localWidget, setLocalWidget] = useState<IWidget | null>(null);

  useEffect(() => {
    if (selectedWidget) {
      setLocalWidget({ ...selectedWidget });
    } else {
      setLocalWidget(null);
    }
  }, [selectedWidget]);

  const handleUpdate = (updates: Partial<IWidget>) => {
    if (!localWidget) return;
    
    const updatedWidget = { ...localWidget, ...updates } as IWidget;
    setLocalWidget(updatedWidget);
    dispatch(updateWidget({ id: localWidget.id, updates }));
  };

  const handleStyleUpdate = (styleUpdates: any) => {
    if (!localWidget) return;
    
    const updates = {
      style: { ...localWidget.style, ...styleUpdates }
    };
    handleUpdate(updates);
  };

  const handlePropsUpdate = (propsUpdates: any) => {
    if (!localWidget) return;
    
    const updates = {
      props: { ...localWidget.props, ...propsUpdates }
    };
    handleUpdate(updates);
  };

  if (!isPropertiesPanelOpen) {
    return null;
  }

  return (
    <div className="w-80 h-full bg-white border-l border-border p-4 overflow-y-auto custom-scrollbar">
      <div className="space-y-4">
        {/* Empty state */}
        {!localWidget && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Свойства элемента</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Выберите элемент на холсте, чтобы редактировать его свойства.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Widget info */}
        {localWidget && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Свойства элемента</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => dispatch(duplicateWidget(localWidget.id))}
                className="flex-1"
              >
                <Copy className="h-4 w-4 mr-2" />
                Копировать
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => dispatch(deleteWidget(localWidget.id))}
                className="flex-1 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Удалить
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => dispatch(bringToFront(localWidget.id))}
                className="flex-1"
              >
                <ArrowUp className="h-4 w-4 mr-2" />
                На передний план
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => dispatch(sendToBack(localWidget.id))}
                className="flex-1"
              >
                <ArrowDown className="h-4 w-4 mr-2" />
                На задний план
              </Button>
            </div>
          </CardContent>
        </Card>
        )}

        {/* Position and Size */}
        {localWidget && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Позиция и размер</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="x">X</Label>
                <Input
                  id="x"
                  type="number"
                  value={localWidget.position.x}
                  onChange={(e) => handleUpdate({
                    position: { ...localWidget.position, x: Number(e.target.value) }
                  })}
                />
              </div>
              <div>
                <Label htmlFor="y">Y</Label>
                <Input
                  id="y"
                  type="number"
                  value={localWidget.position.y}
                  onChange={(e) => handleUpdate({
                    position: { ...localWidget.position, y: Number(e.target.value) }
                  })}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="width">Ширина</Label>
                <Input
                  id="width"
                  type="number"
                  value={localWidget.size.width}
                  onChange={(e) => {
                    handleUpdate({
                      size: { ...localWidget.size, width: Number(e.target.value) }
                    });
                  }}
                />
              </div>
              <div>
                <Label htmlFor="height">Высота</Label>
                <Input
                  id="height"
                  type="number"
                  value={localWidget.size.height}
                  onChange={(e) => {
                    handleUpdate({
                      size: { ...localWidget.size, height: Number(e.target.value) }
                    });
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        )}

        {/* Widget-specific properties */}
        {localWidget && localWidget.type === 'button' && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Настройки кнопки</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="buttonText">Текст</Label>
                <Input
                  id="buttonText"
                  value={(localWidget as IButtonWidget).props.text}
                  onChange={(e) => handlePropsUpdate({ text: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="buttonVariant">Вариант</Label>
                <Select
                  value={(localWidget as IButtonWidget).props.variant}
                  onValueChange={(value) => handlePropsUpdate({ variant: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="primary">
                      <div className="flex items-center gap-2">
                        <span>Primary</span>
                        <Button variant="dsPrimary" className="h-6 px-2 text-[10px] pointer-events-none">Кнопка</Button>
                      </div>
                    </SelectItem>
                    <SelectItem value="accent">
                      <div className="flex items-center gap-2">
                        <span>Accent</span>
                        <Button variant="accent" className="h-6 px-2 text-[10px] pointer-events-none">Кнопка</Button>
                      </div>
                    </SelectItem>
                    <SelectItem value="pay">
                      <div className="flex items-center gap-2">
                        <span>Pay</span>
                        <Button variant="pay" className="h-6 px-2 text-[10px] pointer-events-none">Кнопка</Button>
                      </div>
                    </SelectItem>
                    <SelectItem value="success">
                      <div className="flex items-center gap-2">
                        <span>Success</span>
                        <Button variant="success" className="h-6 px-2 text-[10px] pointer-events-none">Кнопка</Button>
                      </div>
                    </SelectItem>
                    <SelectItem value="danger">
                      <div className="flex items-center gap-2">
                        <span>Danger</span>
                        <Button variant="danger" className="h-6 px-2 text-[10px] pointer-events-none">Кнопка</Button>
                      </div>
                    </SelectItem>
                    <SelectItem value="secondaryDefault">
                      <div className="flex items-center gap-2">
                        <span>Default secondary</span>
                        <Button variant="secondaryDefault" className="h-6 px-2 text-[10px] pointer-events-none">Кнопка</Button>
                      </div>
                    </SelectItem>
                    <SelectItem value="secondaryAccent">
                      <div className="flex items-center gap-2">
                        <span>Accent secondary</span>
                        <Button variant="secondaryAccent" className="h-6 px-2 text-[10px] pointer-events-none">Кнопка</Button>
                      </div>
                    </SelectItem>
                    <SelectItem value="secondaryPay">
                      <div className="flex items-center gap-2">
                        <span>Pay secondary</span>
                        <Button variant="secondaryPay" className="h-6 px-2 text-[10px] pointer-events-none">Кнопка</Button>
                      </div>
                    </SelectItem>
                    <SelectItem value="ghost">
                      <div className="flex items-center gap-2">
                        <span>Ghost</span>
                        <Button variant="ghost" className="h-6 px-2 text-[10px] pointer-events-none">Кнопка</Button>
                      </div>
                    </SelectItem>
                    <SelectItem value="secondary">Secondary (старый)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {localWidget && localWidget.type === 'text' && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Настройки текста</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="textContent">Содержимое</Label>
                <Input
                  id="textContent"
                  value={(localWidget as ITextWidget).props.content}
                  onChange={(e) => handlePropsUpdate({ content: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="textAlign">Выравнивание</Label>
                <Select
                  value={(localWidget as ITextWidget).props.align}
                  onValueChange={(value) => handlePropsUpdate({ align: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Слева</SelectItem>
                    <SelectItem value="center">По центру</SelectItem>
                    <SelectItem value="right">Справа</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="textTag">Тег</Label>
                <Select
                  value={(localWidget as ITextWidget).props.tag}
                  onValueChange={(value) => handlePropsUpdate({ tag: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="p">Параграф</SelectItem>
                    <SelectItem value="h1">Заголовок 1</SelectItem>
                    <SelectItem value="h2">Заголовок 2</SelectItem>
                    <SelectItem value="h3">Заголовок 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {localWidget && localWidget.type === 'container' && (() => {
          // Helper functions for backward compatibility
          const getPaddingValue = (side: 'top' | 'right' | 'bottom' | 'left') => {
            const padding = (localWidget as IContainerWidget).props.padding;
            if (typeof padding === 'object') {
              return padding[side];
            }
            return padding || 16;
          };

          const getMarginValue = (side: 'top' | 'right' | 'bottom' | 'left') => {
            const margin = (localWidget as IContainerWidget).props.margin;
            if (typeof margin === 'object') {
              return margin[side];
            }
            return 0;
          };

          const updatePadding = (side: 'top' | 'right' | 'bottom' | 'left', value: number) => {
            const currentPadding = (localWidget as IContainerWidget).props.padding;
            if (typeof currentPadding === 'object') {
              handlePropsUpdate({ 
                padding: { 
                  ...currentPadding, 
                  [side]: value 
                } 
              });
            } else {
              // Convert old numeric padding to new object structure
              const paddingValue = currentPadding || 16;
              handlePropsUpdate({ 
                padding: { 
                  top: side === 'top' ? value : paddingValue,
                  right: side === 'right' ? value : paddingValue,
                  bottom: side === 'bottom' ? value : paddingValue,
                  left: side === 'left' ? value : paddingValue
                } 
              });
            }
          };

          const updateMargin = (side: 'top' | 'right' | 'bottom' | 'left', value: number) => {
            const currentMargin = (localWidget as IContainerWidget).props.margin;
            if (typeof currentMargin === 'object') {
              handlePropsUpdate({ 
                margin: { 
                  ...currentMargin, 
                  [side]: value 
                } 
              });
            } else {
              // Convert old margin to new object structure
              handlePropsUpdate({ 
                margin: { 
                  top: side === 'top' ? value : 0,
                  right: side === 'right' ? value : 0,
                  bottom: side === 'bottom' ? value : 0,
                  left: side === 'left' ? value : 0
                } 
              });
            }
          };

          return (
          <>
            {/* Container Properties - Visual Controls */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Свойства контейнера</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Orientation */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">Ориентация</Label>
                  <OrientationControl
                    value={(localWidget as IContainerWidget).props.direction}
                    onChange={(value) => handlePropsUpdate({ direction: value })}
                  />
                </div>

                {/* Alignment Grid */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">Выравнивание</Label>
                  <AlignmentGridControl
                    value={(localWidget as IContainerWidget).props.alignment}
                    onChange={(value) => handlePropsUpdate({ alignment: value })}
                  />
                </div>

                {/* Gap Control */}
                <div>
                  <SpacingControl
                    value={(localWidget as IContainerWidget).props.gap}
                    onChange={(value) => handlePropsUpdate({ gap: value })}
                    label="Отступ между элементами"
                  />
                </div>

                {/* Wrap Control */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="containerWrap"
                    checked={(localWidget as IContainerWidget).props.wrap || false}
                    onChange={(e) => handlePropsUpdate({ wrap: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="containerWrap" className="text-sm">Перенос строк</Label>
                </div>
              </CardContent>
            </Card>

          </>
          );
        })()}

        {localWidget && localWidget.type === 'divider' && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Настройки разделителя</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="dividerOrientation">Ориентация</Label>
                <Select
                  value={(localWidget as IDividerWidget).props.orientation}
                  onValueChange={(value) => handlePropsUpdate({ orientation: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="horizontal">Горизонтальная</SelectItem>
                    <SelectItem value="vertical">Вертикальная</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="dividerThickness">Толщина</Label>
                <Input
                  id="dividerThickness"
                  type="number"
                  value={(localWidget as IDividerWidget).props.thickness}
                  onChange={(e) => handlePropsUpdate({ thickness: Number(e.target.value) })}
                />
              </div>
              
              <div>
                <Label htmlFor="dividerColor">Цвет</Label>
                <Input
                  id="dividerColor"
                  type="color"
                  value={(localWidget as IDividerWidget).props.color}
                  onChange={(e) => handlePropsUpdate({ color: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {localWidget && localWidget.type === 'icon' && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Настройки иконки</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="iconName">Название иконки</Label>
                <Input
                  id="iconName"
                  value={(localWidget as IIconWidget).props.name}
                  onChange={(e) => handlePropsUpdate({ name: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="iconSize">Размер</Label>
                <Input
                  id="iconSize"
                  type="number"
                  value={(localWidget as IIconWidget).props.size}
                  onChange={(e) => handlePropsUpdate({ size: Number(e.target.value) })}
                />
              </div>
              
              <div>
                <Label htmlFor="iconColor">Цвет</Label>
                <Input
                  id="iconColor"
                  type="color"
                  value={(localWidget as IIconWidget).props.color}
                  onChange={(e) => handlePropsUpdate({ color: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {localWidget && localWidget.type === 'badge' && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Настройки значка</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="badgeText">Текст</Label>
                <Input
                  id="badgeText"
                  value={(localWidget as IBadgeWidget).props.text}
                  onChange={(e) => handlePropsUpdate({ text: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="badgeVariant">Вариант</Label>
                <Select
                  value={(localWidget as IBadgeWidget).props.variant}
                  onValueChange={(value) => handlePropsUpdate({ variant: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">По умолчанию</SelectItem>
                    <SelectItem value="secondary">Вторичный</SelectItem>
                    <SelectItem value="destructive">Ошибка</SelectItem>
                    <SelectItem value="outline">Контур</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="badgeSize">Размер</Label>
                <Select
                  value={(localWidget as IBadgeWidget).props.size}
                  onValueChange={(value) => handlePropsUpdate({ size: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sm">Маленький</SelectItem>
                    <SelectItem value="md">Средний</SelectItem>
                    <SelectItem value="lg">Большой</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Style properties */}
        {localWidget && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Стили</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="fontSize">Размер шрифта</Label>
              <Input
                id="fontSize"
                type="number"
                value={localWidget.style.fontSize || 16}
                onChange={(e) => handleStyleUpdate({ fontSize: Number(e.target.value) })}
              />
            </div>
            
            <div>
              <Label htmlFor="fontWeight">Жирность шрифта</Label>
              <Select
                value={localWidget.style.fontWeight || '400'}
                onValueChange={(value) => handleStyleUpdate({ fontWeight: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="400">Обычный</SelectItem>
                  <SelectItem value="500">Средний</SelectItem>
                  <SelectItem value="600">Полужирный</SelectItem>
                  <SelectItem value="700">Жирный</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="backgroundColor">Цвет фона</Label>
              <div className="flex gap-2">
                <Input
                  id="backgroundColor"
                  type="color"
                  value={localWidget.style.backgroundColor || '#ffffff'}
                  onChange={(e) => handleStyleUpdate({ backgroundColor: e.target.value })}
                  className="w-12 h-10 p-1"
                />
                <Input
                  type="text"
                  value={localWidget.style.backgroundColor || '#ffffff'}
                  onChange={(e) => handleStyleUpdate({ backgroundColor: e.target.value })}
                  placeholder="#ffffff"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="color">Цвет текста</Label>
              <div className="flex gap-2">
                <Input
                  id="color"
                  type="color"
                  value={localWidget.style.color || '#000000'}
                  onChange={(e) => handleStyleUpdate({ color: e.target.value })}
                  className="w-12 h-10 p-1"
                />
                <Input
                  type="text"
                  value={localWidget.style.color || '#000000'}
                  onChange={(e) => handleStyleUpdate({ color: e.target.value })}
                  placeholder="#000000"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="borderRadius">Скругление углов</Label>
              <Input
                id="borderRadius"
                type="number"
                value={localWidget.style.borderRadius || 0}
                onChange={(e) => handleStyleUpdate({ borderRadius: Number(e.target.value) })}
              />
            </div>
            
            <div>
              <Label htmlFor="padding">Внутренние отступы</Label>
              <Input
                id="padding"
                type="text"
                value={localWidget.style.padding || ''}
                onChange={(e) => handleStyleUpdate({ padding: e.target.value })}
                placeholder="10px 20px"
              />
            </div>
            
            <div>
              <Label htmlFor="margin">Внешние отступы</Label>
              <Input
                id="margin"
                type="text"
                value={localWidget.style.margin || ''}
                onChange={(e) => handleStyleUpdate({ margin: e.target.value })}
                placeholder="10px 20px"
              />
            </div>
          </CardContent>
        </Card>
        )}
      </div>
    </div>
  );
}