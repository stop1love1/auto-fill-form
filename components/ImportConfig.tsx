'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileText, Download, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

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

interface ImportedData {
    config: AutomationConfig;
    testValues: string[];
}

interface ImportConfigProps {
    onImport: (config: AutomationConfig, testValues?: string[]) => void;
}

export function ImportConfig({ onImport }: ImportConfigProps) {
    const [isImporting, setIsImporting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const parseConfigFile = (text: string): ImportedData => {
        const lines = text.split('\n');
        let configText = '';
        let testValues: string[] = [];
        let inConfig = true;
        let braceCount = 0;

        for (const line of lines) {
            const trimmedLine = line.trim();

            // Skip empty lines and comments
            if (!trimmedLine || trimmedLine.startsWith('#')) {
                continue;
            }

            if (inConfig) {
                configText += line + '\n';

                // Count braces to detect JSON end
                for (const char of line) {
                    if (char === '{') braceCount++;
                    if (char === '}') braceCount--;
                }

                // If we've closed all braces, we're done with JSON
                if (braceCount === 0 && configText.trim().endsWith('}')) {
                    inConfig = false;
                }
            } else {
                // Only add non-empty lines as test values
                if (trimmedLine && !trimmedLine.startsWith('#')) {
                    testValues.push(trimmedLine);
                }
            }
        }

        try {
            // Validate JSON structure first
            const trimmedConfigText = configText.trim();
            if (!trimmedConfigText.startsWith('{') || !trimmedConfigText.endsWith('}')) {
                throw new Error('Configuration must start with { and end with }');
            }

            // Parse JSON config
            const config = JSON.parse(trimmedConfigText) as AutomationConfig;

            // Validate config structure
            if (!config.url || !config.fields || !Array.isArray(config.fields)) {
                throw new Error('Invalid configuration format. Please check the JSON structure.');
            }

            // Validate fields
            for (const field of config.fields) {
                if (!field.selector || !field.type) {
                    throw new Error('Each field must have a selector and type.');
                }
            }

            return { config, testValues };
        } catch (parseError) {
            if (parseError instanceof SyntaxError) {
                throw new Error(
                    `JSON syntax error: ${parseError.message}. Please check for missing commas, brackets, or quotes.`,
                );
            }
            throw new Error(
                `JSON parsing error: ${parseError instanceof Error ? parseError.message : 'Invalid JSON format'}`,
            );
        }
    };

    const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        setError(null);
        setSuccess(null);

        try {
            const text = await file.text();
            const { config, testValues } = parseConfigFile(text);

            onImport(config, testValues);
            setSuccess(
                `Configuration "${config.name || 'Unnamed'}" imported successfully! ` +
                    `${testValues.length > 0 ? `(${testValues.length} test values)` : ''}`,
            );

            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to import configuration');
        } finally {
            setIsImporting(false);
        }
    };

    const handleSampleDownload = () => {
        const sampleConfig = {
            name: 'Sample Configuration with Authentication',
            description: 'Example configuration for form automation with login',
            url: 'https://example.com/login',
            loadDelay: 3,
            authentication: {
                enabled: true,
                method: 'credentials' as const,
                credentials: {
                    username: 'your_username',
                    password: 'your_password',
                    usernameSelector: 'input[name="username"]',
                    passwordSelector: 'input[name="password"]',
                    submitSelector: 'button[type="submit"]',
                },
                waitAfterLogin: 5,
            },
            fields: [
                {
                    id: 'username',
                    selector: 'input[name="username"]',
                    value: '{username}',
                    type: 'input' as const,
                },
                {
                    id: 'password',
                    selector: 'input[name="password"]',
                    value: '{password}',
                    type: 'input' as const,
                },
                {
                    id: 'submit',
                    selector: 'button[type="submit"]',
                    value: '',
                    type: 'submit' as const,
                },
            ],
        };

        const blob = new Blob([JSON.stringify(sampleConfig, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sample-config.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Upload className="w-5 h-5" />
                    Import Configuration
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {success && (
                    <Alert>
                        <FileText className="h-4 w-4" />
                        <AlertDescription>{success}</AlertDescription>
                    </Alert>
                )}

                <div className="space-y-4">
                    <div>
                        <Label htmlFor="config-file">Select JSON Configuration File</Label>
                        <Input
                            id="config-file"
                            type="file"
                            accept=".json,.txt"
                            onChange={handleFileImport}
                            ref={fileInputRef}
                            disabled={isImporting}
                        />
                    </div>

                    <div className="flex gap-2">
                        <Button onClick={handleSampleDownload} variant="outline" size="sm" className="flex-1">
                            <Download className="w-4 h-4 mr-2" />
                            Download Sample
                        </Button>

                        <Button
                            onClick={() => window.open('/sample-config.txt', '_blank')}
                            variant="outline"
                            size="sm"
                            className="flex-1"
                        >
                            <FileText className="w-4 h-4 mr-2" />
                            View Sample
                        </Button>
                    </div>
                </div>

                <div className="text-xs text-muted-foreground space-y-1">
                    <p>
                        <strong>Supported formats:</strong>
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>
                            <strong>JSON:</strong> Pure configuration file
                        </li>
                        <li>
                            <strong>TXT:</strong> Config + test values (CSV format)
                        </li>
                        <li>Use placeholders like {'{username}'} in field values</li>
                        <li>Test values: one per line, comma-separated</li>
                        <li>Comments start with #</li>
                        <li>JSON must be complete and valid</li>
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
}
