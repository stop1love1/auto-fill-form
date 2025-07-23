'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Save, Loader2, Trash2, Plus, Settings } from 'lucide-react';

interface FormField {
    id: string;
    selector: string;
    value: string;
    type: 'input' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'submit';
}

interface AutomationConfig {
    id: string;
    name: string;
    url: string;
    loadDelay: number;
    fields: FormField[];
    createdAt: string;
    updatedAt: string;
}

interface ConfigurationManagerProps {
    currentConfig: Omit<AutomationConfig, 'id' | 'name' | 'createdAt' | 'updatedAt'>;
    onLoadConfig: (config: Omit<AutomationConfig, 'id' | 'name' | 'createdAt' | 'updatedAt'>) => void;
}

export function ConfigurationManager({ currentConfig, onLoadConfig }: ConfigurationManagerProps) {
    const [configs, setConfigs] = useLocalStorage<AutomationConfig[]>('automation-configs', []);
    const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
    const [configName, setConfigName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSaveConfig = () => {
        if (!configName.trim()) return;

        const newConfig: AutomationConfig = {
            id: Date.now().toString(),
            name: configName.trim(),
            ...currentConfig,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        setConfigs((prev) => {
            const existing = prev.find((c) => c.name === newConfig.name);
            if (existing) {
                return prev.map((c) =>
                    c.name === newConfig.name ? { ...newConfig, id: c.id, createdAt: c.createdAt } : c,
                );
            }
            return [...prev, newConfig];
        });

        setConfigName('');
        setIsSaveDialogOpen(false);
    };

    const handleLoadConfig = (config: AutomationConfig) => {
        const { id, name, createdAt, updatedAt, ...configData } = config;
        onLoadConfig(configData);
    };

    const handleDeleteConfig = (configId: string) => {
        setConfigs((prev) => prev.filter((c) => c.id !== configId));
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Configuration Manager</h3>
            </div>

            <div className="flex gap-2">
                <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                            <Save className="w-4 h-4 mr-2" />
                            Save Current
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Save Configuration</DialogTitle>
                            <DialogDescription>
                                Enter a name for this configuration. It will be saved to your browser's local storage.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="config-name">Configuration Name</Label>
                                <Input
                                    id="config-name"
                                    value={configName}
                                    onChange={(e) => setConfigName(e.target.value)}
                                    placeholder="Enter configuration name"
                                    onKeyDown={(e) => e.key === 'Enter' && handleSaveConfig()}
                                />
                            </div>
                            <div className="text-sm text-muted-foreground">
                                <p>
                                    <strong>URL:</strong> {currentConfig.url || 'Not set'}
                                </p>
                                <p>
                                    <strong>Fields:</strong> {currentConfig.fields.length}
                                </p>
                                <p>
                                    <strong>Load Delay:</strong> {currentConfig.loadDelay}s
                                </p>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsSaveDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleSaveConfig} disabled={!configName.trim()}>
                                Save Configuration
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {configs.length > 0 && (
                <div className="space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground">Saved Configurations</h4>
                    <div className="grid gap-3">
                        {configs.map((config) => (
                            <Card key={config.id} className="relative">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="text-base">{config.name}</CardTitle>
                                            <CardDescription className="text-sm">{config.url}</CardDescription>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleLoadConfig(config)}
                                            >
                                                Load
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDeleteConfig(config.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <span>{config.fields.length} fields</span>
                                        <span>{config.loadDelay}s delay</span>
                                        <span>Updated: {formatDate(config.updatedAt)}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {configs.length === 0 && (
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center text-muted-foreground">
                            <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>No saved configurations</p>
                            <p className="text-sm">Save your first configuration to get started</p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
