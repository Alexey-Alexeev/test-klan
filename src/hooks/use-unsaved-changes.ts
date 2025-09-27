import { useAppSelector } from '../store/hooks';

/**
 * Хук для определения, есть ли несохраненные изменения в конструкторе виджетов
 * Несохраненные изменения определяются как наличие виджетов в дереве компонентов
 * (кроме Root component, который всегда присутствует)
 */
export function useUnsavedChanges() {
  const { widgets } = useAppSelector(state => state.widgetBuilder);
  
  // Считаем, что есть несохраненные изменения, если есть виджеты в конструкторе
  // (не считая Root component, который может быть пустым контейнером)
  const hasUnsavedChanges = widgets.length > 0;
  
  return {
    hasUnsavedChanges,
    widgetsCount: widgets.length,
  };
}
