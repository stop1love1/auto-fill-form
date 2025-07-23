'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { User, Lock, Cookie, FileText, Copy, Download, Upload, Eye, EyeOff, Key, Globe } from 'lucide-react';

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

interface AuthenticationManagerProps {
    config: AuthenticationConfig;
    onConfigChange: (config: AuthenticationConfig) => void;
    disabled?: boolean;
}

export const AuthenticationManager = ({ config, onConfigChange, disabled = false }: AuthenticationManagerProps) => {
    const [showPassword, setShowPassword] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleConfigChange = (updates: Partial<AuthenticationConfig>) => {
        onConfigChange({ ...config, ...updates });
    };

    const handleCopyCookies = async () => {
        try {
            await navigator.clipboard.writeText(config.cookies || '');
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy cookies:', error);
        }
    };

    const handleExportConfig = () => {
        const dataStr = JSON.stringify(config, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'auth-config.json';
        link.click();
        URL.revokeObjectURL(url);
    };

    const handleImportConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedConfig = JSON.parse(e.target?.result as string);
                    onConfigChange(importedConfig);
                } catch (error) {
                    console.error('Failed to parse imported config:', error);
                }
            };
            reader.readAsText(file);
        }
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Key className="w-5 h-5" />
                    Authentication
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Enable/Disable Authentication */}
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <Label htmlFor="auth-enabled">Enable Authentication</Label>
                        <p className="text-sm text-gray-600">Required for websites that need login</p>
                    </div>
                    <Switch
                        id="auth-enabled"
                        checked={config.enabled}
                        onCheckedChange={(checked) => handleConfigChange({ enabled: checked })}
                        disabled={disabled}
                    />
                </div>

                {config.enabled && (
                    <Tabs defaultValue="manual" className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="manual" className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                Manual
                            </TabsTrigger>
                            <TabsTrigger value="credentials" className="flex items-center gap-1">
                                <Lock className="w-3 h-3" />
                                Credentials
                            </TabsTrigger>
                            <TabsTrigger value="cookies" className="flex items-center gap-1">
                                <Cookie className="w-3 h-3" />
                                Cookies
                            </TabsTrigger>
                            <TabsTrigger value="session" className="flex items-center gap-1">
                                <FileText className="w-3 h-3" />
                                Session
                            </TabsTrigger>
                        </TabsList>

                        {/* Manual Login */}
                        <TabsContent value="manual" className="space-y-4 pt-4">
                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="flex items-start gap-3">
                                    <Globe className="w-5 h-5 text-blue-600 mt-0.5" />
                                    <div className="space-y-2">
                                        <h4 className="font-medium text-blue-900">Manual Login</h4>
                                        <p className="text-sm text-blue-700">
                                            The browser will open and wait for you to manually log in. After logging in,
                                            the automation will continue automatically.
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="text-xs">
                                                Wait time: {config.waitAfterLogin || 10}s
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="wait-after-login">Wait after login (seconds)</Label>
                                <Input
                                    id="wait-after-login"
                                    type="number"
                                    min="5"
                                    max="60"
                                    value={config.waitAfterLogin || 10}
                                    onChange={(e) =>
                                        handleConfigChange({
                                            waitAfterLogin: parseInt(e.target.value) || 10,
                                        })
                                    }
                                    disabled={disabled}
                                    placeholder="10"
                                />
                            </div>
                        </TabsContent>

                        {/* Credentials Login */}
                        <TabsContent value="credentials" className="space-y-4 pt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="username">Username</Label>
                                    <Input
                                        id="username"
                                        type="text"
                                        value={config.credentials?.username || ''}
                                        onChange={(e) =>
                                            handleConfigChange({
                                                credentials: {
                                                    ...config.credentials,
                                                    username: e.target.value,
                                                },
                                            })
                                        }
                                        disabled={disabled}
                                        placeholder="your_username"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={config.credentials?.password || ''}
                                            onChange={(e) =>
                                                handleConfigChange({
                                                    credentials: {
                                                        ...config.credentials,
                                                        password: e.target.value,
                                                    },
                                                })
                                            }
                                            disabled={disabled}
                                            placeholder="your_password"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-0 top-0 h-full px-3"
                                            onClick={() => setShowPassword(!showPassword)}
                                            disabled={disabled}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="w-4 h-4" />
                                            ) : (
                                                <Eye className="w-4 h-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="font-medium text-sm">Selectors (Optional)</h4>
                                <div className="grid grid-cols-1 gap-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="username-selector">Username Field Selector</Label>
                                        <Input
                                            id="username-selector"
                                            type="text"
                                            value={config.credentials?.usernameSelector || ''}
                                            onChange={(e) =>
                                                handleConfigChange({
                                                    credentials: {
                                                        ...config.credentials,
                                                        usernameSelector: e.target.value,
                                                    },
                                                })
                                            }
                                            disabled={disabled}
                                            placeholder="#username, input[name='username'], etc."
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password-selector">Password Field Selector</Label>
                                        <Input
                                            id="password-selector"
                                            type="text"
                                            value={config.credentials?.passwordSelector || ''}
                                            onChange={(e) =>
                                                handleConfigChange({
                                                    credentials: {
                                                        ...config.credentials,
                                                        passwordSelector: e.target.value,
                                                    },
                                                })
                                            }
                                            disabled={disabled}
                                            placeholder="#password, input[name='password'], etc."
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="submit-selector">Submit Button Selector</Label>
                                        <Input
                                            id="submit-selector"
                                            type="text"
                                            value={config.credentials?.submitSelector || ''}
                                            onChange={(e) =>
                                                handleConfigChange({
                                                    credentials: {
                                                        ...config.credentials,
                                                        submitSelector: e.target.value,
                                                    },
                                                })
                                            }
                                            disabled={disabled}
                                            placeholder="button[type='submit'], input[type='submit'], etc."
                                        />
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Cookies */}
                        <TabsContent value="cookies" className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="cookies">Cookies (JSON format)</Label>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={handleCopyCookies}
                                            disabled={disabled}
                                        >
                                            <Copy className="w-3 h-3 mr-1" />
                                            {copied ? 'Copied!' : 'Copy'}
                                        </Button>
                                    </div>
                                </div>
                                <Textarea
                                    id="cookies"
                                    value={config.cookies || ''}
                                    onChange={(e) => handleConfigChange({ cookies: e.target.value })}
                                    disabled={disabled}
                                    placeholder='[{"name": "sessionId", "value": "abc123", "domain": ".example.com"}]'
                                    rows={6}
                                    className="font-mono text-sm"
                                />
                                <p className="text-xs text-gray-600">
                                    Paste cookies in JSON format. You can export cookies from your browser's developer
                                    tools.
                                </p>
                            </div>
                        </TabsContent>

                        {/* Session Data */}
                        <TabsContent value="session" className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label htmlFor="session-data">Session Data (JSON format)</Label>
                                <Textarea
                                    id="session-data"
                                    value={config.sessionData || ''}
                                    onChange={(e) => handleConfigChange({ sessionData: e.target.value })}
                                    disabled={disabled}
                                    placeholder='{"localStorage": {...}, "sessionStorage": {...}}'
                                    rows={6}
                                    className="font-mono text-sm"
                                />
                                <p className="text-xs text-gray-600">
                                    Paste session storage and local storage data in JSON format.
                                </p>
                            </div>
                        </TabsContent>
                    </Tabs>
                )}

                {/* Import/Export */}
                {config.enabled && (
                    <div className="flex items-center gap-2 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleExportConfig}
                            disabled={disabled}
                        >
                            <Download className="w-3 h-3 mr-1" />
                            Export Config
                        </Button>

                        <div className="relative">
                            <input
                                type="file"
                                accept=".json"
                                onChange={handleImportConfig}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                disabled={disabled}
                            />
                            <Button type="button" variant="outline" size="sm" disabled={disabled}>
                                <Upload className="w-3 h-3 mr-1" />
                                Import Config
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
