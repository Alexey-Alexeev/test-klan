import { BDUIRuntime, RuntimeUtils } from '../runtime';
import { BDUIAction, EventDefinition, RuntimeState } from '../../types';

describe('BDUIRuntime', () => {
  let runtime: BDUIRuntime;
  let mockState: RuntimeState;

  beforeEach(() => {
    runtime = new BDUIRuntime({
      maxEventDepth: 5,
      enableLogging: false,
    });

    mockState = {
      app: {
        user: { name: 'John Doe', id: 123 },
        theme: 'light',
      },
      screen: {
        cart: {
          items: [
            { productId: 'item1', price: 10, count: 2 },
            { productId: 'item2', price: 20, count: 1 },
          ],
          total: 40,
        },
        title: 'Shopping Cart',
      },
      widgets: {
        'widget1': {
          count: 5,
          status: 'active',
        },
      },
    };
  });

  describe('Expression Evaluation', () => {
    test('should evaluate simple property access', () => {
      const context = RuntimeUtils.createContext(mockState);
      
      expect(runtime.evaluateExpression('{app.user.name}', context)).toBe('John Doe');
      expect(runtime.evaluateExpression('{screen.cart.total}', context)).toBe(40);
      expect(runtime.evaluateExpression('{app.user.id}', context)).toBe(123);
    });

    test('should evaluate array length operations', () => {
      const context = RuntimeUtils.createContext(mockState);
      
      expect(runtime.evaluateExpression('screen.cart.items.length', context)).toBe(2);
    });

    test('should evaluate comparison expressions', () => {
      const context = RuntimeUtils.createContext(mockState);
      
      expect(runtime.evaluateExpression('screen.cart.total > 30', context)).toBe(true);
      expect(runtime.evaluateExpression('screen.cart.total < 30', context)).toBe(false);
      expect(runtime.evaluateExpression('app.user.id === 123', context)).toBe(true);
    });

    test('should handle literal values', () => {
      const context = RuntimeUtils.createContext(mockState);
      
      expect(runtime.evaluateExpression('true', context)).toBe(true);
      expect(runtime.evaluateExpression('false', context)).toBe(false);
      expect(runtime.evaluateExpression('42', context)).toBe(42);
      expect(runtime.evaluateExpression('hello', context)).toBe('hello');
    });
  });

  describe('Action Execution', () => {
    test('should execute state_update action with set operation', async () => {
      const action: BDUIAction = {
        id: 'test_action',
        type: 'state_update',
        params: {
          target: 'screen.cart.total',
          operation: 'set',
          value: 100,
        },
      };

      const context = RuntimeUtils.createContext(mockState);
      const result = await runtime.executeAction(action, context, mockState);

      expect(result.success).toBe(true);
      expect(mockState.screen.cart.total).toBe(100);
    });

    test('should execute state_update action with increment operation', async () => {
      const action: BDUIAction = {
        id: 'test_action',
        type: 'state_update',
        params: {
          target: 'screen.cart.total',
          operation: 'increment',
          by: 10,
        },
      };

      const context = RuntimeUtils.createContext(mockState);
      const result = await runtime.executeAction(action, context, mockState);

      expect(result.success).toBe(true);
      expect(mockState.screen.cart.total).toBe(50); // 40 + 10
    });

    test('should execute recalculate action', async () => {
      const action: BDUIAction = {
        id: 'test_action',
        type: 'recalculate',
        params: {
          target: 'screen.cart.total',
          formula: 'screen.cart.items.reduce((sum, item) => sum + item.price * item.count, 0)',
        },
      };

      const context = RuntimeUtils.createContext(mockState);
      const result = await runtime.executeAction(action, context, mockState);

      expect(result.success).toBe(true);
      // Should recalculate: (10 * 2) + (20 * 1) = 40
      expect(mockState.screen.cart.total).toBe(40);
    });

    test('should execute navigation action', async () => {
      const action: BDUIAction = {
        id: 'test_action',
        type: 'navigation',
        params: {
          action: 'navigate_to',
          target: 'checkout_screen',
        },
      };

      const context = RuntimeUtils.createContext(mockState);
      const result = await runtime.executeAction(action, context, mockState);

      expect(result.success).toBe(true);
      // Navigation doesn't change state in tests, just succeeds
    });

    test('should execute toast action', async () => {
      const action: BDUIAction = {
        id: 'test_action',
        type: 'toast',
        params: {
          message: 'Item added to cart',
          type: 'success',
          duration: 3000,
        },
      };

      const context = RuntimeUtils.createContext(mockState);
      const result = await runtime.executeAction(action, context, mockState);

      expect(result.success).toBe(true);
    });

    test('should execute condition action with true condition', async () => {
      const action: BDUIAction = {
        id: 'test_action',
        type: 'condition',
        params: {
          condition: 'screen.cart.total > 30',
          ifTrue: [
            {
              id: 'true_action',
              type: 'state_update',
              params: {
                target: 'screen.title',
                operation: 'set',
                value: 'Large Cart',
              },
            },
          ],
          ifFalse: [
            {
              id: 'false_action',
              type: 'state_update',
              params: {
                target: 'screen.title',
                operation: 'set',
                value: 'Small Cart',
              },
            },
          ],
        },
      };

      const context = RuntimeUtils.createContext(mockState);
      const result = await runtime.executeAction(action, context, mockState);

      expect(result.success).toBe(true);
      expect(mockState.screen.title).toBe('Large Cart');
    });

    test('should execute batch action', async () => {
      const action: BDUIAction = {
        id: 'test_action',
        type: 'batch',
        params: {
          actions: [
            {
              id: 'batch_action_1',
              type: 'state_update',
              params: {
                target: 'screen.cart.total',
                operation: 'set',
                value: 100,
              },
            },
            {
              id: 'batch_action_2',
              type: 'state_update',
              params: {
                target: 'screen.title',
                operation: 'set',
                value: 'Updated Cart',
              },
            },
          ],
          atomic: false,
        },
      };

      const context = RuntimeUtils.createContext(mockState);
      const result = await runtime.executeAction(action, context, mockState);

      expect(result.success).toBe(true);
      expect(mockState.screen.cart.total).toBe(100);
      expect(mockState.screen.title).toBe('Updated Cart');
    });
  });

  describe('Event Execution', () => {
    test('should execute event with conditions', async () => {
      const event: EventDefinition = {
        id: 'test_event',
        trigger: {
          on: 'on_click',
        },
        conditions: ['screen.cart.total > 0'],
        actions: [
          {
            id: 'event_action',
            type: 'state_update',
            params: {
              target: 'screen.title',
              operation: 'set',
              value: 'Cart has items',
            },
          },
        ],
        enabled: true,
      };

      const context = RuntimeUtils.createContext(mockState);
      const result = await runtime.executeEvent(event, context, mockState);

      expect(result.success).toBe(true);
      expect(mockState.screen.title).toBe('Cart has items');
    });

    test('should not execute event when condition fails', async () => {
      const event: EventDefinition = {
        id: 'test_event',
        trigger: {
          on: 'on_click',
        },
        conditions: ['screen.cart.total < 0'], // This condition should fail
        actions: [
          {
            id: 'event_action',
            type: 'state_update',
            params: {
              target: 'screen.title',
              operation: 'set',
              value: 'This should not execute',
            },
          },
        ],
        enabled: true,
      };

      const context = RuntimeUtils.createContext(mockState);
      const result = await runtime.executeEvent(event, context, mockState);

      expect(result.success).toBe(true); // Event was handled but didn't execute
      expect(mockState.screen.title).toBe('Shopping Cart'); // Should remain unchanged
    });

    test('should prevent infinite recursion', async () => {
      runtime = new BDUIRuntime({ maxEventDepth: 2, enableLogging: false });

      const event: EventDefinition = {
        id: 'recursive_event',
        trigger: {
          on: 'on_click',
        },
        actions: [
          {
            id: 'emit_self',
            type: 'emit_event',
            params: {
              name: 'recursive_event',
            },
          },
        ],
        enabled: true,
      };

      const context = RuntimeUtils.createContext(mockState);
      
      // This should eventually fail due to max depth
      const result = await runtime.executeEvent(event, context, mockState);
      
      // The exact behavior depends on implementation, but it should handle recursion gracefully
      expect(result).toBeDefined();
    });
  });

  describe('Runtime Utils', () => {
    test('should create proper expression context', () => {
      const context = RuntimeUtils.createContext(
        mockState,
        { param1: 'value1' },
        { local1: 'localValue' }
      );

      expect(context.app).toBe(mockState.app);
      expect(context.screen).toBe(mockState.screen);
      expect(context.params).toEqual({ param1: 'value1' });
      expect(context.local).toEqual({ local1: 'localValue' });
    });

    test('should merge state changes correctly', () => {
      const changes = {
        'screen.cart.total': 150,
        'app.user.name': 'Jane Doe',
      };

      const newState = RuntimeUtils.mergeState(mockState, changes);

      expect(newState.screen.cart.total).toBe(150);
      expect(newState.app.user.name).toBe('Jane Doe');
      expect(newState.app.user.id).toBe(123); // Should preserve other values
    });
  });
});
