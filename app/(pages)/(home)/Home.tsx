'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Play, Loader2, Globe, Clock, Settings, FileText, Activity, Search } from 'lucide-react';
import { ConfigurationManager } from '@/components/ConfigurationManager';
import { FormFieldEditor } from '@/components/FormFieldEditor';
import { LogsPanel } from '@/components/LogsPanel';
import { ResultPanel } from '@/components/ResultPanel';
import { ImportConfig } from '@/components/ImportConfig';
import { TestValuesManager } from '@/components/TestValuesManager';
import { AuthenticationManager } from '@/components/AuthenticationManager';
import { useLocalStorage } from '@/hooks/use-local-storage';

interface FormField {
    id: string;
    selector: string;
    value: string;
    type: 'input' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'submit';
}

interface AuthenticationConfig {
    enabled: boolean;
    method: 'manual' | 'credentials' | 'cookies' | 'session';
    credentials?: {
        username?: string;
        password?: string;
        usernameSelector?: string;
        passwordSelector?: string;
        submitSelector?: string;
    };
    cookies?: string;
    sessionData?: string;
    waitAfterLogin?: number;
}

interface AutomationConfig {
    name?: string;
    description?: string;
    url: string;
    loadDelay: number;
    fields: FormField[];
    authentication?: AuthenticationConfig;
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
    const [isClient, setIsClient] = useState(false);
    const [isDetecting, setIsDetecting] = useState(false);

    // Prevent hydration mismatch
    useEffect(() => {
        setIsClient(true);
    }, []);

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

    const handleImportConfig = useCallback(
        (importedConfig: AutomationConfig, testValues?: string[]) => {
            setConfig(importedConfig);
            addLog(`Configuration imported: ${importedConfig.name || importedConfig.url}`);

            if (testValues && testValues.length > 0) {
                addLog(`📋 Test values loaded: ${testValues.length} entries`);
                // Store test values for future use
                localStorage.setItem('test-values', JSON.stringify(testValues));
            }
        },
        [setConfig, addLog],
    );

    const handleDetectFields = useCallback(async () => {
        if (!config.url.trim()) {
            addLog('Error: Please enter a valid URL first');
            return;
        }

        setIsDetecting(true);
        addLog('🔍 Detecting form fields...');

        try {
            const response = await fetch('/api/detect-form-fields', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: config.url }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success && result.fields.length > 0) {
                // Update config with detected fields
                setConfig((prev) => ({
                    ...prev,
                    fields: result.fields,
                }));

                addLog(`✅ Detected ${result.fields.length} form fields`);
                result.fields.forEach((field: any) => {
                    const fieldInfo = field.label || field.name || field.selector;
                    addLog(`📝 Found: ${field.type} - ${fieldInfo}`);
                });
            } else {
                addLog('⚠️ No form fields detected on this page');
            }
        } catch (error) {
            addLog(`❌ Error detecting fields: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsDetecting(false);
        }
    }, [config.url, addLog, setConfig]);

    const handleStartAutomation = useCallback(
        async (testValue?: string) => {
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

            // Create config with test values if provided
            let automationConfig = { ...config };

            if (testValue) {
                addLog(`🧪 Using test value: ${testValue}`);
                const values = testValue.split(',');

                // Replace placeholders in fields
                automationConfig.fields = config.fields.map((field, index) => ({
                    ...field,
                    value: field.value
                        .replace('{username}', values[0] || '')
                        .replace('{password}', values[1] || '')
                        .replace('{email}', values[0] || '')
                        .replace('{value}', values[index] || ''),
                }));
            }

            try {
                addLog(`Sending request to automate form...`);
                const response = await fetch('/api/automate-form', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(automationConfig),
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
                automationConfig.fields.forEach((field) => {
                    addLog(`✓ Filled: ${field.selector} = "${field.value}"`);
                });
            } catch (error) {
                addLog(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
            } finally {
                setIsRunning(false);
            }
        },
        [config, addLog],
    );

    // Don't render until client-side hydration is complete
    if (!isClient) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
            <div className="max-w-7xl mx-auto">
                {/* Simplified Header */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-600 rounded-lg">
                                <Globe className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Auto Form Filler</h1>
                                <p className="text-sm text-gray-600">Automate form filling with Puppeteer</p>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="flex items-center gap-3">
                            <Badge variant="outline" className="flex items-center gap-1">
                                <Globe className="w-3 h-3" />
                                {config.url ? 'URL Set' : 'No URL'}
                            </Badge>
                            <Badge variant="outline" className="flex items-center gap-1">
                                <FileText className="w-3 h-3" />
                                {config.fields.length} Fields
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Main Content - 2 Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Left Column - Configuration & Fields (3/5 width) */}
                    <div className="lg:col-span-3 space-y-4">
                        {/* Configuration Section */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Settings className="w-5 h-5" />
                                    Configuration
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Accordion type="single" collapsible defaultValue="basic" className="w-full">
                                    <AccordionItem value="basic">
                                        <AccordionTrigger className="text-sm">Basic Settings</AccordionTrigger>
                                        <AccordionContent className="space-y-4 pt-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="url">Website URL</Label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        id="url"
                                                        type="url"
                                                        value={config.url}
                                                        onChange={(e) =>
                                                            setConfig((prev) => ({ ...prev, url: e.target.value }))
                                                        }
                                                        placeholder="https://example.com/form"
                                                        disabled={isRunning || isDetecting}
                                                        className="flex-1"
                                                    />
                                                    <Button
                                                        onClick={handleDetectFields}
                                                        disabled={isRunning || isDetecting || !config.url.trim()}
                                                        variant="outline"
                                                        size="sm"
                                                        className="px-3"
                                                    >
                                                        {isDetecting ? (
                                                            <>
                                                                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                                                Detecting...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Search className="w-4 h-4 mr-1" />
                                                                Detect
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>

                                            <Button
                                                onClick={() => handleStartAutomation()}
                                                disabled={isRunning || !config.url.trim() || config.fields.length === 0}
                                                className="w-full"
                                                size="lg"
                                            >
                                                {isRunning ? (
                                                    <>
                                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                        Running Automation...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Play className="w-5 h-5 mr-2" />
                                                        Start Automation
                                                    </>
                                                )}
                                            </Button>
                                        </AccordionContent>
                                    </AccordionItem>

                                    <AccordionItem value="config-manager">
                                        <AccordionTrigger className="text-sm">Configuration Manager</AccordionTrigger>
                                        <AccordionContent className="pt-2">
                                            <ConfigurationManager
                                                currentConfig={config}
                                                onLoadConfig={handleLoadConfig}
                                            />
                                        </AccordionContent>
                                    </AccordionItem>

                                    <AccordionItem value="import">
                                        <AccordionTrigger className="text-sm">Import Configuration</AccordionTrigger>
                                        <AccordionContent className="pt-2">
                                            <ImportConfig onImport={handleImportConfig} />
                                        </AccordionContent>
                                    </AccordionItem>

                                    <AccordionItem value="authentication">
                                        <AccordionTrigger className="text-sm">Authentication</AccordionTrigger>
                                        <AccordionContent className="pt-2">
                                            <AuthenticationManager
                                                config={config.authentication || { enabled: false, method: 'manual' }}
                                                onConfigChange={(authConfig) =>
                                                    setConfig((prev) => ({
                                                        ...prev,
                                                        authentication: authConfig,
                                                    }))
                                                }
                                                disabled={isRunning}
                                            />
                                        </AccordionContent>
                                    </AccordionItem>

                                    <AccordionItem value="test-values">
                                        <AccordionTrigger className="text-sm">Test Values</AccordionTrigger>
                                        <AccordionContent className="pt-2">
                                            <TestValuesManager
                                                onRunTest={handleStartAutomation}
                                                isRunning={isRunning}
                                            />
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            </CardContent>
                        </Card>

                        {/* Form Fields Section */}
                        <Card>
                            <CardContent className="pt-4">
                                <FormFieldEditor
                                    fields={config.fields}
                                    onFieldsChange={(fields) => setConfig((prev) => ({ ...prev, fields }))}
                                    disabled={isRunning}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Logs & Results (2/5 width) */}
                    <div className="lg:col-span-2 space-y-4">
                        <Card className="h-full">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Activity className="w-5 h-5" />
                                    Activity & Results
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="h-full">
                                <Tabs defaultValue="logs" className="h-full">
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="logs">Logs</TabsTrigger>
                                        <TabsTrigger value="results">Results</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="logs" className="h-full mt-4">
                                        <LogsPanel logs={logs} onClearLogs={clearLogs} />
                                    </TabsContent>

                                    <TabsContent value="results" className="h-full mt-4">
                                        <ResultPanel
                                            screenshot={result.screenshot}
                                            fieldsProcessed={result.fieldsProcessed}
                                            totalFields={config.fields.length}
                                            url={config.url}
                                            isVisible={result.isVisible}
                                        />
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
