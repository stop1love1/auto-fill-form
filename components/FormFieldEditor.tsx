'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
        { value: 'submit', label: 'Submit Button' },
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold">Form Fields</h3>
                </div>
                <Button onClick={handleAddField} disabled={disabled} size="sm" variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Field
                </Button>
            </div>

            <div className="space-y-4">
                {fields.map((field, index) => (
                    <Card key={field.id} className="relative">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base">Field {index + 1}</CardTitle>
                                <Button
                                    onClick={() => handleRemoveField(field.id)}
                                    disabled={disabled}
                                    variant="outline"
                                    size="sm"
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor={`selector-${field.id}`}>CSS Selector</Label>
                                    <Input
                                        id={`selector-${field.id}`}
                                        value={field.selector}
                                        onChange={(e) => handleFieldChange(field.id, { selector: e.target.value })}
                                        placeholder="input[name='email']"
                                        disabled={disabled}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`type-${field.id}`}>Field Type</Label>
                                    <Select
                                        value={field.type}
                                        onValueChange={(value) =>
                                            handleFieldChange(field.id, { type: value as FormField['type'] })
                                        }
                                        disabled={disabled}
                                    >
                                        <SelectTrigger>
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
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor={`value-${field.id}`}>Value</Label>
                                <Input
                                    id={`value-${field.id}`}
                                    value={field.value}
                                    onChange={(e) => handleFieldChange(field.id, { value: e.target.value })}
                                    placeholder={
                                        field.type === 'checkbox'
                                            ? 'true or false'
                                            : field.type === 'select'
                                            ? 'Option value'
                                            : field.type === 'submit'
                                            ? 'Button text (optional)'
                                            : 'Enter value to fill'
                                    }
                                    disabled={disabled}
                                />
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {fields.length === 0 && (
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center text-muted-foreground">
                                <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p>No fields added yet</p>
                                <p className="text-sm">Click "Add Field" to get started</p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
