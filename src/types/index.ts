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
  selectedPreset: string;
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
  activeTab: 'builder' | 'widgets' | 'templates' | 'logic';
  viewMode: 'design' | 'json' | 'preview';
  isPropertiesPanelOpen: boolean;
  sidebarCollapsed: boolean;
}

// Root state
export interface RootState {
  canvas: CanvasState;
  templates: TemplatesState;
  app: AppState;
  history: HistoryState;
  widgets: import('../features/widgets/widgetsSlice').WidgetsState;
  state: import('../features/state/stateSlice').StateManagementState;
  events: import('../features/events/eventsSlice').EventsState;
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

// BDUI Dynamic Types - Phase 1: State, Actions, Events, Widgets Registry

// Expression types
export type ExpressionValue = string | number | boolean | null | undefined;
export type VariableScope = 'local' | 'params' | 'screen' | 'app';

// State definition
export interface StateVariable {
  id: string;
  key: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  value: any;
  scope: VariableScope;
  description?: string;
}

// Action types and definitions
export type ActionType = 
  | 'navigation' 
  | 'state_update' 
  | 'recalculate' 
  | 'api_call' 
  | 'emit_event' 
  | 'condition' 
  | 'toast' 
  | 'open_widget' 
  | 'close_widget' 
  | 'stop_propagation' 
  | 'batch';

export interface BaseAction {
  id: string;
  type: ActionType;
  meta?: {
    name?: string;
    description?: string;
    enabled?: boolean;
  };
}

export interface NavigationAction extends BaseAction {
  type: 'navigation';
  params: {
    action: 'navigate_to' | 'navigate_back' | 'open_modal';
    target?: string;
    modalId?: string;
  };
}

export interface StateUpdateAction extends BaseAction {
  type: 'state_update';
  params: {
    target: string; // path to state variable
    operation: 'set' | 'increment' | 'decrement' | 'push' | 'remove_by_index' | 'update_by_path';
    value?: any;
    by?: number;
    expression?: string;
  };
}

export interface RecalculateAction extends BaseAction {
  type: 'recalculate';
  params: {
    target: string;
    formula: string;
  };
}

export interface ApiCallAction extends BaseAction {
  type: 'api_call';
  params: {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    url: string;
    headers?: Record<string, string>;
    body?: any;
    onSuccess?: BDUIAction[];
    onError?: BDUIAction[];
    mapResponse?: string; // expression to map response to state
  };
}

export interface EmitEventAction extends BaseAction {
  type: 'emit_event';
  params: {
    name: string;
    payload?: any;
  };
}

export interface ConditionAction extends BaseAction {
  type: 'condition';
  params: {
    condition: string; // expression
    ifTrue: BDUIAction[];
    ifFalse?: BDUIAction[];
  };
}

export interface ToastAction extends BaseAction {
  type: 'toast';
  params: {
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
  };
}

export interface WidgetControlAction extends BaseAction {
  type: 'open_widget' | 'close_widget';
  params: {
    widgetInstanceId: string;
  };
}

export interface StopPropagationAction extends BaseAction {
  type: 'stop_propagation';
  params: {};
}

export interface BatchAction extends BaseAction {
  type: 'batch';
  params: {
    actions: BDUIAction[];
    atomic?: boolean; // if true, rollback on any failure
  };
}

export type BDUIAction = 
  | NavigationAction 
  | StateUpdateAction 
  | RecalculateAction 
  | ApiCallAction 
  | EmitEventAction 
  | ConditionAction 
  | ToastAction 
  | WidgetControlAction 
  | StopPropagationAction 
  | BatchAction;

// Event definitions
export type EventTrigger = 
  | 'on_click' 
  | 'on_longpress' 
  | 'on_change' 
  | 'on_load' 
  | 'on_init' 
  | 'on_api_success' 
  | 'on_api_error'
  | 'custom_event';

export interface EventDefinition {
  id: string;
  trigger: {
    on: EventTrigger;
    name?: string; // for custom events
    elementId?: string; // specific element that triggers this event
  };
  conditions?: string[]; // array of condition expressions
  actions: BDUIAction[];
  enabled?: boolean;
}

// Widget definition (extended)
export interface BDUIWidgetDefinition {
  widgetId: string;
  version: string;
  meta: {
    name: string;
    description?: string;
    author?: string;
    tags?: string[];
  };
  params: Record<string, {
    type: string;
    default?: any;
    required?: boolean;
    description?: string;
  }>;
  localState: Record<string, StateVariable>;
  publicApi?: {
    events?: string[];
    methods?: Record<string, {
      params?: any[];
      returns?: string;
    }>;
  };
  content: any; // existing layout JSON
  events: EventDefinition[];
}

// Widget instance
export interface WidgetInstance {
  id: string;
  widgetId: string;
  position: IPosition;
  size: ISize;
  paramBindings: Record<string, any>; // param name -> value or expression
  localStateSnapshot?: Record<string, any>;
  zIndex: number;
}

// Enhanced screen structure
export interface BDUIScreen {
  id: string;
  meta: {
    name: string;
    description?: string;
    version?: string;
  };
  state: Record<string, StateVariable>;
  content: any; // existing layout JSON
  events: EventDefinition[];
  widgetInstances: WidgetInstance[];
}

// App-level structure
export interface BDUIApp {
  meta: {
    name: string;
    version: string;
    description?: string;
  };
  state: Record<string, StateVariable>; // global state
  screens: Record<string, BDUIScreen>;
  widgetsRegistry: Record<string, BDUIWidgetDefinition>;
  apiConfig?: {
    baseUrl?: string;
    allowedDomains?: string[];
    defaultHeaders?: Record<string, string>;
  };
}

// Runtime state management
export interface RuntimeState {
  app: Record<string, any>;
  screen: Record<string, any>;
  widgets: Record<string, Record<string, any>>; // widgetInstanceId -> local state
}

// Expression evaluation context
export interface ExpressionContext {
  app: Record<string, any>;
  screen: Record<string, any>;
  local?: Record<string, any>;
  params?: Record<string, any>;
}

// Event system
export interface EventPayload {
  eventId: string;
  trigger: EventTrigger;
  elementId?: string;
  data?: any;
  timestamp: number;
}

// Enhanced widget types with actions and bindings
export interface IWidgetActions {
  actions?: BDUIAction[];
  bindings?: Record<string, string>; // property -> expression
}

// Update existing widget interfaces to include actions
declare module './index' {
  interface IWidgetBase {
    actions?: BDUIAction[];
    bindings?: Record<string, string>;
  }
}