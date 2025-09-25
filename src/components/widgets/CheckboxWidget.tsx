import { WidgetComponentProps, ICheckboxWidget } from '../../types';

export function CheckboxWidget({ widget, isSelected, onSelect }: WidgetComponentProps) {
  const checkboxWidget = widget as ICheckboxWidget;
  const bindingHint = checkboxWidget.props.binding;
  const valueBindingHint = checkboxWidget.props.valueBinding;

  return (
    <div
      className={`w-full h-full flex items-center gap-2 text-sm ${isSelected ? 'ring-2 ring-primary rounded-md px-2' : ''}`}
      onClick={() => onSelect?.(widget.id)}
      style={{
        ...checkboxWidget.style,
        fontSize: checkboxWidget.style.fontSize ? `${checkboxWidget.style.fontSize}px` : undefined,
        fontWeight: checkboxWidget.style.fontWeight,
        color: checkboxWidget.style.color || undefined,
      }}
    >
      <div className="relative flex items-center">
        <input
          type="checkbox"
          checked={checkboxWidget.props.checked}
          readOnly
          disabled={checkboxWidget.props.disabled}
          className="h-4 w-4 rounded border border-gray-400 accent-primary cursor-pointer"
        />
        {valueBindingHint && (
          <span className="absolute -top-4 left-0 text-[9px] font-semibold text-green-700 bg-green-100 rounded px-1 py-px pointer-events-none">
            {valueBindingHint}
          </span>
        )}
      </div>

      <span className="flex items-center gap-2">
        {checkboxWidget.props.label}
        {bindingHint && (
          <span className="px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide rounded bg-amber-50 text-amber-700 border border-amber-200">
            {bindingHint}
          </span>
        )}
      </span>
    </div>
  );
}

