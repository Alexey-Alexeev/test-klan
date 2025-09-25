import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { getFieldsForCollection } from '../../lib/dataSchemas';

interface FieldSelectorProps {
  dataSource?: { type: string; collection: string; itemAlias: string };
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
}

export function FieldSelector({ 
  dataSource, 
  value, 
  onChange, 
  label,
  placeholder = "Выберите поле"
}: FieldSelectorProps) {
  const fields = dataSource ? getFieldsForCollection(dataSource.collection) : [];
  
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Без привязки</SelectItem>
          {fields.map(field => (
            <SelectItem key={field.name} value={field.name}>
              {field.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
