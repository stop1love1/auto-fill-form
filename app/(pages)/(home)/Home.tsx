'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Loader2, Globe, Clock, Settings } from 'lucide-react';
import { ConfigurationManager } from '@/components/ConfigurationManager';
import { FormFieldEditor } from '@/components/FormFieldEditor';
import { LogsPanel } from '@/components/LogsPanel';
import { ResultPanel } from '@/components/ResultPanel';
import { useLocalStorage } from '@/hooks/use-local-storage';

interface FormField {
    id: string;
    selector: string;
    value: string;
    type: 'input' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'submit';
}

interface AutomationConfig {
    url: string;
    loadDelay: number;
    fields: FormField[];
}

export default function Home() {
    const [config, setConfig] = useLocalStorage<AutomationConfig>('current-config', {
        url: '',
        loadDelay: 3,
        fields: [],
    });
    const [isRunning, setIsRunning] = useState(false);
    const [logs, setLogs] = useLocalStorage<string[]>('automation-logs', []);
    const [result, setResult] = useState<{
        screenshot?: string;
        fieldsProcessed?: number;
        isVisible: boolean;
    }>({ isVisible: false });

    const addLog = useCallback(
        (message: string) => {
            const timestamp = new Date().toLocaleTimeString();
            setLogs((prev) => [...prev, `${timestamp}: ${message}`]);
        },
        [setLogs],
    );

    const clearLogs = useCallback(() => {
        setLogs([]);
    }, [setLogs]);

    const handleLoadConfig = useCallback(
        (loadedConfig: AutomationConfig) => {
            setConfig(loadedConfig);
            addLog(`Configuration loaded: ${loadedConfig.url}`);
        },
        [setConfig, addLog],
    );

    const handleStartAutomation = useCallback(async () => {
        if (!config.url.trim()) {
            addLog('Error: Please enter a valid URL');
            return;
        }

        if (config.fields.length === 0) {
            addLog('Error: Please add at least one form field');
            return;
        }

        setIsRunning(true);
        addLog('Starting automation...');

        try {
            addLog(`Sending request to automate form...`);
            const response = await fetch('/api/automate-form', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(config),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const responseResult = await response.json();
            addLog(`✅ Automation completed: ${responseResult.message}`);
            addLog(`📊 Fields processed: ${responseResult.fieldsProcessed}`);
            addLog(`📸 Screenshot captured: ${responseResult.screenshot ? 'Yes' : 'No'}`);
            addLog(`🌐 Browser remains open for manual inspection`);

            // Set result data for display
            setResult({
                screenshot: responseResult.screenshot,
                fieldsProcessed: responseResult.fieldsProcessed,
                isVisible: true,
            });

            // Debug screenshot
            console.log('Screenshot length:', responseResult.screenshot?.length);
            console.log('Screenshot preview:', responseResult.screenshot?.substring(0, 50));

            // Log each field that was processed
            config.fields.forEach((field) => {
                addLog(`✓ Filled: ${field.selector} = "${field.value}"`);
            });
        } catch (error) {
            addLog(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsRunning(false);
        }
    }, [config, addLog]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="p-3 bg-blue-600 rounded-full">
                            <Globe className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Auto Form Filler</h1>
                    <p className="text-gray-600 text-lg">
                        Automate form filling with Puppeteer - Save and manage your configurations
                    </p>
                </div>

                {/* Main Layout - Left: Automation Controls, Right: Logs */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Side - Automation Controls */}
                    <div className="space-y-6">
                        <Tabs defaultValue="configuration" className="space-y-6">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="configuration">Configuration</TabsTrigger>
                                <TabsTrigger value="fields">Form Fields</TabsTrigger>
                            </TabsList>

                            <TabsContent value="configuration" className="space-y-6">
                                <div className="grid grid-cols-1 gap-6">
                                    {/* Basic Configuration */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Settings className="w-5 h-5" />
                                                Basic Configuration
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="url">Website URL</Label>
                                                <Input
                                                    id="url"
                                                    type="url"
                                                    value={config.url}
                                                    onChange={(e) =>
                                                        setConfig((prev) => ({ ...prev, url: e.target.value }))
                                                    }
                                                    placeholder="https://example.com/form"
                                                    disabled={isRunning}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="loadDelay">Load Delay (seconds)</Label>
                                                <Input
                                                    id="loadDelay"
                                                    type="number"
                                                    min="0"
                                                    max="60"
                                                    value={config.loadDelay}
                                                    onChange={(e) =>
                                                        setConfig((prev) => ({
                                                            ...prev,
                                                            loadDelay: parseInt(e.target.value) || 0,
                                                        }))
                                                    }
                                                    disabled={isRunning}
                                                />
                                            </div>

                                            <Button
                                                onClick={handleStartAutomation}
                                                disabled={isRunning || !config.url.trim() || config.fields.length === 0}
                                                className="w-full"
                                                size="lg"
                                            >
                                                {isRunning ? (
                                                    <>
                                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                        Running...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Play className="w-5 h-5 mr-2" />
                                                        Start Automation
                                                    </>
                                                )}
                                            </Button>
                                        </CardContent>
                                    </Card>

                                    {/* Configuration Manager */}
                                    <Card>
                                        <CardContent className="pt-6">
                                            <ConfigurationManager
                                                currentConfig={config}
                                                onLoadConfig={handleLoadConfig}
                                            />
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>

                            <TabsContent value="fields" className="space-y-6">
                                <Card>
                                    <CardContent className="pt-6">
                                        <FormFieldEditor
                                            fields={config.fields}
                                            onFieldsChange={(fields) => setConfig((prev) => ({ ...prev, fields }))}
                                            disabled={isRunning}
                                        />
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-2">
                                        <Globe className="w-5 h-5 text-blue-600" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Current URL</p>
                                            <p className="font-medium truncate">{config.url || 'Not set'}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-green-600" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Load Delay</p>
                                            <p className="font-medium">{config.loadDelay}s</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-2">
                                        <Settings className="w-5 h-5 text-purple-600" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Form Fields</p>
                                            <p className="font-medium">{config.fields.length}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Right Side - Logs and Results */}
                    <div className="space-y-6">
                        <LogsPanel logs={logs} onClearLogs={clearLogs} />

                        <ResultPanel
                            screenshot={result.screenshot}
                            fieldsProcessed={result.fieldsProcessed}
                            totalFields={config.fields.length}
                            url={config.url}
                            loadDelay={config.loadDelay}
                            isVisible={result.isVisible}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
