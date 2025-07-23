'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus, Settings } from 'lucide-react';

interface FormField {
    id: string;
    selector: string;
    value: string;
    type: 'input' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'submit';
}

interface FormFieldEditorProps {
    fields: FormField[];
    onFieldsChange: (fields: FormField[]) => void;
    disabled?: boolean;
}

export function FormFieldEditor({ fields, onFieldsChange, disabled = false }: FormFieldEditorProps) {
    const handleAddField = () => {
        const newField: FormField = {
            id: `field-${Date.now()}`,
            selector: '',
            value: '',
            type: 'input',
        };
        onFieldsChange([...fields, newField]);
    };

    const handleRemoveField = (fieldId: string) => {
        onFieldsChange(fields.filter((field) => field.id !== fieldId));
    };

    const handleFieldChange = (fieldId: string, updates: Partial<FormField>) => {
        onFieldsChange(fields.map((f) => (f.id === fieldId ? { ...f, ...updates } : f)));
    };

    const fieldTypeOptions = [
        { value: 'input', label: 'Input' },
        { value: 'select', label: 'Select' },
        { value: 'textarea', label: 'Textarea' },
        { value: 'checkbox', label: 'Checkbox' },
        { value: 'radio', label: 'Radio' },
        { value: 'submit', label: 'Submit' },
    ];

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">Form Fields</span>
                </div>
                <Button onClick={handleAddField} disabled={disabled} size="sm" variant="outline">
                    <Plus className="w-3 h-3 mr-1" />
                    Add
                </Button>
            </div>

            {fields.length > 0 ? (
                <div className="border rounded-lg overflow-hidden">
                    <div className="bg-muted/50 px-3 py-2 border-b">
                        <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground">
                            <div className="col-span-4">Selector</div>
                            <div className="col-span-2">Type</div>
                            <div className="col-span-5">Value</div>
                            <div className="col-span-1">Action</div>
                        </div>
                    </div>
                    <div className="divide-y">
                        {fields.map((field, index) => (
                            <div key={field.id} className="px-3 py-2 hover:bg-muted/30 transition-colors">
                                <div className="grid grid-cols-12 gap-2 items-center">
                                    <div className="col-span-4">
                                        <Input
                                            value={field.selector}
                                            onChange={(e) => handleFieldChange(field.id, { selector: e.target.value })}
                                            placeholder="input[name='email']"
                                            disabled={disabled}
                                            className="h-8 text-xs"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <Select
                                            value={field.type}
                                            onValueChange={(value) =>
                                                handleFieldChange(field.id, { type: value as FormField['type'] })
                                            }
                                            disabled={disabled}
                                        >
                                            <SelectTrigger className="h-8 text-xs">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {fieldTypeOptions.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="col-span-5">
                                        <Input
                                            value={field.value}
                                            onChange={(e) => handleFieldChange(field.id, { value: e.target.value })}
                                            placeholder={
                                                field.type === 'checkbox'
                                                    ? 'true/false'
                                                    : field.type === 'select'
                                                    ? 'Option value'
                                                    : field.type === 'submit'
                                                    ? 'Button text'
                                                    : 'Value'
                                            }
                                            disabled={disabled}
                                            className="h-8 text-xs"
                                        />
                                    </div>
                                    <div className="col-span-1 flex justify-center">
                                        <Button
                                            onClick={() => handleRemoveField(field.id)}
                                            disabled={disabled}
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-6 text-center">
                    <Settings className="w-6 h-6 mx-auto mb-2 opacity-50" />
                    <p className="text-sm text-muted-foreground">No fields added yet</p>
                    <p className="text-xs text-muted-foreground">Click "Add" to get started</p>
                </div>
            )}
        </div>
    );
}
