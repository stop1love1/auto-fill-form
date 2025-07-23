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
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Terminal className="w-5 h-5 text-blue-600" />
                        <CardTitle className="text-lg">Execution Logs</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={handleCopyLogs} disabled={logs.length === 0}>
                            <Copy className="w-4 h-4 mr-2" />
                            {copied ? 'Copied!' : 'Copy'}
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleDownloadLogs} disabled={logs.length === 0}>
                            <Download className="w-4 h-4 mr-2" />
                            Download
                        </Button>
                        <Button variant="outline" size="sm" onClick={onClearLogs} disabled={logs.length === 0}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Clear
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                <ScrollArea className="h-96 w-full rounded-md border p-4">
                    {logs.length === 0 ? (
                        <div className="text-center text-muted-foreground py-8">
                            <Terminal className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>No logs yet</p>
                            <p className="text-sm">Start automation to see logs</p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {logs.map((log, index) => {
                                const level = getLogLevel(log);
                                const color = getLogColor(level);
                                return (
                                    <div key={index} className={`text-sm font-mono ${color} break-all`}>
                                        {log}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
