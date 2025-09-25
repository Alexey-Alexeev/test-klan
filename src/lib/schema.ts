import { z } from 'zod';

// Base schemas for BDUI types
export const PositionSchema = z.object({
  x: z.number(),
  y: z.number(),
});

export const SizeSchema = z.object({
  width: z.number(),
  height: z.number(),
});

export const VariableScopeSchema = z.enum(['local', 'params', 'screen', 'app']);

export const StateVariableSchema = z.object({
  id: z.string(),
  key: z.string(),
  type: z.enum(['string', 'number', 'boolean', 'array', 'object']),
  value: z.any(),
  scope: VariableScopeSchema,
  description: z.string().optional(),
});

// Action schemas
export const BaseActionSchema = z.object({
  id: z.string(),
  type: z.string(),
  meta: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    enabled: z.boolean().optional(),
  }).optional(),
});

export const NavigationActionSchema = BaseActionSchema.extend({
  type: z.literal('navigation'),
  params: z.object({
    action: z.enum(['navigate_to', 'navigate_back', 'open_modal']),
    target: z.string().optional(),
    modalId: z.string().optional(),
  }),
});

export const StateUpdateActionSchema = BaseActionSchema.extend({
  type: z.literal('state_update'),
  params: z.object({
    target: z.string(),
    operation: z.enum(['set', 'increment', 'decrement', 'push', 'remove_by_index', 'update_by_path']),
    value: z.any().optional(),
    by: z.number().optional(),
    expression: z.string().optional(),
  }),
});

export const RecalculateActionSchema = BaseActionSchema.extend({
  type: z.literal('recalculate'),
  params: z.object({
    target: z.string(),
    formula: z.string(),
  }),
});

export const ApiCallActionSchema = BaseActionSchema.extend({
  type: z.literal('api_call'),
  params: z.object({
    method: z.enum(['GET', 'POST', 'PUT', 'DELETE']),
    url: z.string(),
    headers: z.record(z.string()).optional(),
    body: z.any().optional(),
    onSuccess: z.array(z.lazy(() => BDUIActionSchema)).optional(),
    onError: z.array(z.lazy(() => BDUIActionSchema)).optional(),
    mapResponse: z.string().optional(),
  }),
});

export const EmitEventActionSchema = BaseActionSchema.extend({
  type: z.literal('emit_event'),
  params: z.object({
    name: z.string(),
    payload: z.any().optional(),
  }),
});

export const ConditionActionSchema = BaseActionSchema.extend({
  type: z.literal('condition'),
  params: z.object({
    condition: z.string(),
    ifTrue: z.array(z.lazy(() => BDUIActionSchema)),
    ifFalse: z.array(z.lazy(() => BDUIActionSchema)).optional(),
  }),
});

export const ToastActionSchema = BaseActionSchema.extend({
  type: z.literal('toast'),
  params: z.object({
    message: z.string(),
    type: z.enum(['success', 'error', 'warning', 'info']).optional(),
    duration: z.number().optional(),
  }),
});

export const WidgetControlActionSchema = BaseActionSchema.extend({
  type: z.enum(['open_widget', 'close_widget']),
  params: z.object({
    widgetInstanceId: z.string(),
  }),
});

export const StopPropagationActionSchema = BaseActionSchema.extend({
  type: z.literal('stop_propagation'),
  params: z.object({}),
});

export const BatchActionSchema = BaseActionSchema.extend({
  type: z.literal('batch'),
  params: z.object({
    actions: z.array(z.lazy(() => BDUIActionSchema)),
    atomic: z.boolean().optional(),
  }),
});

export const BDUIActionSchema = z.union([
  NavigationActionSchema,
  StateUpdateActionSchema,
  RecalculateActionSchema,
  ApiCallActionSchema,
  EmitEventActionSchema,
  ConditionActionSchema,
  ToastActionSchema,
  WidgetControlActionSchema,
  StopPropagationActionSchema,
  BatchActionSchema,
]);

// Event schemas
export const EventTriggerSchema = z.enum([
  'on_click',
  'on_longpress',
  'on_change',
  'on_load',
  'on_init',
  'on_api_success',
  'on_api_error',
  'custom_event',
]);

export const EventDefinitionSchema = z.object({
  id: z.string(),
  trigger: z.object({
    on: EventTriggerSchema,
    name: z.string().optional(),
    elementId: z.string().optional(),
  }),
  conditions: z.array(z.string()).optional(),
  actions: z.array(BDUIActionSchema),
  enabled: z.boolean().optional(),
});

// Widget schemas
export const WidgetInstanceSchema = z.object({
  id: z.string(),
  widgetId: z.string(),
  position: PositionSchema,
  size: SizeSchema,
  paramBindings: z.record(z.any()),
  localStateSnapshot: z.record(z.any()).optional(),
  zIndex: z.number(),
});

export const BDUIWidgetDefinitionSchema = z.object({
  widgetId: z.string(),
  version: z.string(),
  meta: z.object({
    name: z.string(),
    description: z.string().optional(),
    author: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
  params: z.record(z.object({
    type: z.string(),
    default: z.any().optional(),
    required: z.boolean().optional(),
    description: z.string().optional(),
  })),
  localState: z.record(StateVariableSchema),
  publicApi: z.object({
    events: z.array(z.string()).optional(),
    methods: z.record(z.object({
      params: z.array(z.any()).optional(),
      returns: z.string().optional(),
    })).optional(),
  }).optional(),
  content: z.any(),
  events: z.array(EventDefinitionSchema),
});

// Screen and App schemas
export const BDUIScreenSchema = z.object({
  id: z.string(),
  meta: z.object({
    name: z.string(),
    description: z.string().optional(),
    version: z.string().optional(),
  }),
  state: z.record(StateVariableSchema),
  content: z.any(),
  events: z.array(EventDefinitionSchema),
  widgetInstances: z.array(WidgetInstanceSchema),
});

export const BDUIAppSchema = z.object({
  meta: z.object({
    name: z.string(),
    version: z.string(),
    description: z.string().optional(),
  }),
  state: z.record(StateVariableSchema),
  screens: z.record(BDUIScreenSchema),
  widgetsRegistry: z.record(BDUIWidgetDefinitionSchema),
  apiConfig: z.object({
    baseUrl: z.string().optional(),
    allowedDomains: z.array(z.string()).optional(),
    defaultHeaders: z.record(z.string()).optional(),
  }).optional(),
});

// Extended JSON schema to support BDUI features
export const ExtendedScreenJsonSchema = z.object({
  type: z.literal('screen'),
  baseParams: z.record(z.any()),
  typeParams: z.object({
    state: z.array(z.object({
      key: z.string(),
      type: z.string(),
      value: z.any(),
    })),
    content: z.any(),
  }),
  canvasSize: z.object({
    width: z.number(),
    height: z.number(),
    device: z.string().optional(),
  }).optional(),
  // BDUI extensions
  bdui: z.object({
    state: z.record(StateVariableSchema).optional(),
    events: z.array(EventDefinitionSchema).optional(),
    widgetInstances: z.array(WidgetInstanceSchema).optional(),
    widgetsRegistry: z.record(BDUIWidgetDefinitionSchema).optional(),
  }).optional(),
});

// Validation functions
export function validateBDUIAction(action: unknown): action is z.infer<typeof BDUIActionSchema> {
  try {
    BDUIActionSchema.parse(action);
    return true;
  } catch {
    return false;
  }
}

export function validateEventDefinition(event: unknown): event is z.infer<typeof EventDefinitionSchema> {
  try {
    EventDefinitionSchema.parse(event);
    return true;
  } catch {
    return false;
  }
}

export function validateWidgetDefinition(widget: unknown): widget is z.infer<typeof BDUIWidgetDefinitionSchema> {
  try {
    BDUIWidgetDefinitionSchema.parse(widget);
    return true;
  } catch {
    return false;
  }
}

export function validateBDUIScreen(screen: unknown): screen is z.infer<typeof BDUIScreenSchema> {
  try {
    BDUIScreenSchema.parse(screen);
    return true;
  } catch {
    return false;
  }
}

export function validateBDUIApp(app: unknown): app is z.infer<typeof BDUIAppSchema> {
  try {
    BDUIAppSchema.parse(app);
    return true;
  } catch {
    return false;
  }
}

export function validateExtendedScreenJson(json: unknown): json is z.infer<typeof ExtendedScreenJsonSchema> {
  try {
    ExtendedScreenJsonSchema.parse(json);
    return true;
  } catch {
    return false;
  }
}

// Migration helpers
export function migrateLegacyScreen(legacyScreen: any): z.infer<typeof ExtendedScreenJsonSchema> {
  // Ensure the legacy screen has the basic structure
  const migrated = {
    ...legacyScreen,
    bdui: {
      state: {},
      events: [],
      widgetInstances: [],
      widgetsRegistry: {},
    },
  };

  return migrated;
}

// Schema validation with detailed error reporting
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateWithDetails(data: unknown, schema: z.ZodSchema): ValidationResult {
  try {
    schema.parse(data);
    return { valid: true, errors: [], warnings: [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      );
      return { valid: false, errors, warnings: [] };
    }
    return { valid: false, errors: ['Unknown validation error'], warnings: [] };
  }
}

// Type exports for TypeScript
export type BDUIAction = z.infer<typeof BDUIActionSchema>;
export type EventDefinition = z.infer<typeof EventDefinitionSchema>;
export type BDUIWidgetDefinition = z.infer<typeof BDUIWidgetDefinitionSchema>;
export type BDUIScreen = z.infer<typeof BDUIScreenSchema>;
export type BDUIApp = z.infer<typeof BDUIAppSchema>;
export type ExtendedScreenJson = z.infer<typeof ExtendedScreenJsonSchema>;
