import { BDUIAction, EventDefinition, ExpressionContext, RuntimeState } from '../types';

export interface RuntimeOptions {
  maxEventDepth: number;
  enableLogging: boolean;
  apiBaseUrl?: string;
  allowedDomains?: string[];
}

export interface RuntimeResult {
  success: boolean;
  error?: string;
  stateChanges?: Record<string, any>;
  logs?: string[];
}

export class BDUIRuntime {
  private eventDepth = 0;
  private logs: string[] = [];
  private options: RuntimeOptions;

  constructor(options: Partial<RuntimeOptions> = {}) {
    this.options = {
      maxEventDepth: 10,
      enableLogging: true,
      allowedDomains: ['localhost', '127.0.0.1'],
      ...options,
    };
  }

  // Expression evaluation with sandboxed environment
  evaluateExpression(expression: string, context: ExpressionContext): any {
    try {
      // Simple expression parser - supports basic operations and property access
      // In a real implementation, you'd use a proper expression parser like jexl or similar
      
      // Handle simple property access like {screen.title} or {app.user.name}
      const propertyMatch = expression.match(/^\{([^}]+)\}$/);
      if (propertyMatch) {
        const path = propertyMatch[1];
        return this.getValueByPath(context, path);
      }

      // Handle arithmetic expressions
      if (expression.includes('+') || expression.includes('-') || expression.includes('*') || expression.includes('/')) {
        return this.evaluateArithmetic(expression, context);
      }

      // Handle comparison expressions
      if (expression.includes('===') || expression.includes('!==') || expression.includes('>') || expression.includes('<')) {
        return this.evaluateComparison(expression, context);
      }

      // Handle array/object operations
      if (expression.includes('.length') || expression.includes('.reduce') || expression.includes('.filter')) {
        return this.evaluateCollectionOperation(expression, context);
      }

      // Return literal values
      if (expression === 'true') return true;
      if (expression === 'false') return false;
      if (expression === 'null') return null;
      if (expression === 'undefined') return undefined;
      if (!isNaN(Number(expression))) return Number(expression);
      
      return expression; // Return as string literal
    } catch (error) {
      this.log(`Expression evaluation error: ${error}`);
      return undefined;
    }
  }

  private getValueByPath(context: ExpressionContext, path: string): any {
    const parts = path.split('.');
    let current: any = context;

    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return undefined;
      }
    }

    return current;
  }

  private evaluateArithmetic(expression: string, context: ExpressionContext): number {
    // Simple arithmetic evaluation
    // Replace variables with their values
    let processedExpression = expression;
    
    // Find and replace variable references
    const variablePattern = /\b(app|screen|local|params)\.[\w.]+\b/g;
    processedExpression = processedExpression.replace(variablePattern, (match) => {
      const value = this.getValueByPath(context, match);
      return String(value || 0);
    });

    // Basic arithmetic evaluation (unsafe but simple for demo)
    try {
      // Only allow basic math operations
      if (!/^[\d\s+\-*/().]+$/.test(processedExpression)) {
        throw new Error('Invalid arithmetic expression');
      }
      return eval(processedExpression);
    } catch {
      return 0;
    }
  }

  private evaluateComparison(expression: string, context: ExpressionContext): boolean {
    // Simple comparison evaluation
    const operators = ['===', '!==', '>=', '<=', '>', '<'];
    
    for (const op of operators) {
      if (expression.includes(op)) {
        const [left, right] = expression.split(op).map(s => s.trim());
        const leftValue = this.evaluateExpression(left, context);
        const rightValue = this.evaluateExpression(right, context);
        
        switch (op) {
          case '===': return leftValue === rightValue;
          case '!==': return leftValue !== rightValue;
          case '>=': return leftValue >= rightValue;
          case '<=': return leftValue <= rightValue;
          case '>': return leftValue > rightValue;
          case '<': return leftValue < rightValue;
        }
      }
    }
    
    return false;
  }

  private evaluateCollectionOperation(expression: string, context: ExpressionContext): any {
    // Handle array operations like items.length or items.reduce(...)
    try {
      // This is a simplified implementation
      // In production, you'd want a proper expression parser
      
      if (expression.includes('.length')) {
        const arrayPath = expression.replace('.length', '');
        const array = this.getValueByPath(context, arrayPath);
        return Array.isArray(array) ? array.length : 0;
      }

      if (expression.includes('.reduce')) {
        // Handle simple reduce operations like "items.reduce((sum, item) => sum + item.price, 0)"
        const arrayPath = expression.split('.reduce')[0];
        const array = this.getValueByPath(context, arrayPath);
        
        if (Array.isArray(array)) {
          // Simple sum reduction for demo
          return array.reduce((sum: number, item: any) => {
            return sum + (typeof item === 'object' && item.price ? item.price : 0);
          }, 0);
        }
      }

      return undefined;
    } catch {
      return undefined;
    }
  }

  // Execute a single action
  async executeAction(action: BDUIAction, context: ExpressionContext, state: RuntimeState): Promise<RuntimeResult> {
    this.log(`Executing action: ${action.type}`);

    try {
      switch (action.type) {
        case 'state_update':
          return this.executeStateUpdate(action, context, state);
        
        case 'recalculate':
          return this.executeRecalculate(action, context, state);
        
        case 'navigation':
          return this.executeNavigation(action, context);
        
        case 'toast':
          return this.executeToast(action, context);
        
        case 'emit_event':
          return this.executeEmitEvent(action, context);
        
        case 'condition':
          return this.executeCondition(action, context, state);
        
        case 'batch':
          return this.executeBatch(action, context, state);
        
        case 'api_call':
          return await this.executeApiCall(action, context, state);
        
        default:
          return {
            success: false,
            error: `Unsupported action type: ${action.type}`,
          };
      }
    } catch (error) {
      return {
        success: false,
        error: `Action execution failed: ${error}`,
      };
    }
  }

  private executeStateUpdate(action: BDUIAction, context: ExpressionContext, state: RuntimeState): RuntimeResult {
    const { target, operation, value, by, expression } = action.params;
    
    // Determine target scope and path
    const [scope, ...pathParts] = target.split('.');
    const path = pathParts.join('.');
    
    if (!['app', 'screen', 'local'].includes(scope)) {
      return { success: false, error: `Invalid state scope: ${scope}` };
    }

    const targetState = state[scope as keyof RuntimeState] as Record<string, any>;
    
    let newValue: any;
    
    switch (operation) {
      case 'set':
        newValue = expression ? this.evaluateExpression(expression, context) : value;
        break;
      
      case 'increment':
        newValue = (targetState[path] || 0) + (by || 1);
        break;
      
      case 'decrement':
        newValue = (targetState[path] || 0) - (by || 1);
        break;
      
      case 'push':
        if (!Array.isArray(targetState[path])) {
          targetState[path] = [];
        }
        newValue = [...targetState[path], value];
        break;
      
      case 'remove_by_index':
        if (Array.isArray(targetState[path])) {
          const index = typeof value === 'number' ? value : parseInt(value);
          newValue = targetState[path].filter((_: any, i: number) => i !== index);
        }
        break;
      
      default:
        return { success: false, error: `Unsupported operation: ${operation}` };
    }

    // Update state
    this.setValueByPath(targetState, path, newValue);
    
    return {
      success: true,
      stateChanges: { [target]: newValue },
    };
  }

  private executeRecalculate(action: BDUIAction, context: ExpressionContext, state: RuntimeState): RuntimeResult {
    const { target, formula } = action.params;
    
    // Evaluate formula
    const result = this.evaluateExpression(formula, context);
    
    // Update target
    const [scope, ...pathParts] = target.split('.');
    const path = pathParts.join('.');
    
    if (!['app', 'screen', 'local'].includes(scope)) {
      return { success: false, error: `Invalid state scope: ${scope}` };
    }

    const targetState = state[scope as keyof RuntimeState] as Record<string, any>;
    this.setValueByPath(targetState, path, result);
    
    return {
      success: true,
      stateChanges: { [target]: result },
    };
  }

  private executeNavigation(action: BDUIAction, context: ExpressionContext): RuntimeResult {
    const { action: navAction, target, modalId } = action.params;
    
    this.log(`Navigation: ${navAction} ${target || modalId || ''}`);
    
    // In a real implementation, this would trigger actual navigation
    // For now, just log the navigation intent
    
    return { success: true };
  }

  private executeToast(action: BDUIAction, context: ExpressionContext): RuntimeResult {
    const { message, type, duration } = action.params;
    
    const evaluatedMessage = this.evaluateExpression(message, context);
    
    this.log(`Toast: ${evaluatedMessage} (${type || 'info'})`);
    
    // In a real implementation, this would trigger a toast notification
    
    return { success: true };
  }

  private executeEmitEvent(action: BDUIAction, context: ExpressionContext): RuntimeResult {
    const { name, payload } = action.params;
    
    this.log(`Emit event: ${name}`);
    
    // In a real implementation, this would trigger event handlers
    
    return { success: true };
  }

  private executeCondition(action: BDUIAction, context: ExpressionContext, state: RuntimeState): RuntimeResult {
    const { condition, ifTrue, ifFalse } = action.params;
    
    const conditionResult = this.evaluateExpression(condition, context);
    const actionsToExecute = conditionResult ? ifTrue : (ifFalse || []);
    
    // Execute conditional actions (simplified - no async handling)
    for (const condAction of actionsToExecute) {
      this.executeAction(condAction, context, state);
    }
    
    return { success: true };
  }

  private executeBatch(action: BDUIAction, context: ExpressionContext, state: RuntimeState): RuntimeResult {
    const { actions, atomic } = action.params;
    
    if (atomic) {
      // For atomic execution, we'd need to implement rollback
      // For now, just execute sequentially
    }
    
    for (const batchAction of actions) {
      this.executeAction(batchAction, context, state);
    }
    
    return { success: true };
  }

  private async executeApiCall(action: BDUIAction, context: ExpressionContext, state: RuntimeState): Promise<RuntimeResult> {
    const { method, url, headers, body, onSuccess, onError, mapResponse } = action.params;
    
    try {
      // Validate URL against allowed domains
      if (this.options.allowedDomains) {
        const urlObj = new URL(url);
        if (!this.options.allowedDomains.some(domain => urlObj.hostname.includes(domain))) {
          throw new Error(`Domain not allowed: ${urlObj.hostname}`);
        }
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Execute success actions
      if (onSuccess) {
        for (const successAction of onSuccess) {
          await this.executeAction(successAction, { ...context, response: data }, state);
        }
      }

      // Map response to state if specified
      if (mapResponse) {
        const mappedValue = this.evaluateExpression(mapResponse, { ...context, response: data });
        // Apply mapped value to state (simplified)
      }

      return { success: true };
    } catch (error) {
      // Execute error actions
      if (onError) {
        for (const errorAction of onError) {
          await this.executeAction(errorAction, { ...context, error }, state);
        }
      }

      return {
        success: false,
        error: `API call failed: ${error}`,
      };
    }
  }

  // Execute an event (trigger + conditions + actions)
  async executeEvent(event: EventDefinition, context: ExpressionContext, state: RuntimeState): Promise<RuntimeResult> {
    if (this.eventDepth >= this.options.maxEventDepth) {
      return {
        success: false,
        error: 'Maximum event depth exceeded',
      };
    }

    this.eventDepth++;
    
    try {
      this.log(`Executing event: ${event.id}`);

      // Check conditions
      if (event.conditions && event.conditions.length > 0) {
        for (const condition of event.conditions) {
          const conditionResult = this.evaluateExpression(condition, context);
          if (!conditionResult) {
            this.log(`Event ${event.id} condition failed: ${condition}`);
            return { success: true }; // Event was handled but didn't execute
          }
        }
      }

      // Execute actions
      const results: RuntimeResult[] = [];
      for (const action of event.actions) {
        const result = await this.executeAction(action, context, state);
        results.push(result);
        
        if (!result.success) {
          this.log(`Action failed: ${result.error}`);
          break; // Stop on first failure
        }
      }

      return {
        success: results.every(r => r.success),
        logs: this.logs,
      };
    } finally {
      this.eventDepth--;
    }
  }

  private setValueByPath(obj: any, path: string, value: any): void {
    const parts = path.split('.');
    let current = obj;
    
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!(part in current) || typeof current[part] !== 'object') {
        current[part] = {};
      }
      current = current[part];
    }
    
    current[parts[parts.length - 1]] = value;
  }

  private log(message: string): void {
    if (this.options.enableLogging) {
      this.logs.push(`[${new Date().toISOString()}] ${message}`);
      console.log(`[BDUI Runtime] ${message}`);
    }
  }

  // Get current logs
  getLogs(): string[] {
    return [...this.logs];
  }

  // Clear logs
  clearLogs(): void {
    this.logs = [];
  }
}

// Factory function
export function createRuntime(options?: Partial<RuntimeOptions>): BDUIRuntime {
  return new BDUIRuntime(options);
}

// Helper functions for common operations
export const RuntimeUtils = {
  // Create expression context from state
  createContext(state: RuntimeState, widgetParams?: Record<string, any>, widgetLocal?: Record<string, any>): ExpressionContext {
    return {
      app: state.app,
      screen: state.screen,
      params: widgetParams,
      local: widgetLocal,
    };
  },

  // Simple state merger
  mergeState(current: RuntimeState, changes: Record<string, any>): RuntimeState {
    const newState = { ...current };
    
    for (const [path, value] of Object.entries(changes)) {
      const [scope, ...pathParts] = path.split('.');
      const targetPath = pathParts.join('.');
      
      if (scope in newState) {
        const target = newState[scope as keyof RuntimeState] as Record<string, any>;
        if (targetPath) {
          // Set nested value
          const parts = targetPath.split('.');
          let current = target;
          for (let i = 0; i < parts.length - 1; i++) {
            if (!(parts[i] in current)) {
              current[parts[i]] = {};
            }
            current = current[parts[i]];
          }
          current[parts[parts.length - 1]] = value;
        } else {
          // Set top-level value
          target[pathParts[0]] = value;
        }
      }
    }
    
    return newState;
  },
};
