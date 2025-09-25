export interface IPosition {
  x: number;
  y: number;
}

export interface ISize {
  width: number;
  height: number;
}

export interface IWidgetStyle {
  backgroundColor?: string;
  color?: string;
  fontSize?: number;
  fontWeight?: string;
  border?: string;
  borderRadius?: number;
  padding?: string;
  margin?: string;
  width?: string;
  height?: string;
  minWidth?: string;
  minHeight?: string;
  maxWidth?: string;
  maxHeight?: string;
}

// Widget types
export type WidgetType = 'button' | 'text' | 'input' | 'image' | 'card' | 'divider' | 'spacer' | 'icon' | 'badge' | 'avatar' | 'progress' | 'checkbox' | 'radio' | 'select' | 'textarea' | 'slider' | 'switch' | 'tabs' | 'accordion' | 'container' | 'root';

export interface IDataBindingSource {
  type: 'table';
  collection: string;
  itemAlias?: string;
  limit?: number;
}

export interface IWidgetBase {
  id: string;
  type: WidgetType;
  position: IPosition;
  size: ISize;
  zIndex: number;
  style: IWidgetStyle;
  zone?: 'header' | 'main' | 'footer';
  parentId?: string; // ID of parent container
}

export interface IButtonWidget extends IWidgetBase {
  type: 'button';
  props: {
    text: string;
    variant: 'primary' | 'secondary' | 'accent' | 'pay' | 'success' | 'danger' | 'secondaryDefault' | 'secondaryAccent' | 'secondaryPay' | 'ghost';
    disabled: boolean;
    onClick?: string; // Action identifier
  };
}

export interface ITextWidget extends IWidgetBase {
  type: 'text';
  props: {
    content: string;
    align: 'left' | 'center' | 'right';
    tag: 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    binding?: string; // e.g. shop.name
  };
}

export interface IInputWidget extends IWidgetBase {
  type: 'input';
  props: {
    placeholder: string;
    inputType: 'text' | 'email' | 'password' | 'number';
    required: boolean;
    disabled: boolean;
  };
}

export interface IImageWidget extends IWidgetBase {
  type: 'image';
  props: {
    src: string;
    alt: string;
    objectFit: 'cover' | 'contain' | 'fill' | 'none';
  };
}

export interface ICardWidget extends IWidgetBase {
  type: 'card';
  props: {
    title: string;
    content: string;
    imageUrl?: string;
    hasFooter: boolean;
  };
}


export interface IDividerWidget extends IWidgetBase {
  type: 'divider';
  props: {
    orientation: 'horizontal' | 'vertical';
    thickness: number;
    color: string;
  };
}

export interface ISpacerWidget extends IWidgetBase {
  type: 'spacer';
  props: {
    size: number;
  };
}

export interface IIconWidget extends IWidgetBase {
  type: 'icon';
  props: {
    name: string;
    size: number;
    color: string;
  };
}

export interface IBadgeWidget extends IWidgetBase {
  type: 'badge';
  props: {
    text: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
    size: 'sm' | 'md' | 'lg';
  };
}

export interface IAvatarWidget extends IWidgetBase {
  type: 'avatar';
  props: {
    src?: string;
    alt: string;
    fallback: string;
    size: number;
  };
}

export interface IProgressWidget extends IWidgetBase {
  type: 'progress';
  props: {
    value: number;
    max: number;
    showValue: boolean;
    variant: 'default' | 'success' | 'warning' | 'error';
  };
}

export interface ICheckboxWidget extends IWidgetBase {
  type: 'checkbox';
  props: {
    label: string;
    checked: boolean;
    disabled: boolean;
    binding?: string; // Optional data binding for label
    valueBinding?: string; // Optional binding for checked state
  };
}

export interface IRadioWidget extends IWidgetBase {
  type: 'radio';
  props: {
    label: string;
    checked: boolean;
    disabled: boolean;
    name: string;
  };
}

export interface ISelectWidget extends IWidgetBase {
  type: 'select';
  props: {
    placeholder: string;
    options: string[];
    disabled: boolean;
  };
}

export interface ITextareaWidget extends IWidgetBase {
  type: 'textarea';
  props: {
    placeholder: string;
    rows: number;
    disabled: boolean;
    resize: 'none' | 'both' | 'horizontal' | 'vertical';
  };
}

export interface ISliderWidget extends IWidgetBase {
  type: 'slider';
  props: {
    min: number;
    max: number;
    step: number;
    value: number;
    disabled: boolean;
  };
}

export interface ISwitchWidget extends IWidgetBase {
  type: 'switch';
  props: {
    label: string;
    checked: boolean;
    disabled: boolean;
  };
}

export interface ITabsWidget extends IWidgetBase {
  type: 'tabs';
  props: {
    tabs: Array<{ id: string; label: string; content: string }>;
    activeTab: string;
  };
}

export interface IAccordionWidget extends IWidgetBase {
  type: 'accordion';
  props: {
    items: Array<{ id: string; title: string; content: string; open: boolean }>;
    type: 'single' | 'multiple';
  };
}

export interface IContainerWidget extends IWidgetBase {
  type: 'container';
  props: {
    alignment:
      | 'top-left'
      | 'top-center'
      | 'top-right'
      | 'center-left'
      | 'center'
      | 'center-right'
      | 'bottom-left'
      | 'bottom-center'
      | 'bottom-right'
      // Legacy values for backward compatibility
      | 'top'
      | 'bottom';
    direction: 'row' | 'column';
    wrap: boolean;
    gap: number;
    children: string[]; // Array of child widget IDs
    alpha?: number; // Opacity 0-100
    rotation?: number; // Rotation in degrees
    padding?: number | { top: number; right: number; bottom: number; left: number };
    margin?: number | { top: number; right: number; bottom: number; left: number };
    backgroundColor?: string;
    backgroundImage?: string;
    border?: {
      color: string;
      width: number;
      style: 'solid' | 'dashed' | 'dotted';
      radius?: {
        topLeft: number;
        topRight: number;
        bottomLeft: number;
        bottomRight: number;
      };
    };
    scrollMode?: 'none' | 'vertical' | 'horizontal' | 'both';
    clipContent?: boolean;
    widthMode?: 'fixed' | 'fill' | 'wrap-content';
    heightMode?: 'fixed' | 'fill' | 'wrap-content';
    widthValue?: number;
    heightValue?: number;
    dataSource?: IDataBindingSource;
  };
}

export type IWidget = 
  | IButtonWidget 
  | ITextWidget 
  | IInputWidget 
  | IImageWidget 
  | ICardWidget
  | IDividerWidget
  | ISpacerWidget
  | IIconWidget
  | IBadgeWidget
  | IAvatarWidget
  | IProgressWidget
  | ICheckboxWidget
  | IRadioWidget
  | ISelectWidget
  | ITextareaWidget
  | ISliderWidget
  | ISwitchWidget
  | ITabsWidget
  | IAccordionWidget
  | IContainerWidget;

// Template interface
export interface ITemplate {
  id: string;
  name: string;
  description?: string;
  widgets: IWidget[];
  createdAt: string;
  updatedAt: string;
  thumbnail?: string; // Base64 или URL для превью
}

// Canvas state
export interface CanvasState {
  widgets: IWidget[];
  selectedWidgetId: string | null;
  selectedWidgetIds: string[];
  canvasSize: { width: number; height: number };
  isCanvasSizeLocked: boolean;
  gridSnap: boolean;
  snapSize: number;
  zoom: number;
  panOffset: IPosition;
  showRulers: boolean;
  gridSize: number;
  showGrid: boolean;
  isMultiSelecting: boolean;
  selectionBox: { x: number; y: number; width: number; height: number } | null;
  viewportCenter?: IPosition;
}

// Templates state
export interface TemplatesState {
  templates: ITemplate[];
  currentTemplateId: string | null;
  loading: boolean;
  error: string | null;
}

// History state
export interface HistoryState {
  past: CanvasState[];
  present: CanvasState;
  future: CanvasState[];
  maxHistorySize: number;
}

// App state
export interface AppState {
  activeTab: 'builder' | 'widgets' | 'templates';
  viewMode: 'design' | 'json';
  isPropertiesPanelOpen: boolean;
  sidebarCollapsed: boolean;
}

// Root state
export interface RootState {
  canvas: CanvasState;
  templates: TemplatesState;
  app: AppState;
  history: HistoryState;
}

// Widget component props for rendering
export interface WidgetComponentProps {
  widget: IWidget;
  isSelected?: boolean;
  isEditable?: boolean;
  onSelect?: (id: string) => void;
  onUpdate?: (id: string, updates: Partial<IWidget>) => void;
}

// Drag and drop types
export interface DragItem {
  type: 'widget';
  widgetType: WidgetType;
  id?: string; // For existing widgets being moved
}

// Available widget definitions for the component library
export interface WidgetDefinition {
  type: WidgetType;
  name: string;
  description: string;
  icon: string; // Lucide icon name
  category: 'basic' | 'form' | 'layout' | 'media';
  defaultProps: any;
  defaultStyle: IWidgetStyle;
  defaultSize: ISize;
}