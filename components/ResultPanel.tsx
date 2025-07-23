'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Eye, ExternalLink } from 'lucide-react';
import { useState } from 'react';

interface ResultPanelProps {
    screenshot?: string;
    fieldsProcessed?: number;
    totalFields?: number;
    url?: string;
    loadDelay?: number;
    isVisible: boolean;
}

export function ResultPanel({
    screenshot,
    fieldsProcessed = 0,
    totalFields = 0,
    url,
    loadDelay,
    isVisible,
}: ResultPanelProps) {
    const [showScreenshot, setShowScreenshot] = useState(false);

    const handleDownloadScreenshot = () => {
        if (!screenshot) return;

        const link = document.createElement('a');
        link.href = `data:image/png;base64,${screenshot}`;
        link.download = `automation-result-${new Date().toISOString().split('T')[0]}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleOpenUrl = () => {
        if (url) {
            window.open(url, '_blank');
        }
    };

    if (!isVisible) return null;

    // Debug info
    console.log('ResultPanel props:', {
        screenshot: screenshot?.substring(0, 50),
        fieldsProcessed,
        totalFields,
        url,
        loadDelay,
        isVisible,
    });

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">📊 Automation Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Statistics */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{fieldsProcessed}</div>
                        <div className="text-sm text-gray-600">Fields Processed</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{totalFields}</div>
                        <div className="text-sm text-gray-600">Total Fields</div>
                    </div>
                </div>

                {/* URL Info */}
                {url && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                            <div className="text-sm font-medium text-gray-700">Target URL</div>
                            <div className="text-sm text-gray-600 truncate">{url}</div>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleOpenUrl}>
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Open
                        </Button>
                    </div>
                )}

                {/* Load Delay Info */}
                {loadDelay !== undefined && (
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                        <div>
                            <div className="text-sm font-medium text-gray-700">Load Delay</div>
                            <div className="text-sm text-gray-600">{loadDelay} seconds</div>
                        </div>
                        <Badge variant="secondary">Configured</Badge>
                    </div>
                )}

                {/* Screenshot Section */}
                {screenshot && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h4 className="font-medium">Screenshot</h4>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => setShowScreenshot(!showScreenshot)}>
                                    <Eye className="w-4 h-4 mr-2" />
                                    {showScreenshot ? 'Hide' : 'Show'}
                                </Button>
                                <Button variant="outline" size="sm" onClick={handleDownloadScreenshot}>
                                    <Download className="w-4 h-4 mr-2" />
                                    Download
                                </Button>
                            </div>
                        </div>

                        {showScreenshot && screenshot && (
                            <div className="border rounded-lg overflow-hidden">
                                <img
                                    src={`data:image/png;base64,${screenshot}`}
                                    alt="Automation Result"
                                    className="w-full h-auto max-h-96 object-contain"
                                    onError={(e) => {
                                        console.error('Failed to load screenshot');
                                        e.currentTarget.style.display = 'none';
                                    }}
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* Browser Status */}
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div>
                        <div className="text-sm font-medium text-gray-700">Browser Status</div>
                        <div className="text-sm text-gray-600">Remains open for manual inspection</div>
                    </div>
                    <Badge variant="default" className="bg-purple-600">
                        Active
                    </Badge>
                </div>
            </CardContent>
        </Card>
    );
}
