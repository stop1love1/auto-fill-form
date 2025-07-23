'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, Terminal, Copy, Download } from 'lucide-react';
import { useState } from 'react';

interface LogsPanelProps {
    logs: string[];
    onClearLogs: () => void;
}

export function LogsPanel({ logs, onClearLogs }: LogsPanelProps) {
    const [copied, setCopied] = useState(false);

    const handleCopyLogs = async () => {
        try {
            await navigator.clipboard.writeText(logs.join('\n'));
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy logs:', error);
        }
    };

    const handleDownloadLogs = () => {
        const logText = logs.join('\n');
        const blob = new Blob([logText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `automation-logs-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const getLogLevel = (log: string) => {
        if (log.toLowerCase().includes('error')) return 'error';
        if (log.toLowerCase().includes('success')) return 'success';
        if (log.toLowerCase().includes('warning')) return 'warning';
        return 'info';
    };

    const getLogColor = (level: string) => {
        switch (level) {
            case 'error':
                return 'text-red-600';
            case 'success':
                return 'text-green-600';
            case 'warning':
                return 'text-yellow-600';
            default:
                return 'text-gray-600';
        }
    };

    return (
        <Card className="h-full">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-blue-600" />
                        <CardTitle className="text-base">Logs ({logs.length})</CardTitle>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCopyLogs}
                            disabled={logs.length === 0}
                            className="h-7 px-2"
                        >
                            <Copy className="w-3 h-3 mr-1" />
                            {copied ? 'Copied!' : 'Copy'}
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleDownloadLogs}
                            disabled={logs.length === 0}
                            className="h-7 px-2"
                        >
                            <Download className="w-3 h-3 mr-1" />
                            Save
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClearLogs}
                            disabled={logs.length === 0}
                            className="h-7 px-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                            <Trash2 className="w-3 h-3" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                <ScrollArea className="h-80 w-full rounded-md border p-3">
                    {logs.length === 0 ? (
                        <div className="text-center text-muted-foreground py-6">
                            <Terminal className="w-6 h-6 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No logs yet</p>
                            <p className="text-xs">Start automation to see logs</p>
                        </div>
                    ) : (
                        <div className="space-y-0.5">
                            {logs.map((log, index) => {
                                const level = getLogLevel(log);
                                const color = getLogColor(level);
                                return (
                                    <div key={index} className={`text-xs font-mono ${color} break-all leading-relaxed`}>
                                        {log}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </ScrollArea>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-200 mt-3">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-xs text-gray-600">Logs Ready</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
