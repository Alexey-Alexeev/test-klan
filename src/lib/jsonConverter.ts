import { IWidget, IContainerWidget, IButtonWidget, ITextWidget, IImageWidget, IIconWidget } from '../types';

// Интерфейсы для новой JSON структуры
export interface ScreenState {
  key: string;
  type: string;
  value: any;
}

export interface Style {
  fontSize?: number;
  fontWeight?: string | number;
  backgroundColor?: string;
  color?: string;
  padding?: string;
  borderRadius?: number;
  border?: string;
  margin?: string | { top?: number; bottom?: number; left?: number; right?: number };
}

export interface Action {
  type: string;
  [key: string]: any;
}

export interface ContentElement {
  type: string;
  text?: string;
  src?: { type: string; value: string };
  actions?: Action[];
  style?: Style;
  direction?: 'row' | 'column';
  alignment?: string;
  padding?: number;
  margin?: { top?: number; bottom?: number; left?: number; right?: number };
  gap?: number;
  widthMode?: string;
  heightMode?: string;
  heightValue?: number;
  width?: number;
  height?: number;
  variant?: string;
  disabled?: boolean;
  content?: ContentElement[];
}

export interface ScreenContent {
  type: 'screen';
  header?: ContentElement;
  content?: ContentElement;
  footer?: ContentElement;
}

export interface ScreenTypeParams {
  state: ScreenState[];
  content: ScreenContent;
}

export interface ScreenJson {
  type: 'screen';
  baseParams: Record<string, any>;
  typeParams: ScreenTypeParams;
  canvasSize?: {
    width: number;
    height: number;
    device?: string;
  };
}

// Функция для преобразования виджета в ContentElement
function widgetToContentElement(widget: IWidget, allWidgets: IWidget[]): ContentElement {
  const baseElement: ContentElement = {
    type: widget.type,
    style: {
      ...widget.style,
      margin: widget.style.margin || '0px'
    },
    // Добавляем позицию и размеры в margin и width/height
    margin: {
      top: widget.position.y,
      left: widget.position.x
    },
    width: widget.size.width,
    height: widget.size.height
  };

  switch (widget.type) {
    case 'button': {
      const buttonWidget = widget as IButtonWidget;
      return {
        ...baseElement,
        text: buttonWidget.props.text,
        variant: buttonWidget.props.variant,
        disabled: buttonWidget.props.disabled,
        style: {
          ...baseElement.style,
          padding: buttonWidget.style.padding || '12px 24px',
          backgroundColor: buttonWidget.style.backgroundColor || 'hsl(142 100% 31%)',
          color: buttonWidget.style.color || 'white',
          borderRadius: buttonWidget.style.borderRadius || 8
        }
      };
    }

    case 'text': {
      const textWidget = widget as ITextWidget;
      return {
        ...baseElement,
        text: textWidget.props.content,
        style: {
          ...baseElement.style,
          fontSize: textWidget.style.fontSize || 16,
          fontWeight: textWidget.style.fontWeight || '400'
        }
      };
    }

    case 'image': {
      const imageWidget = widget as IImageWidget;
      return {
        ...baseElement,
        src: { type: 'url', value: imageWidget.props.src },
        style: {
          ...baseElement.style,
          width: `${imageWidget.size.width}px`,
          height: `${imageWidget.size.height}px`
        }
      };
    }

    case 'icon': {
      const iconWidget = widget as IIconWidget;
      return {
        ...baseElement,
        src: { type: 'res', value: iconWidget.props.name },
        style: {
          ...baseElement.style,
          width: `${iconWidget.props.size}px`,
          height: `${iconWidget.props.size}px`,
          color: iconWidget.props.color
        }
      };
    }

    case 'container': {
      const containerWidget = widget as IContainerWidget;
      const children = containerWidget.props.children || [];
      
      return {
        ...baseElement,
        type: 'container',
        direction: containerWidget.props.direction,
        alignment: containerWidget.props.alignment,
        padding: typeof containerWidget.props.padding === 'number' 
          ? containerWidget.props.padding 
          : 16,
        // margin уже установлен в baseElement из позиции виджета
        gap: containerWidget.props.gap,
        widthMode: containerWidget.props.widthMode || 'fill',
        heightMode: containerWidget.props.heightMode || 'fixed',
        heightValue: containerWidget.props.heightValue || 200,
        style: {
          ...baseElement.style,
          backgroundColor: containerWidget.props.backgroundColor || 'rgba(240, 240, 240, 0.3)',
          border: containerWidget.props.border ? 
            `${containerWidget.props.border.width}px ${containerWidget.props.border.style} ${containerWidget.props.border.color}` : 
            '1px dashed #ccc',
          borderRadius: containerWidget.props.border?.radius ? 
            `${containerWidget.props.border.radius.topLeft}px` : 8
        },
        content: children.map(childId => {
          const childWidget = getWidgetById(childId, allWidgets);
          return childWidget ? widgetToContentElement(childWidget, allWidgets) : null;
        }).filter(Boolean) as ContentElement[]
      };
    }

    default:
      return baseElement;
  }
}

// Функция для получения виджета по ID (нужно будет передать массив виджетов)
function getWidgetById(id: string, widgets: IWidget[]): IWidget | undefined {
  return widgets.find(w => w.id === id);
}

// Основная функция для преобразования виджетов в новую JSON структуру
export function convertWidgetsToScreenJson(widgets: IWidget[], canvasSize?: { width: number; height: number }, selectedPreset?: string): ScreenJson {
  // Проверяем, что массив виджетов не пустой
  if (!widgets || widgets.length === 0) {
    const emptyScreenJson = {
      type: 'screen',
      baseParams: {},
      typeParams: {
        state: [
          {
            key: 'title',
            type: 'string',
            value: 'Пустой экран'
          }
        ],
        content: {
          type: 'screen',
          header: {
            type: 'row',
            alignment: 'center',
            padding: 16,
            gap: 8,
            content: [
              {
                type: 'icon',
                src: { type: 'res', value: 'arrow_left' },
                actions: [{ type: 'navigation_back' }]
              },
              {
                type: 'text',
                text: '{title}',
                style: {
                  fontSize: 18,
                  fontWeight: '600'
                }
              }
            ]
          },
          content: {
            type: 'column_scroll',
            gap: 16,
            padding: 16,
            content: []
          },
          footer: {}
        }
      }
    };

    // Добавляем информацию о размере canvas, если она предоставлена
    console.log('convertWidgetsToScreenJson (empty widgets) - canvasSize:', canvasSize, 'selectedPreset:', selectedPreset);
    if (canvasSize) {
      emptyScreenJson.canvasSize = {
        width: canvasSize.width,
        height: canvasSize.height,
        device: selectedPreset || 'custom'
      };
      console.log('Added canvasSize to empty screen JSON:', emptyScreenJson.canvasSize);
    } else {
      console.log('canvasSize is falsy, not adding to empty screen JSON');
    }

    return emptyScreenJson;
  }
  
  // Находим корневые виджеты (без parentId)
  const rootWidgets = widgets.filter(w => !w.parentId);
  
  // Создаем заголовок экрана
  const header: ContentElement = {
    type: 'row',
    alignment: 'center',
    padding: 16,
    gap: 8,
    content: [
      {
        type: 'icon',
        src: { type: 'res', value: 'arrow_left' },
        actions: [{ type: 'navigation_back' }]
      },
      {
        type: 'text',
        text: '{title}',
        style: {
          fontSize: 18,
          fontWeight: '600'
        }
      }
    ]
  };

  // Создаем основной контент
  const content: ContentElement = {
    type: 'column_scroll',
    gap: 16,
    padding: 16,
    content: rootWidgets.map(widget => widgetToContentElement(widget, widgets))
  };

  // Создаем структуру экрана
  const screenContent: ScreenContent = {
    type: 'screen',
    header,
    content,
    footer: {}
  };

  // Создаем финальную JSON структуру
  const screenJson: ScreenJson = {
    type: 'screen',
    baseParams: {},
    typeParams: {
      state: [
        {
          key: 'title',
          type: 'string',
          value: 'Шапка экрана'
        }
      ],
      content: screenContent
    }
  };

  // Добавляем информацию о размере canvas, если она предоставлена
  console.log('convertWidgetsToScreenJson - canvasSize:', canvasSize, 'selectedPreset:', selectedPreset);
  if (canvasSize) {
    screenJson.canvasSize = {
      width: canvasSize.width,
      height: canvasSize.height,
      device: selectedPreset || 'custom'
    };
    console.log('Added canvasSize to JSON:', screenJson.canvasSize);
  } else {
    console.log('canvasSize is falsy, not adding to JSON');
  }

  return screenJson;
}

// Функция для преобразования новой JSON структуры обратно в виджеты
export function convertScreenJsonToWidgets(screenJson: ScreenJson): { widgets: IWidget[]; canvasSize?: { width: number; height: number }; selectedPreset?: string } {
  const widgets: IWidget[] = [];
  
  // Проверяем валидность входных данных
  if (!screenJson || !screenJson.typeParams || !screenJson.typeParams.content) {
    console.warn('Неверная структура JSON экрана');
    return { widgets: [] };
  }
  
  // Рекурсивная функция для преобразования ContentElement в виджет
  function contentElementToWidget(element: ContentElement): IWidget {
    const widgetId = `widget_${element.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const baseWidget: IWidget = {
      id: widgetId,
      type: element.type as any,
      position: { 
        x: element.margin?.left || 0, 
        y: element.margin?.top || 0 
      },
      size: { 
        width: element.width || 200, 
        height: element.height || 50 
      },
      zIndex: 1,
      style: element.style || {},
      parentId: undefined // Корневые виджеты не имеют родителя
    };

    switch (element.type) {
      case 'button':
        return {
          ...baseWidget,
          props: {
            text: element.text || 'Button',
            variant: element.variant || 'primary',
            disabled: element.disabled || false
          }
        } as IButtonWidget;

      case 'text':
        return {
          ...baseWidget,
          props: {
            content: element.text || 'Text',
            align: 'left',
            tag: 'p'
          }
        } as ITextWidget;

      case 'container':
        const childWidgets = element.content?.map(child => {
          const childWidget = contentElementToWidget(child);
          // Устанавливаем родительский ID для дочерних элементов
          childWidget.parentId = widgetId;
          return childWidget;
        }) || [];
        
        widgets.push(...childWidgets);
        
        return {
          ...baseWidget,
          props: {
            alignment: element.alignment || 'top-left',
            direction: element.direction || 'column',
            wrap: false,
            gap: element.gap || 8,
            children: childWidgets.map(w => w.id),
            alpha: 100,
            rotation: 0,
            padding: element.padding || 16,
            margin: element.margin || 0,
            backgroundColor: element.style?.backgroundColor,
            scrollMode: 'none',
            clipContent: false,
            widthMode: element.widthMode || 'fill',
            heightMode: element.heightMode || 'fixed',
            heightValue: element.heightValue || 200
          }
        } as IContainerWidget;

      default:
        return baseWidget;
    }
  }

  // Преобразуем основной контент
  const screenContent = screenJson.typeParams.content;
  
  // Обрабатываем content.content (массив элементов внутри column_scroll)
  if (screenContent.content && Array.isArray(screenContent.content.content)) {
    screenContent.content.content.forEach(element => {
      const widget = contentElementToWidget(element);
      widgets.push(widget);
    });
  }
  // Fallback для старого формата - если content сам является элементом
  else if (screenContent.content && !Array.isArray(screenContent.content)) {
    const widget = contentElementToWidget(screenContent.content);
    widgets.push(widget);
  }

  // Возвращаем виджеты и информацию о canvas
  return {
    widgets,
    canvasSize: screenJson.canvasSize ? {
      width: screenJson.canvasSize.width,
      height: screenJson.canvasSize.height
    } : undefined,
    selectedPreset: screenJson.canvasSize?.device
  };
}
